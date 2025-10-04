import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import { registerRoutes } from "./routes";
import { serveStatic, log } from "./vite";
import { runSeedData } from "./seedData.js";

const app = express();

// Trust proxy for Render deployment
if (process.env.NODE_ENV === "production") {
    app.set('trust proxy', 1);
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration
const sessionStore = MemoryStore(session);
app.use(
    session({
        secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
        resave: false,
        saveUninitialized: false,
        store: new sessionStore({
            checkPeriod: 86400000, // prune expired entries every 24h
        }),
        cookie: {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours (longer for better UX)
            sameSite: "lax",
        },
        name: "expatEatsSession",
    })
);

app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
            let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
            if (capturedJsonResponse) {
                logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
            }

            if (logLine.length > 80) {
                logLine = logLine.slice(0, 79) + "…";
            }

            log(logLine);
        }
    });

    next();
});

(async () => {
    // Run seed data import on startup if SEED_DATA is true
    if (process.env.SEED_DATA === "true") {
        const env = process.env.NODE_ENV || "development";
        log(`🌱 Running seed data import (${env} mode)...`);
        try {
            const result = await runSeedData();
            if (result?.success) {
                log("✅ Seed data import completed successfully");
            }
        } catch (error) {
            log("💥 Seed data import failed:", error.message);
        }
    } else {
        log(`📦 ${process.env.NODE_ENV || "development"} mode - SEED_DATA not enabled`);
    }

    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";

        res.status(status).json({ message });
        throw err;
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (process.env.NODE_ENV === "development") {
        const { setupVite } = await import("./vite");
        await setupVite(app, server);
    } else {
        serveStatic(app);
    }

    // Serve the app on the configured port (default 10000 for Render)
    // this serves both the API and the client.
    const port = parseInt(process.env.PORT || "10000", 10);
    server.listen(
        {
            port,
            host: "0.0.0.0",
            reusePort: true,
        },
        () => {
            log(`serving on port ${port}`);
        },
    );
})();

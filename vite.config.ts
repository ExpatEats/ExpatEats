import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(async () => {
  const plugins = [react()];

  // Only add Replit plugins in development or Replit environment
  if (process.env.NODE_ENV !== "production" || process.env.REPL_ID !== undefined) {
    try {
      const runtimeErrorOverlay = (await import("@replit/vite-plugin-runtime-error-modal")).default;
      plugins.push(runtimeErrorOverlay());

      if (process.env.REPL_ID !== undefined) {
        const cartographer = await import("@replit/vite-plugin-cartographer").then((m) => m.cartographer());
        plugins.push(cartographer);
      }
    } catch (error) {
      // Replit plugins not available, continue without them
      console.warn("Replit plugins not available, continuing without them");
    }
  }

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "attached_assets"),
      },
    },
    root: path.resolve(__dirname, "client"),
    build: {
      outDir: path.resolve(__dirname, "dist/public"),
      emptyOutDir: true,
    },
  };
});

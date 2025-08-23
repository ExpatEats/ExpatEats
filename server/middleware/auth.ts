import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/session";

export const requireAuth = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    if (!req.session?.userId) {
        return res.status(401).json({ 
            message: "Authentication required",
            code: "AUTH_REQUIRED" 
        });
    }
    
    // Update last activity
    req.session.lastActivity = new Date();
    next();
};

export const requireAdmin = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    if (!req.session?.userId) {
        return res.status(401).json({ 
            message: "Authentication required",
            code: "AUTH_REQUIRED" 
        });
    }
    
    if (!req.session?.isAdmin) {
        return res.status(403).json({ 
            message: "Admin access required",
            code: "ADMIN_REQUIRED" 
        });
    }
    
    // Update last activity
    req.session.lastActivity = new Date();
    next();
};

export const optionalAuth = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    // This middleware makes user info available if logged in
    // but doesn't require authentication
    if (req.session?.userId) {
        req.session.lastActivity = new Date();
    }
    next();
};
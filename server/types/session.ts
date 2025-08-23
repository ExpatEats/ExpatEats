import "express-session";

declare module "express-session" {
    interface SessionData {
        userId?: number;
        username?: string;
        isAdmin?: boolean;
        lastActivity?: Date;
    }
}

export interface AuthenticatedRequest extends Express.Request {
    session: {
        userId?: number;
        username?: string;
        isAdmin?: boolean;
        lastActivity?: Date;
    } & Express.Session;
}
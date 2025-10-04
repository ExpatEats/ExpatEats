import "express-session";

declare module "express-session" {
    interface SessionData {
        userId?: number;
        username?: string;
        isAdmin?: boolean;
        lastActivity?: Date;
        csrfSecret?: string;
    }
}

import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
    session: {
        userId?: number;
        username?: string;
        isAdmin?: boolean;
        lastActivity?: Date;
        csrfSecret?: string;
    } & import('express-session').Session;
}
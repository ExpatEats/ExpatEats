import csrf from 'csrf';
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/session';

export class CsrfService {
    private static csrfTokens = new csrf();

    /**
     * Generate a new CSRF token for the session
     */
    static generateToken(req: Request): string {
        const session = req.session as AuthenticatedRequest["session"];
        
        if (!session.csrfSecret) {
            session.csrfSecret = this.csrfTokens.secretSync();
        }
        
        return this.csrfTokens.create(session.csrfSecret);
    }

    /**
     * Validate a CSRF token against the session
     */
    static validateToken(req: Request, token: string): boolean {
        const session = req.session as AuthenticatedRequest["session"];
        
        if (!session.csrfSecret || !token) {
            return false;
        }
        
        return this.csrfTokens.verify(session.csrfSecret, token);
    }

    /**
     * Middleware to validate CSRF tokens on state-changing requests
     */
    static middleware() {
        return (req: Request, res: Response, next: NextFunction) => {
            // Skip CSRF for GET, HEAD, OPTIONS requests
            if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
                return next();
            }

            const token = req.headers['x-csrf-token'] as string || req.body._csrf;

            if (!CsrfService.validateToken(req, token)) {
                // Add debugging in production
                if (process.env.NODE_ENV === "production") {
                    console.error("CSRF validation failed:", {
                        hasSession: !!req.session,
                        hasSecret: !!(req.session as any)?.csrfSecret,
                        tokenProvided: !!token,
                        sessionId: (req.session as any)?.id,
                        userAgent: req.headers['user-agent']
                    });
                }

                return res.status(403).json({
                    message: "Security token has expired. Please refresh the page and try again.",
                    code: "CSRF_ERROR"
                });
            }
            
            next();
        };
    }
}
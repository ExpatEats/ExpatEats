import rateLimit from 'express-rate-limit';

export class RateLimitService {
    /**
     * Rate limiter for authentication endpoints
     * Allows 5 attempts per 15 minutes per IP
     */
    static authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // limit each IP to 5 requests per windowMs
        message: {
            message: "Too many authentication attempts, please try again in 15 minutes",
            code: "RATE_LIMIT_EXCEEDED"
        },
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        skip: (req) => {
            // Skip rate limiting for GET requests (like CSRF token)
            return req.method === 'GET';
        }
    });

    /**
     * Stricter rate limiter for login attempts
     * Allows 3 attempts per 15 minutes per IP
     */
    static loginLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 3, // limit each IP to 3 requests per windowMs  
        message: {
            message: "Too many login attempts, please try again in 15 minutes",
            code: "LOGIN_RATE_LIMIT_EXCEEDED"
        },
        standardHeaders: true,
        legacyHeaders: false,
    });

    /**
     * General API rate limiter
     * Allows 100 requests per 15 minutes per IP
     */
    static generalLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: {
            message: "Too many requests, please try again later",
            code: "GENERAL_RATE_LIMIT_EXCEEDED"
        },
        standardHeaders: true,
        legacyHeaders: false,
    });
}
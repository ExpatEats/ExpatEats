import crypto from "crypto";

const SECRET_KEY = process.env.SESSION_SECRET || "dev-secret-change-in-production";

export interface SignedUrlParams {
    guideId: number;
    userId: number;
    expiresIn?: number; // seconds, default 900 (15 minutes)
}

export interface SignedUrlResult {
    token: string;
    expires: number; // Unix timestamp
    signature: string;
}

/**
 * Generate a signed URL token for PDF access
 */
export function generateSignedUrl(params: SignedUrlParams): SignedUrlResult {
    const { guideId, userId, expiresIn = 900 } = params;
    const expires = Math.floor(Date.now() / 1000) + expiresIn;

    // Create a token with guideId, userId, and expiration
    const token = Buffer.from(JSON.stringify({
        guideId,
        userId,
        expires
    })).toString('base64');

    // Create signature using HMAC
    const signature = crypto
        .createHmac('sha256', SECRET_KEY)
        .update(`${guideId}:${userId}:${expires}`)
        .digest('hex');

    return {
        token,
        expires,
        signature
    };
}

/**
 * Verify a signed URL token
 */
export function verifySignedUrl(token: string, signature: string): {
    valid: boolean;
    guideId?: number;
    userId?: number;
    error?: string;
} {
    try {
        // Decode token
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
        const { guideId, userId, expires } = decoded;

        // Check expiration
        const now = Math.floor(Date.now() / 1000);
        if (now > expires) {
            return { valid: false, error: 'Token expired' };
        }

        // Verify signature
        const expectedSignature = crypto
            .createHmac('sha256', SECRET_KEY)
            .update(`${guideId}:${userId}:${expires}`)
            .digest('hex');

        if (signature !== expectedSignature) {
            return { valid: false, error: 'Invalid signature' };
        }

        return {
            valid: true,
            guideId,
            userId
        };
    } catch (error) {
        return { valid: false, error: 'Invalid token format' };
    }
}

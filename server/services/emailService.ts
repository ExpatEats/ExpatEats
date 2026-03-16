import sgMail from "@sendgrid/mail";
import { db } from "../db";
import { emailLogs } from "@shared/schema";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@expateatsguide.com";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5000";

// Initialize SendGrid
if (SENDGRID_API_KEY) {
    sgMail.setApiKey(SENDGRID_API_KEY);
} else {
    console.warn("⚠️  SENDGRID_API_KEY not set - email functionality will be disabled");
}

export class EmailService {
    /**
     * Send password reset email
     */
    static async sendPasswordResetEmail(
        toEmail: string,
        toName: string | null,
        resetToken: string
    ): Promise<{ success: boolean; error?: string }> {
        try {
            if (!SENDGRID_API_KEY) {
                console.error("SendGrid API key not configured");
                return { success: false, error: "Email service not configured" };
            }

            const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
            const recipientName = toName || "there";

            const msg = {
                to: toEmail,
                from: FROM_EMAIL,
                subject: "Reset Your ExpatEats Password",
                text: `
Hello ${recipientName},

You recently requested to reset your password for your ExpatEats account. Click the link below to reset it:

${resetLink}

This link will expire in 1 hour for security reasons.

If you did not request a password reset, please ignore this email or contact support if you have concerns.

Best regards,
The ExpatEats Team
                `.trim(),
                html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f7f4ef; padding: 30px; border-radius: 10px;">
        <h1 style="color: #E07A5F; margin-top: 0;">Reset Your Password</h1>

        <p>Hello ${recipientName},</p>

        <p>You recently requested to reset your password for your ExpatEats account. Click the button below to reset it:</p>

        <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}"
               style="background-color: #E07A5F; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Reset Password
            </a>
        </div>

        <p style="color: #666; font-size: 14px;">
            Or copy and paste this link into your browser:<br>
            <a href="${resetLink}" style="color: #E07A5F; word-break: break-all;">${resetLink}</a>
        </p>

        <p style="color: #999; font-size: 13px; border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
            <strong>This link will expire in 1 hour</strong> for security reasons.<br><br>
            If you did not request a password reset, please ignore this email or contact support if you have concerns.
        </p>

        <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>The ExpatEats Team</strong>
        </p>
    </div>
</body>
</html>
                `.trim(),
            };

            const response = await sgMail.send(msg);

            // Log successful email send
            await db.insert(emailLogs).values({
                toEmail,
                fromEmail: FROM_EMAIL,
                subject: "Reset Your ExpatEats Password",
                emailType: "password-reset",
                status: "sent",
                messageId: response[0]?.headers?.["x-message-id"] || null,
            });

            console.log(`✅ Password reset email sent to ${toEmail}`);
            return { success: true };
        } catch (error: any) {
            console.error("Failed to send password reset email:", error);

            // Log failed email send
            await db.insert(emailLogs).values({
                toEmail,
                fromEmail: FROM_EMAIL,
                subject: "Reset Your ExpatEats Password",
                emailType: "password-reset",
                status: "failed",
                errorMessage: error.message || "Unknown error",
            });

            return {
                success: false,
                error: error.message || "Failed to send email",
            };
        }
    }

    /**
     * Send welcome email (for future use)
     */
    static async sendWelcomeEmail(
        toEmail: string,
        toName: string
    ): Promise<{ success: boolean; error?: string }> {
        try {
            if (!SENDGRID_API_KEY) {
                console.error("SendGrid API key not configured");
                return { success: false, error: "Email service not configured" };
            }

            const msg = {
                to: toEmail,
                from: FROM_EMAIL,
                subject: "Welcome to ExpatEats!",
                text: `
Hello ${toName},

Welcome to ExpatEats! We're excited to have you join our community.

Discover the best grocery stores, markets, and restaurants in Portugal. Save your favorite locations and connect with other expats.

Get started by exploring our guides and adding your favorite places!

Best regards,
The ExpatEats Team
                `.trim(),
                html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f7f4ef; padding: 30px; border-radius: 10px;">
        <h1 style="color: #E07A5F; margin-top: 0;">Welcome to ExpatEats!</h1>

        <p>Hello ${toName},</p>

        <p>Welcome to ExpatEats! We're excited to have you join our community.</p>

        <p>Discover the best grocery stores, markets, and restaurants in Portugal. Save your favorite locations and connect with other expats.</p>

        <div style="text-align: center; margin: 30px 0;">
            <a href="${FRONTEND_URL}"
               style="background-color: #E07A5F; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Start Exploring
            </a>
        </div>

        <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>The ExpatEats Team</strong>
        </p>
    </div>
</body>
</html>
                `.trim(),
            };

            const response = await sgMail.send(msg);

            // Log successful email send
            await db.insert(emailLogs).values({
                toEmail,
                fromEmail: FROM_EMAIL,
                subject: "Welcome to ExpatEats!",
                emailType: "welcome",
                status: "sent",
                messageId: response[0]?.headers?.["x-message-id"] || null,
            });

            console.log(`✅ Welcome email sent to ${toEmail}`);
            return { success: true };
        } catch (error: any) {
            console.error("Failed to send welcome email:", error);

            // Log failed email send
            await db.insert(emailLogs).values({
                toEmail,
                fromEmail: FROM_EMAIL,
                subject: "Welcome to ExpatEats!",
                emailType: "welcome",
                status: "failed",
                errorMessage: error.message || "Unknown error",
            });

            return {
                success: false,
                error: error.message || "Failed to send email",
            };
        }
    }
}

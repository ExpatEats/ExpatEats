import bcrypt from "bcrypt";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq, and, lt } from "drizzle-orm";

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || "12");
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_TIME = 30 * 60 * 1000; // 30 minutes

export class AuthService {
    static async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, BCRYPT_ROUNDS);
    }

    static async verifyPassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    static async createUser(userData: {
        username: string;
        email: string;
        password: string;
        name?: string;
        city?: string;
        country?: string;
        bio?: string;
        role?: string;
    }) {
        const hashedPassword = await this.hashPassword(userData.password);
        
        const [newUser] = await db.insert(users).values({
            ...userData,
            password: hashedPassword,
            role: userData.role || "user",
        }).returning();

        // Remove password from returned user
        const { password, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }

    static async authenticateUser(username: string, password: string) {
        // Find user by username or email
        const [user] = await db
            .select()
            .from(users)
            .where(
                eq(users.username, username)
            );

        if (!user) {
            // Check if it's an email instead
            const [userByEmail] = await db
                .select()
                .from(users)
                .where(eq(users.email, username));
            
            if (!userByEmail) {
                return { success: false, message: "Invalid credentials" };
            }
            
            return this.validateUserLogin(userByEmail, password);
        }

        return this.validateUserLogin(user, password);
    }

    private static async validateUserLogin(user: any, password: string) {
        // Check if account is locked
        if (user.accountLockedUntil && new Date() < user.accountLockedUntil) {
            const remainingTime = Math.ceil((user.accountLockedUntil.getTime() - Date.now()) / 60000);
            return { 
                success: false, 
                message: `Account locked. Try again in ${remainingTime} minutes.`,
                locked: true 
            };
        }

        // Verify password
        const isValidPassword = await this.verifyPassword(password, user.password);

        if (!isValidPassword) {
            // Increment failed attempts
            const newFailedAttempts = (user.failedLoginAttempts || 0) + 1;
            let accountLockedUntil = null;

            if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
                accountLockedUntil = new Date(Date.now() + LOCKOUT_TIME);
            }

            await db
                .update(users)
                .set({
                    failedLoginAttempts: newFailedAttempts,
                    accountLockedUntil,
                    updatedAt: new Date(),
                })
                .where(eq(users.id, user.id));

            return { 
                success: false, 
                message: "Invalid credentials",
                attemptsRemaining: MAX_FAILED_ATTEMPTS - newFailedAttempts 
            };
        }

        // Successful login - reset failed attempts and update last login
        await db
            .update(users)
            .set({
                failedLoginAttempts: 0,
                accountLockedUntil: null,
                lastLoginAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(users.id, user.id));

        // Remove sensitive data
        const { password: _, ...userWithoutPassword } = user;
        
        return { 
            success: true, 
            user: userWithoutPassword,
            message: "Login successful" 
        };
    }

    static async getUserById(id: number) {
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, id));

        if (!user) {
            return null;
        }

        // Remove password from returned user
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    static async getUserByUsername(username: string) {
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.username, username));

        if (!user) {
            return null;
        }

        // Remove password from returned user
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    static async getUserByEmail(email: string) {
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email));

        if (!user) {
            return null;
        }

        // Remove password from returned user
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    // =========================================================================
    // GOOGLE OAUTH METHODS
    // =========================================================================

    /**
     * Find user by Google OAuth ID
     */
    static async getUserByGoogleId(googleId: string) {
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.googleId, googleId));

        if (!user) {
            return null;
        }

        // Remove password from returned user
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    /**
     * Create a new user from Google OAuth profile
     */
    static async createGoogleUser(userData: {
        googleId: string;
        email: string;
        name?: string;
        profilePicture?: string;
        googleEmail?: string;
    }) {
        const [newUser] = await db.insert(users).values({
            googleId: userData.googleId,
            email: userData.email,
            googleEmail: userData.googleEmail || userData.email,
            name: userData.name,
            profilePicture: userData.profilePicture,
            authProvider: "google",
            role: "user",
            emailVerified: true, // Google verifies emails
            username: null, // OAuth users don't need username
            password: null, // OAuth users don't need password
        }).returning();

        // Remove password from returned user
        const { password, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }

    /**
     * Link Google account to existing user
     */
    static async linkGoogleAccount(
        userId: number,
        googleData: {
            googleId: string;
            googleEmail: string;
            profilePicture?: string;
        }
    ) {
        const [updatedUser] = await db
            .update(users)
            .set({
                googleId: googleData.googleId,
                googleEmail: googleData.googleEmail,
                profilePicture: googleData.profilePicture || undefined,
                authProvider: "hybrid", // User has both local and Google auth
                emailVerified: true, // Google verifies emails
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId))
            .returning();

        if (!updatedUser) {
            throw new Error("Failed to link Google account");
        }

        // Remove password from returned user
        const { password, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }

    /**
     * Unlink Google account from user
     * Only allowed if user has username/password set
     */
    static async unlinkGoogleAccount(userId: number) {
        // First, get the user to check if they have a password
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, userId));

        if (!user) {
            throw new Error("User not found");
        }

        // Don't allow unlinking if user doesn't have a password (OAuth-only user)
        if (!user.password || !user.username) {
            throw new Error(
                "Cannot unlink Google account. You must set a username and password first."
            );
        }

        const [updatedUser] = await db
            .update(users)
            .set({
                googleId: null,
                googleEmail: null,
                authProvider: "local", // Back to local auth only
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId))
            .returning();

        if (!updatedUser) {
            throw new Error("Failed to unlink Google account");
        }

        // Remove password from returned user
        const { password, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }
}
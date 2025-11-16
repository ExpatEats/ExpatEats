import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { AuthService } from "../services/authService";

// Initialize Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3001/api/auth/google/callback",
                scope: ["profile", "email"],
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Extract user information from Google profile
                    const googleId = profile.id;
                    const email = profile.emails?.[0]?.value;
                    const name = profile.displayName;
                    const profilePicture = profile.photos?.[0]?.value;

                    // Validate that we have an email
                    if (!email) {
                        return done(new Error("No email provided by Google"), undefined);
                    }

                    // Try to find user by Google ID first
                    let user = await AuthService.getUserByGoogleId(googleId);

                    if (user) {
                        // User exists with this Google ID - log them in
                        console.log(`[OAuth] Existing Google user logged in: ${user.email}`);
                        return done(null, user);
                    }

                    // User not found by Google ID - check if email exists (account linking)
                    user = await AuthService.getUserByEmail(email);

                    if (user) {
                        // Email exists - link Google account to existing user
                        console.log(`[OAuth] Linking Google account to existing user: ${email}`);

                        const linkedUser = await AuthService.linkGoogleAccount(user.id, {
                            googleId,
                            googleEmail: email,
                            profilePicture,
                        });

                        return done(null, linkedUser);
                    }

                    // No existing user - create new Google user
                    console.log(`[OAuth] Creating new Google user: ${email}`);

                    const newUser = await AuthService.createGoogleUser({
                        googleId,
                        email,
                        name,
                        profilePicture,
                        googleEmail: email,
                    });

                    return done(null, newUser);
                } catch (error) {
                    console.error("[OAuth] Error in Google strategy:", error);
                    return done(error as Error, undefined);
                }
            }
        )
    );
} else {
    console.warn("[OAuth] Google OAuth credentials not configured. Skipping Google strategy setup.");
    console.warn("[OAuth] Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env to enable Google login.");
}

// Serialize user to session
passport.serializeUser((user: any, done) => {
    // Store only the user ID in the session
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: number, done) => {
    try {
        const user = await AuthService.getUserById(id);
        if (!user) {
            return done(new Error("User not found"), null);
        }
        done(null, user);
    } catch (error) {
        console.error("[OAuth] Error deserializing user:", error);
        done(error, null);
    }
});

export default passport;

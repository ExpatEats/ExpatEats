# Google OAuth 2.0 Setup Guide
## ExpatEats Application

This guide walks you through setting up Google OAuth 2.0 authentication for the ExpatEats application.

---

## Prerequisites

- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)
- Your application's domain (for production setup)

---

## Step 1: Create or Select a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Either:
   - Click **"New Project"** to create a new project
   - Select an existing project

### Creating a New Project:
- **Project Name**: `ExpatEats` (or your preferred name)
- **Organization**: Leave as default or select your organization
- **Location**: Leave as default
- Click **"CREATE"**

---

## Step 2: Enable Google+ API

1. In the Google Cloud Console, make sure your ExpatEats project is selected
2. Navigate to **"APIs & Services"** → **"Library"**
3. Search for **"Google+ API"** or **"Google People API"**
4. Click on **"Google+ API"**
5. Click **"ENABLE"**

> **Note**: If you can't find Google+ API, you can use **"Google People API"** as an alternative. Both provide the profile and email information needed.

---

## Step 3: Configure OAuth Consent Screen

Before creating credentials, you need to configure the OAuth consent screen.

1. Navigate to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **User Type**:
   - For development/testing: Select **"External"**
   - Click **"CREATE"**

### App Information:
- **App name**: `ExpatEats`
- **User support email**: Your email address
- **App logo**: (Optional) Upload your logo
- **Application home page**: `http://localhost:3001` (dev) or `https://expateatsguide.com` (production)
- **Application Privacy Policy link**: (Required for production) URL to your privacy policy
- **Application Terms of Service link**: (Optional) URL to your terms
- **Authorized domains**:
  - For production, add: `expateatsguide.com`
- **Developer contact information**: Your email address

3. Click **"SAVE AND CONTINUE"**

### Scopes:
4. Click **"ADD OR REMOVE SCOPES"**
5. Select the following scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
6. Click **"UPDATE"**
7. Click **"SAVE AND CONTINUE"**

### Test Users (for External apps in testing):
8. Click **"ADD USERS"**
9. Add email addresses of users who can test the app
10. Click **"SAVE AND CONTINUE"**

11. Review the summary and click **"BACK TO DASHBOARD"**

---

## Step 4: Create OAuth 2.0 Credentials

1. Navigate to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"OAuth 2.0 Client ID"**

### Configure OAuth Client:
4. **Application type**: Select **"Web application"**
5. **Name**: `ExpatEats Web Client`

### Authorized JavaScript origins:
6. Click **"+ ADD URI"**
7. Add the following URIs:
   - Development: `http://localhost:3001`
   - Production: `https://expateatsguide.com` (when ready)

### Authorized redirect URIs:
8. Click **"+ ADD URI"**
9. Add the following URIs:
   - Development: `http://localhost:3001/api/auth/google/callback`
   - Production: `https://expateatsguide.com/api/auth/google/callback` (when ready)

10. Click **"CREATE"**

---

## Step 5: Copy Your Credentials

After creating the credentials, a dialog will appear with your Client ID and Client Secret.

1. **Copy the Client ID**
   - It will look like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`

2. **Copy the Client Secret**
   - It will look like: `GOCSPX-abc123def456ghi789`

3. Click **"OK"**

> ⚠️ **IMPORTANT**: Store these credentials securely. The Client Secret is shown only once!

---

## Step 6: Update Your .env File

Open your `.env` file and update the following variables:

```bash
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
```

Replace:
- `your-actual-client-id` with your Client ID from Step 5
- `your-actual-client-secret` with your Client Secret from Step 5

---

## Step 7: Test OAuth Flow (Development)

1. Start your application:
   ```bash
   npm run dev
   ```

2. Navigate to your app's login page
3. Click the **"Sign in with Google"** button
4. You should be redirected to Google's sign-in page
5. Sign in with your Google account
6. Grant permissions to the app
7. You should be redirected back to your app and logged in

---

## Production Setup

When deploying to production, you'll need to:

1. **Update Authorized JavaScript Origins**:
   - Go to **"APIs & Services"** → **"Credentials"**
   - Click on your OAuth 2.0 Client ID
   - Add your production domain: `https://expateatsguide.com`

2. **Update Authorized Redirect URIs**:
   - Add: `https://expateatsguide.com/api/auth/google/callback`

3. **Update .env for Production**:
   ```bash
   GOOGLE_CALLBACK_URL=https://expateatsguide.com/api/auth/google/callback
   ```

4. **Verify OAuth Consent Screen**:
   - Ensure privacy policy and terms of service URLs are correct
   - Consider submitting for verification if you want to remove the "unverified app" warning

5. **HTTPS Requirement**:
   - ⚠️ Google OAuth requires HTTPS in production
   - Localhost is exempt for development

---

## Troubleshooting

### Error: "redirect_uri_mismatch"
- **Cause**: The redirect URI doesn't match what's configured in Google Cloud Console
- **Solution**:
  1. Check that the callback URL in your `.env` file matches exactly what's in Google Cloud Console
  2. Make sure there are no trailing slashes
  3. Verify the protocol (http vs https)

### Error: "Access blocked: This app's request is invalid"
- **Cause**: OAuth consent screen not properly configured
- **Solution**: Complete all required fields in the OAuth consent screen

### Error: "Permission denied to generate login hint for target domain"
- **Cause**: Domain restrictions or consent screen issues
- **Solution**: Review authorized domains in OAuth consent screen

### Users See "This app isn't verified"
- **Cause**: Your app hasn't been verified by Google
- **Solutions**:
  1. For development: Add users to the "Test users" list
  2. For production: Submit your app for verification (if needed)
  3. Users can click "Advanced" → "Go to [App Name] (unsafe)" to proceed

### Can't Find Google+ API
- **Solution**: Use Google People API instead, it provides the same functionality

---

## Security Best Practices

1. **Never commit credentials to Git**:
   - Add `.env` to `.gitignore`
   - Use `.env.example` as a template

2. **Use different credentials for dev/staging/production**:
   - Create separate OAuth clients for each environment

3. **Rotate secrets periodically**:
   - Generate new Client Secret every 90 days
   - Update all environments

4. **Monitor OAuth usage**:
   - Check Google Cloud Console for unusual activity
   - Review the "OAuth consent screen" metrics

5. **Limit scopes**:
   - Only request `profile` and `email` scopes
   - Don't request additional permissions unless needed

---

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In for Websites](https://developers.google.com/identity/sign-in/web)
- [OAuth 2.0 Scopes](https://developers.google.com/identity/protocols/oauth2/scopes)
- [Google Cloud Console](https://console.cloud.google.com/)

---

## Support

If you encounter issues not covered in this guide:
1. Check the application logs for detailed error messages
2. Review Google Cloud Console error logs
3. Consult the Google OAuth documentation
4. Contact the development team

---

Last Updated: 2025-11-15

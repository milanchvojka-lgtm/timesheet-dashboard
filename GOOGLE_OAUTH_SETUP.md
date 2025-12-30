# Google OAuth Setup Guide

This guide walks you through setting up Google OAuth for the Timesheet Analytics application.

## Prerequisites

- Google Cloud Platform account
- Access to https://console.cloud.google.com
- @2fresh.cz domain (for OAuth consent screen)

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click on the project dropdown at the top
3. Click **"New Project"**
4. Enter project details:
   - **Project name**: Timesheet Analytics
   - **Organization**: 2Fresh (if applicable)
5. Click **"Create"**

## Step 2: Enable Google+ API

1. In your project, go to **APIs & Services** → **Library**
2. Search for **"Google+ API"**
3. Click on it and press **"Enable"**

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **"Internal"** (for @2fresh.cz domain only)
   - This ensures only users from your organization can sign in
3. Click **"Create"**

4. Fill in **App information**:
   - **App name**: Timesheet Analytics
   - **User support email**: your-email@2fresh.cz
   - **App logo**: (optional) Upload your app logo
   - **Application home page**: https://your-app-url.com (or http://localhost:3000 for dev)
   - **Application privacy policy**: (optional)
   - **Application terms of service**: (optional)

5. Fill in **Developer contact information**:
   - **Email addresses**: your-email@2fresh.cz

6. Click **"Save and Continue"**

7. **Scopes** page:
   - Click **"Add or Remove Scopes"**
   - Add the following scopes:
     - `openid`
     - `email`
     - `profile`
   - These are the default scopes needed for authentication
   - Click **"Update"**
   - Click **"Save and Continue"**

8. **Summary** page:
   - Review your settings
   - Click **"Back to Dashboard"**

## Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"OAuth client ID"**

3. Configure your OAuth client:
   - **Application type**: Web application
   - **Name**: Timesheet Analytics Web Client

4. **Authorized JavaScript origins**:
   Add the following URLs (one per line):
   ```
   http://localhost:3000
   https://your-production-domain.com
   ```

5. **Authorized redirect URIs**:
   Add the following URLs (one per line):
   ```
   http://localhost:3000/api/auth/callback/google
   https://your-production-domain.com/api/auth/callback/google
   ```

6. Click **"Create"**

7. **Save your credentials**:
   - A popup will show your **Client ID** and **Client Secret**
   - Copy both values immediately
   - Click **"OK"**

## Step 5: Configure Environment Variables

1. Open your `.env.local` file (create it if it doesn't exist)
2. Add the Google OAuth credentials:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

3. Also ensure you have NextAuth configuration:

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

### Generate NEXTAUTH_SECRET

Run this command in your terminal:
```bash
openssl rand -base64 32
```

Copy the output and use it as your `NEXTAUTH_SECRET`.

## Step 6: Test Authentication

1. Restart your Next.js development server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3000/login

3. Click **"Sign in with Google"**

4. You should see the Google OAuth consent screen

5. Sign in with your @2fresh.cz account

6. After successful authentication, you should be redirected to the dashboard

## Step 7: Production Setup

When deploying to production (e.g., Vercel):

1. Update **Authorized JavaScript origins** in Google Cloud Console:
   ```
   https://your-production-domain.vercel.app
   ```

2. Update **Authorized redirect URIs**:
   ```
   https://your-production-domain.vercel.app/api/auth/callback/google
   ```

3. Update environment variables in Vercel:
   - Go to your project settings in Vercel
   - Navigate to **Environment Variables**
   - Add:
     - `GOOGLE_CLIENT_ID`
     - `GOOGLE_CLIENT_SECRET`
     - `NEXTAUTH_URL` (your production URL)
     - `NEXTAUTH_SECRET` (same as local)

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Check that your redirect URI in Google Cloud Console matches exactly
- Include the protocol (http:// or https://)
- Don't include trailing slashes
- Format: `http://localhost:3000/api/auth/callback/google`

### Error: "Access blocked: This app's request is invalid"
- Make sure you selected **"Internal"** for OAuth consent screen
- Verify your domain is set to 2fresh.cz
- Check that you enabled the Google+ API

### Error: "Access denied. Only @2fresh.cz emails are allowed"
- This is working as intended
- Only Google Workspace accounts from @2fresh.cz domain can sign in
- If you need to allow other domains, modify the `signIn` callback in `lib/auth.ts`

### Can't sign in with @2fresh.cz account
- Verify the OAuth consent screen is set to **"Internal"**
- Make sure the user exists in your Google Workspace
- Check that the scopes (openid, email, profile) are added

### "Configuration" error during sign in
- Check that all environment variables are set correctly
- Verify `NEXTAUTH_SECRET` is set
- Restart your development server after changing .env.local

## Security Best Practices

1. **Never commit** `.env.local` to version control
2. **Rotate** your `NEXTAUTH_SECRET` periodically
3. **Use different** OAuth clients for development and production
4. **Restrict** OAuth consent screen to "Internal" only
5. **Monitor** OAuth usage in Google Cloud Console

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com)

---

**Setup complete!** You now have Google OAuth configured with domain restriction to @2fresh.cz emails.

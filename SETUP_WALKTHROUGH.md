# Complete Setup Walkthrough

Follow these steps to get your Timesheet Analytics application fully configured and running.

**Time Required:** ~30-45 minutes

---

## Step 1: Create Supabase Project (10 minutes)

### 1.1 Sign Up / Sign In to Supabase

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign in"** if you have an account
3. Sign in with GitHub (recommended) or email

### 1.2 Create New Project

1. Click **"New Project"**
2. Select your organization (or create one)
3. Fill in project details:
   - **Name**: `timesheet-analytics` (or your preferred name)
   - **Database Password**: Create a strong password
     - **IMPORTANT**: Save this password - you'll need it!
   - **Region**: Choose closest to you (e.g., `Central EU (Frankfurt)` for Europe)
   - **Pricing Plan**: Free (sufficient for this project)
4. Click **"Create new project"**
5. Wait ~2 minutes for provisioning (you'll see a progress bar)

### 1.3 Get API Credentials

Once your project is ready:

1. In the left sidebar, click **Settings** (gear icon)
2. Click **API** in the settings menu
3. You'll see your API credentials:

   **Copy these values:**
   - **Project URL** → This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → This is your `SUPABASE_SERVICE_ROLE_KEY`

4. **Add these to your `.env.local` file:**

   Open `.env.local` and paste the values:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

✅ **Supabase project created!**

---

## Step 2: Run Database Migrations (10 minutes)

Now we'll create the database tables.

### 2.1 Open SQL Editor

1. In Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **"New query"**

### 2.2 Run Migration 1 - Users Table

1. Open the file: `supabase/migrations/20250101000001_create_users_table.sql`
2. Copy **ALL** the content
3. Paste into the SQL Editor
4. Click **"Run"** (or press Cmd/Ctrl + Enter)
5. You should see: ✅ **"Success. No rows returned"**

### 2.3 Run Migration 2 - Planned FTE Table

1. Open: `supabase/migrations/20250101000002_create_planned_fte_table.sql`
2. Copy all content
3. Paste into SQL Editor (clear previous query first)
4. Click **"Run"**
5. Should see: ✅ **Success**

### 2.4 Run Migration 3 - Activity Keywords Table

1. Open: `supabase/migrations/20250101000003_create_activity_keywords_table.sql`
2. Copy all content
3. Paste and **Run**

### 2.5 Run Migration 4 - Audit Log Table

1. Open: `supabase/migrations/20250101000004_create_audit_log_table.sql`
2. Copy all content
3. Paste and **Run**

### 2.6 Run Migration 5 - Settings Table

1. Open: `supabase/migrations/20250101000005_create_settings_table.sql`
2. Copy all content
3. Paste and **Run**

### 2.7 Run Migration 6 - Ignored Timesheets Table

1. Open: `supabase/migrations/20250101000006_create_ignored_timesheets_table.sql`
2. Copy all content
3. Paste and **Run**

### 2.8 Verify Tables Created

1. Click **"Table Editor"** in the left sidebar
2. You should see 6 tables:
   - ✅ users
   - ✅ planned_fte
   - ✅ activity_keywords
   - ✅ audit_log
   - ✅ settings
   - ✅ ignored_timesheets

✅ **Database tables created!**

---

## Step 3: Load Seed Data (5 minutes)

Now we'll add initial data to the database.

### 3.1 Seed Team Members

1. Go back to **SQL Editor**
2. Click **"New query"**
3. Open: `supabase/seeds/seed_team_members.sql`
4. Copy all content
5. Paste into SQL Editor
6. Click **"Run"**
7. Should see: ✅ **Success**

### 3.2 Seed Activity Keywords

1. Open: `supabase/seeds/seed_activity_keywords.sql`
2. Copy all content
3. Paste into SQL Editor (clear previous)
4. Click **"Run"**

### 3.3 Seed Settings

1. Open: `supabase/seeds/seed_settings.sql`
2. Copy all content
3. Paste and **Run**

### 3.4 Verify Seed Data

1. Go to **Table Editor**
2. Click on **users** → Should see 8 team members
3. Click on **activity_keywords** → Should see ~20 keywords
4. Click on **settings** → Should see 9 settings

✅ **Seed data loaded!**

---

## Step 4: Set Up Google OAuth (15 minutes)

### 4.1 Create Google Cloud Project

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Sign in with your Google account
3. Click the project dropdown at the top
4. Click **"New Project"**
5. Enter:
   - **Project name**: `Timesheet Analytics`
   - **Organization**: Select if applicable
6. Click **"Create"**
7. Wait for project creation (~30 seconds)

### 4.2 Configure OAuth Consent Screen

1. In the left menu, go to **APIs & Services** → **OAuth consent screen**
2. Select **"Internal"** (for @2fresh.cz domain only)
   - ⚠️ Important: This ensures only your organization can sign in
3. Click **"Create"**

4. Fill in **App information**:
   - **App name**: `Timesheet Analytics`
   - **User support email**: your-email@2fresh.cz
   - **Developer contact**: your-email@2fresh.cz
5. Click **"Save and Continue"**

6. **Scopes** page:
   - Click **"Add or Remove Scopes"**
   - Check these scopes:
     - ✅ `.../auth/userinfo.email`
     - ✅ `.../auth/userinfo.profile`
     - ✅ `openid`
   - Click **"Update"**
   - Click **"Save and Continue"**

7. **Summary** page:
   - Review settings
   - Click **"Back to Dashboard"**

### 4.3 Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"OAuth client ID"**

3. Configure:
   - **Application type**: Web application
   - **Name**: `Timesheet Analytics Web Client`

4. **Authorized JavaScript origins**:
   Click **"Add URI"** and add:
   ```
   http://localhost:3000
   ```

5. **Authorized redirect URIs**:
   Click **"Add URI"** and add:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   ⚠️ **Important**: No trailing slash!

6. Click **"Create"**

7. **Save your credentials**:
   - A popup shows your **Client ID** and **Client Secret**
   - **COPY BOTH VALUES IMMEDIATELY**
   - Click **"OK"**

### 4.4 Add Google Credentials to .env.local

Open `.env.local` and add your credentials:

```bash
GOOGLE_CLIENT_ID=1234567890-xxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxx
```

✅ **Google OAuth configured!**

---

## Step 5: Verify Environment Variables (2 minutes)

Open `.env.local` and verify all values are set:

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000  ✅

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co  ✅
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...  ✅
SUPABASE_SERVICE_ROLE_KEY=eyJ...  ✅

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000  ✅
NEXTAUTH_SECRET=YgKmX60RD0sBUoYIBnM...  ✅

# Google OAuth
GOOGLE_CLIENT_ID=1234567890-xxx.apps.googleusercontent.com  ✅
GOOGLE_CLIENT_SECRET=GOCSPX-xxx  ✅

# Costlocker API (can be empty for now)
COSTLOCKER_API_URL=https://new.costlocker.com/api-public/v2/  ✅
COSTLOCKER_API_TOKEN=  ⚠️ (add later)
```

All values except `COSTLOCKER_API_TOKEN` should be filled in.

✅ **Environment configured!**

---

## Step 6: Test the Application (5 minutes)

### 6.1 Restart Development Server

If the server is already running, restart it to pick up the new environment variables:

1. Stop the current server (Ctrl+C in terminal)
2. Start it again:
   ```bash
   npm run dev
   ```

### 6.2 Test Login Flow

1. Open browser: [http://localhost:3000/login](http://localhost:3000/login)

2. You should see the **Timesheet Analytics** login page

3. Click **"Sign in with Google"**

4. **Google OAuth screen should appear**:
   - If using @2fresh.cz account → ✅ Should work
   - If using other email → ❌ Should show "Access denied"

5. Sign in with your @2fresh.cz Google account

6. **After successful login**:
   - Should redirect to `/overview`
   - Should see your name and email
   - Should see analytics dashboard

### 6.3 Verify Database Entry

1. Go to Supabase → **Table Editor** → **users**
2. You should see a new row with your email
3. Note: `is_team_member` will be `false` by default

### 6.4 (Optional) Make Yourself a Team Member

If you want to test team member features:

1. Go to Supabase → **SQL Editor**
2. Run this query (replace with your email):
   ```sql
   UPDATE users
   SET is_team_member = true
   WHERE email = 'your-email@2fresh.cz';
   ```
3. Refresh the dashboard page
4. "Team Member" should now show "Yes"

### 6.5 Test Sign Out

1. Click **"Sign Out"** button
2. Should redirect to home page
3. Try accessing `/overview` → Should redirect to `/login`

✅ **Everything working!**

---

## Troubleshooting

### Issue: "Configuration error" on login

**Solution:**
- Check all environment variables are set in `.env.local`
- Restart the dev server: `npm run dev`
- Clear browser cache

### Issue: "redirect_uri_mismatch"

**Solution:**
- Go to Google Cloud Console → Credentials
- Check "Authorized redirect URIs" matches exactly:
  ```
  http://localhost:3000/api/auth/callback/google
  ```
- No trailing slash
- Correct protocol (http not https for localhost)

### Issue: "Access denied. Only @2fresh.cz emails are allowed"

**Solution:**
- This is working correctly!
- Only @2fresh.cz emails can sign in
- Use a Google Workspace account from @2fresh.cz domain

### Issue: Can't see tables in Supabase

**Solution:**
- Make sure all 6 migrations ran successfully
- Check for error messages in SQL Editor
- Try running migrations again (they're safe to re-run)

### Issue: User not in database after login

**Solution:**
- Check Supabase service role key is correct
- Verify RLS policies were created (in migrations)
- Check browser console for errors

---

## Next Steps

Now that everything is set up:

1. ✅ **Phase 1 Complete!** Database and Authentication working

2. **Ready for Phase 2**: Costlocker API Integration
   - Fetch timesheet data from Costlocker
   - Transform and store data
   - Display in dashboard

3. **Customize**:
   - Add more team members to seed data
   - Configure activity keywords for your needs
   - Adjust settings (analysis period, date ranges)

---

## Quick Reference

### Important URLs

- **Application**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **Overview**: http://localhost:3000/overview
- **Upload**: http://localhost:3000/upload
- **Supabase Dashboard**: https://app.supabase.com
- **Google Cloud Console**: https://console.cloud.google.com

### Important Files

- **Environment**: `.env.local`
- **Auth Config**: `lib/auth.ts`
- **Auth Utilities**: `lib/auth-utils.ts`
- **Database Types**: `types/database.types.ts`

### Useful Commands

```bash
# Start development server
npm run dev

# View git status
git status

# View environment variables (don't commit this!)
cat .env.local
```

---

**Setup complete! 🎉**

Your Timesheet Analytics application is now fully configured with:
- ✅ Supabase database (6 tables with seed data)
- ✅ Google OAuth authentication (@2fresh.cz restricted)
- ✅ Protected routes and dashboard
- ✅ Team member verification system

**Questions?** Check the detailed documentation:
- `SUPABASE_SETUP_GUIDE.md` - Database setup details
- `GOOGLE_OAUTH_SETUP.md` - OAuth configuration details
- `AUTH_SETUP_README.md` - Authentication system guide

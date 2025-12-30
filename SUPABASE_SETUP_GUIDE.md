# Supabase Setup Guide

Follow these steps to set up your Supabase database for the Timesheet Analytics application.

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: Timesheet Analytics (or your preferred name)
   - **Database Password**: Choose a strong password and save it
   - **Region**: Choose closest to your users (e.g., Central EU for Europe)
   - **Pricing Plan**: Free tier is sufficient for this project
4. Click **"Create new project"**
5. Wait ~2 minutes for provisioning to complete

## Step 2: Get API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:

   ```
   Project URL: https://xxxxxxxxxxxxx.supabase.co
   anon/public key: eyJhbGc...
   service_role key: eyJhbGc... (keep this secret!)
   ```

## Step 3: Configure Environment Variables

1. Create a `.env.local` file in the root of your project
2. Add the following variables:

   ```bash
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

   # NextAuth.js
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-here  # Generate with: openssl rand -base64 32

   # Google OAuth (you'll set these up later)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Costlocker API (you'll set these up later)
   COSTLOCKER_API_URL=https://new.costlocker.com/api-public/v2/
   COSTLOCKER_API_TOKEN=your-costlocker-token
   ```

## Step 4: Run Database Migrations

You have two options:

### Option A: Using Supabase Dashboard (Easiest)

1. Go to your Supabase project → **SQL Editor**
2. Click **"New query"**
3. Copy the content from each migration file (in order):

   **Migration 1 - Users Table:**
   - Open: `supabase/migrations/20250101000001_create_users_table.sql`
   - Copy all content
   - Paste into SQL Editor
   - Click **Run**

   **Migration 2 - Planned FTE Table:**
   - Open: `supabase/migrations/20250101000002_create_planned_fte_table.sql`
   - Copy all content
   - Paste into SQL Editor
   - Click **Run**

   **Migration 3 - Activity Keywords Table:**
   - Open: `supabase/migrations/20250101000003_create_activity_keywords_table.sql`
   - Copy all content
   - Paste into SQL Editor
   - Click **Run**

   **Migration 4 - Audit Log Table:**
   - Open: `supabase/migrations/20250101000004_create_audit_log_table.sql`
   - Copy all content
   - Paste into SQL Editor
   - Click **Run**

   **Migration 5 - Settings Table:**
   - Open: `supabase/migrations/20250101000005_create_settings_table.sql`
   - Copy all content
   - Paste into SQL Editor
   - Click **Run**

   **Migration 6 - Ignored Timesheets Table:**
   - Open: `supabase/migrations/20250101000006_create_ignored_timesheets_table.sql`
   - Copy all content
   - Paste into SQL Editor
   - Click **Run**

### Option B: Using Supabase CLI (Advanced)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login and link to your project:
   ```bash
   supabase login
   supabase link --project-ref your-project-ref
   ```

3. Push migrations:
   ```bash
   supabase db push
   ```

## Step 5: Seed Initial Data

After all migrations are complete, load the seed data:

1. Go to **SQL Editor** in Supabase dashboard
2. Run each seed file:

   **Seed 1 - Team Members:**
   - Open: `supabase/seeds/seed_team_members.sql`
   - Copy all content
   - Paste into SQL Editor
   - Click **Run**

   **Seed 2 - Activity Keywords:**
   - Open: `supabase/seeds/seed_activity_keywords.sql`
   - Copy all content
   - Paste into SQL Editor
   - Click **Run**

   **Seed 3 - Settings:**
   - Open: `supabase/seeds/seed_settings.sql`
   - Copy all content
   - Paste into SQL Editor
   - Click **Run**

## Step 6: Verify Setup

1. Go to **Table Editor** in Supabase dashboard
2. You should see 6 tables:
   - ✅ users
   - ✅ planned_fte
   - ✅ activity_keywords
   - ✅ audit_log
   - ✅ settings
   - ✅ ignored_timesheets

3. Check that seed data was loaded:
   - Click on `users` → Should see 8 team members
   - Click on `planned_fte` → Should see FTE records
   - Click on `activity_keywords` → Should see ~20 keywords
   - Click on `settings` → Should see 9 settings

## Step 7: Test Database Connection

1. Restart your Next.js development server:
   ```bash
   npm run dev
   ```

2. The app should now be able to connect to Supabase
3. Check the browser console for any connection errors

## Common Issues

### "Invalid API key" error
- Double-check your environment variables in `.env.local`
- Make sure you copied the keys correctly (no extra spaces)
- Restart the dev server after changing environment variables

### "relation does not exist" error
- Make sure you ran all migrations in order
- Check the Table Editor to verify tables were created

### Seed data fails with "duplicate key value"
- This is safe to ignore if you're re-running seeds
- The seed files use `ON CONFLICT DO NOTHING` to prevent duplicates

### "permission denied" when querying
- Check Row Level Security (RLS) policies
- Make sure you're using the correct Supabase client (server vs browser)
- For admin operations, use the service role client

## Next Steps

After completing database setup:

1. **Set up NextAuth.js** for Google OAuth authentication
2. **Configure Costlocker API** credentials
3. **Test the authentication flow** (login/logout)
4. **Start building features** using the database

## Need Help?

- Check `supabase/README.md` for detailed documentation
- Review `types/database.types.ts` for TypeScript type definitions
- Look at `lib/supabase/server.ts` and `lib/supabase/client.ts` for usage examples

---

**Database setup complete!** You now have a fully configured Supabase database with 6 tables, Row Level Security, and initial seed data.

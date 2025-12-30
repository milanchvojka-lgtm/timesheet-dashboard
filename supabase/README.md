# Supabase Database Setup

This directory contains database migrations and seed data for the Timesheet Analytics application.

## Prerequisites

1. **Create a Supabase project:**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Fill in project details (name, database password, region)
   - Wait for project to be provisioned (~2 minutes)

2. **Get your API credentials:**
   - Go to Project Settings → API
   - Copy `Project URL` → This is your `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon/public` key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy `service_role` key → This is your `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```bash
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # NextAuth (you'll need these too)
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-here

   # Google OAuth (you'll need these too)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Costlocker API (you'll need these too)
   COSTLOCKER_API_URL=https://new.costlocker.com/api-public/v2/
   COSTLOCKER_API_TOKEN=your-costlocker-token
   ```

## Directory Structure

```
supabase/
├── migrations/           # Database schema migrations
│   ├── 20250101000001_create_users_table.sql
│   ├── 20250101000002_create_planned_fte_table.sql
│   ├── 20250101000003_create_activity_keywords_table.sql
│   ├── 20250101000004_create_audit_log_table.sql
│   ├── 20250101000005_create_settings_table.sql
│   └── 20250101000006_create_ignored_timesheets_table.sql
└── seeds/               # Initial data
    ├── seed_team_members.sql
    ├── seed_activity_keywords.sql
    └── seed_settings.sql
```

## Running Migrations

### Option 1: Using Supabase Dashboard (Easiest)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the content of each migration file **in order** (001, 002, 003, etc.)
5. Click **Run** for each migration

### Option 2: Using Supabase CLI (Recommended for production)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link to your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. Run migrations:
   ```bash
   supabase db push
   ```

## Running Seed Data

After running all migrations, load the seed data:

1. Go to **SQL Editor** in Supabase dashboard
2. Run each seed file in this order:
   - `seeds/seed_team_members.sql`
   - `seeds/seed_activity_keywords.sql`
   - `seeds/seed_settings.sql`

## Database Tables

### `users`
Stores user account information for authentication and team member tracking.

**Key columns:**
- `email` - User email (must be @2fresh.cz for team members)
- `costlocker_person_id` - Links to Costlocker API person ID
- `is_team_member` - Whether user is a design team member

### `planned_fte`
Stores planned FTE (Full-Time Equivalent) values for team members with temporal tracking.

**Key columns:**
- `user_id` - Reference to users table
- `fte_value` - FTE value (0.00 to 1.00)
- `valid_from` / `valid_to` - Date range for this FTE value (NULL valid_to = current)

### `activity_keywords`
Keywords used for categorizing timesheet activities.

**Key columns:**
- `keyword` - Keyword to match (case-insensitive)
- `category` - Category name (e.g., "OPS Hiring", "OPS Jobs")

### `audit_log`
Tracks admin actions for compliance and debugging.

**Key columns:**
- `action` - Action type (e.g., "UPDATE_FTE")
- `entity_type` - Type of entity affected
- `old_values` / `new_values` - JSONB data showing changes

### `settings`
Application-wide configuration settings.

**Key columns:**
- `key` - Setting key (unique)
- `value` - JSONB value
- `is_public` - Whether visible to all users

### `ignored_timesheets`
Timesheet entries that users want to exclude from analysis.

**Key columns:**
- `costlocker_timesheet_id` - ID from Costlocker API
- `reason` - Optional reason for ignoring

## Row Level Security (RLS)

All tables have Row Level Security enabled:

- **users**: Users can read their own data
- **planned_fte**: All authenticated users can read
- **activity_keywords**: All authenticated users can read
- **audit_log**: All authenticated users can read, only service role can insert
- **settings**: Authenticated users can read public settings
- **ignored_timesheets**: Users can manage their own ignored entries

**Service role** bypasses all RLS policies (use with caution in API routes).

## Updating Types

After making schema changes, regenerate TypeScript types:

```bash
npx supabase gen types typescript --project-id your-project-ref > types/database.types.ts
```

Or manually update `types/database.types.ts` to match your schema.

## Troubleshooting

### Migration fails with "relation already exists"
The migrations use `CREATE TABLE IF NOT EXISTS`, so you can safely re-run them. If issues persist, drop and recreate the database in Supabase dashboard.

### RLS policies blocking queries
If you're getting "permission denied" errors, check:
1. Are you using the correct Supabase client (server vs browser)?
2. Is the user authenticated?
3. Do you need to use the service role client for admin operations?

### Seed data fails with foreign key constraint
Make sure you run migrations **before** seed data, and run seed files in order.

## Next Steps

After setting up the database:

1. Configure NextAuth.js for Google OAuth
2. Set up Costlocker API credentials
3. Test authentication flow
4. Verify database connections with `lib/supabase/server.ts` and `lib/supabase/client.ts`

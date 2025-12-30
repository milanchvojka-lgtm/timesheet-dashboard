# Timesheet Analytics Dashboard

A modern, full-featured timesheet analytics application built with Next.js 14, TypeScript, and Tailwind CSS. Import timesheet data from Costlocker via CSV/Excel uploads and analyze team performance, FTE tracking, and project breakdowns.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Then edit .env.local with your values

# Run database migrations
npx supabase db push

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Features

### Core Features
- **CSV/Excel Upload** - Import timesheet data from Costlocker exports
- **Flexible Parser** - Supports Czech and English column names
- **Batch Processing** - Handles large files (1000+ rows) efficiently
- **Upload History** - Track all imports with success/failure statistics
- **Data Validation** - Robust validation with clear error messages

### Technology Stack
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **Dark mode** with next-themes
- **Supabase** for database
- **NextAuth.js v5** for Google OAuth (@2fresh.cz only)
- **Recharts** for data visualization
- **PapaParse** for CSV parsing
- **XLSX** for Excel parsing

## Custom Color Scheme

Project categories have dedicated colors:

- Internal: Blue (#3b82f6)
- Operations: Green (#10b981)
- R&D: Amber (#f59e0b)
- Guiding: Purple (#8b5cf6)
- PR: Pink (#ec4899)
- UX: Cyan (#06b6d4)

## Project Structure

See [PROJECT_SETUP.md](./PROJECT_SETUP.md) for detailed information.

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Run production build
npm run lint     # Run ESLint
```

## Environment Variables

Required variables in `.env.local`:

- Supabase: URL, keys
- NextAuth: URL, secret, Google OAuth

See `.env.example` for full list.

## How to Use

### 1. Login

Navigate to the application and sign in with your **@2fresh.cz** Google account. Only users from the 2FRESH domain are authorized.

### 2. Upload Timesheet Data

1. **Export from Costlocker:**
   - Go to Costlocker → Timesheet view
   - Select desired date range
   - Export to CSV or Excel format

2. **Upload to Dashboard:**
   - Navigate to `/dashboard/upload`
   - Drag and drop your exported file or click "Browse Files"
   - Wait for processing (typically <10 seconds for 500 rows)

3. **View Results:**
   - See upload statistics (total rows, successful, failed)
   - Check upload history for all previous imports
   - Navigate to dashboard to analyze the data

### 3. Supported File Formats

**File Types:**
- `.csv` - Comma-separated values
- `.xlsx` - Excel 2007+
- `.xls` - Excel 97-2003

**Column Names:**
The parser automatically detects both Czech and English column names:

| Required Data | Czech | English |
|--------------|-------|---------|
| Date | Datum | date, day |
| Person | Osoba | person_name, name, user |
| Project | Projekt | project_name, project |
| Activity | Činnost, Úkol | activity_name, task |
| Hours | Natrackováno | hours, duration, time |

**Optional columns:** Description (Popis), Billable (Placené)

### 4. Date & Number Formats

- **Dates:** Supports "28. 11. 2025" (Czech) or "2025-11-28" (ISO)
- **Hours:** Supports both comma (0,25) and dot (0.25) as decimal separator

### 5. Troubleshooting

**Upload failed with validation errors:**
- Check that all required columns are present
- Verify date format is correct
- Ensure hours are positive numbers

**Upload shows 0 successful rows:**
- Check database connection in Supabase dashboard
- Verify you have the latest migrations applied
- Check browser console for detailed error messages

**File too large error:**
- Maximum file size is 10MB
- Split large exports into multiple files by date range

## Documentation

- [CLAUDE.md](./CLAUDE.md) - Complete technical documentation for developers
- [PROJECT_SETUP.md](./PROJECT_SETUP.md) - Detailed setup guide
- [AUTH_SETUP_README.md](./AUTH_SETUP_README.md) - Authentication setup
- [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) - Google OAuth configuration

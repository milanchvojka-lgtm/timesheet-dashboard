# Timesheet Analytics Dashboard

A modern, full-featured timesheet analytics application built with Next.js 14, TypeScript, and Tailwind CSS.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Then edit .env.local with your values

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Features

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **Dark mode** with next-themes
- **Supabase** ready for database & auth
- **NextAuth.js v5** for Google OAuth
- **Recharts** for data visualization

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
- Costlocker: API URL, token

See `.env.example` for full list.

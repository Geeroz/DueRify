# DueRify - Startup Portfolio Management Platform

A comprehensive portfolio management SaaS platform built for startup incubators. DueRify provides a single source of truth for managing multiple startups, tracking their progress, maintaining document data rooms, and facilitating investor access.

## Project Status

**Current Stage:** MVP Foundation Complete

We've successfully completed the core infrastructure setup:

✅ Complete Prisma database schema (14 models)
✅ Multi-tenant architecture with tenant-per-row pattern
✅ Role-based access control (4 roles: INCUBATOR_ADMIN, STARTUP_ADMIN, STARTUP_USER, INVESTOR_VIEWER)
✅ NextAuth v5 authentication (Google OAuth + Credentials)
✅ Authentication pages (Login, Signup)
✅ Dashboard layout with sidebar navigation
✅ Middleware for route protection
✅ shadcn/ui component library integration

## Tech Stack

- **Framework:** Next.js 16.0.3 with App Router
- **Language:** TypeScript 5.x
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js v5
- **Styling:** Tailwind CSS 4.x
- **UI Components:** shadcn/ui (Radix UI primitives)
- **State Management:**
  - TanStack Query (server state)
  - Zustand (client state)
- **Charts:** Recharts
- **File Storage:** Vercel Blob
- **Email:** Resend
- **PDF Generation:** React-PDF

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- PostgreSQL database (local or hosted on Neon/Supabase)
- Google OAuth credentials (optional, for Google sign-in)

### Installation

1. **Clone and install dependencies:**

```bash
cd duerify-data-room
npm install
```

2. **Set up environment variables:**

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Your app URL (http://localhost:3000 for development)
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`

Optional (for full functionality):
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` - For Google OAuth
- `BLOB_READ_WRITE_TOKEN` - For file uploads
- `RESEND_API_KEY` - For email notifications

3. **Set up the database:**

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# Or create a migration (for production)
npm run db:migrate
```

4. **Run the development server:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Scripts

```bash
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Prisma Studio GUI
npm run db:migrate   # Create and apply migrations
npm run db:seed      # Seed database (not yet implemented)
```

## Project Structure

```
duerify-data-room/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   ├── signup/
│   │   └── layout.tsx
│   ├── (dashboard)/         # Protected dashboard routes
│   │   ├── dashboard/
│   │   └── layout.tsx
│   ├── api/                 # API routes
│   │   └── auth/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles
├── components/
│   └── ui/                  # shadcn/ui components
├── lib/
│   ├── auth.ts              # NextAuth configuration
│   ├── prisma.ts            # Prisma client singleton
│   ├── rbac.ts              # Role-based access control
│   ├── tenant.ts            # Multi-tenancy utilities
│   ├── utils.ts             # Utility functions
│   └── stores/
│       └── tenant-store.ts  # Zustand tenant store
├── prisma/
│   └── schema.prisma        # Database schema
├── types/
│   └── next-auth.d.ts       # NextAuth type extensions
├── docs/                    # Project documentation
│   ├── architecture.md      # Technical architecture
│   ├── prd.md              # Product requirements
│   └── epics.md            # Development epics
├── middleware.ts            # Auth middleware
└── CLAUDE.md               # AI assistant documentation
```

## Architecture Overview

### Multi-Tenancy

DueRify uses a **tenant-per-row** pattern:
- Every data table includes a `startupId` foreign key for data isolation
- Users can belong to multiple startups via the `StartupUser` junction table
- All queries **must** filter by `startupId` to ensure tenant isolation
- Client-side tenant context managed with Zustand store

### Role-Based Access Control

Four distinct roles with hierarchical permissions:

1. **INCUBATOR_ADMIN** - Full access to all portfolio startups
2. **STARTUP_ADMIN** - Full access to their own startup
3. **STARTUP_USER** - Limited access (read + upload) to their startup
4. **INVESTOR_VIEWER** - Read-only access to granted startups

### Database Schema

14 models organized into logical groups:

- **Authentication:** User, Account, Session, VerificationToken
- **Multi-Tenancy:** Startup, StartupUser, InvestorGrant
- **Document Management:** Document (with verification workflow)
- **One-Pager:** OnePager, OnePagerView (with view tracking)
- **Assessment:** Assessment (IDE methodology: TRL/MRL/CRL/BRL)
- **Team Management:** Invitation, NotificationPreference
- **System:** AuditLog, DashboardMetric, SupportTicket, ContactInquiry, Subscription

## Features

### ✅ Implemented

- **Authentication System**
  - Email/password signup and login
  - Google OAuth integration
  - Protected routes with middleware
  - Session management

- **Dashboard**
  - User profile display
  - Startup listing
  - Quick action cards
  - Sidebar navigation

### 🚧 In Progress

- Document management system
- One-pager creation and sharing
- IDE readiness assessment
- Portfolio dashboard (for incubator admins)
- Team and user management
- Investor access portal

### 📋 Planned

Refer to `docs/epics.md` for the complete implementation roadmap.

## Development Guidelines

### API Route Pattern

All API routes follow this security pattern:

```typescript
// 1. Check authentication
const session = await auth()
if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

// 2. Validate input with Zod
const validated = YourSchema.parse(body)

// 3. Check tenant access
const hasAccess = await checkUserStartupAccess(session.user.id, startupId)
if (!hasAccess) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

// 4. Check role permissions
if (!checkPermission(session.user.role, action, resource)) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// 5. Perform database operation with startupId filter
const data = await prisma.model.findMany({
  where: { startupId } // ALWAYS filter by tenant
})

// 6. Return response
return NextResponse.json({ data })
```

### Critical Security Rules

⚠️ **ALWAYS filter by `startupId` in database queries for tenant-scoped data**
⚠️ **Validate user access before returning any data**
⚠️ **Use Zod schemas to validate all user input**
⚠️ **Check role permissions for every action**

## Documentation

- **CLAUDE.md** - Guide for AI assistants working on this codebase
- **docs/architecture.md** - Complete technical architecture and database schema
- **docs/prd.md** - Product requirements document
- **docs/epics.md** - Development epics and user stories

## Contributing

This is an internal project for the incubator. For questions or issues:

1. Check the documentation in `docs/`
2. Review `CLAUDE.md` for architectural decisions
3. Create a GitHub issue for bugs or feature requests

## License

Proprietary - All rights reserved

## Acknowledgments

Built with Next.js, Prisma, NextAuth, and shadcn/ui.

---

**Version:** 0.1.0
**Last Updated:** 2024-11-19
**Status:** Active Development

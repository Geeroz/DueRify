# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DueRify** is a comprehensive portfolio management SaaS platform for startup incubators. It provides a single source of truth for managing multiple startups, tracking their progress, maintaining document data rooms, and facilitating investor access.

This is a **greenfield Next.js 16 project** built from scratch using the App Router, TypeScript, Tailwind CSS v4, and React 19.

## Tech Stack

- **Framework**: Next.js 16.0.3 with App Router
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4.x (using new CSS-first configuration)
- **UI Components**: Planned shadcn/ui integration (Radix UI primitives)
- **Database**: PostgreSQL with Prisma ORM (to be set up)
- **Auth**: NextAuth.js v5 (to be implemented)
- **Storage**: Vercel Blob for document uploads (to be integrated)
- **State Management**:
  - TanStack Query for server state
  - Zustand for client state (tenant context, UI state)
- **Charts**: Recharts for data visualization
- **PDF**: React-PDF for document generation

## Development Commands

```bash
# Development server
npm run dev                 # Start dev server at http://localhost:3000

# Build & Production
npm run build              # Create production build
npm start                  # Run production server

# Code Quality
npm run lint              # Run ESLint

# Database (after Prisma setup)
npx prisma generate       # Generate Prisma client
npx prisma db push        # Push schema changes to database
npx prisma studio         # Open Prisma Studio GUI
npx prisma migrate dev    # Create and apply migration
```

## Project Structure

```
duerify-data-room/
├── app/                  # Next.js App Router
│   ├── layout.tsx       # Root layout with Geist fonts
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles with Tailwind v4
├── docs/                # Comprehensive project documentation
│   ├── architecture.md  # Full technical architecture
│   ├── prd.md          # Product requirements document
│   ├── epics.md        # Development epics and user stories
│   └── sitemap.md      # Application sitemap
├── package.json
├── tsconfig.json
├── next.config.ts
└── eslint.config.mjs
```

## Architecture Principles

### Multi-Tenancy
DueRify implements a **tenant-per-row** pattern where every data table includes a `startupId` foreign key for data isolation:
- One incubator manages multiple startups
- Each startup's data is completely isolated
- Users can belong to multiple startups via `StartupUser` join table
- All queries MUST filter by `startupId` to ensure tenant isolation

### Role-Based Access Control (RBAC)
Four distinct roles with different permissions:
1. **INCUBATOR_ADMIN**: Full access to all portfolio startups
2. **STARTUP_ADMIN**: Full access to their own startup
3. **STARTUP_USER**: Limited access to their startup (read + upload)
4. **INVESTOR_VIEWER**: Read-only access to granted startups

**Critical**: Every API endpoint must check:
1. User is authenticated
2. User has access to the requested `startupId`
3. User's role permits the requested action

### Data Model Overview

**Core Entities**:
- `User`: Authentication and user profiles
- `Startup`: Tenant entity (the "startup" being managed)
- `StartupUser`: Many-to-many relationship between users and startups
- `Document`: File uploads with categories and verification status
- `OnePager`: Public startup profile with shareable links
- `Assessment`: IDE readiness scores (TRL, MRL, CRL, BRL)
- `InvestorGrant`: Tracks which investors can access which startups

**Key Relationships**:
- Users belong to multiple startups (via StartupUser)
- All content (documents, assessments, one-pagers) belongs to exactly one startup
- Documents have verification status (PENDING, VERIFIED, REJECTED)
- One-pagers track views and have public slugs

## Planned Application Structure

### Route Organization
```
app/
├── (auth)/                    # Auth pages (login, signup, reset)
├── (public)/                  # Marketing pages (home, features, pricing)
├── (dashboard)/               # Protected dashboard routes
│   ├── layout.tsx            # Dashboard shell with sidebar
│   ├── dashboard/            # Main dashboard
│   ├── documents/            # Document management
│   ├── one-pager/            # One-pager editor
│   ├── ide-assessment/       # Readiness assessment
│   ├── portfolio/            # Incubator admin portfolio view
│   ├── analytics/            # Analytics dashboard
│   └── settings/             # Settings pages
└── api/                      # API routes
    ├── auth/[...nextauth]/   # NextAuth endpoints
    ├── startups/             # Startup CRUD
    ├── documents/            # Document CRUD + upload
    ├── one-pagers/           # One-pager CRUD + PDF/QR
    ├── assessments/          # Assessment CRUD
    └── users/                # User management
```

### Component Organization
```
components/
├── ui/                       # shadcn/ui primitives
├── layout/                   # Dashboard shell, sidebar, header
├── documents/                # Document upload, list, verification
├── one-pager/                # One-pager editor, preview, share
├── assessments/              # Assessment forms, radar chart
├── portfolio/                # Startup grid, cards, filters
└── analytics/                # Charts, metrics, activity feed
```

## Development Guidelines

### API Route Pattern
All API routes should follow this structure:
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

// 6. Return standard response format
return NextResponse.json({ data })
```

### Tenant Context Management
- Use Zustand store (`useTenantStore`) to track current startup context on client
- Provide account switcher in header for multi-startup users
- Server-side: extract `startupId` from query params or request body
- Never trust client-provided `startupId` without verifying user access

### Database Queries
- **ALWAYS** include `startupId` in WHERE clauses for tenant-scoped data
- Use Prisma indexes on `[startupId, otherField]` for performance
- Audit logs should capture `userId`, `action`, `resource`, and optional `startupId`

### State Management
- **Server state**: Use TanStack Query for fetching/caching API data
- **Client state**: Use Zustand for UI state and tenant context
- Avoid mixing server and client state in the same store

### Styling with Tailwind v4
This project uses **Tailwind CSS v4** with the new CSS-first configuration:
- Theme customization is in `app/globals.css` using `@theme` directive
- No `tailwind.config.js` file (v4 uses pure CSS configuration)
- CSS variables for theming (light/dark mode)
- Import Tailwind with `@import "tailwindcss"`

### Form Handling
- Use React Hook Form for forms
- Validate with Zod schemas (reuse schemas between client and server)
- Show inline validation errors
- Provide clear success/error states

## IDE Readiness Assessment

The platform implements the **IDE (Innovation Development and Evaluation)** methodology with four dimensions:

1. **TRL (Technology Readiness Level)**: Technical maturity (1-9 scale)
2. **MRL (Manufacturing Readiness Level)**: Production capability (1-10 scale)
3. **CRL (Commercial Readiness Level)**: Market readiness (1-6 scale)
4. **BRL (Business Readiness Level)**: Business model maturity (custom scale)

Each dimension has a questionnaire. Scores are calculated, normalized to 0-100, and displayed in a radar chart. Recommendations are generated based on weak areas.

## Document Management

### Categories
Predefined: Financial, Legal, Product/Service, Team, Market Research, Custom

### Verification Workflow
1. User uploads document → status: PENDING
2. Admin reviews → sets status to VERIFIED or REJECTED
3. Only VERIFIED documents count toward "verified document count" metric
4. Verification status displayed with badges throughout UI

### Storage
- Documents stored in Vercel Blob
- Metadata (filename, category, verification status, uploader) in PostgreSQL
- Document `blobKey` used for deletion
- File size limit: 50MB per file

## One-Pager Feature

### Sections
- Company & Problem
- Solution & Market
- Product/Service
- Team
- Contact Info

### Functionality
- Auto-save as user types
- Generate shareable public link with slug (e.g., `/one-pager/acme-startup`)
- Generate QR code for the link
- Track view count and view history (IP, user agent, referrer)
- Export as PDF using React-PDF

### Public Access
- One-pagers accessible without login via public URL
- Can be toggled public/private by startup admin
- View tracking continues even for public views

## Security Considerations

- **Input validation**: Use Zod schemas for all user input
- **SQL injection**: Prevented by Prisma parameterized queries
- **XSS**: React escapes output by default; avoid `dangerouslySetInnerHTML`
- **CSRF**: NextAuth handles CSRF tokens for auth flows
- **File uploads**: Validate MIME types, scan for malware (future), limit file size
- **Rate limiting**: Implement on auth endpoints to prevent brute force
- **Session management**: JWT-based sessions with secure httpOnly cookies
- **Audit logging**: Log all access to sensitive resources (documents, assessments)

## Environment Variables Required

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/duerify

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# OAuth
GOOGLE_CLIENT_ID=your-google-id
GOOGLE_CLIENT_SECRET=your-google-secret

# Vercel Blob
BLOB_READ_WRITE_TOKEN=vercel_blob_token

# Email (Resend)
RESEND_API_KEY=re_your_key
RESEND_FROM_EMAIL=noreply@duerify.com
```

## Current Development Stage

**Status**: Fresh Next.js scaffold with default configuration

**Completed**:
- Next.js 16 project initialized with TypeScript
- Tailwind CSS v4 configured with Geist fonts
- Basic App Router structure (layout, page)
- ESLint configuration with Next.js presets

**Next Steps** (as outlined in epics.md):
1. Set up Prisma with database schema
2. Configure NextAuth.js with Google OAuth + credentials
3. Build authentication pages (login, signup, password reset)
4. Implement multi-tenancy utilities and middleware
5. Create dashboard layout with sidebar navigation
6. Build document upload and management features
7. Implement one-pager editor and sharing
8. Create IDE assessment questionnaires and scoring

## Testing Approach

**Unit Tests** (future):
- Test utility functions (scoring algorithms, validation schemas)
- Test RBAC permission checks
- Use Vitest or Jest

**Integration Tests** (future):
- Test API routes with mock database
- Test authentication flows
- Use Playwright or Cypress for E2E

**Manual Testing Priorities**:
- Multi-tenancy isolation (can users access other startups' data?)
- Role permissions (can STARTUP_USER delete documents?)
- File upload edge cases (large files, wrong MIME types)
- Responsive design across breakpoints

## Common Patterns

### Fetching Data with TanStack Query
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['documents', startupId],
  queryFn: async () => {
    const res = await fetch(`/api/documents?startupId=${startupId}`)
    return res.json()
  }
})
```

### Server Component Data Fetching
```typescript
export default async function DocumentsPage() {
  const session = await auth()
  const startup = await getCurrentStartup() // helper from lib/tenant.ts

  const documents = await prisma.document.findMany({
    where: { startupId: startup.id }
  })

  return <DocumentList documents={documents} />
}
```

### Tenant Store Usage
```typescript
const { currentStartupId, setCurrentStartup, startups } = useTenantStore()
```

## Documentation

Full documentation is in the `docs/` folder:
- **architecture.md**: Complete technical architecture, database schema, API design
- **prd.md**: Product requirements, user stories, success criteria
- **epics.md**: Development epics broken down into stories and tasks
- **sitemap.md**: Full application sitemap and page structure

**Always reference these docs** when implementing new features to ensure alignment with the planned architecture and requirements.

## Notes for AI Assistants

- This is a **multi-tenant B2B SaaS platform** - tenant isolation is critical
- Every database query for tenant-scoped resources MUST filter by `startupId`
- RBAC checks are mandatory on all protected routes and API endpoints
- The codebase is currently minimal - refer to `docs/architecture.md` for the complete planned structure
- When adding new features, follow the patterns described in architecture.md
- Prisma schema in docs/architecture.md is the source of truth for data model

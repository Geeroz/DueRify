# DueRify - Architecture Document

**Author:** Gump
**Date:** 2025-11-17
**Version:** 2.0

---

## Executive Summary

DueRify is a greenfield Next.js application built from scratch for startup portfolio management. The architecture implements multi-tenant data isolation, document management, readiness assessment systems, and role-based access control specific to the incubator ecosystem.

The system uses a **monolithic Next.js application** with **PostgreSQL multi-tenancy** (tenant-per-row pattern), **Vercel Blob** for document storage, and **role-based access control** with four distinct roles: INCUBATOR_ADMIN, STARTUP_ADMIN, STARTUP_USER, and INVESTOR_VIEWER.

**Key Architectural Decisions:**
- Next.js 14 App Router with Server Components
- Multi-tenant architecture using startupId in all data tables
- Document storage with Vercel Blob + PostgreSQL metadata
- Server-side authorization checks at every API endpoint
- TanStack Query for server state management
- Zustand for client-side state (tenant context, UI state)
- Recharts for data visualization
- React-PDF for document generation
- QR code generation with qrcode library

---

## Project Initialization

**Create New Next.js Project:**

```bash
# Create new Next.js 14 app with TypeScript
npx create-next-app@latest duerify --typescript --tailwind --app --src-dir=false

# Navigate to project
cd duerify

# Install all dependencies
npm install @prisma/client prisma @tanstack/react-query zustand next-auth @auth/prisma-adapter bcryptjs zod react-hook-form @hookform/resolvers @vercel/blob resend date-fns recharts qrcode @react-pdf/renderer react-dropzone lucide-react

# Install dev dependencies
npm install --save-dev @types/bcryptjs @types/qrcode

# Install shadcn/ui
npx shadcn-ui@latest init

# Add shadcn components as needed
npx shadcn-ui@latest add button card input form dialog alert-dialog dropdown-menu select checkbox switch tabs accordion

# Initialize Prisma
npx prisma init

# Set up environment variables
cp .env.example .env.local

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Run development server
npm run dev
```

---

## Technology Stack

### Frontend

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| Next.js | 14.x | React framework with App Router | https://nextjs.org |
| TypeScript | 5.x | Type safety | https://typescriptlang.org |
| Tailwind CSS | 4.x | Utility-first styling | https://tailwindcss.com |
| shadcn/ui | Latest | UI component library (Radix UI) | https://ui.shadcn.com |
| Lucide React | Latest | Icon library | https://lucide.dev |
| TanStack Query | 5.x | Server state management | https://tanstack.com/query |
| Zustand | 4.x | Client state management | https://zustand-demo.pmnd.rs |
| React Hook Form | 7.x | Form handling | https://react-hook-form.com |
| Zod | 3.x | Schema validation | https://zod.dev |
| Recharts | 2.x | Data visualization | https://recharts.org |
| React Dropzone | 14.x | File upload UI | https://react-dropzone.js.org |

### Backend

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| Next.js API Routes | 14.x | RESTful API | https://nextjs.org/docs/app/building-your-application/routing/route-handlers |
| Prisma | 5.x | Database ORM | https://prisma.io |
| PostgreSQL (Neon) | 15+ | Database | https://neon.tech |
| NextAuth.js | 5.x | Authentication | https://next-auth.js.org |
| bcryptjs | 2.x | Password hashing | https://github.com/dcodeIO/bcrypt.js |
| Vercel Blob | Latest | File storage | https://vercel.com/docs/storage/vercel-blob |
| Resend | 3.x | Email delivery | https://resend.com |

### Utilities

| Technology | Version | Purpose |
|------------|---------|---------|
| date-fns | 4.x | Date formatting |
| qrcode | Latest | QR code generation |
| @react-pdf/renderer | Latest | PDF generation |

### Infrastructure

| Service | Purpose |
|---------|---------|
| Vercel | Hosting & deployment |
| Neon | PostgreSQL database (serverless) |
| Vercel Blob | File storage with CDN |
| Vercel Analytics | Performance monitoring |

---

## Project Structure

```
duerify/
├── app/                                # Next.js App Router
│   ├── (auth)/                        # Auth-related pages (login, signup)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   └── reset-password/
│   │       └── page.tsx
│   ├── (public)/                      # Public marketing pages
│   │   ├── page.tsx                   # Home page
│   │   ├── about/
│   │   ├── features/
│   │   ├── pricing/
│   │   ├── contact/
│   │   └── one-pager/
│   │       └── [slug]/
│   │           └── page.tsx           # Public one-pager view
│   ├── (dashboard)/                   # Protected dashboard routes
│   │   ├── layout.tsx                 # Dashboard shell with sidebar
│   │   ├── dashboard/
│   │   │   └── page.tsx               # Main dashboard
│   │   ├── documents/
│   │   │   └── page.tsx               # Document management
│   │   ├── one-pager/
│   │   │   └── page.tsx               # One-pager editor
│   │   ├── ide-assessment/
│   │   │   ├── page.tsx               # Assessment overview
│   │   │   └── [dimension]/
│   │   │       └── page.tsx           # Individual assessment
│   │   ├── portfolio/                 # Incubator admin only
│   │   │   ├── page.tsx               # Portfolio dashboard
│   │   │   └── analytics/
│   │   │       └── page.tsx
│   │   ├── analytics/
│   │   │   └── page.tsx               # Analytics dashboard
│   │   ├── settings/
│   │   │   ├── page.tsx               # Profile settings
│   │   │   ├── company/
│   │   │   ├── team/
│   │   │   ├── investors/
│   │   │   └── notifications/
│   │   └── support/
│   │       └── page.tsx               # Help & support
│   └── api/                           # API routes
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts           # NextAuth configuration
│       ├── startups/
│       │   ├── route.ts               # GET all, POST create
│       │   └── [id]/
│       │       └── route.ts           # GET, PUT, DELETE
│       ├── documents/
│       │   ├── route.ts               # GET all, POST upload
│       │   ├── [id]/
│       │   │   ├── route.ts           # GET, PUT, DELETE
│       │   │   └── verify/
│       │   │       └── route.ts       # POST verify status
│       │   └── upload-url/
│       │       └── route.ts           # GET presigned URL
│       ├── one-pagers/
│       │   ├── route.ts               # GET all, POST create
│       │   └── [id]/
│       │       ├── route.ts           # GET, PUT, DELETE
│       │       ├── pdf/
│       │       │   └── route.ts       # GET generate PDF
│       │       └── qr/
│       │           └── route.ts       # GET generate QR
│       ├── assessments/
│       │   ├── route.ts               # GET all, POST create
│       │   └── [id]/
│       │       └── route.ts           # GET, PUT
│       ├── users/
│       │   ├── route.ts               # GET all, POST create
│       │   ├── [id]/
│       │   │   └── route.ts           # GET, PUT, DELETE
│       │   └── invite/
│       │       └── route.ts           # POST send invitation
│       ├── team/
│       │   ├── route.ts               # GET team members
│       │   └── [id]/
│       │       └── route.ts           # PUT update, DELETE remove
│       └── investors/
│           ├── grant/
│           │   └── route.ts           # POST grant access
│           └── export/
│               └── route.ts           # GET export data
├── components/                        # React components
│   ├── ui/                           # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── form.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── dashboard-shell.tsx       # Dashboard layout wrapper
│   │   ├── sidebar.tsx               # Dashboard sidebar
│   │   ├── account-switcher.tsx     # Multi-startup switcher
│   │   └── header.tsx                # Top navigation
│   ├── auth/
│   │   ├── login-form.tsx
│   │   ├── signup-form.tsx
│   │   └── password-reset.tsx
│   ├── documents/
│   │   ├── document-list.tsx
│   │   ├── document-upload.tsx
│   │   ├── document-card.tsx
│   │   ├── verification-badge.tsx
│   │   └── document-filters.tsx
│   ├── one-pager/
│   │   ├── one-pager-editor.tsx
│   │   ├── one-pager-preview.tsx
│   │   ├── one-pager-pdf.tsx
│   │   └── share-modal.tsx
│   ├── assessments/
│   │   ├── radar-chart.tsx           # Readiness radar chart
│   │   ├── assessment-form.tsx
│   │   ├── dimension-card.tsx
│   │   └── recommendations-panel.tsx
│   ├── portfolio/
│   │   ├── startup-grid.tsx
│   │   ├── startup-card.tsx
│   │   └── portfolio-filters.tsx
│   ├── analytics/
│   │   ├── metric-card.tsx
│   │   ├── activity-feed.tsx
│   │   └── performance-charts.tsx
│   ├── team/
│   │   ├── team-list.tsx
│   │   ├── invite-member-modal.tsx
│   │   └── change-role-dropdown.tsx
│   ├── investors/
│   │   ├── grant-access-modal.tsx
│   │   └── investor-startup-view.tsx
│   ├── settings/
│   │   ├── profile-form.tsx
│   │   ├── company-form.tsx
│   │   ├── billing-info.tsx
│   │   └── privacy-form.tsx
│   └── marketing/
│       ├── hero.tsx
│       ├── feature-cards.tsx
│       ├── testimonials.tsx
│       ├── partners-grid.tsx
│       └── pricing-card.tsx
├── lib/                              # Utility libraries
│   ├── prisma.ts                     # Prisma client singleton
│   ├── auth.ts                       # NextAuth configuration
│   ├── auth-helpers.ts               # Session utilities
│   ├── rbac.ts                       # Role-based access control
│   ├── tenant.ts                     # Multi-tenancy utilities
│   ├── blob.ts                       # Vercel Blob helpers
│   ├── email.ts                      # Resend email client
│   ├── pdf-generator.ts              # PDF generation
│   ├── qr-generator.ts               # QR code generation
│   ├── validation.ts                 # Shared Zod schemas
│   ├── notifications.ts              # Notification system
│   └── utils.ts                      # General utilities
├── lib/stores/                       # Zustand stores
│   └── tenant-store.ts               # Current tenant context
├── lib/assessments/                  # Assessment logic
│   ├── questions.ts                  # Question definitions
│   ├── scoring.ts                    # Scoring algorithm
│   └── recommendations.ts            # Recommendation engine
├── types/                            # TypeScript type definitions
│   ├── database.ts                   # Prisma-generated types
│   ├── api.ts                        # API request/response types
│   ├── auth.ts                       # Auth-related types
│   └── index.ts                      # Shared types
├── middleware.ts                     # Next.js middleware (auth + tenant)
├── prisma/
│   ├── schema.prisma                 # Database schema
│   ├── seed.ts                       # Database seeding
│   └── migrations/                   # Prisma migrations
├── public/                           # Static assets
│   ├── images/
│   └── fonts/
├── emails/                           # Email templates
│   ├── team-invitation.tsx
│   ├── document-uploaded.tsx
│   └── assessment-completed.tsx
├── .env.local                        # Environment variables (not committed)
├── .env.example                      # Environment template
├── next.config.js                    # Next.js configuration
├── tailwind.config.ts                # Tailwind configuration
├── components.json                   # shadcn/ui configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Dependencies and scripts
└── README.md                         # Project documentation
```

---

## Data Architecture

### Complete Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// USER & AUTHENTICATION
// ============================================================================

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?   // For email/password auth
  role          Role      @default(STARTUP_USER)

  // Relations
  accounts      Account[]
  sessions      Session[]
  startups      StartupUser[]      // Many-to-many with Startup
  documents     Document[]         @relation("DocumentUploader")
  auditLogs     AuditLog[]
  investorGrants InvestorGrant[]   @relation("InvestorUser")

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@map("users")
}

enum Role {
  INCUBATOR_ADMIN
  STARTUP_ADMIN
  STARTUP_USER
  INVESTOR_VIEWER
}

model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String?
  access_token       String?
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String?
  session_state      String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

// ============================================================================
// STARTUP & MULTI-TENANCY
// ============================================================================

model Startup {
  id          String   @id @default(cuid())
  name        String
  domain      String?  @unique
  industry    String?
  description String?
  logoUrl     String?
  website     String?

  // Relations
  users           StartupUser[]
  documents       Document[]
  onePagers       OnePager[]
  assessments     Assessment[]
  investorGrants  InvestorGrant[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("startups")
}

model StartupUser {
  id        String   @id @default(cuid())
  userId    String
  startupId String
  role      Role     @default(STARTUP_USER)

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  startup   Startup  @relation(fields: [startupId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, startupId])
  @@index([startupId])
  @@map("startup_users")
}

model InvestorGrant {
  id         String   @id @default(cuid())
  investorId String
  startupId  String
  grantedBy  String   // userId who granted access

  investor   User     @relation("InvestorUser", fields: [investorId], references: [id], onDelete: Cascade)
  startup    Startup  @relation(fields: [startupId], references: [id], onDelete: Cascade)

  createdAt  DateTime @default(now())

  @@unique([investorId, startupId])
  @@index([investorId])
  @@index([startupId])
  @@map("investor_grants")
}

// ============================================================================
// DOCUMENT MANAGEMENT
// ============================================================================

model Document {
  id                 String   @id @default(cuid())
  startupId          String
  startup            Startup  @relation(fields: [startupId], references: [id], onDelete: Cascade)

  filename           String
  blobUrl            String   // Vercel Blob URL
  blobKey            String   // For deletion
  fileSize           Int      // Bytes
  mimeType           String

  category           String   // Financial, Legal, Product, Team, Market Research, Custom
  customCategory     String?  // If category = "Custom"
  verificationStatus String   @default("PENDING") // PENDING, VERIFIED, REJECTED
  verificationNotes  String?

  uploadedById       String
  uploadedBy         User     @relation("DocumentUploader", fields: [uploadedById], references: [id])

  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  @@index([startupId, category])
  @@index([startupId, verificationStatus])
  @@index([uploadedById])
  @@map("documents")
}

// ============================================================================
// ONE-PAGER
// ============================================================================

model OnePager {
  id             String   @id @default(cuid())
  startupId      String
  startup        Startup  @relation(fields: [startupId], references: [id], onDelete: Cascade)

  slug           String   @unique  // Public URL slug
  isPublic       Boolean  @default(true)

  // Content sections
  companyName    String
  problemSection String?
  solutionSection String?
  productSection String?
  teamSection    String?
  contactInfo    String?

  totalViews     Int      @default(0)

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  views          OnePagerView[]

  @@index([startupId])
  @@index([slug])
  @@map("one_pagers")
}

model OnePagerView {
  id          String   @id @default(cuid())
  onePagerId  String
  onePager    OnePager @relation(fields: [onePagerId], references: [id], onDelete: Cascade)

  viewerIp    String?
  viewerAgent String?
  referrer    String?

  viewedAt    DateTime @default(now())

  @@index([onePagerId])
  @@map("one_pager_views")
}

// ============================================================================
// IDE READINESS ASSESSMENT
// ============================================================================

model Assessment {
  id        String   @id @default(cuid())
  startupId String
  startup   Startup  @relation(fields: [startupId], references: [id], onDelete: Cascade)

  // Scores (0-100)
  trlScore  Float?   // Technology Readiness Level
  mrlScore  Float?   // Manufacturing Readiness Level
  crlScore  Float?   // Commercial Readiness Level
  brlScore  Float?   // Business Readiness Level

  overallScore Float? // Calculated average

  // Raw assessment data (JSON)
  trlData   Json?
  mrlData   Json?
  crlData   Json?
  brlData   Json?

  // Recommendations
  recommendations Json?

  completedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([startupId, createdAt])
  @@map("assessments")
}

// ============================================================================
// TEAM MANAGEMENT
// ============================================================================

model Invitation {
  id        String   @id @default(cuid())
  email     String
  startupId String
  role      Role
  token     String   @unique
  expires   DateTime

  createdAt DateTime @default(now())

  @@index([email])
  @@index([token])
  @@map("invitations")
}

model NotificationPreference {
  id     String  @id @default(cuid())
  userId String
  type   String  // document_activities, assessment_completions, team_changes, etc.
  enabled Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, type])
  @@map("notification_preferences")
}

// ============================================================================
// AUDIT LOGGING
// ============================================================================

model AuditLog {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  action     String   // view, download, upload, delete, etc.
  resource   String   // documents, one_pager, assessment, etc.
  resourceId String?

  startupId  String?  // Optional tenant context

  ipAddress  String?
  userAgent  String?

  createdAt  DateTime @default(now())

  @@index([userId, createdAt])
  @@index([startupId, createdAt])
  @@index([resource, resourceId])
  @@map("audit_logs")
}

// ============================================================================
// DASHBOARD METRICS (cached aggregates)
// ============================================================================

model DashboardMetric {
  id        String   @id @default(cuid())
  startupId String

  metricKey String   // document_count, verified_count, readiness_score, etc.
  value     Float

  calculatedAt DateTime @default(now())

  @@unique([startupId, metricKey])
  @@index([startupId])
  @@map("dashboard_metrics")
}

// ============================================================================
// SUPPORT & HELP
// ============================================================================

model SupportTicket {
  id          String   @id @default(cuid())
  userId      String
  subject     String
  description String
  priority    String   // LOW, MEDIUM, HIGH
  status      String   @default("OPEN") // OPEN, IN_PROGRESS, RESOLVED, CLOSED

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
  @@index([status])
  @@map("support_tickets")
}

// ============================================================================
// PUBLIC WEBSITE
// ============================================================================

model ContactInquiry {
  id      String   @id @default(cuid())
  name    String
  email   String
  company String?
  message String

  createdAt DateTime @default(now())

  @@map("contact_inquiries")
}

// ============================================================================
// BILLING (Placeholder for MVP)
// ============================================================================

model Subscription {
  id        String   @id @default(cuid())
  startupId String
  plan      String   // e.g., "STARTUP_PLAN"
  status    String   // ACTIVE, CANCELLED, EXPIRED
  amount    Int      // In cents (THB)
  interval  String   // ANNUAL, MONTHLY

  currentPeriodStart DateTime
  currentPeriodEnd   DateTime

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([startupId])
  @@map("subscriptions")
}
```

---

## Multi-Tenancy Architecture

### Tenant-Per-Row Pattern

Every data table includes a `startupId` foreign key to isolate data by startup.

**Implementation Example:**

```typescript
// lib/tenant.ts
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function getCurrentStartup() {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  // Get current startup from session or default to first startup
  const startupUsers = await prisma.startupUser.findMany({
    where: { userId: session.user.id },
    include: { startup: true }
  })

  if (startupUsers.length === 0) {
    throw new Error('No startup access')
  }

  // Return first startup (or from session context)
  return startupUsers[0].startup
}

export async function checkUserStartupAccess(userId: string, startupId: string): Promise<boolean> {
  const startupUser = await prisma.startupUser.findUnique({
    where: {
      userId_startupId: { userId, startupId }
    }
  })

  return startupUser !== null
}
```

### Client-Side Tenant Context (Zustand)

```typescript
// lib/stores/tenant-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Startup {
  id: string
  name: string
  logoUrl: string | null
}

interface TenantState {
  currentStartupId: string | null
  startups: Startup[]

  setCurrentStartup: (startupId: string) => void
  loadStartups: () => Promise<void>
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      currentStartupId: null,
      startups: [],

      setCurrentStartup: (startupId) => set({ currentStartupId: startupId }),

      loadStartups: async () => {
        const response = await fetch('/api/users/me/startups')
        const startups = await response.json()
        set({
          startups,
          currentStartupId: startups[0]?.id || null
        })
      },
    }),
    {
      name: 'tenant-storage',
    }
  )
)
```

---

## Authentication & Authorization

### NextAuth.js Configuration

```typescript
// lib/auth.ts
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import type { Role } from '@prisma/client'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' }
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user || !user.password) return null

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as Role
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    }
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
})
```

### RBAC Middleware

```typescript
// lib/rbac.ts
import type { Role } from '@prisma/client'

export function checkPermission(
  userRole: Role,
  action: string,
  resource: string,
  resourceOwnerId?: string,
  userId?: string
): boolean {
  // Incubator admins can do anything
  if (userRole === 'INCUBATOR_ADMIN') return true

  // Startup admins can do anything within their startup
  if (userRole === 'STARTUP_ADMIN' && resourceOwnerId === userId) return true

  // Startup users have limited permissions
  if (userRole === 'STARTUP_USER') {
    const allowedActions = ['read', 'upload', 'create']
    return allowedActions.includes(action)
  }

  // Investors can only read
  if (userRole === 'INVESTOR_VIEWER') {
    return action === 'read'
  }

  return false
}
```

---

## API Design

### Standard Response Format

```typescript
// types/api.ts
export interface SuccessResponse<T> {
  data: T
  message?: string
}

export interface ErrorResponse {
  error: string
  field?: string
  code?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}
```

### Example API Route

```typescript
// app/api/documents/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const CreateDocumentSchema = z.object({
  filename: z.string(),
  blobUrl: z.string().url(),
  blobKey: z.string(),
  fileSize: z.number().int().min(1).max(50 * 1024 * 1024),
  mimeType: z.string(),
  category: z.string(),
  startupId: z.string(),
})

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const startupId = searchParams.get('startupId')

  if (!startupId) {
    return NextResponse.json({ error: 'startupId required' }, { status: 400 })
  }

  // Check access
  const hasAccess = await checkUserStartupAccess(session.user.id, startupId)
  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const documents = await prisma.document.findMany({
    where: { startupId },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json({ data: documents })
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = CreateDocumentSchema.parse(body)

    const document = await prisma.document.create({
      data: {
        ...validated,
        uploadedById: session.user.id
      }
    })

    return NextResponse.json({ data: document }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', field: error.issues[0].path.join('.') },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:pass@host:5432/duerify"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Vercel Blob (File Storage)
BLOB_READ_WRITE_TOKEN="vercel_blob_token"

# Resend (Email)
RESEND_API_KEY="re_your_key"
RESEND_FROM_EMAIL="noreply@duerify.com"

# Environment
NODE_ENV="development"
```

---

## Deployment

### Vercel Deployment

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/duerify.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Connect GitHub repository to Vercel
   - Configure environment variables
   - Deploy

3. **Set up Neon Database**
   - Create Neon project
   - Copy connection string
   - Add to Vercel environment variables

4. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   ```

---

## Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts"
  }
}
```

---

_This architecture document provides a complete technical specification for building DueRify from scratch using Next.js 14, Tailwind CSS, shadcn/ui, and modern web technologies._

_Version 2.0 - Built from scratch_
_Date: 2025-11-17_
_For: Gump_

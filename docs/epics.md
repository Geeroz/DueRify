# DueRify - Epic & Story Breakdown

**Project:** DueRify - Startup Portfolio Management Platform
**Author:** Gump
**Date:** 2025-11-17
**Version:** 1.0
**Based on:** PRD v1.0, Architecture v1.0

---

## Epic Overview

This document breaks down the DueRify PRD into implementable epics and user stories. Each epic delivers tangible user value and groups related functionality into deployable increments.

### Epic Summary

| Epic ID | Epic Name | User Value | FR Count | Stories |
|---------|-----------|------------|----------|---------|
| EPIC-1 | Project Foundation & Setup | Development infrastructure ready | N/A | 3 |
| EPIC-2 | User Authentication & Multi-Startup Access | Users can securely access multiple startups | 7 (FR1-7) | 5 |
| EPIC-3 | Incubator Portfolio Dashboard | Incubator admins manage entire portfolio | 7 (FR8-14) | 6 |
| EPIC-4 | Document Management System | Startups organize all due diligence docs | 13 (FR15-27) | 8 |
| EPIC-5 | One-Pager Creation & Sharing | Startups create shareable profiles | 11 (FR28-38) | 7 |
| EPIC-6 | IDE Readiness Assessment | Startups assess and track readiness | 9 (FR39-47) | 6 |
| EPIC-7 | Main Dashboard & Analytics | Users see relevant metrics at a glance | 8 (FR48-55) | 5 |
| EPIC-8 | Team & User Management | Startups manage team members | 8 (FR56-63) | 6 |
| EPIC-9 | Investor Access Portal | Investors view verified startup data | 6 (FR64-69) | 4 |
| EPIC-10 | Settings & Configuration | Users manage profiles and preferences | 8 (FR70-77) | 5 |
| EPIC-11 | Public Marketing Website | Visitors learn about and sign up for DueRify | 6 (FR78-83) | 6 |
| **Post-MVP** | Growth Features | Advanced functionality for scale | 12 (FR84-95) | TBD |

**Total MVP Stories:** 61 stories covering FR1-FR83 (83 functional requirements)

---

## EPIC-1: Project Foundation & Setup

**User Value:** Development infrastructure is configured and ready for feature implementation

**Description:** This epic establishes the technical foundation by creating a new Next.js project from scratch, installing all required dependencies, setting up the database schema, and configuring the multi-tenant architecture. While not directly user-facing, it enables all subsequent features.

**Success Criteria:**
- ✅ Next.js project created and all dependencies installed
- ✅ Database schema deployed with all models
- ✅ Multi-tenant utilities implemented and tested
- ✅ RBAC middleware configured for 4-role system
- ✅ Development environment running successfully

**Prerequisites:** None (foundation epic)

---

### Story 1.1: Create Next.js Project and Install Dependencies

**As a** developer
**I want** to create a new Next.js project and install all required dependencies
**So that** I have the foundation to build features

**Acceptance Criteria:**

```gherkin
Given I need to create a new Next.js 14 project from scratch
When I run create-next-app and install all dependencies
Then a new Next.js application is created with TypeScript and Tailwind CSS
And all core dependencies are installed (Next.js 14.x, Prisma 5.x, NextAuth 5.x, TanStack Query, Zustand)
And shadcn/ui is initialized with necessary components
And DueRify-specific packages are installed (recharts, qrcode, @react-pdf/renderer, react-dropzone, lucide-react)
And development server starts successfully on localhost:3000
And shadcn/ui components can be added (button, card, form, dialog, etc.)
```

**Technical Notes:**
- Create project: `npx create-next-app@latest duerify --typescript --tailwind --app`
- Install core: `npm install @prisma/client prisma @tanstack/react-query zustand next-auth @auth/prisma-adapter bcryptjs zod react-hook-form @hookform/resolvers @vercel/blob resend date-fns`
- Install UI: `npm install recharts qrcode @react-pdf/renderer react-dropzone lucide-react`
- Install dev: `npm install --save-dev @types/bcryptjs @types/qrcode`
- Initialize shadcn: `npx shadcn-ui@latest init`
- Add components: `npx shadcn-ui@latest add button card input form dialog alert-dialog dropdown-menu select checkbox switch tabs accordion`
- Initialize Prisma: `npx prisma init`
- Verify: `npm run dev`

**FR Mapping:** Infrastructure setup (enables all FRs)

**Files to Create/Modify:**
- `package.json` - All dependencies
- `.env.local` - Copy from `.env.example`
- `components.json` - shadcn/ui configuration
- `tailwind.config.ts` - Tailwind configuration
- `tsconfig.json` - TypeScript configuration

**Prerequisites:** None

---

### Story 1.2: Create Multi-Tenant Database Schema

**As a** developer
**I want** to define the complete Prisma schema with multi-tenant data models
**So that** the application can isolate data by startup

**Acceptance Criteria:**

```gherkin
Given the architecture document's complete Prisma schema
When I update prisma/schema.prisma with all models
Then the schema includes all core models (User, Startup, StartupUser, InvestorGrant, Document, OnePager, Assessment, AuditLog, DashboardMetric)
And all tables have proper tenant isolation with startupId foreign keys
And indexes are defined for performance (startupId, category, verificationStatus)
And the Role enum includes all 4 roles (INCUBATOR_ADMIN, STARTUP_ADMIN, STARTUP_USER, INVESTOR_VIEWER)
And running `npx prisma db push` succeeds
And running `npx prisma studio` shows all tables
```

**Technical Notes:**
- Copy complete schema from `docs/architecture.md` section "Core Data Models"
- Ensure cascading deletes are configured (onDelete: Cascade)
- Verify all indexes match architecture spec
- Test multi-tenant queries with sample data

**FR Mapping:** Infrastructure setup (enables FR8-69)

**Files to Create/Modify:**
- `prisma/schema.prisma` - Complete schema with 11+ models

**Prerequisites:** Story 1.1

---

### Story 1.3: Implement Multi-Tenancy and RBAC Utilities

**As a** developer
**I want** to create reusable utilities for tenant context and role-based access control
**So that** all features can consistently enforce data isolation and permissions

**Acceptance Criteria:**

```gherkin
Given the multi-tenant architecture pattern (tenant-per-row)
When I implement tenant and RBAC utilities
Then lib/tenant.ts exports functions to get current startup context
And lib/rbac.ts exports Role enum and checkPermission() function
And checkPermission() correctly enforces 4-role hierarchy
And middleware.ts validates tenant access on protected routes
And tenant context is available in all API routes
And unauthorized access returns 403 Forbidden
And missing tenant context returns 400 Bad Request
```

**Technical Notes:**
- Create `lib/tenant.ts` with `getCurrentStartupId()`, `checkUserStartupAccess()`
- Create `lib/rbac.ts` with `Role` enum, `checkPermission()` function
- Update `middleware.ts` to validate tenant access
- Implement Zustand store for client-side tenant context (from architecture)
- Write unit tests for permission logic

**FR Mapping:** Infrastructure setup (enables FR8-69)

**Files to Create/Modify:**
- `lib/tenant.ts` - Tenant utilities
- `lib/rbac.ts` - RBAC utilities
- `lib/stores/tenant-store.ts` - Zustand tenant store
- `middleware.ts` - Tenant validation middleware

**Prerequisites:** Story 1.2

---

## EPIC-2: User Authentication & Multi-Startup Access

**User Value:** Users can securely log in with email/password or Google OAuth and seamlessly switch between multiple startup contexts

**Description:** This epic implements the authentication system using NextAuth.js with both credentials and Google OAuth providers, along with the account switcher that allows users to switch between different startups they have access to.

**Success Criteria:**
- ✅ Users can sign up with email/password
- ✅ Users can log in with email/password or Google OAuth
- ✅ Users can reset forgotten passwords
- ✅ Users can update their profile information
- ✅ Users can switch between multiple startup contexts
- ✅ Current startup context is clearly displayed and persisted

**FR Coverage:** FR1, FR2, FR3, FR4, FR5, FR6, FR7

**Prerequisites:** EPIC-1 (foundation must be complete)

---

### Story 2.1: Configure NextAuth with Email/Password and Google OAuth

**As a** user
**I want** to sign up and log in with email/password or my Google account
**So that** I can securely access the platform

**Acceptance Criteria:**

```gherkin
Given the NextAuth configuration in lib/auth.ts
When I implement CredentialsProvider and GoogleProvider
Then users can sign up with email and password (FR1)
And passwords are hashed with bcryptjs before storage
And users can log in with email and password (FR2)
And users can log in with Google OAuth (FR1, FR2)
And sessions are persisted using JWT strategy
And user role is included in session object
And authentication works on both login and signup pages
And unauthorized users are redirected to /login
```

**Technical Notes:**
- Update `lib/auth.ts` with both providers (using NextAuth.js configuration)
- Configure Google OAuth credentials in .env.local (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
- Use Prisma adapter for session storage
- Store role in JWT token for authorization
- API route: `/api/auth/[...nextauth]/route.ts`

**FR Mapping:** FR1 (account creation), FR2 (login)

**Files to Create/Modify:**
- `lib/auth.ts` - NextAuth configuration
- `app/api/auth/[...nextauth]/route.ts` - NextAuth handlers
- `.env.local` - Add Google OAuth credentials

**Prerequisites:** Story 1.3

---

### Story 2.2: Build Login and Signup Pages

**As a** visitor
**I want** to access login and signup pages with email/password and Google OAuth options
**So that** I can create an account or access my existing account

**Acceptance Criteria:**

```gherkin
Given the authentication UI components
When I create login and signup pages
Then /login page displays email/password form and Google OAuth button (FR2)
And /signup page displays registration form with account type selection (FR1)
And account types include Startup User, Incubator Admin, and Investor Viewer
And form validation shows clear error messages
And successful login redirects to /dashboard
And successful signup creates user account and redirects to /dashboard
And Google OAuth button triggers OAuth flow
And "Forgot Password" link is visible on login page
```

**Technical Notes:**
- Create `app/(auth)/login/page.tsx`
- Create `app/(auth)/signup/page.tsx`
- Create `components/auth/login-form.tsx` (use react-hook-form + Zod)
- Create `components/auth/signup-form.tsx`
- Use shadcn/ui components (Button, Input, Card)
- Implement role selection in signup (dropdown for STARTUP_USER, INCUBATOR_ADMIN, INVESTOR_VIEWER)

**FR Mapping:** FR1 (create accounts), FR2 (login)

**Files to Create/Modify:**
- `app/(auth)/login/page.tsx`
- `app/(auth)/signup/page.tsx`
- `components/auth/login-form.tsx`
- `components/auth/signup-form.tsx`

**Prerequisites:** Story 2.1

---

### Story 2.3: Implement Password Reset Flow

**As a** user
**I want** to reset my password if I forget it
**So that** I can regain access to my account

**Acceptance Criteria:**

```gherkin
Given the password reset functionality
When I implement the forgot password flow
Then clicking "Forgot Password" on login page navigates to /forgot-password (FR3)
And entering email sends password reset link via Resend
And email contains secure token with 1-hour expiration
And clicking reset link navigates to /reset-password?token=xxx
And entering new password (with confirmation) updates password
And password is re-hashed with bcryptjs
And successful reset redirects to login with success message
And expired tokens show clear error message
```

**Technical Notes:**
- Create `app/(auth)/forgot-password/page.tsx`
- Create `app/(auth)/reset-password/page.tsx`
- Create API route: `app/api/auth/forgot-password/route.ts`
- Create API route: `app/api/auth/reset-password/route.ts`
- Use Resend for email delivery (using Resend library)
- Store reset tokens in `PasswordResetToken` table (add to schema)
- Token expires after 1 hour

**FR Mapping:** FR3 (password reset)

**Files to Create/Modify:**
- `app/(auth)/forgot-password/page.tsx`
- `app/(auth)/reset-password/page.tsx`
- `app/api/auth/forgot-password/route.ts`
- `app/api/auth/reset-password/route.ts`
- `prisma/schema.prisma` - Add PasswordResetToken model
- Email templates for reset link

**Prerequisites:** Story 2.1

---

### Story 2.4: Build Profile Settings Page

**As a** logged-in user
**I want** to view and update my profile information
**So that** my account details are accurate

**Acceptance Criteria:**

```gherkin
Given the profile settings page
When I navigate to /dashboard/settings
Then I see a form with my current profile data (name, email, photo) (FR4)
And I can update my name
And I can upload a profile photo (using Vercel Blob)
And I can change my email (with re-verification)
And saving changes updates the User record in database
And success message is displayed after update
And profile photo is displayed in header/navigation
And changes are reflected across the application
```

**Technical Notes:**
- Create `app/(dashboard)/settings/page.tsx`
- Use react-hook-form for form handling
- Use Vercel Blob for profile photo upload
- API route: `app/api/users/[id]/route.ts` (PUT)
- Display current user data from session
- Validate email uniqueness

**FR Mapping:** FR4 (update profile)

**Files to Create/Modify:**
- `app/(dashboard)/settings/page.tsx`
- `app/api/users/[id]/route.ts` (PUT endpoint)
- `components/settings/profile-form.tsx`

**Prerequisites:** Story 2.1

---

### Story 2.5: Implement Account Switcher for Multi-Startup Access

**As a** user with access to multiple startups
**I want** to easily switch between different startup contexts
**So that** I can manage multiple startups efficiently

**Acceptance Criteria:**

```gherkin
Given a user belongs to multiple startups (via StartupUser table)
When I implement the account switcher component
Then the header displays current startup name and logo (FR7)
And clicking the header opens a dropdown with all accessible startups (FR6)
And each startup shows name, logo, and role
And selecting a different startup switches the context (FR6)
And the new context persists across page navigations
And the new context persists across browser sessions (localStorage)
And all data queries are scoped to the current startup
And switching context triggers data refresh
And users with only one startup see the name but no switcher dropdown
```

**Technical Notes:**
- Create `components/layout/account-switcher.tsx` (dropdown in header)
- Use Zustand store from Story 1.3 for tenant context
- Store `currentStartupId` in localStorage (persist middleware)
- API route: `app/api/users/me/startups/route.ts` (GET list of user's startups)
- Load startups on initial app load
- Add visual indicator when context switches (toast notification)
- Update all API calls to include `startupId` query param

**FR Mapping:** FR5 (assigned to multiple startups), FR6 (switch contexts), FR7 (display current context)

**Files to Create/Modify:**
- `components/layout/account-switcher.tsx`
- `app/api/users/me/startups/route.ts`
- `lib/stores/tenant-store.ts` - Update with switcher logic
- `components/layout/dashboard-shell.tsx` - Include account switcher in header

**Prerequisites:** Story 2.1, Story 1.3

---

## EPIC-3: Incubator Portfolio Dashboard

**User Value:** Incubator admins can view and manage their entire portfolio of startups at a glance with key metrics and quick actions

**Description:** This epic creates the portfolio management interface exclusively for incubator admins, allowing them to see all startups in their portfolio, add new startups, remove startups, and view portfolio-level analytics.

**Success Criteria:**
- ✅ Incubator admins see portfolio dashboard with all startups
- ✅ Each startup card shows key metrics (readiness, documents, activity)
- ✅ Admins can add new startups to the portfolio
- ✅ Admins can remove startups from the portfolio
- ✅ Admins can view portfolio-level analytics
- ✅ Admins can sort and filter the portfolio view

**FR Coverage:** FR8, FR9, FR10, FR11, FR12, FR13, FR14

**Prerequisites:** EPIC-2 (authentication must work)

---

### Story 3.1: Create Portfolio Dashboard Overview Page

**As an** incubator admin
**I want** to see all my portfolio startups on a dashboard
**So that** I can monitor overall portfolio health at a glance

**Acceptance Criteria:**

```gherkin
Given I am logged in as INCUBATOR_ADMIN
When I navigate to /dashboard/portfolio
Then I see a grid of startup cards for all portfolio startups (FR8, FR13)
And each card displays startup name, logo, and industry
And each card shows key metrics: readiness score, document count, last activity date (FR13)
And cards are sorted by last activity (most recent first)
And empty state is shown if no startups exist
And clicking a card navigates to detailed startup view
And page is accessible only to INCUBATOR_ADMIN role (403 for others)
```

**Technical Notes:**
- Create `app/(dashboard)/portfolio/page.tsx`
- Create `components/portfolio/startup-grid.tsx`
- Create `components/portfolio/startup-card.tsx`
- API route: `app/api/startups/route.ts` (GET all startups for incubator)
- Query includes aggregated metrics (document count, latest assessment)
- Use TanStack Query for data fetching and caching
- Implement role check middleware (INCUBATOR_ADMIN only)

**FR Mapping:** FR8 (view portfolio dashboard), FR13 (startup cards with metrics)

**Files to Create/Modify:**
- `app/(dashboard)/portfolio/page.tsx`
- `components/portfolio/startup-grid.tsx`
- `components/portfolio/startup-card.tsx`
- `app/api/startups/route.ts` (GET endpoint)

**Prerequisites:** Story 2.1 (auth), Story 1.3 (RBAC)

---

### Story 3.2: Build Add Startup Flow

**As an** incubator admin
**I want** to add new startups to my portfolio
**So that** I can track their progress from the beginning

**Acceptance Criteria:**

```gherkin
Given I am on the portfolio dashboard
When I click "Add Startup" button
Then a modal/form opens asking for startup details (FR9)
And required fields include: company name
And optional fields include: domain, industry, description, logo URL
And submitting the form creates a new Startup record
And the new startup appears in the portfolio grid
And I am automatically assigned as a user of that startup (StartupUser record created)
And form validation prevents duplicate domains
And success message is displayed
And modal closes after successful creation
```

**Technical Notes:**
- Create `components/portfolio/add-startup-modal.tsx`
- Use shadcn/ui Dialog component
- Use react-hook-form with Zod validation
- API route: `app/api/startups/route.ts` (POST)
- Create Startup record + StartupUser record (many-to-many)
- Validate domain uniqueness
- Invalidate TanStack Query cache after creation

**FR Mapping:** FR9 (add new startups)

**Files to Create/Modify:**
- `components/portfolio/add-startup-modal.tsx`
- `app/api/startups/route.ts` (POST endpoint)
- Zod schema: `lib/validation.ts` - `CreateStartupSchema`

**Prerequisites:** Story 3.1

---

### Story 3.3: Implement Remove Startup Functionality

**As an** incubator admin
**I want** to remove startups from my portfolio
**So that** I can keep the portfolio current with active startups only

**Acceptance Criteria:**

```gherkin
Given I am viewing a startup card on the portfolio dashboard
When I click the "Remove" or "Delete" action (kebab menu)
Then a confirmation dialog appears warning about data deletion (FR10)
And confirming deletion removes the Startup record
And all related data is cascaded deleted (documents, assessments, etc.)
And the startup card is removed from the grid
And success message is displayed
And canceling the dialog keeps the startup
```

**Technical Notes:**
- Add kebab menu (3-dot icon) to startup cards
- Create `components/portfolio/delete-startup-dialog.tsx`
- Use shadcn/ui AlertDialog for confirmation
- API route: `app/api/startups/[id]/route.ts` (DELETE)
- Prisma cascading deletes handle related records (onDelete: Cascade)
- Invalidate TanStack Query cache after deletion

**FR Mapping:** FR10 (remove startups)

**Files to Create/Modify:**
- `components/portfolio/delete-startup-dialog.tsx`
- `app/api/startups/[id]/route.ts` (DELETE endpoint)
- Update `components/portfolio/startup-card.tsx` - Add kebab menu

**Prerequisites:** Story 3.1

---

### Story 3.4: Create Portfolio Analytics Page

**As an** incubator admin
**I want** to view portfolio-level analytics
**So that** I can understand overall portfolio performance

**Acceptance Criteria:**

```gherkin
Given I am on the portfolio dashboard
When I navigate to the "Analytics" tab or section
Then I see aggregate metrics across all startups (FR11)
And metrics include: total startups, average readiness score, total documents, document completion rate
And I see a chart showing readiness scores distribution
And I see a chart showing document verification status breakdown
And I can view trends over time (e.g., readiness score changes)
And data is filterable by industry or date range
And metrics are cached for performance (dashboard_metrics table)
```

**Technical Notes:**
- Create `app/(dashboard)/portfolio/analytics/page.tsx` or tab in portfolio page
- Create `components/portfolio/portfolio-analytics.tsx`
- Use Recharts for visualizations (bar chart, pie chart)
- API route: `app/api/startups/analytics/route.ts` (GET aggregate data)
- Calculate aggregates from database (or use cached metrics)
- Support date range filtering

**FR Mapping:** FR11 (portfolio-level analytics)

**Files to Create/Modify:**
- `app/(dashboard)/portfolio/analytics/page.tsx`
- `components/portfolio/portfolio-analytics.tsx`
- `app/api/startups/analytics/route.ts`

**Prerequisites:** Story 3.1

---

### Story 3.5: Add Portfolio Report Generation

**As an** incubator admin
**I want** to generate investor-ready portfolio reports
**So that** I can share portfolio performance with stakeholders

**Acceptance Criteria:**

```gherkin
Given I am on the portfolio dashboard
When I click "Generate Report" button
Then I can select report parameters (date range, startups to include, metrics to show) (FR12)
And clicking "Generate" creates a PDF report
And report includes portfolio summary, individual startup metrics, charts
And report is downloadable
And report generation completes within 10 seconds
And success message is displayed with download link
```

**Technical Notes:**
- Create `components/portfolio/generate-report-modal.tsx`
- Use @react-pdf/renderer for PDF generation
- API route: `app/api/startups/reports/route.ts` (POST)
- Include charts as images in PDF (render Recharts to canvas, embed)
- Stream PDF response or return Vercel Blob URL

**FR Mapping:** FR12 (generate portfolio reports)

**Files to Create/Modify:**
- `components/portfolio/generate-report-modal.tsx`
- `app/api/startups/reports/route.ts`
- `lib/pdf-generator.ts` - Portfolio report template

**Prerequisites:** Story 3.1, Story 3.4

---

### Story 3.6: Implement Portfolio Sorting and Filtering

**As an** incubator admin
**I want** to sort and filter my portfolio view
**So that** I can quickly find specific startups or focus on certain criteria

**Acceptance Criteria:**

```gherkin
Given I am viewing the portfolio dashboard
When I use the sort/filter controls
Then I can sort startups by: name, readiness score, document count, last activity date (FR14)
And I can filter by: industry, readiness level (high/medium/low), document completion status
And sorting/filtering updates the grid in real-time
And filter state persists when navigating away and back
And "Clear filters" button resets to default view
And empty state is shown when filters return no results
```

**Technical Notes:**
- Create `components/portfolio/portfolio-filters.tsx`
- Add sort dropdown and filter checkboxes
- Implement client-side filtering and sorting (data already loaded)
- Or implement server-side filtering (query params in API call)
- Store filter state in URL query params for shareability
- Use shadcn/ui Select, Checkbox components

**FR Mapping:** FR14 (sort and filter portfolio)

**Files to Create/Modify:**
- `components/portfolio/portfolio-filters.tsx`
- Update `app/api/startups/route.ts` - Add query param support for filtering
- Update `components/portfolio/startup-grid.tsx` - Integrate filters

**Prerequisites:** Story 3.1

---

## EPIC-4: Document Management System

**User Value:** Startups can securely store, organize, verify, and share all due diligence documents in one centralized location

**Description:** This epic implements the core document management functionality, including upload, categorization, verification status tracking, search/filter, and secure access control. Documents are stored in Vercel Blob with metadata in PostgreSQL.

**Success Criteria:**
- ✅ Users can upload documents via drag-and-drop
- ✅ Documents are organized by predefined and custom categories
- ✅ Users can search and filter documents
- ✅ Authorized users can verify/reject documents
- ✅ Users can download documents with proper access control
- ✅ Document version history is tracked
- ✅ All documents are tenant-isolated by startup

**FR Coverage:** FR15, FR16, FR17, FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR25, FR26, FR27

**Prerequisites:** EPIC-2 (authentication), EPIC-1 (multi-tenancy)

---

### Story 4.1: Build Document Upload Interface

**As a** startup user
**I want** to upload documents via drag-and-drop or file browser
**So that** I can store all my startup documents in one place

**Acceptance Criteria:**

```gherkin
Given I am on the /dashboard/documents page
When I use the document upload component
Then I can drag and drop files onto the upload zone (FR15)
And I can click to open file browser and select files (FR15)
And multiple files can be uploaded simultaneously (up to 20 files)
And each file can be up to 50MB in size
And upload progress bar is displayed for each file
And I can cancel uploads in progress
And after upload, I am prompted to select a category (FR16)
And files are uploaded to Vercel Blob
And Document records are created in database with metadata
And uploaded documents appear in the document list
And error messages are shown for failed uploads or invalid file types
```

**Technical Notes:**
- Create `app/(dashboard)/documents/page.tsx`
- Create `components/documents/document-upload.tsx` (using react-dropzone library)
- Client-side flow: Request presigned URL → Upload to Blob → Create DB record
- API routes:
  - `app/api/documents/upload-url/route.ts` (POST - get presigned URL)
  - `app/api/documents/route.ts` (POST - create document record)
- Validate file size (max 50MB) and MIME types
- Include startupId (from tenant context) in all requests
- Use TanStack Query for mutations

**FR Mapping:** FR15 (upload documents), FR16 (organize into categories), FR26 (secure cloud storage)

**Files to Create/Modify:**
- `app/(dashboard)/documents/page.tsx`
- `components/documents/document-upload.tsx`
- `app/api/documents/upload-url/route.ts`
- `app/api/documents/route.ts` (POST)
- `lib/blob.ts` - Vercel Blob helper functions

**Prerequisites:** Story 2.1 (auth), Story 1.3 (multi-tenancy)

---

### Story 4.2: Implement Document Categorization

**As a** startup user
**I want** to organize documents into categories
**So that** I can easily find related documents

**Acceptance Criteria:**

```gherkin
Given I have uploaded a document
When I select a category for the document
Then predefined categories are available: Financial, Legal, Product/Service, Team, Market Research (FR16)
And I can select "Custom" and enter a custom category name (FR17)
And the document is tagged with the selected category
And documents are filterable by category
And I can change a document's category after upload
And custom categories are saved for future use (per startup)
And category selection is required before upload completes
```

**Technical Notes:**
- Update `components/documents/document-upload.tsx` - Add category selection step
- Create `components/documents/category-selector.tsx` (dropdown with custom input)
- Store category in Document.category field
- Store custom category name in Document.customCategory field
- API route: `app/api/documents/[id]/route.ts` (PUT - update category)
- Load existing custom categories for startup from DB

**FR Mapping:** FR16 (predefined categories), FR17 (custom categories)

**Files to Create/Modify:**
- `components/documents/category-selector.tsx`
- Update `app/api/documents/route.ts` - Handle category in POST
- `app/api/documents/[id]/route.ts` (PUT endpoint)

**Prerequisites:** Story 4.1

---

### Story 4.3: Build Document List with Search and Filters

**As a** startup user
**I want** to search and filter my documents
**So that** I can quickly find specific documents

**Acceptance Criteria:**

```gherkin
Given I am viewing the documents page
When I use the search and filter controls
Then I can search documents by filename (FR18)
And I can filter by category (FR19)
And I can filter by verification status (Pending, Verified, Rejected) (FR19)
And I can filter by upload date range (FR18)
And I can sort by: filename, upload date, file size
And search and filters work together (AND logic)
And results update in real-time as I type
And empty state is shown when no documents match
And I can clear all filters with one click
```

**Technical Notes:**
- Create `components/documents/document-list.tsx`
- Create `components/documents/document-filters.tsx`
- Create `components/documents/document-card.tsx` - Display individual document
- API route: `app/api/documents/route.ts` (GET with query params)
- Support query params: `?startupId=xxx&search=xxx&category=xxx&status=xxx&sortBy=xxx`
- Implement search on backend (Prisma `contains` filter)
- Use TanStack Query with query params

**FR Mapping:** FR18 (search documents), FR19 (filter by category and status)

**Files to Create/Modify:**
- `components/documents/document-list.tsx`
- `components/documents/document-filters.tsx`
- `components/documents/document-card.tsx`
- Update `app/api/documents/route.ts` (GET with query params)

**Prerequisites:** Story 4.1

---

### Story 4.4: Implement Document Verification Workflow

**As an** incubator admin or startup admin
**I want** to mark documents as verified, pending, or rejected
**So that** document credibility is clearly indicated

**Acceptance Criteria:**

```gherkin
Given I have permission to verify documents (INCUBATOR_ADMIN or STARTUP_ADMIN)
When I view a document card
Then I see the current verification status badge (Pending by default) (FR24)
And I can click "Verify" to mark as verified (FR23)
And I can click "Reject" to mark as rejected with optional notes (FR23)
And verification status updates immediately
And verification status is color-coded (green=verified, yellow=pending, red=rejected) (FR24)
And verification notes are visible to authorized users
And audit log records who verified/rejected and when
And STARTUP_USER role cannot verify documents (read-only status)
```

**Technical Notes:**
- Create `components/documents/verification-badge.tsx` - Status indicator
- Create `components/documents/verification-actions.tsx` - Verify/Reject buttons
- API route: `app/api/documents/[id]/verify/route.ts` (PUT)
- Update Document.verificationStatus and Document.verificationNotes
- Log action in AuditLog table
- Check role permissions (INCUBATOR_ADMIN or STARTUP_ADMIN only)

**FR Mapping:** FR23 (mark documents as verified), FR24 (display verification status)

**Files to Create/Modify:**
- `components/documents/verification-badge.tsx`
- `components/documents/verification-actions.tsx`
- `app/api/documents/[id]/verify/route.ts`
- Update `components/documents/document-card.tsx` - Add verification UI

**Prerequisites:** Story 4.3

---

### Story 4.5: Add Document Download and Delete Functionality

**As a** user with document access
**I want** to download or delete documents
**So that** I can use documents offline or remove incorrect uploads

**Acceptance Criteria:**

```gherkin
Given I am viewing a document card
When I click the "Download" button
Then the document is downloaded from Vercel Blob (FR20)
And download action is logged in audit log
And investor viewers can download documents they have access to (FR66)
And when I click "Delete" button (if I have permission)
Then a confirmation dialog appears (FR21)
And confirming deletion removes the Document record and Blob file
And STARTUP_USER can only delete documents they uploaded (FR21)
And STARTUP_ADMIN can delete any document in their startup
And INCUBATOR_ADMIN can delete any document (override permission)
And deletion is logged in audit log
```

**Technical Notes:**
- Add download button to document cards
- Download links directly to Blob URL (time-limited signed URL for security)
- API route: `app/api/documents/[id]/route.ts` (DELETE)
- Check permissions based on role and uploadedById
- Delete from Vercel Blob: `del(document.blobKey)`
- Delete from database (cascades handled by Prisma)
- Log download/delete in AuditLog

**FR Mapping:** FR20 (download documents), FR21 (delete documents)

**Files to Create/Modify:**
- Update `components/documents/document-card.tsx` - Add download/delete buttons
- `app/api/documents/[id]/route.ts` (DELETE endpoint, GET for download tracking)
- `lib/blob.ts` - Add delete function

**Prerequisites:** Story 4.3

---

### Story 4.6: Track Document Version History

**As a** startup user
**I want** to see when documents were uploaded and replaced
**So that** I have a history of document changes

**Acceptance Criteria:**

```gherkin
Given documents have version history
When I view a document's details
Then I see the original upload date and uploader (FR22)
And I see the last updated date if document was replaced (FR22)
And I can view previous versions if document was replaced (nice-to-have, can defer)
And version history shows who made each change
And timestamps are displayed in user's local timezone
```

**Technical Notes:**
- Document model already has createdAt, updatedAt, uploadedById
- Create `components/documents/document-history.tsx` - Display version info
- If replacing documents (future story), create DocumentVersion table
- For MVP, just show createdAt, updatedAt, uploadedBy.name
- Use date-fns for formatting: `format(createdAt, 'MMM d, yyyy h:mm a')`

**FR Mapping:** FR22 (track document version history)

**Files to Create/Modify:**
- `components/documents/document-history.tsx`
- Update `components/documents/document-card.tsx` - Show version info

**Prerequisites:** Story 4.3

---

### Story 4.7: Display Document Metrics on Dashboard

**As a** startup user
**I want** to see document completion metrics on my dashboard
**So that** I know how many documents I've uploaded and verified

**Acceptance Criteria:**

```gherkin
Given I am on the main dashboard
When the dashboard loads
Then I see total document count for my startup (FR25)
And I see verified document count (FR25)
And I see pending review count (FR49)
And document completion percentage is displayed (FR54)
And metrics update when I upload or verify documents
And clicking metrics navigates to documents page
```

**Technical Notes:**
- Calculate metrics in API or use cached DashboardMetric table
- API route: `app/api/startups/[id]/metrics/route.ts` (GET)
- Display metrics in `components/analytics/metric-card.tsx`
- Use TanStack Query to fetch metrics
- Update cache when documents change (optimistic updates)

**FR Mapping:** FR25 (total/verified document counts), FR49 (dashboard metrics), FR54 (document completion percentage)

**Files to Create/Modify:**
- `app/api/startups/[id]/metrics/route.ts`
- Update `app/(dashboard)/dashboard/page.tsx` - Display document metrics
- `components/analytics/metric-card.tsx`

**Prerequisites:** Story 4.3, Story 7.1 (dashboard structure)

---

### Story 4.8: Enforce Multi-Tenant Data Isolation for Documents

**As a** platform owner
**I want** to ensure documents are isolated by startup
**So that** startups cannot access each other's documents

**Acceptance Criteria:**

```gherkin
Given multi-tenant data isolation is enforced
When a user queries documents
Then only documents for their current startupId are returned (FR27)
And API routes validate user has access to startupId
And attempting to access another startup's document returns 403 Forbidden
And SQL queries include WHERE startupId = ? filter
And Prisma middleware enforces tenant filtering
And audit log records all document access attempts
And security tests verify cross-tenant access is blocked
```

**Technical Notes:**
- All document queries MUST include startupId filter
- Middleware validates user has access to requested startupId (use checkUserStartupAccess from Story 1.3)
- Write integration tests to verify isolation
- Use Prisma query extensions or middleware to enforce tenant filter globally
- Log failed access attempts

**FR Mapping:** FR27 (tenant isolation)

**Files to Create/Modify:**
- Update all `app/api/documents/*` routes - Add tenant validation
- `lib/prisma.ts` - Add Prisma middleware for tenant filtering
- Write tests: `__tests__/api/documents.test.ts`

**Prerequisites:** Story 4.1, Story 1.3 (multi-tenancy utilities)

---

## EPIC-5: One-Pager Creation & Sharing

**User Value:** Startups can create professional one-pagers showcasing their business and share them instantly via link or QR code with analytics

**Description:** This epic implements the one-pager feature allowing startups to create structured profiles covering company overview, problem/solution, product, team, and contact info. One-pagers are shareable publicly and include view tracking, PDF downloads, and QR code generation.

**Success Criteria:**
- ✅ Startups can create one-pagers with guided sections
- ✅ One-pagers can be previewed before publishing
- ✅ Public shareable links are generated
- ✅ QR codes link to one-pagers
- ✅ View counts are tracked
- ✅ One-pagers can be downloaded as PDFs
- ✅ One-pagers can be enabled/disabled

**FR Coverage:** FR28, FR29, FR30, FR31, FR32, FR33, FR34, FR35, FR36, FR37, FR38

**Prerequisites:** EPIC-2 (authentication)

---

### Story 5.1: Build One-Pager Editor with Guided Sections

**As a** startup user
**I want** to create a one-pager with structured sections
**So that** I can present my startup professionally

**Acceptance Criteria:**

```gherkin
Given I navigate to /dashboard/one-pager
When I create or edit a one-pager
Then I see a form with guided sections (FR28, FR29):
  - Company & Problem
  - Solution & Market
  - Product/Service
  - Team
  - Contact Info
And each section has labeled text fields
And the form auto-saves as I type (FR30)
And I see a "Saving..." / "Saved" indicator
And I can navigate between sections with tabs or accordion
And validation ensures required fields are filled
And character limits are enforced per field
And changes are persisted to database (OnePager table)
```

**Technical Notes:**
- Create `app/(dashboard)/one-pager/page.tsx`
- Create `components/one-pager/one-pager-editor.tsx` - Multi-section form
- Use react-hook-form with Zod validation
- Implement auto-save with debounce (save after 1 second of no typing)
- API route: `app/api/one-pagers/route.ts` (POST create, PUT update)
- Store each section in OnePager fields (companyName, problemSection, solutionSection, etc.)
- Generate unique slug on creation (e.g., from company name + random string)

**FR Mapping:** FR28 (create one-pager), FR29 (editable form fields), FR30 (save drafts)

**Files to Create/Modify:**
- `app/(dashboard)/one-pager/page.tsx`
- `components/one-pager/one-pager-editor.tsx`
- `app/api/one-pagers/route.ts` (POST, PUT)
- Zod schema: `lib/validation.ts` - `CreateOnePagerSchema`, `UpdateOnePagerSchema`

**Prerequisites:** Story 2.1 (auth)

---

### Story 5.2: Implement One-Pager Preview

**As a** startup user
**I want** to preview my one-pager as viewers will see it
**So that** I can verify it looks professional before sharing

**Acceptance Criteria:**

```gherkin
Given I am editing a one-pager
When I click "Preview" button
Then I see a live preview panel showing the one-pager as it will appear publicly (FR31)
And preview updates in real-time as I edit
And preview matches the public page design
And I can toggle between edit and full-screen preview modes
And preview is responsive (shows how it looks on mobile/tablet)
```

**Technical Notes:**
- Create `components/one-pager/one-pager-preview.tsx`
- Display preview side-by-side with editor (desktop) or in modal (mobile)
- Use same rendering component as public page
- Pass form data directly to preview (no API call needed)
- Use Tailwind responsive classes to simulate mobile view

**FR Mapping:** FR31 (preview one-pager)

**Files to Create/Modify:**
- `components/one-pager/one-pager-preview.tsx`
- `app/(dashboard)/one-pager/preview/page.tsx` (optional dedicated preview page)
- Update `components/one-pager/one-pager-editor.tsx` - Add preview panel

**Prerequisites:** Story 5.1

---

### Story 5.3: Create Public One-Pager Page

**As a** visitor
**I want** to view a startup's one-pager via a public link
**So that** I can learn about the startup without logging in

**Acceptance Criteria:**

```gherkin
Given a one-pager has been published
When I visit /one-pager/[slug]
Then I see the one-pager content without needing to log in (FR37)
And the page displays all sections: company, problem, solution, product, team, contact
And the page is SEO-optimized (meta tags, Open Graph)
And the page is responsive (mobile-friendly)
And a view is recorded when the page loads (FR34)
And if isPublic is false, I see "This one-pager is not public" message
And if the slug doesn't exist, I see 404 page
```

**Technical Notes:**
- Create `app/(public)/one-pager/[slug]/page.tsx` - Public route (no auth required)
- API route: `app/api/one-pagers/[slug]/route.ts` (GET by slug)
- Check OnePager.isPublic flag
- Record view: `app/api/one-pagers/[slug]/views/route.ts` (POST)
- Increment OnePager.totalViews
- Create OnePagerView record for analytics
- Add meta tags for SEO and social sharing

**FR Mapping:** FR34 (track view count), FR37 (public access without login)

**Files to Create/Modify:**
- `app/(public)/one-pager/[slug]/page.tsx`
- `app/api/one-pagers/[slug]/route.ts` (GET)
- `app/api/one-pagers/[slug]/views/route.ts` (POST)
- `components/one-pager/one-pager-public-view.tsx`

**Prerequisites:** Story 5.1

---

### Story 5.4: Generate Shareable Link and QR Code

**As a** startup user
**I want** to generate a shareable link and QR code for my one-pager
**So that** I can easily share it with investors and partners

**Acceptance Criteria:**

```gherkin
Given I have created a one-pager
When I click "Share" button
Then a modal opens showing the public link (FR32)
And I can copy the link to clipboard with one click
And a QR code is displayed linking to the one-pager (FR33)
And I can download the QR code as PNG image
And link format is: https://duerify.com/one-pager/[slug]
And QR code is generated using qrcode library
And modal shows current view count
```

**Technical Notes:**
- Create `components/one-pager/share-modal.tsx`
- Use shadcn/ui Dialog component
- Generate QR code on client-side using `qrcode` library
- API route: `app/api/one-pagers/[id]/qr/route.ts` (GET - server-side QR generation)
- Allow downloading QR code as image
- Use Clipboard API for copy-to-clipboard

**FR Mapping:** FR32 (shareable link), FR33 (QR code)

**Files to Create/Modify:**
- `components/one-pager/share-modal.tsx`
- `app/api/one-pagers/[id]/qr/route.ts`
- Update `app/(dashboard)/one-pager/page.tsx` - Add share button

**Prerequisites:** Story 5.1

---

### Story 5.5: Track and Display One-Pager Analytics

**As a** startup user
**I want** to see how many times my one-pager has been viewed
**So that** I can gauge interest in my startup

**Acceptance Criteria:**

```gherkin
Given my one-pager has been shared
When I view the one-pager page or analytics
Then I see total view count (FR35)
And I see view history (date/time of each view) (FR35)
And I see referrer information (where views came from)
And analytics are updated in real-time
And I can filter view history by date range
And view metrics are displayed prominently on one-pager editor
```

**Technical Notes:**
- Display totalViews on one-pager editor page
- API route: `app/api/one-pagers/[id]/analytics/route.ts` (GET)
- Query OnePagerView table for detailed analytics
- Show chart of views over time (use Recharts)
- Track referrer from HTTP headers when recording views

**FR Mapping:** FR35 (view one-pager analytics)

**Files to Create/Modify:**
- `components/one-pager/one-pager-analytics.tsx`
- `app/api/one-pagers/[id]/analytics/route.ts`
- Update `app/(dashboard)/one-pager/page.tsx` - Display analytics

**Prerequisites:** Story 5.3 (view tracking)

---

### Story 5.6: Generate PDF Download of One-Pager

**As a** startup user
**I want** to download my one-pager as a PDF
**So that** I can attach it to emails or print it

**Acceptance Criteria:**

```gherkin
Given I have created a one-pager
When I click "Download PDF" button
Then a PDF file is generated containing all one-pager sections (FR36)
And PDF is professionally formatted with consistent styling
And PDF includes startup logo (if provided)
And PDF download completes within 5 seconds
And PDF filename is: [company-name]-one-pager.pdf
And downloaded PDF is properly formatted for printing (A4 or Letter size)
```

**Technical Notes:**
- Create `components/one-pager/one-pager-pdf.tsx` - PDF template using @react-pdf/renderer
- API route: `app/api/one-pagers/[id]/pdf/route.ts` (GET)
- Server-side PDF generation
- Return PDF as streaming response or Blob URL
- Style PDF to match public page design
- Include all sections with proper typography

**FR Mapping:** FR36 (download PDF)

**Files to Create/Modify:**
- `components/one-pager/one-pager-pdf.tsx`
- `app/api/one-pagers/[id]/pdf/route.ts`
- `lib/pdf-generator.ts` - PDF utilities
- Update `app/(dashboard)/one-pager/page.tsx` - Add download button

**Prerequisites:** Story 5.1

---

### Story 5.7: Enable/Disable Public Access to One-Pager

**As a** startup user
**I want** to control whether my one-pager is publicly accessible
**So that** I can make it private when needed

**Acceptance Criteria:**

```gherkin
Given I have a one-pager
When I toggle the "Public" switch
Then isPublic flag is updated in database (FR38)
And when disabled, public link shows "This one-pager is not available"
And when enabled, public link shows the one-pager
And toggle state is persisted
And I see clear indicator of current public/private status
And other features (PDF, QR code) still work when private
```

**Technical Notes:**
- Add toggle switch to one-pager editor
- API route: `app/api/one-pagers/[id]/route.ts` (PATCH - update isPublic)
- Update OnePager.isPublic field
- Check isPublic in public page route
- Show status badge ("Public" green or "Private" gray)

**FR Mapping:** FR38 (enable/disable public access)

**Files to Create/Modify:**
- Update `components/one-pager/one-pager-editor.tsx` - Add public toggle
- Update `app/api/one-pagers/[id]/route.ts` (PATCH endpoint)
- Update `app/(public)/one-pager/[slug]/page.tsx` - Handle private one-pagers

**Prerequisites:** Story 5.1, Story 5.3

---

## EPIC-6: IDE Readiness Assessment

**User Value:** Startups can assess their readiness across 4 dimensions (TRL, MRL, CRL, BRL) and track progress over time with visual radar charts

**Description:** This epic implements the IDE (Innovation, Development, Enterprise) readiness assessment system based on the 4-level framework: Technology Readiness Level, Manufacturing Readiness Level, Commercial Readiness Level, and Business Readiness Level. Startups complete questionnaires for each dimension and receive scores, visualizations, and recommendations.

**Success Criteria:**
- ✅ Startups can complete assessments for all 4 dimensions
- ✅ Overall readiness score is calculated
- ✅ Radar chart visualizes scores across dimensions
- ✅ Assessment history is tracked over time
- ✅ Recommendations are generated based on scores
- ✅ Assessment progress is indicated

**FR Coverage:** FR39, FR40, FR41, FR42, FR43, FR44, FR45, FR46, FR47

**Prerequisites:** EPIC-2 (authentication)

---

### Story 6.1: Create Assessment Overview Page with Dimension Cards

**As a** startup user
**I want** to see an overview of all readiness dimensions
**So that** I can choose which assessment to complete

**Acceptance Criteria:**

```gherkin
Given I navigate to /dashboard/ide-assessment
When the page loads
Then I see 4 large dimension cards: TRL, MRL, CRL, BRL (FR39)
And each card shows dimension name, description, and icon
And each card shows completion status (incomplete, in-progress, complete) (FR46)
And each card shows current score if assessment is complete (FR45)
And I can click a card to start/continue that assessment
And overall readiness score is displayed prominently at top (FR41)
And radar chart shows all 4 dimension scores (FR42)
And page is accessible to all roles (STARTUP_USER, STARTUP_ADMIN, INCUBATOR_ADMIN view)
```

**Technical Notes:**
- Create `app/(dashboard)/ide-assessment/page.tsx`
- Create `components/assessments/dimension-card.tsx` - Individual dimension UI
- Create `components/assessments/radar-chart.tsx` - Using Recharts
- API route: `app/api/assessments/route.ts` (GET latest assessment for startup)
- Calculate overallScore as average of 4 dimension scores
- Display "Not started" state if no assessment exists

**FR Mapping:** FR39 (4 dimensions), FR41 (overall score), FR42 (radar chart), FR45 (score breakdown), FR46 (completion status)

**Files to Create/Modify:**
- `app/(dashboard)/ide-assessment/page.tsx`
- `components/assessments/dimension-card.tsx`
- `components/assessments/radar-chart.tsx`
- `app/api/assessments/route.ts` (GET)

**Prerequisites:** Story 2.1 (auth)

---

### Story 6.2: Build Assessment Questionnaire Interface

**As a** startup user
**I want** to complete a readiness assessment questionnaire
**So that** I can evaluate my startup's readiness level

**Acceptance Criteria:**

```gherkin
Given I click on a dimension card (e.g., TRL)
When I navigate to /dashboard/ide-assessment/trl
Then I see a questionnaire with multiple questions (FR40)
And questions are specific to that dimension (TRL, MRL, CRL, or BRL)
And I can answer with radio buttons, checkboxes, or text inputs
And progress indicator shows how many questions completed
And I can save progress and continue later
And I can navigate back/forward between questions
And I can submit the assessment when all required questions answered
And validation ensures required fields are filled
```

**Technical Notes:**
- Create `app/(dashboard)/ide-assessment/[dimension]/page.tsx` - Dynamic route for each dimension
- Create `components/assessments/assessment-form.tsx` - Questionnaire UI
- Define question sets for each dimension (JSON or hardcoded)
- Use react-hook-form for form state
- API route: `app/api/assessments/route.ts` (POST create, PUT update)
- Store answers in Assessment.trlData, mrlData, crlData, brlData (JSON fields)
- Calculate scores based on answers (scoring algorithm)

**FR Mapping:** FR40 (questionnaire interface)

**Files to Create/Modify:**
- `app/(dashboard)/ide-assessment/[dimension]/page.tsx`
- `components/assessments/assessment-form.tsx`
- `app/api/assessments/route.ts` (POST, PUT)
- `lib/assessments/questions.ts` - Question definitions
- `lib/assessments/scoring.ts` - Scoring algorithm

**Prerequisites:** Story 6.1

---

### Story 6.3: Calculate and Display Readiness Scores

**As a** startup user
**I want** to see my readiness score after completing an assessment
**So that** I understand my startup's current readiness level

**Acceptance Criteria:**

```gherkin
Given I have completed an assessment dimension
When the assessment is submitted
Then a score (0-100) is calculated for that dimension (FR41)
And the score is stored in Assessment table (trlScore, mrlScore, etc.)
And overall score is recalculated as average of all completed dimensions (FR41)
And scores are displayed on the overview page
And radar chart updates with new scores (FR42)
And I see a congratulations message with the score
And score interpretation is provided (e.g., "High readiness: 80-100", "Medium: 50-79", "Low: 0-49")
```

**Technical Notes:**
- Implement scoring algorithm in `lib/assessments/scoring.ts`
- Calculate dimension score based on question weights and answers
- Store in Assessment.trlScore, mrlScore, crlScore, brlScore
- Calculate overallScore: `(trl + mrl + crl + brl) / 4`
- Update radar chart data (from Story 6.1)
- Return scores in API response

**FR Mapping:** FR41 (calculate overall score), FR42 (radar chart), FR45 (detailed breakdown)

**Files to Create/Modify:**
- `lib/assessments/scoring.ts`
- Update `app/api/assessments/route.ts` - Calculate scores on submit
- Update `components/assessments/radar-chart.tsx` - Refresh with new data

**Prerequisites:** Story 6.2

---

### Story 6.4: Implement Assessment History Tracking

**As a** startup user
**I want** to view my assessment history over time
**So that** I can see how my readiness has improved

**Acceptance Criteria:**

```gherkin
Given I have completed multiple assessments over time
When I navigate to "Assessment History" section
Then I see a list of all past assessments with dates (FR43)
And I see scores for each assessment
And I can compare scores between assessments
And I see a trend chart showing score changes over time (FR43)
And I can click an assessment to view details
And most recent assessment is highlighted
And history is sorted by date (newest first)
```

**Technical Notes:**
- API route: `app/api/assessments/history/route.ts` (GET)
- Query all Assessment records for startup, ordered by createdAt DESC
- Create `components/assessments/assessment-history.tsx`
- Display as timeline or table
- Use Recharts to show trend line chart (score over time)
- Add date range filter (last 30 days, last 6 months, all time)

**FR Mapping:** FR43 (track history over time)

**Files to Create/Modify:**
- `app/api/assessments/history/route.ts`
- `components/assessments/assessment-history.tsx`
- Update `app/(dashboard)/ide-assessment/page.tsx` - Add history tab

**Prerequisites:** Story 6.3

---

### Story 6.5: Generate Improvement Recommendations

**As a** startup user
**I want** to receive recommendations for improving my readiness
**So that** I know what to focus on next

**Acceptance Criteria:**

```gherkin
Given I have completed an assessment
When scores are calculated
Then improvement recommendations are generated (FR44)
And recommendations are specific to low-scoring dimensions
And recommendations include actionable steps
And recommendations are displayed on the overview page
And I can view detailed recommendations for each dimension
And recommendations are stored in Assessment.recommendations field (JSON)
And recommendations update when I retake assessments
```

**Technical Notes:**
- Implement recommendation engine in `lib/assessments/recommendations.ts`
- Based on dimension scores, suggest improvements
- Example rules:
  - TRL < 50: "Focus on technology validation and prototyping"
  - MRL < 50: "Develop manufacturing processes and supply chain"
  - CRL < 50: "Conduct market research and customer validation"
  - BRL < 50: "Refine business model and financial projections"
- Store recommendations in Assessment.recommendations (JSON)
- Create `components/assessments/recommendations-panel.tsx`

**FR Mapping:** FR44 (generate recommendations)

**Files to Create/Modify:**
- `lib/assessments/recommendations.ts`
- `components/assessments/recommendations-panel.tsx`
- Update `app/api/assessments/route.ts` - Generate recommendations on submit
- Update `app/(dashboard)/ide-assessment/page.tsx` - Display recommendations

**Prerequisites:** Story 6.3

---

### Story 6.6: Allow Retaking Assessments

**As a** startup user
**I want** to retake assessments to update my scores
**So that** I can track my progress as my startup evolves

**Acceptance Criteria:**

```gherkin
Given I have completed an assessment
When I click "Retake Assessment" on a dimension card
Then I can fill out the questionnaire again (FR47)
And previous answers are not pre-filled (fresh start)
And submitting creates a new Assessment record (not update existing)
And new scores are calculated and displayed
And radar chart updates with latest scores
And previous assessment is preserved in history
And latest assessment is always shown on overview page
```

**Technical Notes:**
- Add "Retake" button to dimension cards
- Create new Assessment record instead of updating existing
- Query for latest assessment: `orderBy: { createdAt: 'desc' }, take: 1`
- History shows all assessments
- Allow unlimited retakes

**FR Mapping:** FR47 (retake assessments)

**Files to Create/Modify:**
- Update `components/assessments/dimension-card.tsx` - Add retake button
- Update `app/api/assessments/route.ts` - Handle creating new vs updating existing
- Update `app/(dashboard)/ide-assessment/[dimension]/page.tsx` - Clear form for retakes

**Prerequisites:** Story 6.2, Story 6.4

---

## EPIC-7: Main Dashboard & Analytics

**User Value:** All users see relevant metrics, readiness scores, and quick actions at a glance on their personalized dashboard

**Description:** This epic creates the main dashboard that serves as the landing page for all authenticated users. The dashboard displays role-appropriate metrics: startups see their own stats, while incubator admins see portfolio-wide metrics. Includes quick action shortcuts and activity feed.

**Success Criteria:**
- ✅ Startup users see their startup dashboard with key metrics
- ✅ Incubator admins see portfolio dashboard
- ✅ Dashboard displays document metrics and readiness scores
- ✅ Quick action panel provides shortcuts to common tasks
- ✅ Activity feed shows recent actions
- ✅ Dashboard data updates in real-time

**FR Coverage:** FR48, FR49, FR50, FR51, FR52, FR53, FR54, FR55

**Prerequisites:** EPIC-2 (auth), EPIC-4 (documents), EPIC-6 (assessments)

---

### Story 7.1: Create Startup Dashboard Page

**As a** startup user
**I want** to see a dashboard with my startup's key metrics
**So that** I understand my progress at a glance

**Acceptance Criteria:**

```gherkin
Given I am logged in as a startup user
When I navigate to /dashboard (home page after login)
Then I see my startup dashboard (FR48)
And dashboard displays key metrics cards (FR49):
  - Total documents uploaded
  - Verified documents count
  - Pending documents for review
  - Overall readiness score
And I see a readiness radar chart (FR50)
And I see document completion percentage (FR54)
And dashboard layout is responsive and clean
And empty states are shown for metrics with no data
And clicking a metric navigates to relevant page
```

**Technical Notes:**
- Create `app/(dashboard)/dashboard/page.tsx`
- Use `components/analytics/metric-card.tsx` for metric display
- Use `components/assessments/radar-chart.tsx` for readiness viz
- API route: `app/api/dashboard/route.ts` or use existing `/api/startups/[id]/metrics`
- Fetch metrics from DashboardMetric table or calculate on-demand
- Layout: Grid of metric cards + radar chart + quick actions
- Use TanStack Query for data fetching with auto-refresh

**FR Mapping:** FR48 (startup dashboard), FR49 (key metrics), FR50 (radar chart), FR54 (document completion %)

**Files to Create/Modify:**
- `app/(dashboard)/dashboard/page.tsx`
- `app/api/dashboard/route.ts` (GET)
- `components/analytics/metric-card.tsx`
- `components/layout/dashboard-shell.tsx` (wrapper for all dashboard pages)

**Prerequisites:** Story 2.1 (auth), Story 4.7 (document metrics), Story 6.1 (readiness assessment)

---

### Story 7.2: Add Quick Actions Panel

**As a** startup user
**I want** to access common actions quickly from the dashboard
**So that** I can complete tasks efficiently

**Acceptance Criteria:**

```gherkin
Given I am on the dashboard
When I view the quick actions panel
Then I see shortcut buttons for common actions (FR51):
  - Upload Document
  - Edit One-Pager
  - Complete Assessment
  - Invite Team Member
And clicking each button navigates to the appropriate page or opens a modal
And quick actions are contextual (e.g., "Continue Assessment" if in-progress)
And quick actions are role-appropriate (different for admin vs user)
```

**Technical Notes:**
- Create `components/dashboard/quick-actions.tsx`
- Display as prominent button row or card on dashboard
- Use shadcn/ui Button components with icons (lucide-react)
- Conditionally show actions based on role and status
- Open modals for quick inline actions (e.g., upload document)

**FR Mapping:** FR51 (quick action shortcuts)

**Files to Create/Modify:**
- `components/dashboard/quick-actions.tsx`
- Update `app/(dashboard)/dashboard/page.tsx` - Add quick actions panel

**Prerequisites:** Story 7.1

---

### Story 7.3: Build Activity Feed

**As a** startup user
**I want** to see recent activity in my startup
**So that** I stay informed of changes

**Acceptance Criteria:**

```gherkin
Given I am on the dashboard
When I view the activity feed
Then I see recent activities (FR55):
  - Documents uploaded (by whom, when)
  - Assessments completed
  - Team members invited
  - Documents verified
And activities are sorted by time (most recent first)
And activity feed shows last 10 activities with "View All" link
And each activity has an icon, description, timestamp, and actor
And timestamps are relative (e.g., "2 hours ago")
And clicking an activity navigates to the related item
```

**Technical Notes:**
- Create `components/analytics/activity-feed.tsx`
- API route: `app/api/activity/route.ts` (GET)
- Query AuditLog table for recent startup activities
- Transform audit logs into human-readable activity descriptions
- Use date-fns for relative time formatting
- Implement pagination for "View All" page

**FR Mapping:** FR55 (recent activity feed)

**Files to Create/Modify:**
- `components/analytics/activity-feed.tsx`
- `app/api/activity/route.ts`
- Update `app/(dashboard)/dashboard/page.tsx` - Add activity feed

**Prerequisites:** Story 7.1, audit logging from Story 4.4

---

### Story 7.4: Create Incubator Portfolio Dashboard

**As an** incubator admin
**I want** to see portfolio-level metrics on my dashboard
**So that** I understand overall portfolio health

**Acceptance Criteria:**

```gherkin
Given I am logged in as INCUBATOR_ADMIN
When I navigate to /dashboard
Then I see portfolio dashboard instead of single startup dashboard (FR52)
And portfolio dashboard shows aggregate metrics:
  - Total startups in portfolio
  - Average readiness score across all startups
  - Total documents across all startups
  - Average document completion rate
And I see a list of startups with individual readiness scores
And I see portfolio-wide activity feed
And I can click "View Full Portfolio" to navigate to /portfolio page
And dashboard auto-detects my role and shows appropriate view
```

**Technical Notes:**
- Update `app/(dashboard)/dashboard/page.tsx` - Check user role
- If INCUBATOR_ADMIN, fetch portfolio metrics instead of single startup
- API route: `app/api/dashboard/portfolio/route.ts` (GET aggregate data)
- Calculate aggregates across all startups
- Reuse metric cards and charts with different data
- Link to full portfolio page (from EPIC-3)

**FR Mapping:** FR52 (incubator portfolio dashboard)

**Files to Create/Modify:**
- Update `app/(dashboard)/dashboard/page.tsx` - Role-based dashboard
- `app/api/dashboard/portfolio/route.ts`
- `components/dashboard/portfolio-summary.tsx`

**Prerequisites:** Story 7.1, Story 3.1 (portfolio page exists)

---

### Story 7.5: Implement Performance Metrics and Tracking

**As a** user
**I want** to see detailed performance metrics
**So that** I can track progress and identify trends

**Acceptance Criteria:**

```gherkin
Given I navigate to /dashboard/analytics
When I view the analytics page
Then I see performance metrics and charts (FR53):
  - Document upload trend over time (line chart)
  - Readiness score progress over time (line chart)
  - Document verification status breakdown (pie chart)
  - Assessment completion rate
And I can filter metrics by date range (last 7 days, 30 days, 90 days, all time)
And charts are interactive (tooltips, zoom)
And metrics auto-refresh periodically
And I can export data as CSV
```

**Technical Notes:**
- Create `app/(dashboard)/analytics/page.tsx`
- Create `components/analytics/performance-charts.tsx`
- Use Recharts for all visualizations (line, pie, bar charts)
- API route: `app/api/analytics/route.ts` (GET with date range params)
- Aggregate data from documents, assessments, activity logs
- Implement date range picker (shadcn/ui Popover + Calendar)
- Add CSV export functionality

**FR Mapping:** FR53 (performance metrics and progress tracking)

**Files to Create/Modify:**
- `app/(dashboard)/analytics/page.tsx`
- `components/analytics/performance-charts.tsx`
- `app/api/analytics/route.ts`

**Prerequisites:** Story 7.1

---

## EPIC-8: Team & User Management

**User Value:** Startup admins can invite team members, manage roles and permissions, and track user activity across the platform

**Description:** This epic implements team management functionality allowing startup admins to invite co-founders and team members via email, assign roles, manage permissions, and receive notifications for important events.

**Success Criteria:**
- ✅ Startup admins can invite team members via email
- ✅ Invited users receive email invitations
- ✅ Roles can be assigned and updated
- ✅ Team members can be removed
- ✅ Notification preferences can be configured
- ✅ Audit trail tracks all user actions

**FR Coverage:** FR56, FR57, FR58, FR59, FR60, FR61, FR62, FR63

**Prerequisites:** EPIC-2 (auth), EPIC-1 (RBAC)

---

### Story 8.1: Build Team Management Page

**As a** startup admin
**I want** to view and manage my team members
**So that** I can control who has access to my startup data

**Acceptance Criteria:**

```gherkin
Given I am logged in as STARTUP_ADMIN
When I navigate to /dashboard/settings/team
Then I see a list of all team members (FR56)
And each member shows: name, email, role, last active date
And I see an "Invite Team Member" button
And I can filter team members by role
And I can search team members by name or email
And page is accessible only to STARTUP_ADMIN and INCUBATOR_ADMIN
```

**Technical Notes:**
- Create `app/(dashboard)/settings/team/page.tsx`
- Create `components/team/team-list.tsx`
- API route: `app/api/team/route.ts` (GET team members for startup)
- Query StartupUser table joined with User table
- Filter by currentStartupId from tenant context
- Show role badges and last activity timestamp

**FR Mapping:** FR56 (view and manage team)

**Files to Create/Modify:**
- `app/(dashboard)/settings/team/page.tsx`
- `components/team/team-list.tsx`
- `app/api/team/route.ts` (GET)

**Prerequisites:** Story 2.1 (auth), Story 1.3 (RBAC)

---

### Story 8.2: Implement Team Invitation Flow

**As a** startup admin
**I want** to invite team members via email
**So that** they can join my startup on the platform

**Acceptance Criteria:**

```gherkin
Given I am on the team management page
When I click "Invite Team Member"
Then a modal opens asking for email address and role (FR56)
And role options include: STARTUP_ADMIN, STARTUP_USER
And clicking "Send Invitation" sends an email to the user (FR57)
And invitation email contains signup/login link with token
And if user already exists, they are added to startup
And if user doesn't exist, email prompts them to create account
And invitation status is tracked (pending, accepted, expired)
And invitations expire after 7 days
And success message confirms invitation was sent
```

**Technical Notes:**
- Create `components/team/invite-member-modal.tsx`
- API route: `app/api/users/invite/route.ts` (POST)
- Generate invitation token (store in Invitation table - add to schema)
- Send email using Resend with invitation link
- Email template: `emails/team-invitation.tsx`
- Link format: `https://duerify.com/accept-invite?token=xxx`
- Check if user exists, if so add StartupUser record directly

**FR Mapping:** FR56 (invite team), FR57 (email invitation)

**Files to Create/Modify:**
- `components/team/invite-member-modal.tsx`
- `app/api/users/invite/route.ts`
- `app/(auth)/accept-invite/page.tsx` - Invitation acceptance page
- `emails/team-invitation.tsx` - Email template
- `prisma/schema.prisma` - Add Invitation model

**Prerequisites:** Story 8.1

---

### Story 8.3: Implement Role Assignment and Updates

**As a** startup admin
**I want** to assign and change team member roles
**So that** I can control their permissions

**Acceptance Criteria:**

```gherkin
Given I am viewing a team member
When I click "Change Role" or edit icon
Then I can select a new role (STARTUP_ADMIN or STARTUP_USER) (FR58)
And updating the role updates the StartupUser record
And role change takes effect immediately
And user sees updated permissions on next page load
And role changes are logged in audit log
And I cannot change my own role (prevent self-demotion)
And INCUBATOR_ADMIN can change any role (override)
```

**Technical Notes:**
- Add role dropdown to team member row or modal
- API route: `app/api/team/[id]/route.ts` (PUT - update role)
- Update StartupUser.role field
- Validate permissions (only admins can change roles)
- Prevent users from changing their own role
- Log role change in AuditLog
- Invalidate session/cache to apply new permissions

**FR Mapping:** FR58 (assign roles)

**Files to Create/Modify:**
- `components/team/change-role-dropdown.tsx`
- `app/api/team/[id]/route.ts` (PUT)
- Update `components/team/team-list.tsx` - Add role management UI

**Prerequisites:** Story 8.1

---

### Story 8.4: Implement Remove Team Member Functionality

**As a** startup admin
**I want** to remove team members from my startup
**So that** I can revoke access when needed

**Acceptance Criteria:**

```gherkin
Given I am viewing a team member
When I click "Remove" button
Then a confirmation dialog appears (FR59)
And confirming removal deletes the StartupUser record
And user loses access to the startup immediately
And user is notified via email of removal
And removal is logged in audit log
And I cannot remove myself (must transfer admin first)
And removed user can be re-invited later
```

**Technical Notes:**
- Add "Remove" button/menu item to team member row
- Create confirmation dialog (shadcn/ui AlertDialog)
- API route: `app/api/team/[id]/route.ts` (DELETE)
- Delete StartupUser record (NOT User record - only removes from startup)
- Send notification email to removed user
- Log removal in AuditLog
- Validate user is not removing themselves

**FR Mapping:** FR59 (remove team members)

**Files to Create/Modify:**
- `components/team/remove-member-dialog.tsx`
- `app/api/team/[id]/route.ts` (DELETE)
- Email template for removal notification

**Prerequisites:** Story 8.1

---

### Story 8.5: Implement Notification System

**As a** user
**I want** to receive notifications for important events
**So that** I stay informed of changes

**Acceptance Criteria:**

```gherkin
Given notification system is implemented
When key events occur
Then users receive notifications (FR61):
  - Document uploaded by team member
  - Assessment completed
  - Invitation received
  - Document verified/rejected
  - Team member added/removed
And notifications are sent via email (using Resend)
And notifications appear in-app (optional for MVP)
And email notifications are immediate (not batched)
And email templates are professional and branded
```

**Technical Notes:**
- Create email templates for each notification type
- Use Resend for email delivery (using Resend library)
- API helper: `lib/notifications.ts` - `sendNotification(userId, type, data)`
- Trigger notifications in relevant API routes (document upload, verification, etc.)
- Email templates in `emails/` directory
- Store email in `lib/email.ts` - sender function

**FR Mapping:** FR61 (notification emails)

**Files to Create/Modify:**
- `lib/notifications.ts` - Notification helper
- `emails/document-uploaded.tsx`
- `emails/assessment-completed.tsx`
- `emails/document-verified.tsx`
- Update various API routes to trigger notifications

**Prerequisites:** Story 8.1, other epics that trigger notifications

---

### Story 8.6: Add Notification Preferences and Audit Log Viewer

**As a** user
**I want** to configure which notifications I receive and view audit logs
**So that** I control my notification experience and can track activity

**Acceptance Criteria:**

```gherkin
Given I navigate to /dashboard/settings
When I view notification preferences
Then I can toggle notifications on/off by type (FR62):
  - Document activities
  - Assessment completions
  - Team changes
  - Verification status changes
And preferences are saved per user
And I can view audit log of all actions (FR63):
  - Who accessed what data
  - When actions occurred
  - IP address and user agent
And audit log is filterable by date, user, action type
And audit log is searchable
And only admins can view full audit log
```

**Technical Notes:**
- Create `app/(dashboard)/settings/notifications/page.tsx`
- Create `app/(dashboard)/settings/audit-log/page.tsx` (admin only)
- Add NotificationPreference model to schema (userId, type, enabled)
- API routes:
  - `app/api/settings/notifications/route.ts` (GET, PUT)
  - `app/api/audit/route.ts` (GET with filters)
- Query AuditLog table with filters
- Use shadcn/ui Switch for preferences
- Display audit log as table with pagination

**FR Mapping:** FR62 (configure notifications), FR63 (audit log)

**Files to Create/Modify:**
- `app/(dashboard)/settings/notifications/page.tsx`
- `app/(dashboard)/settings/audit-log/page.tsx`
- `app/api/settings/notifications/route.ts`
- Update `app/api/audit/route.ts` - Add filtering
- `prisma/schema.prisma` - Add NotificationPreference model

**Prerequisites:** Story 8.5

---

## EPIC-9: Investor Access Portal

**User Value:** Investors can view verified startup data without login friction, and admins can grant/revoke access granularly

**Description:** This epic implements read-only investor access to startup data. Incubator admins or startup admins can grant investors access to specific startups, and investors can view documents, one-pagers, and assessments in a simplified interface.

**Success Criteria:**
- ✅ Admins can grant investors access to startups
- ✅ Investors can view granted startup data (read-only)
- ✅ Investors can download documents and export data
- ✅ Investor access is clearly indicated
- ✅ Investors cannot edit anything

**FR Coverage:** FR64, FR65, FR66, FR67, FR68, FR69

**Prerequisites:** EPIC-2 (auth), EPIC-4 (documents), EPIC-5 (one-pagers), EPIC-6 (assessments)

---

### Story 9.1: Implement Grant Investor Access Functionality

**As an** incubator admin or startup admin
**I want** to grant investors access to specific startups
**So that** they can review startup data

**Acceptance Criteria:**

```gherkin
Given I am a startup or incubator admin
When I navigate to /dashboard/settings/investors
Then I see a list of investors with access (FR60, FR64)
And I can click "Grant Access" to add a new investor
And I enter investor email address
And if investor exists as user, they are granted access immediately
And if investor doesn't exist, invitation is sent to create account as INVESTOR_VIEWER
And InvestorGrant record is created linking investor to startup
And investor receives email notification of granted access
And I see which startups each investor can access
And INCUBATOR_ADMIN can grant access to any portfolio startup
And STARTUP_ADMIN can only grant access to their own startup
```

**Technical Notes:**
- Create `app/(dashboard)/settings/investors/page.tsx`
- Create `components/investors/grant-access-modal.tsx`
- API route: `app/api/investors/grant/route.ts` (POST)
- Create InvestorGrant record (investorId, startupId, grantedBy)
- Send email notification to investor
- Query InvestorGrant table to show existing access
- Validate admin permissions

**FR Mapping:** FR60 (invite investors - admin action), FR64 (grant read-only access)

**Files to Create/Modify:**
- `app/(dashboard)/settings/investors/page.tsx`
- `components/investors/grant-access-modal.tsx`
- `app/api/investors/grant/route.ts`
- Email template for investor access granted

**Prerequisites:** Story 2.1 (auth), Story 1.3 (RBAC with INVESTOR_VIEWER role)

---

### Story 9.2: Build Investor Dashboard View

**As an** investor
**I want** to view startups I have access to
**So that** I can review their progress

**Acceptance Criteria:**

```gherkin
Given I am logged in as INVESTOR_VIEWER
When I navigate to /dashboard
Then I see a list of startups I have access to (FR68, FR69)
And each startup card shows: name, industry, readiness score, document count
And I can click a startup card to view its dashboard
And I see a simplified read-only version of startup dashboard (FR65)
And all edit/upload buttons are hidden
And data is clearly marked as "View Only"
And if I have access to multiple startups, I can compare them side-by-side
```

**Technical Notes:**
- Update `app/(dashboard)/dashboard/page.tsx` - Handle INVESTOR_VIEWER role
- Query InvestorGrant table to get accessible startups
- Display startup cards similar to portfolio view
- Create `components/investors/investor-startup-view.tsx` - Read-only dashboard
- Hide all action buttons (Upload, Edit, Delete, Verify)
- Add "View Only" badge to header
- Support multi-startup comparison view

**FR Mapping:** FR65 (view startup data), FR68 (indicate accessible startups), FR69 (view multiple startups)

**Files to Create/Modify:**
- Update `app/(dashboard)/dashboard/page.tsx` - Investor view
- `components/investors/investor-startup-view.tsx`
- `app/api/investors/startups/route.ts` (GET startups for investor)

**Prerequisites:** Story 9.1

---

### Story 9.3: Enable Investor Document Download and Export

**As an** investor
**I want** to download documents and export data
**So that** I can review information offline

**Acceptance Criteria:**

```gherkin
Given I am viewing a startup as an investor
When I navigate to documents page
Then I can view all verified documents (FR66)
And I can download documents (FR66)
And I can filter by category
And I cannot upload, verify, or delete documents (FR67)
And when I click "Export Data" button
Then I can download startup data as PDF or CSV
And export includes: company info, metrics, assessment scores, document list
And downloads are logged in audit log
```

**Technical Notes:**
- Reuse document list component with read-only mode
- API permissions: Allow INVESTOR_VIEWER to GET/download documents
- Hide upload/edit/delete UI for investors
- Create `app/api/investors/export/route.ts` (GET - generate PDF/CSV)
- Use @react-pdf/renderer for PDF export
- Include all relevant startup data in export
- Log all downloads and exports in AuditLog

**FR Mapping:** FR66 (download documents and export data), FR67 (cannot edit)

**Files to Create/Modify:**
- Update `app/(dashboard)/documents/page.tsx` - Read-only mode for investors
- `app/api/investors/export/route.ts`
- `lib/export-generator.ts` - PDF/CSV generation

**Prerequisites:** Story 9.2, Story 4.5 (document download)

---

### Story 9.4: Implement Revoke Investor Access

**As an** admin
**I want** to revoke investor access
**So that** I can control who sees startup data

**Acceptance Criteria:**

```gherkin
Given I am viewing the investors list
When I click "Revoke Access" on an investor
Then a confirmation dialog appears
And confirming deletion removes the InvestorGrant record
And investor loses access immediately
And investor is notified via email
And revocation is logged in audit log
And investor can be re-granted access later
```

**Technical Notes:**
- Add "Revoke" button to investor list
- API route: `app/api/investors/grant/[id]/route.ts` (DELETE)
- Delete InvestorGrant record
- Investor no longer sees startup in their dashboard
- Send email notification
- Log in AuditLog

**FR Mapping:** Admin control over FR64 (manage access)

**Files to Create/Modify:**
- Update `app/(dashboard)/settings/investors/page.tsx` - Add revoke button
- `app/api/investors/grant/[id]/route.ts` (DELETE)
- Email template for access revoked

**Prerequisites:** Story 9.1

---

## EPIC-10: Settings & Configuration

**User Value:** Users can manage their profiles, company information, billing details, and platform preferences

**Description:** This epic implements comprehensive settings pages for profile management, company configuration, subscription/billing information, and platform help/support resources.

**Success Criteria:**
- ✅ Users can update profile settings
- ✅ Startup admins can update company information
- ✅ Users can view subscription and billing info
- ✅ Users can access help center and support
- ✅ Settings are organized and easy to navigate

**FR Coverage:** FR70, FR71, FR72, FR73, FR74, FR75, FR76, FR77

**Prerequisites:** EPIC-2 (auth)

---

### Story 10.1: Enhance Profile Settings Page

**As a** user
**I want** to update my personal profile
**So that** my information is current

**Acceptance Criteria:**

```gherkin
Given I navigate to /dashboard/settings (default tab: Profile)
When I view the profile settings page
Then I see my current profile information (FR70):
  - Name
  - Email
  - Profile photo
  - Password change option
And I can update name, email, and upload new profile photo
And I can change my password (requires current password)
And changes are saved immediately with auto-save or "Save" button
And success message confirms update
And profile photo is uploaded to Vercel Blob
```

**Technical Notes:**
- Expand on Story 2.4 profile settings
- Create `app/(dashboard)/settings/page.tsx` with tabs (Profile, Company, Billing, Help)
- Use react-hook-form for profile form
- API route: `app/api/users/[id]/route.ts` (PUT - update profile)
- Password change validates current password before updating
- Use bcryptjs to hash new password
- Profile photo upload to Vercel Blob

**FR Mapping:** FR70 (update profile settings)

**Files to Create/Modify:**
- `app/(dashboard)/settings/page.tsx` (with tabs)
- `components/settings/profile-form.tsx`
- Update `app/api/users/[id]/route.ts` - Profile updates

**Prerequisites:** Story 2.4 (basic profile)

---

### Story 10.2: Build Company Settings Page

**As a** startup admin
**I want** to update my company information
**So that** our profile is accurate

**Acceptance Criteria:**

```gherkin
Given I am STARTUP_ADMIN
When I navigate to /dashboard/settings?tab=company
Then I see company information form (FR71):
  - Company name
  - Logo
  - Industry
  - Website
  - Description
And I can update all fields
And logo is uploaded to Vercel Blob
And changes update the Startup record
And success message confirms update
And non-admin users see read-only view
```

**Technical Notes:**
- Create `components/settings/company-form.tsx`
- API route: `app/api/startups/[id]/route.ts` (PUT - update startup)
- Validate role (STARTUP_ADMIN or INCUBATOR_ADMIN only)
- Upload logo to Vercel Blob
- Display logo in header and other places after update

**FR Mapping:** FR71 (update company information)

**Files to Create/Modify:**
- `components/settings/company-form.tsx`
- Update `app/api/startups/[id]/route.ts` (PUT)
- Add company tab to settings page

**Prerequisites:** Story 10.1

---

### Story 10.3: Create Billing and Subscription Page

**As a** user
**I want** to view subscription and billing information
**So that** I understand my account status

**Acceptance Criteria:**

```gherkin
Given I navigate to /dashboard/settings?tab=billing
When I view the billing page
Then I see subscription information (FR72):
  - Current plan (e.g., "Startup Plan - 20,000 THB/year")
  - Billing cycle (annual)
  - Next renewal date
  - Payment method (if configured)
  - Discount applied (50% first year if applicable)
And I see billing history (past invoices)
And I can download invoices as PDF
And I can update payment method (placeholder for MVP - full implementation later)
And INCUBATOR_ADMIN sees platform-wide billing
And STARTUP_ADMIN sees their startup's billing
```

**Technical Notes:**
- Create `components/settings/billing-info.tsx`
- API route: `app/api/billing/route.ts` (GET subscription info)
- For MVP: Display static billing info (full payment integration post-MVP)
- Store subscription data in Subscription table (add to schema)
- Generate invoice PDFs with @react-pdf/renderer
- Link to external payment portal if using Stripe/etc.

**FR Mapping:** FR72 (view subscription and billing)

**Files to Create/Modify:**
- `components/settings/billing-info.tsx`
- `app/api/billing/route.ts`
- `prisma/schema.prisma` - Add Subscription model
- Add billing tab to settings page

**Prerequisites:** Story 10.1

---

### Story 10.4: Build Help Center and Support Page

**As a** user
**I want** to access help documentation and submit support tickets
**So that** I can get assistance when needed

**Acceptance Criteria:**

```gherkin
Given I navigate to /dashboard/support
When I view the support page
Then I see help center resources (FR75):
  - FAQ section
  - Documentation links
  - Video tutorials (embedded or links)
  - Feature guides
And I can search help articles (FR75)
And I can submit a support ticket (FR76):
  - Subject
  - Description
  - Priority (Low, Medium, High)
  - Attachments
And submitted tickets are saved and admin is notified
And I can view my ticket history
And success message confirms ticket submission
```

**Technical Notes:**
- Create `app/(dashboard)/support/page.tsx`
- Create `components/support/help-center.tsx` - FAQ and documentation
- Create `components/support/submit-ticket.tsx` - Support ticket form
- API route: `app/api/support/tickets/route.ts` (GET, POST)
- Store tickets in SupportTicket table (add to schema)
- Send email notification to admin on new ticket
- Implement search for help articles (client-side filter for MVP)

**FR Mapping:** FR75 (help center), FR76 (submit support tickets)

**Files to Create/Modify:**
- `app/(dashboard)/support/page.tsx`
- `components/support/help-center.tsx`
- `components/support/submit-ticket.tsx`
- `app/api/support/tickets/route.ts`
- `prisma/schema.prisma` - Add SupportTicket model

**Prerequisites:** Story 10.1

---

### Story 10.5: Implement Privacy, Security Settings, and Platform Admin Panel

**As a** user
**I want** to manage my privacy and security settings
**So that** I control my data and account security

**Acceptance Criteria:**

```gherkin
Given I navigate to /dashboard/settings?tab=privacy
When I view privacy and security settings
Then I can configure (FR74):
  - Data sharing preferences
  - Profile visibility
  - Two-factor authentication (2FA) enable/disable
  - Account deletion request
And changes are saved immediately
And enabling 2FA shows QR code for authenticator app
And account deletion sends confirmation email
And as INCUBATOR_ADMIN (platform owner), I can access admin panel (FR73):
  - Platform-wide settings
  - User management
  - Feature flags
  - System health monitoring
```

**Technical Notes:**
- Create `components/settings/privacy-form.tsx`
- Create `app/(dashboard)/admin/page.tsx` (INCUBATOR_ADMIN only)
- API routes:
  - `app/api/settings/privacy/route.ts` (GET, PUT)
  - `app/api/admin/settings/route.ts` (GET, PUT - platform settings)
- Implement 2FA with NextAuth.js (use authenticator app)
- Store privacy preferences in User or UserPreference table
- Admin panel shows platform-wide controls

**FR Mapping:** FR73 (platform settings - admin), FR74 (privacy and security)

**Files to Create/Modify:**
- `components/settings/privacy-form.tsx`
- `app/(dashboard)/admin/page.tsx`
- `app/api/settings/privacy/route.ts`
- `app/api/admin/settings/route.ts`
- Add privacy tab to settings page

**Prerequisites:** Story 10.1

---

## EPIC-11: Public Marketing Website

**User Value:** Visitors can learn about DueRify's features, pricing, and value proposition, and sign up for the platform

**Description:** This epic creates the public-facing marketing website with pages for home, features, pricing, contact, and other informational content. The website is accessible without login and drives user acquisition.

**Success Criteria:**
- ✅ Professional homepage showcasing DueRify's value
- ✅ Feature pages explaining capabilities
- ✅ Pricing page with subscription details
- ✅ Contact form for inquiries
- ✅ Signup flow from public pages
- ✅ SEO-optimized content

**FR Coverage:** FR78, FR79, FR80, FR81, FR82, FR83

**Prerequisites:** EPIC-2 (auth/signup)

---

### Story 11.1: Build Homepage

**As a** visitor
**I want** to understand what DueRify offers
**So that** I can decide if it's right for me

**Acceptance Criteria:**

```gherkin
Given I visit https://duerify.com
When the homepage loads
Then I see marketing content (FR78):
  - Hero section: "The Smart Data Room for Verified Startups"
  - Problem statement
  - Solution overview
  - Key features highlights
  - Partner logos
  - Testimonials
  - Call-to-action buttons (Sign Up, Request Demo)
And page is responsive (mobile, tablet, desktop)
And page loads in under 3 seconds
And page is SEO-optimized (meta tags, structured data)
And clicking "Sign Up" navigates to /signup
```

**Technical Notes:**
- Create `app/(public)/page.tsx` (homepage - already exists, enhance)
- Use shadcn/ui components for consistent styling
- Add hero section with large heading and CTA buttons
- Include feature cards (reusable component)
- Add testimonial slider
- Add partner logo grid
- Optimize images with Next.js Image component
- Add meta tags for SEO

**FR Mapping:** FR78 (public marketing content)

**Files to Create/Modify:**
- `app/(public)/page.tsx`
- `components/marketing/hero.tsx`
- `components/marketing/feature-cards.tsx`
- `components/marketing/testimonials.tsx`

**Prerequisites:** None (public pages don't require auth)

---

### Story 11.2: Create Features Pages

**As a** visitor
**I want** to learn about specific features
**So that** I understand what DueRify can do

**Acceptance Criteria:**

```gherkin
Given I visit /features
When the page loads
Then I see an overview of all features (FR79):
  - Document Management
  - One-Pager Dashboard
  - IDE Readiness Assessment
  - Portfolio Management
  - Team Collaboration
And each feature has a card with icon, title, description, and "Learn More" link
And clicking "Learn More" navigates to feature detail page (e.g., /features/documents)
And feature detail pages include:
  - Detailed description
  - Screenshots or demo
  - Use cases
  - Benefits
  - Call-to-action
And pages are responsive and SEO-optimized
```

**Technical Notes:**
- Create `app/(public)/features/page.tsx` - Overview
- Create individual feature pages:
  - `app/(public)/features/documents/page.tsx`
  - `app/(public)/features/one-pager/page.tsx`
  - `app/(public)/features/ide-readiness/page.tsx`
- Use consistent layout for all feature pages
- Include screenshots (mockups or actual UI)
- Add comparison table showing DueRify vs alternatives

**FR Mapping:** FR79 (feature descriptions and benefits)

**Files to Create/Modify:**
- `app/(public)/features/page.tsx`
- `app/(public)/features/documents/page.tsx`
- `app/(public)/features/one-pager/page.tsx`
- `app/(public)/features/ide-readiness/page.tsx`
- `components/marketing/feature-detail.tsx` (reusable template)

**Prerequisites:** None

---

### Story 11.3: Build Pricing Page

**As a** visitor
**I want** to understand pricing and subscription plans
**So that** I can evaluate the cost

**Acceptance Criteria:**

```gherkin
Given I visit /pricing
When the page loads
Then I see subscription plans (FR80):
  - Plan name: "Startup Plan"
  - Price: 20,000 THB/year
  - First-year discount: 50% off (10,000 THB)
  - Features included
  - "Sign Up" button
And I see feature comparison table
And I see FAQ section answering common pricing questions
And page includes trust signals (money-back guarantee, secure payment, etc.)
And page is responsive and SEO-optimized
```

**Technical Notes:**
- Create `app/(public)/pricing/page.tsx`
- Display pricing card with prominent pricing
- Highlight first-year discount
- Add feature checklist
- Include FAQ accordion (shadcn/ui Accordion)
- Link "Sign Up" to /signup with plan preselected

**FR Mapping:** FR80 (pricing plans and subscription details)

**Files to Create/Modify:**
- `app/(public)/pricing/page.tsx`
- `components/marketing/pricing-card.tsx`
- `components/marketing/pricing-faq.tsx`

**Prerequisites:** None

---

### Story 11.4: Create Contact Page

**As a** visitor
**I want** to contact DueRify team
**So that** I can ask questions or request a demo

**Acceptance Criteria:**

```gherkin
Given I visit /contact
When the page loads
Then I see contact information and form (FR81):
  - Contact form (name, email, company, message)
  - Office location (if applicable)
  - Email address
  - Social media links
And submitting form sends email to DueRify team (FR81)
And success message confirms submission
And form validation ensures required fields filled
And form includes CAPTCHA to prevent spam
And page is responsive
```

**Technical Notes:**
- Create `app/(public)/contact/page.tsx`
- Create `components/marketing/contact-form.tsx`
- API route: `app/api/contact/route.ts` (POST)
- Store inquiries in ContactInquiry table (add to schema)
- Send email notification to admin
- Use Resend for email delivery
- Add reCAPTCHA or similar spam protection

**FR Mapping:** FR81 (contact form inquiries)

**Files to Create/Modify:**
- `app/(public)/contact/page.tsx`
- `components/marketing/contact-form.tsx`
- `app/api/contact/route.ts`
- `prisma/schema.prisma` - Add ContactInquiry model

**Prerequisites:** None

---

### Story 11.5: Enhance Signup Flow from Public Pages

**As a** visitor
**I want** to sign up easily from any public page
**So that** I can start using DueRify quickly

**Acceptance Criteria:**

```gherkin
Given I am on any public page
When I click "Sign Up" or "Get Started" button
Then I am redirected to /signup (FR82)
And signup page shows account type selection (Startup, Incubator, Investor)
And signup flow is streamlined with minimal fields
And successful signup redirects to onboarding or dashboard
And signup flow remembers context (e.g., selected plan from pricing page)
And social signup (Google OAuth) is prominent
```

**Technical Notes:**
- Already implemented in Story 2.2 - enhance with marketing context
- Pass query params from public pages (e.g., /signup?plan=startup)
- Streamline signup form (name, email, password only)
- Add onboarding flow after signup (welcome message, quick tour)
- Track signup source (which page user came from) for analytics

**FR Mapping:** FR82 (sign up from public pages)

**Files to Create/Modify:**
- Update `app/(auth)/signup/page.tsx` - Handle query params
- Create `app/(dashboard)/onboarding/page.tsx` (optional onboarding)
- Update all public CTAs to link to signup with context

**Prerequisites:** Story 2.2 (signup page)

---

### Story 11.6: Add Partners and Testimonials Section

**As a** visitor
**I want** to see partner logos and testimonials
**So that** I trust DueRify's credibility

**Acceptance Criteria:**

```gherkin
Given I visit the homepage or about page
When I scroll to partners section
Then I see partner logos (FR83):
  - Backster
  - Tembusutech
  - TusStar
  - Atrustia
  - TED Fund
  - NIA
  - Thai BISPA
And I see testimonials from users
And partner logos are displayed in a grid
And testimonials include user name, role, company, and quote
And section is responsive
```

**Technical Notes:**
- Add partners section to homepage
- Create `components/marketing/partners-grid.tsx`
- Create `components/marketing/testimonial-slider.tsx`
- Store partner data in JSON or hardcode
- Use Next.js Image for optimized logo loading
- Implement testimonial slider with arrows or auto-scroll

**FR Mapping:** FR83 (partner logos and testimonials)

**Files to Create/Modify:**
- `components/marketing/partners-grid.tsx`
- `components/marketing/testimonial-slider.tsx`
- Update `app/(public)/page.tsx` - Add partners section
- Create `/public/images/partners/` - Store partner logos

**Prerequisites:** Story 11.1 (homepage)

---

## Post-MVP: Growth Features (FR84-FR95)

**Description:** These features are planned for post-MVP development after the core platform is validated with users. They add advanced capabilities for financial tracking, grant discovery, compliance management, community engagement, and platform expansion.

**FR Coverage:** FR84, FR85, FR86, FR87, FR88, FR89, FR90, FR91, FR92, FR93, FR94, FR95

**Growth Features Summary:**

1. **Financial Metrics & Tracking (FR84-86)**
   - Revenue projections, burn rate, runway calculations
   - Automated financial document parsing
   - Key financial ratio calculations
   - Financial health alerts

2. **Grant Discovery & Advice BOT (FR87-88)**
   - AI-powered chatbot for grant discovery
   - Grant database with filtering and eligibility checking
   - Application guidance and templates
   - Deadline tracking and reminders

3. **Regulatory & Compliance (FR89-90)**
   - Industry-specific compliance checklists
   - Legal requirement tracking
   - Compliance status dashboard
   - Legal document template library

4. **Community Features (FR91-92)**
   - Startup community forum
   - Success stories showcase
   - Events and workshops calendar
   - Networking and matchmaking

5. **Funding Opportunities (FR93)**
   - Funding opportunity matching algorithm
   - Match score based on startup profile
   - Application status tracking
   - Saved opportunities list

6. **Platform Expansion (FR94-95)**
   - API access for third-party integrations
   - Data export in multiple formats (CSV, JSON, PDF)
   - Webhook support for event notifications
   - Developer documentation

**Implementation Priority:** These features will be prioritized based on user feedback and business needs after MVP launch.

---

## FR Coverage Matrix

This matrix ensures all 95 functional requirements are mapped to specific epics and stories.

| FR ID | Requirement | Epic | Stories |
|-------|-------------|------|---------|
| **Authentication & User Management (FR1-7)** |
| FR1 | Create accounts with email/password or Google OAuth | EPIC-2 | Story 2.1, 2.2 |
| FR2 | Log in securely | EPIC-2 | Story 2.1, 2.2 |
| FR3 | Reset forgotten passwords | EPIC-2 | Story 2.3 |
| FR4 | Update profile information | EPIC-2 | Story 2.4 |
| FR5 | Assigned to multiple startups | EPIC-2 | Story 2.5 |
| FR6 | Switch between startup contexts | EPIC-2 | Story 2.5 |
| FR7 | Display current startup context | EPIC-2 | Story 2.5 |
| **Portfolio Management (FR8-14)** |
| FR8 | View portfolio dashboard | EPIC-3 | Story 3.1 |
| FR9 | Add new startups | EPIC-3 | Story 3.2 |
| FR10 | Remove startups | EPIC-3 | Story 3.3 |
| FR11 | View portfolio analytics | EPIC-3 | Story 3.4 |
| FR12 | Generate portfolio reports | EPIC-3 | Story 3.5 |
| FR13 | Startup cards with metrics | EPIC-3 | Story 3.1 |
| FR14 | Sort and filter portfolio | EPIC-3 | Story 3.6 |
| **Document Management (FR15-27)** |
| FR15 | Upload documents | EPIC-4 | Story 4.1 |
| FR16 | Organize into categories | EPIC-4 | Story 4.1, 4.2 |
| FR17 | Create custom categories | EPIC-4 | Story 4.2 |
| FR18 | Search documents | EPIC-4 | Story 4.3 |
| FR19 | Filter by category and status | EPIC-4 | Story 4.3 |
| FR20 | Download documents | EPIC-4 | Story 4.5 |
| FR21 | Delete documents | EPIC-4 | Story 4.5 |
| FR22 | Track version history | EPIC-4 | Story 4.6 |
| FR23 | Mark documents as verified | EPIC-4 | Story 4.4 |
| FR24 | Display verification status | EPIC-4 | Story 4.4 |
| FR25 | View document counts | EPIC-4 | Story 4.7 |
| FR26 | Secure cloud storage | EPIC-4 | Story 4.1 |
| FR27 | Tenant isolation | EPIC-4 | Story 4.8 |
| **One-Pager (FR28-38)** |
| FR28 | Create one-pager | EPIC-5 | Story 5.1 |
| FR29 | Editable form fields | EPIC-5 | Story 5.1 |
| FR30 | Save drafts | EPIC-5 | Story 5.1 |
| FR31 | Preview one-pager | EPIC-5 | Story 5.2 |
| FR32 | Generate shareable link | EPIC-5 | Story 5.4 |
| FR33 | Generate QR code | EPIC-5 | Story 5.4 |
| FR34 | Track view count | EPIC-5 | Story 5.3, 5.5 |
| FR35 | View analytics | EPIC-5 | Story 5.5 |
| FR36 | Download PDF | EPIC-5 | Story 5.6 |
| FR37 | Public access without login | EPIC-5 | Story 5.3 |
| FR38 | Enable/disable public access | EPIC-5 | Story 5.7 |
| **IDE Assessment (FR39-47)** |
| FR39 | Complete 4-dimension assessments | EPIC-6 | Story 6.1, 6.2 |
| FR40 | Questionnaire interface | EPIC-6 | Story 6.2 |
| FR41 | Calculate overall score | EPIC-6 | Story 6.3 |
| FR42 | Radar chart visualization | EPIC-6 | Story 6.1, 6.3 |
| FR43 | Track history over time | EPIC-6 | Story 6.4 |
| FR44 | Generate recommendations | EPIC-6 | Story 6.5 |
| FR45 | Detailed score breakdown | EPIC-6 | Story 6.1, 6.3 |
| FR46 | Completion status indicator | EPIC-6 | Story 6.1 |
| FR47 | Retake assessments | EPIC-6 | Story 6.6 |
| **Dashboard & Analytics (FR48-55)** |
| FR48 | Startup dashboard | EPIC-7 | Story 7.1 |
| FR49 | Display key metrics | EPIC-7 | Story 7.1 |
| FR50 | Radar chart on dashboard | EPIC-7 | Story 7.1 |
| FR51 | Quick action shortcuts | EPIC-7 | Story 7.2 |
| FR52 | Portfolio dashboard (incubator) | EPIC-7 | Story 7.4 |
| FR53 | Performance metrics | EPIC-7 | Story 7.5 |
| FR54 | Document completion % | EPIC-7 | Story 7.1 |
| FR55 | Recent activity feed | EPIC-7 | Story 7.3 |
| **Team Management (FR56-63)** |
| FR56 | Invite team members | EPIC-8 | Story 8.1, 8.2 |
| FR57 | Email invitations | EPIC-8 | Story 8.2 |
| FR58 | Assign roles | EPIC-8 | Story 8.3 |
| FR59 | Remove team members | EPIC-8 | Story 8.4 |
| FR60 | Invite investors | EPIC-9 | Story 9.1 |
| FR61 | Notification emails | EPIC-8 | Story 8.5 |
| FR62 | Configure notifications | EPIC-8 | Story 8.6 |
| FR63 | Audit log | EPIC-8 | Story 8.6 |
| **Investor Access (FR64-69)** |
| FR64 | Grant read-only access | EPIC-9 | Story 9.1 |
| FR65 | View startup data | EPIC-9 | Story 9.2 |
| FR66 | Download documents | EPIC-9 | Story 9.3 |
| FR67 | Cannot edit data | EPIC-9 | Story 9.2, 9.3 |
| FR68 | Indicate accessible startups | EPIC-9 | Story 9.2 |
| FR69 | View multiple startups | EPIC-9 | Story 9.2 |
| **Settings (FR70-77)** |
| FR70 | Update profile settings | EPIC-10 | Story 10.1 |
| FR71 | Update company information | EPIC-10 | Story 10.2 |
| FR72 | View billing information | EPIC-10 | Story 10.3 |
| FR73 | Platform-wide settings (admin) | EPIC-10 | Story 10.5 |
| FR74 | Privacy and security settings | EPIC-10 | Story 10.5 |
| FR75 | Help center | EPIC-10 | Story 10.4 |
| FR76 | Submit support tickets | EPIC-10 | Story 10.4 |
| FR77 | Live chat (optional MVP) | EPIC-10 | Story 10.4 (deferred) |
| **Public Website (FR78-83)** |
| FR78 | Marketing content | EPIC-11 | Story 11.1 |
| FR79 | Feature descriptions | EPIC-11 | Story 11.2 |
| FR80 | Pricing information | EPIC-11 | Story 11.3 |
| FR81 | Contact form | EPIC-11 | Story 11.4 |
| FR82 | Sign up from public pages | EPIC-11 | Story 11.5 |
| FR83 | Partner logos and testimonials | EPIC-11 | Story 11.6 |
| **Growth Features (FR84-95)** - Post-MVP |
| FR84-95 | Advanced features | Post-MVP | See Growth Features summary |

**Total MVP Coverage:** 83 FRs across 61 stories in 11 epics
**Post-MVP:** 12 FRs for future development

---

## Implementation Sequence

**Recommended Development Order:**

1. **Phase 1 - Foundation** (Week 1-2)
   - EPIC-1: Project Foundation & Setup (3 stories)
   - EPIC-2: User Authentication (5 stories)
   - Deploy basic authentication and infrastructure

2. **Phase 2 - Core Features** (Week 3-6)
   - EPIC-4: Document Management (8 stories)
   - EPIC-5: One-Pager Creation (7 stories)
   - EPIC-6: IDE Assessment (6 stories)
   - Deploy core startup features

3. **Phase 3 - Portfolio & Dashboard** (Week 7-9)
   - EPIC-3: Portfolio Management (6 stories)
   - EPIC-7: Main Dashboard (5 stories)
   - Deploy incubator portfolio features

4. **Phase 4 - Team & Access** (Week 10-11)
   - EPIC-8: Team Management (6 stories)
   - EPIC-9: Investor Access (4 stories)
   - Deploy collaboration features

5. **Phase 5 - Settings & Marketing** (Week 12-13)
   - EPIC-10: Settings & Configuration (5 stories)
   - EPIC-11: Public Marketing Website (6 stories)
   - Deploy settings and public website

6. **Phase 6 - Testing & Launch** (Week 14)
   - Integration testing across all epics
   - Bug fixes and refinements
   - Performance optimization
   - MVP Launch

**Total Estimated Timeline:** 14 weeks (3.5 months) for MVP

---

_This epic breakdown document provides a complete roadmap for implementing DueRify, transforming 95 functional requirements into 61 implementable user stories organized by user value delivery._

_Generated using the BMad Method - Epic & Story Creation Workflow v1.0_
_Date: 2025-11-17_
_For: Gump_

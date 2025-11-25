# EPIC-12: Landing Page Builder

**User Value:** Startups can create beautiful, professional landing pages with a drag-and-drop WYSIWYG editor without needing coding skills.

**Description:** This epic implements a Landing Page Builder using Puck editor, allowing startups to create custom landing pages with pre-built, startup-focused components. Pages can be published with unique URLs and shared with investors or customers.

**Status:** In Progress

---

## Success Criteria
- [ ] Users can create new landing pages with WYSIWYG editor
- [ ] Drag-and-drop component placement works smoothly
- [ ] Pages auto-save during editing
- [ ] Pages can be published/unpublished
- [ ] Public URLs work for published pages
- [ ] Mobile-responsive preview and output
- [ ] At least 10 pre-built components available

---

## Stories

### Story 12.1: Setup & Navigation
**As a** startup user
**I want** to see "Landing Page" in the navigation menu
**So that** I can access the landing page builder

**Acceptance Criteria:**
- Install @measured/puck package
- Add "Landing Page" link to sidebar under "One-Pager"
- Add link to mobile navigation
- Create database model for storing landing pages

**Files:**
- `package.json` - Add puck dependency
- `prisma/schema.prisma` - Add LandingPage model
- `app/(dashboard)/layout.tsx` - Add sidebar link
- `components/layout/mobile-sidebar.tsx` - Add mobile link

---

### Story 12.2: Landing Page Database Model
**As a** developer
**I want** a database model to store landing page data
**So that** pages can be persisted and retrieved

**Schema:**
```prisma
model LandingPage {
  id          String   @id @default(cuid())
  startupId   String
  startup     Startup  @relation(fields: [startupId], references: [id], onDelete: Cascade)

  title       String
  slug        String   @unique
  isPublished Boolean  @default(false)
  data        Json     // Puck editor JSON data

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([startupId])
  @@index([slug])
  @@map("landing_pages")
}
```

---

### Story 12.3: Puck Configuration & Components
**As a** startup user
**I want** pre-built components optimized for startups
**So that** I can quickly build professional landing pages

**Components to Build:**

| Category | Component | Description |
|----------|-----------|-------------|
| Layout | Columns | 2, 3, 4 column layouts |
| Layout | Section | Full-width section with background options |
| Layout | Container | Centered max-width container |
| Hero | Hero | Headline, subheadline, CTA, image |
| Content | Heading | H1-H6 with styling options |
| Content | Text | Paragraph with alignment |
| Content | Button | Primary/secondary/outline variants |
| Content | Image | With alt text and sizing |
| Content | Card | Icon, title, description |
| Content | Features | Grid of feature cards |
| Content | Testimonial | Quote with author |
| Content | Stats | Number counters |
| CTA | CTABanner | Call-to-action section |
| Footer | Footer | Links and copyright |

**Files:**
- `lib/puck/config.tsx` - Main Puck configuration
- `lib/puck/components/` - Individual component files

---

### Story 12.4: Editor Page
**As a** startup user
**I want** a visual editor to build my landing page
**So that** I can design without coding

**Acceptance Criteria:**
- List view showing all landing pages for startup
- "Create New Page" button
- Editor page with Puck WYSIWYG interface
- Save button (manual save)
- Publish/Unpublish toggle
- Preview mode
- Back to list navigation

**Files:**
- `app/(dashboard)/landing-page/page.tsx` - List view
- `app/(dashboard)/landing-page/page-client.tsx` - Client component
- `app/(dashboard)/landing-page/[id]/edit/page.tsx` - Editor page
- `app/(dashboard)/landing-page/[id]/edit/page-client.tsx` - Editor client

---

### Story 12.5: API Routes
**As a** developer
**I want** API endpoints for landing page CRUD
**So that** the frontend can manage pages

**Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/landing-pages | List pages for startup |
| POST | /api/landing-pages | Create new page |
| GET | /api/landing-pages/[id] | Get page by ID |
| PUT | /api/landing-pages/[id] | Update page |
| DELETE | /api/landing-pages/[id] | Delete page |

**Files:**
- `app/api/landing-pages/route.ts`
- `app/api/landing-pages/[id]/route.ts`

---

### Story 12.6: Public Rendering
**As a** visitor
**I want** to view published landing pages
**So that** I can learn about the startup

**Acceptance Criteria:**
- Public route at `/page/[slug]`
- Only shows published pages
- Uses Puck's Render component
- Mobile responsive
- SEO meta tags

**Files:**
- `app/page/[slug]/page.tsx` - Public page

---

## Technical Notes

### Puck Editor Integration
- Use `@measured/puck` package
- Configure with custom components in `lib/puck/config.tsx`
- Store page data as JSON in database
- Use `<Puck>` for editor, `<Render>` for public view

### Component Design Principles
- All components use Tailwind CSS
- Responsive by default (mobile-first)
- Configurable via Puck fields (text, select, color, etc.)
- Follow DueRify design system colors

### Data Flow
1. User opens editor → Fetch existing data from API
2. User edits → Puck manages state internally
3. User saves → POST/PUT to API with Puck data JSON
4. Visitor views → Fetch data, render with `<Render>`

---

## Dependencies
- `@measured/puck` - Visual editor framework
- Existing: Tailwind CSS, shadcn/ui, Prisma

## Estimated Effort
- Story 12.1: Small (navigation + setup)
- Story 12.2: Small (database model)
- Story 12.3: Large (15+ components)
- Story 12.4: Medium (editor UI)
- Story 12.5: Small (CRUD API)
- Story 12.6: Small (public rendering)

**Total: ~1 sprint**

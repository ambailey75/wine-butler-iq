# Wine Butler IQ — Claude Code Build Guide
**Domain:** winebutleriq.com  
**Repo:** https://github.com/ambailey75/Cellar-ai  
**Vercel:** https://cellar-ai-black.vercel.app (update alias to winebutleriq.com)  
**PRD:** CellarAI_PRD_v1.1.docx  
**Workforce:** C:\Users\amand\ClaudeWorkspace\Projects\Scheduled\ai-workforce\WORKFORCE.md

---

## How to Use This Guide

Each phase has:
1. A `/plan` prompt — paste this first so Claude Code plans before acting
2. A build prompt — paste after approving the plan
3. A verification checklist — confirm before moving to the next phase
4. Workforce assignments — which agents can run in parallel or async

Run one phase at a time. Do not start Phase 2 until Phase 1 verification passes.

---

## Competitor Intelligence (inform decisions throughout)

**CellarTracker** (cellartracker.com) — market leader, 1.2M+ weekly searches
- Strengths: massive community database (13M reviews), market valuations, drink windows
- Weaknesses: dated UI, no AI assistant, poor mobile experience, steep learning curve
- Our edge: AI assistant, modern UX, import from any format, onboarding in minutes

**InVintory** (invintory.com) — 100k MAU, Apple App of the Day
- Strengths: beautiful mobile UI, 10M+ bottles tracked, $1B wine value tracked
- Weaknesses: mobile-first limits desktop power users, no AI assistant, limited analytics
- Our edge: AI butler, deeper vintage/valuation intelligence, web-first with mobile support

**Positioning for Wine Butler IQ:**
- More intelligent than InVintory (AI assistant, deeper data)
- More modern and approachable than CellarTracker (UX, onboarding, import)
- Unique: the only product where an AI sommelier knows YOUR specific collection

---

## PHASE 1 — Foundation: Supabase, Auth, Database Schema

### /plan prompt (paste into Claude Code first)
```
/plan

Read CLAUDE.md in this project root first.
Also read: C:\Users\amand\ClaudeWorkspace\Projects\Scheduled\ai-workforce\WORKFORCE.md

I am building Wine Butler IQ — a wine inventory tracker and AI sommelier at winebutleriq.com.
The full PRD is at CellarAI_PRD_v1.1.docx in this project root.

Plan Phase 1: Foundation setup. I want to see your complete plan before you write any code.
The plan should cover:
1. Supabase project setup instructions (what I need to do manually in Supabase dashboard)
2. Installing all Phase 1 dependencies
3. Prisma schema covering all entities: User, Wine, WineEnrichment, CellarAlert, AiConversation, Import, ImportRow
4. Supabase Auth configuration (magic link)
5. Environment variable setup
6. Folder structure to create
7. Any decisions I need to make before you proceed

Do not write any code yet. Show me the plan and wait for my approval.
```

### Build prompt (paste after approving the plan)
```
Read CLAUDE.md and CellarAI_PRD_v1.1.docx before starting.

Execute Phase 1 — Foundation:

SUPABASE SETUP:
- Install @supabase/supabase-js @supabase/ssr
- Create lib/supabase/client.ts (browser client)
- Create lib/supabase/server.ts (server client using cookies)
- Create lib/supabase/middleware.ts (session refresh)
- Add middleware.ts at project root for auth session handling

AUTH PAGES:
- Create app/(auth)/login/page.tsx — magic link login form, dark burgundy theme matching current landing page style
- Create app/(auth)/auth/callback/route.ts — Supabase auth callback handler
- Create app/(auth)/layout.tsx — centered auth layout

PRISMA SCHEMA:
Install prisma @prisma/client
Run: npx prisma init

Create prisma/schema.prisma with these models:
- User: id, supabaseId (unique), email, name, preferences (Json), createdAt
- Wine: id, userId (FK), producer, wineName, vintage, country, region, subRegion, classification, varietal, format, quantity, purchasePrice, purchaseDate, vendor, storageLocation, notes, labelPhotoUrl, importId (nullable FK), createdAt, updatedAt
- WineEnrichment: id, wineId (unique FK), criticScores (Json), currentMarketPrice, drinkWindowStart, drinkWindowEnd, peakWindowStart, peakWindowEnd, lastEnrichedAt
- CellarAlert: id, userId (FK), wineId (FK), alertType, triggerDate, deliveredAt, dismissedAt, createdAt
- AiConversation: id, userId (FK), messages (Json), createdAt, updatedAt
- Import: id, userId (FK), sourceType (enum: EXCEL, CSV, PDF, IMAGE), originalFilename, storagePath, status (enum: PENDING, PROCESSING, REVIEW, COMPLETE, FAILED), recordCount, skippedCount, createdAt, completedAt
- ImportRow: id, importId (FK), rawData (Json), mappedData (Json), confidenceScores (Json), status (enum: PENDING, CONFIRMED, SKIPPED), wineId (nullable FK), reviewNotes

ENVIRONMENT:
Create .env.local.example (committed) with all variable names but no values:
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
DIRECT_URL=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
WINE_SEARCHER_API_KEY=

PROTECTED ROUTES:
- Update middleware.ts to redirect unauthenticated users from /dashboard/* to /login
- Redirect authenticated users away from /login to /dashboard

STYLING FOUNDATION:
- Install tailwindcss postcss autoprefixer
- Run: npx shadcn-ui@latest init (use default settings, zinc base color)
- Install lucide-react

After completing, run: npx prisma generate
Then show me the git diff summary and tell me exactly what I need to do manually in the Supabase dashboard to complete this phase.
```

### Phase 1 Verification Checklist
- [ ] `npm run dev` starts without errors
- [ ] `/login` page renders
- [ ] Magic link email sends from Supabase
- [ ] Auth callback redirects to `/dashboard` (404 is fine at this stage)
- [ ] `npx prisma generate` runs clean
- [ ] `.env.local` is in `.gitignore`
- [ ] No secrets committed to git

### Workforce Assignment — Phase 1
| Task | Agent | Mode |
|---|---|---|
| Monitor Supabase dashboard for auth errors | Research agent | Async |
| Document all env vars needed | Documentation agent | After phase completes |

---

## PHASE 2 — Core Inventory: Wine CRUD + Dashboard Shell

### /plan prompt
```
/plan

Read CLAUDE.md first.
Phase 1 is complete: Supabase Auth, Prisma schema, and middleware are working.

Plan Phase 2: Core wine inventory CRUD and dashboard shell.
Cover:
1. Dashboard layout and navigation structure
2. Wine list view — what columns, sorting, filtering approach
3. Add/edit wine form — all fields from PRD Section 4.2
4. Delete wine with confirmation
5. Wine detail view
6. Basic cellar KPI cards (total bottles, estimated value, bottles at peak)
7. Empty state design for new users
8. Component structure you will create

Wait for my approval before writing code.
```

### Build prompt
```
Read CLAUDE.md before starting. Phase 1 is complete.

Execute Phase 2 — Core Wine Inventory:

LAYOUT:
- Create app/dashboard/layout.tsx with sidebar nav: Cellar, Import, Assistant, Alerts, Settings
- Sidebar should be collapsible on mobile
- Dark burgundy (#6B212E) and gold (#B89600) brand colors throughout
- Use shadcn/ui Sheet for mobile nav

DASHBOARD PAGE:
- Create app/dashboard/page.tsx
- KPI cards: Total Bottles, Estimated Value, Bottles at Peak Now, Alerts This Month
- Recent additions list (last 5 wines added)
- Empty state with prominent Import Collection and Add Wine CTA buttons

WINE LIST:
- Create app/dashboard/cellar/page.tsx
- Table view with columns: Producer, Wine Name, Vintage, Region, Varietal, Qty, Purchase Price, Actions
- Search bar filtering across all text fields
- Sort by any column
- Filter panel: Country, Region, Varietal, Vintage range
- Pagination (25 per page)

WINE CRUD:
- Create app/dashboard/cellar/new/page.tsx — Add wine form
- Create app/dashboard/cellar/[id]/page.tsx — Wine detail view
- Create app/dashboard/cellar/[id]/edit/page.tsx — Edit form
- All fields from PRD Section 4.2 (producer, wineName, vintage, country, region, subRegion, classification, varietal, format, quantity, purchasePrice, purchaseDate, vendor, storageLocation, notes)
- Country dropdown (full list), Region text with autocomplete
- Confirmation dialog on delete

API ROUTES:
- Create app/api/wines/route.ts — GET (list with filters), POST (create)
- Create app/api/wines/[id]/route.ts — GET (single), PUT (update), DELETE

SERVER ACTIONS:
Use Next.js server actions for form submissions where appropriate.
All DB queries must use Prisma with userId scoping (never return another user's wines).

After completing, push to git and confirm the dashboard is live at winebutleriq.com/dashboard.
```

### Phase 2 Verification Checklist
- [ ] Can add a wine with all fields
- [ ] Wine appears in cellar list
- [ ] Can edit and delete a wine
- [ ] Search and filter work
- [ ] KPI cards show correct counts
- [ ] No cross-user data leakage (RLS + Prisma userId scoping)
- [ ] Mobile nav works

### Workforce Assignment — Phase 2
| Task | Agent | Mode |
|---|---|---|
| Generate 20 sample wines for testing | Data agent | Run after CRUD is live |
| Write component unit tests | Test agent | Parallel |

---

## PHASE 3 — Collection Import Pipeline

### /plan prompt
```
/plan

Read CLAUDE.md first.
Phases 1 and 2 are complete. Core wine CRUD and dashboard are working.

Plan Phase 3: Collection import pipeline supporting Excel/CSV, PDF invoices, and image/label photos.
Cover:
1. File upload architecture (Supabase Storage buckets needed)
2. How you will handle Excel/CSV column mapping UI
3. How Claude API will be used for PDF extraction and image OCR
4. Import review UI — how users confirm before committing
5. Duplicate detection approach
6. Import history view
7. Error handling for partial imports
8. API route structure

Wait for my approval.
```

### Build prompt
```
Read CLAUDE.md and PRD Section 4.1 before starting. Phases 1 and 2 are complete.

Execute Phase 3 — Collection Import Pipeline:

SUPABASE STORAGE:
Create two buckets via Supabase dashboard (I will do this manually):
- imports (private) — uploaded files
- labels (private) — label photos linked to wine records
Document the RLS policies needed for each bucket.

IMPORT API ROUTES:
- app/api/import/upload/route.ts — accepts file, stores in Supabase Storage, creates Import record, triggers extraction
- app/api/import/[id]/route.ts — GET import status and rows
- app/api/import/[id]/confirm/route.ts — POST to commit confirmed rows as Wine records
- app/api/import/[id]/rows/[rowId]/route.ts — PATCH to update individual row mappings

EXTRACTION LIBRARY (lib/import/):
- excel.ts — parse .xlsx and .csv using xlsx package; return headers + rows as JSON
- pdf.ts — extract text per page using pdf-parse; return page text array
- image.ts — convert image to base64 for Claude vision
- claude-extractor.ts — three functions:
  a) extractFromPdf(pageTexts[]): calls Claude API, returns array of wine record objects with confidence scores
  b) extractFromImage(base64): calls Claude API vision, returns single wine record with confidence scores  
  c) suggestColumnMappings(headers[], sampleRows[]): calls Claude API, returns {sourceColumn: targetField} mapping object
- duplicate-detector.ts — checks new records against existing wines (producer + wineName + vintage + format match)

IMPORT PAGES:
- app/dashboard/import/page.tsx — import hub with three cards: Upload Spreadsheet, Upload Invoice PDF, Upload Label Photos
- app/dashboard/import/[id]/page.tsx — import review page:
  - For Excel/CSV: column mapping UI with AI-suggested mappings, dropdowns to override
  - For PDF/Image: table of extracted records with confidence highlighting (yellow = low confidence field)
  - Duplicate detection warnings with Skip/Merge/Import as New options
  - Confirm Import button
- app/dashboard/import/history/page.tsx — list of past imports with status, file name, record count

IMPORT UX:
- Drag and drop file upload (react-dropzone)
- Real-time progress: Uploading > Extracting > Ready for Review
- Partial import support: user can skip individual rows
- On confirm: create Wine records, trigger enrichment for each, redirect to cellar

After completing, test with a sample Excel file and a PDF. Show me the import review screen.
```

### Phase 3 Verification Checklist
- [ ] Excel/CSV upload shows column mapping UI
- [ ] Claude API correctly suggests column mappings
- [ ] PDF extraction returns wine records
- [ ] Image extraction returns wine details with confidence scores
- [ ] Duplicate detection flags matches
- [ ] Confirmed imports appear in cellar
- [ ] Import history shows past imports
- [ ] Failed imports do not corrupt cellar data

### Workforce Assignment — Phase 3
| Task | Agent | Mode |
|---|---|---|
| Create test fixtures (sample Excel, PDF, images) | Data agent | Before phase starts |
| Monitor Claude API extraction quality | QA agent | During testing |
| Document extraction prompt templates | Documentation agent | After phase completes |

---

## PHASE 4 — AI Assistant (The Butler)

### /plan prompt
```
/plan

Read CLAUDE.md first.
Phases 1-3 are complete. Core inventory and import are working.

Plan Phase 4: The Wine Butler IQ assistant — the core differentiator of this product.
Cover:
1. Chat UI design and placement (sidebar panel vs. full page vs. floating)
2. System prompt architecture — how to inject the user cellar context
3. All 6 tool definitions (get_cellar_inventory, get_wine_enrichment, search_wine_data, get_food_pairing, get_reorder_suggestions, get_cellar_analytics)
4. How to handle streaming responses
5. Conversation history storage
6. How the assistant connects to my AI workforce in WORKFORCE.md
7. Rate limiting and cost controls

Wait for my approval.
```

### Build prompt
```
Read CLAUDE.md, PRD Section 4.3, and C:\Users\amand\ClaudeWorkspace\Projects\Scheduled\ai-workforce\WORKFORCE.md before starting.

Execute Phase 4 — Wine Butler IQ Assistant:

AI CLIENT (lib/ai/):
- client.ts — Anthropic SDK wrapper, server-side only
- system-prompt.ts — builds system prompt with:
  - Persona: "You are the Wine Butler, an expert AI sommelier with encyclopedic knowledge of wine. You know this collector's cellar intimately. You are authoritative but warm, like a trusted personal sommelier. You cite sources for scores and prices. You acknowledge when you are uncertain rather than guessing."
  - User's full cellar inventory injected as structured JSON
  - User preferences
- tools.ts — define all 6 tools for Claude API tool_use:
  - get_cellar_inventory: filter by country, region, varietal, vintage range, readiness
  - get_wine_enrichment: fetch WineEnrichment record for a wine_id
  - search_wine_data: query Wine-Searcher API for wines not in cellar
  - get_food_pairing: return pairing recommendations for a wine profile
  - get_reorder_suggestions: analyze cellar gaps and suggest restocking
  - get_cellar_analytics: return diversity, value, age distribution stats
- tool-executor.ts — handles tool_use responses, executes DB queries, returns results to Claude

ASSISTANT API ROUTE:
- app/api/assistant/route.ts — streaming POST endpoint:
  - Authenticates user
  - Builds system prompt with cellar context
  - Calls Claude API with streaming + tool use
  - Handles tool_use blocks: executes tools, continues conversation
  - Saves conversation to AiConversation table
  - Returns Server-Sent Events stream to client

ASSISTANT UI:
- components/assistant/AssistantPanel.tsx — sliding panel, accessible from all dashboard pages via persistent button
- components/assistant/ChatMessage.tsx — renders user and assistant messages; supports markdown in assistant responses
- components/assistant/ChatInput.tsx — textarea with send button; Enter to send, Shift+Enter for newline
- Suggested prompts for new users:
  - "What should I open tonight with pasta?"
  - "Which of my wines are at peak right now?"
  - "What is my cellar worth?"
  - "What am I missing in my collection?"
  - "Which bottles should I drink before they decline?"

CONVERSATION PERSISTENCE:
- Load last conversation on panel open
- New conversation button
- Conversation history list (last 10)

WORKFORCE INTEGRATION:
Read WORKFORCE.md and identify which agents can be invoked from the assistant's tool execution layer. Document the integration points in lib/ai/workforce-bridge.ts with comments. Implement any direct integrations that are straightforward; flag complex ones for manual review.

After completing, test these queries:
1. "What should I drink tonight with a ribeye steak?"
2. "Which of my Burgundies are approaching their peak?"
3. "What is my collection worth?"
Show me the assistant responses.
```

### Phase 4 Verification Checklist
- [ ] Assistant panel opens from dashboard
- [ ] Streaming responses render correctly
- [ ] Tool use executes and returns cellar data
- [ ] Food pairing recommendations are wine-specific
- [ ] Conversation saves and reloads
- [ ] API key never appears in client bundle
- [ ] Response latency under 4 seconds (p95)
- [ ] Workforce bridge documented

### Workforce Assignment — Phase 4
| Task | Agent | Mode |
|---|---|---|
| Run 20 test queries and score response quality | QA agent | After phase completes |
| Monitor Claude API costs per session | Cost monitor agent | Ongoing |
| Generate suggested prompt library | Content agent | Parallel |

---

## PHASE 5 — Enrichment Pipeline + Alerts

### Build prompt
```
Read CLAUDE.md before starting. Phases 1-4 are complete.

Execute Phase 5 — Wine Enrichment Pipeline and Drink-Window Alerts:

ENRICHMENT (lib/enrichment/):
- wine-searcher.ts — Wine-Searcher API client for pricing and vintage data
- enrichment-job.ts — for a given Wine record:
  1. Query Wine-Searcher for current market price
  2. Query for critic scores (Wine Spectator, Wine Advocate where available)
  3. Calculate drink window start/end and peak window from vintage + varietal data
  4. Upsert WineEnrichment record
  5. Create CellarAlert if wine is entering or leaving peak window

ENRICHMENT TRIGGERS:
- On wine create or import confirm: call enrichment-job async (do not block UI)
- app/api/enrichment/[wineId]/route.ts — manual refresh endpoint
- Vercel cron: app/api/cron/enrichment/route.ts — nightly refresh for wines enriched > 30 days ago (add to vercel.json crons)

ALERTS:
- app/api/cron/alerts/route.ts — nightly evaluation:
  - Find wines entering peak window in next 90 days
  - Find wines leaving peak window in next 90 days
  - Create CellarAlert records
  - Add to vercel.json cron schedule
- app/dashboard/alerts/page.tsx — alerts list with dismiss, grouped by urgency
- Notification badge on sidebar Alerts nav item

DASHBOARD ENRICHMENT UI:
- Wine list: show drinking window status badge (Too Young / Approaching / At Peak / Declining)
- Wine detail page: show full enrichment data — critic scores, current value, drink window chart
- KPI card: update Estimated Value from enrichment data

After completing, manually trigger enrichment for 3 wines and confirm data appears.
```

### Phase 5 Verification Checklist
- [ ] Enrichment runs on wine create
- [ ] Critic scores and pricing appear on wine detail
- [ ] Drink window badges show in wine list
- [ ] Alerts generated for peak window events
- [ ] Cron routes return 200 with valid auth header
- [ ] Dashboard value KPI updates from enrichment data

---

## PHASE 6 — Polish, Landing Page + Production Readiness

### Build prompt
```
Read CLAUDE.md before starting. Phases 1-5 are complete.

Execute Phase 6 — Landing Page, Polish, and Production Readiness:

LANDING PAGE (app/page.tsx — replace Coming Soon):
Design a premium wine-dark landing page for winebutleriq.com:
- Hero: "Meet Your Wine Butler" — tagline: "An AI sommelier that knows your cellar."
- Three feature columns: Track Your Collection / Get Expert Guidance / Never Miss a Peak
- Import section: "Already tracking in Excel? Import in minutes."
- Social proof section: placeholder for future testimonials
- CTA: "Start Free" → /login
- Footer: winebutleriq.com | © 2026 Bailey Applied Intelligence
- Style: dark burgundy (#1a0a0e background), gold accents (#B89600), Georgia serif headings, fully responsive

PRODUCTION CHECKLIST:
- Add error boundaries to all major pages
- Add loading skeletons for wine list, dashboard, assistant
- Implement rate limiting on /api/assistant route (10 requests/minute per user)
- Add Sentry error tracking (install @sentry/nextjs, configure dsn from env var)
- Verify all pages pass Lighthouse accessibility audit (target 90+)
- Add robots.txt and sitemap.xml
- Update page metadata (title, description, og:image) for all routes
- Ensure all API routes validate auth before any DB query
- Run: npm run build — fix all TypeScript errors and warnings

VERCEL:
- Update vercel.json with cron schedules for enrichment and alerts
- Confirm winebutleriq.com domain is correctly aliased in Vercel dashboard
- Add all production environment variables to Vercel dashboard

After completing, run npm run build and share the output. Then push to main for final production deploy.
```

---

## Workforce Integration Map

Based on your WORKFORCE.md, here is how your AI agents map to Wine Butler IQ tasks. Claude Code should read WORKFORCE.md and validate/expand this mapping in Phase 4.

| Workforce Agent | Wine Butler IQ Role | Phase |
|---|---|---|
| Research agent | Vintage data research, Wine-Searcher API queries, competitor monitoring | 5+ |
| Data agent | Generate test fixtures, seed data, sample cellar imports | 2-3 |
| Content agent | Suggested assistant prompts, food pairing content, wine region descriptions | 4 |
| QA agent | Test import extraction quality, assistant response scoring | 3-4 |
| Documentation agent | Keep CLAUDE.md updated, document API endpoints, enrichment sources | All |
| Cost monitor agent | Track Claude API spend per user session, alert on anomalies | 4+ |

**Workforce bridge in the product (Phase 4):**
The AI assistant's tool execution layer (`tool-executor.ts`) can invoke workforce agents for tasks that benefit from async processing — for example, triggering a deep research agent to find obscure vintage data when the Wine-Searcher API returns no results. Document these touchpoints in `lib/ai/workforce-bridge.ts`.

---

## Key Decisions Log

| Decision | Recommendation | Rationale |
|---|---|---|
| Wine data API | Wine-Searcher (commercial license required) | Most comprehensive pricing + vintage data |
| Auth method | Supabase magic link (Phase 1), add Google OAuth in Phase 2 | Fastest to implement; collectors skew older, magic link is familiar |
| Conversation persistence | Yes, persist across sessions | Core to "butler" experience — it should remember context |
| File storage retention | 90 days for import files, permanent for label photos | Balance cost vs. provenance value |
| Streaming vs. non-streaming | Streaming for assistant | Perceived latency improvement critical for chat UX |
| Drink window data source | Vintage chart logic + Wine-Searcher | Build rule-based fallback if API unavailable |

---

## Quick Reference — PowerShell Commands

```powershell
# Navigate to project
cd C:\Users\amand\ClaudeWorkspace\Projects\OneOff\cellar-ai

# Dev server
npm run dev

# Push and deploy
git add .
git commit -m "message"
git push

# Manual Vercel deploy
vercel --prod

# Prisma commands
npx prisma generate
npx prisma migrate dev --name migration_name
npx prisma studio   # visual DB browser

# Install a package
npm install package-name
```

---

## Notes for Claude Code Sessions

- Always read CLAUDE.md at project root before starting any session
- Always read WORKFORCE.md before Phase 4 and beyond
- Use `/plan` before any phase — do not skip planning
- Commit after each phase completes and verifies
- Never put secrets in code — all config via environment variables
- Server components fetch data directly via Prisma; client components use API routes
- All API routes must verify Supabase session before any database operation
- Brand colors: burgundy `#6B212E`, gold `#B89600`, dark background `#1a0a0e`

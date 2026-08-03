@AGENTS.md

# Adtron Dashboard — AI Agent Briefing

## What This App Is

**红薯榜单 (Redlist / Adtron)** is a Malaysian small-business marketing platform built on the concept of "group-buying influencer campaigns." Multiple merchants (SMEs) split the cost of hiring 20 Xiaohongshu (小红书 / RED) bloggers to write content about their businesses in a curated list-style post (e.g., "KL's Top 8 Cafes"). The platform is in Chinese (Simplified) with some English labels.

There are two distinct user surfaces:
1. **Public-facing site** — landing page, campaign discovery, campaign detail, FAQ, login/register for merchants
2. **Admin panel** — create/edit campaigns, manage FAQ, view leads and users

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.2.4 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 with custom design tokens |
| Animations | Framer Motion v12 |
| Icons | Lucide React |
| Charts | Recharts |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| Secondary store | localStorage (for data that has no Supabase column) |

### Custom Design Tokens (Tailwind)
- `bg-brand` = `#C6F824` (lime green — primary CTA color)
- `bg-main` = dark background
- `bg-surface` = slightly lighter card surface
- `text-secondary` = muted grey text
- Brand text is always `text-bg-main` (dark on lime) when on a brand-colored button

---

## Project Structure

```
src/
  app/
    (public)/               # Public routes (uses public layout with Header)
      page.tsx              # Homepage / landing page
      discover/page.tsx     # Campaign discovery grid
      campaign/[id]/page.tsx # Campaign detail page
      faq/page.tsx          # Full FAQ page
      login/page.tsx        # Merchant login/register
    admin/                  # Admin panel (uses sidebar layout)
      page.tsx              # Admin dashboard / stats
      create/page.tsx       # Create new campaign
      edit/[id]/page.tsx    # Edit existing campaign
      completed/page.tsx    # Completed campaigns list
      leads/page.tsx        # Leads management
      users/page.tsx        # Merchant user management
      settings/page.tsx     # FAQ management (CRUD)
    campaigns/[id]/page.tsx # Legacy route (likely redirect)
    layout.tsx              # Root layout
    globals.css
  components/
    Header.tsx              # Public nav (includes 常见问题 link)
    Sidebar.tsx             # Admin sidebar nav
    SearchableCombobox.tsx  # Reusable location picker
    RecentCampaigns.tsx
    RecentCreatives.tsx
    Comments.tsx
  lib/
    supabaseClient.ts       # Supabase JS client init (env vars)
    supabaseDb.ts           # All Supabase DB/Storage operations
    mockDb.ts               # localStorage fallback + Campaign/MerchantUser/UserLead interfaces
    faqDb.ts                # FAQ CRUD via localStorage (21 pre-seeded FAQs)
    titleExamplesDb.ts      # Per-campaign title examples via localStorage
```

---

## Data Architecture

### Supabase Tables (live DB)
| Table | Key columns |
|---|---|
| `campaigns` | id, title, category, location, audience, description, targetSlots, realFilledSlots, manualBoost, status, image, posters, createdAt, completedAt |
| `leads` | id, companyName, phone, picName, campaignId, createdAt |
| `merchants` | id, user_id, email, companyName, picName, phone, createdAt |

**Supabase Storage bucket:** `campaign-images` (path prefix: `posters/`)

### localStorage Keys
| Key | Purpose |
|---|---|
| `redlist_faqs_v1` | FAQ entries (managed via `faqDb`) |
| `redlist_title_examples_v1` | Per-campaign title examples (`Record<string, string[]>`) |
| `redlist_campaigns_v3` | Legacy mockDb fallback campaigns |
| `redlist_leads_v3` | Legacy mockDb fallback leads |
| `redlist_merchants` | Legacy mockDb merchants |
| `redlist_current_merchant` | Currently logged-in merchant session |

### Critical Rule: titleExamples NOT in Supabase
The `campaigns` Supabase table does **not** have a `titleExamples` column. Title examples are stored exclusively in `localStorage` via `titleExamplesDb`. Never include `titleExamples` in any Supabase insert or update payload — it will cause a silent column error.

---

## Key Data Flows

### Creating a Campaign (admin/create)
1. Validate title + mainImage + at least one category
2. Upload mainImage → Supabase Storage → get public URL
3. Upload each poster → Supabase Storage → get public URLs
4. Insert campaign row (without titleExamples) → get back `saved.id`
5. `titleExamplesDb.set(saved.id, titleExamples)` → localStorage

### Editing a Campaign (admin/edit/[id])
Poster state is split into two buckets:
- `existingPosters: string[]` — already-uploaded Supabase URLs
- `newPosterFiles: File[]` + `newPosterPreviews: string[]` — local files pending upload

On save:
1. If `newMainImageFile` exists, upload it → get new URL; otherwise keep `mainImageUrl`
2. Upload all `newPosterFiles` → get new URLs
3. Combine `existingPosters + newUploadedUrls` → final `posters` array
4. Call `supabaseDb.updateCampaign(id, { image, posters, ...otherFields })` — no titleExamples
5. `titleExamplesDb.set(id, titleExamples)` → localStorage

### Campaign Detail Page (public)
- Fetches campaign from Supabase
- Loads `titleExamples` from `titleExamplesDb.get(id)`
- Loads `displayFaqs` from `faqDb.getFaqsForDisplay()` (localStorage, `displayStatus: true` only)
- Shows "标题范例" section only if `titleExamples.length > 0`
- Shows FAQ accordion only if `displayFaqs.length > 0`

---

## FAQ System

**Storage:** `localStorage` only (no Supabase table for FAQs)

**Categories (FaqCategory type):**
- 关于红薯榜单
- 合作模式与流程
- 博主与内容
- 费用与支付
- 效果与报告

**Admin management:** `admin/settings/page.tsx` — full CRUD with toggle for `displayStatus`

**Public display:**
- `/faq` — full page with category filter tabs
- `/` (homepage) — shows first 4 `displayStatus: true` FAQs + CTA to `/faq`
- Campaign detail page — shows all `displayStatus: true` FAQs at the bottom

**Important:** FAQ answer strings must use single-quote string delimiters in source code because answers contain Chinese double-quote characters `"` and `"` that would break double-quoted JS strings.

---

## Conventions & Patterns

- All pages are `"use client"` (no server components used yet)
- Chinese UI labels throughout; keep all copy in Simplified Chinese
- Framer Motion `whileInView` + `viewport={{ once: true }}` for scroll animations
- `AnimatePresence` wraps lists that conditionally render or filter
- Toggle chip buttons use the pattern: selected = `bg-brand text-bg-main`, unselected = `bg-bg-main border border-white/10 text-text-secondary`
- Error alerts use `alert()` with Chinese text — no toast library installed
- `isSubmitting` state disables + visually changes the save button during async operations
- Admin pages use a consistent section card pattern: `bg-bg-surface p-8 rounded-3xl border border-white/5`

---

## Homepage Scroll Targets

The homepage has two `useRef` scroll targets:
- `explainerRef` → the "什么是红薯榜单" explainer section (id="what-is")
- `joinRef` → the "如何加入" join steps section

The "了解合作模式" CTA button scrolls to `explainerRef` (not joinRef).

---

## Known Limitations / Things to Watch

1. **No Supabase migrations are tracked in this repo** — schema is managed manually in the Supabase dashboard
2. **titleExamples is localStorage-only** — will not sync across devices or browsers
3. **FAQs are localStorage-only** — same cross-device limitation
4. **mockDb.ts** is a legacy artifact; `supabaseDb.ts` is the active data layer — don't add new features to mockDb
5. **No image compression** — large uploads can fill localStorage if mockDb fallback is used
6. **No auth middleware** — admin routes at `/admin/*` are not protected at the routing level
7. **Session persistence** — merchant session is stored as raw JSON in `localStorage` (not HttpOnly cookie)

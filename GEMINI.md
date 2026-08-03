# Adtron Dashboard — AI Agent Briefing

> This file is the primary context document for the 红薯榜单 (Redlist / Adtron) platform. Read it fully before modifying any code.

## 1. What This App Is

**红薯榜单** is a Malaysian small-business influencer marketing platform. The model: multiple merchants (SMEs) split the cost of hiring 20 Xiaohongshu (小红书 / RED) bloggers to write list-style posts about their businesses (e.g., "KL's Top 8 Cafes"). The entire UI is in Simplified Chinese with some English labels.

Two user surfaces:
1. **Public site** — landing page, campaign discovery, campaign detail, FAQ page, merchant login/register
2. **Admin panel** — create/edit campaigns, manage FAQs, view leads and registered users

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.2.4 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 with custom design tokens |
| Animations | Framer Motion v12 |
| Icons | Lucide React |
| Charts | Recharts |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| Secondary store | localStorage (for data with no Supabase column) |

### Design System (CRITICAL — preserve this)
The app uses a **dark glassmorphism / cyber-premium** aesthetic:
- `bg-brand` = `#C6F824` (lime green neon — primary CTA color)
- `bg-main` = deep dark background
- `bg-surface` = card surface (slightly lighter than bg-main)
- `text-secondary` = muted grey text
- Text on brand-colored buttons = `text-bg-main` (dark text on lime)
- Borders: `border-white/5` or `border-white/10` throughout
- Never use pure white backgrounds or generic bright UI libraries

---

## 3. Project Structure

```
src/
  app/
    (public)/               # Public routes (uses Header nav)
      page.tsx              # Homepage / landing page
      discover/page.tsx     # Campaign discovery grid with filters
      campaign/[id]/page.tsx # Campaign detail + FOMO sidebar
      faq/page.tsx          # Full FAQ page
      login/page.tsx        # Merchant login / register
    admin/                  # Admin panel (uses Sidebar nav)
      page.tsx              # Dashboard with stats
      create/page.tsx       # Create new campaign
      edit/[id]/page.tsx    # Edit existing campaign
      completed/page.tsx    # Completed campaigns archive
      leads/page.tsx        # Leads management
      users/page.tsx        # Merchant user management
      settings/page.tsx     # FAQ CRUD management
  components/
    Header.tsx              # Public nav (includes 常见问题 link → /faq)
    Sidebar.tsx             # Admin sidebar nav
    SearchableCombobox.tsx  # Reusable searchable location picker
    RecentCampaigns.tsx
    RecentCreatives.tsx
    Comments.tsx
  lib/
    supabaseClient.ts       # Supabase JS client init (reads .env vars)
    supabaseDb.ts           # All Supabase DB/Storage operations (PRIMARY data layer)
    mockDb.ts               # Legacy localStorage layer + type interfaces (Campaign, MerchantUser, UserLead)
    faqDb.ts                # FAQ CRUD via localStorage (21 pre-seeded FAQs)
    titleExamplesDb.ts      # Per-campaign title examples via localStorage
```

---

## 4. Data Architecture

### Supabase Tables (live DB — schema managed manually in Supabase dashboard)
| Table | Key columns |
|---|---|
| `campaigns` | id, title, category, location, audience, description, targetSlots, realFilledSlots, manualBoost, status, image (URL string), posters (URL string[]), titleExamples (text[]), createdAt, completedAt |
| `leads` | id, companyName, phone, picName, campaignId, createdAt |
| `merchants` | id, user_id (Supabase Auth UID), email, companyName, picName, phone, createdAt |

**Storage bucket:** `campaign-images` (path prefix: `posters/`)

### localStorage Keys
| Key | Managed by | Purpose |
|---|---|---|
| `redlist_faqs_v1` | `faqDb` | All FAQ entries |
| `redlist_title_examples_v1` | `titleExamplesDb` | Per-campaign title examples fallback (Record<string, string[]>) |
| `redlist_campaigns_v3` | `mockDb` | Legacy fallback campaigns (rarely used now) |
| `redlist_leads_v3` | `mockDb` | Legacy fallback leads |
| `redlist_current_merchant` | `supabaseDb` | Active merchant session (plain JSON) |

### titleExamples in Supabase
`titleExamples` (`text[]`) is persisted in the `campaigns` table in Supabase. `titleExamplesDb` acts as a local fallback.

---

## 5. Key Data Flows

### Creating a Campaign (`admin/create/page.tsx`)
1. Validate title + mainImage + at least one category
2. Upload mainImage → Supabase Storage → public URL
3. Upload each poster file → Supabase Storage → public URLs
4. `supabaseDb.saveCampaign({ title, category, ..., image, posters })` — receive `saved.id`
5. `titleExamplesDb.set(saved.id, titleExamples)` — localStorage only

### Editing a Campaign (`admin/edit/[id]/page.tsx`)
Poster state is **split into two separate buckets** — never merge them prematurely:
- `existingPosters: string[]` — already-uploaded Supabase URLs (delete by filtering array)
- `newPosterFiles: File[]` + `newPosterPreviews: string[]` — pending local files (shown with "待上传" badge)

On save:
1. Upload `newMainImageFile` if set → new URL; else keep existing `mainImageUrl`
2. Upload all `newPosterFiles` → new URLs
3. Final `posters = [...existingPosters, ...newUploadedUrls]`
4. `supabaseDb.updateCampaign(id, { image, posters, title, ... })` — **no titleExamples**
5. `titleExamplesDb.set(id, titleExamples)` — localStorage only

### Campaign Detail Page (`(public)/campaign/[id]/page.tsx`)
- Campaign fetched from Supabase
- `titleExamples` loaded from `titleExamplesDb.get(id)` — section hidden if empty
- `displayFaqs` loaded from `faqDb.getFaqsForDisplay()` — section hidden if empty
- FOMO sidebar shows real-time slot availability (`realFilledSlots + manualBoost / targetSlots`)

---

## 6. Campaign Status Engine

| Status | Label | Meaning |
|---|---|---|
| `recruiting` | 招募中 | Open for merchant applications |
| `full` | 已满额 | Auto-triggered when `realFilledSlots + manualBoost >= targetSlots` |
| `active` | 进行中 | Admin manually sets — campaign is actively running |
| `completed` | 已完成 | Admin manually sets — archived, shows in completed dashboard |

---

## 7. FAQ System

**Storage:** localStorage only (no Supabase table for FAQs)

**5 Categories (`FaqCategory` union type):**
- 关于红薯榜单
- 合作模式与流程
- 博主与内容
- 费用与支付
- 效果与报告

**Admin management:** `/admin/settings` — full CRUD table with `displayStatus` toggle, add/edit modal

**Public display surfaces:**
- `/faq` — full page with animated category filter tabs
- `/` (homepage) — first 4 `displayStatus: true` FAQs + CTA link to `/faq`
- Campaign detail page — all `displayStatus: true` FAQs at the bottom

**String delimiter rule:** FAQ answer strings in `faqDb.ts` must use **single-quote** outer delimiters (`'...'`) because the content contains Chinese typographic double-quote characters (`"` `"`). Using JS double-quote delimiters causes a parse error.

---

## 8. UI Conventions

- All pages are `"use client"` — no server components currently in use
- All copy is Simplified Chinese — maintain this for any new UI text
- Section cards: `className="bg-bg-surface p-8 rounded-3xl border border-white/5"`
- Selected chip: `bg-brand text-bg-main shadow-[0_0_15px_rgba(198,248,36,0.3)]`
- Unselected chip: `bg-bg-main border border-white/10 text-text-secondary hover:text-white hover:border-white/30`
- Scroll animations: Framer Motion `whileInView` + `viewport={{ once: true }}`
- Conditional list transitions: wrap with `<AnimatePresence>`
- Save buttons: `isSubmitting` state disables and changes button text during async ops
- Errors surface via `alert()` with Chinese text — no toast library is installed

### Homepage Scroll Targets
Two `useRef` anchors:
- `explainerRef` → "什么是红薯榜单" section (`id="what-is"`) — targeted by the "了解合作模式" hero button
- `joinRef` → "如何加入" section

---

## 9. Admin Access

The admin panel (`/admin/*`) uses a lightweight `sessionStorage` check in `src/app/admin/layout.tsx`. The admin password is **`HongShuLianMeng`**. Do not refactor this into heavy auth middleware unless explicitly requested.

---

## 10. Known Limitations

1. **Supabase schema not in repo** — column changes must be made manually in the Supabase dashboard
2. **titleExamples and FAQs are device-local** — localStorage doesn't sync across devices/browsers
3. **mockDb.ts is legacy** — `supabaseDb.ts` is the active data layer; don't add new features to mockDb
4. **No server-side route protection** — `/admin/*` is only guarded client-side via sessionStorage
5. **Merchant session is plain JSON in localStorage** — not a secure HttpOnly cookie
6. **No image compression** — large uploads risk filling localStorage if the mockDb fallback triggers

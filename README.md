# ELSEWHERE — Campus Lost & Found Platform

> **“Lost here. Found somewhere.”**

ELSEWHERE is a  campus lost-and-found web application connecting students, faculty, and campus security. Built with elegant editorial typography, procedural 3D hero objects, explainable descriptive retrieval (Memory Match), persistent photo uploads, authenticated claims workflows, and Supabase PostgreSQL.

---

## 1. Product Identity & Design Direction

- **Warm Ivory:** `#F4F0E7`
- **Muted Sage:** `#A9B7A0`
- **Deep Forest Green:** `#24372F`
- **Soft Charcoal:** `#222524`
- **Restrained Rust:** `#B4583A`
- **Editorial Typography:** Cormorant Garamond serif headlines paired with crisp Inter sans-serif body text.
- **Atmospheric Visuals:** Restrained transitions, subtle film grain, and deliberate spatial composition.


## 2. Architecture & Features

### A. Navigation
- Sticky header with wordmark, active section links (`LISTINGS`, `MEMORY MATCH`, `REPORT`), real-time backend connection status pill, and student authentication modal.

### B. Procedural 3D Hero Scene
- Real-time React Three Fiber scene arranged strictly along the periphery to preserve a protected central text and search zone.
- Functional search bar that scrolls to listings and filters results immediately.
- Dual CTAs: **FIND AN ITEM** and **REPORT AN ITEM**.
- Lazy-loaded bundle, responsive mobile simplification (2 corner items on small screens), prefers-reduced-motion compliance, and WebGL error fallback.

### C. Listings & Archival Registry
- Real-time catalog of all lost and found possessions.
- Filter by type: `All`, `Found`, `Lost`.
- Filter by category: `All`, `Keys`, `Bottles`, `Stationery`, `Electronics`, `ID Cards`, `Other`.
- Real-time keyword search across title, description, colour, and campus location.
- Card media displays user photographs or procedural SVG artworks with status pills (`Available`, `Claim Pending`, `Returned`).

### D. Memory Match Engine (Explainable Retrieval)
- Students describe missing belongings as they remember them.
- Includes 3 one-click preset test descriptions for instant verification.
- Transparent weighted algorithm scoring:
  - Category Agreement (30%)
  - Colour Overlap (20%)
  - Location Proximity (20%)
  - Description & Title Keywords (20%)
  - Date Proximity (10%)
- Displays honest, cautious match confidence pills (`High confidence match`, `Moderate match`, `Possible match`) with explainable signal tags.
- Direct link from any match result into the detail and claim modal.

### E. Report Form with Mandatory Photo Upload Support
- Explicit toggle between *“I Found Something”* and *“I Lost Something”*.
- Required fields: Item Title, Category, Campus Location, Approximate Date, Primary Colour, Description.
- Photo upload feature:
  - File picker (`accept="image/jpeg,image/png,image/webp"`).
  - Mobile camera capture (`capture="environment"`).
  - Immediate preview, replace photo, and remove photo buttons.
  - Strict client-side validation (< 5 MB, allowed formats).
  - Optional submission without photo supported with clean procedural fallback.
- Newly published reports appear immediately in the listings without page reloads.

### F. Authenticated Claims Workflow
- Students submit claims with distinguishing proof of ownership (e.g., hidden sticker, lock combo, scratch).
- Prevents duplicate pending claims.
- Item reporters have an exclusive management dashboard in the modal to review claims and **Accept** or **Reject**.
- Accepting a claim marks the item as `Returned` and triggers a celebratory canvas confetti animation.

---

## 3. Local Development

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 9+

### Commands

```bash
# 1. Install dependencies
npm install

# 2. Start local development server (runs at http://localhost:5173)
npm run dev

# 3. Execute automated system verification suite
npm test

# 4. Create production build (generates dist folder)
npm run build

# 5. Preview production build locally
npm run preview
```

## 4. Supabase Database & Storage Setup

A complete PostgreSQL schema script with Row Level Security (RLS) is provided in `supabase/schema.sql`.

### Steps:
1. Log in to [supabase.com](https://supabase.com) and create a new project.
2. Navigate to the **SQL Editor** tab in your Supabase dashboard.
3. Paste the contents of `supabase/schema.sql` and click **Run**.
4. This will set up:
   - `profiles` table with automatic user creation trigger on auth signup.
   - `items` table with foreign keys, type/status constraints, and search indexes.
   - `claims` table with unique pending claim constraints and relationships.
   - Row Level Security (RLS) policies allowing public read of listings, authenticated report creation, reporter-only claim updates, and private claim visibility.
   - `item-photos` storage bucket with public read access and 5 MB file size limit.
5. In your local project, copy `.env.example` to `.env` and fill in your keys:
   ```bash
   cp .env.example .env
   ```

*Note: If Supabase keys are not set, the application operates in an explicitly labeled **Local Persistence Demo Mode** where all reports, uploaded photos (persisted as data URLs), search filters, Memory Match, claims, and status updates persist reliably across browser refreshes.*

---

## 5. Verification Test Report

Run `npm test` to execute the automated verification test suite:

- **Build & Deployment Artifacts:**
  - `dist` folder successfully generated.
  - `dist/index.html` valid structure.
  - `dist/_redirects` SPA rewrite (`/* /index.html 200`).
  - `netlify.toml` build configurations.
  - `.env.example` contains placeholders only with zero private secrets.
  - `supabase/schema.sql` includes complete RLS security policies.
- **Memory Match Engine:**
  - Verified weighted category, colour, keyword, and location signals.
  - Verified ranking accuracy for realistic campus belongings.
  - Verified appropriate empty state for non-correlating queries.
- **Photo Uploads:**
  - Verified strict format filtering (JPEG, PNG, WebP).
  - Verified 5 MB size constraint enforcement.
- **Claims Lifecycle:**
  - Verified transition from `Available` -> `Claim Pending` on claim submission.
  - Verified transition from `Claim Pending` -> `Returned` on claim acceptance.
  - Verified reversion to `Available` on claim rejection.

# Agent Workspace Guide: Waypoint

This document serves as the operational reference and codebase guide for AI agents working on the Waypoint repository.

---

## 1. Project Overview & Architecture

**Waypoint** is a client-side, offline-first Progressive Web App (PWA) designed as a shared travel wallet for multi-traveller itineraries, boarding passes, accommodation bookings, train tickets, restaurant reservations, and activity passes.

* **Production URL**: `https://teeceegee.github.io/waypoint/`
* **Zero Backend / Privacy First**: Personal travel data, passports, barcodes, and itineraries are stored exclusively on the user's local device using client-side IndexedDB. No backend database or authentication server is required.
* **Tech Stack**:
  * **Framework**: React 19 + TypeScript (~6.0)
  * **Build Tooling**: Vite 8 + `@vitejs/plugin-react`
  * **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
  * **Local Database**: Dexie.js (`dexie`, `dexie-react-hooks`)
  * **Barcode / QR Generation**: `bwip-js` (supports Aztec, QR, PDF417, Code 128 for boarding passes)
  * **Icons**: `lucide-react`
  * **Linter**: Oxlint (`oxlint`)

---

## 2. Technical Details & Verification Commands

### Directory Structure
* `src/` — React application source code, components, state hooks, and itinerary models.
* `public/` — Static web assets, manifest, PWA icons.
* `dist/` — Production build output published to GitHub Pages.
* `GUIDE.md` & `WAYPOINT_USER_GUIDE.md` — Comprehensive end-user documentation.
* `llm_json_instructions.md` — Prompting instructions for LLM extraction of travel booking emails into Waypoint JSON schema.

### Developer Commands
* **Start Dev Server**:
  ```sh
  npm run dev
  ```
* **Type-check & Build**:
  ```sh
  npm run build
  ```
* **Linting**:
  ```sh
  npm run lint
  ```
* **Preview Build**:
  ```sh
  npm run preview
  ```

---

## 3. Atlassian Confluence & Jira References

* **Instance**: `https://echopost.atlassian.net`

### Confluence Pages
* **User Guide**: [Waypoint User Guide](https://echopost.atlassian.net/wiki/spaces/~71202051b19675b2e64a71ac2b1d79eb01b1f7/pages/295176/Waypoint+User+Guide) (ID: `295176`)
* **App Overview**: [Waypoint App Overview](https://echopost.atlassian.net/wiki/spaces/~71202051b19675b2e64a71ac2b1d79eb01b1f7/pages/589826/Waypoint+App+Overview) (ID: `589826`)
* **JSON Sync & Backup Schema**: [Waypoint: JSON Synchronization & Backup Schema](https://echopost.atlassian.net/wiki/spaces/~71202051b19675b2e64a71ac2b1d79eb01b1f7/pages/26738690/Waypoint+JSON+Synchronization+Backup+Schema) (ID: `26738690`)
* **Architecture History**: [From Idea to Installed App: Building a PWA with Codex in the ChatGPT Desktop App](https://echopost.atlassian.net/wiki/spaces/~71202051b19675b2e64a71ac2b1d79eb01b1f7/pages/524289) (ID: `524289`)

### Jira Issues
* Tracked under **Everyday (`EVD`)** project for feature roadmaps and travel tooling (see [`JIRA_TICKETS.md`](file:///Volumes/NeosDrive/08_Tech,%20Dev%20&%20AI/AI/Gemini/AntiGravity/waypoint/JIRA_TICKETS.md)):
  * [EVD-75](https://echopost.atlassian.net/browse/EVD-75) — *Waypoint PWA v2.4–v2.5: 3-Tier Daily Suggestion Accordions, Category Filter Toggles & Bundle Splitting* (**Done**)

---

## 4. Activity & Discovery Log

* **2026-08 to 2026-09**:
  * Developed offline-first PWA architecture with Dexie.js local database and barcode rendering.
  * Published PWA deployment to GitHub Pages (`teeceegee.github.io/waypoint`).
  * Compiled LLM JSON extraction prompt schema for converting email confirmations into travel passes.
  * Documented user guide on Confluence pages `295176` and `589826`.
* **2026-10-03**:
  * Created `AGENT_README.md` to establish consistent agent guidelines, technical verification workflows, and Atlassian cross-references.
* **2026-10-10**:
  * Completed full-codebase architectural, security, UX, and performance review.
  * Implemented bundle code splitting via dynamic `React.lazy()` for `PassDetailsModal` and `SyncModal`, reducing initial bundle size by 83% (1,276 kB → 212 kB, 66.6 kB gzip).
  * Configured manual vendor chunking in `vite.config.ts` for `bwip-js` (`vendor-barcode`) and Dexie (`vendor-db`).
  * Removed deprecated empty stub components (`PassFormModal.tsx`, `TripFormModal.tsx`).
  * Added `dev-dist` and macOS `Icon\r` patterns to `.gitignore` and `.oxlintrc.json`, achieving clean 0-warning lint runs in ~18ms.
  * Verified build pipeline (`tsc -b && vite build`) and offline PWA precaching across all 18 chunk assets.
  * Authored and published Confluence Live Document `Waypoint: JSON Synchronization & Backup Schema` (ID: `26738690`) under parent `Waypoint App Overview` (`589826`).
  * Released v2.3.1 and deployed to GitHub Pages (`teeceegee.github.io/waypoint`).
  * Implemented 3-tier navigation hierarchy on Level 2 timeline: preserved confirmed/booked items (flights, hotels, transit, confirmed bookings) on the primary timeline while consolidating daily dining recommendations and activity suggestions behind expandable day accordion summary cards (Level 3 drill-down).
  * Released v2.4.0 with Workbox `skipWaiting`, `clientsClaim`, and tap-to-update header mechanism for instant PWA version activation.
  * Released v2.4.1: Ensured planned/unbooked flights remain directly on the Level 2 master timeline alongside confirmed travel items, rendered in a distinct lighter sky-blue gradient (`from-sky-500 via-sky-600 to-blue-600`) with `✈️ Planned Flight` status labels to visually distinguish planned sectors from booked boarding passes.
* **2026-10-11**:
  * Released v2.5.0 & v2.5.1: Added interactive category filter toggle pills (**Flights**, **Hotels**, **Restaurant Bookings**, and **Activities / Suggestions**) directly inside the non-scrollable sticky top `<header>` bar (`TimelineFilterBar`), displaying compact dual-state SVG icons (solid filled when selected, outlined stroke when unselected) and item counts colour-matched to each card category's gradient palette.
  * Recorded and closed Jira ticket [EVD-75](https://echopost.atlassian.net/browse/EVD-75).

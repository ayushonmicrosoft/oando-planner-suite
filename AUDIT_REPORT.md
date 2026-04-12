# Comprehensive Audit Report — One&Only Office Planner Suite

**Date:** 2026-04-12
**Scope:** Security, Accessibility, Performance, SEO

---

## 1. Security Audit

### 1.1 Dependency Vulnerabilities

**Tool:** `pnpm audit`

| Severity | Count | Key Packages |
|----------|-------|--------------|
| High | 5 | picomatch (ReDoS), path-to-regexp (DoS), lodash (code injection) |
| Moderate | 6 | path-to-regexp (ReDoS), lodash (prototype pollution), vite (path traversal), yaml (code injection) |

**Actions taken:**
- Updated `express` to ^5.2.1 and `vite` to latest — reduced total from 14 to 11
- Remaining 11 are transitive dependencies (lodash via recharts, path-to-regexp via express>router, picomatch via http-proxy-middleware) with no direct fix available

**Recommendation:** Monitor upstream packages for patches; consider replacing `recharts` with a library that doesn't depend on lodash.

### 1.2 Hardcoded Secrets

**Result:** PASS — No hardcoded API keys, tokens, or passwords found in source code. All sensitive values (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `BETTER_AUTH_SECRET`, `DATABASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`) are properly loaded from environment variables.

**Fix applied:** Added `.env` and `.env.*` patterns to `.gitignore` to prevent accidental future commits of environment files.

### 1.3 API Input Validation

**Result:** PASS — All API routes use Zod schemas (`@workspace/api-zod`) with `safeParse()` for request body and query parameter validation. Invalid input returns `400 Bad Request` with descriptive errors.

### 1.4 Rate Limiting

**Result (before):** FAIL — No rate limiting was configured on any API endpoint.

**Fix applied:** Installed `express-rate-limit` and configured:
- General API rate limit: 300 requests per 15-minute window per IP
- Auth endpoint rate limit: 30 requests per 15-minute window per IP (stricter to prevent brute force)
- Standard `RateLimit-*` headers (draft-7) included in responses

### 1.5 Authentication & Authorization

**Result (before):** FAIL — `requireAuth` middleware was hardcoding a mock admin user (`admin-default`) for all requests. `requireAdmin` was a pass-through that called `next()` without any role checking.

**Fix applied:**
- `requireAuth` now uses `better-auth`'s `auth.api.getSession()` with `fromNodeHeaders()` to verify the session from request cookies/headers. Unauthenticated requests receive `401 Unauthorized`.
- `requireAdmin` now queries the `users` table to check the user's `role` field. Non-admin users receive `403 Forbidden`.

### 1.6 CORS Configuration

**Status:** Permissive (`origin: true`) — acceptable for development. Must be restricted to specific origins before production.

### 1.7 Request Size Limits

**Result:** PASS — JSON body parser configured with 2MB limit. Razorpay webhooks preserve raw body for signature verification.

---

## 2. Accessibility Audit (WCAG 2.2)

### 2.1 Color Contrast

**Issue found:** `--text-subtle` (#556677) on dark background (#070D12) had a contrast ratio of ~3.27:1 — fails WCAG AA (requires 4.5:1).

**Fix applied:** Updated `--text-subtle` to #6B7E91 (contrast ratio ~4.61:1) — now passes WCAG AA.

**Other text colors verified:**
- `--text-strong` (#F0F4F8): >15:1 — PASS
- `--text-body` (#C8D5E4): >10:1 — PASS
- `--text-muted` (#7A8DA0): ~5.66:1 — PASS

### 2.2 ARIA Labels & Roles

**Issues found and fixed:**
- Canvas planner: Added `aria-label` to 4 icon-only close/dismiss buttons (AI panel, measurement mode, furniture summary)
- Canvas planner: Added `role="tablist"`, `role="tab"`, and `aria-selected` to AI Tools tab switcher
- Canvas planner: Added `aria-label` to color input, opacity range slider, and room type select
- CAD drawing tool: Added `aria-label` to stroke width select
- Import & Scale tool: Added `aria-label` to measurement units select

### 2.3 Keyboard Navigation

**Status:** Baseline support via Radix UI primitives (Dialogs, Selects, Dropdowns, Tabs) which provide focus trapping and arrow key navigation. Canvas-based tools inherently rely on mouse interaction but offer keyboard shortcuts (R=rotate, Del=delete, etc.).

**Recommendation:** Consider adding keyboard-based item selection and arrow-key movement for canvas items in a future iteration.

### 2.4 Screen Reader Support

**Status:** Form inputs use proper `<Label>` components. Error states use `role="alert"`. Most buttons have visible text or `title` attributes.

---

## 3. Performance Review

### 3.1 Image Optimization

**Status:** Next.js image optimization is disabled (`images: { unoptimized: true }` in next.config.ts). This means images are served as-is without automatic resizing, format conversion, or lazy loading via the Next.js Image component.

**Recommendation:** Enable Next.js image optimization for production to reduce bandwidth and improve LCP.

### 3.2 Bundle Size

**Key dependencies by size (approximate):**
- tldraw: ~2MB (unavoidable for 2D editor functionality)
- Three.js + React Three Fiber: ~1MB (required for 3D viewer)
- Konva + React-Konva: ~500KB (used in 2D canvas planner)
- Recharts + lodash: ~400KB (used for analytics charts)

**Status:** Heavy but justified by feature requirements. All major libraries are code-split across routes.

### 3.3 TypeScript Build

**Status:** `ignoreBuildErrors: true` is set in Next.js config. This suppresses type errors during build which could hide runtime issues.

**Recommendation:** Run `pnpm typecheck` in CI/CD before builds to catch errors early.

### 3.4 Request Payload Limits

**Status:** PASS — 2MB JSON limit configured on Express, preventing oversized request attacks.

---

## 4. SEO Verification

### 4.1 Meta Tags

**Status:** PASS — Comprehensive metadata configured in `layout.tsx`:
- Title template with default and per-page override support
- Description with relevant keywords
- Keywords array covering target search terms
- Author, creator, publisher metadata
- Canonical URL configured

### 4.2 Open Graph & Twitter Cards

**Status:** PASS — Full Open Graph tags (type, locale, url, siteName, title, description, image) and Twitter card (summary_large_image) configured.

### 4.3 Structured Data (JSON-LD)

**Status:** PASS — Rich structured data in `@graph` format:
- `WebSite` schema with publisher link
- `Organization` schema with logo, contact point, and address
- `SoftwareApplication` schema with features list, pricing, and aggregate rating

### 4.4 Sitemap

**Status:** PASS — Dynamic sitemap generated via Next.js route (`src/app/sitemap.ts`). Includes homepage, sign-in, and sign-up pages which are all allowed by `robots.ts`.

### 4.5 robots.txt

**Status:** PASS — Dynamic `robots.ts` route properly configured:
- Allows crawling of public pages (/, /sign-in, /sign-up)
- Blocks app routes (planner/, plans/, catalog/, templates/, tools/, viewer/, planners/)
- Blocks API routes (/api/)
- References sitemap.xml URL

**Fix applied:** Removed redundant static `public/robots.txt` that conflicted with the dynamic `robots.ts` route handler. Next.js serves the dynamic version, so the static file was dead code with stale rules.

---

## 5. Summary of Changes Made

| Category | File | Change |
|----------|------|--------|
| Security | `.gitignore` | Added .env/.env.* ignore patterns |
| Security | `artifacts/api-server/src/app.ts` | Added rate limiting (express-rate-limit) |
| Security | `artifacts/api-server/src/middlewares/require-auth.ts` | Replaced mock auth with better-auth session verification |
| Security | `artifacts/api-server/src/middlewares/require-admin.ts` | Added role-based admin authorization check |
| Security | `artifacts/api-server/package.json` | Added express-rate-limit dependency |
| Accessibility | `artifacts/planner-suite/src/styles/theme-tokens.css` | Fixed --text-subtle contrast (#556677 → #6B7E91) |
| Accessibility | `artifacts/planner-suite/src/views/planner/canvas.tsx` | Added aria-labels, ARIA roles to interactive elements |
| Accessibility | `artifacts/planner-suite/src/views/tools/cad-drawing.tsx` | Added aria-label to stroke width select |
| Accessibility | `artifacts/planner-suite/src/views/tools/import-scale.tsx` | Added aria-label to units select |
| SEO | `artifacts/planner-suite/public/robots.txt` | Removed redundant static file (dynamic robots.ts takes precedence) |
| Dependencies | `pnpm-lock.yaml` | Updated express, vite to reduce vulnerabilities |

---

## 6. Remaining Items (Non-Critical)

1. **11 transitive dependency vulnerabilities** — awaiting upstream patches
2. **CORS is permissive** — must be restricted for production
3. **Image optimization disabled** — enable for production
4. **TypeScript build errors ignored** — add typecheck to CI/CD
5. **Canvas keyboard navigation** — limited by design tool nature; consider future improvements

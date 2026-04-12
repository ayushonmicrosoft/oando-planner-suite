# Code Quality & Security Audit — April 2026

## 1. Dependency Security Audit

**Tool:** `pnpm audit`

| Severity | Package | Issue | Status |
|----------|---------|-------|--------|
| High | picomatch <2.3.2 | ReDoS via extglob quantifiers (transitive via http-proxy-middleware) | Transitive dep — no direct upgrade path; mitigated by not using user-controlled globs |
| High | picomatch >=4.0.0 <4.0.4 | ReDoS (transitive via vite in mockup-sandbox) | Dev-only; vite dev server not exposed in production |
| High | path-to-regexp >=8.0.0 <8.4.0 | DoS via sequential optional groups (transitive via express>router) | Transitive dep in Express 5; no complex route patterns used |
| High | lodash >=4.0.0 <=4.17.23 | Code injection via `_.template` (transitive via recharts in mockup-sandbox) | Dev-only sandbox; recharts does not invoke `_.template` with user input |
| High | vite >=7.0.0 <=7.3.1 | Arbitrary file read via WebSocket / fs.deny bypass | Dev-only; not shipped in production |

**Conclusion:** All high vulnerabilities are in transitive dependencies or dev-only tooling. None are directly exploitable in the production application. No critical vulnerabilities found.

## 2. Secrets Scan

- **No hardcoded API keys, tokens, passwords, or connection strings** found in source code.
- All secrets (BETTER_AUTH_SECRET, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET, AI_INTEGRATIONS_OPENAI_*) are loaded from `process.env`.
- No `.env` files committed to the repository.

## 3. API Input Validation Review

| Route File | Validation | Status |
|------------|-----------|--------|
| plans.ts | Zod schemas (CreatePlanBody, UpdatePlanBody, DuplicatePlanBody, ListPlansQueryParams) + manual checks | ✅ Good |
| ai.ts | Zod schemas (GetAiAdviceBody, GenerateAutoLayoutBody) | ✅ Good |
| quotes.ts | Zod schema (CreateQuoteBody) | ✅ Good |
| clients.ts | Zod schemas (CreateClientBody, UpdateClientBody) | ✅ Good |
| projects.ts | Zod schemas | ✅ Good |
| shares.ts | Zod schema (CreateShareBody) — upgraded from manual validation | ✅ Fixed |
| public-shares.ts | Zod schemas (AddCommentBody, ApproveShareBody) — upgraded from manual validation | ✅ Fixed |
| subscriptions.ts | Zod schema (VerifyPaymentBody) — upgraded from manual validation | ✅ Fixed |
| templates.ts | Zod schemas (UseTemplateBody, UpdateTemplateBody) — upgraded from manual validation | ✅ Fixed |

**Fix applied:** Sanitized SQL wildcard characters (%, _, \\) in the clients search parameter to prevent LIKE pattern injection.

All error responses use consistent `{ error, status }` format and do not leak internal details.

## 4. TypeScript Health Check

**Before audit:** 7+ type errors across 5 files.

| File | Error | Fix Applied |
|------|-------|-------------|
| public-shares.ts (lines 22, 82, 147) | `req.params.token` typed as `string \| string[]` in Express 5 | Added `parseStringParam()` helper |
| shares.ts (lines 33, 85, 124, 125) | `req.params.id/shareId` typed as `string \| string[]` | Added `parseIdParam()` helper matching other routes |
| project-detail.tsx (line 222) | `project.client.name` possibly undefined | Added nullish coalescing (`?? ""`) |
| useCollaboration.ts (line 116) | tldraw v4 `RecordId<TLRecord>[]` type mismatch for `store.has`/`store.remove` | Created typed `tldraw-compat.ts` adapter module with narrowed interfaces |
| StudioPlanner.tsx (lines 234, 249, 135, 140) | tldraw v4 `getSnapshot`/`loadSnapshot`/event listener API changes | Migrated to `tldraw-compat.ts` adapter functions |
| StudioSidebar.tsx (line 70) | `strokeWidth` prop not in icon component type | Updated icon type to use `LucideProps` from lucide-react |

**After audit:** `pnpm run typecheck` passes cleanly (0 errors).

## 5. Configuration Fix

- **Changed `typescript.ignoreBuildErrors` from `true` to `false`** in `next.config.ts` — this was masking type errors during production builds.

## 6. Bundle Analysis

The frontend depends on several large libraries (three.js, tldraw, konva, recharts, jspdf, html2canvas). All are required for core functionality:
- **three.js / @react-three/fiber / @react-three/drei** — 3D office viewer
- **tldraw** — Studio planner (whiteboard)
- **konva / react-konva** — 2D canvas planner
- **recharts** — Dashboard charts
- **jspdf / html2canvas** — PDF export
- **yjs / y-websocket** — Real-time collaboration

No unnecessary large dependencies identified. Tree-shaking is active via Next.js bundler.

## 7. Accessibility Spot-Check

- `<html lang="en" dir="ltr">` set correctly
- Viewport meta configured for mobile
- Theme color set
- Schema.org structured data present
- No obvious missing form labels or ARIA issues in reviewed components
- Further manual testing recommended for contrast ratios and keyboard navigation on all pages

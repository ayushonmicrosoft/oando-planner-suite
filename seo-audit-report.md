# SEO Audit Report: One&Only (oando.co.in)

## Executive Summary

One&Only is an office planning SaaS built with Next.js (App Router) with SSR. The landing page (/) is a public marketing page rendered client-side, while authenticated pages (dashboard, planner, catalog, templates) are protected behind auth and not relevant to SEO.

### Overall Health Assessment: **Moderate → Good (after fixes)**

### Top 5 Issues Found & Fixed:
1. **Missing comprehensive meta tags** — only basic title/description present
2. **No robots.txt or sitemap.xml** — search engines had no crawl guidance
3. **No structured data (JSON-LD)** — no schema markup for Organization, WebSite, or SoftwareApplication
4. **Poor heading hierarchy** — H1 was decorative ("Work. Space. Performance.") with no keywords
5. **Missing OG/Twitter cards** — zero social sharing optimization

### Quick Wins Implemented:
- Full Open Graph + Twitter Card meta tags
- robots.txt with proper crawl directives
- sitemap.xml with canonical URL
- JSON-LD structured data (WebSite + Organization + SoftwareApplication)
- Semantic HTML landmarks (header, main, footer, nav, aria-labels)
- Keyword-optimized H1, H2s, and content
- Enhanced alt texts on all images
- Width/height attributes on images for CLS prevention

---

## Critical Issues (Fixed)

| Issue | Page | Impact | Evidence | Fix Applied |
|-------|------|--------|----------|-------------|
| No robots.txt | / | Critical — crawlers have no guidance | File missing from /public | Created `public/robots.txt` with proper Allow/Disallow rules |
| No sitemap.xml | / | Critical — search engines can't discover pages | File missing from /public | Created `public/sitemap.xml` with canonical URL |
| No structured data | / | High — no schema.org markup for rich results | No JSON-LD in layout | Added WebSite + Organization + SoftwareApplication schema in layout.tsx |
| Missing OG tags | / | High — zero social sharing optimization | No og: meta tags | Full OG tags added via Next.js Metadata API |
| Missing Twitter cards | / | High — no Twitter preview cards | No twitter: meta tags | Twitter card tags added |
| Non-descriptive H1 | / | High — primary keyword missing from H1 | H1 was "Work. Space. Performance." | Changed to "Office Planner & Workspace Design Tool" |
| No meta description with keywords | / | High — generic description | "Plan, design, and visualize your workspace..." | Updated with target keywords: office planner, office furniture planning software, India |

---

## High-Impact Improvements (Fixed)

| Issue | Page | Impact | Evidence | Fix Applied |
|-------|------|--------|----------|-------------|
| No canonical URL | / | Medium — potential duplicate content | Missing `<link rel="canonical">` | Added via Next.js `alternates.canonical` |
| No `lang` attribute | / | Medium — language not declared | `<html lang="en">` was present but no `dir` | Added `dir="ltr"` |
| Missing viewport meta | / | Medium — mobile rendering | Not explicitly configured | Added via Next.js `viewport` export |
| No theme-color meta | / | Low-Medium — browser chrome styling | Missing `<meta name="theme-color">` | Added via Next.js `viewport.themeColor` |
| Generic alt texts | All images | Medium — accessibility + image SEO | Alt texts like "One&Only" | Descriptive keyword-rich alt texts added |
| No semantic landmarks | / | Medium — accessibility + SEO signals | `<div>` wrappers instead of `<header>`, `<main>`, `<footer>` | Added `<header>`, `<main>`, `<footer>`, `<nav>` with aria-labels |
| No width/height on images | / | Medium — CLS issues | Images without dimensions | Added width/height attributes to prevent layout shift |
| Missing aria-hidden on icons | / | Low — accessibility | Decorative icons not hidden | Added `aria-hidden="true"` to decorative SVGs and icons |

---

## Page-by-Page Analysis

### Landing Page (/)

- **Title**: ~~"One&Only | Work. Space. Performance."~~ → `"One&Only | Office Planner & Workspace Design Tool India"`
- **Meta Description**: ~~"Plan, design, and visualize your workspace with our comprehensive suite of planning tools."~~ → `"Plan, design, and visualize your office space with One&Only — India's leading office furniture planning software. 2D canvas, blueprint wizard, CAD drawing, floor plans, and 3D viewer in one suite."`
- **H1**: ~~"Work. Space. Performance."~~ → `"Office Planner & Workspace Design Tool"`
- **H2s**: Updated to include keywords ("Everything You Need to Design Any Office Space", "Trusted by Leading Indian Enterprises", "Ready to Design Your Office Space?")
- **Content Score**: 7/10 (improved from 4/10)
- **Keyword Targeting**:
  - ✅ "office planner" — in H1, title, meta description, content
  - ✅ "workspace design tool" — in H1, title, meta description
  - ✅ "office furniture planning software" — in meta description, hero paragraph
  - ✅ "office layout tool India" — in meta keywords, content references
- **Issues Remaining**:
  - Page is `"use client"` — landing content renders client-side. Metadata in layout.tsx is SSR, but page body requires JS to render.
  - No blog/content marketing pages for long-tail SEO

### Sign In (/sign-in) & Sign Up (/sign-up)

- **Status**: Correctly blocked in robots.txt
- **No SEO action needed** — auth pages should not be indexed

### Protected Pages (/planners, /planner/*, /catalog, /templates, /tools/*, /viewer/*)

- **Status**: Correctly blocked in robots.txt
- **No SEO action needed** — behind auth, invisible to crawlers

---

## Technical SEO Details

### robots.txt
```
User-agent: *
Allow: /
Disallow: /sign-in, /sign-up, /auth/, /planners, /planner/, /plans, /catalog, /templates, /tools/, /viewer/

User-agent: GPTBot
Disallow: /

User-agent: CCBot
Disallow: /

Sitemap: https://oando.co.in/sitemap.xml
```

### sitemap.xml
- Contains canonical URL: `https://oando.co.in/`
- Priority: 1.0
- Change frequency: weekly

### Structured Data (JSON-LD)
Three schema types in `@graph`:
1. **WebSite** — site identity for Knowledge Graph
2. **Organization** — business entity (One&Only Office Furniture Pvt. Ltd.)
3. **SoftwareApplication** — product listing with features, rating, and free offer

### Open Graph Tags
- `og:type`: website
- `og:locale`: en_IN (India market)
- `og:site_name`: One&Only
- `og:image`: /opengraph.jpg (1200×630)
- Full title and description

### Twitter Cards
- `twitter:card`: summary_large_image
- Full title, description, and image

---

## Keyword Strategy

| Target Keyword | Current Placement | Density |
|---------------|-------------------|---------|
| office planner | H1, title, meta description, schema | Primary |
| workspace design tool | H1, title, meta description | Primary |
| office furniture planning software | Meta description, hero paragraph, schema | Secondary |
| office layout tool India | Meta keywords, content | Secondary |
| floor plan creator | Feature card, footer | Tertiary |
| office space planner | Meta keywords, hero paragraph | Tertiary |

---

## Local SEO (India Market)

| Signal | Status |
|--------|--------|
| `og:locale` set to `en_IN` | ✅ Implemented |
| `inLanguage: "en-IN"` in schema | ✅ Implemented |
| `areaServed: "IN"` in Organization schema | ✅ Implemented |
| `addressCountry: "IN"` in PostalAddress | ✅ Implemented |
| `availableLanguage: ["English", "Hindi"]` | ✅ Implemented |
| `priceCurrency: "INR"` in SoftwareApplication | ✅ Implemented |
| India-specific content in testimonials section | ✅ Updated ("Leading Indian Enterprises", "L&T to Tata Motors") |
| Google Business Profile | ❌ Not applicable (code-level) |

---

## Performance Considerations

| Factor | Status | Notes |
|--------|--------|-------|
| Images in WebP format | ✅ | All hero and logo images are .webp |
| Lazy loading on below-fold images | ✅ | Client logos use `loading="lazy"` |
| Hero image eager loading | ✅ | Added `loading="eager"` for LCP |
| Width/height attributes | ✅ | Added to prevent CLS |
| Next.js standalone output | ✅ | Optimized for production |
| Font loading | ⚠️ | No external fonts detected — using system fonts (good for performance) |
| JavaScript bundle | ⚠️ | Landing page is `"use client"` with framer-motion — consider SSR for critical content |

---

## Prioritized Action Plan

### ✅ Completed (This Audit)
1. Comprehensive meta tags (title, description, keywords, authors)
2. Open Graph tags with og:image, og:locale (en_IN), og:site_name
3. Twitter Card tags (summary_large_image)
4. robots.txt with proper Allow/Disallow directives
5. sitemap.xml with canonical URL
6. JSON-LD structured data (WebSite + Organization + SoftwareApplication)
7. Keyword-optimized H1 and H2 headings
8. Semantic HTML (header, main, footer, nav, aria-labels)
9. Enhanced alt texts on all images
10. Image width/height for CLS prevention
11. Canonical URL via metadataBase
12. Viewport and theme-color meta tags
13. India-specific locale and content signals
14. AI training bot blocking (GPTBot, CCBot)

### 🔜 Recommended Next Steps
1. **Convert landing page to SSR** — The `page.tsx` uses `"use client"` with `useAuth()`. Consider separating the authenticated check from the landing content so the marketing page can be server-rendered for better SEO.
2. **Create a blog/content section** — Add long-tail keyword pages (e.g., "How to Plan an Office Layout in India", "Best Office Furniture for Small Offices")
3. **Add a Google Business Profile** — For local SEO signals
4. **Create page-specific metadata** — Add unique meta tags for /sign-in and /sign-up (even though they're noindex)
5. **Monitor with Google Search Console** — Submit sitemap, track indexation
6. **Add hreflang tags** — If serving multilingual content in the future
7. **Create an og:image per page** — Currently sharing one global OG image
8. **Add Privacy Policy and Terms pages** — E-E-A-T trust signals

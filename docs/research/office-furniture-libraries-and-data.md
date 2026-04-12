# Deep Research: Office Furniture Libraries & Data

**Date:** April 12, 2026
**Context:** The Office Planner Suite currently has ~46 hardcoded furniture items in `artifacts/api-server/src/lib/seed.ts`. The production catalog lives on [oando.co.in](https://www.oando.co.in). This report researches open-source libraries, asset sources, data standards, and sync strategies to improve the furniture library and data pipeline.

---

## Table of Contents

1. [Open-Source Office Furniture Asset Libraries](#1-open-source-office-furniture-asset-libraries)
2. [Open Furniture Standards & Formats](#2-open-furniture-standards--formats)
3. [Catalog Management Tools](#3-catalog-management-tools)
4. [Data Storage & Sync Strategies (oando.co.in → Planner)](#4-data-storage--sync-strategies)
5. [Three.js-Compatible 3D Model Repositories](#5-threejs-compatible-3d-model-repositories)
6. [Recommendations](#6-recommendations)

---

## 1. Open-Source Office Furniture Asset Libraries

### 1.1 — 3D Model Libraries (glTF/GLB)

| Repository / Source | Description | License | Stars/Size | Link |
|---|---|---|---|---|
| **ToxSam/open-source-3D-assets** | 991+ CC0 GLB models with JSON registry. API-friendly structure for building asset browsers. Includes themed packs but some furniture items. | CC0 | 991+ models | [GitHub](https://github.com/toxsam/open-source-3D-assets) |
| **KhronosGroup/glTF-Sample-Models** | Official glTF sample repo including Kenney Assets — hundreds of low-poly CC0 assets including furniture. | CC0 / varies | Official | [GitHub](https://github.com/KhronosGroup/glTF-Sample-Models) |
| **yikuansun/3db** | Open 3D model library. Each model in its own directory with `model.glb` + `thumbnail.png`. | Open | — | [GitHub](https://github.com/yikuansun/3db) |
| **Poly Haven** | CC0 HDRIs, PBR textures, and some glTF models. Public domain equivalent. | CC0 | — | [polyhaven.com](https://polyhaven.com) |
| **Poimandres Market** | 3D assets for download in glTF format. Developer-friendly, integrates with react-three-fiber ecosystem. | Varies | — | [market.pmnd.rs](https://market.pmnd.rs) |
| **Sketchfab (free tier)** | Largest free 3D model library with auto-conversion to glTF. Many office chairs, desks, tables available for free download. | Varies | — | [sketchfab.com](https://sketchfab.com/tags/glb) |

### 1.2 — 2D / SVG Floor Plan Asset Libraries

| Repository / Source | Description | License | Link |
|---|---|---|---|
| **open3dFloorplan** (theLodgeBots) | 140+ items across categories including office. SvelteKit + Three.js. Drag-and-drop, rotation, resizing, snapping. SVG export. | Open Source | [GitHub](https://github.com/theLodgeBots/open3dFloorplan) |
| **homeRoughEditor** (ekymo) | Pure SVG floor plan editor with embedded furniture symbols. Lightweight, no build step. ~381 stars. | Open Source | [GitHub](https://github.com/ekymo/homeRoughEditor) |
| **OpenPlan3D** | Draw floor plans in 2D, visualize in 3D, furnish with 140+ models. Export to PNG, SVG, DXF, PDF. Free and open source. | Open Source | [openplan3d.com](https://openplan3d.com) |
| **blueprint3d (ES6 fork)** | React + SVG + WebGL + Three.js. UI component for drawing floor plans. ~579 stars. | MIT | [GitHub topics](https://github.com/topics/floorplans) |
| **Wikimedia Commons** | Many CC0/Public Domain floor plan furniture SVG sprites. | CC0 | [commons.wikimedia.org](https://commons.wikimedia.org) |

### 1.3 — Office Space Planning Tools

| Tool | Type | Furniture Library | Best For | Link |
|---|---|---|---|---|
| **Sweet Home 3D** | Desktop + Web (GPLv2) | 10,000+ models | Detailed furniture layout, 3D visualization | [sweethome3d.com](https://www.sweethome3d.com) |
| **Arcada** | Browser-based (React/Pixi.js) | Custom | Embedding in a web app | [GitHub](https://github.com/mehanix/arcada) |
| **Microsoft Workspace Optimizer** | Python/Jupyter | N/A | Data-driven seating optimization for hybrid workplaces | [GitHub](https://github.com/microsoft/workspace-optimizer) |
| **LibreCAD** | Desktop 2D CAD | N/A | Precise technical blueprints (DXF-native) | [GitHub](https://github.com/LibreCAD/LibreCAD) |

---

## 2. Open Furniture Standards & Formats

### 2.1 — IFC (Industry Foundation Classes)

IFC is the open international standard for BIM data (buildingSMART). The key entity for furniture is `IfcFurnishingElement` (IFC2x3) / `IfcFurniture` (IFC4+).

**Key tools:**

| Tool | Purpose | Furniture Use | Link |
|---|---|---|---|
| **IfcOpenShell** | C++/Python IFC library (LGPL). Full parsing for IFC2x3 through IFC4x3. | Query/create `IfcFurniture` objects programmatically | [GitHub](https://github.com/IfcOpenShell/IfcOpenShell) |
| **IfcConvert** (part of IfcOpenShell) | CLI converter: IFC → glTF, OBJ, DAE, SVG | Export furniture 3D models for web viewers | Included in IfcOpenShell |
| **Bonsai (BlenderBIM)** | Blender extension for native IFC authoring | Model & place 3D furniture, assign as `IfcFurniture` with properties | [bonsaibim.org](https://bonsaibim.org) |
| **IfcCSV** | IFC ↔ Spreadsheet conversion | Bulk-edit furniture properties via CSV | Included in IfcOpenShell |

**Relevant IFC Property Sets:**
- `Pset_FurnitureTypeCommon` — NominalLength, NominalWidth, NominalHeight, MainMaterial, Style
- `Pset_ManufacturerTypeInformation` — Manufacturer, ModelReference, ProductCode
- `Pset_Warranty` — WarrantyStartDate, WarrantyEndDate

**IFC Object Sources:**
- [BIMobject (free tier)](https://www.bimobject.com) — Manufacturer IFC objects
- [NBS National BIM Library](https://www.nationalbimlibrary.com) — Free IFC manufacturer-neutral objects
- [buildingSMART bSDD](https://search.bsdd.buildingsmart.org) — Standardized classifications (Uniclass, OmniClass)

### 2.2 — OFML (Office Furniture Modeling Language)

OFML is the standardized data description format of the German office furniture industry (IBA, formerly BSO), in use since 1998. It merges commercial and graphical product data into one format.

**Structure (4 Core Parts):**

| Part | Name | Purpose | Parseable? |
|---|---|---|---|
| ODB | OFML Database | Hierarchical 2D/3D geometry tables (TSV flat files) | Yes (Low difficulty) |
| GO | Generic Office Library | Interaction & behavior logic (binary + scripts) | Partially (High difficulty) |
| OFS | OFS Scripting | Configuration logic / parameterization (proprietary bytecode) | Partially (High difficulty) |
| OCD | Commercial Data | Pricing, article codes, ERP integration (XML-like / TSV) | Yes (Medium difficulty) |

**Current State:** No production-ready open-source OFML parser exists on GitHub or npm. The spec is available from [pCon Download Center](https://download-center.pcon-solutions.com/?cat=71). The ODB and OCD layers are approachable with a custom parser; the OFS scripting layer requires significant reverse engineering.

**Official Tools (Commercial):**
- **pCon.planner** — Office space planning tool using OFML
- **EasternGraphics SDK** — Commercial SDK for embedding OFML capabilities
- **pCon.basket REST API** — Web APIs for commercial data (OCD layer), requires partner account

### 2.3 — glTF / GLB

glTF 2.0 ("GL Transmission Format") is the de facto standard for web 3D — the "JPEG of 3D." Maintained by Khronos Group.

| Format | Storage | Best For |
|---|---|---|
| `.gltf` | JSON + .bin + textures (external) | Development / debugging |
| `.glb` | Binary, self-contained | **Production** (significantly smaller) |

**Key Feature:** Draco compression can achieve 70–90% size reduction. The `gltfjsx` CLI tool converts glTF to react-three-fiber JSX components with `--transform` for binary-packed, compressed, texture-optimized production assets.

### 2.4 — gbXML (Green Building XML)

gbXML is primarily used for energy analysis and HVAC, not furniture. Limited relevance for furniture catalogs, but useful if the planner expands into building performance analysis.

### 2.5 — Format Recommendation for This Project

**Primary format: glTF/GLB** — native Three.js support, wide ecosystem, production-ready compression, works with existing react-three-fiber setup in the planner suite.

**Secondary format: IFC** — useful for interoperability with BIM tools (architect workflows). Use IfcConvert to bridge IFC → glTF when needed.

**Skip: OFML** — no open-source tooling, proprietary runtime, German-furniture-industry-specific. Not worth the investment unless partnering with an OFML vendor.

---

## 3. Catalog Management Tools

### 3.1 — Headless Commerce Platforms (Full Catalog + Ecommerce)

| Platform | Stack | Stars | Key Features | License | Link |
|---|---|---|---|---|---|
| **Medusa** | Node.js/TypeScript | 27k+ | Product variants, collections, custom metadata, plugin system | MIT | [GitHub](https://github.com/medusajs/medusa) |
| **Saleor** | Python/Django + GraphQL | 21.8k | Channels, attributes, variants, categories, rich media | BSD-3 | [GitHub](https://github.com/mirumee/saleor) |
| **Vendure** | Node.js/NestJS + GraphQL | 6k+ | Custom fields, faceted search, collections, assets | MIT | [GitHub](https://github.com/vendure-ecommerce/vendure) |

### 3.2 — Headless CMS (Content + Catalog Modeling)

| Platform | Stack | Stars | Key Features | License | Link |
|---|---|---|---|---|---|
| **Strapi** | Node.js/TypeScript | 63k+ | Custom product types, REST + GraphQL, plugin ecosystem | MIT (self-host) | [GitHub](https://github.com/strapi/strapi) |
| **Payload CMS** | TypeScript + Next.js | 30k+ | Code-first schema, rich text, media, access control | MIT | [GitHub](https://github.com/payloadcms/payload) |
| **Directus** | Node.js + Vue.js | 28k+ | DB-first, flows/automation, webhooks, no-code admin | BSL (self-host free) | [GitHub](https://github.com/directus/directus) |

### 3.3 — Product Information Management (PIM)

| Platform | Stack | Stars | Key Features | License | Link |
|---|---|---|---|---|---|
| **AtroPIM** | PHP | 400+ | Dedicated PIM — catalog, attributes, categories, ERP integration | GPLv3 | [GitHub](https://github.com/atrocore/atropim) |
| **Pimcore** | PHP/Symfony | 3.2k+ | Enterprise PIM + DAM + CMS, master data management | GPLv3 | [GitHub](https://github.com/pimcore/pimcore) |
| **UnoPim** | Laravel | — | Free Laravel PIM — centralize product data for all channels | Open Source | [GitHub](https://github.com/unopim/unopim) |

### 3.4 — Relevance to This Project

The current stack (Express + Drizzle + PostgreSQL) is lightweight and purpose-built. A full headless CMS or PIM would be overkill unless the product catalog grows to hundreds/thousands of items with complex variant management. The more pragmatic approach is to enhance the existing API with an admin interface for catalog management and a data import pipeline.

---

## 4. Data Storage & Sync Strategies

### 4.1 — Current State

The planner stores 46 items in a hardcoded `FURNITURE_CATALOG` array in `seed.ts`. The `catalog_items` table schema supports: id, name, category, width/depth/height (cm), color, description, imageUrl, shape, seatCount, price. The real product catalog lives on oando.co.in, which does **not** expose a public API.

### 4.2 — Strategy Options

#### Option A: Web Scraping Pipeline (Short-Term)

**How it works:** Periodically scrape oando.co.in product pages, normalize data to match the `catalog_items` schema, and upsert into the database.

**Tools:**
- **Playwright** (Node.js, free, open-source) — headless browser scraping for JS-rendered pages
- **Cheerio** (Node.js, free) — lightweight HTML parser for static pages
- **Zyte API** (managed) — AI-powered product extraction, no custom selectors needed
- **Apify** (managed, free tier) — pre-built e-commerce scraping actors

**Pros:** No changes needed on the oando.co.in side. Can start immediately.
**Cons:** Fragile (breaks when site layout changes). May violate ToS. Requires maintenance.

**Implementation sketch:**
```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│ oando.co.in │ →  │ Scraper      │ →  │ Normalizer  │ →  │ catalog_items│
│ (website)   │    │ (Playwright) │    │ (transform) │    │ (PostgreSQL) │
└─────────────┘    └──────────────┘    └─────────────┘    └──────────────┘
     Scheduled: every 6–24 hours (cron job or scheduled task)
```

#### Option B: Shared Database / API (Medium-Term, Recommended)

**How it works:** oando.co.in exposes a product API (REST or GraphQL) that the planner consumes directly. The planner pulls catalog data from this API and caches it locally.

**Implementation options:**
1. **Direct API integration** — oando.co.in builds a product API endpoint; planner fetches on startup and caches
2. **Shared PostgreSQL database** — both apps read from the same catalog table (read-only for planner)
3. **Webhook-based sync** — oando.co.in pushes catalog updates via webhooks; planner processes and stores

**Pros:** Real-time data, reliable, no scraping fragility.
**Cons:** Requires development effort on the oando.co.in side.

**Implementation sketch:**
```
┌─────────────┐    ┌─────────────────┐    ┌──────────────┐
│ oando.co.in │ →  │ Product API     │ →  │ Planner API  │
│ (admin)     │    │ /api/products   │    │ (cache+serve)│
└─────────────┘    └─────────────────┘    └──────────────┘
     On product change → webhook → planner invalidates cache
```

#### Option C: CMS-Driven Catalog (Long-Term)

**How it works:** A headless CMS (Payload CMS or Strapi) serves as the single source of truth for the product catalog. Both oando.co.in and the planner consume catalog data from the CMS API.

**Best fit:** Payload CMS — TypeScript + Next.js, code-first schema, MIT license. Aligns with the existing stack.

**Pros:** Single source of truth, admin UI for non-technical users, media management, version history.
**Cons:** Adds infrastructure complexity. Overkill if the catalog stays under ~200 items.

#### Option D: CSV/JSON Import (Simplest)

**How it works:** Export product data from oando.co.in as a CSV or JSON file. Import into the planner database via an admin endpoint.

**Pros:** Dead simple. No dependencies. Works offline.
**Cons:** Manual process, no real-time updates.

### 4.3 — Schema Enhancement Suggestions

The current `catalog_items` schema could be extended to support richer product data:

```typescript
// Potential additions to catalog.ts schema:
sourceUrl: text("source_url"),            // link back to oando.co.in product page
sku: text("sku"),                         // manufacturer SKU
material: text("material"),              // e.g., "Engineered wood / Metal frame"
colorsAvailable: text("colors_available"), // JSON array of available colors
modelUrl: text("model_url"),             // URL to 3D model (GLB)
thumbnailUrl: text("thumbnail_url"),     // product thumbnail
lastSyncedAt: timestamp("last_synced_at"), // when data was last pulled from source
sourceSystem: text("source_system"),     // "seed" | "oando" | "manual"
```

---

## 5. Three.js-Compatible 3D Model Repositories

### 5.1 — Current Stack

The planner suite already includes `three`, `@react-three/fiber`, and `@react-three/drei` in its dependencies. This means it can natively load glTF/GLB models using `useGLTF` from Drei.

### 5.2 — Free 3D Model Sources Compatible with Three.js

| Source | Type | Office Furniture? | Format | License | Link |
|---|---|---|---|---|---|
| **Poly Haven** | Models + textures | Some | glTF | CC0 | [polyhaven.com](https://polyhaven.com) |
| **Poimandres Market** | Dev-friendly models | Some | glTF | Varies | [market.pmnd.rs](https://market.pmnd.rs) |
| **Sketchfab (free)** | Largest free library | Yes, extensive | glTF (auto-convert) | Varies (CC) | [sketchfab.com](https://sketchfab.com) |
| **TurboSquid (free)** | Production models | Yes | GLB | Varies | [turbosquid.com](https://www.turbosquid.com) |
| **Kenney Assets** | Low-poly game assets | Furniture packs | glTF | CC0 | [kenney.nl](https://kenney.nl) |
| **3dbrute.com** | Dedicated GLB filter | Yes, subcategory | GLB | Varies | [3dbrute.com](https://3dbrute.com/tag/glb/) |
| **Free3D** | General 3D models | Office category | Some glTF | Varies | [free3d.com](https://free3d.com/3d-models/office) |

### 5.3 — Asset Pipeline Tools

| Tool | Purpose | Link |
|---|---|---|
| **gltfjsx** | Convert glTF → react-three-fiber JSX components. `--transform` flag compresses, optimizes textures, dedupes. | [GitHub](https://github.com/pmndrs/gltfjsx) |
| **gltf-transform** | CLI + library for optimizing glTF files (compress, resize textures, merge, prune) | [GitHub](https://github.com/donmccurdy/glTF-Transform) |
| **Draco** | Google's mesh compression. 70–90% size reduction. Built into Three.js loader. | [GitHub](https://github.com/google/draco) |
| **model-viewer** | Google's `<model-viewer>` web component for embedding 3D models with zero JS code. | [GitHub](https://github.com/google/model-viewer) |
| **SVGO** | SVG optimizer. Useful for 2D furniture sprites before bundling into sprites. | [GitHub](https://github.com/svg/svgo) |

### 5.4 — Loading Models in the Existing Stack

The planner already uses `@react-three/drei` which provides `useGLTF`:

```tsx
import { useGLTF } from '@react-three/drei'

function FurnitureModel({ modelUrl, ...props }) {
  const { scene } = useGLTF(modelUrl)
  return <primitive object={scene} {...props} />
}
useGLTF.preload('/models/office-desk.glb')
```

**Performance guidelines:**
- Keep each GLB file under 1–2 MB for web delivery
- Use Draco compression on all mesh-heavy models
- Preload models that will be used frequently
- Wrap in `<Suspense>` with loading fallback

---

## 6. Recommendations

### 6.1 — Replacing the Hardcoded Seed Catalog

**Phase 1 — Admin Import (Immediate, Low Effort)**
1. Add an admin API endpoint that accepts CSV/JSON product data uploads
2. Map uploaded data to the `catalog_items` schema and upsert
3. Export the current seed data as the initial CSV, allowing non-developers to maintain it
4. Add `sourceSystem` and `lastSyncedAt` columns to track data provenance

**Phase 2 — oando.co.in API Integration (Medium-Term, Recommended)**
1. Build a lightweight product API on the oando.co.in side (REST endpoint returning JSON)
2. Create a sync service in the planner API that fetches from this endpoint on a schedule (every 6–24 hours)
3. Implement delta sync (only update changed items) using `lastModified` timestamps
4. Keep the local `catalog_items` table as a cache with `lastSyncedAt` tracking

**Phase 3 — 3D Model Pipeline (Future)**
1. Add a `modelUrl` column to `catalog_items` for GLB file references
2. Source initial 3D models from Sketchfab/Poly Haven (CC0 licensed)
3. Commission custom GLB models for key oando.co.in products
4. Use `gltfjsx --transform` to optimize all models for web delivery
5. Store models in object storage, serve via CDN
6. Integrate into the planner's existing Three.js setup using `useGLTF`

### 6.2 — Format Strategy

| Purpose | Format | Rationale |
|---|---|---|
| 2D floor plan rendering (current) | Canvas/Konva (existing) | Already working well |
| 3D product preview | glTF/GLB | Native Three.js support, best web compression |
| BIM interoperability (future) | IFC → glTF via IfcConvert | Bridges architect workflows |
| Data exchange | JSON REST API | Simplest, fits existing Express stack |

### 6.3 — What NOT to Pursue

- **OFML** — No open-source tooling, proprietary runtime. Not worth the investment.
- **Full headless CMS** (Strapi/Payload) — Overkill for current catalog size (~50-200 items). Revisit if catalog exceeds 500+ items.
- **gbXML** — Energy analysis format, not relevant for furniture catalogs.
- **Paid 3D model libraries** — Out of scope per task constraints.

### 6.4 — Immediate Next Steps

1. Extend the `catalog_items` schema with `sourceSystem`, `lastSyncedAt`, `sku`, `modelUrl`, `thumbnailUrl`
2. Build a `/api/catalog/import` admin endpoint for CSV/JSON upload
3. Investigate oando.co.in's site structure to plan the scraping or API approach
4. Source 5–10 CC0 GLB office furniture models from Sketchfab/Poly Haven as a proof of concept
5. Add a 3D model preview component to the catalog using the existing `@react-three/drei` setup

---

## Appendix: Key GitHub Links

| Repository | Stars | Purpose |
|---|---|---|
| [IfcOpenShell/IfcOpenShell](https://github.com/IfcOpenShell/IfcOpenShell) | Major | IFC parsing, converting, authoring |
| [KhronosGroup/glTF-Sample-Models](https://github.com/KhronosGroup/glTF-Sample-Models) | Major | Official glTF sample models |
| [ToxSam/open-source-3D-assets](https://github.com/toxsam/open-source-3D-assets) | — | 991+ CC0 GLB models with JSON registry |
| [pmndrs/gltfjsx](https://github.com/pmndrs/gltfjsx) | Major | glTF → React Three Fiber JSX converter |
| [donmccurdy/glTF-Transform](https://github.com/donmccurdy/glTF-Transform) | Major | glTF optimization CLI + library |
| [pmndrs/drei](https://github.com/pmndrs/drei) | Major | React Three Fiber helpers (useGLTF, etc.) |
| [mehanix/arcada](https://github.com/mehanix/arcada) | — | Browser-based floor plan creator (React/Pixi.js) |
| [microsoft/workspace-optimizer](https://github.com/microsoft/workspace-optimizer) | — | Data-driven seating/space optimizer |
| [theLodgeBots/open3dFloorplan](https://github.com/theLodgeBots/open3dFloorplan) | — | 140+ furniture items, SvelteKit + Three.js |
| [ekymo/homeRoughEditor](https://github.com/ekymo/homeRoughEditor) | ~381 | Pure SVG floor plan editor |
| [strapi/strapi](https://github.com/strapi/strapi) | 63k+ | Headless CMS (Node.js) |
| [payloadcms/payload](https://github.com/payloadcms/payload) | 30k+ | Code-first headless CMS (TypeScript + Next.js) |
| [medusajs/medusa](https://github.com/medusajs/medusa) | 27k+ | Headless commerce (Node.js) |
| [google/model-viewer](https://github.com/google/model-viewer) | Major | Web component for 3D model display |
| [google/draco](https://github.com/google/draco) | Major | 3D mesh compression |
| [playcanvas/model-viewer](https://github.com/playcanvas/model-viewer) | — | 3D model viewer with Gaussian splats |
| [svg/svgo](https://github.com/svg/svgo) | Major | SVG optimizer |

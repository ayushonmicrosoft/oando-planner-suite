# One&Only Live Planner — Technical Workflow & Walkthrough

## 1. Product Overview

The **Live Planner** is the flagship workspace design tool within the One&Only platform. It allows architects, interior designers, and facility managers to design office floor plans in a professional 2D canvas with instant 3D preview, a furniture catalog connected to a real database, and multi-format export.

| Attribute | Detail |
|-----------|--------|
| Route | `/planner/studio` |
| Engine | tldraw v4.5.8 (infinite canvas) |
| 3D Engine | Three.js + React Three Fiber + drei |
| State | zustand (client-side reactive store) |
| Catalog data | PostgreSQL via Express REST API |
| Auth | Clerk (JWT, Google OAuth) |
| Export | PNG, SVG, PDF (jsPDF) |

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Browser (React + Vite)                       │
│                                                                     │
│  ┌──────────┐  ┌────────────────────────────┐  ┌────────────────┐  │
│  │ Studio   │  │      tldraw Canvas          │  │  Studio        │  │
│  │ Catalog  │  │  (TLComponents overrides)   │  │  Inspector     │  │
│  │ (300px)  │◄─┤  shapes ←→ zustand store    │─►│  (280px)       │  │
│  │          │  │  tools, grid, zoom           │  │  Props/Layers  │  │
│  └──────────┘  └─────────────┬──────────────┘  └────────────────┘  │
│                              │                                      │
│  ┌───────────────────────────┴───────────────────────────────────┐  │
│  │                     StudioToolbar (48px)                       │  │
│  │  [◄] [logo] [Catalog] | Tools | Undo/Redo | Edit | Zoom | …  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│  ┌───────────────────────────┴───────────────────────────────────┐  │
│  │                    StudioStatusBar (32px)                      │  │
│  │  Tool: Select | 12 shapes | X: 340 Y: 210 | Grid ● | 100%   │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│  ┌───────────────────────────┴───────────────────────────────────┐  │
│  │          Studio3DView (React Three Fiber — 50% width)         │  │
│  │   Reads tldraw shapes → renders 3D blocks with materials      │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                  ┌───────────┴───────────┐                          │
│                  │   usePlannerStore      │                          │
│                  │   (zustand)            │                          │
│                  │   editor, tool, zoom,  │                          │
│                  │   panels, dirty flag   │                          │
│                  └───────────┬───────────┘                          │
│                              │                                      │
│                  ┌───────────┴───────────┐                          │
│                  │   API Client (Orval)   │                          │
│                  │   useListCatalogItems  │                          │
│                  └───────────┬───────────┘                          │
└──────────────────────────────┼──────────────────────────────────────┘
                               │ HTTP (JWT)
                  ┌────────────┴────────────┐
                  │  Express 5 API Server    │
                  │  /api/catalog            │
                  │  /api/plans              │
                  │  /api/templates          │
                  ├────────────┬────────────┤
                  │ Clerk Auth │ Drizzle ORM│
                  └────────────┴────────────┘
                               │
                  ┌────────────┴────────────┐
                  │     PostgreSQL           │
                  │  catalog_items (46 rows) │
                  │  plans, templates        │
                  └─────────────────────────┘
```

---

## 3. File Structure

```
artifacts/planner-suite/src/features/planner/
├── planner-store.ts        # Zustand state — editor, tool, panels, zoom, cursor
├── planner-config.ts       # Canvas/logic/UI/export configuration constants
├── StudioPlanner.tsx        # Main component — mounts tldraw, wires all panels
├── StudioToolbar.tsx        # Top toolbar — 12 tools, edit actions, zoom, export
├── StudioCatalog.tsx        # Left panel — furniture catalog with search & categories
├── StudioInspector.tsx      # Right panel — properties editor + layers view
├── StudioStatusBar.tsx      # Bottom bar — tool, shapes, cursor pos, zoom %
└── Studio3DView.tsx         # Split-screen 3D preview (React Three Fiber)
```

Supporting files:

```
artifacts/planner-suite/src/
├── pages/planner/studio.tsx   # Route page wrapper
├── pages/planners-hub.tsx     # Hub page listing all 3 planners + drawing tools
├── App.tsx                    # Route definitions (wouter)
├── components/layout.tsx      # Sidebar with "Live Planner" entry
└── index.css                  # tldraw CSS overrides (hides default UI)
```

---

## 4. Technical Workflow — Step by Step

### 4.1 Application Bootstrap

1. **Vite dev server** starts on the port assigned by the Replit environment (`PORT` env var).
2. **`App.tsx`** wraps the app in `WouterRouter` → `ClerkProvider` → `QueryClientProvider`.
3. Route `/planner/studio` is matched. Clerk's `<Show when="signed-in">` gate checks the JWT session.
4. If authenticated, `<StudioPage />` renders `<StudioPlanner />`.

### 4.2 tldraw Initialization

```
StudioPlanner.tsx
  └─ React.lazy(() => import("tldraw").then(mod => mod.Tldraw))
```

- tldraw is **code-split** via `React.lazy` and wrapped in `<Suspense>` with a branded spinner.
- All default tldraw UI panels are **disabled** via `TLComponents`:

```ts
const CANVAS_COMPONENTS: TLComponents = {
  SharePanel: null,
  TopPanel: null,
  MenuPanel: null,
  StylePanel: null,
  PageMenu: null,
  NavigationPanel: null,
  HelpMenu: null,
  DebugPanel: null,
  DebugMenu: null,
};
```

- Additional CSS overrides in `index.css` hide any remaining default chrome:

```css
.tl-container .tlui-toolbar,
.tl-container .tlui-style-panel,
.tl-container .tlui-menu-zone,
.tl-container .tlui-navigation-zone { display: none !important; }
```

### 4.3 Editor Mount & Store Binding

When tldraw calls `onMount(editor)`:

1. The `Editor` instance is stored in zustand via `setEditor(editor)`.
2. Grid mode is enabled: `editor.updateInstanceState({ isGridMode: true })`.
3. Light color scheme is set: `editor.user.updateUserPreferences({ colorScheme: "light" })`.
4. A **store listener** is attached to track zoom level and shape count in real time.
5. A **pointer_move event** listener tracks cursor coordinates for the status bar.

```ts
editor.store.listen(() => {
  setZoom(Math.round(editor.getZoomLevel() * 100));
  setShapeCount(editor.getCurrentPageShapeIds().size);
});
```

### 4.4 Keyboard Shortcut System

A global `keydown` listener on `window` handles all shortcuts. It checks:
- The event target is not an `<input>` or `<textarea>` (to avoid intercepting text entry).
- Modifier keys (`Ctrl`/`Cmd`) for system shortcuts.

| Shortcut | Action |
|----------|--------|
| `V` | Select tool |
| `H` | Hand (pan) tool |
| `R` | Rectangle / Ellipse (geo) tool |
| `L` | Line tool |
| `A` | Arrow tool |
| `D` | Freehand draw tool |
| `T` | Text tool |
| `F` | Frame tool |
| `N` | Sticky note tool |
| `E` | Eraser tool |
| `C` | Toggle catalog panel |
| `G` | Toggle grid |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` / `Ctrl+Y` | Redo |
| `Ctrl+D` | Duplicate selected shapes |
| `Ctrl+A` | Select all shapes |
| `Delete` / `Backspace` | Delete selected shapes |

### 4.5 Layout System

The canvas area dynamically resizes based on which panels are open:

```
┌──────────────────────────────────────────────────────┐
│  StudioToolbar (h: 48px, position: absolute top)     │
├────────┬──────────────────────────────┬───────────────┤
│Catalog │                              │  Inspector    │
│300px   │    tldraw Canvas             │  280px        │
│left    │    (fills remaining space)   │  right        │
│panel   │                              │  panel        │
├────────┴──────────────────────────────┴───────────────┤
│  StudioStatusBar (h: 32px, position: absolute bottom) │
└──────────────────────────────────────────────────────┘
```

When the **3D View** is toggled, the Inspector is hidden and the 3D panel takes `50%` width on the right.

Panel visibility is managed by zustand booleans (`showCatalog`, `showInspector`, `show3D`) with CSS transitions via `transition-all duration-300 ease-out`.

---

## 5. Component Deep Dives

### 5.1 StudioToolbar

**File:** `StudioToolbar.tsx` — 227 lines

Sections from left to right:

1. **Back button** — navigates to `/` (dashboard) via wouter's `setLocation`.
2. **Brand mark** — One&Only logo (inverted for light toolbar).
3. **Catalog toggle** — opens/closes the left catalog panel.
4. **Navigation tools** — Select (`select`), Pan (`hand`).
5. **Drawing tools** — Rect/Ellipse (`geo`), Line, Arrow, Freehand (`draw`), Text, Sticky Note, Frame, Highlight, Eraser.
6. **Edit actions** — Undo, Redo, Rotate CCW/CW (90 increments), Duplicate, Bring Forward, Send Backward, Delete.
7. **Plan name input** — editable text field, sets `isDirty` on change.
8. **Unsaved indicator** — amber "UNSAVED" badge when `isDirty` is true.
9. **Zoom controls** — Zoom In, current zoom % (click to reset), Zoom Out, Zoom to Fit.
10. **View toggles** — Grid, Minimap, 3D View.
11. **Export dropdown** — PNG, SVG, PDF export options.
12. **Inspector toggle** — opens/closes the right properties panel.

**Export Implementation:**

All three export formats use `editor.getSvgString()` as the common first step:

```
getSvgString(ids, { background: true, padding: 32 })
    │
    ├─ PNG: Render SVG into <canvas> at 2x scale → canvas.toDataURL("image/png")
    ├─ SVG: Direct Blob download of the SVG string
    └─ PDF: Render SVG → <canvas> → jsPDF.addImage() with auto orientation
```

### 5.2 StudioCatalog

**File:** `StudioCatalog.tsx` — 180 lines

Data flow:

```
useListCatalogItems()          ← Orval-generated React Query hook
    │                             (GET /api/catalog)
    ▼
rawItems → map to CatalogProduct[] → filter by tab + search → render grid
```

**Categories** (7 from PostgreSQL):

| Category | Icon | Color | Item Count |
|----------|------|-------|-----------|
| Workstations | MonitorSmartphone | #1F3653 | ~12 |
| Seating | Armchair | #2d6a4f | ~8 |
| Soft Seating | Armchair | #7b2cbf | ~5 |
| Tables | Table2 | #e85d04 | ~7 |
| Storage | Archive | #588157 | ~6 |
| Education | BookOpen | #0077b6 | ~4 |
| Accessories | Puzzle | #bc4749 | ~4 |

**SVG Top-View Thumbnails:**

Each catalog item renders an inline `<svg>` showing a proportional top-view of the furniture piece:

```
item.widthCm × item.depthCm → scaled to fit 56×56px box
├─ "circle" / "round" shape → <ellipse>
├─ "l-left" / "l-right" shape → <path> (L-shape polygon)
└─ default → <rect> with rounded corners
```

**Placing items on canvas:**

When clicked, `placeOnCanvas()` is called:

1. Get the viewport center: `editor.getViewportScreenCenter()`.
2. Convert screen coords to page coords: `editor.screenToPage(center)`.
3. Scale dimensions: `widthCm * PX_PER_CM` (where `PX_PER_CM = 2`).
4. Create a `geo` shape at the computed position:

```ts
editor.createShape({
  id: createShapeId(),
  type: "geo",
  x: point.x - w / 2,
  y: point.y - h / 2,
  props: {
    w, h,
    geo: isRound ? "ellipse" : "rectangle",
    color: categoryColor,
    text: item.name,
    size: "s",
    font: "sans",
    fill: "semi",
  },
});
```

5. Set `isDirty = true` and open the Inspector panel automatically.

### 5.3 StudioInspector

**File:** `StudioInspector.tsx` — 210 lines

Two tabs:
- **Properties** — edit the selected shape's attributes.
- **Layers** — view and select all shapes in draw order.

**Properties sections (when 1 shape selected):**

| Section | Fields |
|---------|--------|
| Element | Shape type badge, Duplicate button, Delete button |
| Position | X, Y (numeric inputs) |
| Rotation | Degrees (converted from/to radians internally) |
| Size | W, H (px) + real-size readout in cm (`px / 2`) |
| Label | Text input for the shape's text prop |
| Style | 13-color palette + 4 fill modes (None/Semi/Solid/Pattern) |
| Arrange | Bring Forward / Send Backward buttons |

**Shape update flow:**

```
User edits input → onChange fires
    │
    ▼
updateShape({ id, type, ...partial })   or   updateProps({ ...propPartial })
    │                                            │
    ▼                                            ▼
editor.updateShape(...)               editor.updateShape({ props: {...} })
    │
    ▼
tldraw store listener fires → zustand updates shapeCount
```

### 5.4 Studio3DView

**File:** `Studio3DView.tsx` — 169 lines

This component provides a **split-screen 3D preview** of the current floor plan.

**Shape-to-3D pipeline:**

```
tldraw Editor
    │
    ▼
editor.getCurrentPageShapeIds()
    │
    ▼
Filter for type === "geo" shapes only
    │
    ▼
For each shape:
  ├─ Convert px dimensions to meters (PX_TO_M = 0.005)
  ├─ Position: (shape.x * PX_TO_M, 0, shape.y * PX_TO_M)
  ├─ Height: fixed 0.75m (desk height)
  ├─ Rotation: -shape.rotation (Y-axis, inverted for 3D convention)
  ├─ Color: category-based lookup from label text
  └─ Render: <RoundedBox> with meshStandardMaterial
```

**Three.js scene setup:**

| Element | Configuration |
|---------|--------------|
| Camera | PerspectiveCamera, FOV 50, positioned 8m above/beside center |
| Controls | OrbitControls with damping, polar angle limits |
| Lighting | Ambient (0.5 intensity) + Directional (1.0, shadow-casting, 2048px shadow map) |
| Environment | "apartment" preset (HDR-based reflections) |
| Tone mapping | ACES Filmic |
| Floor | Plane geometry matching shape bounds + 2m padding |
| Grid | drei `<Grid>` with 0.5m cells, 2.5m sections |
| Labels | drei `<Text>` rendered on top face of each block |

### 5.5 StudioStatusBar

**File:** `StudioStatusBar.tsx` — 62 lines

Displays real-time information in a fixed 32px bar at the bottom:

```
[Tool Icon] Select | 12 shapes | 3 selected | ... | X: 340 Y: 210 | Grid ● | 100%
```

All values are read reactively from the zustand store.

---

## 6. State Management

### 6.1 Zustand Store (`usePlannerStore`)

Single flat store with **no middleware** — intentionally simple for maximum performance.

| State Key | Type | Default | Description |
|-----------|------|---------|-------------|
| `editor` | `Editor \| null` | `null` | tldraw editor instance |
| `step` | `PlannerStep` | `"layout"` | Current workflow step |
| `activeTool` | `CanvasToolMode` | `"select"` | Active drawing tool |
| `planName` | `string` | `"Untitled Workspace"` | Plan display name |
| `isDirty` | `boolean` | `false` | Unsaved changes flag |
| `showCatalog` | `boolean` | `true` | Catalog panel visibility |
| `showInspector` | `boolean` | `false` | Inspector panel visibility |
| `showGrid` | `boolean` | `true` | Grid overlay visibility |
| `showMinimap` | `boolean` | `false` | Minimap visibility |
| `show3D` | `boolean` | `false` | 3D view panel visibility |
| `zoom` | `number` | `100` | Current zoom % (synced from editor) |
| `shapeCount` | `number` | `0` | Total shapes on current page |
| `cursorPos` | `{x, y}` | `{0, 0}` | Cursor position in page coords |
| `catalogTab` | `string` | `"all"` | Active category filter |
| `catalogSearch` | `string` | `""` | Catalog search query |

### 6.2 Two-Way Sync: zustand ↔ tldraw

```
                    ┌──────────────┐
                    │  User Action  │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼                         ▼
     ┌────────────────┐       ┌────────────────┐
     │  zustand store  │◄────►│  tldraw editor  │
     │  (UI state)     │      │  (canvas state)  │
     └────────┬───────┘       └────────┬───────┘
              │                        │
              ▼                        ▼
     StudioToolbar              tldraw internal
     StudioCatalog              shape store
     StudioInspector            (TLStore)
     StudioStatusBar
     Studio3DView
```

- **zustand → tldraw**: When user clicks a tool button, zustand updates `activeTool`, then calls `editor.setCurrentTool()`.
- **tldraw → zustand**: An `editor.store.listen()` callback fires on every store change, updating `zoom` and `shapeCount` in zustand.
- **Pointer events**: `editor.on("event")` captures `pointer_move` to update `cursorPos`.

---

## 7. Data Flow — Catalog to Canvas to 3D

```
PostgreSQL (catalog_items table)
    │
    │  GET /api/catalog
    ▼
Express API (Drizzle ORM query)
    │
    │  JSON response
    ▼
React Query (useListCatalogItems hook)
    │
    │  Cached data
    ▼
StudioCatalog component
    │
    │  User clicks item → placeOnCanvas()
    ▼
tldraw Editor (createShape with geo type)
    │
    │  Store change triggers listener
    ▼
Studio3DView reads shapes via editor.getCurrentPageShapeIds()
    │
    ▼
React Three Fiber renders FurnitureBlock for each geo shape
```

---

## 8. Unit System

| Domain | Unit | Scale Factor |
|--------|------|-------------|
| Catalog database | centimeters | — |
| tldraw canvas | pixels | 2 px per cm (`PX_PER_CM = 2`) |
| 3D scene | meters | 0.005 m per px (`PX_TO_M = 0.005`) |
| Inspector readout | centimeters | `px / 2` |
| PDF export | millimeters | `px * 0.264583` (px to mm at 96 DPI) |

---

## 9. Export Pipeline

### 9.1 PNG Export

```
editor.getSvgString(allShapeIds, { background: true, padding: 32 })
    │
    ▼
Create <img> element with SVG data URL
    │
    ▼
Draw onto <canvas> at 2x resolution (retina)
    │
    ▼
canvas.toDataURL("image/png")
    │
    ▼
Trigger download via <a download="planName.png">
```

### 9.2 SVG Export

```
editor.getSvgString(allShapeIds, { background: true, padding: 32 })
    │
    ▼
Create Blob("image/svg+xml")
    │
    ▼
URL.createObjectURL → <a download="planName.svg">
```

### 9.3 PDF Export

```
editor.getSvgString(...)
    │
    ▼
SVG → <img> → <canvas> at 2x
    │
    ▼
Calculate PDF dimensions: canvas px * 0.264583 = mm
    │
    ▼
Auto-detect orientation (landscape if wider than tall)
    │
    ▼
new jsPDF({ orientation, unit: "mm", format: [width, height] })
    │
    ▼
pdf.addImage(canvas.toDataURL("png"), ...)
    │
    ▼
pdf.save("planName.pdf")
```

---

## 10. Authentication Flow

```
User visits /planner/studio
    │
    ▼
App.tsx: <Route path="/planner/studio">
    │
    ▼
<Show when="signed-in">   →  ✅ Render <StudioPage />
<Show when="signed-out">  →  ❌ <Redirect to="/sign-in" />
    │
    ▼
Clerk Sign-In page (Google OAuth or Email)
    │
    ▼
Clerk issues JWT session cookie
    │
    ▼
API calls include Clerk JWT automatically
    │
    ▼
Express: clerkMiddleware() → requireAuth → userId extraction
```

Note: The Studio planner route is rendered **without** the `<AppLayout>` sidebar wrapper. It is intentionally full-screen to maximize canvas real estate. Other planner routes (`/planner/canvas`, `/planner/blueprint`) use the standard sidebar layout.

---

## 11. Routing & Navigation

| Route | Component | Layout | Auth |
|-------|-----------|--------|------|
| `/` | Landing (signed out) / Dashboard (signed in) | None / AppLayout | Optional |
| `/planners` | PlannersHub | AppLayout | Required |
| `/planner/studio` | StudioPlanner | **Full-screen** (no sidebar) | Required |
| `/planner/canvas` | CanvasPlanner (Konva) | AppLayout | Required |
| `/planner/blueprint` | BlueprintPlanner | AppLayout | Required |
| `/viewer/3d` | Viewer3D | AppLayout | Required |
| `/catalog` | Catalog | AppLayout | Required |
| `/plans` | SavedPlans | AppLayout | Required |
| `/templates` | Templates | AppLayout | Required |

---

## 12. Dependencies

### Core Planner Packages

| Package | Version | Purpose |
|---------|---------|---------|
| `tldraw` | 4.5.8 | Infinite canvas engine — shapes, tools, transforms, undo/redo |
| `zustand` | ^5.x | Lightweight reactive state management |
| `three` | ^0.172 | 3D rendering engine |
| `@react-three/fiber` | ^9.x | React renderer for Three.js |
| `@react-three/drei` | ^10.x | Three.js helper components (OrbitControls, Grid, Text, Environment, RoundedBox) |
| `jspdf` | ^3.x | Client-side PDF generation |
| `framer-motion` | ^12.x | Animation library (used in PlannersHub transitions) |

### Infrastructure Packages

| Package | Purpose |
|---------|---------|
| `@clerk/react` | Authentication provider and hooks |
| `@tanstack/react-query` | Server state management (catalog data) |
| `wouter` | Lightweight client-side routing |
| `@workspace/api-client-react` | Orval-generated API hooks (from OpenAPI spec) |

---

## 13. Configuration Constants

From `planner-config.ts`:

```ts
{
  canvas: {
    padding: 18,            // px padding around canvas content
    defaultRoomWidth: 960,   // px (= 480cm = 4.8m)
    defaultRoomDepth: 640,   // px (= 320cm = 3.2m)
  },
  logic: {
    minimumWallGapCm: 180,   // minimum gap between walls
    snappingGridSizeCm: 10,  // grid snap increment
  },
  ui: {
    sidebarWidthLg: 312,     // catalog panel width at lg
    inspectorWidthLg: 300,   // inspector panel width at lg
    transitionDurationMs: 500,
  },
  export: {
    pdfScale: 2,             // retina export multiplier
    pdfHeaderColor: "#1F3653",
  }
}
```

---

## 14. CSS Customization Layer

tldraw ships with its own stylesheet (`tldraw/tldraw.css`). The planner overrides specific elements:

```css
/* Custom canvas background */
.tl-container { --color-background: #f8f9fb; }

/* Hide ALL default tldraw UI chrome */
.tl-container .tlui-toolbar,
.tl-container .tlui-style-panel,
.tl-container .tlui-toolbar__tools,
.tl-container .tlui-menu-zone,
.tl-container .tlui-navigation-zone,
.tl-container .tlui-help-menu,
.tl-container [data-testid="main.page-menu"] {
  display: none !important;
}
```

This ensures a fully branded experience with zero tldraw-default UI leaking through.

---

## 15. Performance Considerations

| Technique | Implementation |
|-----------|---------------|
| Code splitting | tldraw loaded via `React.lazy()` + `<Suspense>` |
| Selective rendering | 3D view only renders `type === "geo"` shapes |
| Debounced cursor | Cursor position updates fire on `pointer_move` (native, not throttled — tldraw handles batching) |
| Store listener | Single `editor.store.listen()` callback for zoom + shape count |
| Panel transitions | CSS `transition-all duration-300` — GPU-accelerated |
| PDF generation | Dynamic import of jsPDF: `await import("jspdf")` (not in main bundle) |

---

## 16. Future Roadmap

| Feature | Status | Notes |
|---------|--------|-------|
| Custom furniture ShapeUtil | Planned | SVG top-view rendering directly on canvas instead of geo shapes |
| Wall drawing tool | Planned | Custom StateNode tool for drawing wall segments |
| Measurement overlay | Planned | Dimension lines between shapes with cm readouts |
| Auto-save to API | Planned | Debounced save via `useUpdatePlan` + `editor.store.getStoreSnapshot()` |
| Template loading | Planned | Load template shapes from `/api/templates/:id` into tldraw store |
| AI Copilot panel | Planned | Chat interface for layout suggestions using spatial analysis |
| Multiplayer | Planned | tldraw supports real-time collaboration via Yjs/PartyKit |
| Custom shape palette | Planned | Door, window, partition, electrical outlet shape types |
| BOQ generation | Planned | Auto-generate bill of quantities from placed shapes |
| DXF/DWG export | Planned | CAD-format export for professional use |

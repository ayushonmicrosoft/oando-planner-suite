"use client";

import { useState, useMemo, useCallback } from "react";
import { Search, X, ChevronRight, Plus, Package, Star, Armchair, Table2, MonitorSmartphone, Archive, BookOpen, Puzzle, LayoutGrid, GripVertical } from "lucide-react";
import { usePlannerStore, type CatalogProduct } from "./planner-store";
import { useListCatalogItems } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { createShapeId } from "tldraw";

const CATEGORY_META: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  workstations: { icon: MonitorSmartphone, color: "#1F3653", label: "Workstations" },
  seating: { icon: Armchair, color: "#2d6a4f", label: "Seating" },
  "soft-seating": { icon: Armchair, color: "#7b2cbf", label: "Soft Seating" },
  tables: { icon: Table2, color: "#e85d04", label: "Tables" },
  storage: { icon: Archive, color: "#588157", label: "Storage" },
  education: { icon: BookOpen, color: "#0077b6", label: "Education" },
  accessories: { icon: Puzzle, color: "#bc4749", label: "Accessories" },
};

const PX_PER_CM = 2;

const SHAPE_COLORS: Record<string, string> = {
  workstations: "light-blue",
  seating: "light-green",
  "soft-seating": "violet",
  tables: "orange",
  storage: "yellow",
  education: "blue",
  accessories: "light-red",
};

function FurnitureTopView({ item, size = 48 }: { item: CatalogProduct; size?: number }) {
  const w = item.widthCm;
  const d = item.depthCm;
  const maxDim = Math.max(w, d);
  const scale = (size - 8) / maxDim;
  const rw = w * scale;
  const rd = d * scale;
  const isRound = item.shape === "circle" || item.shape === "round";
  const catMeta = CATEGORY_META[item.category];
  const fill = catMeta?.color || "#1F3653";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <rect width={size} height={size} rx={6} fill={`${fill}08`} />
      {isRound ? (
        <ellipse
          cx={size / 2} cy={size / 2} rx={rw / 2} ry={rd / 2}
          fill={`${fill}20`} stroke={fill} strokeWidth={1.5}
        />
      ) : item.shape === "l-left" || item.shape === "l-right" ? (
        <path
          d={item.shape === "l-left"
            ? `M${(size - rw) / 2},${(size - rd) / 2} h${rw} v${rd * 0.6} h${-rw * 0.5} v${rd * 0.4} h${-rw * 0.5} z`
            : `M${(size - rw) / 2},${(size - rd) / 2} h${rw * 0.5} v${rd * 0.4} h${rw * 0.5} v${rd * 0.6} h${-rw} z`
          }
          fill={`${fill}20`} stroke={fill} strokeWidth={1.5}
        />
      ) : (
        <rect
          x={(size - rw) / 2} y={(size - rd) / 2} width={rw} height={rd}
          rx={2} fill={`${fill}20`} stroke={fill} strokeWidth={1.5}
        />
      )}
      {item.seatCount && item.seatCount > 0 && (
        <text x={size / 2} y={size / 2 + 3} textAnchor="middle" fontSize={9} fontWeight={600} fill={fill}>
          {item.seatCount}s
        </text>
      )}
    </svg>
  );
}

export function StudioCatalog() {
  const { showCatalog, editor, catalogTab, setCatalogTab, catalogSearch, setCatalogSearch } = usePlannerStore();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const { data: rawItems, isLoading } = useListCatalogItems();
  const items: CatalogProduct[] = useMemo(() => {
    return (rawItems || []).map((item: any) => ({
      id: String(item.id),
      name: item.name,
      category: item.category,
      widthCm: item.widthCm || 60,
      depthCm: item.depthCm || 60,
      heightCm: item.heightCm || 75,
      color: item.color || "#94a3b8",
      shape: item.shape || "rect",
      description: item.description,
      price: item.price,
      seatCount: item.seatCount,
    }));
  }, [rawItems]);

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((i) => map.set(i.category, (map.get(i.category) || 0) + 1));
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [items]);

  const filtered = useMemo(() => {
    let result = items;
    if (catalogTab !== "all") result = result.filter((i) => i.category === catalogTab);
    if (catalogSearch) {
      const q = catalogSearch.toLowerCase();
      result = result.filter((i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q) || (i.description || "").toLowerCase().includes(q));
    }
    return result;
  }, [items, catalogTab, catalogSearch]);

  const placeOnCanvas = useCallback((item: CatalogProduct) => {
    if (!editor) return;
    const center = editor.getViewportScreenCenter();
    const point = editor.screenToPage(center);
    const w = item.widthCm * PX_PER_CM;
    const h = item.depthCm * PX_PER_CM;
    const catColor = SHAPE_COLORS[item.category] || "light-blue";

    editor.createShape({
      id: createShapeId(),
      type: "geo",
      x: point.x - w / 2,
      y: point.y - h / 2,
      props: {
        w, h,
        geo: (item.shape === "circle" || item.shape === "round") ? "ellipse" : "rectangle",
        color: catColor,
        text: item.name,
        size: "s",
        font: "sans",
        fill: "semi",
      },
    } as any);

    usePlannerStore.getState().setDirty(true);
    usePlannerStore.getState().setInspectorOpen(true);
  }, [editor]);

  if (!showCatalog) return null;

  const totalCount = items.length;

  return (
    <div className="absolute top-12 left-0 bottom-8 z-20 w-[300px] border-r bg-white flex flex-col shadow-lg">
      <div className="px-3 pt-3 pb-2 border-b space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-navy flex items-center gap-1.5">
            <Package className="h-4 w-4" />
            Furniture Catalog
          </h3>
          <span className="text-[10px] font-semibold text-navy-text/40 bg-navy/5 px-2 py-0.5 rounded-full">
            {totalCount} items
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-navy-text/30" />
          <input
            type="text"
            placeholder="Search furniture..."
            value={catalogSearch}
            onChange={(e) => setCatalogSearch(e.target.value)}
            className="w-full h-8 pl-8 pr-8 text-xs rounded-lg border bg-brand-surface outline-none focus:border-navy focus:bg-white transition-all"
          />
          {catalogSearch && (
            <button onClick={() => setCatalogSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X className="h-3 w-3 text-navy-text/30 hover:text-navy-text/60" />
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-1 px-2 py-1.5 overflow-x-auto border-b scrollbar-none">
        <button
          onClick={() => setCatalogTab("all")}
          className={cn(
            "px-2 py-1 rounded-md text-[10px] font-semibold whitespace-nowrap transition-all flex items-center gap-1",
            catalogTab === "all" ? "bg-navy text-white" : "bg-navy/5 text-navy-text/60 hover:bg-navy/10"
          )}
        >
          <LayoutGrid className="h-3 w-3" /> All
        </button>
        {categories.map(([cat, count]) => {
          const meta = CATEGORY_META[cat] || { icon: Package, color: "#1F3653", label: cat };
          const CatIcon = meta.icon;
          return (
            <button
              key={cat}
              onClick={() => setCatalogTab(catalogTab === cat ? "all" : cat)}
              className={cn(
                "px-2 py-1 rounded-md text-[10px] font-semibold whitespace-nowrap transition-all flex items-center gap-1",
                catalogTab === cat ? "text-white" : "text-navy-text/60 hover:bg-navy/10",
              )}
              style={catalogTab === cat ? { background: meta.color } : { background: `${meta.color}08` }}
            >
              <CatIcon className="h-3 w-3" /> {meta.label} <span className="opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 border-2 border-navy/20 border-t-navy rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-8 w-8 mx-auto text-navy-text/15 mb-2" />
            <p className="text-xs text-navy-text/40">No items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => placeOnCanvas(item)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={cn(
                  "relative flex flex-col items-center p-2 rounded-xl border transition-all text-center group",
                  hoveredItem === item.id
                    ? "border-navy/30 bg-navy/5 shadow-sm -translate-y-0.5"
                    : "border-transparent hover:border-navy/15 hover:bg-brand-surface"
                )}
              >
                <FurnitureTopView item={item} size={56} />
                <span className="mt-1.5 text-[11px] font-medium text-navy-text leading-tight line-clamp-2 w-full">
                  {item.name}
                </span>
                <span className="text-[9px] text-navy-text/40 mt-0.5">
                  {item.widthCm}×{item.depthCm} cm
                </span>
                {hoveredItem === item.id && (
                  <div className="absolute -top-1 -right-1 bg-navy text-white rounded-full p-0.5 shadow-md">
                    <Plus className="h-3 w-3" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

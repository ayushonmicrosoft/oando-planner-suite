"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Search, X, Plus, Package, Armchair, Table2, MonitorSmartphone, Archive, LayoutGrid, Crown, Star, Zap, ChevronDown, ChevronRight } from "lucide-react";
import { usePlannerStore, type CatalogProduct } from "./planner-store";
import { useListCatalogItems, useListSeries } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { createShapeId } from "tldraw";

const CATEGORY_META: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  workstations: { icon: MonitorSmartphone, color: "#1F3653", label: "Workstations" },
  seating: { icon: Armchair, color: "#2d6a4f", label: "Seating" },
  "soft-seating": { icon: Armchair, color: "#7b2cbf", label: "Soft Seating" },
  tables: { icon: Table2, color: "#e85d04", label: "Tables" },
  storage: { icon: Archive, color: "#588157", label: "Storage" },
};

const TIER_META: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  economy: { icon: Zap, color: "#10b981", label: "Economy" },
  medium: { icon: Star, color: "#3b82f6", label: "Medium" },
  premium: { icon: Crown, color: "#f59e0b", label: "Premium" },
};

const PX_PER_CM = 2;

const SHAPE_COLORS: Record<string, string> = {
  workstations: "light-blue",
  seating: "light-green",
  "soft-seating": "violet",
  tables: "orange",
  storage: "yellow",
};

function ProductThumb({ item, size = 48 }: { item: CatalogProduct; size?: number }) {
  const [imgError, setImgError] = useState(false);
  const catMeta = CATEGORY_META[item.category];
  const fill = catMeta?.color || "#1F3653";

  if (item.imageUrl && !imgError) {
    return (
      <div
        className="shrink-0 rounded-lg overflow-hidden bg-muted/30"
        style={{ width: size, height: size }}
      >
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  const w = item.widthCm;
  const d = item.depthCm;
  const maxDim = Math.max(w, d);
  const scale = (size - 8) / maxDim;
  const rw = w * scale;
  const rd = d * scale;
  const isRound = item.shape === "circle" || item.shape === "round";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <rect width={size} height={size} rx={6} fill={`${fill}08`} />
      {isRound ? (
        <ellipse cx={size / 2} cy={size / 2} rx={rw / 2} ry={rd / 2} fill={`${fill}20`} stroke={fill} strokeWidth={1.5} />
      ) : item.shape === "l-left" || item.shape === "l-right" ? (
        <path
          d={item.shape === "l-left"
            ? `M${(size - rw) / 2},${(size - rd) / 2} h${rw} v${rd * 0.6} h${-rw * 0.5} v${rd * 0.4} h${-rw * 0.5} z`
            : `M${(size - rw) / 2},${(size - rd) / 2} h${rw * 0.5} v${rd * 0.4} h${rw * 0.5} v${rd * 0.6} h${-rw} z`
          }
          fill={`${fill}20`} stroke={fill} strokeWidth={1.5}
        />
      ) : (
        <rect x={(size - rw) / 2} y={(size - rd) / 2} width={rw} height={rd} rx={2} fill={`${fill}20`} stroke={fill} strokeWidth={1.5} />
      )}
    </svg>
  );
}

export function StudioCatalog() {
  const { showCatalog, editor, catalogSearch, setCatalogSearch } = usePlannerStore();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [expandedTier, setExpandedTier] = useState<string | null>(null);
  const [showStandalone, setShowStandalone] = useState(false);
  const [autoExpanded, setAutoExpanded] = useState(false);

  const { data: rawItems, isLoading: itemsLoading } = useListCatalogItems();
  const { data: seriesData, isLoading: seriesLoading } = useListSeries();

  const isLoading = itemsLoading || seriesLoading;

  useEffect(() => {
    if (!autoExpanded && seriesData && seriesData.length > 0 && !expandedTier) {
      setExpandedTier(seriesData[0].id);
      setAutoExpanded(true);
    }
  }, [seriesData, autoExpanded, expandedTier]);

  const items: CatalogProduct[] = useMemo(() => {
    return (rawItems || []).map((item: any) => ({
      id: String(item.id),
      name: item.name,
      category: item.category,
      subCategory: item.subCategory || null,
      widthCm: item.widthCm || 60,
      depthCm: item.depthCm || 60,
      heightCm: item.heightCm || 75,
      color: item.color || "#94a3b8",
      shape: item.shape || "rect",
      description: item.description,
      imageUrl: item.imageUrl,
      price: item.price,
      seatCount: item.seatCount,
      seriesId: item.seriesId,
    }));
  }, [rawItems]);

  const standaloneItems = useMemo(() => {
    return items.filter(i => !i.seriesId);
  }, [items]);

  const filtered = useMemo(() => {
    if (!catalogSearch) return null;
    const q = catalogSearch.toLowerCase();
    return items.filter((i) =>
      i.name.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q) ||
      (i.subCategory || "").toLowerCase().includes(q) ||
      (i.description || "").toLowerCase().includes(q)
    );
  }, [items, catalogSearch]);

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

  const renderItem = (item: CatalogProduct) => (
    <button
      key={item.id}
      onClick={() => placeOnCanvas(item)}
      onMouseEnter={() => setHoveredItem(item.id)}
      onMouseLeave={() => setHoveredItem(null)}
      className={cn(
        "relative flex items-center gap-2.5 p-2 rounded-xl border transition-all text-left group w-full",
        hoveredItem === item.id
          ? "border-navy/30 bg-navy/5 shadow-sm"
          : "border-transparent hover:border-navy/15 hover:bg-brand-surface"
      )}
    >
      <ProductThumb item={item} size={40} />
      <div className="flex-1 min-w-0">
        <span className="text-[11px] font-medium text-navy-text leading-tight line-clamp-1 block">{item.name}</span>
        <span className="text-[9px] text-navy-text/40">{item.widthCm}×{item.depthCm} cm</span>
      </div>
      {hoveredItem === item.id && (
        <div className="bg-navy text-white rounded-full p-0.5 shadow-md shrink-0">
          <Plus className="h-3 w-3" />
        </div>
      )}
    </button>
  );

  return (
    <div className="absolute top-12 left-[120px] bottom-8 z-20 w-[300px] border-r bg-white/95 backdrop-blur-md flex flex-col shadow-lg">
      <div className="px-3 pt-3 pb-2 border-b space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-navy flex items-center gap-1.5">
            <Package className="h-4 w-4" />
            AFC Furniture Catalog
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

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 border-2 border-navy/20 border-t-navy rounded-full animate-spin" />
          </div>
        ) : filtered ? (
          filtered.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-8 w-8 mx-auto text-navy-text/15 mb-2" />
              <p className="text-xs text-navy-text/40">No items found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map(renderItem)}
            </div>
          )
        ) : (
          <div className="space-y-1">
            {seriesData?.map((series) => {
              const tierMeta = TIER_META[series.tier];
              if (!tierMeta) return null;
              const TierIcon = tierMeta.icon;
              const isExpanded = expandedTier === series.id;

              return (
                <div key={series.id}>
                  <button
                    onClick={() => setExpandedTier(isExpanded ? null : series.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all",
                      isExpanded ? "bg-navy/5" : "hover:bg-navy/3"
                    )}
                  >
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${tierMeta.color}15` }}
                    >
                      <TierIcon className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-semibold text-navy-text flex-1">{tierMeta.label}</span>
                    <span className="text-[9px] text-navy-text/40">{series.items?.length || 0}</span>
                    {isExpanded ? <ChevronDown className="w-3 h-3 text-navy-text/30" /> : <ChevronRight className="w-3 h-3 text-navy-text/30" />}
                  </button>
                  {isExpanded && (
                    <div className="pl-2 pb-1 space-y-0.5">
                      {(series.items || []).map((sItem: any) => {
                        const catalogItem = items.find(i => i.id === sItem.id);
                        if (!catalogItem) return null;
                        return renderItem(catalogItem);
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="border-t my-2" />

            <button
              onClick={() => setShowStandalone(!showStandalone)}
              className={cn(
                "w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all",
                showStandalone ? "bg-navy/5" : "hover:bg-navy/3"
              )}
            >
              <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 bg-slate-100">
                <LayoutGrid className="w-3 h-3 text-slate-500" />
              </div>
              <span className="text-xs font-semibold text-navy-text flex-1">Standalone</span>
              <span className="text-[9px] text-navy-text/40">{standaloneItems.length}</span>
              {showStandalone ? <ChevronDown className="w-3 h-3 text-navy-text/30" /> : <ChevronRight className="w-3 h-3 text-navy-text/30" />}
            </button>
            {showStandalone && (
              <div className="pl-2 pb-1 space-y-0.5">
                {standaloneItems.map(renderItem)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { useMemo, useRef, useEffect } from 'react';
import { X, ClipboardList, ChevronRight } from 'lucide-react';
import { getCategoryIcon } from '@/lib/furniture-shapes';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { PlacedItem } from '@/hooks/use-canvas-planner';

interface BOQGroup {
  key: string;
  name: string;
  category: string;
  widthCm: number;
  depthCm: number;
  heightCm: number;
  count: number;
  instanceIds: string[];
}

interface BillOfQuantitiesPanelProps {
  open: boolean;
  onClose: () => void;
  items: PlacedItem[];
  selectedItemIds: Set<string>;
  onSelectItems: (ids: string[]) => void;
  onZoomToItem: (item: PlacedItem) => void;
  roomWidthCm: number;
  roomDepthCm: number;
}

export function BillOfQuantitiesPanel({
  open, onClose,
  items, selectedItemIds,
  onSelectItems, onZoomToItem,
  roomWidthCm, roomDepthCm,
}: BillOfQuantitiesPanelProps) {
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const groups = useMemo(() => {
    const map = new Map<string, BOQGroup>();
    for (const item of items) {
      const cat = item.category || 'Other';
      const nm = item.name || 'Unnamed item';
      const key = `${item.catalogId}-${item.widthCm}-${item.depthCm}-${item.heightCm}`;
      const existing = map.get(key);
      if (existing) {
        existing.count++;
        existing.instanceIds.push(item.instanceId);
      } else {
        map.set(key, {
          key,
          name: nm,
          category: cat,
          widthCm: item.widthCm,
          depthCm: item.depthCm,
          heightCm: item.heightCm,
          count: 1,
          instanceIds: [item.instanceId],
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => {
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return a.name.localeCompare(b.name);
    });
  }, [items]);

  const categoryGroups = useMemo(() => {
    const map = new Map<string, BOQGroup[]>();
    for (const g of groups) {
      const cat = g.category || 'Other';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(g);
    }
    return Array.from(map.entries());
  }, [groups]);

  const totalItems = items.length;
  const usedAreaCm2 = items.reduce((sum, item) => sum + item.widthCm * item.depthCm, 0);
  const totalAreaCm2 = roomWidthCm * roomDepthCm;
  const usedPct = totalAreaCm2 > 0 ? Math.round((usedAreaCm2 / totalAreaCm2) * 100) : 0;

  const highlightedGroupKey = useMemo(() => {
    if (selectedItemIds.size === 0) return null;
    for (const g of groups) {
      if (g.instanceIds.some(id => selectedItemIds.has(id))) return g.key;
    }
    return null;
  }, [selectedItemIds, groups]);

  useEffect(() => {
    if (highlightedGroupKey && rowRefs.current[highlightedGroupKey]) {
      rowRefs.current[highlightedGroupKey]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [highlightedGroupKey]);

  const handleRowClick = (group: BOQGroup) => {
    onSelectItems(group.instanceIds);
    const firstItem = items.find(i => i.instanceId === group.instanceIds[0]);
    if (firstItem) onZoomToItem(firstItem);
  };

  if (!open) return null;

  return (
    <div className="absolute top-0 right-0 w-80 h-full z-10 bg-card border-l shadow-lg flex flex-col">
      <div className="p-3 border-b flex justify-between items-center">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-primary" />
          Bill of Quantities
        </h4>
        <button aria-label="Close BOQ panel" onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-3 py-2 border-b bg-muted/30">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Total items</span>
          <span className="font-semibold">{totalItems}</span>
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-muted-foreground">Unique types</span>
          <span className="font-semibold">{groups.length}</span>
        </div>
        <div className="mt-2">
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, usedPct)}%`,
                backgroundColor: usedPct > 80 ? '#ef4444' : usedPct > 50 ? '#f59e0b' : '#22c55e',
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>{(usedAreaCm2 / 10000).toFixed(1)} m² used ({usedPct}%)</span>
            <span>{(Math.max(0, totalAreaCm2 - usedAreaCm2) / 10000).toFixed(1)} m² free</span>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {categoryGroups.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-8">
            <ClipboardList className="w-8 h-8 mx-auto mb-3 opacity-20" />
            <p>No items placed yet.<br />Add furniture from the catalog.</p>
          </div>
        ) : (
          <div className="py-1">
            {categoryGroups.map(([category, catGroups]) => (
              <div key={category}>
                <div className="px-3 py-1.5 bg-muted/40 border-y border-border/30">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <span>{getCategoryIcon(category)}</span>
                    {category}
                    <span className="ml-auto font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded">
                      {catGroups.reduce((s, g) => s + g.count, 0)}
                    </span>
                  </span>
                </div>
                {catGroups.map((group) => {
                  const isHighlighted = group.key === highlightedGroupKey;
                  return (
                    <div
                      key={group.key}
                      ref={(el) => { rowRefs.current[group.key] = el; }}
                      className={`px-3 py-2 flex items-center gap-2 cursor-pointer transition-colors border-b border-border/20 ${
                        isHighlighted
                          ? 'bg-primary/10 border-l-2 border-l-primary'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleRowClick(group)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleRowClick(group); }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{group.name}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {group.widthCm} × {group.depthCm} × {group.heightCm} cm
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-semibold bg-muted px-2 py-0.5 rounded-full">
                          ×{group.count}
                        </span>
                        <ChevronRight className="w-3 h-3 text-muted-foreground" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

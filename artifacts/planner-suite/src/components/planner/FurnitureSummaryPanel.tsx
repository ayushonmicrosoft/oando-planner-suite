import { X, BarChart3 } from 'lucide-react';
import { getCategoryIcon } from '@/lib/furniture-shapes';

interface FurnitureSummaryPanelProps {
  open: boolean;
  onClose: () => void;
  categorySummary: [string, number][];
  totalItems: number;
  usedAreaCm2: number;
  freeAreaCm2: number;
  usedPct: number;
}

export function FurnitureSummaryPanel({
  open, onClose,
  categorySummary, totalItems,
  usedAreaCm2, freeAreaCm2, usedPct,
}: FurnitureSummaryPanelProps) {
  if (!open) return null;

  return (
    <div className="absolute top-3 right-3 z-10 w-64 bg-card border rounded-lg shadow-lg">
      <div className="p-3 border-b flex justify-between items-center">
        <h4 className="font-semibold text-xs flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5 text-primary" />
          Furniture Summary
        </h4>
        <button aria-label="Close furniture summary" onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="p-3 space-y-2">
        {categorySummary.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-2">No items placed</p>
        ) : (
          <>
            {categorySummary.map(([cat, count]) => (
              <div key={cat} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <span>{getCategoryIcon(cat)}</span>
                  <span className="font-medium">{cat}</span>
                </span>
                <span className="text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">{count}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2 flex justify-between text-xs font-semibold">
              <span>Total Items</span>
              <span>{totalItems}</span>
            </div>
          </>
        )}
      </div>
      <div className="p-3 border-t space-y-1.5">
        <h5 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Area Usage</h5>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(100, usedPct)}%`,
              backgroundColor: usedPct > 80 ? '#ef4444' : usedPct > 50 ? '#f59e0b' : '#22c55e',
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Used: {(usedAreaCm2 / 10000).toFixed(1)} m² ({usedPct}%)</span>
          <span>Free: {(freeAreaCm2 / 10000).toFixed(1)} m²</span>
        </div>
      </div>
    </div>
  );
}

import type { CatalogItem } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus, X, AlertCircle, RefreshCw } from 'lucide-react';

interface CatalogPanelProps {
  open: boolean;
  onClose: () => void;
  catalogSearch: string;
  setCatalogSearch: (v: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (v: string | null) => void;
  categories: string[];
  filteredCatalog: CatalogItem[] | undefined;
  catalogError: boolean;
  refetchCatalog: () => void;
  onAddItem: (item: CatalogItem) => void;
}

export function CatalogPanel({
  open, onClose,
  catalogSearch, setCatalogSearch,
  selectedCategory, setSelectedCategory,
  categories, filteredCatalog,
  catalogError, refetchCatalog,
  onAddItem,
}: CatalogPanelProps) {
  if (!open) return null;

  return (
    <div className="absolute top-3 left-3 z-10 w-64 bg-card border rounded-lg shadow-lg flex flex-col max-h-[calc(100%-24px)]">
      <div className="p-3 pb-2 space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[10px] uppercase tracking-[0.08em] text-muted-foreground/70">Catalog</h3>
          <button aria-label="Close catalog" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            className="h-8 text-sm pl-8"
            value={catalogSearch}
            onChange={e => setCatalogSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1">
          <button
            className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${!selectedCategory ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
              onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      <ScrollArea className="flex-1 px-3 pb-3">
        <div className="space-y-1">
          {filteredCatalog?.map(item => (
            <Card
              key={item.id}
              className="p-2 flex items-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-accent/50 transition-colors"
              onClick={() => onAddItem(item)}
            >
              <div
                className="w-7 h-7 rounded flex-shrink-0"
                style={{
                  backgroundColor: item.color || '#6b7280',
                  borderRadius: item.shape === 'round' || item.shape === 'circle' ? '50%' : '4px',
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">{item.name}</div>
                <div className="text-[10px] text-muted-foreground">{item.widthCm}×{item.depthCm}cm</div>
              </div>
              <Plus className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            </Card>
          ))}
          {catalogError && (
            <div className="text-xs text-center py-4 space-y-2">
              <AlertCircle className="w-5 h-5 text-destructive mx-auto opacity-60" />
              <p className="text-muted-foreground">Failed to load catalog</p>
              <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1" onClick={() => refetchCatalog()}>
                <RefreshCw className="w-3 h-3" /> Retry
              </Button>
            </div>
          )}
          {!catalogError && filteredCatalog?.length === 0 && (
            <div className="text-xs text-muted-foreground text-center py-6">No items found</div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

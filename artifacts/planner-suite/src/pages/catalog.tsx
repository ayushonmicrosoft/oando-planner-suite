import { useState, useMemo, useEffect } from 'react';
import { useListCatalogItems, useListCategories, useGetCatalogItem, getGetCatalogItemQueryKey } from '@workspace/api-client-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, Maximize, CircleDashed, Square, DollarSign, Users, AlertCircle, RefreshCw, PackageOpen, LayoutGrid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { CatalogGridSkeleton, CategoryListSkeleton } from '@/components/skeletons';

const ITEMS_PER_PAGE = 12;

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'area-desc';

const SORT_LABELS: Record<SortOption, string> = {
  'name-asc': 'Name A–Z',
  'name-desc': 'Name Z–A',
  'price-asc': 'Price Low–High',
  'price-desc': 'Price High–Low',
  'area-desc': 'Area Large–Small',
};

function getViewMode(): 'grid' | 'list' {
  try {
    const stored = localStorage.getItem('catalog-view-mode');
    if (stored === 'list') return 'list';
  } catch {}
  return 'grid';
}

function setViewModeStorage(mode: 'grid' | 'list') {
  try { localStorage.setItem('catalog-view-mode', mode); } catch {}
}

function ShapeIndicator({ shape, size = 16 }: { shape?: string; size?: number }) {
  if (shape === 'round' || shape === 'circle') {
    return <div className="rounded-full border-2 border-muted-foreground/40" style={{ width: size, height: size }} />;
  }
  if (shape === 'l-left' || shape === 'l-right') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" className="text-muted-foreground/40">
        <path d={shape === 'l-left' ? 'M2 2h12v8H8v4H2z' : 'M2 2h12v8H14v4H8V10H2z'} fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }
  return <div className="rounded-sm border-2 border-muted-foreground/40" style={{ width: size, height: size }} />;
}

function ItemDetailsDialog({ itemId, open, onOpenChange }: { itemId: string | null, open: boolean, onOpenChange: (o: boolean) => void }) {
  const { data: item, isLoading } = useGetCatalogItem(itemId || '', { query: { queryKey: getGetCatalogItemQueryKey(itemId || ''), enabled: !!itemId && open } });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Item Details</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : item ? (
          <div className="space-y-4">
            <div className="aspect-video bg-muted rounded-md flex items-center justify-center relative overflow-hidden">
              {item.shape === 'round' ? (
                <CircleDashed className="w-32 h-32 text-muted-foreground/30" />
              ) : (
                <Square className="w-32 h-32 text-muted-foreground/30" />
              )}
              {item.color && (
                <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full border-2 border-white shadow-md" style={{ backgroundColor: item.color }} title={item.color} />
              )}
            </div>
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold">{item.name}</h3>
                <Badge variant="secondary">{item.category}</Badge>
              </div>
              <p className="text-muted-foreground text-sm">{item.description || 'No description available for this item.'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 p-3 rounded-lg space-y-1">
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Dimensions</div>
                <div className="font-mono text-sm">{item.widthCm}W × {item.depthCm}D × {item.heightCm}H cm</div>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg space-y-1">
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Pricing</div>
                <div className="font-mono text-sm flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-muted-foreground" /> {item.price ? item.price.toFixed(2) : 'N/A'}
                </div>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg space-y-1">
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Capacity</div>
                <div className="font-mono text-sm flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-muted-foreground" /> {item.seatCount ? `${item.seatCount} persons` : 'N/A'}
                </div>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg space-y-1">
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Shape</div>
                <div className="flex items-center gap-2">
                  <ShapeIndicator shape={item.shape ?? undefined} />
                  <span className="font-mono text-sm capitalize">{item.shape || 'Standard'}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-8 text-muted-foreground">Item not found.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function Catalog() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(getViewMode);
  const [page, setPage] = useState(1);

  const { data: categories, isLoading: categoriesLoading, isError: categoriesError, refetch: refetchCategories } = useListCategories();
  const { data: items, isLoading: itemsLoading, isError: itemsError, refetch: refetchItems } = useListCatalogItems({
    search: search || undefined,
    category: selectedCategory ?? undefined,
  });

  const hasError = categoriesError || itemsError;

  useEffect(() => { setPage(1); }, [search, selectedCategory, sortBy]);

  const maxArea = useMemo(() => {
    if (!items) return 1;
    return Math.max(...items.map(i => i.widthCm * i.depthCm), 1);
  }, [items]);

  const sortedItems = useMemo(() => {
    if (!items) return [];
    const sorted = [...items];
    switch (sortBy) {
      case 'name-asc': sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name-desc': sorted.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'price-asc': sorted.sort((a, b) => (a.price ?? 0) - (b.price ?? 0)); break;
      case 'price-desc': sorted.sort((a, b) => (b.price ?? 0) - (a.price ?? 0)); break;
      case 'area-desc': sorted.sort((a, b) => (b.widthCm * b.depthCm) - (a.widthCm * a.depthCm)); break;
    }
    return sorted;
  }, [items, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / ITEMS_PER_PAGE));
  const paginatedItems = sortedItems.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    setViewModeStorage(mode);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Furniture Catalog</h1>
          <p className="text-muted-foreground mt-2">Browse items available for planning.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-48 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SORT_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-9 w-9 rounded-r-none"
              onClick={() => handleViewModeChange('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-9 w-9 rounded-l-none"
              onClick={() => handleViewModeChange('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {hasError && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <span className="text-sm font-medium">Failed to load catalog data.</span>
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => { refetchCategories(); refetchItems(); }}>
              <RefreshCw className="w-4 h-4" /> Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-6">
        <div className="w-64 shrink-0 space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Search</h3>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search furniture..."
                className="pl-10 h-11 text-base"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-search-catalog"
              />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex justify-between">
              Categories
              {selectedCategory && (
                <button
                  className="text-xs text-primary hover:underline lowercase normal-case"
                  onClick={() => setSelectedCategory(undefined)}
                >
                  Clear
                </button>
              )}
            </h3>
            {categoriesLoading ? (
              <CategoryListSkeleton />
            ) : (
              <div className="space-y-1">
                <button
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${!selectedCategory ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted'}`}
                  onClick={() => setSelectedCategory(undefined)}
                  data-testid="category-filter-all"
                >
                  All Categories
                </button>
                {categories?.map((cat) => (
                  <button
                    key={cat.name}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex justify-between items-center ${selectedCategory === cat.name ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted'}`}
                    onClick={() => setSelectedCategory(cat.name)}
                    data-testid={`category-filter-${cat.name}`}
                  >
                    <span>{cat.name}</span>
                    <Badge variant={selectedCategory === cat.name ? "secondary" : "outline"} className="text-[10px] px-1.5 min-w-[20px] justify-center">
                      {cat.count}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-4">
          {itemsLoading ? (
            <CatalogGridSkeleton />
          ) : itemsError ? (
            <Card className="bg-destructive/5 border-destructive/20">
              <CardContent className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-destructive opacity-60" />
                <p className="text-lg font-medium">Failed to load catalog</p>
                <p className="text-sm text-muted-foreground">We couldn't fetch the catalog items. Please try again.</p>
                <Button variant="outline" onClick={() => refetchItems()} className="gap-2">
                  <RefreshCw className="w-4 h-4" /> Retry
                </Button>
              </CardContent>
            </Card>
          ) : sortedItems.length === 0 ? (
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
                <PackageOpen className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-lg font-medium">No items found</p>
                <p className="text-sm mt-1">
                  {search || selectedCategory
                    ? "Try adjusting your search or category filter."
                    : "The catalog is empty. Items will appear here once added."}
                </p>
                {(search || selectedCategory) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => { setSearch(''); setSelectedCategory(undefined); }}
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedItems.map((item) => {
                const itemArea = item.widthCm * item.depthCm;
                const areaPercent = (itemArea / maxArea) * 100;
                return (
                  <Card
                    key={item.id}
                    className="overflow-hidden flex flex-col hover:shadow-md transition-shadow cursor-pointer border-transparent hover:border-primary/50"
                    onClick={() => setSelectedItemId(item.id)}
                    data-testid={`item-card-${item.id}`}
                  >
                    <div className="aspect-square bg-muted/30 flex items-center justify-center p-6 border-b relative">
                      <Badge variant="outline" className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm shadow-sm">
                        {item.category}
                      </Badge>
                      <div className="absolute top-2 left-2">
                        <ShapeIndicator shape={item.shape ?? undefined} size={20} />
                      </div>
                      {item.shape === 'round' ? (
                        <CircleDashed className="w-full h-full text-muted-foreground/30" />
                      ) : (
                        <Square className="w-full h-full text-muted-foreground/30" />
                      )}
                      {item.color && (
                        <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-white shadow-md" style={{ backgroundColor: item.color }} title={`Color: ${item.color}`} />
                      )}
                    </div>
                    <CardHeader className="p-4 pb-0">
                      <div className="flex items-center gap-2">
                        {item.color && (
                          <div className="w-3 h-3 rounded-full border flex-shrink-0" style={{ backgroundColor: item.color }} />
                        )}
                        <CardTitle className="text-base line-clamp-1" title={item.name}>{item.name}</CardTitle>
                      </div>
                      <CardDescription className="line-clamp-2 text-xs min-h-[32px]">
                        {item.description || 'No description available.'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-2 mt-auto space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono bg-muted/50 p-2 rounded-md">
                        <Maximize className="w-3 h-3" />
                        {item.widthCm}W × {item.depthCm}D × {item.heightCm}H
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>Floor area</span>
                          <span>{(itemArea / 10000).toFixed(2)} m²</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary/60"
                            style={{ width: `${areaPercent}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Dimensions</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Shape</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground w-24">Size</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((item) => {
                    const itemArea = item.widthCm * item.depthCm;
                    const areaPercent = (itemArea / maxArea) * 100;
                    return (
                      <tr
                        key={item.id}
                        className="border-t hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => setSelectedItemId(item.id)}
                        data-testid={`item-row-${item.id}`}
                      >
                        <td className="px-4 py-3 font-medium">{item.name}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-xs">{item.category}</Badge>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">{item.widthCm}×{item.depthCm}×{item.heightCm}</td>
                        <td className="px-4 py-3 font-mono text-xs">{item.price ? `$${item.price.toFixed(0)}` : '—'}</td>
                        <td className="px-4 py-3 capitalize text-xs">{item.shape || 'rect'}</td>
                        <td className="px-4 py-3">
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden w-20">
                            <div className="h-full rounded-full bg-primary/60" style={{ width: `${areaPercent}%` }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {sortedItems.length > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-center gap-4 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <ItemDetailsDialog
        itemId={selectedItemId}
        open={!!selectedItemId}
        onOpenChange={(open) => !open && setSelectedItemId(null)}
      />
    </div>
  );
}

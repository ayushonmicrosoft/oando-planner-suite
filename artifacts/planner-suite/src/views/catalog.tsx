"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useListCatalogItems, useListCategories } from '@workspace/api-client-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, Maximize, AlertCircle, RefreshCw, PackageOpen, LayoutGrid, List, ChevronLeft, ChevronRight, Armchair, Monitor, Lamp, BookOpen, Archive, Table2, LayoutDashboard } from 'lucide-react';
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

const CATEGORY_ICONS: Record<string, typeof Armchair> = {
  seating: Armchair,
  'soft-seating': Armchair,
  workstations: Monitor,
  tables: Table2,
  storage: Archive,
  accessories: Lamp,
  education: BookOpen,
};

const CATEGORY_COLORS: Record<string, { bg: string; icon: string; accent: string }> = {
  seating: { bg: 'bg-blue-500/[0.08]', icon: 'text-blue-400', accent: 'border-blue-500/20' },
  'soft-seating': { bg: 'bg-violet-500/[0.08]', icon: 'text-violet-400', accent: 'border-violet-500/20' },
  workstations: { bg: 'bg-cyan-500/[0.08]', icon: 'text-cyan-400', accent: 'border-cyan-500/20' },
  tables: { bg: 'bg-amber-500/[0.08]', icon: 'text-amber-400', accent: 'border-amber-500/20' },
  storage: { bg: 'bg-emerald-500/[0.08]', icon: 'text-emerald-400', accent: 'border-emerald-500/20' },
  accessories: { bg: 'bg-rose-500/[0.08]', icon: 'text-rose-400', accent: 'border-rose-500/20' },
  education: { bg: 'bg-indigo-500/[0.08]', icon: 'text-indigo-400', accent: 'border-indigo-500/20' },
};

function getColorForCategory(cat: string) {
  return CATEGORY_COLORS[cat] || { bg: 'bg-slate-500/[0.08]', icon: 'text-slate-400', accent: 'border-slate-500/20' };
}

function FurnitureVisual({ category, name, color, widthCm, depthCm }: { category: string; name: string; color?: string | null; widthCm: number; depthCm: number }) {
  const Icon = CATEGORY_ICONS[category] || LayoutDashboard;
  const catColor = getColorForCategory(category);
  const ratio = Math.min(widthCm, depthCm) / Math.max(widthCm, depthCm);
  const w = 60;
  const h = Math.max(30, w * ratio);

  return (
    <div className={`aspect-[4/3] ${catColor.bg} flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500`}>
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 0.5px, transparent 0)`, backgroundSize: "16px 16px" }} />
      <div className="relative flex flex-col items-center gap-3">
        <div className="relative">
          <svg width={w + 20} height={h + 20} viewBox={`0 0 ${w + 20} ${h + 20}`} className="drop-shadow-lg">
            <rect
              x={10} y={10} width={w} height={h} rx={4}
              fill={color || "currentColor"}
              className={color ? "" : catColor.icon}
              opacity={color ? 0.7 : 0.15}
              stroke={color || "currentColor"}
              strokeWidth={1.5}
              strokeOpacity={color ? 0.3 : 0.2}
            />
          </svg>
        </div>
        <Icon className={`w-5 h-5 ${catColor.icon} opacity-60`} strokeWidth={1.5} />
      </div>
      {color && (
        <div className="absolute bottom-3 right-3 w-4 h-4 rounded-full border-2 border-white/20 shadow-sm" style={{ backgroundColor: color }} />
      )}
    </div>
  );
}

export default function Catalog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get('category') || undefined;
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(categoryFromUrl);
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
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground/60 mb-1">Browse</p>
          <h1 className="text-2xl font-semibold tracking-[-0.02em]">Furniture Catalog</h1>
          <p className="text-muted-foreground text-sm mt-1">{sortedItems.length} items available for planning</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-44 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SORT_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-9 w-9 rounded-none"
              onClick={() => handleViewModeChange('grid')}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-9 w-9 rounded-none"
              onClick={() => handleViewModeChange('list')}
            >
              <List className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {hasError && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm">Failed to load catalog data.</span>
            </div>
            <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={() => { refetchCategories(); refetchItems(); }}>
              <RefreshCw className="w-3 h-3" /> Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-6">
        <div className="w-56 shrink-0 space-y-5">
          <div className="space-y-2">
            <h3 className="font-medium text-xs uppercase tracking-[0.1em] text-muted-foreground/60">Search</h3>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/40" />
              <Input
                placeholder="Search furniture..."
                className="pl-9 h-9 text-sm bg-muted/30 border-transparent focus:border-primary/30 focus:bg-background transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-search-catalog"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <h3 className="font-medium text-xs uppercase tracking-[0.1em] text-muted-foreground/60 flex justify-between items-center">
              Categories
              {selectedCategory && (
                <button
                  className="text-[10px] text-primary hover:underline normal-case tracking-normal"
                  onClick={() => setSelectedCategory(undefined)}
                >
                  Clear
                </button>
              )}
            </h3>
            {categoriesLoading ? (
              <CategoryListSkeleton />
            ) : (
              <div className="space-y-0.5">
                <button
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all ${!selectedCategory ? 'bg-primary text-primary-foreground font-medium shadow-sm' : 'hover:bg-muted/50 text-muted-foreground'}`}
                  onClick={() => setSelectedCategory(undefined)}
                  data-testid="category-filter-all"
                >
                  All Categories
                </button>
                {categories?.map((cat) => {
                  const catColor = getColorForCategory(cat.name);
                  const Icon = CATEGORY_ICONS[cat.name] || LayoutDashboard;
                  return (
                    <button
                      key={cat.name}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all flex items-center gap-2.5 ${selectedCategory === cat.name ? 'bg-primary text-primary-foreground font-medium shadow-sm' : 'hover:bg-muted/50 text-muted-foreground'}`}
                      onClick={() => setSelectedCategory(cat.name)}
                      data-testid={`category-filter-${cat.name}`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${selectedCategory === cat.name ? 'text-primary-foreground' : catColor.icon} shrink-0`} strokeWidth={1.8} />
                      <span className="flex-1 capitalize">{cat.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${selectedCategory === cat.name ? 'bg-primary-foreground/20' : 'bg-muted/80'}`}>
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-4">
          {itemsLoading ? (
            <CatalogGridSkeleton />
          ) : itemsError ? (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 rounded-xl border border-dashed border-destructive/20 bg-destructive/[0.02]">
              <AlertCircle className="w-10 h-10 text-destructive/40" />
              <p className="text-sm font-medium">Failed to load catalog</p>
              <Button variant="outline" size="sm" onClick={() => refetchItems()} className="gap-2 text-xs">
                <RefreshCw className="w-3 h-3" /> Retry
              </Button>
            </div>
          ) : sortedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground rounded-xl border border-dashed bg-muted/[0.02]">
              <PackageOpen className="w-10 h-10 mb-4 opacity-20" />
              <p className="text-sm font-medium">No items found</p>
              <p className="text-xs mt-1 text-muted-foreground/60">
                {search || selectedCategory
                  ? "Try adjusting your search or category filter."
                  : "The catalog is empty."}
              </p>
              {(search || selectedCategory) && (
                <Button variant="outline" size="sm" className="mt-4 text-xs" onClick={() => { setSearch(''); setSelectedCategory(undefined); }}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {paginatedItems.map((item) => {
                const itemArea = item.widthCm * item.depthCm;
                const catColor = getColorForCategory(item.category);
                return (
                  <Link key={item.id} href={`/catalog/${item.id}`} data-testid={`item-card-${item.id}`}>
                    <div className={`group rounded-xl border bg-card overflow-hidden hover:shadow-lg hover:shadow-black/5 transition-all duration-300 cursor-pointer hover:border-primary/20 h-full flex flex-col`}>
                      <FurnitureVisual
                        category={item.category}
                        name={item.name}
                        color={item.color}
                        widthCm={item.widthCm}
                        depthCm={item.depthCm}
                      />
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${catColor.accent} capitalize`}>
                            {item.category}
                          </Badge>
                        </div>
                        <h3 className="text-sm font-semibold line-clamp-1 mt-1" title={item.name}>{item.name}</h3>
                        <p className="text-xs text-muted-foreground/60 line-clamp-1 mt-0.5 flex-1">
                          {item.description || 'No description'}
                        </p>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                          <span className="text-[11px] text-muted-foreground/50 font-mono">
                            {item.widthCm}×{item.depthCm}×{item.heightCm}
                          </span>
                          <span className="text-[11px] text-muted-foreground/50">
                            {(itemArea / 10000).toFixed(2)} m²
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-xs text-muted-foreground/60 uppercase tracking-wider">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-xs text-muted-foreground/60 uppercase tracking-wider">Category</th>
                    <th className="text-left px-4 py-3 font-medium text-xs text-muted-foreground/60 uppercase tracking-wider">Dimensions</th>
                    <th className="text-left px-4 py-3 font-medium text-xs text-muted-foreground/60 uppercase tracking-wider">Price</th>
                    <th className="text-left px-4 py-3 font-medium text-xs text-muted-foreground/60 uppercase tracking-wider">Area</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((item) => {
                    const itemArea = item.widthCm * item.depthCm;
                    const catColor = getColorForCategory(item.category);
                    return (
                      <tr
                        key={item.id}
                        className="border-t border-border/50 hover:bg-muted/20 cursor-pointer transition-colors"
                        onClick={() => router.push(`/catalog/${item.id}`)}
                        data-testid={`item-row-${item.id}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {item.color && <div className="w-3 h-3 rounded-full border shrink-0" style={{ backgroundColor: item.color }} />}
                            <Link href={`/catalog/${item.id}`} className="font-medium hover:text-primary text-sm">
                              {item.name}
                            </Link>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`text-[10px] capitalize ${catColor.accent}`}>{item.category}</Badge>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground/60">{item.widthCm}×{item.depthCm}×{item.heightCm}</td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground/60">{item.price ? `₹${item.price.toLocaleString()}` : '—'}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground/60">{(itemArea / 10000).toFixed(2)} m²</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {sortedItems.length > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-center gap-4 pt-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="text-xs gap-1">
                <ChevronLeft className="w-3 h-3" /> Previous
              </Button>
              <span className="text-xs text-muted-foreground/60">
                Page {page} of {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="text-xs gap-1">
                Next <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

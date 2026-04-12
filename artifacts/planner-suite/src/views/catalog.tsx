"use client";

import { useState, useMemo, useEffect, useId } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useListCatalogItems, useListCategories } from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, AlertCircle, RefreshCw, PackageOpen, LayoutGrid, List, ChevronLeft, ChevronRight, Armchair, Monitor, Lamp, BookOpen, Archive, Table2, LayoutDashboard, SlidersHorizontal } from 'lucide-react';
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

const CATEGORY_COLORS: Record<string, { bg: string; icon: string; accent: string; gradient: string }> = {
  seating: { bg: 'bg-blue-500/[0.08]', icon: 'text-blue-500', accent: 'border-blue-500/20', gradient: 'from-blue-500/10 to-blue-400/5' },
  'soft-seating': { bg: 'bg-violet-500/[0.08]', icon: 'text-violet-500', accent: 'border-violet-500/20', gradient: 'from-violet-500/10 to-violet-400/5' },
  workstations: { bg: 'bg-cyan-500/[0.08]', icon: 'text-cyan-500', accent: 'border-cyan-500/20', gradient: 'from-cyan-500/10 to-cyan-400/5' },
  tables: { bg: 'bg-amber-500/[0.08]', icon: 'text-amber-500', accent: 'border-amber-500/20', gradient: 'from-amber-500/10 to-amber-400/5' },
  storage: { bg: 'bg-emerald-500/[0.08]', icon: 'text-emerald-500', accent: 'border-emerald-500/20', gradient: 'from-emerald-500/10 to-emerald-400/5' },
  accessories: { bg: 'bg-rose-500/[0.08]', icon: 'text-rose-500', accent: 'border-rose-500/20', gradient: 'from-rose-500/10 to-rose-400/5' },
  education: { bg: 'bg-indigo-500/[0.08]', icon: 'text-indigo-500', accent: 'border-indigo-500/20', gradient: 'from-indigo-500/10 to-indigo-400/5' },
};

export function getColorForCategory(cat: string) {
  return CATEGORY_COLORS[cat] || { bg: 'bg-slate-500/[0.08]', icon: 'text-slate-400', accent: 'border-slate-500/20', gradient: 'from-slate-500/10 to-slate-400/5' };
}

export function FurnitureVisual({ category, name, color, widthCm, depthCm, size = 'md' }: { category: string; name: string; color?: string | null; widthCm: number; depthCm: number; size?: 'sm' | 'md' | 'lg' }) {
  const Icon = CATEGORY_ICONS[category] || LayoutDashboard;
  const catColor = getColorForCategory(category);
  const ratio = Math.min(widthCm, depthCm) / Math.max(widthCm, depthCm);
  const gradId = useId();

  const sizeConfig = {
    sm: { w: 40, iconSize: 'w-4 h-4', aspect: 'aspect-[4/3]' },
    md: { w: 60, iconSize: 'w-5 h-5', aspect: 'aspect-[4/3]' },
    lg: { w: 100, iconSize: 'w-8 h-8', aspect: 'aspect-[16/10]' },
  };
  const cfg = sizeConfig[size];
  const w = cfg.w;
  const h = Math.max(w * 0.4, w * ratio);

  return (
    <div className={`${cfg.aspect} bg-gradient-to-br ${catColor.gradient} flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500`}>
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 0.5px, transparent 0)`, backgroundSize: "20px 20px" }} />
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(135deg, transparent 40%, currentColor 40%, currentColor 41%, transparent 41%)' }} />
      <div className="relative flex flex-col items-center gap-3">
        <div className="relative">
          <svg width={w + 20} height={h + 20} viewBox={`0 0 ${w + 20} ${h + 20}`} className="drop-shadow-md">
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={color || "currentColor"} stopOpacity={color ? 0.6 : 0.12} />
                <stop offset="100%" stopColor={color || "currentColor"} stopOpacity={color ? 0.8 : 0.18} />
              </linearGradient>
            </defs>
            <rect
              x={10} y={10} width={w} height={h} rx={size === 'lg' ? 6 : 4}
              fill={`url(#${gradId})`}
              className={color ? "" : catColor.icon}
              stroke={color || "currentColor"}
              strokeWidth={1.5}
              strokeOpacity={color ? 0.3 : 0.15}
            />
            <rect
              x={14} y={14} width={w - 8} height={h - 8} rx={size === 'lg' ? 4 : 2}
              fill="none"
              stroke={color || "currentColor"}
              strokeWidth={0.5}
              strokeOpacity={0.1}
              strokeDasharray="4 3"
            />
          </svg>
        </div>
        <Icon className={`${cfg.iconSize} ${catColor.icon} opacity-50`} strokeWidth={1.5} />
      </div>
      {color && (
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full border-2 border-white/30 shadow-sm ring-1 ring-black/5" style={{ backgroundColor: color }} />
        </div>
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { data: categories, isLoading: categoriesLoading, isError: categoriesError, refetch: refetchCategories } = useListCategories();
  const { data: items, isLoading: itemsLoading, isError: itemsError, refetch: refetchItems } = useListCatalogItems({
    search: search || undefined,
    category: selectedCategory ?? undefined,
  });

  const hasError = categoriesError || itemsError;

  useEffect(() => { setPage(1); }, [search, selectedCategory, sortBy]);

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

  const sidebarContent = (
    <>
      <div className="space-y-2">
        <h3 className="font-medium text-xs uppercase tracking-[0.1em] text-muted-foreground/60">Search</h3>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/40" />
          <Input
            placeholder="Search furniture..."
            className="pl-9 h-9 text-sm bg-muted/30 border-transparent focus:border-primary/30 focus:bg-background focus:ring-1 focus:ring-primary/20 transition-all duration-200"
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
              className="text-[10px] text-primary hover:underline normal-case tracking-normal font-normal"
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
              className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-200 ${!selectedCategory ? 'bg-primary text-primary-foreground font-medium shadow-sm' : 'hover:bg-muted/50 text-muted-foreground'}`}
              onClick={() => setSelectedCategory(undefined)}
              data-testid="category-filter-all"
            >
              <span className="flex items-center gap-2.5">
                <LayoutDashboard className={`w-3.5 h-3.5 shrink-0 ${!selectedCategory ? 'text-primary-foreground' : 'text-muted-foreground/50'}`} strokeWidth={1.8} />
                <span className="flex-1">All Categories</span>
                {items && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md tabular-nums ${!selectedCategory ? 'bg-primary-foreground/20' : 'bg-muted/80'}`}>
                    {items.length}
                  </span>
                )}
              </span>
            </button>
            {categories?.map((cat) => {
              const catColor = getColorForCategory(cat.name);
              const Icon = CATEGORY_ICONS[cat.name] || LayoutDashboard;
              return (
                <button
                  key={cat.name}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-200 flex items-center gap-2.5 ${selectedCategory === cat.name ? 'bg-primary text-primary-foreground font-medium shadow-sm' : 'hover:bg-muted/50 text-muted-foreground'}`}
                  onClick={() => setSelectedCategory(cat.name)}
                  data-testid={`category-filter-${cat.name}`}
                >
                  <Icon className={`w-3.5 h-3.5 ${selectedCategory === cat.name ? 'text-primary-foreground' : catColor.icon} shrink-0 transition-colors`} strokeWidth={1.8} />
                  <span className="flex-1 capitalize">{cat.name.replace('-', ' ')}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md tabular-nums ${selectedCategory === cat.name ? 'bg-primary-foreground/20' : 'bg-muted/80'}`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground/60 mb-1">Browse</p>
          <h1 className="text-2xl font-semibold tracking-[-0.02em]">Furniture Catalog</h1>
          <p className="text-muted-foreground text-sm mt-1">{sortedItems.length} items available for planning</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden gap-2 text-xs"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
            {selectedCategory && <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">{selectedCategory}</Badge>}
          </Button>
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

      {showMobileFilters && (
        <div className="lg:hidden bg-card border rounded-xl p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
          {sidebarContent}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="hidden lg:block w-56 shrink-0 space-y-5">
          {sidebarContent}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${catColor.accent} capitalize font-normal`}>
                            {item.category.replace('-', ' ')}
                          </Badge>
                        </div>
                        <h3 className="text-sm font-semibold line-clamp-1 mt-1 group-hover:text-primary transition-colors" title={item.name}>{item.name}</h3>
                        <p className="text-xs text-muted-foreground/60 line-clamp-1 mt-0.5 flex-1">
                          {item.description || 'No description'}
                        </p>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                          <span className="text-[11px] text-muted-foreground/50 font-mono">
                            {item.widthCm}×{item.depthCm}×{item.heightCm} cm
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
                <thead className="bg-muted/30 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-xs text-muted-foreground/60 uppercase tracking-wider">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-xs text-muted-foreground/60 uppercase tracking-wider hidden sm:table-cell">Category</th>
                    <th className="text-left px-4 py-3 font-medium text-xs text-muted-foreground/60 uppercase tracking-wider hidden md:table-cell">Dimensions</th>
                    <th className="text-left px-4 py-3 font-medium text-xs text-muted-foreground/60 uppercase tracking-wider">Price</th>
                    <th className="text-left px-4 py-3 font-medium text-xs text-muted-foreground/60 uppercase tracking-wider hidden lg:table-cell">Area</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((item, idx) => {
                    const itemArea = item.widthCm * item.depthCm;
                    const catColor = getColorForCategory(item.category);
                    const Icon = CATEGORY_ICONS[item.category] || LayoutDashboard;
                    return (
                      <tr
                        key={item.id}
                        className={`border-t border-border/50 hover:bg-muted/30 cursor-pointer transition-colors duration-150 ${idx % 2 === 0 ? '' : 'bg-muted/[0.04]'}`}
                        onClick={() => router.push(`/catalog/${item.id}`)}
                        data-testid={`item-row-${item.id}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-md ${catColor.bg} flex items-center justify-center shrink-0`}>
                              {item.color ? (
                                <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: item.color }} />
                              ) : (
                                <Icon className={`w-3.5 h-3.5 ${catColor.icon}`} strokeWidth={1.5} />
                              )}
                            </div>
                            <Link href={`/catalog/${item.id}`} className="font-medium hover:text-primary text-sm transition-colors">
                              {item.name}
                            </Link>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <Badge variant="outline" className={`text-[10px] capitalize ${catColor.accent} font-normal`}>{item.category.replace('-', ' ')}</Badge>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground/60 hidden md:table-cell">{item.widthCm}×{item.depthCm}×{item.heightCm} cm</td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground/60">{item.price ? `₹${item.price.toLocaleString()}` : '—'}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground/60 hidden lg:table-cell">{(itemArea / 10000).toFixed(2)} m²</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {sortedItems.length > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-center gap-1 pt-2">
              <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="text-xs gap-1 h-8 px-3">
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => {
                    const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                    return (
                      <span key={p} className="flex items-center">
                        {showEllipsis && <span className="text-xs text-muted-foreground/40 px-1">…</span>}
                        <Button
                          variant={p === page ? 'default' : 'ghost'}
                          size="sm"
                          className={`h-8 w-8 text-xs p-0 ${p === page ? 'pointer-events-none' : ''}`}
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </Button>
                      </span>
                    );
                  })}
              </div>
              <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="text-xs gap-1 h-8 px-3">
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

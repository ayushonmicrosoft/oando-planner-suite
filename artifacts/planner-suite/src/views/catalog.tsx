"use client";

import { useState, useMemo, useId } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useListCatalogItems, useListSeries } from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { Search, AlertCircle, RefreshCw, PackageOpen, ChevronRight, Crown, Star, Zap, Box, ArrowLeft, Plus, Ruler } from 'lucide-react';
import { CatalogGridSkeleton } from '@/components/skeletons';
import { motion } from 'framer-motion';

const TIER_CONFIG: Record<string, { icon: typeof Crown; gradient: string; border: string; badge: string; label: string; tagline: string }> = {
  economy: {
    icon: Zap,
    gradient: 'from-emerald-500/10 via-emerald-400/5 to-teal-500/5',
    border: 'border-emerald-500/20 hover:border-emerald-500/40',
    badge: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    label: 'Economy',
    tagline: 'Cost-effective office solutions',
  },
  medium: {
    icon: Star,
    gradient: 'from-blue-500/10 via-blue-400/5 to-indigo-500/5',
    border: 'border-blue-500/20 hover:border-blue-500/40',
    badge: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    label: 'Medium',
    tagline: 'Balanced design & ergonomics',
  },
  premium: {
    icon: Crown,
    gradient: 'from-amber-500/10 via-amber-400/5 to-orange-500/5',
    border: 'border-amber-500/20 hover:border-amber-500/40',
    badge: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
    label: 'Premium',
    tagline: 'Top-tier executive furniture',
  },
};

const CATEGORY_COLORS: Record<string, { bg: string; icon: string; accent: string; gradient: string }> = {
  seating: { bg: 'bg-blue-500/[0.08]', icon: 'text-blue-500', accent: 'border-blue-500/20', gradient: 'from-blue-500/10 to-blue-400/5' },
  'soft-seating': { bg: 'bg-violet-500/[0.08]', icon: 'text-violet-500', accent: 'border-violet-500/20', gradient: 'from-violet-500/10 to-violet-400/5' },
  workstations: { bg: 'bg-cyan-500/[0.08]', icon: 'text-cyan-500', accent: 'border-cyan-500/20', gradient: 'from-cyan-500/10 to-cyan-400/5' },
  tables: { bg: 'bg-amber-500/[0.08]', icon: 'text-amber-500', accent: 'border-amber-500/20', gradient: 'from-amber-500/10 to-amber-400/5' },
  storage: { bg: 'bg-emerald-500/[0.08]', icon: 'text-emerald-500', accent: 'border-emerald-500/20', gradient: 'from-emerald-500/10 to-emerald-400/5' },
};

export function getColorForCategory(cat: string) {
  return CATEGORY_COLORS[cat] || { bg: 'bg-slate-500/[0.08]', icon: 'text-slate-400', accent: 'border-slate-500/20', gradient: 'from-slate-500/10 to-slate-400/5' };
}

export function FurnitureVisual({ category, name, color, widthCm, depthCm, imageUrl, size = 'md' }: { category: string; name: string; color?: string | null; widthCm: number; depthCm: number; imageUrl?: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const catColor = getColorForCategory(category);
  const [imgError, setImgError] = useState(false);

  const sizeConfig = {
    sm: { aspect: 'aspect-[4/3]', textSize: 'text-[10px]' },
    md: { aspect: 'aspect-[4/3]', textSize: 'text-xs' },
    lg: { aspect: 'aspect-[16/10]', textSize: 'text-sm' },
  };
  const cfg = sizeConfig[size];

  if (imageUrl && !imgError) {
    return (
      <div className={`${cfg.aspect} bg-gradient-to-br ${catColor.gradient} flex items-center justify-center relative overflow-hidden`}>
        <img
          src={imageUrl}
          alt={name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div className={`${cfg.aspect} bg-gradient-to-br ${catColor.gradient} flex flex-col items-center justify-center relative overflow-hidden`}>
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 0.5px, transparent 0)`, backgroundSize: "20px 20px" }} />
      <div className="flex flex-col items-center gap-2">
        <Box className={`w-6 h-6 ${catColor.icon} opacity-40`} strokeWidth={1.5} />
        <span className={`${cfg.textSize} text-muted-foreground/60 font-medium text-center px-2 line-clamp-2`}>{name}</span>
      </div>
      {color && (
        <div className="absolute bottom-2 right-2">
          <div className="w-3 h-3 rounded-full border border-white/30 shadow-sm" style={{ backgroundColor: color }} />
        </div>
      )}
    </div>
  );
}

function ProductCard({ item }: { item: any }) {
  const catColor = getColorForCategory(item.category);

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Link href={`/catalog/${item.id}`} data-testid={`item-card-${item.id}`}>
          <div className="group rounded-xl border bg-card overflow-hidden hover:shadow-lg hover:shadow-black/5 transition-all duration-300 cursor-pointer hover:border-primary/20 h-full flex flex-col">
            <FurnitureVisual
              category={item.category}
              name={item.name}
              color={item.color}
              widthCm={item.widthCm}
              depthCm={item.depthCm}
              imageUrl={item.imageUrl}
            />
            <div className="p-3 flex-1 flex flex-col">
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${catColor.accent} capitalize font-normal w-fit`}>
                {item.category.replace('-', ' ')}
              </Badge>
              <h3 className="text-sm font-semibold line-clamp-1 mt-1.5 group-hover:text-primary transition-colors">{item.name}</h3>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
                <span className="text-[11px] text-muted-foreground/50 font-mono">{item.widthCm}×{item.depthCm} cm</span>
                <span className="text-[11px] font-medium">{item.price ? `₹${item.price.toLocaleString()}` : '—'}</span>
              </div>
            </div>
          </div>
        </Link>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-0 overflow-hidden" side="right" align="start">
        <div className="aspect-[16/10] overflow-hidden">
          <FurnitureVisual
            category={item.category}
            name={item.name}
            color={item.color}
            widthCm={item.widthCm}
            depthCm={item.depthCm}
            imageUrl={item.imageUrl}
            size="lg"
          />
        </div>
        <div className="p-4 space-y-2">
          <h4 className="font-semibold text-sm">{item.name}</h4>
          <p className="text-xs text-muted-foreground line-clamp-2">{item.description || 'No description available.'}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground/70">
            <span className="flex items-center gap-1"><Ruler className="w-3 h-3" />{item.widthCm}×{item.depthCm}×{item.heightCm} cm</span>
            {item.price && <span className="font-medium text-foreground">₹{item.price.toLocaleString()}</span>}
          </div>
          <Link href={`/catalog/${item.id}`}>
            <Button size="sm" className="w-full mt-2 gap-1.5 text-xs h-8">
              <Plus className="w-3 h-3" /> View Details
            </Button>
          </Link>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

export default function Catalog() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const { data: seriesData, isLoading: seriesLoading, isError: seriesError, refetch: refetchSeries } = useListSeries();
  const { data: allItems, isLoading: itemsLoading, isError: itemsError, refetch: refetchItems } = useListCatalogItems();

  const hasError = seriesError || itemsError;
  const isLoading = seriesLoading || itemsLoading;

  const standaloneItems = useMemo(() => {
    if (!allItems) return { metalStorage: [], tables: [], otherStandalone: [] };
    const metalStorage = allItems.filter(i => !i.seriesId && i.category === 'storage');
    const tables = allItems.filter(i => !i.seriesId && i.category === 'tables');
    const otherStandalone = allItems.filter(i => !i.seriesId && i.category !== 'storage' && i.category !== 'tables');
    return { metalStorage, tables, otherStandalone };
  }, [allItems]);

  const searchResults = useMemo(() => {
    if (!search || !allItems) return [];
    const q = search.toLowerCase();
    return allItems.filter(i =>
      i.name.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q) ||
      (i.description || '').toLowerCase().includes(q)
    );
  }, [search, allItems]);

  const selectedSeriesData = useMemo(() => {
    if (!selectedTier || !seriesData) return null;
    return seriesData.find(s => s.tier === selectedTier) || null;
  }, [selectedTier, seriesData]);

  if (search) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setSearch('')}>
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/40" />
            <Input
              placeholder="Search products..."
              className="pl-9 h-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <span className="text-sm text-muted-foreground">{searchResults.length} results</span>
        </div>
        {searchResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
            <PackageOpen className="w-10 h-10 mb-4 opacity-20" />
            <p className="text-sm font-medium">No products found</p>
            <p className="text-xs mt-1 text-muted-foreground/60">Try a different search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {searchResults.map(item => <ProductCard key={item.id} item={item} />)}
          </div>
        )}
      </div>
    );
  }

  if (selectedTier && selectedSeriesData) {
    const groupedByCategory = selectedSeriesData.items.reduce((acc: Record<string, any[]>, item: any) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
    const tierCfg = TIER_CONFIG[selectedTier];
    const TierIcon = tierCfg?.icon || Star;

    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setSelectedTier(null)}>
            <ArrowLeft className="w-4 h-4" /> All Series
          </Button>
          <div className="flex items-center gap-2">
            <Badge className={`${tierCfg?.badge} border`}>
              <TierIcon className="w-3 h-3 mr-1" />
              {tierCfg?.label}
            </Badge>
            <h1 className="text-xl font-semibold">{selectedSeriesData.name}</h1>
          </div>
        </div>
        <p className="text-muted-foreground text-sm max-w-2xl">{selectedSeriesData.description}</p>

        {Object.entries(groupedByCategory).map(([category, items]) => (
          <div key={category} className="space-y-3">
            <h2 className="text-lg font-semibold capitalize">{category.replace('-', ' ')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {(items as any[]).map(item => <ProductCard key={item.id} item={item} />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground/60 mb-1">AFC India Collection</p>
          <h1 className="text-2xl font-semibold tracking-[-0.02em]">Product Catalog</h1>
          <p className="text-muted-foreground text-sm mt-1">Choose a series to explore matching furniture for your space</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/40" />
          <Input
            placeholder="Search all products..."
            className="pl-9 h-9 text-sm bg-muted/30 border-transparent focus:border-primary/30 focus:bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-catalog"
          />
        </div>
      </div>

      {hasError && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm">Failed to load catalog data.</span>
            </div>
            <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={() => { refetchSeries(); refetchItems(); }}>
              <RefreshCw className="w-3 h-3" /> Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <CatalogGridSkeleton />
      ) : (
        <>
          <div>
            <h2 className="text-lg font-semibold mb-4">Choose Your Series</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {seriesData?.map((series) => {
                const tierCfg = TIER_CONFIG[series.tier];
                if (!tierCfg) return null;
                const TierIcon = tierCfg.icon;
                const itemCount = series.items?.length || 0;
                const categories = [...new Set(series.items?.map((i: any) => i.category) || [])];

                return (
                  <motion.div
                    key={series.id}
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Card
                      className={`cursor-pointer overflow-hidden ${tierCfg.border} transition-all duration-300 hover:shadow-xl hover:shadow-black/10 h-full`}
                      onClick={() => setSelectedTier(series.tier)}
                      data-testid={`tier-card-${series.tier}`}
                    >
                      <div className={`aspect-[16/9] bg-gradient-to-br ${tierCfg.gradient} relative overflow-hidden`}>
                        {series.imageUrl ? (
                          <img
                            src={series.imageUrl}
                            alt={series.name}
                            className="w-full h-full object-cover opacity-90"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <TierIcon className="w-16 h-16 opacity-10" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <Badge className={`${tierCfg.badge} border text-xs mb-1.5`}>
                            <TierIcon className="w-3 h-3 mr-1" />
                            {tierCfg.label}
                          </Badge>
                          <h3 className="text-white font-bold text-lg leading-tight">{series.name}</h3>
                        </div>
                      </div>
                      <CardContent className="p-4 space-y-3">
                        <p className="text-xs text-muted-foreground line-clamp-2">{series.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1 flex-wrap">
                            {categories.map(cat => (
                              <Badge key={cat} variant="outline" className="text-[9px] capitalize px-1.5 py-0">
                                {(cat as string).replace('-', ' ')}
                              </Badge>
                            ))}
                          </div>
                          <span className="text-[10px] text-muted-foreground">{itemCount} products</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-primary font-medium pt-1">
                          Explore Series <ChevronRight className="w-3 h-3" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {standaloneItems.metalStorage.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Metal Storage</h2>
                  <p className="text-xs text-muted-foreground">Heavy-duty storage — works with any series</p>
                </div>
                <Badge variant="outline" className="text-[10px]">{standaloneItems.metalStorage.length} products</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                {standaloneItems.metalStorage.map(item => <ProductCard key={item.id} item={item} />)}
              </div>
            </div>
          )}

          {standaloneItems.tables.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Tables</h2>
                  <p className="text-xs text-muted-foreground">Cabin, meeting & cafe tables — works with any series</p>
                </div>
                <Badge variant="outline" className="text-[10px]">{standaloneItems.tables.length} products</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {standaloneItems.tables.map(item => <ProductCard key={item.id} item={item} />)}
              </div>
            </div>
          )}

          {standaloneItems.otherStandalone.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Standalone Items</h2>
                  <p className="text-xs text-muted-foreground">Additional seating and accessories</p>
                </div>
                <Badge variant="outline" className="text-[10px]">{standaloneItems.otherStandalone.length} products</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {standaloneItems.otherStandalone.map(item => <ProductCard key={item.id} item={item} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

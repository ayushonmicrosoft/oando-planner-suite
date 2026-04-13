"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  useGetCatalogItem,
  useListCatalogItems,
  getGetCatalogItemQueryKey,
  getListCatalogItemsQueryOptions,
} from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Loader2,
  ArrowLeft,
  Maximize,
  Ruler,
  Plus,
  Palette,
  Users,
  Box,
  Layers,
  DollarSign,
  ZoomIn,
  X,
} from "lucide-react";
import { FurnitureVisual, getColorForCategory } from "./catalog";

function ImageZoomModal({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
        onClick={onClose}
      >
        <X className="w-6 h-6" />
      </Button>
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-[90vh] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

function DimensionDiagram({
  width,
  depth,
  height,
}: {
  width: number;
  depth: number;
  height: number;
}) {
  const svgW = 280;
  const svgH = 200;
  const padding = 40;
  const maxDim = Math.max(width, depth);
  const scale = Math.min(
    (svgW - padding * 2) / maxDim,
    (svgH - padding * 2) / maxDim
  );
  const rectW = width * scale;
  const rectD = depth * scale;
  const x = (svgW - rectW) / 2;
  const y = (svgH - rectD) / 2;

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      className="w-full max-w-[280px]"
      aria-label={`Dimension diagram: ${width}cm wide × ${depth}cm deep × ${height}cm tall`}
    >
      <rect x={x} y={y} width={rectW} height={rectD} fill="hsl(var(--primary) / 0.08)" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1.5" rx="3" />
      <rect x={x + 3} y={y + 3} width={rectW - 6} height={rectD - 6} fill="none" stroke="hsl(var(--primary) / 0.1)" strokeWidth="0.5" strokeDasharray="4 3" rx="2" />
      <line x1={x} y1={y + rectD + 12} x2={x + rectW} y2={y + rectD + 12} stroke="hsl(var(--muted-foreground) / 0.4)" strokeWidth="1" markerStart="url(#arrowL)" markerEnd="url(#arrowR)" />
      <text x={x + rectW / 2} y={y + rectD + 28} textAnchor="middle" className="fill-muted-foreground text-[11px] font-mono">{width} cm</text>
      <line x1={x + rectW + 12} y1={y} x2={x + rectW + 12} y2={y + rectD} stroke="hsl(var(--muted-foreground) / 0.4)" strokeWidth="1" markerStart="url(#arrowU)" markerEnd="url(#arrowD)" />
      <text x={x + rectW + 16} y={y + rectD / 2} dominantBaseline="middle" className="fill-muted-foreground text-[11px] font-mono">{depth} cm</text>
      <text x={svgW / 2} y={y - 10} textAnchor="middle" className="fill-muted-foreground text-[10px] font-mono">H: {height} cm</text>
      <defs>
        <marker id="arrowL" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto"><path d="M6,0 L0,3 L6,6" fill="none" stroke="hsl(var(--muted-foreground) / 0.4)" strokeWidth="1" /></marker>
        <marker id="arrowR" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="none" stroke="hsl(var(--muted-foreground) / 0.4)" strokeWidth="1" /></marker>
        <marker id="arrowU" markerWidth="6" markerHeight="6" refX="3" refY="0" orient="auto"><path d="M0,6 L3,0 L6,6" fill="none" stroke="hsl(var(--muted-foreground) / 0.4)" strokeWidth="1" /></marker>
        <marker id="arrowD" markerWidth="6" markerHeight="6" refX="3" refY="6" orient="auto"><path d="M0,0 L3,6 L6,0" fill="none" stroke="hsl(var(--muted-foreground) / 0.4)" strokeWidth="1" /></marker>
      </defs>
    </svg>
  );
}

function SpecCard({ icon: Icon, label, children }: { icon: typeof Maximize; label: string; children: React.ReactNode }) {
  return (
    <div className="bg-muted/40 hover:bg-muted/60 transition-colors duration-200 p-4 rounded-xl space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70 font-medium uppercase tracking-wider">
        <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
        {label}
      </div>
      <div className="font-mono text-sm">{children}</div>
    </div>
  );
}

export default function CatalogDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [zoomOpen, setZoomOpen] = useState(false);

  const {
    data: item,
    isLoading,
    isError,
  } = useGetCatalogItem(id, {
    query: {
      queryKey: getGetCatalogItemQueryKey(id),
      enabled: !!id,
    },
  });

  const relatedOpts = getListCatalogItemsQueryOptions({ category: item?.category });
  const { data: relatedItems } = useListCatalogItems(
    { category: item?.category },
    {
      query: {
        ...relatedOpts,
        enabled: !!item?.category,
      },
    }
  );

  const filteredRelated = relatedItems
    ?.filter((r) => r.id !== id)
    .slice(0, 6);

  if (isLoading) {
    return (
      <div className="p-8 max-w-6xl mx-auto flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary/60" />
          <p className="text-sm text-muted-foreground/60">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/catalog")} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Button>
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl">
          <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
            <p className="text-lg font-medium">Item not found</p>
            <p className="text-sm text-muted-foreground">The catalog item you're looking for doesn't exist or has been removed.</p>
            <Button variant="outline" onClick={() => router.push("/catalog")}>Return to Catalog</Button>
          </div>
        </div>
      </div>
    );
  }

  const floorArea = ((item.widthCm * item.depthCm) / 10000).toFixed(2);
  const catColor = getColorForCategory(item.category);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      {zoomOpen && item.imageUrl && (
        <ImageZoomModal src={item.imageUrl} alt={item.name} onClose={() => setZoomOpen(false)} />
      )}

      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link href="/catalog">Catalog</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/catalog?category=${encodeURIComponent(item.category)}`} className="capitalize">
                  {item.category.replace('-', ' ')}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{item.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden border bg-card relative group">
            {item.imageUrl ? (
              <div
                className="aspect-[16/10] overflow-hidden cursor-zoom-in relative"
                onClick={() => setZoomOpen(true)}
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-80 transition-opacity drop-shadow-lg" />
                </div>
              </div>
            ) : (
              <div className="group">
                <FurnitureVisual
                  category={item.category}
                  name={item.name}
                  color={item.color}
                  widthCm={item.widthCm}
                  depthCm={item.depthCm}
                  size="lg"
                />
              </div>
            )}
            <div className="p-4 border-t bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`capitalize ${catColor.accent} font-normal`}>
                    {item.category.replace('-', ' ')}
                  </Badge>
                  {item.seriesId && (
                    <Badge variant="outline" className="text-[10px]">
                      Series
                    </Badge>
                  )}
                </div>
                {item.color && (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full border-2 border-background shadow-sm ring-1 ring-border" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-muted-foreground font-mono">{item.color}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Ruler className="w-4 h-4 text-muted-foreground/60" strokeWidth={1.5} />
              <h3 className="text-sm font-medium">Dimension Diagram</h3>
            </div>
            <div className="flex justify-center">
              <DimensionDiagram width={item.widthCm} depth={item.depthCm} height={item.heightCm} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{item.name}</h1>
            <p className="text-muted-foreground leading-relaxed mt-2">
              {item.description || "No description available for this item."}
            </p>
          </div>

          {item.price != null && (
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight">₹{item.price.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground/60 ml-1">per unit</span>
            </div>
          )}

          <Separator />

          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground/60 mb-3">Specifications</h3>
            <div className="grid grid-cols-2 gap-3">
              <SpecCard icon={Maximize} label="Dimensions">
                {item.widthCm}W × {item.depthCm}D × {item.heightCm}H cm
              </SpecCard>
              <SpecCard icon={Layers} label="Floor Area">
                {floorArea} m²
              </SpecCard>
              <SpecCard icon={Box} label="Shape">
                <span className="capitalize">{item.shape || "Standard"}</span>
              </SpecCard>
              {item.color && (
                <SpecCard icon={Palette} label="Color">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border shadow-sm" style={{ backgroundColor: item.color }} />
                    <span>{item.color}</span>
                  </div>
                </SpecCard>
              )}
              {item.seatCount != null && (
                <SpecCard icon={Users} label="Capacity">
                  {item.seatCount} {item.seatCount === 1 ? "person" : "persons"}
                </SpecCard>
              )}
              {item.price != null && (
                <SpecCard icon={DollarSign} label="Unit Price">
                  ₹{item.price.toLocaleString()}
                </SpecCard>
              )}
            </div>
          </div>

          <div className="pt-2">
            <Button
              size="lg"
              className="w-full gap-2 h-12 text-base font-semibold shadow-sm hover:shadow-md transition-shadow"
              onClick={() => router.push(`/planner/studio?itemId=${encodeURIComponent(id)}`)}
            >
              <Plus className="w-5 h-5" />
              Add to Plan
            </Button>
            <p className="text-[11px] text-muted-foreground/50 text-center mt-2">Opens in the Floor Plan Studio</p>
          </div>
        </div>
      </div>

      {filteredRelated && filteredRelated.length > 0 && (
        <>
          <Separator className="my-6" />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">
                Related in <span className="capitalize">{item.category.replace('-', ' ')}</span>
              </h2>
              <Link href={`/catalog?category=${encodeURIComponent(item.category)}`} className="text-xs text-primary hover:underline">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {filteredRelated.map((rel) => (
                <Link key={rel.id} href={`/catalog/${rel.id}`} className="group">
                  <div className="rounded-xl border bg-card overflow-hidden hover:shadow-md hover:border-primary/20 transition-all duration-300">
                    <FurnitureVisual
                      category={rel.category}
                      name={rel.name}
                      color={rel.color}
                      widthCm={rel.widthCm}
                      depthCm={rel.depthCm}
                      imageUrl={rel.imageUrl}
                      size="sm"
                    />
                    <div className="p-3">
                      <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">{rel.name}</p>
                      <p className="text-xs text-muted-foreground/60 font-mono mt-1">
                        {rel.price ? `₹${rel.price.toLocaleString()}` : "—"}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  useGetCatalogItem,
  useListCatalogItems,
  getGetCatalogItemQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  CircleDashed,
  Square,
  DollarSign,
  Users,
  ArrowLeft,
  Maximize,
  Ruler,
  Plus,
} from "lucide-react";

function ShapeIndicator({ shape, size = 20 }: { shape?: string; size?: number }) {
  if (shape === "round" || shape === "circle") {
    return (
      <div
        className="rounded-full border-2 border-muted-foreground/40"
        style={{ width: size, height: size }}
      />
    );
  }
  if (shape === "l-left" || shape === "l-right") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        className="text-muted-foreground/40"
      >
        <path
          d={
            shape === "l-left"
              ? "M2 2h12v8H8v4H2z"
              : "M2 2h12v8H14v4H8V10H2z"
          }
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    );
  }
  return (
    <div
      className="rounded-sm border-2 border-muted-foreground/40"
      style={{ width: size, height: size }}
    />
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
      <rect
        x={x}
        y={y}
        width={rectW}
        height={rectD}
        fill="hsl(var(--primary) / 0.1)"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        rx="2"
      />
      <line
        x1={x}
        y1={y + rectD + 12}
        x2={x + rectW}
        y2={y + rectD + 12}
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="1"
        markerStart="url(#arrowL)"
        markerEnd="url(#arrowR)"
      />
      <text
        x={x + rectW / 2}
        y={y + rectD + 28}
        textAnchor="middle"
        className="fill-muted-foreground text-[11px] font-mono"
      >
        {width} cm
      </text>
      <line
        x1={x + rectW + 12}
        y1={y}
        x2={x + rectW + 12}
        y2={y + rectD}
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="1"
        markerStart="url(#arrowU)"
        markerEnd="url(#arrowD)"
      />
      <text
        x={x + rectW + 16}
        y={y + rectD / 2}
        dominantBaseline="middle"
        className="fill-muted-foreground text-[11px] font-mono"
      >
        {depth} cm
      </text>
      <text
        x={svgW / 2}
        y={y - 10}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px] font-mono"
      >
        H: {height} cm
      </text>
      <defs>
        <marker id="arrowL" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto">
          <path d="M6,0 L0,3 L6,6" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        </marker>
        <marker id="arrowR" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        </marker>
        <marker id="arrowU" markerWidth="6" markerHeight="6" refX="3" refY="0" orient="auto">
          <path d="M0,6 L3,0 L6,6" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        </marker>
        <marker id="arrowD" markerWidth="6" markerHeight="6" refX="3" refY="6" orient="auto">
          <path d="M0,0 L3,6 L6,0" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        </marker>
      </defs>
    </svg>
  );
}

export default function CatalogDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

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

  const { data: relatedItems } = useListCatalogItems(
    { category: item?.category },
    {
      query: {
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
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/catalog")} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Button>
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="flex flex-col items-center justify-center h-64 text-center space-y-4">
            <p className="text-lg font-medium">Item not found</p>
            <p className="text-sm text-muted-foreground">
              The catalog item you're looking for doesn't exist or has been removed.
            </p>
            <Button variant="outline" onClick={() => router.push("/catalog")}>
              Return to Catalog
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const floorArea = ((item.widthCm * item.depthCm) / 10000).toFixed(2);

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/catalog">Catalog</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/catalog?category=${encodeURIComponent(item.category)}`}>
                {item.category}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{item.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="aspect-square bg-muted/30 rounded-xl flex items-center justify-center relative overflow-hidden border">
            {item.shape === "round" || item.shape === "circle" ? (
              <CircleDashed className="w-1/2 h-1/2 text-muted-foreground/20" />
            ) : (
              <Square className="w-1/2 h-1/2 text-muted-foreground/20" />
            )}
            {item.color && (
              <div
                className="absolute bottom-4 right-4 w-10 h-10 rounded-full border-2 border-white shadow-lg"
                style={{ backgroundColor: item.color }}
                title={`Color: ${item.color}`}
              />
            )}
            <Badge
              variant="outline"
              className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm"
            >
              {item.category}
            </Badge>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Ruler className="w-4 h-4" />
                Dimension Diagram
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <DimensionDiagram
                width={item.widthCm}
                depth={item.depthCm}
                height={item.heightCm}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">{item.name}</h1>
              <Badge variant="secondary" className="text-sm shrink-0">
                {item.category}
              </Badge>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {item.description || "No description available for this item."}
            </p>
          </div>

          {item.price != null && (
            <div className="text-3xl font-bold text-primary flex items-center gap-1">
              <DollarSign className="w-7 h-7" />
              {item.price.toFixed(2)}
            </div>
          )}

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-1">
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                Dimensions
              </div>
              <div className="font-mono text-sm flex items-center gap-1.5">
                <Maximize className="w-3.5 h-3.5 text-muted-foreground" />
                {item.widthCm}W × {item.depthCm}D × {item.heightCm}H cm
              </div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg space-y-1">
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                Floor Area
              </div>
              <div className="font-mono text-sm">{floorArea} m²</div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg space-y-1">
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                Shape
              </div>
              <div className="flex items-center gap-2">
                <ShapeIndicator shape={item.shape ?? undefined} />
                <span className="font-mono text-sm capitalize">
                  {item.shape || "Standard"}
                </span>
              </div>
            </div>
            {item.color && (
              <div className="bg-muted/50 p-4 rounded-lg space-y-1">
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  Color
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full border shadow-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-mono text-sm">{item.color}</span>
                </div>
              </div>
            )}
            {item.seatCount != null && (
              <div className="bg-muted/50 p-4 rounded-lg space-y-1">
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  Capacity
                </div>
                <div className="font-mono text-sm flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                  {item.seatCount} {item.seatCount === 1 ? "person" : "persons"}
                </div>
              </div>
            )}
            {item.price != null && (
              <div className="bg-muted/50 p-4 rounded-lg space-y-1">
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  Price
                </div>
                <div className="font-mono text-sm flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                  {item.price.toFixed(2)}
                </div>
              </div>
            )}
          </div>

          <Button
            size="lg"
            className="w-full gap-2"
            onClick={() =>
              router.push(`/planner/studio?itemId=${encodeURIComponent(id)}`)
            }
          >
            <Plus className="w-5 h-5" />
            Add to Plan
          </Button>
        </div>
      </div>

      {filteredRelated && filteredRelated.length > 0 && (
        <>
          <Separator className="my-8" />
          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">
              Related Items in {item.category}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredRelated.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/catalog/${rel.id}`}
                  className="group"
                >
                  <Card className="overflow-hidden hover:shadow-md transition-shadow hover:border-primary/50">
                    <div className="aspect-square bg-muted/30 flex items-center justify-center p-4 border-b relative">
                      {rel.shape === "round" || rel.shape === "circle" ? (
                        <CircleDashed className="w-full h-full text-muted-foreground/20" />
                      ) : (
                        <Square className="w-full h-full text-muted-foreground/20" />
                      )}
                      {rel.color && (
                        <div
                          className="absolute bottom-2 right-2 w-4 h-4 rounded-full border border-white shadow-sm"
                          style={{ backgroundColor: rel.color }}
                        />
                      )}
                    </div>
                    <CardContent className="p-3">
                      <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                        {rel.name}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono mt-1">
                        {rel.price ? `$${rel.price.toFixed(0)}` : "—"}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

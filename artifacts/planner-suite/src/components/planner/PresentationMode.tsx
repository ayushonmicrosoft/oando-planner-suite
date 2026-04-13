"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PresentationItem {
  name: string;
  category?: string;
  widthCm: number;
  depthCm: number;
  heightCm?: number;
  x: number;
  y: number;
  instanceId: string;
}

interface PresentationModeProps {
  open: boolean;
  onClose: () => void;
  planName: string;
  items: PresentationItem[];
  roomWidthCm: number;
  roomDepthCm: number;
}

interface Zone {
  name: string;
  items: PresentationItem[];
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

function computeZones(items: PresentationItem[], roomWidthCm: number, roomDepthCm: number): Zone[] {
  const catMap = new Map<string, PresentationItem[]>();
  for (const item of items) {
    const cat = item.category || "Other";
    if (!catMap.has(cat)) catMap.set(cat, []);
    catMap.get(cat)!.push(item);
  }

  const zones: Zone[] = [];
  for (const [name, zoneItems] of catMap) {
    if (zoneItems.length === 0) continue;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const it of zoneItems) {
      minX = Math.min(minX, it.x);
      minY = Math.min(minY, it.y);
      maxX = Math.max(maxX, it.x + it.widthCm);
      maxY = Math.max(maxY, it.y + it.depthCm);
    }
    const pad = 40;
    zones.push({
      name,
      items: zoneItems,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2,
      width: Math.max(maxX - minX + pad * 2, 120),
      height: Math.max(maxY - minY + pad * 2, 120),
    });
  }
  return zones;
}

const CATEGORY_COLORS: Record<string, string> = {
  workstations: "#5b8fb9",
  seating: "#6db587",
  "soft-seating": "#9b7fd4",
  tables: "#e8935a",
  storage: "#8fad6b",
  desks: "#5b8fb9",
  chairs: "#6db587",
  cabinets: "#8fad6b",
  education: "#5aa5c9",
  accessories: "#d47b7b",
};

function getColor(category: string): string {
  const key = Object.keys(CATEGORY_COLORS).find(k =>
    category.toLowerCase().includes(k.slice(0, 4))
  );
  return key ? CATEGORY_COLORS[key] : "#7c9bbd";
}

export function PresentationMode({
  open, onClose, planName, items, roomWidthCm, roomDepthCm,
}: PresentationModeProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const zones = computeZones(items, roomWidthCm, roomDepthCm);
  const totalSlides = 1 + zones.length + 1;

  const goNext = useCallback(() => {
    setSlideIndex(i => Math.min(i + 1, totalSlides - 1));
  }, [totalSlides]);

  const goPrev = useCallback(() => {
    setSlideIndex(i => Math.max(i - 1, 0));
  }, []);

  useEffect(() => {
    if (!open) {
      setSlideIndex(0);
      return;
    }
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") goNext();
      else if (e.key === "ArrowLeft" || e.key === "Backspace") goPrev();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, goNext, goPrev, onClose]);

  useEffect(() => {
    if (!open || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    if (slideIndex === 0) {
      drawOverviewSlide(ctx, w, h, items, roomWidthCm, roomDepthCm, planName);
    } else if (slideIndex <= zones.length) {
      const zone = zones[slideIndex - 1];
      drawZoneSlide(ctx, w, h, zone, items, roomWidthCm, roomDepthCm);
    } else {
      drawSummarySlide(ctx, w, h, items, roomWidthCm, roomDepthCm, planName);
    }
  }, [open, slideIndex, items, roomWidthCm, roomDepthCm, planName, zones]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-900 flex flex-col"
      onClick={goNext}
    >
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2" onClick={e => e.stopPropagation()}>
        <span className="text-white/60 text-sm font-mono">
          {slideIndex + 1} / {totalSlides}
        </span>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className="max-w-full max-h-full rounded-lg shadow-2xl"
        />
      </div>

      <div className="flex items-center justify-center gap-4 pb-6" onClick={e => e.stopPropagation()}>
        <Button
          variant="ghost" size="icon"
          className="text-white hover:bg-white/10"
          onClick={goPrev}
          disabled={slideIndex === 0}
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>

        <div className="flex gap-1.5">
          {Array.from({ length: totalSlides }, (_, i) => (
            <button
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === slideIndex ? "bg-white" : "bg-white/30 hover:bg-white/50"
              }`}
              onClick={() => setSlideIndex(i)}
            />
          ))}
        </div>

        <Button
          variant="ghost" size="icon"
          className="text-white hover:bg-white/10"
          onClick={goNext}
          disabled={slideIndex === totalSlides - 1}
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}

function drawOverviewSlide(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  items: PresentationItem[], roomW: number, roomD: number, planName: string,
) {
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#1e293b";
  const padding = 60;
  const scale = Math.min((w - padding * 2) / roomW, (h - padding * 2 - 80) / roomD);
  const offX = (w - roomW * scale) / 2;
  const offY = (h - roomD * scale) / 2 + 30;

  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 2;
  ctx.strokeRect(offX, offY, roomW * scale, roomD * scale);

  for (const item of items) {
    const ix = offX + item.x * scale;
    const iy = offY + item.y * scale;
    const iw = item.widthCm * scale;
    const ih = item.depthCm * scale;
    const color = getColor(item.category || "");

    ctx.fillStyle = color + "66";
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.fillRect(ix, iy, iw, ih);
    ctx.strokeRect(ix, iy, iw, ih);

    if (item.name) {
      ctx.fillStyle = "#e2e8f0";
      ctx.font = `${Math.max(8, Math.min(11, iw * 0.18))}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const label = item.name.length > 12 ? item.name.slice(0, 10) + "…" : item.name;
      ctx.fillText(label, ix + iw / 2, iy + ih / 2);
    }
  }

  ctx.fillStyle = "#f8fafc";
  ctx.font = "bold 28px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(planName, w / 2, 20);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "14px sans-serif";
  ctx.fillText(
    `${roomW}cm × ${roomD}cm | ${items.length} items | ${(roomW * roomD / 10000).toFixed(1)} m²`,
    w / 2, 54,
  );
}

function drawZoneSlide(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  zone: Zone, allItems: PresentationItem[], roomW: number, roomD: number,
) {
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, w, h);

  const color = getColor(zone.name);

  ctx.fillStyle = color;
  ctx.font = "bold 24px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(zone.name, 40, 30);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "14px sans-serif";
  ctx.fillText(`${zone.items.length} item${zone.items.length !== 1 ? "s" : ""}`, 40, 60);

  const canvasArea = { x: 40, y: 90, w: w * 0.55 - 60, h: h - 140 };
  const scale = Math.min(canvasArea.w / zone.width, canvasArea.h / zone.height);
  const zoneOffX = canvasArea.x + (canvasArea.w - zone.width * scale) / 2;
  const zoneOffY = canvasArea.y + (canvasArea.h - zone.height * scale) / 2;
  const baseX = zone.centerX - zone.width / 2;
  const baseY = zone.centerY - zone.height / 2;

  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(zoneOffX, zoneOffY, zone.width * scale, zone.height * scale);
  ctx.setLineDash([]);

  for (const item of zone.items) {
    const ix = zoneOffX + (item.x - baseX) * scale;
    const iy = zoneOffY + (item.y - baseY) * scale;
    const iw = item.widthCm * scale;
    const ih = item.depthCm * scale;

    ctx.fillStyle = color + "55";
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.fillRect(ix, iy, iw, ih);
    ctx.strokeRect(ix, iy, iw, ih);

    if (item.name) {
      ctx.fillStyle = "#e2e8f0";
      ctx.font = `${Math.max(10, Math.min(14, iw * 0.2))}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(item.name, ix + iw / 2, iy + ih / 2);
    }
  }

  const listX = w * 0.58;
  const listW = w - listX - 40;
  let listY = 90;

  ctx.fillStyle = "#1e293b";
  ctx.fillRect(listX, listY, listW, h - 140);
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 1;
  ctx.strokeRect(listX, listY, listW, h - 140);

  listY += 20;
  ctx.fillStyle = "#e2e8f0";
  ctx.font = "bold 13px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Items in this zone:", listX + 16, listY);
  listY += 24;

  for (const item of zone.items) {
    if (listY > h - 60) break;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(listX + 22, listY - 2, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f1f5f9";
    ctx.font = "12px sans-serif";
    ctx.fillText(item.name, listX + 32, listY);
    listY += 6;

    ctx.fillStyle = "#64748b";
    ctx.font = "10px sans-serif";
    ctx.fillText(
      `${item.widthCm}cm × ${item.depthCm}cm${item.heightCm ? ` × ${item.heightCm}cm` : ""}`,
      listX + 32, listY,
    );
    listY += 18;
  }
}

function drawSummarySlide(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  items: PresentationItem[], roomW: number, roomD: number, planName: string,
) {
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#f8fafc";
  ctx.font = "bold 28px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("Bill of Quantities Summary", w / 2, 30);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "14px sans-serif";
  ctx.fillText(planName, w / 2, 66);

  const catMap = new Map<string, { count: number; items: PresentationItem[] }>();
  for (const item of items) {
    const cat = item.category || "Other";
    if (!catMap.has(cat)) catMap.set(cat, { count: 0, items: [] });
    const entry = catMap.get(cat)!;
    entry.count++;
    entry.items.push(item);
  }

  const cols = [40, 260, 400, 530, 640, 740, 850];
  const headers = ["#", "Item Name", "Category", "Width (cm)", "Depth (cm)", "Height (cm)", "Qty"];
  let y = 110;

  ctx.fillStyle = "#1e293b";
  ctx.fillRect(30, y - 6, w - 60, 24);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = "left";
  headers.forEach((h, i) => ctx.fillText(h, cols[i], y + 6));
  y += 28;

  const grouped = new Map<string, { name: string; cat: string; w: number; d: number; h: number; qty: number }>();
  for (const item of items) {
    const key = `${item.name}|${item.category}|${item.widthCm}|${item.depthCm}|${item.heightCm ?? 75}`;
    const ex = grouped.get(key);
    if (ex) { ex.qty++; } else {
      grouped.set(key, {
        name: item.name, cat: item.category || "Other",
        w: item.widthCm, d: item.depthCm, h: item.heightCm ?? 75, qty: 1,
      });
    }
  }

  let idx = 0;
  ctx.font = "11px sans-serif";
  for (const row of grouped.values()) {
    if (y > h - 60) break;
    if (idx % 2 === 0) {
      ctx.fillStyle = "#1e293b44";
      ctx.fillRect(30, y - 6, w - 60, 20);
    }
    ctx.fillStyle = "#e2e8f0";
    ctx.textAlign = "left";
    ctx.fillText(String(idx + 1), cols[0], y + 6);
    ctx.fillText(row.name, cols[1], y + 6);
    ctx.fillText(row.cat, cols[2], y + 6);
    ctx.fillText(String(row.w), cols[3], y + 6);
    ctx.fillText(String(row.d), cols[4], y + 6);
    ctx.fillText(String(row.h), cols[5], y + 6);
    ctx.fillText(String(row.qty), cols[6], y + 6);
    y += 22;
    idx++;
  }

  y = Math.max(y + 20, h - 60);
  ctx.fillStyle = "#64748b";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    `${roomW}cm × ${roomD}cm | ${items.length} total items | ${(roomW * roomD / 10000).toFixed(1)} m²`,
    w / 2, y,
  );
}

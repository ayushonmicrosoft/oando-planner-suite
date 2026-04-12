"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Stage, Layer, Rect, Line, Transformer } from "react-konva";
import type Konva from "konva";
import { Button } from "@/components/ui/button";
import SaveLoadToolbar from "@/components/save-load-toolbar";
import AutoSaveIndicator from "@/components/auto-save-indicator";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useSearchParams } from "next/navigation";
import { useGetPlan, getGetPlanQueryKey } from "@workspace/api-client-react";
import { RotateCw, Copy, Trash2, Undo2, XCircle } from "lucide-react";

interface SiteDef { label: string; w: number; h: number; fill: string; kind: "rect" | "ellipse"; }
interface SiteItem { id: string; label: string; kind: "rect" | "ellipse"; x: number; y: number; width: number; height: number; fill: string; rotation: number; }

const LIBRARY: SiteDef[] = [
  { label: "Building", w: 160, h: 120, fill: "#6b7280", kind: "rect" },
  { label: "Parking Lot", w: 180, h: 100, fill: "#374151", kind: "rect" },
  { label: "Road", w: 200, h: 30, fill: "#4b5563", kind: "rect" },
  { label: "Sidewalk", w: 160, h: 16, fill: "#d1d5db", kind: "rect" },
  { label: "Tree", w: 30, h: 30, fill: "#16a34a", kind: "ellipse" },
  { label: "Garden", w: 100, h: 60, fill: "#22c55e", kind: "rect" },
  { label: "Fence", w: 140, h: 6, fill: "#78716c", kind: "rect" },
  { label: "Loading Zone", w: 120, h: 60, fill: "#f59e0b", kind: "rect" },
  { label: "Driveway", w: 60, h: 120, fill: "#9ca3af", kind: "rect" },
  { label: "Shed / Utility", w: 60, h: 50, fill: "#a16207", kind: "rect" },
  { label: "Patio / Deck", w: 100, h: 80, fill: "#d4a574", kind: "rect" },
  { label: "Fire Hydrant", w: 16, h: 16, fill: "#dc2626", kind: "ellipse" },
  { label: "Light Pole", w: 14, h: 14, fill: "#fbbf24", kind: "ellipse" },
  { label: "Dumpster", w: 40, h: 30, fill: "#065f46", kind: "rect" },
  { label: "Bollard", w: 10, h: 10, fill: "#78716c", kind: "ellipse" },
  { label: "Sign", w: 24, h: 24, fill: "#2563eb", kind: "rect" },
  { label: "Curb", w: 120, h: 6, fill: "#a3a3a3", kind: "rect" },
];

const W = 900, H = 650, GRID = 10;
let _uid = 0;

function SiteShape({ item, isSelected, onSelect, onChange }: { item: SiteItem; isSelected: boolean; onSelect: () => void; onChange: (a: Partial<SiteItem>) => void }) {
  const shapeRef = useRef<Konva.Rect>(null);
  const trRef = useRef<Konva.Transformer>(null);
  useEffect(() => { if (isSelected && trRef.current && shapeRef.current) { trRef.current.nodes([shapeRef.current]); trRef.current.getLayer()?.batchDraw(); } }, [isSelected]);

  return (
    <>
      <Rect ref={shapeRef} x={item.x} y={item.y} width={item.width} height={item.height} fill={item.fill} rotation={item.rotation}
        cornerRadius={item.kind === "ellipse" ? Math.min(item.width, item.height) / 2 : 3}
        draggable onClick={onSelect} onTap={onSelect}
        onDragEnd={(e) => onChange({ x: Math.round(e.target.x() / GRID) * GRID, y: Math.round(e.target.y() / GRID) * GRID })}
        onTransformEnd={() => { const n = shapeRef.current; if (!n) return; const sx = n.scaleX(), sy = n.scaleY(); n.scaleX(1); n.scaleY(1); onChange({ x: Math.round(n.x() / GRID) * GRID, y: Math.round(n.y() / GRID) * GRID, width: Math.max(6, Math.round(n.width() * sx)), height: Math.max(6, Math.round(n.height() * sy)), rotation: n.rotation() }); }}
        stroke={isSelected ? "hsl(221, 83%, 53%)" : "rgba(0,0,0,0.1)"} strokeWidth={isSelected ? 2 : 0.5}
        shadowColor={isSelected ? "hsl(221, 83%, 53%)" : undefined} shadowBlur={isSelected ? 6 : 0} shadowOpacity={0.25}
      />
      {isSelected && <Transformer ref={trRef} rotateEnabled enabledAnchors={["top-left","top-right","bottom-left","bottom-right","middle-left","middle-right","top-center","bottom-center"]} boundBoxFunc={(o, n) => (n.width < 6 || n.height < 6 ? o : n)} />}
    </>
  );
}

export default function SitePlan() {
  const [items, setItems] = useState<SiteItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentPlanId, setCurrentPlanId] = useState<number | null>(null);
  const [currentPlanName, setCurrentPlanName] = useState("");
  const [initialLoaded, setInitialLoaded] = useState(false);
  const stageRef = useRef<Konva.Stage>(null);

  const searchParams = useSearchParams();
  const params = searchParams;
  const planIdParam = params.get("planId") || params.get("id");
  const planId = Number(planIdParam) || 0;
  const { data: loadedPlan } = useGetPlan(planId, { query: { queryKey: getGetPlanQueryKey(planId), enabled: !!planIdParam && !initialLoaded } });
  useEffect(() => { if (loadedPlan && !initialLoaded) { try { const doc = typeof loadedPlan.documentJson === "string" ? JSON.parse(loadedPlan.documentJson) : loadedPlan.documentJson; if (doc?.items) setItems(doc.items); } catch {} setCurrentPlanId(loadedPlan.id); setCurrentPlanName(loadedPlan.name); setInitialLoaded(true); } }, [loadedPlan, initialLoaded]);

  const getCanvasState = useCallback(() => ({ items }), [items]);
  const loadCanvasState = useCallback((state: Record<string, unknown>) => { if (Array.isArray(state.items)) setItems(state.items as SiteItem[]); }, []);
  const autoSave = useAutoSave("site-plan", getCanvasState, loadCanvasState, () => items.length > 0, !!planIdParam && !initialLoaded);

  const addItem = (def: SiteDef) => { const id = `sp_${_uid++}`; setItems((p) => [...p, { id, label: def.label, kind: def.kind, x: W / 2 - def.w / 2 + (Math.random() - 0.5) * 40, y: H / 2 - def.h / 2 + (Math.random() - 0.5) * 40, width: def.w, height: def.h, fill: def.fill, rotation: 0 }]); setSelectedId(id); };
  const updateItem = (id: string, a: Partial<SiteItem>) => setItems((p) => p.map((it) => (it.id === id ? { ...it, ...a } : it)));
  const deleteSelected = () => { setItems((p) => p.filter((it) => it.id !== selectedId)); setSelectedId(null); };
  const duplicateSelected = () => { const s = items.find((i) => i.id === selectedId); if (!s) return; const id = `sp_${_uid++}`; setItems((p) => [...p, { ...s, id, x: s.x + 20, y: s.y + 20 }]); setSelectedId(id); };
  const rotateSelected = () => { const s = items.find((i) => i.id === selectedId); if (s) updateItem(s.id, { rotation: (s.rotation + 90) % 360 }); };
  const deselectAll = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => { if (e.target === e.target.getStage()) setSelectedId(null); };
  const undo = () => { setItems((p) => p.slice(0, -1)); setSelectedId(null); };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "z" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); undo(); return; }
    if (!selectedId) return;
    if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); deleteSelected(); }
    if (e.key === "d" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); duplicateSelected(); }
    if (e.key === "r") rotateSelected();
  }, [selectedId, items]);
  useEffect(() => { window.addEventListener("keydown", handleKeyDown); return () => window.removeEventListener("keydown", handleKeyDown); }, [handleKeyDown]);

  const gridLines: React.ReactElement[] = [];
  for (let x = 0; x <= W; x += GRID) gridLines.push(<Line key={`v${x}`} points={[x, 0, x, H]} stroke={x % 100 === 0 ? "#9ab07080" : "#9ab07030"} strokeWidth={x % 100 === 0 ? 0.6 : 0.3} listening={false} />);
  for (let y = 0; y <= H; y += GRID) gridLines.push(<Line key={`h${y}`} points={[0, y, W, y]} stroke={y % 100 === 0 ? "#9ab07080" : "#9ab07030"} strokeWidth={y % 100 === 0 ? 0.6 : 0.3} listening={false} />);

  const sel = items.find((i) => i.id === selectedId);

  return (
    <div className="flex flex-col h-screen font-sans">
      <div className="bg-navy-dark text-white px-3 flex items-center gap-2 text-[13px] shrink-0 h-10">
        <b className="text-[15px]">Site Plan</b>
        <span className="text-gray-600">|</span>
        <SaveLoadToolbar plannerType="oando-site-plan" moduleName="Site Plan" getCanvasState={getCanvasState} loadCanvasState={loadCanvasState} onNew={() => { setItems([]); setSelectedId(null); }} hasUnsavedChanges={() => items.length > 0} currentPlanId={currentPlanId} setCurrentPlanId={setCurrentPlanId} currentPlanName={currentPlanName} setCurrentPlanName={setCurrentPlanName} clearAutoSave={autoSave.clearAutoSave} />
        <span className="text-gray-600">|</span>
        <span className="text-gray-400">Lot: {W / 10}&apos; x {H / 10}&apos;</span>
        <span className="text-gray-400">{items.length} elements</span>
        <div className="flex-1" />
        <AutoSaveIndicator lastSaved={autoSave.lastSaved} showRecovery={autoSave.showRecovery} onAcceptRecovery={autoSave.acceptRecovery} onDismissRecovery={autoSave.dismissRecovery} />
        {sel && (
          <>
            <span className="text-gray-300 text-xs">{sel.label}</span>
            <Button variant="ghost" size="sm" onClick={rotateSelected} className="text-white hover:bg-white/10 h-7 px-2"><RotateCw className="h-3 w-3" /></Button>
            <Button variant="ghost" size="sm" onClick={duplicateSelected} className="text-white hover:bg-white/10 h-7 px-2"><Copy className="h-3 w-3" /></Button>
            <Button variant="ghost" size="sm" onClick={deleteSelected} className="text-red-400 hover:bg-red-500/20 h-7 px-2"><Trash2 className="h-3 w-3" /></Button>
            <span className="text-gray-600">|</span>
          </>
        )}
        <Button variant="ghost" size="sm" onClick={undo} className="text-white hover:bg-white/10 h-7 px-2"><Undo2 className="h-3 w-3" /></Button>
        <Button variant="ghost" size="sm" onClick={() => { setItems([]); setSelectedId(null); }} className="text-white hover:bg-white/10 h-7 px-2"><XCircle className="h-3 w-3" /></Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-[190px] bg-card border-r overflow-y-auto p-2">
          <div className="text-[11px] text-muted-foreground uppercase tracking-wider px-2 py-1.5 font-bold">Site Elements</div>
          {LIBRARY.map((def, i) => (
            <button key={i} onClick={() => addItem(def)} className="flex items-center gap-2 w-full px-2 py-1.5 border-none rounded-md bg-transparent cursor-pointer text-[13px] text-foreground text-left hover:bg-accent transition-colors">
              <span className="inline-block w-4 h-4 shrink-0" style={{ background: def.fill, borderRadius: def.kind === "ellipse" ? "50%" : 2 }} />
              <span className="font-medium">{def.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto flex justify-center items-start p-4" style={{ background: "#d8dfc4" }}>
          <div className="shadow-lg" style={{ border: "1px solid #8a9a5b", lineHeight: 0 }}>
            <Stage ref={stageRef} width={W} height={H} style={{ background: "#c8d5a0" }} onMouseDown={deselectAll} onTouchStart={deselectAll}>
              <Layer>{gridLines}</Layer>
              <Layer>
                {items.map((item) => <SiteShape key={item.id} item={item} isSelected={item.id === selectedId} onSelect={() => setSelectedId(item.id)} onChange={(a) => updateItem(item.id, a)} />)}
              </Layer>
            </Stage>
          </div>
        </div>
      </div>
    </div>
  );
}

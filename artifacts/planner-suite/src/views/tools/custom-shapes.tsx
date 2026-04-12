"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Stage, Layer, Rect, Circle, Line, Text, Group, Transformer } from "react-konva";
import type Konva from "konva";
import { useCreatePlan, useUpdatePlan, useGetPlan, getGetPlanQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useUndoRedo } from "@/hooks/use-undo-redo";
import { Save, Loader2, Undo2, Redo2, Trash2, Copy, XCircle, Grid3X3 } from "lucide-react";

interface ShapeDef {
  label: string;
  w: number;
  h: number;
  fill: string;
  kind: "rect" | "ellipse";
  details?: ShapeDetail[];
}

interface ShapeDetail {
  type: "line" | "rect" | "circle";
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  r?: number;
  points?: number[];
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  radius?: number;
}

interface CanvasItem {
  id: string;
  defLabel: string;
  kind: "rect" | "ellipse";
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  rotation: number;
  details?: ShapeDetail[];
}

const CATS: { name: string; shapes: ShapeDef[] }[] = [
  {
    name: "Walls & Structure",
    shapes: [
      { label: "Wall (H)", w: 160, h: 10, fill: "#374151", kind: "rect" },
      { label: "Door", w: 70, h: 12, fill: "#a0522d", kind: "rect", details: [
        { type: "line", points: [0, 12, 35, 0], stroke: "#6b3a1f", strokeWidth: 1.5 },
      ] },
      { label: "Window", w: 80, h: 8, fill: "#60a5fa", kind: "rect", details: [
        { type: "line", points: [0, 4, 80, 4], stroke: "#3b82f6", strokeWidth: 1 },
        { type: "line", points: [40, 0, 40, 8], stroke: "#3b82f6", strokeWidth: 1 },
      ] },
      { label: "Column", w: 24, h: 24, fill: "#6b7280", kind: "ellipse", details: [
        { type: "circle", x: 12, y: 12, r: 5, fill: "#4b5563" },
      ] },
      { label: "Stairs", w: 90, h: 50, fill: "#9ca3af", kind: "rect", details: [
        { type: "line", points: [0, 10, 90, 10], stroke: "#6b7280", strokeWidth: 0.8 },
        { type: "line", points: [0, 20, 90, 20], stroke: "#6b7280", strokeWidth: 0.8 },
        { type: "line", points: [0, 30, 90, 30], stroke: "#6b7280", strokeWidth: 0.8 },
        { type: "line", points: [0, 40, 90, 40], stroke: "#6b7280", strokeWidth: 0.8 },
      ] },
      { label: "Elevator", w: 60, h: 60, fill: "#4b5563", kind: "rect", details: [
        { type: "line", points: [0, 0, 60, 60], stroke: "#9ca3af", strokeWidth: 1 },
        { type: "line", points: [60, 0, 0, 60], stroke: "#9ca3af", strokeWidth: 1 },
      ] },
    ],
  },
  {
    name: "Office Furniture",
    shapes: [
      { label: "Desk", w: 120, h: 60, fill: "#b8860b", kind: "rect", details: [
        { type: "rect", x: 5, y: 5, w: 50, h: 35, fill: "#9a7209" },
      ] },
      { label: "Chair", w: 38, h: 38, fill: "#4a4a4a", kind: "ellipse", details: [
        { type: "circle", x: 19, y: 19, r: 8, fill: "#333" },
      ] },
      { label: "Bookshelf", w: 110, h: 28, fill: "#654321", kind: "rect", details: [
        { type: "line", points: [0, 14, 110, 14], stroke: "#4a3218", strokeWidth: 1 },
      ] },
      { label: "Monitor", w: 55, h: 12, fill: "#1f2937", kind: "rect", details: [
        { type: "rect", x: 22, y: 10, w: 11, h: 4, fill: "#374151" },
      ] },
      { label: "Printer", w: 55, h: 45, fill: "#374151", kind: "rect", details: [
        { type: "rect", x: 5, y: 5, w: 45, h: 10, fill: "#4b5563" },
      ] },
    ],
  },
  {
    name: "Reception & Lounge",
    shapes: [
      { label: "Sofa", w: 150, h: 60, fill: "#2e5090", kind: "rect", details: [
        { type: "rect", x: 5, y: 40, w: 140, h: 15, fill: "#1e3a6e" },
      ] },
      { label: "Coffee Table", w: 90, h: 55, fill: "#78350f", kind: "rect" },
      { label: "Vending Machine", w: 55, h: 45, fill: "#374151", kind: "rect", details: [
        { type: "rect", x: 5, y: 5, w: 45, h: 25, fill: "#4b5563", radius: 2 },
      ] },
    ],
  },
  {
    name: "Commercial",
    shapes: [
      { label: "Server Rack", w: 45, h: 90, fill: "#1f2937", kind: "rect", details: [
        { type: "rect", x: 3, y: 5, w: 39, h: 12, fill: "#374151" },
        { type: "rect", x: 3, y: 22, w: 39, h: 12, fill: "#374151" },
        { type: "rect", x: 3, y: 39, w: 39, h: 12, fill: "#374151" },
        { type: "circle", x: 38, y: 10, r: 2, fill: "#22c55e" },
        { type: "circle", x: 38, y: 27, r: 2, fill: "#22c55e" },
      ] },
      { label: "Safe", w: 45, h: 45, fill: "#4b5563", kind: "rect", details: [
        { type: "circle", x: 33, y: 22, r: 5, fill: "#9ca3af" },
      ] },
      { label: "Pallet Rack", w: 130, h: 45, fill: "#b45309", kind: "rect", details: [
        { type: "line", points: [0, 22, 130, 22], stroke: "#92400e", strokeWidth: 1 },
      ] },
      { label: "Loading Dock", w: 130, h: 70, fill: "#9ca3af", kind: "rect", details: [
        { type: "line", points: [65, 0, 65, 70], stroke: "#6b7280", strokeWidth: 2 },
      ] },
    ],
  },
  {
    name: "Electrical & Safety",
    shapes: [
      { label: "Outlet", w: 16, h: 16, fill: "#eab308", kind: "ellipse", details: [
        { type: "rect", x: 5, y: 6, w: 3, h: 4, fill: "#854d0e" },
        { type: "rect", x: 10, y: 6, w: 3, h: 4, fill: "#854d0e" },
      ] },
      { label: "HVAC Unit", w: 65, h: 65, fill: "#6366f1", kind: "rect", details: [
        { type: "circle", x: 32, y: 32, r: 18, fill: "#4f46e5" },
        { type: "line", points: [32, 14, 32, 50], stroke: "#818cf8", strokeWidth: 1 },
        { type: "line", points: [14, 32, 50, 32], stroke: "#818cf8", strokeWidth: 1 },
      ] },
      { label: "Fire Panel", w: 35, h: 35, fill: "#dc2626", kind: "rect", details: [
        { type: "circle", x: 17, y: 17, r: 8, fill: "#b91c1c" },
      ] },
      { label: "Exit Sign", w: 35, h: 20, fill: "#16a34a", kind: "rect" },
      { label: "Sprinkler", w: 14, h: 14, fill: "#0ea5e9", kind: "ellipse", details: [
        { type: "circle", x: 7, y: 7, r: 3, fill: "#0284c7" },
      ] },
    ],
  },
];

const W = 900;
const H = 640;
const GRID = 10;
let _uid = Date.now();

function CanvasShape({
  item, isSelected, onSelect, onChange,
}: {
  item: CanvasItem;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (attrs: Partial<CanvasItem>) => void;
}) {
  const groupRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onChange({
      x: Math.round(e.target.x() / GRID) * GRID,
      y: Math.round(e.target.y() / GRID) * GRID,
    });
  };

  const handleTransformEnd = () => {
    const node = groupRef.current;
    if (!node) return;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    onChange({
      x: Math.round(node.x() / GRID) * GRID,
      y: Math.round(node.y() / GRID) * GRID,
      width: Math.max(5, Math.round(item.width * scaleX)),
      height: Math.max(5, Math.round(item.height * scaleY)),
      rotation: node.rotation(),
    });
  };

  const labelFontSize = Math.min(11, Math.max(7, Math.min(item.width, item.height) * 0.3));
  const showLabel = item.width >= 20 && item.height >= 14;

  return (
    <>
      <Group
        ref={groupRef}
        x={item.x}
        y={item.y}
        width={item.width}
        height={item.height}
        rotation={item.rotation}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        {item.kind === "ellipse" ? (
          <Circle
            x={item.width / 2}
            y={item.height / 2}
            radius={item.width / 2}
            fill={item.fill}
            stroke={isSelected ? "#3478f6" : "rgba(0,0,0,0.15)"}
            strokeWidth={isSelected ? 2 : 0.5}
            shadowColor={isSelected ? "#3478f6" : undefined}
            shadowBlur={isSelected ? 6 : 0}
            shadowOpacity={isSelected ? 0.3 : 0}
          />
        ) : (
          <Rect
            width={item.width}
            height={item.height}
            fill={item.fill}
            stroke={isSelected ? "#3478f6" : "rgba(0,0,0,0.15)"}
            strokeWidth={isSelected ? 2 : 0.5}
            shadowColor={isSelected ? "#3478f6" : undefined}
            shadowBlur={isSelected ? 6 : 0}
            shadowOpacity={isSelected ? 0.3 : 0}
            cornerRadius={2}
          />
        )}
        {item.details?.map((d, i) => {
          if (d.type === "line") {
            return <Line key={i} points={d.points} stroke={d.stroke || "#333"} strokeWidth={d.strokeWidth || 1} />;
          }
          if (d.type === "rect") {
            return <Rect key={i} x={d.x} y={d.y} width={d.w} height={d.h} fill={d.fill || "#555"} cornerRadius={d.radius || 0} />;
          }
          if (d.type === "circle") {
            return <Circle key={i} x={d.x} y={d.y} radius={d.r || 4} fill={d.fill || "#555"} />;
          }
          return null;
        })}
        {showLabel && (
          <Text
            x={2}
            y={item.kind === "ellipse" ? item.height / 2 - labelFontSize / 2 : item.height - labelFontSize - 2}
            width={item.width - 4}
            text={item.defLabel}
            fontSize={labelFontSize}
            fill={isLightColor(item.fill) ? "#333" : "#fff"}
            align="center"
            listening={false}
          />
        )}
      </Group>
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled
          enabledAnchors={[
            "top-left","top-right","bottom-left","bottom-right",
            "middle-left","middle-right","top-center","bottom-center",
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
}

function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "");
  if (c.length !== 6) return true;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

export default function CustomShapes() {
  const searchParams = new URLSearchParams(window.location.search);
  const initialPlanId = searchParams.get("id") ? Number(searchParams.get("id")) : null;
  const [currentPlanId, setCurrentPlanId] = useState<number | null>(initialPlanId);
  const planId = currentPlanId;

  const [catIdx, setCatIdx] = useState(0);
  const { current: items, set: setItems, undo, redo, canUndo, canRedo, reset: resetItems } = useUndoRedo<CanvasItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [planName, setPlanName] = useState("New Shape Layout");
  const stageRef = useRef<Konva.Stage>(null);

  const { data: existingPlan } = useGetPlan(planId || 0, { query: { queryKey: getGetPlanQueryKey(planId || 0), enabled: !!planId } });
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const { toast } = useToast();

  useEffect(() => {
    if (existingPlan) {
      setPlanName(existingPlan.name);
      if (existingPlan.documentJson) {
        try {
          const doc = typeof existingPlan.documentJson === "string"
            ? JSON.parse(existingPlan.documentJson)
            : existingPlan.documentJson;
          if (doc.items) resetItems(doc.items);
        } catch { /* ignore parse errors */ }
      }
    }
  }, [existingPlan, resetItems]);

  const addShape = (def: ShapeDef) => {
    const id = `item_${_uid++}`;
    setItems((prev) => [
      ...prev,
      {
        id,
        defLabel: def.label,
        kind: def.kind,
        x: W / 2 - def.w / 2 + (Math.random() - 0.5) * 40,
        y: H / 2 - def.h / 2 + (Math.random() - 0.5) * 40,
        width: def.w,
        height: def.h,
        fill: def.fill,
        rotation: 0,
        details: def.details,
      },
    ]);
    setSelectedId(id);
  };

  const updateItem = (id: string, attrs: Partial<CanvasItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...attrs } : it)));
  };

  const deleteSelected = useCallback(() => {
    setItems((prev) => prev.filter((it) => it.id !== selectedId));
    setSelectedId(null);
  }, [selectedId, setItems]);

  const duplicateSelected = useCallback(() => {
    setItems((prev) => {
      const src = prev.find((it) => it.id === selectedId);
      if (!src) return prev;
      const id = `item_${_uid++}`;
      setSelectedId(id);
      return [...prev, { ...src, id, x: src.x + 20, y: src.y + 20 }];
    });
  }, [selectedId, setItems]);

  const deselectAll = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (e.target === e.target.getStage()) setSelectedId(null);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") return;
    if (e.key === "z" && (e.ctrlKey || e.metaKey) && !e.shiftKey) { e.preventDefault(); undo(); return; }
    if ((e.key === "y" && (e.ctrlKey || e.metaKey)) || (e.key === "z" && (e.ctrlKey || e.metaKey) && e.shiftKey)) { e.preventDefault(); redo(); return; }
    if (!selectedId) return;
    if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); deleteSelected(); }
    if (e.key === "d" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); duplicateSelected(); }
  }, [selectedId, deleteSelected, duplicateSelected, undo, redo]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleSave = () => {
    const documentJson = JSON.stringify({ items });
    const payload = {
      name: planName,
      roomWidthCm: W,
      roomDepthCm: H,
      plannerType: "shapes" as any,
      documentJson,
    };

    if (planId) {
      updatePlan.mutate({ id: planId, data: payload }, {
        onSuccess: () => toast({ title: "Shape layout updated" }),
      });
    } else {
      createPlan.mutate({ data: payload }, {
        onSuccess: (data) => {
          toast({ title: "Shape layout saved" });
          setCurrentPlanId(data.id);
          window.history.replaceState(null, "", `?id=${data.id}`);
        },
      });
    }
  };

  const gridLines: React.ReactElement[] = [];
  for (let x = 0; x <= W; x += GRID)
    gridLines.push(<Line key={`gv${x}`} points={[x, 0, x, H]} stroke={x % 100 === 0 ? "#d4d4d4" : "#eeeeee"} strokeWidth={x % 100 === 0 ? 0.6 : 0.3} listening={false} />);
  for (let y = 0; y <= H; y += GRID)
    gridLines.push(<Line key={`gh${y}`} points={[0, y, W, y]} stroke={y % 100 === 0 ? "#d4d4d4" : "#eeeeee"} strokeWidth={y % 100 === 0 ? 0.6 : 0.3} listening={false} />);

  const sel = items.find((it) => it.id === selectedId);

  return (
    <div className="h-full flex flex-col bg-background">
      <header className="h-14 border-b flex items-center justify-between px-4 shrink-0 bg-card">
        <div className="flex items-center gap-4">
          <Grid3X3 className="w-5 h-5 text-primary" />
          <Input
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            className="w-64 font-medium border-transparent hover:border-input focus:border-input bg-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{items.length} on canvas</span>
          <Button size="sm" onClick={handleSave} disabled={createPlan.isPending || updatePlan.isPending}>
            {(createPlan.isPending || updatePlan.isPending) ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Plan
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-56 border-r flex flex-col bg-card shrink-0">
          <div className="p-2 border-b">
            {CATS.map((c, i) => (
              <button
                key={c.name}
                onClick={() => setCatIdx(i)}
                className={`block w-full text-left px-3 py-1.5 text-sm font-semibold rounded-md mb-0.5 transition-colors ${
                  catIdx === i ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1">Click to place</div>
              {CATS[catIdx].shapes.map((def, i) => (
                <button
                  key={i}
                  onClick={() => addShape(def)}
                  className="flex items-center gap-2 w-full p-2 rounded-md text-sm text-left hover:bg-muted transition-colors"
                >
                  <span
                    className="shrink-0"
                    style={{
                      display: "inline-block",
                      width: Math.max(10, Math.min(def.w * 0.22, 26)),
                      height: Math.max(10, Math.min(def.h * 0.22, 26)),
                      background: def.fill,
                      borderRadius: def.kind === "ellipse" ? "50%" : 2,
                    }}
                  />
                  <span>
                    <span className="block font-medium leading-tight">{def.label}</span>
                    <span className="block text-[10px] text-muted-foreground">{def.w}x{def.h}px</span>
                  </span>
                </button>
              ))}
            </div>
          </ScrollArea>

          <div className="p-2 border-t space-y-1">
            {sel && (
              <>
                <div className="text-xs text-muted-foreground px-2 py-1">{sel.defLabel} - {Math.round(sel.width)}x{Math.round(sel.height)}</div>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={duplicateSelected}>
                  <Copy className="w-3 h-3" /> Duplicate
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-destructive" onClick={deleteSelected}>
                  <Trash2 className="w-3 h-3" /> Delete
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={undo} disabled={!canUndo}>
              <Undo2 className="w-3 h-3" /> Undo
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={redo} disabled={!canRedo}>
              <Redo2 className="w-3 h-3" /> Redo
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => { resetItems([]); setSelectedId(null); }}>
              <XCircle className="w-3 h-3" /> Clear All
            </Button>
          </div>
        </div>

        <div className="flex-1 bg-muted/30 relative flex items-center justify-center p-4 overflow-auto">
          <div className="shadow-lg border rounded-lg overflow-hidden bg-card">
            <Stage
              ref={stageRef}
              width={W}
              height={H}
              style={{ background: "#fff" }}
              onMouseDown={deselectAll}
              onTouchStart={deselectAll}
            >
              <Layer>{gridLines}</Layer>
              <Layer>
                {items.map((item) => (
                  <CanvasShape
                    key={item.id}
                    item={item}
                    isSelected={item.id === selectedId}
                    onSelect={() => setSelectedId(item.id)}
                    onChange={(attrs) => updateItem(item.id, attrs)}
                  />
                ))}
              </Layer>
            </Stage>
          </div>
        </div>

        <div className="w-56 border-l bg-card shrink-0 flex flex-col">
          <div className="p-3 border-b">
            <h3 className="font-medium text-sm">Placed Items ({items.length})</h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-1">
              {items.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center p-4">No shapes placed</div>
              ) : (
                items.map((it) => (
                  <div
                    key={it.id}
                    className={`text-sm p-2 rounded border cursor-pointer transition-colors ${
                      selectedId === it.id ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted"
                    }`}
                    onClick={() => setSelectedId(it.id)}
                  >
                    <div className="font-medium">{it.defLabel}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-1">
                      {Math.round(it.width)}x{Math.round(it.height)} R:{Math.round(it.rotation)}°
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

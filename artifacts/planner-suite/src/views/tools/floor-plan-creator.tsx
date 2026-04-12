"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Stage, Layer, Rect, Line, Text, Transformer } from "react-konva";
import type Konva from "konva";
import { useCreatePlan, useUpdatePlan, useGetPlan, getGetPlanQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useUndoRedo } from "@/hooks/use-undo-redo";
import { Save, Loader2, Undo2, Redo2, Trash2, Copy, XCircle, Grid3X3 } from "lucide-react";

interface RoomPreset {
  label: string;
  w: number;
  h: number;
  fill: string;
}

interface RoomItem {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  rotation: number;
}

const PRESETS: RoomPreset[] = [
  { label: "Open Office", w: 240, h: 200, fill: "#dbeafe" },
  { label: "Private Office", w: 120, h: 100, fill: "#e0e7ff" },
  { label: "Conference Room", w: 200, h: 160, fill: "#fef3c7" },
  { label: "Break Room", w: 140, h: 120, fill: "#dcfce7" },
  { label: "Restroom", w: 80, h: 80, fill: "#cffafe" },
  { label: "Server Room", w: 100, h: 80, fill: "#e5e7eb" },
  { label: "Reception", w: 200, h: 100, fill: "#f3e8ff" },
  { label: "Training Room", w: 180, h: 140, fill: "#ede9fe" },
  { label: "Storage", w: 80, h: 80, fill: "#fce7f3" },
  { label: "Hallway", w: 40, h: 200, fill: "#f1f5f9" },
  { label: "Kitchen", w: 140, h: 100, fill: "#fef9c3" },
  { label: "Board Room", w: 220, h: 160, fill: "#ffedd5" },
];

const W = 900;
const H = 650;
const GRID = 20;
let _uid = Date.now();

function RoomShape({
  item, isSelected, showDims, onSelect, onChange,
}: {
  item: RoomItem;
  isSelected: boolean;
  showDims: boolean;
  onSelect: () => void;
  onChange: (a: Partial<RoomItem>) => void;
}) {
  const shapeRef = useRef<Konva.Rect>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const onDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onChange({ x: Math.round(e.target.x() / GRID) * GRID, y: Math.round(e.target.y() / GRID) * GRID });
  };

  const onTransformEnd = () => {
    const n = shapeRef.current;
    if (!n) return;
    const sx = n.scaleX(), sy = n.scaleY();
    n.scaleX(1); n.scaleY(1);
    onChange({
      x: Math.round(n.x() / GRID) * GRID,
      y: Math.round(n.y() / GRID) * GRID,
      width: Math.max(GRID, Math.round((n.width() * sx) / GRID) * GRID),
      height: Math.max(GRID, Math.round((n.height() * sy) / GRID) * GRID),
      rotation: n.rotation(),
    });
  };

  const ftW = Math.round(item.width / GRID);
  const ftH = Math.round(item.height / GRID);
  const sqFt = ftW * ftH;

  return (
    <>
      <Rect
        ref={shapeRef}
        x={item.x} y={item.y} width={item.width} height={item.height}
        fill={item.fill} rotation={item.rotation}
        stroke={isSelected ? "#3478f6" : "#9ca3af"} strokeWidth={isSelected ? 2.5 : 1.5}
        draggable onClick={onSelect} onTap={onSelect}
        onDragEnd={onDragEnd} onTransformEnd={onTransformEnd}
        shadowColor={isSelected ? "#3478f6" : undefined} shadowBlur={isSelected ? 8 : 0} shadowOpacity={0.3}
      />
      <Text
        x={item.x + 6} y={item.y + 6}
        text={item.label}
        fontSize={13} fontStyle="bold" fill="#111"
        listening={false} rotation={item.rotation}
      />
      {showDims && (
        <Text
          x={item.x + 6} y={item.y + 22}
          text={`${ftW}' × ${ftH}' (${sqFt} sq ft)`}
          fontSize={11} fill="#666"
          listening={false} rotation={item.rotation}
        />
      )}
      {isSelected && (
        <Transformer ref={trRef} rotateEnabled
          enabledAnchors={["top-left","top-right","bottom-left","bottom-right","middle-left","middle-right","top-center","bottom-center"]}
          boundBoxFunc={(o, n) => (n.width < GRID || n.height < GRID ? o : n)} />
      )}
    </>
  );
}

export default function FloorPlanCreator() {
  const searchParams = new URLSearchParams(window.location.search);
  const initialPlanId = searchParams.get("id") ? Number(searchParams.get("id")) : null;
  const [currentPlanId, setCurrentPlanId] = useState<number | null>(initialPlanId);
  const planId = currentPlanId;

  const { current: rooms, set: setRooms, undo, redo, canUndo, canRedo, reset: resetRooms } = useUndoRedo<RoomItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDims, setShowDims] = useState(true);
  const [planName, setPlanName] = useState("New Floor Plan");
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
          if (doc.rooms) resetRooms(doc.rooms);
        } catch { /* ignore parse errors */ }
      }
    }
  }, [existingPlan, resetRooms]);

  const totalSqFt = rooms.reduce((s, r) => s + Math.round(r.width / GRID) * Math.round(r.height / GRID), 0);

  const addRoom = (preset: RoomPreset) => {
    const id = `rm_${_uid++}`;
    setRooms((p) => [...p, { id, label: preset.label, x: 300 + Math.random() * 80, y: 200 + Math.random() * 80, width: preset.w, height: preset.h, fill: preset.fill, rotation: 0 }]);
    setSelectedId(id);
  };

  const updateRoom = (id: string, a: Partial<RoomItem>) => setRooms((p) => p.map((r) => (r.id === id ? { ...r, ...a } : r)));

  const deleteSelected = useCallback(() => {
    setRooms((p) => p.filter((r) => r.id !== selectedId));
    setSelectedId(null);
  }, [selectedId, setRooms]);

  const duplicateSelected = useCallback(() => {
    setRooms((prev) => {
      const s = prev.find((r) => r.id === selectedId);
      if (!s) return prev;
      const id = `rm_${_uid++}`;
      setSelectedId(id);
      return [...prev, { ...s, id, x: s.x + 30, y: s.y + 30 }];
    });
  }, [selectedId, setRooms]);

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
    const documentJson = JSON.stringify({ rooms });
    const payload = {
      name: planName,
      roomWidthCm: W,
      roomDepthCm: H,
      plannerType: "floorplan" as any,
      documentJson,
    };

    if (planId) {
      updatePlan.mutate({ id: planId, data: payload }, {
        onSuccess: () => toast({ title: "Floor plan updated" }),
      });
    } else {
      createPlan.mutate({ data: payload }, {
        onSuccess: (data) => {
          toast({ title: "Floor plan saved" });
          setCurrentPlanId(data.id);
          window.history.replaceState(null, "", `?id=${data.id}`);
        },
      });
    }
  };

  const gridLines: React.ReactElement[] = [];
  for (let x = 0; x <= W; x += GRID)
    gridLines.push(<Line key={`v${x}`} points={[x, 0, x, H]} stroke={x % 100 === 0 ? "#d4d4d4" : "#eee"} strokeWidth={x % 100 === 0 ? 0.6 : 0.3} listening={false} />);
  for (let y = 0; y <= H; y += GRID)
    gridLines.push(<Line key={`h${y}`} points={[0, y, W, y]} stroke={y % 100 === 0 ? "#d4d4d4" : "#eee"} strokeWidth={y % 100 === 0 ? 0.6 : 0.3} listening={false} />);

  const sel = rooms.find((r) => r.id === selectedId);

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
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Rooms: {rooms.length}</span>
          <span className="text-xs text-muted-foreground">Total: {totalSqFt} sq ft</span>
          <label className="flex items-center gap-1.5 text-xs cursor-pointer text-muted-foreground">
            <input type="checkbox" checked={showDims} onChange={(e) => setShowDims(e.target.checked)} className="rounded" />
            Dimensions
          </label>
          <Button size="sm" onClick={handleSave} disabled={createPlan.isPending || updatePlan.isPending}>
            {(createPlan.isPending || updatePlan.isPending) ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Plan
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-60 border-r flex flex-col bg-card shrink-0">
          <div className="p-3 border-b">
            <h3 className="font-medium text-xs uppercase tracking-wider text-muted-foreground mb-2">Add Room</h3>
            <ScrollArea className="h-[280px]">
              <div className="space-y-1 pr-2">
                {PRESETS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => addRoom(p)}
                    className="flex items-center gap-2 w-full p-2 rounded-md text-sm text-left hover:bg-muted transition-colors"
                  >
                    <span className="w-4 h-4 rounded-sm border shrink-0" style={{ background: p.fill }} />
                    <span className="font-medium">{p.label}</span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="p-3 space-y-1">
            <h3 className="font-medium text-xs uppercase tracking-wider text-muted-foreground mb-2">Actions</h3>
            {sel && (
              <>
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
            <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => { resetRooms([]); setSelectedId(null); }}>
              <XCircle className="w-3 h-3" /> Clear All
            </Button>
          </div>
        </div>

        <div className="flex-1 bg-muted/30 relative flex items-center justify-center p-4 overflow-auto">
          <div className="shadow-lg border rounded-lg overflow-hidden bg-card">
            <Stage ref={stageRef} width={W} height={H} style={{ background: "#fff" }}
              onMouseDown={deselectAll} onTouchStart={deselectAll}>
              <Layer>{gridLines}</Layer>
              <Layer>
                {rooms.map((r) => (
                  <RoomShape key={r.id} item={r} isSelected={r.id === selectedId} showDims={showDims}
                    onSelect={() => setSelectedId(r.id)}
                    onChange={(a) => updateRoom(r.id, a)} />
                ))}
              </Layer>
            </Stage>
          </div>
        </div>

        <div className="w-56 border-l bg-card shrink-0 flex flex-col">
          {sel && (
            <div className="p-3 border-b space-y-3">
              <h3 className="font-medium text-xs uppercase tracking-wider text-muted-foreground">Room Properties</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-muted-foreground">Label</span>
                  <Input value={sel.label} onChange={(e) => updateRoom(sel.id, { label: e.target.value })} className="h-8 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-xs text-muted-foreground">Width (ft)</span>
                    <Input type="number" value={Math.round(sel.width / GRID)}
                      onChange={(e) => updateRoom(sel.id, { width: Math.max(GRID, +e.target.value * GRID) })}
                      className="h-8 text-sm" />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Height (ft)</span>
                    <Input type="number" value={Math.round(sel.height / GRID)}
                      onChange={(e) => updateRoom(sel.id, { height: Math.max(GRID, +e.target.value * GRID) })}
                      className="h-8 text-sm" />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {Math.round(sel.width / GRID) * Math.round(sel.height / GRID)} sq ft
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Color</span>
                  <Input type="color" value={sel.fill} onChange={(e) => updateRoom(sel.id, { fill: e.target.value })}
                    className="w-full h-8 p-0 border border-input rounded-md cursor-pointer" />
                </div>
              </div>
            </div>
          )}
          <div className="p-3 border-b">
            <h3 className="font-medium text-sm">Rooms ({rooms.length})</h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-1">
              {rooms.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center p-4">No rooms added</div>
              ) : (
                rooms.map((r) => (
                  <div
                    key={r.id}
                    className={`text-sm p-2 rounded border cursor-pointer transition-colors ${
                      selectedId === r.id ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted"
                    }`}
                    onClick={() => setSelectedId(r.id)}
                  >
                    <div className="font-medium">{r.label}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-1">
                      {Math.round(r.width / GRID)}' x {Math.round(r.height / GRID)}' ({Math.round(r.width / GRID) * Math.round(r.height / GRID)} sq ft)
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

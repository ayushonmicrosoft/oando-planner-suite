"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Stage, Layer, Rect, Circle, Ellipse, Line, Text, Transformer } from "react-konva";
import type Konva from "konva";
import { useCreatePlan, useUpdatePlan, useGetPlan, getGetPlanQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useUndoRedo } from "@/hooks/use-undo-redo";
import {
  Save, Loader2, MousePointer2, Minus, Square, CircleIcon, Type,
  Ruler, Undo2, Redo2, Trash2, Copy, XCircle, Grid3X3, PencilRuler
} from "lucide-react";
import { PlannerBreadcrumb } from "@/components/planner/PlannerBreadcrumb";
import { PlanBackgroundLayers } from "@/components/plan-background-layers";
import {
  migrateDocument,
  createEmptyDocument,
  type UnifiedDocument,
  getCompletedSteps,
} from "@/lib/unified-document";

type ToolId = "select" | "line" | "rect" | "circle" | "measure" | "text";

interface DrawnShape {
  id: string;
  tool: "line" | "rect" | "circle" | "text";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  stroke: string;
  strokeWidth: number;
  fill: string;
  text?: string;
  points?: number[];
}

const W = 960;
const H = 660;
const GRID = 10;
let _uid = Date.now();

function CadShape({
  shape, isSelected, tool, onSelect, onChange,
}: {
  shape: DrawnShape;
  isSelected: boolean;
  tool: ToolId;
  onSelect: () => void;
  onChange: (a: Partial<DrawnShape>) => void;
}) {
  const lineRef = useRef<Konva.Line>(null);
  const rectRef = useRef<Konva.Rect>(null);
  const ellipseRef = useRef<Konva.Ellipse>(null);
  const textRef = useRef<Konva.Text>(null);
  const trRef = useRef<Konva.Transformer>(null);

  const getActiveNode = (): Konva.Node | null => {
    if (shape.tool === "line") return lineRef.current;
    if (shape.tool === "circle") return ellipseRef.current;
    if (shape.tool === "text") return textRef.current;
    return rectRef.current;
  };

  useEffect(() => {
    const node = getActiveNode();
    if (isSelected && trRef.current && node) {
      trRef.current.nodes([node]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, shape.tool]);

  const onDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onChange({ x: Math.round(e.target.x() / GRID) * GRID, y: Math.round(e.target.y() / GRID) * GRID });
  };

  const onTransformEnd = () => {
    const n = getActiveNode();
    if (!n) return;
    const sx = n.scaleX(), sy = n.scaleY();
    n.scaleX(1); n.scaleY(1);
    onChange({
      x: Math.round(n.x() / GRID) * GRID,
      y: Math.round(n.y() / GRID) * GRID,
      width: Math.max(2, Math.round(n.width() * sx)),
      height: Math.max(2, Math.round(n.height() * sy)),
      rotation: n.rotation(),
    });
  };

  const draggable = tool === "select";
  const common = { draggable, onClick: onSelect, onTap: onSelect, onDragEnd, onTransformEnd };

  let node: React.ReactElement;

  if (shape.tool === "line") {
    const pts = shape.points || [0, 0, shape.width, shape.height];
    node = (
      <Line ref={lineRef} x={shape.x} y={shape.y} points={pts}
        stroke={shape.stroke} strokeWidth={shape.strokeWidth}
        hitStrokeWidth={12} rotation={shape.rotation} {...common} />
    );
  } else if (shape.tool === "circle") {
    node = (
      <Ellipse ref={ellipseRef} x={shape.x + shape.width / 2} y={shape.y + shape.height / 2}
        radiusX={Math.abs(shape.width) / 2} radiusY={Math.abs(shape.height) / 2}
        stroke={shape.stroke} strokeWidth={shape.strokeWidth}
        fill={shape.fill}
        rotation={shape.rotation} {...common}
        onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {
          const nx = Math.round((e.target.x() - shape.width / 2) / GRID) * GRID;
          const ny = Math.round((e.target.y() - shape.height / 2) / GRID) * GRID;
          onChange({ x: nx, y: ny });
        }}
        onTransformEnd={() => {
          const n = ellipseRef.current;
          if (!n) return;
          const sx = n.scaleX(), sy = n.scaleY();
          n.scaleX(1); n.scaleY(1);
          const rx = n.radiusX() * sx;
          const ry = n.radiusY() * sy;
          onChange({
            x: Math.round((n.x() - rx) / GRID) * GRID,
            y: Math.round((n.y() - ry) / GRID) * GRID,
            width: Math.max(2, Math.round(rx * 2)),
            height: Math.max(2, Math.round(ry * 2)),
            rotation: n.rotation(),
          });
        }}
      />
    );
  } else if (shape.tool === "text") {
    node = (
      <Text ref={textRef} x={shape.x} y={shape.y}
        text={shape.text || "Text"} fontSize={16} fill={shape.stroke}
        rotation={shape.rotation} {...common} />
    );
  } else {
    node = (
      <Rect ref={rectRef} x={shape.x} y={shape.y}
        width={shape.width} height={shape.height}
        stroke={shape.stroke} strokeWidth={shape.strokeWidth}
        fill={shape.fill} rotation={shape.rotation} {...common} />
    );
  }

  return (
    <>
      {node}
      {isSelected && tool === "select" && (
        <Transformer ref={trRef} rotateEnabled
          enabledAnchors={["top-left","top-right","bottom-left","bottom-right","middle-left","middle-right","top-center","bottom-center"]}
          boundBoxFunc={(o, n) => (Math.abs(n.width) < 2 || Math.abs(n.height) < 2 ? o : n)} />
      )}
    </>
  );
}

export default function CadDrawing() {
  const searchParams = new URLSearchParams(window.location.search);
  const initialPlanId = searchParams.get("id") ? Number(searchParams.get("id")) : null;
  const [currentPlanId, setCurrentPlanId] = useState<number | null>(initialPlanId);
  const planId = currentPlanId;

  const { current: shapes, set: setShapes, undo, redo, canUndo, canRedo, reset: resetShapes } = useUndoRedo<DrawnShape[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<ToolId>("line");
  const [strokeColor, setStrokeColor] = useState("#333333");
  const [fillColor, setFillColor] = useState("transparent");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [showGrid, setShowGrid] = useState(true);
  const [drawing, setDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawCurrent, setDrawCurrent] = useState<{ x: number; y: number } | null>(null);
  const [measureLine, setMeasureLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [planName, setPlanName] = useState("New CAD Drawing");
  const [pendingText, setPendingText] = useState<{ x: number; y: number; value: string } | null>(null);
  const [unifiedDoc, setUnifiedDoc] = useState<UnifiedDocument>(createEmptyDocument());
  const stageRef = useRef<Konva.Stage>(null);
  const pendingTextRef = useRef<HTMLInputElement>(null);

  const { data: existingPlan } = useGetPlan(planId || 0, { query: { queryKey: getGetPlanQueryKey(planId || 0), enabled: !!planId } });
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const { toast } = useToast();

  useEffect(() => {
    if (existingPlan) {
      setPlanName(existingPlan.name);
      if (existingPlan.documentJson) {
        const doc = migrateDocument(existingPlan.documentJson);
        setUnifiedDoc(doc);
        if (doc.annotations.length > 0) {
          resetShapes(doc.annotations as unknown as DrawnShape[]);
        } else {
          try {
            const raw = typeof existingPlan.documentJson === "string"
              ? JSON.parse(existingPlan.documentJson)
              : existingPlan.documentJson;
            if (raw.shapes) resetShapes(raw.shapes);
          } catch {}
        }
      }
    }
  }, [existingPlan, resetShapes]);

  const snap = (v: number) => Math.round(v / GRID) * GRID;

  const getPos = (): { x: number; y: number } => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const p = stage.getPointerPosition();
    if (!p) return { x: 0, y: 0 };
    return { x: snap(p.x), y: snap(p.y) };
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (tool === "select") {
      if (e.target === e.target.getStage()) setSelectedId(null);
      return;
    }
    if (tool === "text") {
      const pos = getPos();
      setPendingText({ x: pos.x, y: pos.y, value: "Label" });
      setTimeout(() => pendingTextRef.current?.focus(), 50);
      return;
    }
    const pos = getPos();
    setDrawing(true);
    setDrawStart(pos);
    setDrawCurrent(pos);
  };

  const handleMouseMove = () => {
    if (!drawing) return;
    setDrawCurrent(getPos());
  };

  const handleMouseUp = () => {
    if (!drawing || !drawStart || !drawCurrent) return;
    const dx = drawCurrent.x - drawStart.x;
    const dy = drawCurrent.y - drawStart.y;
    setDrawing(false);

    if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
      setDrawStart(null);
      setDrawCurrent(null);
      return;
    }

    if (tool === "measure") {
      setMeasureLine({ x1: drawStart.x, y1: drawStart.y, x2: drawCurrent.x, y2: drawCurrent.y });
      setDrawStart(null);
      setDrawCurrent(null);
      return;
    }

    const id = `cad_${_uid++}`;
    let shape: DrawnShape;

    if (tool === "line") {
      shape = { id, tool: "line", x: drawStart.x, y: drawStart.y, width: dx, height: dy, rotation: 0, stroke: strokeColor, strokeWidth, fill: fillColor, points: [0, 0, dx, dy] };
    } else if (tool === "rect") {
      const x = dx < 0 ? drawStart.x + dx : drawStart.x;
      const y = dy < 0 ? drawStart.y + dy : drawStart.y;
      shape = { id, tool: "rect", x, y, width: Math.abs(dx), height: Math.abs(dy), rotation: 0, stroke: strokeColor, strokeWidth, fill: fillColor };
    } else {
      const x = dx < 0 ? drawStart.x + dx : drawStart.x;
      const y = dy < 0 ? drawStart.y + dy : drawStart.y;
      shape = { id, tool: "circle", x, y, width: Math.abs(dx), height: Math.abs(dy), rotation: 0, stroke: strokeColor, strokeWidth, fill: fillColor };
    }

    setShapes((p) => [...p, shape]);
    setSelectedId(id);
    setDrawStart(null);
    setDrawCurrent(null);
  };

  const deleteSelected = useCallback(() => {
    setShapes((p) => p.filter((s) => s.id !== selectedId));
    setSelectedId(null);
  }, [selectedId, setShapes]);

  const duplicateSelected = useCallback(() => {
    setShapes((prev) => {
      const s = prev.find((s) => s.id === selectedId);
      if (!s) return prev;
      const id = `cad_${_uid++}`;
      setSelectedId(id);
      return [...prev, { ...s, id, x: s.x + 20, y: s.y + 20 }];
    });
  }, [selectedId, setShapes]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") return;
    if (e.key === "Delete" || e.key === "Backspace") { if (selectedId) { e.preventDefault(); deleteSelected(); } }
    if (e.key === "d" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); duplicateSelected(); }
    if (e.key === "v") setTool("select");
    if (e.key === "l") setTool("line");
    if (e.key === "r") setTool("rect");
    if (e.key === "c") setTool("circle");
    if (e.key === "m") setTool("measure");
    if (e.key === "t") setTool("text");
    if (e.key === "z" && (e.ctrlKey || e.metaKey) && !e.shiftKey) { e.preventDefault(); undo(); }
    if ((e.key === "y" && (e.ctrlKey || e.metaKey)) || (e.key === "z" && (e.ctrlKey || e.metaKey) && e.shiftKey)) { e.preventDefault(); redo(); }
  }, [selectedId, deleteSelected, duplicateSelected, undo, redo]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const confirmPendingText = () => {
    if (!pendingText) return;
    const id = `cad_${_uid++}`;
    setShapes((p) => [...p, { id, tool: "text", x: pendingText.x, y: pendingText.y, width: 100, height: 20, rotation: 0, stroke: strokeColor, strokeWidth, fill: fillColor, text: pendingText.value || "Label" }]);
    setPendingText(null);
  };

  const cancelPendingText = () => setPendingText(null);

  const updateShape = (id: string, a: Partial<DrawnShape>) => setShapes((p) => p.map((s) => (s.id === id ? { ...s, ...a } : s)));

  const handleSave = () => {
    const updatedDoc: UnifiedDocument = {
      ...unifiedDoc,
      annotations: shapes as unknown as UnifiedDocument["annotations"],
    };
    const documentJson = JSON.stringify(updatedDoc);
    const payload = {
      name: planName,
      roomWidthCm: W,
      roomDepthCm: H,
      plannerType: "cad" as any,
      documentJson,
    };

    if (planId) {
      updatePlan.mutate({ id: planId, data: payload }, {
        onSuccess: () => toast({ title: "CAD drawing updated" }),
      });
    } else {
      createPlan.mutate({ data: payload }, {
        onSuccess: (data) => {
          toast({ title: "CAD drawing saved" });
          setCurrentPlanId(data.id);
          window.history.replaceState(null, "", `?id=${data.id}`);
        },
      });
    }
  };

  const gridLines: React.ReactElement[] = [];
  if (showGrid) {
    for (let x = 0; x <= W; x += GRID)
      gridLines.push(<Line key={`v${x}`} points={[x, 0, x, H]} stroke={x % 100 === 0 ? "#d4d4d4" : "#f0f0f0"} strokeWidth={x % 100 === 0 ? 0.8 : 0.3} listening={false} />);
    for (let y = 0; y <= H; y += GRID)
      gridLines.push(<Line key={`h${y}`} points={[0, y, W, y]} stroke={y % 100 === 0 ? "#d4d4d4" : "#f0f0f0"} strokeWidth={y % 100 === 0 ? 0.8 : 0.3} listening={false} />);
  }

  const tools: { id: ToolId; label: string; icon: React.ReactNode; key: string }[] = [
    { id: "select", label: "Select", icon: <MousePointer2 className="w-4 h-4" />, key: "V" },
    { id: "line", label: "Line", icon: <Minus className="w-4 h-4" />, key: "L" },
    { id: "rect", label: "Rectangle", icon: <Square className="w-4 h-4" />, key: "R" },
    { id: "circle", label: "Ellipse", icon: <CircleIcon className="w-4 h-4" />, key: "C" },
    { id: "text", label: "Text", icon: <Type className="w-4 h-4" />, key: "T" },
    { id: "measure", label: "Measure", icon: <Ruler className="w-4 h-4" />, key: "M" },
  ];

  const measDist = measureLine
    ? Math.sqrt(Math.pow(measureLine.x2 - measureLine.x1, 2) + Math.pow(measureLine.y2 - measureLine.y1, 2)) / GRID
    : 0;
  const drawingPreview = drawing && drawStart && drawCurrent;

  const completedSteps = getCompletedSteps(unifiedDoc);

  return (
    <div className="h-full flex flex-col bg-background">
      <PlannerBreadcrumb
        items={[{ label: "CAD Drawing" }]}
        planId={planId}
        planName={planName}
        completedSteps={completedSteps}
        icon={<PencilRuler className="w-3 h-3" />}
      />
      <header className="h-14 border-b flex items-center justify-between px-5 shrink-0 bg-card">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/5 flex items-center justify-center">
            <PencilRuler className="w-4 h-4 text-primary" strokeWidth={1.8} />
          </div>
          <div className="flex flex-col">
            <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground/50 leading-none">Drawing Tools</p>
            <Input
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="w-56 h-7 font-semibold text-sm border-transparent hover:border-input focus:border-input bg-transparent px-0 tracking-[-0.01em]"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground/50 tabular-nums">{shapes.length} objects</span>
          <Button size="sm" onClick={handleSave} disabled={createPlan.isPending || updatePlan.isPending} className="shadow-sm">
            {(createPlan.isPending || updatePlan.isPending) ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Plan
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-56 border-r flex flex-col bg-card shrink-0">
          <div className="p-3 border-b">
            <h3 className="font-medium text-[10px] uppercase tracking-[0.12em] text-muted-foreground/50 mb-2.5">Drawing Tools</h3>
            <div className="space-y-0.5">
              {tools.map((t) => (
                <Button
                  key={t.id}
                  variant={tool === t.id ? "default" : "ghost"}
                  size="sm"
                  className={`w-full justify-start gap-2.5 h-8 ${tool === t.id ? "shadow-sm" : ""}`}
                  onClick={() => { setTool(t.id); if (t.id !== "select") setSelectedId(null); }}
                >
                  {t.icon}
                  <span className="text-[13px]">{t.label}</span>
                  <span className="ml-auto text-[10px] opacity-40 font-mono">{t.key}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="p-3 border-b space-y-3">
            <h3 className="font-medium text-[10px] uppercase tracking-[0.12em] text-muted-foreground/50">Style</h3>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <span className="text-xs text-muted-foreground/60 w-12">Stroke</span>
                <Input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)}
                  className="w-8 h-8 p-0 border border-border/50 rounded-lg cursor-pointer shadow-sm" />
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs text-muted-foreground/60 w-12">Fill</span>
                <Input type="color" value={fillColor === "transparent" ? "#ffffff" : fillColor}
                  onChange={(e) => setFillColor(e.target.value)}
                  className="w-8 h-8 p-0 border border-border/50 rounded-lg cursor-pointer shadow-sm" />
                <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px] text-muted-foreground/50 hover:text-foreground"
                  onClick={() => setFillColor("transparent")}>
                  None
                </Button>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs text-muted-foreground/60 w-12">Width</span>
                <select value={strokeWidth} onChange={(e) => setStrokeWidth(+e.target.value)}
                  className="flex h-8 rounded-lg border border-border/50 bg-transparent px-2 text-xs shadow-sm">
                  {[1, 2, 3, 5, 8].map((w) => <option key={w} value={w}>{w}px</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="p-3 border-b">
            <label className="flex items-center gap-2.5 text-[13px] cursor-pointer text-muted-foreground/60 hover:text-foreground transition-colors">
              <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)}
                className="rounded border-border/50" />
              <Grid3X3 className="w-3.5 h-3.5" />
              Show Grid
            </label>
          </div>

          <div className="p-3 space-y-1">
            <h3 className="font-medium text-[10px] uppercase tracking-[0.12em] text-muted-foreground/50 mb-2.5">Actions</h3>
            {selectedId && tool === "select" && (
              <>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2.5 border-border/50 shadow-sm" onClick={duplicateSelected}>
                  <Copy className="w-3.5 h-3.5" /> Duplicate
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2.5 text-destructive border-border/50 shadow-sm" onClick={deleteSelected}>
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" className="w-full justify-start gap-2.5 border-border/50 shadow-sm" onClick={undo} disabled={!canUndo}>
              <Undo2 className="w-3.5 h-3.5" /> Undo
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start gap-2.5 border-border/50 shadow-sm" onClick={redo} disabled={!canRedo}>
              <Redo2 className="w-3.5 h-3.5" /> Redo
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start gap-2.5 border-border/50 shadow-sm" onClick={() => { resetShapes([]); setSelectedId(null); setMeasureLine(null); }}>
              <XCircle className="w-3.5 h-3.5" /> Clear All
            </Button>
          </div>

          {measureLine && (
            <div className="p-3 border-t">
              <div className="rounded-xl bg-blue-500/[0.06] border border-blue-200/50 p-3">
                <div className="text-[10px] font-medium uppercase tracking-wider text-blue-600/70">Measurement</div>
                <div className="text-xl font-bold text-blue-700 mt-0.5 tabular-nums">{measDist.toFixed(1)} cm</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 bg-muted/20 relative flex items-center justify-center p-6 overflow-auto">
          <div className="shadow-xl shadow-black/[0.06] border border-border/60 rounded-xl overflow-hidden bg-card relative">
            <Stage ref={stageRef} width={W} height={H}
              style={{ background: "#fff", cursor: tool === "select" ? "default" : "crosshair" }}
              onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
              <Layer>{gridLines}</Layer>
              <Layer>
                <PlanBackgroundLayers rooms={unifiedDoc.rooms} structure={unifiedDoc.structure} site={unifiedDoc.site} />
              </Layer>
              <Layer>
                {shapes.map((s) => (
                  <CadShape key={s.id} shape={s} isSelected={s.id === selectedId} tool={tool}
                    onSelect={() => { if (tool === "select") setSelectedId(s.id); }}
                    onChange={(a) => updateShape(s.id, a)} />
                ))}
                {drawingPreview && tool === "line" && (
                  <Line points={[drawStart.x, drawStart.y, drawCurrent.x, drawCurrent.y]} stroke={strokeColor} strokeWidth={strokeWidth} dash={[6, 4]} listening={false} />
                )}
                {drawingPreview && tool === "rect" && (
                  <Rect x={Math.min(drawStart.x, drawCurrent.x)} y={Math.min(drawStart.y, drawCurrent.y)}
                    width={Math.abs(drawCurrent.x - drawStart.x)} height={Math.abs(drawCurrent.y - drawStart.y)}
                    stroke={strokeColor} strokeWidth={strokeWidth} dash={[6, 4]} fill="transparent" listening={false} />
                )}
                {drawingPreview && tool === "circle" && (
                  <Ellipse
                    x={(drawStart.x + drawCurrent.x) / 2}
                    y={(drawStart.y + drawCurrent.y) / 2}
                    radiusX={Math.abs(drawCurrent.x - drawStart.x) / 2}
                    radiusY={Math.abs(drawCurrent.y - drawStart.y) / 2}
                    stroke={strokeColor} strokeWidth={strokeWidth} dash={[6, 4]} fill="transparent"
                    listening={false} />
                )}
                {drawingPreview && tool === "measure" && (
                  <>
                    <Line points={[drawStart.x, drawStart.y, drawCurrent.x, drawCurrent.y]} stroke="#3478f6" strokeWidth={1.5} dash={[4, 4]} listening={false} />
                    <Text x={(drawStart.x + drawCurrent.x) / 2 + 8} y={(drawStart.y + drawCurrent.y) / 2 - 16}
                      text={`${(Math.sqrt(Math.pow(drawCurrent.x - drawStart.x, 2) + Math.pow(drawCurrent.y - drawStart.y, 2)) / GRID).toFixed(1)} cm`}
                      fontSize={13} fill="#3478f6" fontStyle="bold" listening={false} />
                  </>
                )}
                {measureLine && (
                  <>
                    <Line points={[measureLine.x1, measureLine.y1, measureLine.x2, measureLine.y2]} stroke="#3478f6" strokeWidth={1.5} dash={[4, 3]} listening={false} />
                    <Circle x={measureLine.x1} y={measureLine.y1} radius={4} fill="#3478f6" listening={false} />
                    <Circle x={measureLine.x2} y={measureLine.y2} radius={4} fill="#3478f6" listening={false} />
                    <Text x={(measureLine.x1 + measureLine.x2) / 2 + 8} y={(measureLine.y1 + measureLine.y2) / 2 - 16}
                      text={`${measDist.toFixed(1)} cm`}
                      fontSize={14} fill="#3478f6" fontStyle="bold" listening={false} />
                  </>
                )}
              </Layer>
            </Stage>
            {pendingText && (
              <div className="absolute bg-card border border-border/60 rounded-xl shadow-xl p-3 space-y-2 z-10" style={{ left: pendingText.x, top: pendingText.y }}>
                <Input
                  ref={pendingTextRef}
                  value={pendingText.value}
                  onChange={(e) => setPendingText({ ...pendingText, value: e.target.value })}
                  onKeyDown={(e) => { if (e.key === "Enter") confirmPendingText(); if (e.key === "Escape") cancelPendingText(); }}
                  className="h-8 text-sm w-40"
                  placeholder="Enter text..."
                  autoFocus
                />
                <div className="flex gap-1">
                  <Button size="sm" className="h-7 text-xs flex-1 shadow-sm" onClick={confirmPendingText}>Add</Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={cancelPendingText}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-56 border-l border-border/60 bg-card shrink-0 flex flex-col">
          {(() => {
            const sel = shapes.find((s) => s.id === selectedId);
            if (sel) return (
              <div className="p-3 border-b space-y-2.5">
                <h3 className="font-medium text-[10px] uppercase tracking-[0.12em] text-muted-foreground/50">Properties</h3>
                <div className="text-sm font-semibold capitalize">{sel.tool}</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-muted-foreground/60">X</span>
                    <Input type="number" value={Math.round(sel.x)} className="h-7 text-xs"
                      onChange={(e) => updateShape(sel.id, { x: +e.target.value })} />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground/60">Y</span>
                    <Input type="number" value={Math.round(sel.y)} className="h-7 text-xs"
                      onChange={(e) => updateShape(sel.id, { y: +e.target.value })} />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground/60">W</span>
                    <Input type="number" value={Math.round(sel.width)} className="h-7 text-xs"
                      onChange={(e) => updateShape(sel.id, { width: Math.max(2, +e.target.value) })} />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground/60">H</span>
                    <Input type="number" value={Math.round(sel.height)} className="h-7 text-xs"
                      onChange={(e) => updateShape(sel.id, { height: Math.max(2, +e.target.value) })} />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground/60">Rotation</span>
                  <Input type="number" value={Math.round(sel.rotation)} className="h-7 text-xs"
                    onChange={(e) => updateShape(sel.id, { rotation: +e.target.value })} />
                </div>
              </div>
            );
            return null;
          })()}
          <div className="p-3 border-b">
            <h3 className="font-medium text-[10px] uppercase tracking-[0.12em] text-muted-foreground/50">Objects ({shapes.length})</h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-1">
              {shapes.length === 0 ? (
                <div className="text-sm text-muted-foreground/50 text-center p-4">No objects yet</div>
              ) : (
                shapes.map((s) => (
                  <div
                    key={s.id}
                    className={`text-sm p-2 rounded-lg border cursor-pointer transition-colors ${
                      selectedId === s.id ? "border-primary/30 bg-primary/[0.04]" : "border-transparent hover:bg-muted/50"
                    }`}
                    onClick={() => { setTool("select"); setSelectedId(s.id); }}
                  >
                    <div className="font-medium capitalize text-[13px]">{s.tool}</div>
                    <div className="text-[11px] text-muted-foreground/50 font-mono mt-0.5">
                      X:{Math.round(s.x)} Y:{Math.round(s.y)}
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

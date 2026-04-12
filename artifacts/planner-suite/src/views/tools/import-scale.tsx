"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Stage, Layer, Rect, Circle, Ellipse, Line, Text, Transformer, Image as KImage } from "react-konva";
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
  Ruler, Undo2, Redo2, Trash2, XCircle, Upload, Import, RefreshCw, Crosshair
} from "lucide-react";
import { PlannerBreadcrumb } from "@/components/planner/PlannerBreadcrumb";
import {
  migrateDocument,
  createEmptyDocument,
  type UnifiedDocument,
  getCompletedSteps,
} from "@/lib/unified-document";

interface Annotation {
  id: string;
  tool: "rect" | "line" | "circle" | "text";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  stroke: string;
  strokeWidth: number;
  text?: string;
  points?: number[];
}

let _uid = Date.now();

type OverlayTool = "select" | "rect" | "line" | "circle" | "text" | "measure" | "calibrate";

function AnnotationShape({
  ann, isSelected, tool, onSelect, onChange,
}: {
  ann: Annotation;
  isSelected: boolean;
  tool: OverlayTool;
  onSelect: () => void;
  onChange: (a: Partial<Annotation>) => void;
}) {
  const lineRef = useRef<Konva.Line>(null);
  const rectRef = useRef<Konva.Rect>(null);
  const ellipseRef = useRef<Konva.Ellipse>(null);
  const textRef = useRef<Konva.Text>(null);
  const trRef = useRef<Konva.Transformer>(null);

  const getActiveNode = (): Konva.Node | null => {
    if (ann.tool === "line") return lineRef.current;
    if (ann.tool === "circle") return ellipseRef.current;
    if (ann.tool === "text") return textRef.current;
    return rectRef.current;
  };

  useEffect(() => {
    const node = getActiveNode();
    if (isSelected && trRef.current && node) {
      trRef.current.nodes([node]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, ann.tool]);

  const draggable = tool === "select";
  const onDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onChange({ x: Math.round(e.target.x() / 10) * 10, y: Math.round(e.target.y() / 10) * 10 });
  };
  const onTransformEnd = () => {
    const n = getActiveNode();
    if (!n) return;
    const sx = n.scaleX(), sy = n.scaleY();
    n.scaleX(1); n.scaleY(1);
    onChange({ x: n.x(), y: n.y(), width: Math.max(2, Math.round(n.width() * sx)), height: Math.max(2, Math.round(n.height() * sy)), rotation: n.rotation() });
  };
  const common = { draggable, onClick: onSelect, onTap: onSelect, onDragEnd, onTransformEnd };

  let node: React.ReactElement;
  if (ann.tool === "line") {
    node = <Line ref={lineRef} x={ann.x} y={ann.y} points={ann.points || [0, 0, ann.width, ann.height]} stroke={ann.stroke} strokeWidth={ann.strokeWidth} hitStrokeWidth={12} rotation={ann.rotation} {...common} />;
  } else if (ann.tool === "text") {
    node = <Text ref={textRef} x={ann.x} y={ann.y} text={ann.text || "Text"} fontSize={16} fill={ann.stroke} rotation={ann.rotation} {...common} />;
  } else if (ann.tool === "circle") {
    node = <Ellipse ref={ellipseRef} x={ann.x + ann.width / 2} y={ann.y + ann.height / 2} radiusX={ann.width / 2} radiusY={ann.height / 2} stroke={ann.stroke} strokeWidth={ann.strokeWidth} fill="transparent" rotation={ann.rotation} {...common}
      onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {
        onChange({ x: Math.round((e.target.x() - ann.width / 2) / 10) * 10, y: Math.round((e.target.y() - ann.height / 2) / 10) * 10 });
      }}
      onTransformEnd={() => {
        const n = ellipseRef.current;
        if (!n) return;
        const sx = n.scaleX(), sy = n.scaleY();
        n.scaleX(1); n.scaleY(1);
        const rx = n.radiusX() * sx;
        const ry = n.radiusY() * sy;
        onChange({ x: Math.round((n.x() - rx) / 10) * 10, y: Math.round((n.y() - ry) / 10) * 10, width: Math.max(2, Math.round(rx * 2)), height: Math.max(2, Math.round(ry * 2)), rotation: n.rotation() });
      }}
    />;
  } else {
    node = <Rect ref={rectRef} x={ann.x} y={ann.y} width={ann.width} height={ann.height} stroke={ann.stroke} strokeWidth={ann.strokeWidth} fill="transparent" rotation={ann.rotation} {...common} />;
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

function loadImageFromDataUrl(src: string): Promise<{ img: HTMLImageElement; w: number; h: number }> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const maxW = 800, maxH = 600;
      let w = img.width, h = img.height;
      if (w > maxW) { h = h * (maxW / w); w = maxW; }
      if (h > maxH) { w = w * (maxH / h); h = maxH; }
      resolve({ img, w: Math.round(w), h: Math.round(h) });
    };
    img.src = src;
  });
}

export default function ImportScale() {
  const searchParams = new URLSearchParams(window.location.search);
  const initialPlanId = searchParams.get("id") ? Number(searchParams.get("id")) : null;
  const [currentPlanId, setCurrentPlanId] = useState<number | null>(initialPlanId);
  const planId = currentPlanId;

  const [file, setFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [scale, setScale] = useState(20);
  const [unit, setUnit] = useState<"ft" | "m" | "cm">("ft");
  const [calibrated, setCalibrated] = useState(false);
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [imgSize, setImgSize] = useState({ w: 800, h: 600 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { current: annotations, set: setAnnotations, undo, redo, canUndo, canRedo, reset: resetAnnotations } = useUndoRedo<Annotation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [overlayTool, setOverlayTool] = useState<OverlayTool>("rect");
  const [drawColor, setDrawColor] = useState("#dc2626");
  const [drawing, setDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawCurrent, setDrawCurrent] = useState<{ x: number; y: number } | null>(null);
  const [measureLine, setMeasureLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [planName, setPlanName] = useState("New Import");
  const [unifiedDoc, setUnifiedDoc] = useState<UnifiedDocument>(createEmptyDocument());
  const stageRef = useRef<Konva.Stage>(null);

  const [calibLine, setCalibLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [calibDistance, setCalibDistance] = useState("");
  const [pendingText, setPendingText] = useState<{ x: number; y: number; value: string } | null>(null);
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
        if (doc.importLayer) {
          resetAnnotations(doc.importLayer.annotations as unknown as Annotation[]);
          setScale(doc.importLayer.scale);
          setUnit(doc.importLayer.unit);
          setCalibrated(doc.importLayer.calibrated);
          if (doc.importLayer.imageDataUrl && !file) {
            const dataUrl = doc.importLayer.imageDataUrl;
            setFile(dataUrl);
            setFileName(doc.importLayer.fileName || "imported");
            loadImageFromDataUrl(dataUrl).then(({ img, w, h }) => {
              setImgEl(img);
              setImgSize({ w, h });
            });
          }
        }
      }
    }
  }, [existingPlan, resetAnnotations]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setFile(src);
      setCalibrated(false);
      resetAnnotations([]);
      setSelectedId(null);
      setMeasureLine(null);
      setCalibLine(null);
      loadImageFromDataUrl(src).then(({ img, w, h }) => {
        setImgEl(img);
        setImgSize({ w, h });
      });
    };
    reader.readAsDataURL(f);
  };

  const SNAP = 10;
  const snap = (v: number) => Math.round(v / SNAP) * SNAP;

  const getPos = (): { x: number; y: number } => {
    const p = stageRef.current?.getPointerPosition();
    if (!p) return { x: 0, y: 0 };
    return { x: snap(p.x), y: snap(p.y) };
  };

  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (overlayTool === "select") {
      if (e.target === e.target.getStage() || e.target.getClassName() === "Image") setSelectedId(null);
      return;
    }
    if (overlayTool === "text") {
      const pos = getPos();
      setPendingText({ x: pos.x, y: pos.y, value: "Room" });
      setTimeout(() => pendingTextRef.current?.focus(), 50);
      return;
    }
    setDrawing(true);
    setDrawStart(getPos());
    setDrawCurrent(getPos());
  };

  const confirmPendingText = () => {
    if (!pendingText) return;
    const id = `ann_${_uid++}`;
    setAnnotations((p) => [...p, { id, tool: "text", x: pendingText.x, y: pendingText.y, width: 80, height: 20, rotation: 0, stroke: drawColor, strokeWidth: 2, text: pendingText.value || "Label" }]);
    setPendingText(null);
  };

  const cancelPendingText = () => setPendingText(null);

  const handleStageMouseMove = () => {
    if (!drawing) return;
    setDrawCurrent(getPos());
  };

  const handleStageMouseUp = () => {
    if (!drawing || !drawStart || !drawCurrent) return;
    setDrawing(false);
    const dx = drawCurrent.x - drawStart.x;
    const dy = drawCurrent.y - drawStart.y;
    if (Math.abs(dx) < 5 && Math.abs(dy) < 5) { setDrawStart(null); setDrawCurrent(null); return; }

    if (overlayTool === "calibrate") {
      setCalibLine({ x1: drawStart.x, y1: drawStart.y, x2: drawCurrent.x, y2: drawCurrent.y });
      setDrawStart(null); setDrawCurrent(null);
      return;
    }

    if (overlayTool === "measure") {
      setMeasureLine({ x1: drawStart.x, y1: drawStart.y, x2: drawCurrent.x, y2: drawCurrent.y });
      setDrawStart(null); setDrawCurrent(null);
      return;
    }

    const id = `ann_${_uid++}`;
    let ann: Annotation;
    if (overlayTool === "line") {
      ann = { id, tool: "line", x: drawStart.x, y: drawStart.y, width: dx, height: dy, rotation: 0, stroke: drawColor, strokeWidth: 2, points: [0, 0, dx, dy] };
    } else if (overlayTool === "circle") {
      ann = { id, tool: "circle", x: Math.min(drawStart.x, drawCurrent.x), y: Math.min(drawStart.y, drawCurrent.y), width: Math.abs(dx), height: Math.abs(dy), rotation: 0, stroke: drawColor, strokeWidth: 2 };
    } else {
      ann = { id, tool: "rect", x: Math.min(drawStart.x, drawCurrent.x), y: Math.min(drawStart.y, drawCurrent.y), width: Math.abs(dx), height: Math.abs(dy), rotation: 0, stroke: drawColor, strokeWidth: 2 };
    }
    setAnnotations((p) => [...p, ann]);
    setSelectedId(id);
    setDrawStart(null); setDrawCurrent(null);
  };

  const deleteSelected = useCallback(() => {
    setAnnotations((p) => p.filter((a) => a.id !== selectedId));
    setSelectedId(null);
  }, [selectedId, setAnnotations]);

  const applyCalibration = () => {
    if (!calibLine || !calibDistance) return;
    const dist = parseFloat(calibDistance);
    if (!dist || dist <= 0) return;
    const pxLen = Math.sqrt(Math.pow(calibLine.x2 - calibLine.x1, 2) + Math.pow(calibLine.y2 - calibLine.y1, 2));
    if (pxLen < 1) return;
    const computedScale = pxLen / dist;
    setScale(Math.max(0.01, Math.round(computedScale * 100) / 100));
    setCalibrated(true);
    setCalibLine(null);
    setCalibDistance("");
    setOverlayTool("select");
    toast({ title: `Scale calibrated: ${computedScale.toFixed(2)} px/${unit}` });
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") return;
    if ((e.key === "Delete" || e.key === "Backspace") && selectedId) { e.preventDefault(); deleteSelected(); }
    if (e.key === "z" && (e.ctrlKey || e.metaKey) && !e.shiftKey) { e.preventDefault(); undo(); }
    if ((e.key === "y" && (e.ctrlKey || e.metaKey)) || (e.key === "z" && (e.ctrlKey || e.metaKey) && e.shiftKey)) { e.preventDefault(); redo(); }
    if (e.key === "v") setOverlayTool("select");
    if (e.key === "r") setOverlayTool("rect");
    if (e.key === "l") setOverlayTool("line");
    if (e.key === "c") setOverlayTool("circle");
    if (e.key === "t") setOverlayTool("text");
    if (e.key === "m") setOverlayTool("measure");
  }, [selectedId, deleteSelected, undo, redo]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleSave = () => {
    const updatedDoc: UnifiedDocument = {
      ...unifiedDoc,
      importLayer: {
        annotations: annotations as any,
        scale,
        unit,
        calibrated,
        imageDataUrl: file || undefined,
        fileName: fileName || undefined,
      },
    };
    const documentJson = JSON.stringify(updatedDoc);
    const payload = {
      name: planName,
      roomWidthCm: imgSize.w,
      roomDepthCm: imgSize.h,
      plannerType: "import" as any,
      documentJson,
    };

    if (planId) {
      updatePlan.mutate({ id: planId, data: payload }, {
        onSuccess: () => toast({ title: "Import plan updated" }),
      });
    } else {
      createPlan.mutate({ data: payload }, {
        onSuccess: (data) => {
          toast({ title: "Import plan saved" });
          setCurrentPlanId(data.id);
          window.history.replaceState(null, "", `?id=${data.id}`);
        },
      });
    }
  };

  const measDist = measureLine ? (Math.sqrt(Math.pow(measureLine.x2 - measureLine.x1, 2) + Math.pow(measureLine.y2 - measureLine.y1, 2)) / scale).toFixed(1) : null;
  const calibLinePx = calibLine ? Math.sqrt(Math.pow(calibLine.x2 - calibLine.x1, 2) + Math.pow(calibLine.y2 - calibLine.y1, 2)) : 0;
  const drawingPreview = drawing && drawStart && drawCurrent;

  const overlayTools: { id: OverlayTool; label: string; icon: React.ReactNode; key?: string }[] = [
    { id: "select", label: "Select", icon: <MousePointer2 className="w-4 h-4" />, key: "V" },
    { id: "rect", label: "Rect", icon: <Square className="w-4 h-4" />, key: "R" },
    { id: "line", label: "Line", icon: <Minus className="w-4 h-4" />, key: "L" },
    { id: "circle", label: "Ellipse", icon: <CircleIcon className="w-4 h-4" />, key: "C" },
    { id: "text", label: "Text", icon: <Type className="w-4 h-4" />, key: "T" },
    { id: "measure", label: "Measure", icon: <Ruler className="w-4 h-4" />, key: "M" },
    { id: "calibrate", label: "Calibrate", icon: <Crosshair className="w-4 h-4" /> },
  ];

  const completedSteps = getCompletedSteps(unifiedDoc);

  if (!file) {
    return (
      <div className="h-full flex flex-col bg-background">
        <PlannerBreadcrumb
          items={[{ label: "Import & Scale" }]}
          planId={planId}
          planName={planName}
          completedSteps={completedSteps}
          icon={<Import className="w-3 h-3" />}
        />
        <header className="h-14 border-b flex items-center px-5 shrink-0 bg-card">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500/10 to-pink-500/5 flex items-center justify-center">
              <Import className="w-4 h-4 text-primary" strokeWidth={1.8} />
            </div>
            <div className="flex flex-col">
              <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground/50 leading-none">Drawing Tools</p>
              <h1 className="text-sm font-semibold tracking-[-0.01em]">Import & Scale</h1>
            </div>
          </div>
        </header>
        <div className="flex-1 flex justify-center items-center bg-muted/20">
          <div className="max-w-xl w-full p-8 text-center">
            <h1 className="text-2xl font-semibold tracking-[-0.02em] mb-2">Import Your Floor Plan</h1>
            <p className="text-sm text-muted-foreground/60 mb-8 leading-relaxed">Upload a PNG or JPG image and draw scaled annotations on top.</p>
            <div
              className="rounded-2xl border-2 border-dashed border-border/60 bg-card p-14 cursor-pointer hover:border-primary/30 hover:shadow-lg hover:shadow-black/5 transition-all group"
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg" className="hidden" onChange={handleFile} />
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/[0.08] transition-colors">
                <Upload className="w-7 h-7 text-muted-foreground/40 group-hover:text-primary transition-colors" />
              </div>
              <div className="text-base font-semibold mb-1.5">Drop your file here or click to browse</div>
              <div className="text-sm text-muted-foreground/40">Supports: PNG, JPG</div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-8">
              {[
                { icon: <Ruler className="w-5 h-5" />, title: "Blueprint", desc: "Upload architectural drawings and trace at scale." },
                { icon: <Import className="w-5 h-5" />, title: "Site Plan", desc: "Import a site plan screenshot and annotate." },
                { icon: <Upload className="w-5 h-5" />, title: "Photo / Sketch", desc: "Photograph a hand-drawn sketch and digitize it." },
              ].map((c) => (
                <div key={c.title} className="rounded-xl border border-border/50 bg-card p-4 text-left cursor-pointer hover:shadow-md hover:shadow-black/5 hover:border-primary/20 transition-all" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-9 h-9 rounded-lg bg-primary/[0.06] flex items-center justify-center mb-3">
                    <div className="text-primary">{c.icon}</div>
                  </div>
                  <div className="font-semibold text-sm mb-1">{c.title}</div>
                  <div className="text-xs text-muted-foreground/50 leading-relaxed">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <PlannerBreadcrumb
        items={[{ label: "Import & Scale" }]}
        planId={planId}
        planName={planName}
        completedSteps={completedSteps}
        icon={<Import className="w-3 h-3" />}
      />
      <header className="h-14 border-b flex items-center justify-between px-5 shrink-0 bg-card">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500/10 to-pink-500/5 flex items-center justify-center">
            <Import className="w-4 h-4 text-primary" strokeWidth={1.8} />
          </div>
          <div className="flex flex-col">
            <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground/50 leading-none">Drawing Tools</p>
            <Input
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="w-56 h-7 font-semibold text-sm border-transparent hover:border-input focus:border-input bg-transparent px-0 tracking-[-0.01em]"
            />
          </div>
          <span className="text-[11px] text-muted-foreground/40 bg-muted/40 px-2 py-0.5 rounded-md">{fileName}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground/50 tabular-nums">{annotations.length} annotations</span>
          <Button size="sm" onClick={handleSave} disabled={createPlan.isPending || updatePlan.isPending} className="shadow-sm">
            {(createPlan.isPending || updatePlan.isPending) ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Plan
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-56 border-r flex flex-col bg-card shrink-0">
          <div className="p-3 border-b">
            <h3 className="font-medium text-[10px] uppercase tracking-[0.12em] text-muted-foreground/50 mb-2.5">Annotation Tools</h3>
            <div className="space-y-0.5">
              {overlayTools.map((t) => (
                <Button
                  key={t.id}
                  variant={overlayTool === t.id ? "default" : "ghost"}
                  size="sm"
                  className={`w-full justify-start gap-2.5 h-8 ${overlayTool === t.id ? "shadow-sm" : ""}`}
                  onClick={() => setOverlayTool(t.id)}
                >
                  {t.icon}
                  <span className="text-[13px]">{t.label}</span>
                  {t.key && <span className="ml-auto text-[10px] opacity-40 font-mono">{t.key}</span>}
                </Button>
              ))}
            </div>
          </div>

          <div className="p-3 border-b space-y-3">
            <h3 className="font-medium text-[10px] uppercase tracking-[0.12em] text-muted-foreground/50">Style</h3>
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-muted-foreground/60 w-12">Color</span>
              <Input type="color" value={drawColor} onChange={(e) => setDrawColor(e.target.value)}
                className="w-8 h-8 p-0 border border-border/50 rounded-lg cursor-pointer shadow-sm" />
            </div>
          </div>

          <div className="p-3 border-b space-y-3">
            <h3 className="font-medium text-[10px] uppercase tracking-[0.12em] text-muted-foreground/50">Scale Settings</h3>
            <div>
              <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">Units</span>
              <select aria-label="Measurement units" value={unit} onChange={(e) => setUnit(e.target.value as "ft" | "m" | "cm")}
                className="flex h-8 w-full rounded-lg border border-border/50 bg-transparent px-2 text-sm mt-1 shadow-sm">
                <option value="ft">Feet</option>
                <option value="m">Meters</option>
                <option value="cm">Centimeters</option>
              </select>
            </div>
            {calibLine ? (
              <div className="space-y-2">
                <div className="rounded-xl bg-amber-500/[0.06] border border-amber-200/50 p-2.5">
                  <div className="text-[10px] font-medium text-amber-700">Reference line: {calibLinePx.toFixed(0)} px</div>
                  <div className="text-[10px] text-amber-600/70 mt-0.5">Enter the known real-world distance:</div>
                </div>
                <div className="flex gap-1">
                  <Input
                    type="number"
                    value={calibDistance}
                    onChange={(e) => setCalibDistance(e.target.value)}
                    placeholder={`Distance (${unit})`}
                    className="h-8 text-sm flex-1"
                    autoFocus
                  />
                  <Button size="sm" className="h-8 shadow-sm" onClick={applyCalibration} disabled={!calibDistance || parseFloat(calibDistance) <= 0}>
                    Apply
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">Scale (px per {unit})</span>
                  <Input type="number" value={scale} onChange={(e) => setScale(Math.max(0.01, +e.target.value))} className="h-8 text-sm mt-1" min={0.01} />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-border/50 shadow-sm"
                  onClick={() => setOverlayTool("calibrate")}
                >
                  <Crosshair className="w-3.5 h-3.5 mr-2" />
                  Draw Reference Line
                </Button>
              </>
            )}
            {calibrated && (
              <div className="rounded-xl bg-green-500/[0.06] border border-green-200/50 p-2.5">
                <div className="text-[10px] font-medium text-green-700">Calibrated: {scale.toFixed(2)} px/{unit}</div>
                <div className="text-[10px] text-green-600/70">1 pixel = {(1/scale).toFixed(4)} {unit}</div>
              </div>
            )}
          </div>

          {measureLine && measDist && (
            <div className="p-3 border-b">
              <div className="rounded-xl bg-blue-500/[0.06] border border-blue-200/50 p-2.5">
                <div className="text-[10px] font-medium uppercase tracking-wider text-blue-600/70">Measured</div>
                <div className="text-xl font-bold text-blue-700 mt-0.5 tabular-nums">{measDist} {unit}</div>
              </div>
            </div>
          )}

          <div className="p-3 space-y-1">
            <h3 className="font-medium text-[10px] uppercase tracking-[0.12em] text-muted-foreground/50 mb-2.5">Actions</h3>
            {selectedId && (
              <Button variant="outline" size="sm" className="w-full justify-start gap-2.5 text-destructive border-border/50 shadow-sm" onClick={deleteSelected}>
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </Button>
            )}
            <Button variant="outline" size="sm" className="w-full justify-start gap-2.5 border-border/50 shadow-sm" onClick={undo} disabled={!canUndo}>
              <Undo2 className="w-3.5 h-3.5" /> Undo
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start gap-2.5 border-border/50 shadow-sm" onClick={redo} disabled={!canRedo}>
              <Redo2 className="w-3.5 h-3.5" /> Redo
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start gap-2.5 border-border/50 shadow-sm" onClick={() => { resetAnnotations([]); setSelectedId(null); setMeasureLine(null); }}>
              <XCircle className="w-3.5 h-3.5" /> Clear
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start gap-2.5 border-border/50 shadow-sm" onClick={() => { setFile(null); setFileName(""); setCalibrated(false); resetAnnotations([]); setMeasureLine(null); setCalibLine(null); }}>
              <RefreshCw className="w-3.5 h-3.5" /> Replace File
            </Button>
          </div>
        </div>

        <div className="flex-1 bg-muted/20 relative flex items-center justify-center p-6 overflow-auto">
          <div className="shadow-xl shadow-black/[0.06] border border-border/60 rounded-xl overflow-hidden bg-card relative">
            <Stage ref={stageRef} width={imgSize.w} height={imgSize.h}
              style={{ background: "#fff", cursor: overlayTool === "select" ? "default" : "crosshair" }}
              onMouseDown={handleStageMouseDown} onMouseMove={handleStageMouseMove} onMouseUp={handleStageMouseUp}>
              <Layer>
                {imgEl && <KImage image={imgEl} width={imgSize.w} height={imgSize.h} listening={false} />}
              </Layer>
              <Layer>
                {annotations.map((ann) => (
                  <AnnotationShape key={ann.id} ann={ann} isSelected={ann.id === selectedId} tool={overlayTool}
                    onSelect={() => { if (overlayTool === "select") setSelectedId(ann.id); }}
                    onChange={(a) => setAnnotations((p) => p.map((x) => (x.id === ann.id ? { ...x, ...a } : x)))} />
                ))}
                {drawingPreview && overlayTool === "line" && <Line points={[drawStart.x, drawStart.y, drawCurrent.x, drawCurrent.y]} stroke={drawColor} strokeWidth={2} dash={[5, 4]} listening={false} />}
                {drawingPreview && overlayTool === "rect" && <Rect x={Math.min(drawStart.x, drawCurrent.x)} y={Math.min(drawStart.y, drawCurrent.y)} width={Math.abs(drawCurrent.x - drawStart.x)} height={Math.abs(drawCurrent.y - drawStart.y)} stroke={drawColor} strokeWidth={2} dash={[5, 4]} fill="transparent" listening={false} />}
                {drawingPreview && overlayTool === "circle" && <Ellipse x={(drawStart.x + drawCurrent.x) / 2} y={(drawStart.y + drawCurrent.y) / 2} radiusX={Math.abs(drawCurrent.x - drawStart.x) / 2} radiusY={Math.abs(drawCurrent.y - drawStart.y) / 2} stroke={drawColor} strokeWidth={2} dash={[5, 4]} fill="transparent" listening={false} />}
                {drawingPreview && (overlayTool === "measure" || overlayTool === "calibrate") && (
                  <>
                    <Line points={[drawStart.x, drawStart.y, drawCurrent.x, drawCurrent.y]}
                      stroke={overlayTool === "calibrate" ? "#f59e0b" : "#3478f6"}
                      strokeWidth={2} dash={[4, 4]} listening={false} />
                    <Text x={(drawStart.x + drawCurrent.x) / 2 + 8} y={(drawStart.y + drawCurrent.y) / 2 - 16}
                      text={overlayTool === "calibrate"
                        ? `${Math.sqrt(Math.pow(drawCurrent.x - drawStart.x, 2) + Math.pow(drawCurrent.y - drawStart.y, 2)).toFixed(0)} px`
                        : `${(Math.sqrt(Math.pow(drawCurrent.x - drawStart.x, 2) + Math.pow(drawCurrent.y - drawStart.y, 2)) / scale).toFixed(1)} ${unit}`
                      }
                      fontSize={13} fill={overlayTool === "calibrate" ? "#f59e0b" : "#3478f6"} fontStyle="bold" listening={false} />
                  </>
                )}
                {calibLine && (
                  <>
                    <Line points={[calibLine.x1, calibLine.y1, calibLine.x2, calibLine.y2]} stroke="#f59e0b" strokeWidth={2.5} dash={[6, 3]} listening={false} />
                    <Circle x={calibLine.x1} y={calibLine.y1} radius={5} fill="#f59e0b" listening={false} />
                    <Circle x={calibLine.x2} y={calibLine.y2} radius={5} fill="#f59e0b" listening={false} />
                    <Text x={(calibLine.x1 + calibLine.x2) / 2 + 8} y={(calibLine.y1 + calibLine.y2) / 2 - 16}
                      text={`${calibLinePx.toFixed(0)} px — enter distance`}
                      fontSize={13} fill="#f59e0b" fontStyle="bold" listening={false} />
                  </>
                )}
                {measureLine && (
                  <>
                    <Line points={[measureLine.x1, measureLine.y1, measureLine.x2, measureLine.y2]} stroke="#3478f6" strokeWidth={1.5} dash={[4, 3]} listening={false} />
                    <Circle x={measureLine.x1} y={measureLine.y1} radius={4} fill="#3478f6" listening={false} />
                    <Circle x={measureLine.x2} y={measureLine.y2} radius={4} fill="#3478f6" listening={false} />
                    <Text x={(measureLine.x1 + measureLine.x2) / 2 + 8} y={(measureLine.y1 + measureLine.y2) / 2 - 16}
                      text={`${measDist} ${unit}`} fontSize={14} fill="#3478f6" fontStyle="bold" listening={false} />
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
                  placeholder="Enter label..."
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

        <div className="w-56 border-l bg-card shrink-0 flex flex-col">
          <div className="p-3 border-b">
            <h3 className="font-medium text-[10px] uppercase tracking-[0.12em] text-muted-foreground/50">Annotations ({annotations.length})</h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-0.5">
              {annotations.length === 0 ? (
                <div className="text-sm text-muted-foreground/40 text-center p-6">No annotations yet</div>
              ) : (
                annotations.map((ann) => (
                  <div
                    key={ann.id}
                    className={`text-sm p-2.5 rounded-lg border cursor-pointer transition-all ${
                      selectedId === ann.id ? "border-primary/30 bg-primary/[0.04] shadow-sm" : "border-transparent hover:bg-muted/40"
                    }`}
                    onClick={() => { setOverlayTool("select"); setSelectedId(ann.id); }}
                  >
                    <div className="font-medium capitalize text-[13px]">{ann.tool}</div>
                    <div className="text-[11px] text-muted-foreground/40 font-mono mt-1">
                      X:{Math.round(ann.x)} Y:{Math.round(ann.y)}
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

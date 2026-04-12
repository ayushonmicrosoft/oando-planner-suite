"use client";

import { useCallback, useState } from "react";
import {
  Undo2, Redo2, Grid3X3, MousePointer2, Pencil, Hand, Eraser,
  FileDown, RotateCcw, RotateCw, Trash2, Copy, PanelLeft, PanelRight,
  Sparkles, Square, Type, Minus, ArrowUpRight, StickyNote,
  Frame, ZoomIn, ZoomOut, Maximize, Box, ChevronLeft,
  Ruler, Lock, Unlock, AlignStartHorizontal, AlignCenterHorizontal,
  AlignEndHorizontal, AlignStartVertical, AlignCenterVertical,
  AlignEndVertical, Group, Ungroup, MoveUp, MoveDown,
  Highlighter, Pointer, Download, FileText, Image, Map as MapIcon, FileSpreadsheet,
  LayoutTemplate, FolderOpen, FilePlus, Save, FileInput, Layers,
  AlignHorizontalSpaceAround, Settings2, Presentation, Share2, History, GitCompare,
  Loader2, Wand2, AlertTriangle, CheckCircle2, RefreshCw, X,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { usePlannerStore, type CanvasToolMode } from "./planner-store";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { ShareDialog } from "@/components/share-dialog";
import { useGenerateAutoLayout, type AutoLayoutResponse, type AutoLayoutRequestRoomType } from "@workspace/api-client-react";
import { createShapeId, type TLShapePartial } from "tldraw";

const TOOL_MAP: Record<string, string> = {
  select: "select",
  draw: "draw",
  hand: "hand",
  eraser: "eraser",
  geo: "geo",
  line: "line",
  text: "text",
  frame: "frame",
  note: "note",
  arrow: "arrow",
  laser: "laser",
  highlight: "highlight",
};

function ActionBtn({
  icon: Icon, label, onClick, danger, disabled, active, className: extraClass,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  active?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-8 items-center justify-center rounded-md transition-all",
        active ? "bg-navy text-white" : "",
        danger ? "text-red-500/70 hover:bg-red-50 hover:text-red-600" : !active ? "text-navy-text/60 hover:bg-navy/10 hover:text-navy" : "",
        disabled && "opacity-30 pointer-events-none",
        extraClass
      )}
      title={label}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function TopBarBtn({
  icon: Icon, label, onClick, disabled, badge,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  badge?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-8 items-center gap-1.5 px-2 rounded-md text-[11px] font-medium transition-all",
        "text-navy-text/60 hover:bg-navy/10 hover:text-navy",
        disabled && "opacity-30 pointer-events-none",
        badge && "bg-primary text-white hover:bg-primary/90 hover:text-white"
      )}
      title={label}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden xl:inline">{label}</span>
    </button>
  );
}

export function StudioToolbar() {
  const {
    editor, planName, setPlanName, isDirty, isSaved,
    showCatalog, toggleCatalog, showInspector, toggleInspector,
    showGrid, toggleGrid, show3D, toggle3D, showMinimap, toggleMinimap,
    zoom, setZoom, showSettings, toggleSettings,
  } = usePlannerStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const currentPlanId = searchParams ? parseInt(searchParams.get("id") || "0", 10) : 0;
  const [showAiLayout, setShowAiLayout] = useState(false);
  const [aiRoomType, setAiRoomType] = useState<AutoLayoutRequestRoomType>("open-office");
  const [aiCapacity, setAiCapacity] = useState(6);
  const [aiRoomWidth, setAiRoomWidth] = useState(800);
  const [aiRoomDepth, setAiRoomDepth] = useState(600);
  const [aiResult, setAiResult] = useState<AutoLayoutResponse | null>(null);
  const generateLayout = useGenerateAutoLayout();

  const handleUndo = () => editor?.undo();
  const handleRedo = () => editor?.redo();
  const handleDelete = () => editor?.deleteShapes(editor.getSelectedShapeIds());
  const handleDuplicate = () => editor?.duplicateShapes(editor.getSelectedShapeIds());
  const handleSelectAll = () => {
    if (!editor) return;
    const ids = [...editor.getCurrentPageShapeIds()];
    editor.setSelectedShapes(ids.map((id) => editor.getShape(id)!).filter(Boolean));
  };

  const handleRotateCW = () => {
    const ids = editor?.getSelectedShapeIds();
    if (ids?.length && editor) {
      ids.forEach((id) => {
        const shape = editor.getShape(id);
        if (shape) editor.updateShape({ id: shape.id, type: shape.type, rotation: (shape.rotation || 0) + Math.PI / 2 } as TLShapePartial);
      });
    }
  };
  const handleRotateCCW = () => {
    const ids = editor?.getSelectedShapeIds();
    if (ids?.length && editor) {
      ids.forEach((id) => {
        const shape = editor.getShape(id);
        if (shape) editor.updateShape({ id: shape.id, type: shape.type, rotation: (shape.rotation || 0) - Math.PI / 2 } as TLShapePartial);
      });
    }
  };

  const handleZoomIn = () => { editor?.zoomIn(); };
  const handleZoomOut = () => { editor?.zoomOut(); };
  const handleZoomFit = () => { editor?.zoomToFit(); };
  const handleZoomReset = () => { editor?.resetZoom(); };

  const handleBringForward = () => {
    const ids = editor?.getSelectedShapeIds();
    if (ids?.length && editor) editor.bringForward(ids);
  };
  const handleSendBackward = () => {
    const ids = editor?.getSelectedShapeIds();
    if (ids?.length && editor) editor.sendBackward(ids);
  };

  const handleExportPng = async () => {
    if (!editor) return;
    const ids = [...editor.getCurrentPageShapeIds()];
    if (!ids.length) return;
    try {
      const svgResult = await editor.getSvgString(ids, { background: true, padding: 32 });
      if (!svgResult) return;
      const svgStr = svgResult.svg;
      const canvas = document.createElement("canvas");
      const img = new window.Image();
      img.onload = () => {
        canvas.width = img.width * 2;
        canvas.height = img.height * 2;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const a = document.createElement("a");
        a.download = `${planName || "plan"}.png`;
        a.href = canvas.toDataURL("image/png");
        a.click();
      };
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgStr);
    } catch (err) {
      console.warn("PNG export error:", err);
    }
    setShowExportMenu(false);
  };

  const handleExportSvg = async () => {
    if (!editor) return;
    const ids = [...editor.getCurrentPageShapeIds()];
    if (!ids.length) return;
    try {
      const svgResult = await editor.getSvgString(ids, { background: true, padding: 32 });
      if (!svgResult) return;
      const blob = new Blob([svgResult.svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.download = `${planName || "plan"}.svg`;
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.warn("SVG export error:", err);
    }
    setShowExportMenu(false);
  };

  const handleExportPdf = async () => {
    if (!editor) return;
    const ids = [...editor.getCurrentPageShapeIds()];
    if (!ids.length) return;
    try {
      const { default: jsPDF } = await import("jspdf");
      const svgResult = await editor.getSvgString(ids, { background: true, padding: 32 });
      if (!svgResult) return;
      const canvas = document.createElement("canvas");
      const img = new window.Image();
      img.onload = () => {
        canvas.width = img.width * 2;
        canvas.height = img.height * 2;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pdfW = canvas.width * 0.264583;
        const pdfH = canvas.height * 0.264583;
        const orientation = pdfW > pdfH ? "landscape" : "portrait";
        const pdf = new jsPDF({ orientation, unit: "mm", format: [pdfW, pdfH] });
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, pdfW, pdfH);
        pdf.save(`${planName || "plan"}.pdf`);
      };
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgResult.svg);
    } catch (err) {
      console.warn("PDF export error:", err);
    }
    setShowExportMenu(false);
  };

  const hasSelection = editor ? editor.getSelectedShapeIds().length > 0 : false;

  const handleGenerateLayout = () => {
    generateLayout.mutate({
      data: {
        roomWidthCm: aiRoomWidth,
        roomDepthCm: aiRoomDepth,
        roomType: aiRoomType,
        capacity: aiCapacity,
      },
    }, {
      onSuccess: (data) => {
        setAiResult(data);
      },
    });
  };

  const handleAcceptLayout = () => {
    if (!editor || !aiResult) return;
    const shapes: TLShapePartial[] = aiResult.layout.map((item) => {
      const id = createShapeId();
      const w = item.widthCm;
      const h = item.depthCm;
      return {
        id,
        type: "geo" as const,
        x: item.x,
        y: item.y,
        rotation: (item.rotation * Math.PI) / 180,
        props: {
          w,
          h,
          geo: "rectangle",
          color: "black",
          fill: "solid",
          labelColor: "black",
          text: item.name,
          size: "s",
        },
        meta: {
          archType: "furniture",
          catalogId: item.catalogId,
          category: item.category,
          furnitureColor: item.color,
          furnitureShape: item.shape,
        },
      };
    });
    editor.createShapes(shapes);
    editor.zoomToFit();
    setShowAiLayout(false);
    setAiResult(null);
  };

  return (
    <>
      {showAiLayout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-[480px] max-h-[85vh] bg-white rounded-xl shadow-2xl border overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-primary" />
                <h2 className="text-base font-semibold text-navy-text">AI Auto-Layout</h2>
              </div>
              <button onClick={() => { setShowAiLayout(false); setAiResult(null); }} className="text-navy-text/40 hover:text-navy-text">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 flex-1 overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-navy-text/70">Room Type</label>
                <select
                  value={aiRoomType}
                  onChange={(e) => setAiRoomType(e.target.value as AutoLayoutRequestRoomType)}
                  className="w-full h-9 rounded-lg border bg-white px-3 text-sm outline-none focus:border-navy focus:ring-1 focus:ring-navy/20"
                >
                  <option value="open-office">Open Office</option>
                  <option value="conference">Conference Room</option>
                  <option value="executive">Executive Office</option>
                  <option value="reception">Reception Area</option>
                  <option value="breakout">Breakout / Lounge</option>
                  <option value="training">Training Room</option>
                  <option value="hot-desk">Hot Desk Area</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-navy-text/70">Capacity (people)</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={aiCapacity}
                  onChange={(e) => setAiCapacity(Math.max(1, Math.min(100, Number(e.target.value))))}
                  className="w-full h-9 rounded-lg border bg-white px-3 text-sm outline-none focus:border-navy focus:ring-1 focus:ring-navy/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-navy-text/70">Width (cm)</label>
                  <input
                    type="number"
                    min={200}
                    max={5000}
                    value={aiRoomWidth}
                    onChange={(e) => setAiRoomWidth(Math.max(200, Math.min(5000, Number(e.target.value))))}
                    className="w-full h-9 rounded-lg border bg-white px-3 text-sm outline-none focus:border-navy focus:ring-1 focus:ring-navy/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-navy-text/70">Depth (cm)</label>
                  <input
                    type="number"
                    min={200}
                    max={5000}
                    value={aiRoomDepth}
                    onChange={(e) => setAiRoomDepth(Math.max(200, Math.min(5000, Number(e.target.value))))}
                    className="w-full h-9 rounded-lg border bg-white px-3 text-sm outline-none focus:border-navy focus:ring-1 focus:ring-navy/20"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateLayout}
                disabled={generateLayout.isPending}
                className="w-full h-10 rounded-lg bg-navy text-white text-sm font-semibold hover:bg-navy/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {generateLayout.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                ) : (
                  <><Wand2 className="w-4 h-4" /> Generate Layout</>
                )}
              </button>

              {aiResult && (
                <div className="space-y-3 pt-2">
                  <div className="rounded-lg bg-navy/5 p-3 text-xs text-navy-text/80 leading-relaxed">
                    {aiResult.summary}
                  </div>

                  <div className="text-xs font-medium text-navy-text/60">
                    {aiResult.layout.length} items placed
                  </div>

                  {!aiResult.validation.valid && (
                    <div className="space-y-1.5">
                      {aiResult.validation.overlaps.map((o, i) => (
                        <div key={`o${i}`} className="flex items-start gap-2 text-xs text-red-600 bg-red-50 rounded-md p-2">
                          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <span>{o}</span>
                        </div>
                      ))}
                      {aiResult.validation.outOfBounds.map((o, i) => (
                        <div key={`b${i}`} className="flex items-start gap-2 text-xs text-red-600 bg-red-50 rounded-md p-2">
                          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <span>{o}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {aiResult.validation.warnings.length > 0 && (
                    <div className="space-y-1.5">
                      {aiResult.validation.warnings.map((w, i) => (
                        <div key={`w${i}`} className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 rounded-md p-2">
                          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {aiResult.validation.valid && (
                    <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-md p-2">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Layout passed all validation checks</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleAcceptLayout}
                      className="flex-1 h-9 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Accept & Place
                    </button>
                    <button
                      onClick={handleGenerateLayout}
                      disabled={generateLayout.isPending}
                      className="h-9 px-4 rounded-lg border text-xs font-medium hover:bg-navy/5 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    <div className="absolute top-0 left-0 right-0 z-30 flex h-12 items-center border-b bg-white/95 backdrop-blur-md px-2 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <button
        onClick={() => router.push("/")}
        className="flex items-center gap-1.5 rounded-md text-navy-text/60 hover:bg-navy/10 hover:text-navy px-2 h-8 mr-1"
        title="Back to Dashboard"
      >
        <img src="/logo-v2-white.webp" alt="One&Only" className="h-5 w-auto invert opacity-80" />
      </button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <input
        type="text"
        value={planName}
        onChange={(e) => setPlanName(e.target.value)}
        className="h-7 w-40 rounded-md border bg-white px-2.5 text-xs font-semibold text-navy-text outline-none focus:border-navy focus:ring-1 focus:ring-navy/20 transition-all mr-1"
      />

      <div className="flex items-center gap-0.5 text-[10px] mr-1">
        {isSaved && <span className="text-emerald-500 font-semibold flex items-center gap-1"><Save className="w-3 h-3" /> Saved</span>}
        {isDirty && !isSaved && <span className="text-amber-500 font-semibold">Unsaved</span>}
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <ActionBtn icon={Undo2} label="Undo (Ctrl+Z)" onClick={handleUndo} className="w-8" />
      <ActionBtn icon={Redo2} label="Redo (Ctrl+Shift+Z)" onClick={handleRedo} className="w-8" />

      <Separator orientation="vertical" className="h-6 mx-1" />

      <TopBarBtn icon={LayoutTemplate} label="Templates" onClick={() => router.push("/templates")} />
      <TopBarBtn icon={FolderOpen} label="Projects" onClick={() => router.push("/projects")} />
      <TopBarBtn icon={FilePlus} label="New" onClick={() => { editor?.selectNone(); }} />
      <TopBarBtn icon={FolderOpen} label="Open" onClick={() => router.push("/plans")} />
      <TopBarBtn icon={Save} label="Save" onClick={() => { usePlannerStore.getState().setSaved(true); usePlannerStore.getState().setDirty(false); }} />
      <TopBarBtn icon={FileSpreadsheet} label="BOQ" onClick={() => router.push("/plans")} />
      <TopBarBtn icon={FileInput} label="Import" onClick={() => router.push("/tools/import")} />

      <Separator orientation="vertical" className="h-6 mx-1" />

      <TopBarBtn icon={Layers} label="Clusters" onClick={() => {}} />
      <TopBarBtn icon={AlignStartHorizontal} label="Arrange" onClick={() => {}} />
      <TopBarBtn icon={MapIcon} label="Zones" onClick={() => {}} />
      <TopBarBtn icon={AlignHorizontalSpaceAround} label="Spacing" onClick={() => {}} />

      <Separator orientation="vertical" className="h-6 mx-1" />

      <TopBarBtn icon={Presentation} label="Present" onClick={() => {}} badge />
      <TopBarBtn icon={Sparkles} label="AI" onClick={() => {}} />
      <TopBarBtn icon={Wand2} label="AI Layout" onClick={() => setShowAiLayout(true)} />
      <TopBarBtn icon={History} label="Versions" onClick={() => usePlannerStore.getState().toggleVersionHistory()} />
      {currentPlanId > 0 && (
        <TopBarBtn icon={Share2} label="Share" onClick={() => setShowShareDialog(true)} />
      )}

      <div className="flex-1" />

      <div className="relative">
        <button
          onClick={() => setShowExportMenu(!showExportMenu)}
          className="flex h-8 items-center gap-1.5 px-3 rounded-md text-xs font-semibold text-white bg-navy hover:bg-navy/90 transition-all shadow-sm"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export</span>
        </button>
        {showExportMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
            <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-lg border bg-white shadow-xl py-1">
              <button onClick={handleExportPng} className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-navy/5 text-left">
                <Image className="h-4 w-4 text-navy" /> Export PNG
              </button>
              <button onClick={handleExportSvg} className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-navy/5 text-left">
                <FileDown className="h-4 w-4 text-navy" /> Export SVG
              </button>
              <button onClick={handleExportPdf} className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-navy/5 text-left">
                <FileText className="h-4 w-4 text-navy" /> Export PDF
              </button>
              <div className="border-t my-1" />
              <button onClick={() => { setShowExportMenu(false); router.push('/plans'); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-navy/5 text-left">
                <FileSpreadsheet className="h-4 w-4 text-navy" /> Generate Quote
              </button>
            </div>
          </>
        )}
      </div>
      {currentPlanId > 0 && (
        <ShareDialog
          open={showShareDialog}
          onOpenChange={setShowShareDialog}
          planId={currentPlanId}
          planName={planName}
        />
      )}
    </div>
    </>
  );
}

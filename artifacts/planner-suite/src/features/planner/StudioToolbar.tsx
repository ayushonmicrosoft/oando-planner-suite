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
  Highlighter, Pointer, Download, FileText, Image, Map as MapIcon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { usePlannerStore, type CanvasToolMode } from "./planner-store";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

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

function ToolBtn({
  tool, icon: Icon, label, shortcut, size = "default",
}: {
  tool: CanvasToolMode;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  shortcut?: string;
  size?: "default" | "sm";
}) {
  const { activeTool, setActiveTool, editor } = usePlannerStore();
  const active = activeTool === tool;
  return (
    <button
      onClick={() => {
        setActiveTool(tool);
        if (editor && TOOL_MAP[tool]) editor.setCurrentTool(TOOL_MAP[tool]);
      }}
      className={cn(
        "flex items-center justify-center rounded-md transition-all",
        size === "sm" ? "h-7 w-7" : "h-8 w-8",
        active ? "bg-[#1F3653] text-white shadow-sm" : "text-[#1B2940]/70 hover:bg-[#1F3653]/10 hover:text-[#1F3653]"
      )}
      title={`${label}${shortcut ? ` (${shortcut})` : ""}`}
    >
      <Icon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
    </button>
  );
}

function ActionBtn({
  icon: Icon, label, onClick, danger, disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md transition-all",
        danger ? "text-red-500/70 hover:bg-red-50 hover:text-red-600" : "text-[#1B2940]/60 hover:bg-[#1F3653]/10 hover:text-[#1F3653]",
        disabled && "opacity-30 pointer-events-none"
      )}
      title={label}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

export function StudioToolbar() {
  const {
    editor, planName, setPlanName, isDirty,
    showCatalog, toggleCatalog, showInspector, toggleInspector,
    showGrid, toggleGrid, show3D, toggle3D, showMinimap, toggleMinimap,
    zoom, setZoom,
  } = usePlannerStore();
  const router = useRouter();
  const [showExportMenu, setShowExportMenu] = useState(false);

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
        if (shape) editor.updateShape({ id: shape.id, type: shape.type, rotation: (shape.rotation || 0) + Math.PI / 2 } as any);
      });
    }
  };
  const handleRotateCCW = () => {
    const ids = editor?.getSelectedShapeIds();
    if (ids?.length && editor) {
      ids.forEach((id) => {
        const shape = editor.getShape(id);
        if (shape) editor.updateShape({ id: shape.id, type: shape.type, rotation: (shape.rotation || 0) - Math.PI / 2 } as any);
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

  return (
    <div className="absolute top-0 left-0 right-0 z-30 flex h-12 items-center border-b bg-white/95 backdrop-blur-sm px-2 shadow-sm">
      <button
        onClick={() => router.push("/")}
        className="flex h-8 w-8 items-center justify-center rounded-md text-[#1B2940]/60 hover:bg-[#1F3653]/10 hover:text-[#1F3653] mr-1"
        title="Back to Dashboard"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-0.5 mr-2">
        <img src={`/logo-v2-white.webp`} alt="" className="h-5 w-auto invert opacity-80" />
      </div>

      <button
        onClick={toggleCatalog}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md transition-all mr-1",
          showCatalog ? "bg-[#1F3653] text-white" : "text-[#1B2940]/50 hover:bg-[#1F3653]/10"
        )}
        title="Catalog (C)"
      >
        <PanelLeft className="h-4 w-4" />
      </button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <div className="flex items-center gap-0.5 rounded-lg border border-[#1F3653]/10 bg-[#f8f9fb] p-0.5">
        <ToolBtn tool="select" icon={MousePointer2} label="Select" shortcut="V" />
        <ToolBtn tool="hand" icon={Hand} label="Pan" shortcut="H" />
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <div className="flex items-center gap-0.5 rounded-lg border border-[#1F3653]/10 bg-[#f8f9fb] p-0.5">
        <ToolBtn tool="geo" icon={Square} label="Rectangle / Ellipse" shortcut="R" />
        <ToolBtn tool="line" icon={Minus} label="Line" shortcut="L" />
        <ToolBtn tool="arrow" icon={ArrowUpRight} label="Arrow" shortcut="A" />
        <ToolBtn tool="draw" icon={Pencil} label="Freehand" shortcut="D" />
        <ToolBtn tool="text" icon={Type} label="Text" shortcut="T" />
        <ToolBtn tool="note" icon={StickyNote} label="Sticky Note" shortcut="N" />
        <ToolBtn tool="frame" icon={Frame} label="Frame" shortcut="F" />
        <ToolBtn tool="highlight" icon={Highlighter} label="Highlight" />
        <ToolBtn tool="eraser" icon={Eraser} label="Eraser" shortcut="E" />
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <ActionBtn icon={Undo2} label="Undo (Ctrl+Z)" onClick={handleUndo} />
      <ActionBtn icon={Redo2} label="Redo (Ctrl+Shift+Z)" onClick={handleRedo} />

      <Separator orientation="vertical" className="h-6 mx-1" />

      <ActionBtn icon={RotateCcw} label="Rotate Left 90°" onClick={handleRotateCCW} disabled={!hasSelection} />
      <ActionBtn icon={RotateCw} label="Rotate Right 90°" onClick={handleRotateCW} disabled={!hasSelection} />
      <ActionBtn icon={Copy} label="Duplicate (Ctrl+D)" onClick={handleDuplicate} disabled={!hasSelection} />
      <ActionBtn icon={MoveUp} label="Bring Forward" onClick={handleBringForward} disabled={!hasSelection} />
      <ActionBtn icon={MoveDown} label="Send Backward" onClick={handleSendBackward} disabled={!hasSelection} />
      <ActionBtn icon={Trash2} label="Delete" onClick={handleDelete} danger disabled={!hasSelection} />

      <div className="flex-1" />

      <input
        type="text"
        value={planName}
        onChange={(e) => setPlanName(e.target.value)}
        className="h-7 w-44 rounded-md border bg-white px-2.5 text-xs font-medium text-[#1B2940] outline-none focus:border-[#1F3653] focus:ring-1 focus:ring-[#1F3653]/20 transition-all mr-2"
      />

      {isDirty && <span className="text-[10px] text-amber-500 font-semibold mr-2">UNSAVED</span>}

      <Separator orientation="vertical" className="h-6 mx-1" />

      <div className="flex items-center gap-0.5 mr-1">
        <ActionBtn icon={ZoomOut} label="Zoom Out" onClick={handleZoomOut} />
        <button onClick={handleZoomReset} className="h-7 px-2 text-[11px] font-semibold text-[#1B2940]/60 hover:bg-[#1F3653]/10 rounded-md" title="Reset Zoom">
          {zoom}%
        </button>
        <ActionBtn icon={ZoomIn} label="Zoom In" onClick={handleZoomIn} />
        <ActionBtn icon={Maximize} label="Zoom to Fit" onClick={handleZoomFit} />
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <button
        onClick={toggleGrid}
        className={cn("flex h-8 w-8 items-center justify-center rounded-md transition-all", showGrid ? "bg-[#1F3653]/10 text-[#1F3653]" : "text-[#1B2940]/40 hover:bg-[#1F3653]/5")}
        title="Grid"
      >
        <Grid3X3 className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={toggleMinimap}
        className={cn("flex h-8 w-8 items-center justify-center rounded-md transition-all", showMinimap ? "bg-[#1F3653]/10 text-[#1F3653]" : "text-[#1B2940]/40 hover:bg-[#1F3653]/5")}
        title="Minimap"
      >
        <MapIcon className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={toggle3D}
        className={cn(
          "flex h-8 items-center gap-1 px-2 rounded-md text-xs font-semibold transition-all",
          show3D ? "bg-[#1F3653] text-white" : "text-[#1F3653]/70 hover:bg-[#1F3653]/10"
        )}
        title="3D View"
      >
        <Box className="h-3.5 w-3.5" />
        <span className="hidden xl:inline">3D</span>
      </button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <div className="relative">
        <button
          onClick={() => setShowExportMenu(!showExportMenu)}
          className="flex h-8 items-center gap-1.5 px-3 rounded-md text-xs font-semibold text-[#1F3653] hover:bg-[#1F3653]/10 transition-all"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Export</span>
        </button>
        {showExportMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
            <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-lg border bg-white shadow-xl py-1">
              <button onClick={handleExportPng} className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-[#1F3653]/5 text-left">
                <Image className="h-4 w-4 text-[#1F3653]" /> Export PNG
              </button>
              <button onClick={handleExportSvg} className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-[#1F3653]/5 text-left">
                <FileDown className="h-4 w-4 text-[#1F3653]" /> Export SVG
              </button>
              <button onClick={handleExportPdf} className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-[#1F3653]/5 text-left">
                <FileText className="h-4 w-4 text-[#1F3653]" /> Export PDF
              </button>
            </div>
          </>
        )}
      </div>

      <button
        onClick={toggleInspector}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md transition-all ml-1",
          showInspector ? "bg-[#1F3653] text-white" : "text-[#1B2940]/50 hover:bg-[#1F3653]/10"
        )}
        title="Inspector"
      >
        <PanelRight className="h-4 w-4" />
      </button>
    </div>
  );
}

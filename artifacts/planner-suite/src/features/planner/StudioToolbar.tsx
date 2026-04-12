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
  AlignHorizontalSpaceAround, Settings2, Presentation,
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
    </div>
  );
}

import { usePlannerStore } from "./planner-store";
import { Circle, Square, MousePointer2, Pencil, Hand, Eraser, Type, Frame, StickyNote, ArrowUpRight, Minus, Highlighter } from "lucide-react";
import { cn } from "@/lib/utils";

const TOOL_LABELS: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string }> = {
  select: { icon: MousePointer2, label: "Select" },
  draw: { icon: Pencil, label: "Freehand" },
  hand: { icon: Hand, label: "Pan" },
  eraser: { icon: Eraser, label: "Eraser" },
  geo: { icon: Square, label: "Shape" },
  line: { icon: Minus, label: "Line" },
  text: { icon: Type, label: "Text" },
  frame: { icon: Frame, label: "Frame" },
  note: { icon: StickyNote, label: "Note" },
  arrow: { icon: ArrowUpRight, label: "Arrow" },
  highlight: { icon: Highlighter, label: "Highlight" },
};

export function StudioStatusBar() {
  const { activeTool, shapeCount, cursorPos, zoom, showGrid, editor } = usePlannerStore();
  const toolMeta = TOOL_LABELS[activeTool] || { icon: MousePointer2, label: activeTool };
  const ToolIcon = toolMeta.icon;

  const selectedCount = editor?.getSelectedShapeIds().length || 0;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 flex h-8 items-center border-t bg-white/95 backdrop-blur-sm px-3 text-[10px] text-[#1B2940]/50">
      <div className="flex items-center gap-1.5 mr-4">
        <ToolIcon className="h-3 w-3 text-[#1F3653]" />
        <span className="font-semibold text-[#1F3653]">{toolMeta.label}</span>
      </div>

      <div className="h-3 w-px bg-[#1B2940]/10 mx-2" />

      <span>{shapeCount} shape{shapeCount !== 1 ? "s" : ""}</span>
      {selectedCount > 0 && (
        <span className="ml-2 text-[#1F3653] font-semibold">{selectedCount} selected</span>
      )}

      <div className="flex-1" />

      <span className="tabular-nums mr-4">
        X: {Math.round(cursorPos.x)} Y: {Math.round(cursorPos.y)}
      </span>

      <div className="h-3 w-px bg-[#1B2940]/10 mx-2" />

      <div className="flex items-center gap-1">
        {showGrid && (
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Grid
          </span>
        )}
      </div>

      <div className="h-3 w-px bg-[#1B2940]/10 mx-2" />

      <span className="font-semibold tabular-nums">{zoom}%</span>
    </div>
  );
}

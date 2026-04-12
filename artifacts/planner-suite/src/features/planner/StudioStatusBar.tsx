"use client";

import { usePlannerStore } from "./planner-store";
import { MousePointer2, Pencil, Hand, Eraser, Minus, Square, Type, Frame, StickyNote, ArrowUpRight, Highlighter, DoorOpen, AppWindow, Armchair, SquareDashedBottom, Ruler, SquareStack, Save } from "lucide-react";

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
  wall: { icon: Minus, label: "Wall" },
  room: { icon: SquareStack, label: "Room" },
  door: { icon: DoorOpen, label: "Door" },
  window: { icon: AppWindow, label: "Window" },
  furniture: { icon: Armchair, label: "Furniture" },
  zone: { icon: SquareDashedBottom, label: "Zone" },
  measure: { icon: Ruler, label: "Measure" },
};

export function StudioStatusBar() {
  const { activeTool, shapeCounts, zoom, showGrid, isSaved, isDirty } = usePlannerStore();
  const toolMeta = TOOL_LABELS[activeTool] || { icon: MousePointer2, label: activeTool };
  const ToolIcon = toolMeta.icon;

  const parts: string[] = [];
  if (shapeCounts.walls > 0) parts.push(`${shapeCounts.walls}W`);
  if (shapeCounts.rooms > 0) parts.push(`${shapeCounts.rooms}R`);
  if (shapeCounts.furniture > 0) parts.push(`${shapeCounts.furniture}F`);
  if (shapeCounts.doors > 0) parts.push(`${shapeCounts.doors}D`);
  if (shapeCounts.windows > 0) parts.push(`${shapeCounts.windows}Wi`);
  if (shapeCounts.zones > 0) parts.push(`${shapeCounts.zones}Z`);
  const countStr = parts.length > 0 ? parts.join(" \u00B7 ") : "Empty";

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 flex h-8 items-center border-t bg-[#0f1629] px-3 text-[10px] text-white/50">
      <div className="flex items-center gap-1.5 mr-3">
        <ToolIcon className="h-3 w-3 text-primary" />
        <span className="font-semibold text-white/70">{toolMeta.label}</span>
      </div>

      <div className="h-3 w-px bg-white/10 mx-2" />

      <span className="font-semibold tabular-nums text-white/60">{zoom}%</span>

      <div className="h-3 w-px bg-white/10 mx-2" />

      <span className="tabular-nums">{countStr}</span>

      <div className="flex-1" />

      <span className="text-white/30 mr-4 hidden sm:inline">
        Scroll to zoom &middot; Space+drag to pan
      </span>

      <div className="h-3 w-px bg-white/10 mx-2" />

      {showGrid && (
        <>
          <span className="flex items-center gap-1 mr-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Grid
          </span>
        </>
      )}

      <div className="flex items-center gap-1">
        {isSaved && !isDirty && (
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <Save className="w-3 h-3" />
            Saved
          </span>
        )}
        {isDirty && (
          <span className="text-amber-400 font-semibold">Unsaved</span>
        )}
      </div>
    </div>
  );
}

"use client";

import {
  MousePointer2, Minus, DoorOpen, AppWindow, Armchair,
  SquareDashedBottom, Trash2, Ruler, Settings2,
  SquareStack, ChevronDown,
} from "lucide-react";
import { usePlannerStore, type CanvasToolMode, type LabelUnit } from "./planner-store";
import { cn } from "@/lib/utils";

import type { LucideProps } from "lucide-react";

const ARCH_TOOLS: {
  tool: CanvasToolMode;
  icon: React.ComponentType<LucideProps>;
  label: string;
  shortcut?: string;
  tldrawTool?: string;
  count?: (c: ReturnType<typeof usePlannerStore.getState>["shapeCounts"]) => number;
}[] = [
  { tool: "select", icon: MousePointer2, label: "Select", shortcut: "V", tldrawTool: "select" },
  { tool: "wall", icon: Minus, label: "Wall", shortcut: "W", tldrawTool: "line", count: (c) => c.walls },
  { tool: "room", icon: SquareStack, label: "Room", shortcut: "R", tldrawTool: "geo", count: (c) => c.rooms },
  { tool: "door", icon: DoorOpen, label: "Door", shortcut: "D", tldrawTool: "geo", count: (c) => c.doors },
  { tool: "window", icon: AppWindow, label: "Window", tldrawTool: "geo", count: (c) => c.windows },
  { tool: "furniture", icon: Armchair, label: "Furniture", shortcut: "F", count: (c) => c.furniture },
  { tool: "zone", icon: SquareDashedBottom, label: "Zone", shortcut: "Z", tldrawTool: "geo", count: (c) => c.zones },
  { tool: "eraser" as CanvasToolMode, icon: Trash2, label: "Delete", tldrawTool: "eraser" },
  { tool: "measure", icon: Ruler, label: "Measure", shortcut: "M" },
];

export function StudioSidebar() {
  const {
    activeTool, setActiveTool, editor,
    shapeCounts, showSettings, toggleSettings,
    snapDistance, setSnapDistance,
    labelUnit, setLabelUnit,
    zoom,
  } = usePlannerStore();

  const handleToolClick = (tool: CanvasToolMode, tldrawTool?: string) => {
    setActiveTool(tool);
    if (editor && tldrawTool) {
      editor.setCurrentTool(tldrawTool);
    }
  };

  return (
    <div className="absolute top-12 left-0 bottom-8 z-20 w-[120px] bg-[#0f1629] border-r border-white/5 flex flex-col text-white/80">
      <div className="px-3 pt-3 pb-1">
        <p className="text-[9px] font-bold tracking-[0.18em] uppercase text-white/30">Tools</p>
      </div>

      <div className="flex-1 px-1.5 space-y-0.5 overflow-y-auto">
        {ARCH_TOOLS.map((t) => {
          const Icon = t.icon;
          const isActive = activeTool === t.tool;
          const cnt = t.count ? t.count(shapeCounts) : undefined;

          return (
            <button
              key={t.tool}
              onClick={() => handleToolClick(t.tool, t.tldrawTool)}
              className={cn(
                "flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-left transition-all text-[12px]",
                isActive
                  ? "bg-primary text-white font-semibold shadow-md"
                  : "text-white/60 hover:bg-white/5 hover:text-white/90"
              )}
              title={t.shortcut ? `${t.label} (${t.shortcut})` : t.label}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.8} />
              <span className="flex-1 leading-tight">{t.label}</span>
              {cnt !== undefined && cnt > 0 && (
                <span className={cn(
                  "text-[9px] font-bold tabular-nums min-w-[16px] text-center rounded px-1 py-0.5",
                  isActive ? "bg-white/20" : "bg-white/5 text-white/30"
                )}>
                  {cnt}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="border-t border-white/5 px-2.5 py-2">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => editor?.zoomOut()}
            className="w-6 h-6 rounded bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70 flex items-center justify-center text-xs font-bold"
          >
            -
          </button>
          <span className="text-[11px] font-semibold tabular-nums text-white/50 flex-1 text-center">{zoom}%</span>
          <button
            onClick={() => editor?.zoomIn()}
            className="w-6 h-6 rounded bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70 flex items-center justify-center text-xs font-bold"
          >
            +
          </button>
        </div>
      </div>

      <div className="border-t border-white/5">
        <button
          onClick={toggleSettings}
          className={cn(
            "flex items-center gap-2 w-full px-3 py-2.5 text-[9px] font-bold tracking-[0.15em] uppercase transition-all",
            showSettings ? "text-white/60 bg-white/5" : "text-white/25 hover:text-white/40"
          )}
        >
          <Settings2 className="w-3 h-3" />
          Settings
          <ChevronDown className={cn("w-3 h-3 ml-auto transition-transform", showSettings && "rotate-180")} />
        </button>

        {showSettings && (
          <div className="px-3 pb-3 space-y-3">
            <div>
              <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-white/25 mb-1.5">Snap Distance</p>
              <div className="flex gap-1">
                {[5, 10, 20].map((d) => (
                  <button
                    key={d}
                    onClick={() => setSnapDistance(d)}
                    className={cn(
                      "flex-1 py-1.5 rounded text-[11px] font-semibold transition-all",
                      snapDistance === d
                        ? "bg-primary text-white"
                        : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60"
                    )}
                  >
                    {d}px
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-white/25 mb-1.5">Wall Labels</p>
              <div className="flex gap-1">
                {(["cm", "m"] as LabelUnit[]).map((u) => (
                  <button
                    key={u}
                    onClick={() => setLabelUnit(u)}
                    className={cn(
                      "flex-1 py-1.5 rounded text-[11px] font-semibold transition-all",
                      labelUnit === u
                        ? "bg-primary text-white"
                        : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60"
                    )}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

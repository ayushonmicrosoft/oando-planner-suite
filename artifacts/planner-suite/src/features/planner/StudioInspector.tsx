"use client";

import { useEffect, useState, useCallback } from "react";
import { usePlannerStore } from "./planner-store";
import { Box, Settings2, Ruler, Palette, RotateCw, Move, Eye, EyeOff, Lock, Unlock, Layers, ChevronDown, ChevronRight, Trash2, Copy, Type, MoveUp, MoveDown } from "lucide-react";
import type { TLShape, TLShapeId } from "tldraw";
import { cn } from "@/lib/utils";

const COLOR_OPTIONS = [
  { value: "black", bg: "#1d1d1d" },
  { value: "grey", bg: "#9ca3af" },
  { value: "light-violet", bg: "#c4b5fd" },
  { value: "violet", bg: "#8b5cf6" },
  { value: "blue", bg: "#3b82f6" },
  { value: "light-blue", bg: "#93c5fd" },
  { value: "yellow", bg: "#fbbf24" },
  { value: "orange", bg: "#f97316" },
  { value: "green", bg: "#22c55e" },
  { value: "light-green", bg: "#86efac" },
  { value: "light-red", bg: "#fca5a5" },
  { value: "red", bg: "#ef4444" },
  { value: "white", bg: "#ffffff" },
];

const FILL_OPTIONS = [
  { value: "none", label: "None" },
  { value: "semi", label: "Semi" },
  { value: "solid", label: "Solid" },
  { value: "pattern", label: "Pattern" },
];

function Section({ title, icon: Icon, children, defaultOpen = true }: { title: string; icon?: React.ComponentType<{ className?: string }>; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#1F3653]/5">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-[#f8f9fb] transition-colors">
        {open ? <ChevronDown className="h-3 w-3 text-[#1B2940]/30" /> : <ChevronRight className="h-3 w-3 text-[#1B2940]/30" />}
        {Icon && <Icon className="h-3.5 w-3.5 text-[#1F3653]/60" />}
        <span className="text-[11px] font-semibold text-[#1B2940]/50 uppercase tracking-wider">{title}</span>
      </button>
      {open && <div className="px-3 pb-3 space-y-2">{children}</div>}
    </div>
  );
}

function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-[#1B2940]/40 w-6 shrink-0 text-right">{label}</span>
      {children}
    </div>
  );
}

function NumInput({ value, onChange, unit }: { value: number; onChange: (v: number) => void; unit?: string }) {
  return (
    <div className="flex-1 flex items-center">
      <input
        type="number"
        value={Math.round(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-7 px-2 text-xs rounded-md border bg-white outline-none focus:border-[#1F3653] text-[#1B2940]"
      />
      {unit && <span className="text-[9px] text-[#1B2940]/30 ml-1">{unit}</span>}
    </div>
  );
}

export function StudioInspector() {
  const { showInspector, editor } = usePlannerStore();
  const [selected, setSelected] = useState<TLShape[]>([]);
  const [allShapes, setAllShapes] = useState<TLShape[]>([]);
  const [showLayers, setShowLayers] = useState(false);

  useEffect(() => {
    if (!editor) return;
    const update = () => {
      const ids = editor.getSelectedShapeIds();
      const shapes = ids.map((id) => editor.getShape(id)).filter(Boolean) as TLShape[];
      setSelected(shapes);
      setAllShapes([...editor.getCurrentPageShapeIds()].map((id) => editor.getShape(id)).filter(Boolean) as TLShape[]);
    };
    update();
    const cleanup = editor.store.listen(update);
    return () => cleanup();
  }, [editor]);

  const shape = selected.length === 1 ? selected[0] : null;
  const props = shape?.props as Record<string, any> | undefined;

  const updateShape = useCallback((partial: any) => {
    if (!shape || !editor) return;
    editor.updateShape({ id: shape.id, type: shape.type, ...partial } as any);
  }, [shape, editor]);

  const updateProps = useCallback((propPartial: any) => {
    if (!shape || !editor) return;
    editor.updateShape({ id: shape.id, type: shape.type, props: { ...props, ...propPartial } } as any);
  }, [shape, editor, props]);

  if (!showInspector) return null;

  return (
    <div className="absolute top-12 right-0 bottom-8 z-20 w-[280px] border-l bg-white flex flex-col shadow-lg">
      <div className="px-3 py-2 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLayers(false)}
            className={cn("text-[11px] font-semibold px-2 py-1 rounded-md", !showLayers ? "bg-[#1F3653] text-white" : "text-[#1B2940]/50 hover:bg-[#1F3653]/5")}
          >
            Properties
          </button>
          <button
            onClick={() => setShowLayers(true)}
            className={cn("text-[11px] font-semibold px-2 py-1 rounded-md flex items-center gap-1", showLayers ? "bg-[#1F3653] text-white" : "text-[#1B2940]/50 hover:bg-[#1F3653]/5")}
          >
            <Layers className="h-3 w-3" /> Layers
          </button>
        </div>
        <span className="text-[10px] text-[#1B2940]/30">{selected.length ? `${selected.length} sel` : ""}</span>
      </div>

      {showLayers ? (
        <div className="flex-1 overflow-y-auto">
          {allShapes.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#1B2940]/30">No shapes on canvas</div>
          ) : (
            <div className="py-1">
              {[...allShapes].reverse().map((s) => {
                const sp = s.props as any;
                const isSelected = selected.some((sel) => sel.id === s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => editor?.setSelectedShapes([s])}
                    className={cn(
                      "flex items-center gap-2 w-full px-3 py-1.5 text-left text-xs hover:bg-[#1F3653]/5 transition-colors",
                      isSelected && "bg-[#1F3653]/10"
                    )}
                  >
                    <div className="w-4 h-4 rounded border border-[#1F3653]/20 bg-[#1F3653]/5 flex items-center justify-center">
                      <Box className="h-2.5 w-2.5 text-[#1F3653]/60" />
                    </div>
                    <span className="flex-1 truncate text-[#1B2940]">{sp?.text || s.type}</span>
                    <span className="text-[9px] text-[#1B2940]/30 capitalize">{s.type}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : shape ? (
        <div className="flex-1 overflow-y-auto">
          <Section title="Element" icon={Box}>
            <div className="flex items-center gap-2">
              <div className="flex h-8 items-center gap-2 px-2 bg-[#f8f9fb] rounded-lg flex-1">
                <Box className="h-3.5 w-3.5 text-[#1F3653]/60" />
                <span className="text-xs font-medium text-[#1B2940] capitalize">{shape.type}</span>
              </div>
              <button onClick={() => editor?.duplicateShapes([shape.id])} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-[#1F3653]/10" title="Duplicate">
                <Copy className="h-3.5 w-3.5 text-[#1B2940]/50" />
              </button>
              <button onClick={() => editor?.deleteShapes([shape.id])} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-red-50" title="Delete">
                <Trash2 className="h-3.5 w-3.5 text-red-400" />
              </button>
            </div>
          </Section>

          <Section title="Position" icon={Move}>
            <div className="grid grid-cols-2 gap-2">
              <PropRow label="X"><NumInput value={shape.x} onChange={(v) => updateShape({ x: v })} /></PropRow>
              <PropRow label="Y"><NumInput value={shape.y} onChange={(v) => updateShape({ y: v })} /></PropRow>
            </div>
          </Section>

          <Section title="Rotation" icon={RotateCw}>
            <PropRow label="°">
              <NumInput value={(shape.rotation || 0) * (180 / Math.PI)} onChange={(v) => updateShape({ rotation: v * (Math.PI / 180) })} unit="deg" />
            </PropRow>
          </Section>

          {props?.w !== undefined && props?.h !== undefined && (
            <Section title="Size" icon={Ruler}>
              <div className="grid grid-cols-2 gap-2">
                <PropRow label="W"><NumInput value={props.w} onChange={(v) => updateProps({ w: v })} /></PropRow>
                <PropRow label="H"><NumInput value={props.h} onChange={(v) => updateProps({ h: v })} /></PropRow>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[9px] text-[#1B2940]/30">Real size:</span>
                <span className="text-[9px] font-medium text-[#1F3653]">{Math.round(props.w / 2)}×{Math.round(props.h / 2)} cm</span>
              </div>
            </Section>
          )}

          {props?.text !== undefined && (
            <Section title="Label" icon={Type}>
              <input
                type="text"
                value={props.text || ""}
                onChange={(e) => updateProps({ text: e.target.value })}
                placeholder="Enter label..."
                className="w-full h-7 px-2 text-xs rounded-md border bg-white outline-none focus:border-[#1F3653]"
              />
            </Section>
          )}

          {props?.color !== undefined && (
            <Section title="Style" icon={Palette}>
              <div>
                <span className="text-[10px] text-[#1B2940]/40 mb-1 block">Color</span>
                <div className="flex flex-wrap gap-1">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => updateProps({ color: c.value })}
                      className={cn("w-6 h-6 rounded-md border-2 transition-all", props.color === c.value ? "border-[#1F3653] scale-110" : "border-transparent hover:border-[#1F3653]/30")}
                      style={{ background: c.bg }}
                      title={c.value}
                    />
                  ))}
                </div>
              </div>
              {props?.fill !== undefined && (
                <div className="mt-2">
                  <span className="text-[10px] text-[#1B2940]/40 mb-1 block">Fill</span>
                  <div className="flex gap-1">
                    {FILL_OPTIONS.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => updateProps({ fill: f.value })}
                        className={cn("px-2 py-1 text-[10px] font-medium rounded-md border transition-all",
                          props.fill === f.value ? "bg-[#1F3653] text-white border-[#1F3653]" : "border-[#1F3653]/10 text-[#1B2940]/60 hover:bg-[#1F3653]/5"
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Section>
          )}

          <Section title="Arrange" icon={Layers} defaultOpen={false}>
            <div className="flex gap-1">
              <button onClick={() => editor?.bringForward([shape.id])} className="flex-1 flex items-center justify-center gap-1 h-7 rounded-md border text-[10px] font-medium hover:bg-[#1F3653]/5">
                <MoveUp className="h-3 w-3" /> Forward
              </button>
              <button onClick={() => editor?.sendBackward([shape.id])} className="flex-1 flex items-center justify-center gap-1 h-7 rounded-md border text-[10px] font-medium hover:bg-[#1F3653]/5">
                <MoveDown className="h-3 w-3" /> Backward
              </button>
            </div>
          </Section>
        </div>
      ) : selected.length > 1 ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#1F3653] mb-1">{selected.length}</div>
            <p className="text-xs text-[#1B2940]/40">shapes selected</p>
            <div className="flex gap-1 mt-3 justify-center">
              <button onClick={() => editor?.deleteShapes(selected.map((s) => s.id))} className="px-3 py-1.5 rounded-md bg-red-50 text-red-500 text-[10px] font-semibold hover:bg-red-100">
                Delete All
              </button>
              <button onClick={() => editor?.duplicateShapes(selected.map((s) => s.id))} className="px-3 py-1.5 rounded-md bg-[#1F3653]/5 text-[#1F3653] text-[10px] font-semibold hover:bg-[#1F3653]/10">
                Duplicate All
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-[#1B2940]/20">
            <Settings2 className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-xs font-medium">Select a shape</p>
            <p className="text-[10px] mt-1 opacity-60">Click any element on the canvas to inspect and edit its properties</p>
          </div>
        </div>
      )}
    </div>
  );
}

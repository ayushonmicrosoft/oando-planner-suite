"use client";

import { Suspense, lazy, useCallback, useEffect, useRef } from "react";
import type { Editor, TLComponents, TLUiOverrides } from "tldraw";
import "tldraw/tldraw.css";
import { usePlannerStore } from "./planner-store";
import { StudioToolbar } from "./StudioToolbar";
import { StudioCatalog } from "./StudioCatalog";
import { StudioInspector } from "./StudioInspector";
import { StudioStatusBar } from "./StudioStatusBar";
import { Studio3DView } from "./Studio3DView";
import { Loader2 } from "lucide-react";

const TldrawEditor = lazy(() =>
  import("tldraw").then((mod) => ({ default: mod.Tldraw }))
);

const CANVAS_COMPONENTS: TLComponents = {
  SharePanel: null,
  TopPanel: null,
  MenuPanel: null,
  StylePanel: null,
  PageMenu: null,
  NavigationPanel: null,
  HelpMenu: null,
  DebugPanel: null,
  DebugMenu: null,
};

const UI_OVERRIDES: TLUiOverrides = {
  tools(editor, tools) {
    return tools;
  },
  actions(editor, actions) {
    return actions;
  },
};

export function StudioPlanner() {
  const {
    setEditor, showCatalog, showInspector, showGrid, show3D,
    setZoom, setShapeCount, setCursorPos,
  } = usePlannerStore();
  const editorRef = useRef<Editor | null>(null);

  const handleMount = useCallback(
    (editor: Editor) => {
      editorRef.current = editor;
      setEditor(editor);

      editor.updateInstanceState({ isGridMode: true });
      editor.user.updateUserPreferences({ colorScheme: "light" });

      const updateMeta = () => {
        const z = Math.round(editor.getZoomLevel() * 100);
        usePlannerStore.getState().setZoom(z);
        usePlannerStore.getState().setShapeCount(editor.getCurrentPageShapeIds().size);
      };

      updateMeta();
      editor.store.listen(updateMeta);

      editor.on("event" as any, (info: any) => {
        if (info.name === "pointer_move" && info.point) {
          const p = editor.screenToPage(info.point);
          usePlannerStore.getState().setCursorPos({ x: p.x, y: p.y });
        }
      });
    },
    [setEditor]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const editor = editorRef.current;
      if (!editor) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && key === "z" && !e.shiftKey) { e.preventDefault(); editor.undo(); return; }
      if (ctrl && key === "z" && e.shiftKey) { e.preventDefault(); editor.redo(); return; }
      if (ctrl && key === "y") { e.preventDefault(); editor.redo(); return; }
      if (ctrl && key === "d") {
        e.preventDefault();
        editor.duplicateShapes(editor.getSelectedShapeIds());
        return;
      }
      if (ctrl && key === "a") {
        e.preventDefault();
        const ids = [...editor.getCurrentPageShapeIds()];
        editor.setSelectedShapes(ids.map((id) => editor.getShape(id)!).filter(Boolean));
        return;
      }

      if (key === "delete" || key === "backspace") {
        editor.deleteShapes(editor.getSelectedShapeIds());
        return;
      }

      const toolMap: Record<string, string> = {
        v: "select", h: "hand", d: "draw", e: "eraser",
        r: "geo", l: "line", t: "text", f: "frame",
        n: "note", a: "arrow",
      };

      if (toolMap[key]) {
        const tool = toolMap[key];
        usePlannerStore.getState().setActiveTool(tool as any);
        editor.setCurrentTool(tool);
      }

      if (key === "c" && !ctrl) {
        usePlannerStore.getState().toggleCatalog();
      }
      if (key === "g" && !ctrl) {
        usePlannerStore.getState().toggleGrid();
        editor.updateInstanceState({ isGridMode: !usePlannerStore.getState().showGrid });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor) {
      editor.updateInstanceState({ isGridMode: showGrid });
    }
  }, [showGrid]);

  const catalogW = showCatalog ? 300 : 0;
  const inspectorW = showInspector && !show3D ? 280 : 0;
  const threeDW = show3D ? "50%" : "0";

  return (
    <div className="h-screen w-full relative overflow-hidden bg-brand-surface-alt">
      <StudioToolbar />
      <StudioCatalog />
      {!show3D && <StudioInspector />}
      <Studio3DView />
      <StudioStatusBar />

      <div
        className="absolute transition-all duration-300 ease-out"
        style={{
          top: 48,
          bottom: 32,
          left: catalogW,
          right: show3D ? threeDW : inspectorW,
        }}
      >
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center bg-brand-surface">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-navy/20 mx-auto mb-3" />
                <p className="text-xs text-navy-text/30 font-medium">Loading tldraw engine...</p>
              </div>
            </div>
          }
        >
          <TldrawEditor
            onMount={handleMount}
            components={CANVAS_COMPONENTS}
            overrides={UI_OVERRIDES}
            autoFocus
          />
        </Suspense>
      </div>
    </div>
  );
}

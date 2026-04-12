"use client";

import { Suspense, lazy, useCallback, useEffect, useRef, useMemo } from "react";
import type { Editor, TLComponents, TLUiOverrides } from "tldraw";
import "tldraw/tldraw.css";
import { usePlannerStore } from "./planner-store";
import { StudioToolbar } from "./StudioToolbar";
import { StudioSidebar } from "./StudioSidebar";
import { StudioCatalog } from "./StudioCatalog";
import { StudioInspector } from "./StudioInspector";
import { StudioStatusBar } from "./StudioStatusBar";
import { Studio3DView } from "./Studio3DView";
import { VersionHistoryPanel } from "./VersionHistoryPanel";
import { Loader2 } from "lucide-react";

const TldrawEditor = lazy(() =>
  import("tldraw").then((mod) => ({ default: mod.Tldraw }))
);

const CANVAS_COMPONENTS: TLComponents = {
  SharePanel: null,
  TopPanel: null,
  MenuPanel: null,
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

function countShapesByMeta(editor: Editor) {
  const counts = { walls: 0, rooms: 0, doors: 0, windows: 0, furniture: 0, zones: 0 };
  const shapes = editor.getCurrentPageShapes();
  for (const shape of shapes) {
    const meta = (shape.meta || {}) as Record<string, string>;
    const archType = meta.archType;
    if (archType === "wall") counts.walls++;
    else if (archType === "room") counts.rooms++;
    else if (archType === "door") counts.doors++;
    else if (archType === "window") counts.windows++;
    else if (archType === "furniture") counts.furniture++;
    else if (archType === "zone") counts.zones++;
    else {
      if (shape.type === "line" || shape.type === "arrow") counts.walls++;
      else if (shape.type === "geo") counts.rooms++;
      else if (shape.type === "frame") counts.zones++;
      else if (shape.type === "note" || shape.type === "text") {}
      else counts.furniture++;
    }
  }
  return counts;
}

export function StudioPlanner() {
  const {
    setEditor, showCatalog, showInspector, showGrid, show3D,
    setZoom, setShapeCount, setCursorPos, setShapeCounts,
    currentPlanId, showVersionHistory, setCurrentPlanId,
    setVersionHistoryOpen,
  } = usePlannerStore();
  const editorRef = useRef<Editor | null>(null);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const idStr = sp.get("id");
    if (idStr) {
      const id = parseInt(idStr, 10);
      if (!isNaN(id) && id > 0) {
        setCurrentPlanId(id);
        if (sp.get("versions") === "1") {
          setVersionHistoryOpen(true);
        }
      }
    }
    return () => { setCurrentPlanId(null); };
  }, [setCurrentPlanId, setVersionHistoryOpen]);

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
        usePlannerStore.getState().setShapeCounts(countShapesByMeta(editor));
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

      const toolMap: Record<string, { tool: string; tldrawTool: string }> = {
        v: { tool: "select", tldrawTool: "select" },
        h: { tool: "hand", tldrawTool: "hand" },
        w: { tool: "wall", tldrawTool: "line" },
        r: { tool: "room", tldrawTool: "geo" },
        d: { tool: "door", tldrawTool: "geo" },
        f: { tool: "furniture", tldrawTool: "select" },
        z: { tool: "zone", tldrawTool: "geo" },
        m: { tool: "measure", tldrawTool: "select" },
        e: { tool: "eraser", tldrawTool: "eraser" },
        t: { tool: "text", tldrawTool: "text" },
        l: { tool: "line", tldrawTool: "line" },
      };

      if (toolMap[key] && !ctrl) {
        const mapped = toolMap[key];
        usePlannerStore.getState().setActiveTool(mapped.tool as any);
        editor.setCurrentTool(mapped.tldrawTool);
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

  const sidebarW = 120;
  const catalogW = showCatalog ? 300 : 0;
  const inspectorW = showInspector && !show3D ? 280 : 0;
  const threeDW = show3D ? "50%" : "0";

  return (
    <div className="h-screen w-full relative overflow-hidden bg-brand-surface-alt">
      <StudioToolbar />
      <StudioSidebar />
      <StudioCatalog />
      {!show3D && <StudioInspector />}
      <Studio3DView />
      <StudioStatusBar />
      <VersionHistoryPanel
        planId={currentPlanId}
        getCurrentDocument={() => {
          const editor = editorRef.current;
          if (!editor) return null;
          try {
            const snapshot = editor.store.getSnapshot("document");
            return JSON.stringify(snapshot);
          } catch {
            return null;
          }
        }}
        onRestore={(documentJson) => {
          const editor = editorRef.current;
          if (!editor) {
            window.location.reload();
            return;
          }
          try {
            const snapshot = JSON.parse(documentJson);
            if (snapshot?.store && snapshot?.schema) {
              editor.store.loadSnapshot(snapshot);
            } else {
              window.location.reload();
            }
          } catch {
            window.location.reload();
          }
        }}
      />

      <div
        className="absolute transition-all duration-300 ease-out"
        style={{
          top: 48,
          bottom: 32,
          left: sidebarW + catalogW,
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

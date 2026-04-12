import { create } from "zustand";
import type { Editor } from "tldraw";
import type { CollabUser } from "./useCollaboration";

export type PlannerStep = "layout" | "furnish" | "review" | "export";
export type CanvasToolMode =
  | "select" | "draw" | "hand" | "eraser"
  | "geo" | "line" | "text" | "frame"
  | "note" | "arrow" | "laser" | "highlight"
  | "wall" | "room" | "door" | "window"
  | "furniture" | "zone" | "measure";

export interface CatalogProduct {
  id: string;
  name: string;
  category: string;
  subCategory?: string | null;
  widthCm: number;
  depthCm: number;
  heightCm: number;
  color?: string;
  shape?: string;
  imageUrl?: string;
  description?: string;
  price?: number;
  seatCount?: number;
}

export type LabelUnit = "cm" | "m";

interface PlannerState {
  editor: Editor | null;
  setEditor: (editor: Editor | null) => void;

  step: PlannerStep;
  setStep: (step: PlannerStep) => void;

  activeTool: CanvasToolMode;
  setActiveTool: (tool: CanvasToolMode) => void;

  planName: string;
  setPlanName: (name: string) => void;

  isDirty: boolean;
  setDirty: (dirty: boolean) => void;

  showCatalog: boolean;
  toggleCatalog: () => void;
  setCatalogOpen: (open: boolean) => void;

  showInspector: boolean;
  toggleInspector: () => void;
  setInspectorOpen: (open: boolean) => void;

  showGrid: boolean;
  toggleGrid: () => void;

  showMinimap: boolean;
  toggleMinimap: () => void;

  show3D: boolean;
  toggle3D: () => void;

  zoom: number;
  setZoom: (zoom: number) => void;

  shapeCount: number;
  setShapeCount: (count: number) => void;

  cursorPos: { x: number; y: number };
  setCursorPos: (pos: { x: number; y: number }) => void;

  catalogTab: string;
  setCatalogTab: (tab: string) => void;

  catalogSearch: string;
  setCatalogSearch: (q: string) => void;

  snapDistance: number;
  setSnapDistance: (d: number) => void;

  labelUnit: LabelUnit;
  setLabelUnit: (u: LabelUnit) => void;

  showSettings: boolean;
  toggleSettings: () => void;

  shapeCounts: { walls: number; rooms: number; doors: number; windows: number; furniture: number; zones: number };
  setShapeCounts: (c: Partial<PlannerState["shapeCounts"]>) => void;

  isSaved: boolean;
  setSaved: (saved: boolean) => void;

  currentPlanId: number | null;
  setCurrentPlanId: (id: number | null) => void;

  showVersionHistory: boolean;
  toggleVersionHistory: () => void;
  setVersionHistoryOpen: (open: boolean) => void;

  collabPlanId: string | null;
  setCollabPlanId: (id: string | null) => void;
  collaborators: CollabUser[];
  setCollaborators: (users: CollabUser[]) => void;
  collabConnected: boolean;
  setCollabConnected: (connected: boolean) => void;
}

export const usePlannerStore = create<PlannerState>()((set) => ({
  editor: null,
  setEditor: (editor) => set({ editor }),

  step: "layout",
  setStep: (step) => set({ step }),

  activeTool: "select",
  setActiveTool: (activeTool) => set({ activeTool }),

  planName: "Untitled Workspace",
  setPlanName: (planName) => set({ planName, isDirty: true }),

  isDirty: false,
  setDirty: (isDirty) => set({ isDirty }),

  showCatalog: true,
  toggleCatalog: () => set((s) => ({ showCatalog: !s.showCatalog })),
  setCatalogOpen: (showCatalog) => set({ showCatalog }),

  showInspector: false,
  toggleInspector: () => set((s) => ({ showInspector: !s.showInspector })),
  setInspectorOpen: (showInspector) => set({ showInspector }),

  showGrid: true,
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),

  showMinimap: false,
  toggleMinimap: () => set((s) => ({ showMinimap: !s.showMinimap })),

  show3D: false,
  toggle3D: () => set((s) => ({ show3D: !s.show3D })),

  zoom: 100,
  setZoom: (zoom) => set({ zoom }),

  shapeCount: 0,
  setShapeCount: (shapeCount) => set({ shapeCount }),

  cursorPos: { x: 0, y: 0 },
  setCursorPos: (cursorPos) => set({ cursorPos }),

  catalogTab: "all",
  setCatalogTab: (catalogTab) => set({ catalogTab }),

  catalogSearch: "",
  setCatalogSearch: (catalogSearch) => set({ catalogSearch }),

  snapDistance: 10,
  setSnapDistance: (snapDistance) => set({ snapDistance }),

  labelUnit: "cm",
  setLabelUnit: (labelUnit) => set({ labelUnit }),

  showSettings: false,
  toggleSettings: () => set((s) => ({ showSettings: !s.showSettings })),

  shapeCounts: { walls: 0, rooms: 0, doors: 0, windows: 0, furniture: 0, zones: 0 },
  setShapeCounts: (c) => set((s) => ({ shapeCounts: { ...s.shapeCounts, ...c } })),

  isSaved: false,
  setSaved: (isSaved) => set({ isSaved }),

  currentPlanId: null,
  setCurrentPlanId: (currentPlanId) => set({ currentPlanId }),

  showVersionHistory: false,
  toggleVersionHistory: () => set((s) => ({ showVersionHistory: !s.showVersionHistory })),
  setVersionHistoryOpen: (showVersionHistory) => set({ showVersionHistory }),

  collabPlanId: null,
  setCollabPlanId: (collabPlanId) => set({ collabPlanId }),
  collaborators: [],
  setCollaborators: (collaborators) => set({ collaborators }),
  collabConnected: false,
  setCollabConnected: (collabConnected) => set({ collabConnected }),
}));

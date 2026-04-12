export interface UnifiedRoomItem {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  rotation: number;
}

export interface UnifiedStructureItem {
  id: string;
  defLabel: string;
  kind: "rect" | "ellipse";
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  rotation: number;
  details?: {
    type: "line" | "rect" | "circle";
    x?: number;
    y?: number;
    w?: number;
    h?: number;
    r?: number;
    points?: number[];
    stroke?: string;
    strokeWidth?: number;
    fill?: string;
    radius?: number;
  }[];
}

export interface UnifiedFurnitureItem {
  instanceId: string;
  catalogId: string;
  name: string;
  category: string;
  widthCm: number;
  depthCm: number;
  heightCm: number;
  color: string;
  shape: string;
  seatCount: number | null;
  price: number | null;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  locked: boolean;
  opacity: number;
  zIndex: number;
}

export interface UnifiedAnnotation {
  id: string;
  tool: "line" | "rect" | "circle" | "text";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  stroke: string;
  strokeWidth: number;
  fill?: string;
  text?: string;
  points?: number[];
}

export interface UnifiedSiteItem {
  id: string;
  label: string;
  kind: "rect" | "ellipse";
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  rotation: number;
}

export interface UnifiedImportLayer {
  annotations: UnifiedAnnotation[];
  scale: number;
  unit: "ft" | "m" | "cm";
  calibrated: boolean;
  imageDataUrl?: string;
  fileName?: string;
}

export interface UnifiedDocument {
  version: 3;
  rooms: UnifiedRoomItem[];
  structure: UnifiedStructureItem[];
  furniture: UnifiedFurnitureItem[];
  annotations: UnifiedAnnotation[];
  site: UnifiedSiteItem[];
  importLayer: UnifiedImportLayer | null;
  roomWidthCm?: number;
  roomDepthCm?: number;
  currentStep?: WorkflowStep;
}

export type WorkflowStep = "rooms" | "structure" | "furniture" | "3d-review" | "quote";

export const WORKFLOW_STEPS: { step: WorkflowStep; label: string; tool: string; href: string }[] = [
  { step: "rooms", label: "Define Rooms", tool: "Floor Plan Creator", href: "/tools/floor-plan" },
  { step: "structure", label: "Add Structure", tool: "Custom Shapes", href: "/tools/shapes" },
  { step: "furniture", label: "Place Furniture", tool: "Canvas Planner", href: "/planner/canvas" },
  { step: "3d-review", label: "3D Review", tool: "3D Viewer", href: "/viewer/3d" },
  { step: "quote", label: "Generate Quote", tool: "Quote Builder", href: "" },
];

export function getStepIndex(step: WorkflowStep): number {
  return WORKFLOW_STEPS.findIndex((s) => s.step === step);
}

export function getNextStep(step: WorkflowStep): typeof WORKFLOW_STEPS[number] | null {
  const idx = getStepIndex(step);
  return idx >= 0 && idx < WORKFLOW_STEPS.length - 1 ? WORKFLOW_STEPS[idx + 1] : null;
}

export function getPrevStep(step: WorkflowStep): typeof WORKFLOW_STEPS[number] | null {
  const idx = getStepIndex(step);
  return idx > 0 ? WORKFLOW_STEPS[idx - 1] : null;
}

export function getStepForTool(toolPath: string): WorkflowStep | null {
  if (toolPath.includes("floor-plan")) return "rooms";
  if (toolPath.includes("shapes")) return "structure";
  if (toolPath.includes("canvas")) return "furniture";
  if (toolPath.includes("3d") || toolPath.includes("viewer")) return "3d-review";
  if (toolPath.includes("quote")) return "quote";
  return null;
}

export function getCompletedSteps(doc: UnifiedDocument): WorkflowStep[] {
  const completed: WorkflowStep[] = [];
  if (doc.rooms.length > 0) completed.push("rooms");
  if (doc.structure.length > 0) completed.push("structure");
  if (doc.furniture.length > 0) completed.push("furniture");
  return completed;
}

export function createEmptyDocument(): UnifiedDocument {
  return {
    version: 3,
    rooms: [],
    structure: [],
    furniture: [],
    annotations: [],
    site: [],
    importLayer: null,
  };
}

export function migrateDocument(jsonStr: string): UnifiedDocument {
  try {
    const raw = JSON.parse(jsonStr);

    if (raw.version === 3 && "rooms" in raw && "structure" in raw) {
      return raw as UnifiedDocument;
    }

    const doc = createEmptyDocument();

    if (Array.isArray(raw.rooms)) {
      doc.rooms = raw.rooms;
    }

    if (Array.isArray(raw.items)) {
      const firstItem = raw.items[0];
      if (firstItem) {
        if ("catalogId" in firstItem || "instanceId" in firstItem) {
          doc.furniture = raw.items;
        } else if ("defLabel" in firstItem) {
          doc.structure = raw.items;
        } else if ("label" in firstItem && "kind" in firstItem) {
          doc.site = raw.items;
        }
      }
    }

    if (Array.isArray(raw.shapes)) {
      doc.annotations = raw.shapes;
    }

    if (Array.isArray(raw.annotations)) {
      if (raw.scale !== undefined || raw.imageDataUrl !== undefined) {
        doc.importLayer = {
          annotations: raw.annotations,
          scale: raw.scale || 20,
          unit: raw.unit || "ft",
          calibrated: raw.calibrated || false,
          imageDataUrl: raw.imageDataUrl,
          fileName: raw.fileName,
        };
      } else {
        doc.annotations = raw.annotations;
      }
    }

    if (raw.roomWidthCm) doc.roomWidthCm = raw.roomWidthCm;
    if (raw.roomDepthCm) doc.roomDepthCm = raw.roomDepthCm;
    if (raw.currentStep) doc.currentStep = raw.currentStep;

    return doc;
  } catch {
    return createEmptyDocument();
  }
}

export function serializeDocument(doc: UnifiedDocument): string {
  return JSON.stringify(doc);
}

export function updateLayer<K extends keyof Omit<UnifiedDocument, "version">>(
  doc: UnifiedDocument,
  layer: K,
  data: UnifiedDocument[K],
): UnifiedDocument {
  return { ...doc, [layer]: data };
}

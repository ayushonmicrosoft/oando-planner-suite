export const UNIFIED_DOC_VERSION = 2;

export interface RoomLayer {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  rotation: number;
}

export interface StructureLayer {
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

export interface FurnitureLayer {
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

export interface AnnotationLayer {
  id: string;
  tool: "line" | "rect" | "circle" | "text";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  stroke: string;
  strokeWidth: number;
  fill: string;
  text?: string;
  points?: number[];
}

export interface SiteLayer {
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

export interface ImportLayer {
  imageDataUrl?: string;
  fileName?: string;
  scale: number;
  unit: string;
  calibrated: boolean;
  annotations: AnnotationLayer[];
}

export interface BlueprintLayer {
  roomType: string;
  categories: string[];
  boq: { itemId: string; count: number }[];
}

export type PlanStep = "rooms" | "structure" | "furniture" | "review" | "quote";

export interface UnifiedDocument {
  version: number;
  currentStep?: PlanStep;
  rooms?: RoomLayer[];
  structure?: StructureLayer[];
  furniture?: FurnitureLayer[];
  annotations?: AnnotationLayer[];
  site?: SiteLayer[];
  importLayer?: ImportLayer;
  blueprint?: BlueprintLayer;
  [key: string]: unknown;
}

export const WORKFLOW_STEPS: { step: PlanStep; label: string; toolPath: string; description: string }[] = [
  { step: "rooms", label: "Define Space", toolPath: "/tools/floor-plan", description: "Create room boundaries and layouts" },
  { step: "structure", label: "Add Structure", toolPath: "/tools/shapes", description: "Walls, doors, windows & columns" },
  { step: "furniture", label: "Place Furniture", toolPath: "/planner/canvas", description: "Drag furniture from catalog" },
  { step: "review", label: "3D Review", toolPath: "/viewer/3d", description: "Walk through your design in 3D" },
  { step: "quote", label: "Generate Quote", toolPath: "/plans", description: "BOQ & pricing for your client" },
];

export function getStepIndex(step?: PlanStep): number {
  if (!step) return 0;
  const idx = WORKFLOW_STEPS.findIndex((s) => s.step === step);
  return idx >= 0 ? idx : 0;
}

export function getNextStep(current?: PlanStep): (typeof WORKFLOW_STEPS)[number] | null {
  const idx = getStepIndex(current);
  return WORKFLOW_STEPS[idx + 1] || null;
}

export function getPrevStep(current?: PlanStep): (typeof WORKFLOW_STEPS)[number] | null {
  const idx = getStepIndex(current);
  return idx > 0 ? WORKFLOW_STEPS[idx - 1] : null;
}

export function getStepForTool(toolPath: string): PlanStep {
  const match = WORKFLOW_STEPS.find((s) => toolPath.includes(s.toolPath));
  return match?.step || "rooms";
}

export function migrateDocument(raw: unknown): UnifiedDocument {
  if (!raw || typeof raw !== "object") {
    return { version: UNIFIED_DOC_VERSION };
  }

  const doc = raw as Record<string, unknown>;

  if (doc.version === UNIFIED_DOC_VERSION) {
    return doc as UnifiedDocument;
  }

  const unified: UnifiedDocument = { version: UNIFIED_DOC_VERSION };

  if (Array.isArray(doc.rooms)) {
    unified.rooms = doc.rooms;
  }

  if (Array.isArray(doc.structure)) {
    unified.structure = doc.structure;
  }

  if (Array.isArray(doc.furniture)) {
    unified.furniture = doc.furniture;
  }

  if (Array.isArray(doc.items)) {
    const items = doc.items as Record<string, unknown>[];
    if (items.length > 0 && "catalogId" in items[0]) {
      unified.furniture = items as unknown as FurnitureLayer[];
    } else if (items.length > 0 && "defLabel" in items[0]) {
      unified.structure = items as unknown as StructureLayer[];
    } else if (items.length > 0 && "label" in items[0]) {
      unified.site = items as unknown as SiteLayer[];
    }
  }

  if (Array.isArray(doc.shapes)) {
    unified.annotations = doc.shapes as AnnotationLayer[];
  }

  if (Array.isArray(doc.annotations)) {
    if (doc.imageDataUrl || doc.scale || doc.calibrated) {
      unified.importLayer = {
        imageDataUrl: doc.imageDataUrl as string | undefined,
        fileName: doc.fileName as string | undefined,
        scale: (doc.scale as number) || 1,
        unit: (doc.unit as string) || "ft",
        calibrated: (doc.calibrated as boolean) || false,
        annotations: doc.annotations as AnnotationLayer[],
      };
    } else {
      unified.annotations = doc.annotations as AnnotationLayer[];
    }
  }

  if (Array.isArray(doc.boq)) {
    unified.blueprint = {
      roomType: (doc.roomType as string) || "",
      categories: (doc.categories as string[]) || [],
      boq: doc.boq as { itemId: string; count: number }[],
    };
  }

  if (doc.currentStep) {
    unified.currentStep = doc.currentStep as PlanStep;
  }

  return unified;
}

export function mergeLayerIntoDocument(
  existing: UnifiedDocument,
  layerKey: keyof UnifiedDocument,
  layerData: unknown,
  newStep?: PlanStep
): UnifiedDocument {
  return {
    ...existing,
    version: UNIFIED_DOC_VERSION,
    [layerKey]: layerData,
    ...(newStep ? { currentStep: newStep } : {}),
  };
}

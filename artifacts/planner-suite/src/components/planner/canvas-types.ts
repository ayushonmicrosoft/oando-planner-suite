import type { PlacedItem } from '@/hooks/use-canvas-planner';

export const GRID_CM = 10;
export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 3;
export const ZOOM_STEP = 0.1;
export const SNAP_THRESHOLD_CM = 8;
export const ALIGNMENT_GUIDE_COLOR = '#3b82f6';

export interface FormErrors {
  planName?: string;
  roomWidth?: string;
  roomDepth?: string;
}

export function validateForm(planName: string, roomWidthCm: number, roomDepthCm: number): FormErrors {
  const errors: FormErrors = {};
  
  if (!planName.trim()) {
    errors.planName = "Plan name is required.";
  } else if (planName.trim().length < 2) {
    errors.planName = "Plan name must be at least 2 characters.";
  }

  if (!roomWidthCm || roomWidthCm <= 0) {
    errors.roomWidth = "Width must be a positive number.";
  } else if (roomWidthCm < 50) {
    errors.roomWidth = "Minimum width is 50 cm.";
  } else if (roomWidthCm > 10000) {
    errors.roomWidth = "Maximum width is 10000 cm.";
  }

  if (!roomDepthCm || roomDepthCm <= 0) {
    errors.roomDepth = "Depth must be a positive number.";
  } else if (roomDepthCm < 50) {
    errors.roomDepth = "Minimum depth is 50 cm.";
  } else if (roomDepthCm > 10000) {
    errors.roomDepth = "Maximum depth is 10000 cm.";
  }

  return errors;
}

export interface AlignmentGuide {
  orientation: 'h' | 'v';
  position: number;
}

export function computeAlignmentGuides(
  draggingItem: PlacedItem,
  allItems: PlacedItem[],
  roomWidthCm: number,
  roomDepthCm: number,
): AlignmentGuide[] {
  const guides: AlignmentGuide[] = [];
  const dx = draggingItem.x;
  const dy = draggingItem.y;
  const dw = draggingItem.widthCm;
  const dh = draggingItem.depthCm;
  const dCx = dx + dw / 2;
  const dCy = dy + dh / 2;
  const dRight = dx + dw;
  const dBottom = dy + dh;

  const wallEdges = {
    left: 0, top: 0, right: roomWidthCm, bottom: roomDepthCm,
  };

  if (Math.abs(dx - wallEdges.left) < SNAP_THRESHOLD_CM) guides.push({ orientation: 'v', position: wallEdges.left });
  if (Math.abs(dRight - wallEdges.right) < SNAP_THRESHOLD_CM) guides.push({ orientation: 'v', position: wallEdges.right });
  if (Math.abs(dy - wallEdges.top) < SNAP_THRESHOLD_CM) guides.push({ orientation: 'h', position: wallEdges.top });
  if (Math.abs(dBottom - wallEdges.bottom) < SNAP_THRESHOLD_CM) guides.push({ orientation: 'h', position: wallEdges.bottom });

  for (const other of allItems) {
    if (other.instanceId === draggingItem.instanceId) continue;
    const ox = other.x;
    const oy = other.y;
    const ow = other.widthCm;
    const oh = other.depthCm;
    const oCx = ox + ow / 2;
    const oCy = oy + oh / 2;
    const oRight = ox + ow;
    const oBottom = oy + oh;

    if (Math.abs(dx - ox) < SNAP_THRESHOLD_CM) guides.push({ orientation: 'v', position: ox });
    if (Math.abs(dRight - oRight) < SNAP_THRESHOLD_CM) guides.push({ orientation: 'v', position: oRight });
    if (Math.abs(dCx - oCx) < SNAP_THRESHOLD_CM) guides.push({ orientation: 'v', position: oCx });
    if (Math.abs(dx - oRight) < SNAP_THRESHOLD_CM) guides.push({ orientation: 'v', position: oRight });
    if (Math.abs(dRight - ox) < SNAP_THRESHOLD_CM) guides.push({ orientation: 'v', position: ox });

    if (Math.abs(dy - oy) < SNAP_THRESHOLD_CM) guides.push({ orientation: 'h', position: oy });
    if (Math.abs(dBottom - oBottom) < SNAP_THRESHOLD_CM) guides.push({ orientation: 'h', position: oBottom });
    if (Math.abs(dCy - oCy) < SNAP_THRESHOLD_CM) guides.push({ orientation: 'h', position: oCy });
    if (Math.abs(dy - oBottom) < SNAP_THRESHOLD_CM) guides.push({ orientation: 'h', position: oBottom });
    if (Math.abs(dBottom - oy) < SNAP_THRESHOLD_CM) guides.push({ orientation: 'h', position: oy });
  }

  const unique: AlignmentGuide[] = [];
  const seen = new Set<string>();
  for (const g of guides) {
    const key = `${g.orientation}_${Math.round(g.position)}`;
    if (!seen.has(key)) { seen.add(key); unique.push(g); }
  }
  return unique;
}

export type DrawToolType = 'select' | 'draw-line' | 'draw-rect' | 'draw-ellipse' | 'draw-text';

export interface DrawnShape {
  id: string;
  type: 'line' | 'rect' | 'ellipse' | 'text';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke: string;
  fill: string;
  strokeWidth: number;
  text?: string;
  fontSize?: number;
}

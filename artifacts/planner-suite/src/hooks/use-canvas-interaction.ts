import { useState, useRef, useEffect, useCallback } from 'react';
import type Konva from 'konva';
import type { PlacedItem } from '@/hooks/use-canvas-planner';
import { type DrawToolType, type DrawnShape, MIN_ZOOM, MAX_ZOOM, ZOOM_STEP } from '@/components/planner/canvas-types';

interface UseCanvasInteractionArgs {
  stageRef: React.RefObject<Konva.Stage | null>;
  zoom: number;
  setZoom: (v: number | ((z: number) => number)) => void;
  panOffset: { x: number; y: number };
  setPanOffset: (v: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  roomOffsetX: number;
  roomOffsetY: number;
  pxPerCm: number;
  selectedItemIds: Set<string>;
  setSelectedItemIds: (v: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  undo: () => void;
  redo: () => void;
  duplicateItems: (ids: string[]) => void;
  deleteItems: (ids: string[]) => void;
  rotateItem: (id: string) => void;
  selectAll: () => void;
  measureMode: boolean;
  measurePoints: { x: number; y: number }[];
  setMeasurePoints: (v: { x: number; y: number }[] | ((prev: { x: number; y: number }[]) => { x: number; y: number }[])) => void;
}

export function useCanvasInteraction({
  stageRef, zoom, setZoom, panOffset, setPanOffset,
  roomOffsetX, roomOffsetY, pxPerCm,
  selectedItemIds, setSelectedItemIds,
  undo, redo, duplicateItems, deleteItems, rotateItem, selectAll,
  measureMode, measurePoints, setMeasurePoints,
}: UseCanvasInteractionArgs) {
  const [isPanning, setIsPanning] = useState(false);
  const [spaceDown, setSpaceDown] = useState(false);
  const lastPointerPos = useRef<{ x: number; y: number } | null>(null);

  const [drawTool, setDrawTool] = useState<DrawToolType>('select');
  const [drawnShapes, setDrawnShapes] = useState<DrawnShape[]>([]);
  const [drawStroke, setDrawStroke] = useState('#1e293b');
  const [drawFill, setDrawFill] = useState('transparent');
  const [drawStrokeWidth, setDrawStrokeWidth] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawCurrent, setDrawCurrent] = useState<{ x: number; y: number } | null>(null);
  const [pendingTextPos, setPendingTextPos] = useState<{ x: number; y: number } | null>(null);
  const [pendingTextValue, setPendingTextValue] = useState('');
  const [selectedDrawShapeId, setSelectedDrawShapeId] = useState<string | null>(null);

  const isDrawMode = drawTool !== 'select';

  const getPointerCm = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return null;
    const pointer = stage.getPointerPosition();
    if (!pointer) return null;
    const xCm = (pointer.x / zoom - panOffset.x / zoom - roomOffsetX) / pxPerCm;
    const yCm = (pointer.y / zoom - panOffset.y / zoom - roomOffsetY) / pxPerCm;
    return { x: xCm, y: yCm };
  }, [stageRef, zoom, panOffset, roomOffsetX, roomOffsetY, pxPerCm]);

  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const scaleBy = 1.08;
    const stage = stageRef.current;
    if (!stage) return;
    const oldScale = zoom;
    const newScale = e.evt.deltaY < 0
      ? Math.min(MAX_ZOOM, oldScale * scaleBy)
      : Math.max(MIN_ZOOM, oldScale / scaleBy);
    const pointer = stage.getPointerPosition();
    if (pointer) {
      const mousePointTo = {
        x: (pointer.x - panOffset.x) / oldScale,
        y: (pointer.y - panOffset.y) / oldScale,
      };
      setPanOffset({
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      });
    }
    setZoom(newScale);
  }, [stageRef, zoom, panOffset, setZoom, setPanOffset]);

  const handleStageMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (e.evt instanceof MouseEvent && e.evt.button === 1 || spaceDown) {
      setIsPanning(true);
      const stage = stageRef.current;
      if (stage) {
        const pos = stage.getPointerPosition();
        if (pos) lastPointerPos.current = pos;
      }
      return;
    }
    if (measureMode) {
      const pt = getPointerCm();
      if (!pt) return;
      if (measurePoints.length === 0) setMeasurePoints([pt]);
      else if (measurePoints.length === 1) setMeasurePoints((prev: { x: number; y: number }[]) => [...prev, pt]);
      else setMeasurePoints([pt]);
      return;
    }
    if (isDrawMode) {
      const pt = getPointerCm();
      if (!pt) return;
      if (drawTool === 'draw-text') { setPendingTextPos(pt); setPendingTextValue(''); return; }
      setIsDrawing(true); setDrawStart(pt); setDrawCurrent(pt);
      return;
    }
    if (e.target === e.target.getStage()) {
      setSelectedItemIds(new Set());
      setSelectedDrawShapeId(null);
    }
  }, [stageRef, setSelectedItemIds, spaceDown, measureMode, measurePoints, isDrawMode, drawTool, getPointerCm, setMeasurePoints]);

  const handleStageMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (isPanning && lastPointerPos.current) {
      const stage = stageRef.current;
      if (!stage) return;
      const pos = stage.getPointerPosition();
      if (!pos) return;
      setPanOffset((prev: { x: number; y: number }) => ({
        x: prev.x + (pos.x - lastPointerPos.current!.x),
        y: prev.y + (pos.y - lastPointerPos.current!.y),
      }));
      lastPointerPos.current = pos;
    }
    if (isDrawing && drawTool !== 'draw-text') {
      const pt = getPointerCm();
      if (pt) setDrawCurrent(pt);
    }
  }, [stageRef, isPanning, setPanOffset, isDrawing, drawTool, getPointerCm]);

  const handleStageMouseUp = useCallback(() => {
    setIsPanning(false);
    lastPointerPos.current = null;
    if (isDrawing && drawStart && drawCurrent && drawTool !== 'select' && drawTool !== 'draw-text') {
      const dx = drawCurrent.x - drawStart.x;
      const dy = drawCurrent.y - drawStart.y;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        const shapeType = drawTool === 'draw-line' ? 'line' : drawTool === 'draw-rect' ? 'rect' : 'ellipse';
        const newShape: DrawnShape = {
          id: `ds-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: shapeType,
          x1: drawStart.x, y1: drawStart.y, x2: drawCurrent.x, y2: drawCurrent.y,
          stroke: drawStroke, fill: drawFill, strokeWidth: drawStrokeWidth,
        };
        setDrawnShapes(prev => [...prev, newShape]);
      }
      setIsDrawing(false); setDrawStart(null); setDrawCurrent(null);
    }
  }, [isDrawing, drawStart, drawCurrent, drawTool, drawStroke, drawFill, drawStrokeWidth]);

  const handleItemSelect = useCallback((instanceId: string, e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const shiftKey = 'evt' in e ? (e.evt as MouseEvent).shiftKey : false;
    if (shiftKey) {
      setSelectedItemIds((prev: Set<string>) => {
        const next = new Set(prev);
        if (next.has(instanceId)) next.delete(instanceId);
        else next.add(instanceId);
        return next;
      });
    } else {
      setSelectedItemIds(new Set([instanceId]));
    }
  }, [setSelectedItemIds]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if (e.code === 'Space' && !isTyping) { e.preventDefault(); setSpaceDown(true); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey && !isTyping) { e.preventDefault(); undo(); return; }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey)) && !isTyping) { e.preventDefault(); redo(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && !isTyping) { e.preventDefault(); if (selectedItemIds.size > 0) duplicateItems(Array.from(selectedItemIds)); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === 'a' && !isTyping) { e.preventDefault(); selectAll(); return; }
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isTyping) { e.preventDefault(); if (selectedItemIds.size > 0) deleteItems(Array.from(selectedItemIds)); return; }
      if (e.key === 'Escape') { setSelectedItemIds(new Set()); return; }
      if (e.key === 'r' && !e.ctrlKey && !e.metaKey && !isTyping) { selectedItemIds.forEach(id => rotateItem(id)); return; }
      if ((e.key === '=' || e.key === '+') && !isTyping) { setZoom((z: number) => Math.min(MAX_ZOOM, z + ZOOM_STEP)); return; }
      if (e.key === '-' && !isTyping) { setZoom((z: number) => Math.max(MIN_ZOOM, z - ZOOM_STEP)); return; }
      if (e.key === '0' && !isTyping) { setZoom(1); setPanOffset({ x: 0, y: 0 }); return; }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') { setSpaceDown(false); setIsPanning(false); lastPointerPos.current = null; }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [selectedItemIds, undo, redo, duplicateItems, deleteItems, rotateItem, selectAll, setZoom, setPanOffset, setSelectedItemIds]);

  return {
    isPanning, spaceDown,
    drawTool, setDrawTool,
    drawnShapes, setDrawnShapes,
    drawStroke, setDrawStroke,
    drawFill, setDrawFill,
    drawStrokeWidth, setDrawStrokeWidth,
    isDrawMode, isDrawing,
    drawStart, drawCurrent,
    pendingTextPos, setPendingTextPos,
    pendingTextValue, setPendingTextValue,
    selectedDrawShapeId, setSelectedDrawShapeId,
    handleWheel, handleStageMouseDown, handleStageMouseMove, handleStageMouseUp,
    handleItemSelect,
  };
}

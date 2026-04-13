import { useState, useCallback } from 'react';

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

export function useDrawShapes() {
  const [drawTool, setDrawTool] = useState<DrawToolType>('select');
  const [drawnShapes, setDrawnShapes] = useState<DrawnShape[]>([]);
  const [strokeColor, setStrokeColor] = useState('#1e293b');
  const [fillColor, setFillColor] = useState('transparent');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawCurrent, setDrawCurrent] = useState<{ x: number; y: number } | null>(null);
  const [pendingTextPos, setPendingTextPos] = useState<{ x: number; y: number } | null>(null);
  const [pendingTextValue, setPendingTextValue] = useState('');
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);

  const isDrawMode = drawTool !== 'select';

  const addShape = useCallback((shape: DrawnShape) => {
    setDrawnShapes(prev => [...prev, shape]);
  }, []);

  const deleteShape = useCallback((id: string) => {
    setDrawnShapes(prev => prev.filter(s => s.id !== id));
    setSelectedShapeId(prev => (prev === id ? null : prev));
  }, []);

  const deleteSelectedShape = useCallback(() => {
    if (selectedShapeId) {
      deleteShape(selectedShapeId);
    }
  }, [selectedShapeId, deleteShape]);

  const clearAllShapes = useCallback(() => {
    setDrawnShapes([]);
    setSelectedShapeId(null);
  }, []);

  const loadShapes = useCallback((shapes: DrawnShape[]) => {
    setDrawnShapes(shapes);
  }, []);

  const startDrawing = useCallback((pt: { x: number; y: number }) => {
    if (drawTool === 'draw-text') {
      setPendingTextPos(pt);
      setPendingTextValue('');
      return;
    }
    setIsDrawing(true);
    setDrawStart(pt);
    setDrawCurrent(pt);
  }, [drawTool]);

  const updateDrawing = useCallback((pt: { x: number; y: number }) => {
    if (isDrawing && drawTool !== 'draw-text') {
      setDrawCurrent(pt);
    }
  }, [isDrawing, drawTool]);

  const finishDrawing = useCallback(() => {
    if (!isDrawing || !drawStart || !drawCurrent || drawTool === 'select' || drawTool === 'draw-text') return;
    const dx = drawCurrent.x - drawStart.x;
    const dy = drawCurrent.y - drawStart.y;
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
      const shapeType = drawTool === 'draw-line' ? 'line' : drawTool === 'draw-rect' ? 'rect' : 'ellipse';
      const newShape: DrawnShape = {
        id: `ds-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: shapeType,
        x1: drawStart.x,
        y1: drawStart.y,
        x2: drawCurrent.x,
        y2: drawCurrent.y,
        stroke: strokeColor,
        fill: fillColor,
        strokeWidth,
      };
      addShape(newShape);
    }
    setIsDrawing(false);
    setDrawStart(null);
    setDrawCurrent(null);
  }, [isDrawing, drawStart, drawCurrent, drawTool, strokeColor, fillColor, strokeWidth, addShape]);

  const commitTextShape = useCallback(() => {
    if (!pendingTextPos || !pendingTextValue.trim()) {
      setPendingTextPos(null);
      return;
    }
    const newShape: DrawnShape = {
      id: `ds-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'text',
      x1: pendingTextPos.x,
      y1: pendingTextPos.y,
      x2: pendingTextPos.x + 50,
      y2: pendingTextPos.y + 10,
      stroke: strokeColor,
      fill: fillColor,
      strokeWidth,
      text: pendingTextValue,
      fontSize: 14,
    };
    addShape(newShape);
    setPendingTextPos(null);
    setPendingTextValue('');
  }, [pendingTextPos, pendingTextValue, strokeColor, fillColor, strokeWidth, addShape]);

  const previewShape: DrawnShape | null =
    isDrawing && drawStart && drawCurrent && drawTool !== 'select' && drawTool !== 'draw-text'
      ? {
          id: '__preview__',
          type: drawTool === 'draw-line' ? 'line' : drawTool === 'draw-rect' ? 'rect' : 'ellipse',
          x1: drawStart.x,
          y1: drawStart.y,
          x2: drawCurrent.x,
          y2: drawCurrent.y,
          stroke: strokeColor,
          fill: fillColor,
          strokeWidth,
        }
      : null;

  return {
    drawTool,
    setDrawTool,
    drawnShapes,
    setDrawnShapes,
    strokeColor,
    setStrokeColor,
    fillColor,
    setFillColor,
    strokeWidth,
    setStrokeWidth,
    isDrawing,
    isDrawMode,
    drawStart,
    drawCurrent,
    pendingTextPos,
    setPendingTextPos,
    pendingTextValue,
    setPendingTextValue,
    selectedShapeId,
    setSelectedShapeId,
    previewShape,
    addShape,
    deleteShape,
    deleteSelectedShape,
    clearAllShapes,
    loadShapes,
    startDrawing,
    updateDrawing,
    finishDrawing,
    commitTextShape,
  };
}

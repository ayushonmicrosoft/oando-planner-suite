"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Stage, Layer, Rect, Ellipse, Line, Text, Transformer, Group, Path, Circle } from 'react-konva';
import type Konva from 'konva';
import {
  useListCatalogItems,
  useCreatePlan,
  useUpdatePlan,
  useGetPlan,
  useGetAiAdvice,
  getGetPlanQueryKey,
} from '@workspace/api-client-react';
import { useCanvasPlanner, type PlacedItem } from '@/hooks/use-canvas-planner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  Save, MousePointer2, RotateCw, Trash2, X, Plus, Box,
  Loader2, Sparkles, Grid3X3, Undo2, Redo2, Copy,
  ZoomIn, ZoomOut, Lock, Unlock, Download, Ruler,
  Layers, ChevronUp, ChevronDown, Search, Eye, EyeOff,
  AlertCircle, RefreshCw, Crosshair, ChevronRight, BarChart3
} from 'lucide-react';
import { getFurnitureShapeDef, getCategoryIcon } from '@/lib/furniture-shapes';

const GRID_CM = 10;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;

interface FormErrors {
  planName?: string;
  roomWidth?: string;
  roomDepth?: string;
}

function validateForm(planName: string, roomWidthCm: number, roomDepthCm: number): FormErrors {
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

const SNAP_THRESHOLD_CM = 8;
const ALIGNMENT_GUIDE_COLOR = '#3b82f6';

interface AlignmentGuide {
  orientation: 'h' | 'v';
  position: number;
}

function computeAlignmentGuides(
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

function FurnitureShape({
  item,
  isSelected,
  onSelect,
  onChange,
  onDragMove,
  pxPerCm,
  gridSnap,
  gridSize,
}: {
  item: PlacedItem;
  isSelected: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onChange: (changes: Partial<PlacedItem>) => void;
  onDragMove?: (item: PlacedItem, x: number, y: number) => void;
  pxPerCm: number;
  gridSnap: boolean;
  gridSize: number;
}) {
  const shapeRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const snapVal = (v: number) => gridSnap ? Math.round(v / gridSize) * gridSize : v;

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (onDragMove) {
      const node = e.target;
      const xCm = node.x() / pxPerCm;
      const yCm = node.y() / pxPerCm;
      onDragMove(item, xCm, yCm);
    }
  };

  const onDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const xCm = snapVal(node.x() / pxPerCm);
    const yCm = snapVal(node.y() / pxPerCm);
    onChange({ x: xCm, y: yCm });
  };

  const onTransformEnd = () => {
    const node = shapeRef.current;
    if (!node) return;
    const sx = node.scaleX();
    const sy = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    const newWidthCm = Math.max(5, Math.round((node.width() * sx) / pxPerCm));
    const newDepthCm = Math.max(5, Math.round((node.height() * sy) / pxPerCm));
    const xCm = snapVal(node.x() / pxPerCm);
    const yCm = snapVal(node.y() / pxPerCm);
    onChange({
      x: xCm,
      y: yCm,
      widthCm: newWidthCm,
      depthCm: newDepthCm,
      rotation: Math.round(node.rotation()),
    });
  };

  const wPx = item.widthCm * pxPerCm;
  const hPx = item.depthCm * pxPerCm;
  const xPx = item.x * pxPerCm;
  const yPx = item.y * pxPerCm;

  const shapeDef = useMemo(
    () => getFurnitureShapeDef(item.category || '', item.shape || 'rect', wPx, hPx, item.color),
    [item.category, item.shape, wPx, hPx, item.color]
  );

  const groupProps = {
    ref: shapeRef,
    x: xPx,
    y: yPx,
    width: wPx,
    height: hPx,
    rotation: item.rotation,
    draggable: !item.locked,
    onClick: onSelect,
    onTap: onSelect,
    onDragEnd,
    onDragMove: handleDragMove,
    onTransformEnd,
    opacity: item.opacity,
    name: `item-${item.instanceId}`,
  };

  const selectionStroke = isSelected ? 'hsl(221, 83%, 53%)' : undefined;

  return (
    <Group>
      <Group {...groupProps}>
        {isSelected && (
          <Rect
            x={-2}
            y={-2}
            width={wPx + 4}
            height={hPx + 4}
            stroke="hsl(221, 83%, 53%)"
            strokeWidth={1.5}
            cornerRadius={4}
            dash={[4, 3]}
            listening={false}
            shadowColor="hsl(221, 83%, 53%)"
            shadowBlur={6}
            shadowOpacity={0.2}
          />
        )}

        {shapeDef.paths.map((pathData, i) => (
          <Path
            key={i}
            data={pathData}
            fill={shapeDef.fills[i]}
            stroke={selectionStroke || shapeDef.strokes?.[i] || 'rgba(0,0,0,0.1)'}
            strokeWidth={isSelected ? 1.5 : (shapeDef.strokeWidths?.[i] || 0.5)}
          />
        ))}

        {pxPerCm > 0.3 && (
          <Text
            x={0}
            y={hPx / 2 - 6}
            width={wPx}
            height={14}
            text={item.name?.substring(0, 14) || ''}
            fontSize={Math.min(11, hPx * 0.35)}
            fill="#fff"
            fontFamily="Inter, system-ui, sans-serif"
            fontStyle="600"
            align="center"
            verticalAlign="middle"
            listening={false}
            shadowColor="rgba(0,0,0,0.5)"
            shadowBlur={2}
          />
        )}

        {pxPerCm > 0.3 && (
          <Text
            x={0}
            y={hPx / 2 + 6}
            width={wPx}
            height={10}
            text={`${item.widthCm}×${item.depthCm}`}
            fontSize={8}
            fontFamily="Inter, system-ui, sans-serif"
            fill="rgba(255,255,255,0.8)"
            align="center"
            verticalAlign="middle"
            listening={false}
            shadowColor="rgba(0,0,0,0.4)"
            shadowBlur={1}
          />
        )}
      </Group>

      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={!item.locked}
          resizeEnabled={!item.locked}
          enabledAnchors={item.locked ? [] : [
            'top-left', 'top-right', 'bottom-left', 'bottom-right',
            'middle-left', 'middle-right', 'top-center', 'bottom-center',
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 10 || newBox.height < 10) return oldBox;
            return newBox;
          }}
          rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
          rotationSnapTolerance={5}
          anchorCornerRadius={2}
          anchorStrokeColor="hsl(221, 83%, 53%)"
          anchorFill="#fff"
          borderStroke="hsl(221, 83%, 53%)"
          borderStrokeWidth={1.5}
        />
      )}
    </Group>
  );
}

export default function CanvasPlanner() {
  const location = usePathname();
  const searchParams = new URLSearchParams(window.location.search);
  const planId = searchParams.get('id') ? Number(searchParams.get('id')) : null;

  const planner = useCanvasPlanner(500, 500);
  const {
    roomWidthCm, setRoomWidthCm,
    roomDepthCm, setRoomDepthCm,
    items, selectedItemIds, setSelectedItemIds,
    addItem, updateItem, updateItemPosition, updateItemTransform,
    rotateItem, deleteItems, duplicateItems, clearAll,
    bringToFront, sendToBack, toggleLock,
    undo, redo,
    loadDocument, getDocumentJson,
    snapToGrid,
    zoom, setZoom,
    panOffset, setPanOffset,
    gridSnap, setGridSnap,
    showGrid, setShowGrid,
    showDimensions, setShowDimensions,
    selectAll,
  } = planner;

  const [planName, setPlanName] = useState('New Canvas Plan');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [spaceDown, setSpaceDown] = useState(false);
  const lastPointerPos = useRef<{ x: number; y: number } | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const { data: catalogItems, isError: catalogError, refetch: refetchCatalog } = useListCatalogItems();
  const { data: existingPlan, isLoading: planLoading, isError: planError, refetch: refetchPlan } = useGetPlan(planId || 0, { query: { queryKey: getGetPlanQueryKey(planId || 0), enabled: !!planId } });

  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const getAiAdvice = useGetAiAdvice();
  const { toast } = useToast();
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });

  const [aiAdvice, setAiAdvice] = useState<{ advice: string; suggestions: string[]; issues?: string[]; positives?: string[] } | null>(null);
  const [aiQuery, setAiQuery] = useState('Review my current canvas layout for flow and ergonomics.');
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<'items' | 'properties'>('items');

  const [measureMode, setMeasureMode] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<{ x: number; y: number }[]>([]);
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([]);
  const [summaryPanelOpen, setSummaryPanelOpen] = useState(false);

  const categorySummary = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach(item => {
      const cat = item.category || 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [items]);

  const usedAreaCm2 = useMemo(() => {
    return items.reduce((sum, item) => sum + item.widthCm * item.depthCm, 0);
  }, [items]);

  const totalAreaCm2 = roomWidthCm * roomDepthCm;
  const freeAreaCm2 = Math.max(0, totalAreaCm2 - usedAreaCm2);
  const usedPct = totalAreaCm2 > 0 ? Math.round((usedAreaCm2 / totalAreaCm2) * 100) : 0;

  const handleDragMoveItem = useCallback((dragItem: PlacedItem, xCm: number, yCm: number) => {
    const tempItem = { ...dragItem, x: xCm, y: yCm };
    setAlignmentGuides(computeAlignmentGuides(tempItem, items, roomWidthCm, roomDepthCm));
  }, [items, roomWidthCm, roomDepthCm]);

  const handleDragEndClearGuides = useCallback(() => {
    setAlignmentGuides([]);
  }, []);

  useEffect(() => {
    if (existingPlan) {
      setPlanName(existingPlan.name);
      setRoomWidthCm(existingPlan.roomWidthCm);
      setRoomDepthCm(existingPlan.roomDepthCm);
      if (existingPlan.documentJson) {
        loadDocument(existingPlan.documentJson);
      }
    }
  }, [existingPlan, loadDocument, setRoomDepthCm, setRoomWidthCm]);

  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      setFormErrors(validateForm(planName, roomWidthCm, roomDepthCm));
    }
  }, [planName, roomWidthCm, roomDepthCm, touched]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setStageSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const padding = 40;
  const pxPerCm = Math.min(
    (stageSize.width - padding * 2) / roomWidthCm,
    (stageSize.height - padding * 2) / roomDepthCm
  );
  const roomWidthPx = roomWidthCm * pxPerCm;
  const roomHeightPx = roomDepthCm * pxPerCm;
  const roomOffsetX = (stageSize.width - roomWidthPx) / 2;
  const roomOffsetY = (stageSize.height - roomHeightPx) / 2;

  const gridLines: React.ReactElement[] = [];
  if (showGrid) {
    const gridPx = GRID_CM * pxPerCm;
    const majorGridPx = 50 * pxPerCm;
    for (let x = 0; x <= roomWidthPx; x += gridPx) {
      const isMajor = Math.abs(x % majorGridPx) < 0.5;
      gridLines.push(
        <Line key={`gv${x}`} points={[roomOffsetX + x, roomOffsetY, roomOffsetX + x, roomOffsetY + roomHeightPx]}
          stroke={isMajor ? '#d1d5db' : '#e5e7eb'} strokeWidth={isMajor ? 0.7 : 0.3} listening={false} />
      );
    }
    for (let y = 0; y <= roomHeightPx; y += gridPx) {
      const isMajor = Math.abs(y % majorGridPx) < 0.5;
      gridLines.push(
        <Line key={`gh${y}`} points={[roomOffsetX, roomOffsetY + y, roomOffsetX + roomWidthPx, roomOffsetY + y]}
          stroke={isMajor ? '#d1d5db' : '#e5e7eb'} strokeWidth={isMajor ? 0.7 : 0.3} listening={false} />
      );
    }
  }

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
  }, [zoom, panOffset, setZoom, setPanOffset]);

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
      const stage = stageRef.current;
      if (!stage) return;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;
      const xCm = (pointer.x / zoom - panOffset.x / zoom - roomOffsetX) / pxPerCm;
      const yCm = (pointer.y / zoom - panOffset.y / zoom - roomOffsetY) / pxPerCm;
      if (measurePoints.length === 0) {
        setMeasurePoints([{ x: xCm, y: yCm }]);
      } else if (measurePoints.length === 1) {
        setMeasurePoints(prev => [...prev, { x: xCm, y: yCm }]);
      } else {
        setMeasurePoints([{ x: xCm, y: yCm }]);
      }
      return;
    }

    if (e.target === e.target.getStage()) {
      setSelectedItemIds(new Set());
    }
  }, [setSelectedItemIds, spaceDown, measureMode, measurePoints, zoom, panOffset, roomOffsetX, roomOffsetY, pxPerCm]);

  const handleStageMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (isPanning && lastPointerPos.current) {
      const stage = stageRef.current;
      if (!stage) return;
      const pos = stage.getPointerPosition();
      if (!pos) return;
      setPanOffset(prev => ({
        x: prev.x + (pos.x - lastPointerPos.current!.x),
        y: prev.y + (pos.y - lastPointerPos.current!.y),
      }));
      lastPointerPos.current = pos;
    }
  }, [isPanning, setPanOffset]);

  const handleStageMouseUp = useCallback(() => {
    setIsPanning(false);
    lastPointerPos.current = null;
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

    if (e.code === 'Space' && !isTyping) {
      e.preventDefault();
      setSpaceDown(true);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey && !isTyping) {
      e.preventDefault();
      undo();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey)) && !isTyping) {
      e.preventDefault();
      redo();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'd' && !isTyping) {
      e.preventDefault();
      if (selectedItemIds.size > 0) {
        duplicateItems(Array.from(selectedItemIds));
      }
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'a' && !isTyping) {
      e.preventDefault();
      selectAll();
      return;
    }
    if ((e.key === 'Delete' || e.key === 'Backspace') && !isTyping) {
      e.preventDefault();
      if (selectedItemIds.size > 0) {
        deleteItems(Array.from(selectedItemIds));
      }
      return;
    }
    if (e.key === 'Escape') {
      setSelectedItemIds(new Set());
      return;
    }
    if (e.key === 'r' && !e.ctrlKey && !e.metaKey && !isTyping) {
      selectedItemIds.forEach(id => rotateItem(id));
      return;
    }
    if ((e.key === '=' || e.key === '+') && !isTyping) {
      setZoom(z => Math.min(MAX_ZOOM, z + ZOOM_STEP));
      return;
    }
    if (e.key === '-' && !isTyping) {
      setZoom(z => Math.max(MIN_ZOOM, z - ZOOM_STEP));
      return;
    }
    if (e.key === '0' && !isTyping) {
      setZoom(1);
      setPanOffset({ x: 0, y: 0 });
      return;
    }
  }, [selectedItemIds, undo, redo, duplicateItems, deleteItems, rotateItem, selectAll, setZoom, setPanOffset, setSelectedItemIds]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      setSpaceDown(false);
      setIsPanning(false);
      lastPointerPos.current = null;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const handleItemSelect = useCallback((instanceId: string, e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const shiftKey = 'evt' in e ? (e.evt as MouseEvent).shiftKey : false;
    if (shiftKey) {
      setSelectedItemIds(prev => {
        const next = new Set(prev);
        if (next.has(instanceId)) {
          next.delete(instanceId);
        } else {
          next.add(instanceId);
        }
        return next;
      });
    } else {
      setSelectedItemIds(new Set([instanceId]));
    }
  }, [setSelectedItemIds]);

  const filteredCatalog = catalogItems?.filter(item => {
    const matchesSearch = !catalogSearch || item.name.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(catalogItems?.map(i => i.category) || []));
  const selectedItem = items.find(i => selectedItemIds.has(i.instanceId));
  const sortedItems = [...items].sort((a, b) => a.zIndex - b.zIndex);

  const handleSave = () => {
    setTouched({ planName: true, roomWidth: true, roomDepth: true });
    const errors = validateForm(planName, roomWidthCm, roomDepthCm);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast({
        variant: "destructive",
        title: "Validation error",
        description: "Please fix the errors before saving.",
      });
      return;
    }

    const payload = {
      name: planName,
      roomWidthCm,
      roomDepthCm,
      plannerType: 'canvas' as const,
      documentJson: getDocumentJson(),
    };

    if (planId) {
      updatePlan.mutate({ id: planId, data: payload }, {
        onSuccess: () => toast({ title: 'Plan updated successfully' }),
      });
    } else {
      createPlan.mutate({ data: payload }, {
        onSuccess: (data) => {
          toast({ title: 'Plan created successfully' });
          window.history.replaceState(null, '', `?id=${data.id}`);
        },
      });
    }
  };

  const handleExportPng = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const oldScale = { x: stage.scaleX(), y: stage.scaleY() };
    const oldPos = { x: stage.x(), y: stage.y() };
    stage.scale({ x: 1, y: 1 });
    stage.position({ x: 0, y: 0 });
    const uri = stage.toDataURL({ pixelRatio: 2 });
    stage.scale(oldScale);
    stage.position(oldPos);
    const link = document.createElement('a');
    link.download = `${planName.replace(/[^a-z0-9]/gi, '_')}.png`;
    link.href = uri;
    link.click();
    toast({ title: 'PNG exported successfully' });
  };

  const handleAskAi = (customQuery?: string) => {
    const catSet = new Set<string>();
    items.forEach(item => { if (item.category) catSet.add(item.category); });
    const spatialItems = items.map(item => ({
      x: item.x,
      y: item.y,
      widthCm: item.widthCm,
      depthCm: item.depthCm,
      rotation: item.rotation,
      name: item.name || 'Item',
    }));
    getAiAdvice.mutate({
      data: {
        roomWidthCm,
        roomDepthCm,
        itemCount: items.length,
        categories: Array.from(catSet),
        query: customQuery || aiQuery,
        items: spatialItems,
      } as any,
    }, {
      onSuccess: (data) => {
        setAiAdvice(data as any);
        setAiPanelOpen(true);
      },
    });
  };

  if (planError && planId) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="w-10 h-10 text-destructive opacity-60" />
          <div className="text-center">
            <p className="font-medium">Failed to load plan</p>
            <p className="text-sm text-muted-foreground mt-1">There was an error loading plan #{planId}.</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => refetchPlan()}>
            <RefreshCw className="w-4 h-4" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  if (planLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin w-8 h-8 text-primary" />
          <p className="text-sm text-muted-foreground">Loading plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <header className="min-h-12 border-b flex items-center justify-between px-3 shrink-0 bg-card flex-wrap gap-y-1 py-1">
        <div className="flex items-center gap-3">
          <Grid3X3 className="w-5 h-5 text-primary shrink-0" />
          <div className="space-y-0">
            <Input
              value={planName}
              onChange={(e) => { setPlanName(e.target.value); setTouched(t => ({ ...t, planName: true })); }}
              className={`w-40 sm:w-56 h-8 text-sm font-medium border-transparent hover:border-input focus:border-input bg-transparent ${touched.planName && formErrors.planName ? 'border-destructive' : ''}`}
            />
            {touched.planName && formErrors.planName && (
              <p className="text-xs text-destructive">{formErrors.planName}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={undo} title="Undo (Ctrl+Z)">
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={redo} title="Redo (Ctrl+Y)">
            <Redo2 className="w-4 h-4" />
          </Button>
          <div className="w-px h-5 bg-border mx-1" />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => duplicateItems(Array.from(selectedItemIds))} disabled={selectedItemIds.size === 0} title="Duplicate (Ctrl+D)">
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => selectedItemIds.forEach(id => rotateItem(id))} disabled={selectedItemIds.size === 0} title="Rotate 90° (R)">
            <RotateCw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteItems(Array.from(selectedItemIds))} disabled={selectedItemIds.size === 0} title="Delete (Del)">
            <Trash2 className="w-4 h-4" />
          </Button>
          <div className="w-px h-5 bg-border mx-1" />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.max(MIN_ZOOM, z - ZOOM_STEP))} title="Zoom Out (-)">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <button
            className="h-8 px-2 text-xs font-mono text-muted-foreground hover:text-foreground"
            onClick={() => { setZoom(1); setPanOffset({ x: 0, y: 0 }); }}
            title="Reset zoom (0)"
          >
            {Math.round(zoom * 100)}%
          </button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.min(MAX_ZOOM, z + ZOOM_STEP))} title="Zoom In (+)">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <div className="w-px h-5 bg-border mx-1" />
          <Button variant={showGrid ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setShowGrid(!showGrid)} title="Toggle Grid">
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button variant={gridSnap ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setGridSnap(!gridSnap)} title="Toggle Snap">
            <Ruler className="w-4 h-4" />
          </Button>
          <Button variant={showDimensions ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setShowDimensions(!showDimensions)} title="Toggle Dimensions">
            {showDimensions ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
          <Button
            variant={measureMode ? 'default' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => { setMeasureMode(!measureMode); setMeasurePoints([]); }}
            title="Measurement Tool"
          >
            <Crosshair className="w-4 h-4" />
          </Button>
          <Button
            variant={summaryPanelOpen ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setSummaryPanelOpen(!summaryPanelOpen)}
            title="Furniture Summary"
          >
            <BarChart3 className="w-4 h-4" />
          </Button>
          <div className="w-px h-5 bg-border mx-1" />
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={handleExportPng} title="Export PNG">
            <Download className="w-3.5 h-3.5" />
            PNG
          </Button>
          <Button variant={aiPanelOpen ? 'secondary' : 'outline'} size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setAiPanelOpen(!aiPanelOpen)}>
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            AI Advisor
          </Button>
          <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={handleSave} disabled={createPlan.isPending || updatePlan.isPending}>
            {(createPlan.isPending || updatePlan.isPending) ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-56 lg:w-64 border-r flex flex-col bg-card shrink-0 hidden sm:flex">
          <div className="p-3 border-b space-y-3">
            <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Room Settings</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Width (cm)</Label>
                <Input
                  type="number"
                  className={`h-8 text-sm ${touched.roomWidth && formErrors.roomWidth ? 'border-destructive' : ''}`}
                  value={roomWidthCm}
                  onChange={e => { setRoomWidthCm(Number(e.target.value)); setTouched(t => ({ ...t, roomWidth: true })); }}
                />
                {touched.roomWidth && formErrors.roomWidth && (
                  <p className="text-xs text-destructive">{formErrors.roomWidth}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Depth (cm)</Label>
                <Input
                  type="number"
                  className={`h-8 text-sm ${touched.roomDepth && formErrors.roomDepth ? 'border-destructive' : ''}`}
                  value={roomDepthCm}
                  onChange={e => { setRoomDepthCm(Number(e.target.value)); setTouched(t => ({ ...t, roomDepth: true })); }}
                />
                {touched.roomDepth && formErrors.roomDepth && (
                  <p className="text-xs text-destructive">{formErrors.roomDepth}</p>
                )}
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{(roomWidthCm / 100).toFixed(1)}m × {(roomDepthCm / 100).toFixed(1)}m</span>
              <span>{((roomWidthCm * roomDepthCm) / 10000).toFixed(1)} m²</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <div className="p-3 pb-2 space-y-2">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Catalog</h3>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  className="h-8 text-sm pl-8"
                  value={catalogSearch}
                  onChange={e => setCatalogSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-1">
                <button
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${!selectedCategory ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                  onClick={() => setSelectedCategory(null)}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                    onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <ScrollArea className="flex-1 px-3 pb-3">
              <div className="space-y-1">
                {filteredCatalog?.map(item => (
                  <Card
                    key={item.id}
                    className="p-2 flex items-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-accent/50 transition-colors"
                    onClick={() => addItem(item, roomWidthCm / 2 - item.widthCm / 2, roomDepthCm / 2 - item.depthCm / 2)}
                  >
                    <div
                      className="w-7 h-7 rounded flex-shrink-0"
                      style={{
                        backgroundColor: item.color || '#6b7280',
                        borderRadius: item.shape === 'round' || item.shape === 'circle' ? '50%' : '4px',
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{item.name}</div>
                      <div className="text-[10px] text-muted-foreground">{item.widthCm}×{item.depthCm}cm</div>
                    </div>
                    <Plus className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  </Card>
                ))}
                {catalogError && (
                  <div className="text-xs text-center py-4 space-y-2">
                    <AlertCircle className="w-5 h-5 text-destructive mx-auto opacity-60" />
                    <p className="text-muted-foreground">Failed to load catalog</p>
                    <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1" onClick={() => refetchCatalog()}>
                      <RefreshCw className="w-3 h-3" /> Retry
                    </Button>
                  </div>
                )}
                {!catalogError && filteredCatalog?.length === 0 && (
                  <div className="text-xs text-muted-foreground text-center py-6">No items found</div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div
          ref={containerRef}
          className="flex-1 bg-muted/30 relative overflow-hidden"
          style={{ cursor: measureMode ? 'crosshair' : spaceDown ? (isPanning ? 'grabbing' : 'grab') : 'default' }}
        >
          {aiPanelOpen && (
            <div className="absolute top-0 right-0 w-80 h-full z-10 bg-card border-l shadow-lg flex flex-col">
              <div className="p-3 border-b flex justify-between items-center">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> AI Advisor
                </h4>
                <button onClick={() => setAiPanelOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-3 border-b space-y-2">
                <Input
                  placeholder="Ask about your layout..."
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  className="h-8 text-sm"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAskAi(); }}
                />
                <Button
                  size="sm"
                  className="w-full h-8 text-xs gap-1.5"
                  onClick={() => handleAskAi()}
                  disabled={getAiAdvice.isPending}
                >
                  {getAiAdvice.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  Run Analysis
                </Button>
              </div>
              <ScrollArea className="flex-1 p-3">
                {aiAdvice ? (
                  <div className="space-y-4">
                    {aiAdvice.issues && aiAdvice.issues.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-xs font-semibold uppercase tracking-wider text-red-600 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-500" /> Issues ({aiAdvice.issues.length})
                        </h5>
                        <ul className="space-y-1.5">
                          {aiAdvice.issues.map((issue, i) => (
                            <li key={i} className="text-xs bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md p-2 text-red-800 dark:text-red-300">
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {aiAdvice.suggestions.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-xs font-semibold uppercase tracking-wider text-yellow-600 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-yellow-500" /> Suggestions ({aiAdvice.suggestions.length})
                        </h5>
                        <ul className="space-y-1.5">
                          {aiAdvice.suggestions.map((s, i) => (
                            <li key={i} className="text-xs bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-md p-2 text-yellow-800 dark:text-yellow-300">
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {aiAdvice.positives && aiAdvice.positives.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-xs font-semibold uppercase tracking-wider text-green-600 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-green-500" /> Good ({aiAdvice.positives.length})
                        </h5>
                        <ul className="space-y-1.5">
                          {aiAdvice.positives.map((p, i) => (
                            <li key={i} className="text-xs bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-md p-2 text-green-800 dark:text-green-300">
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="border-t pt-3">
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Summary</h5>
                      <p className="text-xs text-muted-foreground leading-relaxed">{aiAdvice.advice}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground text-center py-8">
                    <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p>Enter a question or click "Run Analysis" to get AI-powered feedback on your layout.</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          )}

          <Stage
            ref={stageRef}
            width={stageSize.width}
            height={stageSize.height}
            scaleX={zoom}
            scaleY={zoom}
            x={panOffset.x}
            y={panOffset.y}
            onWheel={handleWheel}
            onMouseDown={handleStageMouseDown}
            onMouseMove={handleStageMouseMove}
            onMouseUp={handleStageMouseUp}
            onTouchStart={handleStageMouseDown}
            data-testid="planner-canvas"
          >
            <Layer>
              <Rect
                x={0}
                y={0}
                width={stageSize.width / zoom}
                height={stageSize.height / zoom}
                fill="#f8fafc"
                listening={false}
              />
            </Layer>

            <Layer>
              {gridLines}
            </Layer>

            <Layer>
              <Rect
                x={roomOffsetX}
                y={roomOffsetY}
                width={roomWidthPx}
                height={roomHeightPx}
                fill="#ffffff"
                stroke="#94a3b8"
                strokeWidth={2}
                cornerRadius={1}
                listening={false}
              />

              {showDimensions && (
                <>
                  <Text
                    x={roomOffsetX + roomWidthPx / 2 - 30}
                    y={roomOffsetY - 18}
                    text={`${(roomWidthCm / 100).toFixed(1)}m`}
                    fontSize={11}
                    fill="#64748b"
                    fontFamily="Inter, system-ui, sans-serif"
                    fontStyle="600"
                    listening={false}
                  />
                  <Line
                    points={[roomOffsetX, roomOffsetY - 10, roomOffsetX + roomWidthPx, roomOffsetY - 10]}
                    stroke="#94a3b8"
                    strokeWidth={0.5}
                    listening={false}
                  />
                  <Line
                    points={[roomOffsetX, roomOffsetY - 14, roomOffsetX, roomOffsetY - 6]}
                    stroke="#94a3b8"
                    strokeWidth={0.5}
                    listening={false}
                  />
                  <Line
                    points={[roomOffsetX + roomWidthPx, roomOffsetY - 14, roomOffsetX + roomWidthPx, roomOffsetY - 6]}
                    stroke="#94a3b8"
                    strokeWidth={0.5}
                    listening={false}
                  />
                  <Group rotation={-90} x={roomOffsetX - 10} y={roomOffsetY + roomHeightPx / 2 + 20}>
                    <Text
                      text={`${(roomDepthCm / 100).toFixed(1)}m`}
                      fontSize={11}
                      fill="#64748b"
                      fontFamily="Inter, system-ui, sans-serif"
                      fontStyle="600"
                      listening={false}
                    />
                  </Group>
                  <Line
                    points={[roomOffsetX - 10, roomOffsetY, roomOffsetX - 10, roomOffsetY + roomHeightPx]}
                    stroke="#94a3b8"
                    strokeWidth={0.5}
                    listening={false}
                  />
                  <Line
                    points={[roomOffsetX - 14, roomOffsetY, roomOffsetX - 6, roomOffsetY]}
                    stroke="#94a3b8"
                    strokeWidth={0.5}
                    listening={false}
                  />
                  <Line
                    points={[roomOffsetX - 14, roomOffsetY + roomHeightPx, roomOffsetX - 6, roomOffsetY + roomHeightPx]}
                    stroke="#94a3b8"
                    strokeWidth={0.5}
                    listening={false}
                  />
                  <Text
                    x={roomOffsetX + roomWidthPx / 2 - 20}
                    y={roomOffsetY + roomHeightPx + 6}
                    text={`${((roomWidthCm * roomDepthCm) / 10000).toFixed(1)} m²`}
                    fontSize={10}
                    fill="#94a3b8"
                    fontFamily="Inter, system-ui, sans-serif"
                    listening={false}
                  />
                </>
              )}
            </Layer>

            <Layer
              clipX={roomOffsetX}
              clipY={roomOffsetY}
              clipWidth={roomWidthPx}
              clipHeight={roomHeightPx}
            >
              {sortedItems.map(item => (
                <FurnitureShape
                  key={item.instanceId}
                  item={{ ...item, x: item.x + roomOffsetX / pxPerCm, y: item.y + roomOffsetY / pxPerCm }}
                  isSelected={selectedItemIds.has(item.instanceId)}
                  onSelect={(e) => handleItemSelect(item.instanceId, e)}
                  onChange={(changes) => {
                    if (changes.x !== undefined) changes.x = changes.x - roomOffsetX / pxPerCm;
                    if (changes.y !== undefined) changes.y = changes.y - roomOffsetY / pxPerCm;
                    updateItemTransform(item.instanceId, changes);
                    setAlignmentGuides([]);
                  }}
                  onDragMove={(dragItem, xCm, yCm) => {
                    handleDragMoveItem(
                      { ...dragItem, x: xCm - roomOffsetX / pxPerCm, y: yCm - roomOffsetY / pxPerCm },
                      xCm - roomOffsetX / pxPerCm,
                      yCm - roomOffsetY / pxPerCm,
                    );
                  }}
                  pxPerCm={pxPerCm}
                  gridSnap={gridSnap}
                  gridSize={GRID_CM}
                />
              ))}
            </Layer>

            <Layer listening={false}>
              {alignmentGuides.map((guide, i) =>
                guide.orientation === 'v' ? (
                  <Line
                    key={`ag-${i}`}
                    points={[
                      roomOffsetX + guide.position * pxPerCm, roomOffsetY - 8,
                      roomOffsetX + guide.position * pxPerCm, roomOffsetY + roomHeightPx + 8,
                    ]}
                    stroke={ALIGNMENT_GUIDE_COLOR}
                    strokeWidth={0.8}
                    dash={[4, 3]}
                    opacity={0.7}
                  />
                ) : (
                  <Line
                    key={`ag-${i}`}
                    points={[
                      roomOffsetX - 8, roomOffsetY + guide.position * pxPerCm,
                      roomOffsetX + roomWidthPx + 8, roomOffsetY + guide.position * pxPerCm,
                    ]}
                    stroke={ALIGNMENT_GUIDE_COLOR}
                    strokeWidth={0.8}
                    dash={[4, 3]}
                    opacity={0.7}
                  />
                )
              )}

              {measurePoints.length >= 1 && (
                <>
                  <Circle
                    x={roomOffsetX + measurePoints[0].x * pxPerCm}
                    y={roomOffsetY + measurePoints[0].y * pxPerCm}
                    radius={4}
                    fill="#ef4444"
                    stroke="#fff"
                    strokeWidth={1.5}
                  />
                </>
              )}
              {measurePoints.length === 2 && (() => {
                const p1x = roomOffsetX + measurePoints[0].x * pxPerCm;
                const p1y = roomOffsetY + measurePoints[0].y * pxPerCm;
                const p2x = roomOffsetX + measurePoints[1].x * pxPerCm;
                const p2y = roomOffsetY + measurePoints[1].y * pxPerCm;
                const distCm = Math.sqrt(
                  Math.pow(measurePoints[1].x - measurePoints[0].x, 2) +
                  Math.pow(measurePoints[1].y - measurePoints[0].y, 2)
                );
                const distStr = distCm >= 100
                  ? `${(distCm / 100).toFixed(2)} m`
                  : `${Math.round(distCm)} cm`;
                const midX = (p1x + p2x) / 2;
                const midY = (p1y + p2y) / 2;
                return (
                  <>
                    <Line
                      points={[p1x, p1y, p2x, p2y]}
                      stroke="#ef4444"
                      strokeWidth={1.5}
                      dash={[6, 3]}
                    />
                    <Circle
                      x={p2x}
                      y={p2y}
                      radius={4}
                      fill="#ef4444"
                      stroke="#fff"
                      strokeWidth={1.5}
                    />
                    <Rect
                      x={midX - 30}
                      y={midY - 18}
                      width={60}
                      height={16}
                      fill="rgba(239,68,68,0.9)"
                      cornerRadius={3}
                    />
                    <Text
                      x={midX - 30}
                      y={midY - 17}
                      width={60}
                      height={14}
                      text={distStr}
                      fontSize={10}
                      fill="#fff"
                      fontFamily="Inter, system-ui, sans-serif"
                      fontStyle="700"
                      align="center"
                      verticalAlign="middle"
                    />
                  </>
                );
              })()}
            </Layer>
          </Stage>

          {measureMode && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-red-500/90 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
              <Crosshair className="w-3.5 h-3.5" />
              {measurePoints.length === 0 ? 'Click first point' : measurePoints.length === 1 ? 'Click second point' : 'Click to start new measurement'}
              <button onClick={() => { setMeasureMode(false); setMeasurePoints([]); }} className="ml-1 hover:bg-white/20 rounded-full p-0.5">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {summaryPanelOpen && (
            <div className="absolute top-3 right-3 z-10 w-64 bg-card border rounded-lg shadow-lg">
              <div className="p-3 border-b flex justify-between items-center">
                <h4 className="font-semibold text-xs flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-primary" />
                  Furniture Summary
                </h4>
                <button onClick={() => setSummaryPanelOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-3 space-y-2">
                {categorySummary.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-2">No items placed</p>
                ) : (
                  <>
                    {categorySummary.map(([cat, count]) => (
                      <div key={cat} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5">
                          <span>{getCategoryIcon(cat)}</span>
                          <span className="font-medium">{cat}</span>
                        </span>
                        <span className="text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">{count}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2 flex justify-between text-xs font-semibold">
                      <span>Total Items</span>
                      <span>{items.length}</span>
                    </div>
                  </>
                )}
              </div>
              <div className="p-3 border-t space-y-1.5">
                <h5 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Area Usage</h5>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, usedPct)}%`,
                      backgroundColor: usedPct > 80 ? '#ef4444' : usedPct > 50 ? '#f59e0b' : '#22c55e',
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Used: {(usedAreaCm2 / 10000).toFixed(1)} m² ({usedPct}%)</span>
                  <span>Free: {(freeAreaCm2 / 10000).toFixed(1)} m²</span>
                </div>
              </div>
            </div>
          )}

          <div className="absolute bottom-3 left-3 flex items-center gap-2 text-[10px] text-muted-foreground bg-card/90 backdrop-blur rounded px-2 py-1 border shadow-sm">
            <span>{items.length} items</span>
            <span className="text-border">|</span>
            <span>{(roomWidthCm / 100).toFixed(1)}m × {(roomDepthCm / 100).toFixed(1)}m</span>
            <span className="text-border">|</span>
            <span>{(totalAreaCm2 / 10000).toFixed(1)} m²</span>
            <span className="text-border">|</span>
            <span className={usedPct > 80 ? 'text-red-500' : usedPct > 50 ? 'text-amber-500' : 'text-green-500'}>{usedPct}% footprint</span>
            <span className="text-border">|</span>
            <span>{Math.round(zoom * 100)}%</span>
            {gridSnap && <span className="text-border">| Snap</span>}
          </div>

          <div className="absolute bottom-3 right-3 text-[10px] text-muted-foreground/60 bg-card/80 backdrop-blur rounded px-2 py-1 border shadow-sm">
            <span>Scroll: Zoom | Space+Drag: Pan | Shift+Click: Multi-select | R: Rotate | Del: Delete | Ctrl+Z/Y: Undo/Redo</span>
          </div>
        </div>

        <div className="w-52 lg:w-60 border-l bg-card shrink-0 hidden md:flex flex-col">
          <div className="border-b flex">
            <button
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${inspectorTab === 'items' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setInspectorTab('items')}
            >
              <Layers className="w-3.5 h-3.5 inline mr-1" />
              Items ({items.length})
            </button>
            <button
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${inspectorTab === 'properties' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setInspectorTab('properties')}
            >
              Properties
            </button>
          </div>

          <ScrollArea className="flex-1">
            {inspectorTab === 'items' ? (
              <div className="p-2 space-y-0.5">
                {items.length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center py-8 px-4">
                    <Box className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p>Empty room</p>
                    <p className="text-[10px] mt-1">Click items in the catalog to add them</p>
                  </div>
                ) : (
                  sortedItems.map(item => (
                    <div
                      key={item.instanceId}
                      className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition-colors text-xs ${
                        selectedItemIds.has(item.instanceId)
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-muted border border-transparent'
                      }`}
                      onClick={() => setSelectedItemIds(new Set([item.instanceId]))}
                    >
                      <div
                        className="w-4 h-4 rounded flex-shrink-0"
                        style={{
                          backgroundColor: item.color,
                          borderRadius: item.shape === 'round' ? '50%' : '2px',
                        }}
                      />
                      <span className="flex-1 truncate font-medium">{item.name}</span>
                      {item.locked && <Lock className="w-3 h-3 text-muted-foreground" />}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="p-3 space-y-3">
                {selectedItem ? (
                  <>
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Selected Item</h4>
                      <div className="text-sm font-medium">{selectedItem.name}</div>
                      <div className="text-xs text-muted-foreground">{selectedItem.category}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[10px]">X (cm)</Label>
                        <Input type="number" className="h-7 text-xs" value={Math.round(selectedItem.x)} onChange={e => updateItem(selectedItem.instanceId, { x: Number(e.target.value) })} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">Y (cm)</Label>
                        <Input type="number" className="h-7 text-xs" value={Math.round(selectedItem.y)} onChange={e => updateItem(selectedItem.instanceId, { y: Number(e.target.value) })} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">Width (cm)</Label>
                        <Input type="number" className="h-7 text-xs" value={selectedItem.widthCm} onChange={e => updateItem(selectedItem.instanceId, { widthCm: Math.max(5, Number(e.target.value)) })} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">Depth (cm)</Label>
                        <Input type="number" className="h-7 text-xs" value={selectedItem.depthCm} onChange={e => updateItem(selectedItem.instanceId, { depthCm: Math.max(5, Number(e.target.value)) })} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">Rotation</Label>
                      <Input type="number" className="h-7 text-xs" value={Math.round(selectedItem.rotation)} onChange={e => updateItem(selectedItem.instanceId, { rotation: Number(e.target.value) % 360 })} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">Color</Label>
                      <div className="flex gap-2 items-center">
                        <input type="color" value={selectedItem.color} onChange={e => updateItem(selectedItem.instanceId, { color: e.target.value })} className="w-8 h-7 rounded border cursor-pointer" />
                        <Input className="h-7 text-xs flex-1" value={selectedItem.color} onChange={e => updateItem(selectedItem.instanceId, { color: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">Opacity</Label>
                      <input type="range" min={0.1} max={1} step={0.1} value={selectedItem.opacity} onChange={e => updateItem(selectedItem.instanceId, { opacity: Number(e.target.value) })} className="w-full" />
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={() => toggleLock(selectedItem.instanceId)}>
                        {selectedItem.locked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {selectedItem.locked ? 'Unlock' : 'Lock'}
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={() => bringToFront(selectedItem.instanceId)}>
                        <ChevronUp className="w-3 h-3" /> Front
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={() => sendToBack(selectedItem.instanceId)}>
                        <ChevronDown className="w-3 h-3" /> Back
                      </Button>
                    </div>
                    {selectedItem.price && (
                      <div className="text-xs text-muted-foreground border-t pt-2">
                        <div className="flex justify-between"><span>Price</span><span className="font-medium">${selectedItem.price.toFixed(2)}</span></div>
                        {selectedItem.seatCount && <div className="flex justify-between"><span>Seats</span><span className="font-medium">{selectedItem.seatCount}</span></div>}
                        <div className="flex justify-between"><span>Height</span><span className="font-medium">{selectedItem.heightCm}cm</span></div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-xs text-muted-foreground text-center py-8">
                    <MousePointer2 className="w-6 h-6 mx-auto mb-2 opacity-20" />
                    <p>Select an item to view properties</p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {items.length > 0 && (
            <div className="border-t p-2 space-y-1 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Total items</span>
                <span className="font-medium text-foreground">{items.length}</span>
              </div>
              {items.some(i => i.price) && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Est. cost</span>
                  <span className="font-medium text-foreground">
                    ${items.reduce((sum, i) => sum + (i.price || 0), 0).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

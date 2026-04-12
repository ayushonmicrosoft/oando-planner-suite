import { useState, useCallback, useRef } from 'react';
import type { CatalogItem } from '@workspace/api-client-react';
import {
  migrateDocument,
  createEmptyDocument,
  type UnifiedDocument,
  type UnifiedFurnitureItem,
} from '@/lib/unified-document';

export interface PlacedItem {
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

interface HistoryEntry {
  items: PlacedItem[];
  description: string;
}

const MAX_HISTORY = 50;

export function useCanvasPlanner(initialRoomWidthCm = 500, initialRoomDepthCm = 500) {
  const [roomWidthCm, setRoomWidthCm] = useState(initialRoomWidthCm);
  const [roomDepthCm, setRoomDepthCm] = useState(initialRoomDepthCm);
  const [items, setItemsRaw] = useState<PlacedItem[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [gridSnap, setGridSnap] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);

  const historyRef = useRef<HistoryEntry[]>([]);
  const historyIndexRef = useRef(-1);
  const zIndexCounterRef = useRef(0);

  const pushHistory = useCallback((newItems: PlacedItem[], description: string) => {
    const idx = historyIndexRef.current;
    const history = historyRef.current.slice(0, idx + 1);
    history.push({ items: JSON.parse(JSON.stringify(newItems)), description });
    if (history.length > MAX_HISTORY) history.shift();
    historyRef.current = history;
    historyIndexRef.current = history.length - 1;
  }, []);

  const setItems = useCallback((updaterOrValue: PlacedItem[] | ((prev: PlacedItem[]) => PlacedItem[])) => {
    setItemsRaw(prev => {
      return typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue;
    });
  }, []);

  const addItem = useCallback((catalogItem: CatalogItem, x: number, y: number) => {
    const instanceId = crypto.randomUUID();
    const newItem: PlacedItem = {
      instanceId,
      catalogId: catalogItem.id,
      name: catalogItem.name,
      category: catalogItem.category,
      widthCm: catalogItem.widthCm,
      depthCm: catalogItem.depthCm,
      heightCm: catalogItem.heightCm,
      color: catalogItem.color || '#6b7280',
      shape: catalogItem.shape || 'rect',
      seatCount: catalogItem.seatCount ?? null,
      price: catalogItem.price ?? null,
      x,
      y,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      locked: false,
      opacity: 1,
      zIndex: zIndexCounterRef.current++,
    };
    setItems(prev => {
      const next = [...prev, newItem];
      pushHistory(next, `Add ${catalogItem.name}`);
      return next;
    });
    setSelectedItemIds(new Set([instanceId]));
    return instanceId;
  }, [pushHistory, setItems]);

  const updateItem = useCallback((instanceId: string, changes: Partial<PlacedItem>) => {
    setItems(prev => {
      const next = prev.map(item => item.instanceId === instanceId ? { ...item, ...changes } : item);
      pushHistory(next, 'Update item');
      return next;
    });
  }, [pushHistory, setItems]);

  const updateItemPosition = useCallback((instanceId: string, x: number, y: number) => {
    setItems(prev => {
      const next = prev.map(item => item.instanceId === instanceId ? { ...item, x, y } : item);
      pushHistory(next, 'Move item');
      return next;
    });
  }, [pushHistory, setItems]);

  const updateItemTransform = useCallback((instanceId: string, changes: { x?: number; y?: number; rotation?: number; scaleX?: number; scaleY?: number; widthCm?: number; depthCm?: number }) => {
    setItems(prev => {
      const next = prev.map(item => item.instanceId === instanceId ? { ...item, ...changes } : item);
      pushHistory(next, 'Transform item');
      return next;
    });
  }, [pushHistory, setItems]);

  const rotateItem = useCallback((instanceId: string, angleDelta = 90) => {
    setItems(prev => {
      const next = prev.map(item => {
        if (item.instanceId === instanceId) {
          return { ...item, rotation: (item.rotation + angleDelta) % 360 };
        }
        return item;
      });
      pushHistory(next, 'Rotate item');
      return next;
    });
  }, [pushHistory, setItems]);

  const deleteItems = useCallback((instanceIds: string[]) => {
    setItems(prev => {
      const next = prev.filter(item => !instanceIds.includes(item.instanceId));
      pushHistory(next, `Delete ${instanceIds.length} item(s)`);
      return next;
    });
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      instanceIds.forEach(id => next.delete(id));
      return next;
    });
  }, [pushHistory, setItems]);

  const duplicateItems = useCallback((instanceIds: string[]) => {
    const newIds: string[] = [];
    setItems(prev => {
      const copies: PlacedItem[] = [];
      for (const id of instanceIds) {
        const src = prev.find(item => item.instanceId === id);
        if (src && !src.locked) {
          const newId = crypto.randomUUID();
          newIds.push(newId);
          copies.push({
            ...src,
            instanceId: newId,
            x: src.x + 20,
            y: src.y + 20,
            zIndex: zIndexCounterRef.current++,
          });
        }
      }
      const next = [...prev, ...copies];
      pushHistory(next, `Duplicate ${copies.length} item(s)`);
      return next;
    });
    if (newIds.length > 0) {
      setSelectedItemIds(new Set(newIds));
    }
    return newIds;
  }, [pushHistory, setItems]);

  const clearAll = useCallback(() => {
    pushHistory([], 'Clear all');
    setItems([]);
    setSelectedItemIds(new Set());
  }, [pushHistory, setItems]);

  const bringToFront = useCallback((instanceId: string) => {
    setItems(prev => {
      const next = prev.map(item =>
        item.instanceId === instanceId ? { ...item, zIndex: zIndexCounterRef.current++ } : item
      );
      return next;
    });
  }, [setItems]);

  const sendToBack = useCallback((instanceId: string) => {
    setItems(prev => {
      const minZ = Math.min(...prev.map(i => i.zIndex));
      const next = prev.map(item =>
        item.instanceId === instanceId ? { ...item, zIndex: minZ - 1 } : item
      );
      return next;
    });
  }, [setItems]);

  const toggleLock = useCallback((instanceId: string) => {
    setItems(prev => prev.map(item =>
      item.instanceId === instanceId ? { ...item, locked: !item.locked } : item
    ));
  }, [setItems]);

  const undo = useCallback(() => {
    const idx = historyIndexRef.current;
    if (idx <= 0) return false;
    historyIndexRef.current = idx - 1;
    const entry = historyRef.current[idx - 1];
    if (entry) {
      setItems(JSON.parse(JSON.stringify(entry.items)));
      setSelectedItemIds(new Set());
    }
    return true;
  }, [setItems]);

  const redo = useCallback(() => {
    const idx = historyIndexRef.current;
    if (idx >= historyRef.current.length - 1) return false;
    historyIndexRef.current = idx + 1;
    const entry = historyRef.current[idx + 1];
    if (entry) {
      setItems(JSON.parse(JSON.stringify(entry.items)));
      setSelectedItemIds(new Set());
    }
    return true;
  }, [setItems]);

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  const selectAll = useCallback(() => {
    setSelectedItemIds(new Set(items.map(i => i.instanceId)));
  }, [items]);

  const [unifiedDoc, setUnifiedDoc] = useState<UnifiedDocument>(createEmptyDocument());

  const loadDocument = useCallback((jsonStr: string) => {
    try {
      const doc = migrateDocument(jsonStr);
      setUnifiedDoc(doc);

      let loadedItems: PlacedItem[];
      if (doc.furniture.length > 0) {
        loadedItems = doc.furniture.map((item: UnifiedFurnitureItem) => ({
          ...item,
          zIndex: (item as any).zIndex ?? zIndexCounterRef.current++,
        })) as PlacedItem[];
      } else {
        const data = JSON.parse(jsonStr);
        loadedItems = (data.items || []).map((item: Record<string, unknown>) => ({
          instanceId: (item.instanceId as string) || crypto.randomUUID(),
          catalogId: (item.catalogId as string) || (item.id as string) || '',
          name: (item.name as string) || 'Item',
          category: (item.category as string) || '',
          widthCm: (item.widthCm as number) || (item.width as number) || 60,
          depthCm: (item.depthCm as number) || (item.depth as number) || 60,
          heightCm: (item.heightCm as number) || 75,
          color: (item.color as string) || '#6b7280',
          shape: (item.shape as string) || 'rect',
          seatCount: (item.seatCount as number) ?? null,
          price: (item.price as number) ?? null,
          x: (item.x as number) || 0,
          y: (item.y as number) || 0,
          rotation: (item.rotation as number) || 0,
          scaleX: (item.scaleX as number) || 1,
          scaleY: (item.scaleY as number) || 1,
          locked: (item.locked as boolean) || false,
          opacity: (item.opacity as number) ?? 1,
          zIndex: (item.zIndex as number) ?? zIndexCounterRef.current++,
        }));
      }

      setItems(loadedItems);
      if (doc.roomWidthCm) setRoomWidthCm(doc.roomWidthCm);
      if (doc.roomDepthCm) setRoomDepthCm(doc.roomDepthCm);
      historyRef.current = [{ items: JSON.parse(JSON.stringify(loadedItems)), description: 'Load document' }];
      historyIndexRef.current = 0;
    } catch (e) {
      console.error('Failed to parse document JSON', e);
    }
  }, [setItems]);

  const getDocumentJson = useCallback(() => {
    const updatedDoc: UnifiedDocument = {
      ...unifiedDoc,
      furniture: items as unknown as UnifiedFurnitureItem[],
      roomWidthCm,
      roomDepthCm,
      currentStep: 'furniture',
    };
    return JSON.stringify(updatedDoc);
  }, [items, roomWidthCm, roomDepthCm, unifiedDoc]);

  const snapToGrid = useCallback((value: number, gridSize = 10) => {
    if (!gridSnap) return value;
    return Math.round(value / gridSize) * gridSize;
  }, [gridSnap]);

  const zoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / 1.2, 0.25));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  return {
    roomWidthCm,
    setRoomWidthCm,
    roomDepthCm,
    setRoomDepthCm,
    items,
    selectedItemIds,
    setSelectedItemIds,
    addItem,
    updateItem,
    updateItemPosition,
    updateItemTransform,
    rotateItem,
    deleteItems,
    duplicateItems,
    clearAll,
    bringToFront,
    sendToBack,
    toggleLock,
    undo,
    redo,
    canUndo,
    canRedo,
    selectAll,
    unifiedDoc,
    loadDocument,
    getDocumentJson,
    snapToGrid,
    zoom,
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    panOffset,
    setPanOffset,
    gridSnap,
    setGridSnap,
    showGrid,
    setShowGrid,
    showDimensions,
    setShowDimensions,
  };
}

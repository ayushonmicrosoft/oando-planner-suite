"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type Konva from 'konva';
import {
  useListCatalogItems,
  useCreatePlan,
  useUpdatePlan,
  useGetPlan,
  getGetPlanQueryKey,
} from '@workspace/api-client-react';
import { useCanvasPlanner, type PlacedItem } from '@/hooks/use-canvas-planner';
import { useCanvasInteraction } from '@/hooks/use-canvas-interaction';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Loader2, RefreshCw, PenTool, Crosshair, X } from 'lucide-react';
import { PlannerBreadcrumb } from '@/components/planner/PlannerBreadcrumb';
import { VersionHistoryPanel } from '@/features/planner/VersionHistoryPanel';
import { usePlannerStore } from '@/features/planner/planner-store';
import { getCompletedSteps } from '@/lib/unified-document';
import { CanvasToolbar } from '@/components/planner/CanvasToolbar';
import { CatalogPanel } from '@/components/planner/CatalogPanel';
import { RoomSettingsPanel } from '@/components/planner/RoomSettingsPanel';
import { InspectorPanel } from '@/components/planner/InspectorPanel';
import { BillOfQuantitiesPanel } from '@/components/planner/BillOfQuantitiesPanel';
import { AiBottomBar } from '@/components/planner/AiBottomBar';
import { CanvasStage } from '@/components/planner/CanvasStage';
import { DrawShapesLayer } from '@/components/planner/DrawShapesLayer';
import { AnnotateToolbar } from '@/components/planner/AnnotateToolbar';
import {
  type FormErrors, type AlignmentGuide,
  validateForm, computeAlignmentGuides,
} from '@/components/planner/canvas-types';
import { BlueprintWizardModal, type BlueprintResult } from '@/components/planner/BlueprintWizardModal';

export default function CanvasPlanner() {
  const router = useRouter();
  const searchParams = new URLSearchParams(window.location.search);
  const initialPlanId = searchParams.get('id') ? Number(searchParams.get('id')) : null;
  const [activePlanId, setActivePlanId] = useState<number | null>(initialPlanId);
  const planId = activePlanId;

  const planner = useCanvasPlanner(500, 500);
  const {
    roomWidthCm, setRoomWidthCm, roomDepthCm, setRoomDepthCm,
    items, selectedItemIds, setSelectedItemIds,
    addItem, updateItem, updateItemTransform,
    rotateItem, deleteItems, duplicateItems, clearAll,
    bringToFront, sendToBack, toggleLock,
    undo, redo, loadDocument, getDocumentJson,
    unifiedDoc, zoom, setZoom,
    panOffset, setPanOffset,
    gridSnap, setGridSnap, showGrid, setShowGrid,
    showDimensions, setShowDimensions, selectAll,
  } = planner;

  const [planName, setPlanName] = useState('New Canvas Plan');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [inspectorTab, setInspectorTab] = useState<'items' | 'properties'>('items');
  const [measureMode, setMeasureMode] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<{ x: number; y: number }[]>([]);
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([]);
  const [boqPanelOpen, setBoqPanelOpen] = useState(false);
  const [catalogPanelOpen, setCatalogPanelOpen] = useState(false);
  const [roomPanelOpen, setRoomPanelOpen] = useState(false);
  const [blueprintWizardOpen, setBlueprintWizardOpen] = useState(false);

  const { data: catalogItems, isError: catalogError, refetch: refetchCatalog } = useListCatalogItems();
  const { data: existingPlan, isLoading: planLoading, isError: planError, refetch: refetchPlan } = useGetPlan(planId || 0, { query: { queryKey: getGetPlanQueryKey(planId || 0), enabled: !!planId } });
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const { toast } = useToast();
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });

  const padding = 40;
  const pxPerCm = Math.min(
    (stageSize.width - padding * 2) / roomWidthCm,
    (stageSize.height - padding * 2) / roomDepthCm
  );
  const roomWidthPx = roomWidthCm * pxPerCm;
  const roomHeightPx = roomDepthCm * pxPerCm;
  const roomOffsetX = (stageSize.width - roomWidthPx) / 2;
  const roomOffsetY = (stageSize.height - roomHeightPx) / 2;

  const interaction = useCanvasInteraction({
    stageRef, zoom, setZoom, panOffset, setPanOffset,
    roomOffsetX, roomOffsetY, pxPerCm,
    selectedItemIds, setSelectedItemIds,
    undo, redo, duplicateItems, deleteItems, rotateItem, selectAll,
    measureMode, measurePoints, setMeasurePoints,
  });

  const usedAreaCm2 = useMemo(() => items.reduce((sum, item) => sum + item.widthCm * item.depthCm, 0), [items]);
  const totalAreaCm2 = roomWidthCm * roomDepthCm;
  const usedPct = totalAreaCm2 > 0 ? Math.round((usedAreaCm2 / totalAreaCm2) * 100) : 0;

  const handleDragMoveItem = useCallback((dragItem: PlacedItem, xCm: number, yCm: number) => {
    setAlignmentGuides(computeAlignmentGuides({ ...dragItem, x: xCm, y: yCm }, items, roomWidthCm, roomDepthCm));
  }, [items, roomWidthCm, roomDepthCm]);

  const handleZoomToItem = useCallback((item: PlacedItem) => {
    const centerXCm = item.x + item.widthCm / 2;
    const centerYCm = item.y + item.depthCm / 2;
    const centerXPx = roomOffsetX + centerXCm * pxPerCm;
    const centerYPx = roomOffsetY + centerYCm * pxPerCm;
    const targetZoom = 1.5;
    setZoom(targetZoom);
    setPanOffset({
      x: stageSize.width / 2 - centerXPx * targetZoom,
      y: stageSize.height / 2 - centerYPx * targetZoom,
    });
  }, [roomOffsetX, roomOffsetY, pxPerCm, stageSize, setZoom, setPanOffset]);

  useEffect(() => {
    if (existingPlan) {
      setPlanName(existingPlan.name);
      setRoomWidthCm(existingPlan.roomWidthCm);
      setRoomDepthCm(existingPlan.roomDepthCm);
      if (existingPlan.documentJson) {
        loadDocument(existingPlan.documentJson);
        try {
          const parsed = JSON.parse(existingPlan.documentJson);
          if (parsed.drawnShapes) {
            interaction.setDrawnShapes(parsed.drawnShapes);
          } else if (Array.isArray(parsed.annotations) && parsed.annotations.length > 0) {
            interaction.setDrawnShapes(parsed.annotations);
          } else if (Array.isArray(parsed.shapes) && parsed.shapes.length > 0) {
            interaction.setDrawnShapes(parsed.shapes);
          }
        } catch {}
      }
    }
  }, [existingPlan, loadDocument, setRoomDepthCm, setRoomWidthCm]);

  useEffect(() => {
    usePlannerStore.getState().setCurrentPlanId(planId);
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("versions") === "1" && planId) usePlannerStore.getState().setVersionHistoryOpen(true);
    return () => { usePlannerStore.getState().setCurrentPlanId(null); };
  }, [planId]);

  useEffect(() => {
    if (Object.keys(touched).length > 0) setFormErrors(validateForm(planName, roomWidthCm, roomDepthCm));
  }, [planName, roomWidthCm, roomDepthCm, touched]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) setStageSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

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
      toast({ variant: "destructive", title: "Validation error", description: "Please fix the errors before saving." });
      return;
    }
    const baseDoc = JSON.parse(getDocumentJson());
    baseDoc.drawnShapes = interaction.drawnShapes;
    const documentJsonWithShapes = JSON.stringify(baseDoc);
    const payload = { name: planName, roomWidthCm, roomDepthCm, plannerType: 'canvas' as const, documentJson: documentJsonWithShapes };
    if (planId) {
      updatePlan.mutate({ id: planId, data: payload }, {
        onSuccess: () => {
          toast({ title: 'Plan updated successfully' });
          fetch(`/api/plans/${planId}/versions`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: `Auto-save`, documentJson: documentJsonWithShapes }) }).catch(() => {});
        },
      });
    } else {
      createPlan.mutate({ data: payload }, {
        onSuccess: (data) => { toast({ title: 'Plan created successfully' }); window.history.replaceState(null, '', `?id=${data.id}`); },
      });
    }
  };

  const handleExportPng = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const oldScale = { x: stage.scaleX(), y: stage.scaleY() };
    const oldPos = { x: stage.x(), y: stage.y() };
    stage.scale({ x: 1, y: 1 }); stage.position({ x: 0, y: 0 });
    const uri = stage.toDataURL({ pixelRatio: 2 });
    stage.scale(oldScale); stage.position(oldPos);
    const link = document.createElement('a');
    link.download = `${planName.replace(/[^a-z0-9]/gi, '_')}.png`;
    link.href = uri; link.click();
    toast({ title: 'PNG exported successfully' });
  };

  const handleCommitText = useCallback(() => {
    if (!interaction.pendingTextPos || !interaction.pendingTextValue.trim()) {
      interaction.setPendingTextPos(null);
      return;
    }
    const newShape = {
      id: `ds-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'text' as const,
      x1: interaction.pendingTextPos.x,
      y1: interaction.pendingTextPos.y,
      x2: interaction.pendingTextPos.x,
      y2: interaction.pendingTextPos.y,
      stroke: interaction.drawStroke,
      fill: interaction.drawStroke,
      strokeWidth: interaction.drawStrokeWidth,
      text: interaction.pendingTextValue.trim(),
    };
    interaction.setDrawnShapes(prev => [...prev, newShape]);
    interaction.setPendingTextPos(null);
    interaction.setPendingTextValue('');
  }, [interaction]);

  const handleNewBlankCanvas = () => {
    clearAll();
    setPlanName('New Canvas Plan');
    setRoomWidthCm(500);
    setRoomDepthCm(500);
    setActivePlanId(null);
    window.history.replaceState(null, '', window.location.pathname);
    toast({ title: 'New blank canvas created' });
  };

  const handleNewFromBlueprint = () => {
    setBlueprintWizardOpen(true);
  };

  const handleImport = () => {
    router.push('/tools/import');
  };

  const handleOpenPlan = (id: number) => {
    setActivePlanId(id);
    window.history.replaceState(null, '', `?id=${id}`);
  };

  const handleBlueprintComplete = (result: BlueprintResult) => {
    clearAll();
    setPlanName(result.planName);
    setRoomWidthCm(result.roomWidthCm);
    setRoomDepthCm(result.roomDepthCm);
    setActivePlanId(null);
    window.history.replaceState(null, '', window.location.pathname);

    const furnitureItems = result.boqItems.flatMap(({ item, count }) => {
      const placed: Record<string, any>[] = [];
      for (let i = 0; i < count; i++) {
        const margin = 30;
        const xPos = margin + Math.random() * Math.max(0, result.roomWidthCm - item.widthCm - margin * 2);
        const yPos = margin + Math.random() * Math.max(0, result.roomDepthCm - item.depthCm - margin * 2);
        placed.push({
          instanceId: `bp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          catalogId: item.id,
          name: item.name,
          category: item.category,
          widthCm: item.widthCm,
          depthCm: item.depthCm,
          heightCm: item.heightCm || 75,
          color: item.color || '#666',
          shape: item.shape || 'rect',
          seatCount: item.seatCount || null,
          price: item.price || null,
          x: xPos,
          y: yPos,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          locked: false,
          opacity: 1,
          zIndex: i,
        });
      }
      return placed;
    });

    const docData = {
      version: 3,
      rooms: [],
      structure: result.structureItems,
      furniture: furnitureItems,
      annotations: [],
      site: [],
      importLayer: null,
      roomWidthCm: result.roomWidthCm,
      roomDepthCm: result.roomDepthCm,
    };
    loadDocument(JSON.stringify(docData));

    const totalFurniture = furnitureItems.length;
    const desc = totalFurniture > 0
      ? `${result.structureItems.length} structural elements and ${totalFurniture} furniture items placed.`
      : `${result.structureItems.length} structural elements added as a locked layer.`;
    toast({ title: 'Blueprint placed on canvas', description: desc });
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
          <Button variant="outline" className="gap-2" onClick={() => refetchPlan()}><RefreshCw className="w-4 h-4" /> Retry</Button>
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

  const previewShape = interaction.isDrawing && interaction.drawStart && interaction.drawCurrent
    ? {
        id: '__preview__',
        type: (interaction.drawTool === 'draw-line' ? 'line' : interaction.drawTool === 'draw-rect' ? 'rect' : 'ellipse') as 'line' | 'rect' | 'ellipse',
        x1: interaction.drawStart.x,
        y1: interaction.drawStart.y,
        x2: interaction.drawCurrent.x,
        y2: interaction.drawCurrent.y,
        stroke: interaction.drawStroke,
        fill: interaction.drawFill,
        strokeWidth: interaction.drawStrokeWidth,
      }
    : null;

  return (
    <div className="h-full flex flex-col bg-background">
      <PlannerBreadcrumb
        items={[{ label: 'Canvas Planner' }]}
        planId={planId} planName={planName}
        completedSteps={getCompletedSteps(unifiedDoc)}
        icon={<PenTool className="w-3.5 h-3.5 text-primary" />}
      />
      <CanvasToolbar
        planName={planName} setPlanName={setPlanName}
        touched={touched} setTouched={setTouched} formErrors={formErrors}
        undo={undo} redo={redo}
        selectedItemIds={selectedItemIds} duplicateItems={duplicateItems} rotateItem={rotateItem} deleteItems={deleteItems}
        zoom={zoom} setZoom={setZoom} setPanOffset={setPanOffset}
        showGrid={showGrid} setShowGrid={setShowGrid} gridSnap={gridSnap} setGridSnap={setGridSnap}
        showDimensions={showDimensions} setShowDimensions={setShowDimensions}
        measureMode={measureMode} setMeasureMode={setMeasureMode} setMeasurePoints={setMeasurePoints}
        boqPanelOpen={boqPanelOpen} setBoqPanelOpen={setBoqPanelOpen}
        catalogPanelOpen={catalogPanelOpen} setCatalogPanelOpen={setCatalogPanelOpen}
        roomPanelOpen={roomPanelOpen} setRoomPanelOpen={setRoomPanelOpen}
        onExportPng={handleExportPng} planId={planId}
        onNavigateQuote={() => router.push(`/plans/${planId}/quote`)}
        onSave={handleSave} isSaving={createPlan.isPending || updatePlan.isPending}
        onToggleVersionHistory={() => usePlannerStore.getState().toggleVersionHistory()}
        annotateToolbar={
          <AnnotateToolbar
            drawTool={interaction.drawTool}
            onSetDrawTool={interaction.setDrawTool}
            strokeColor={interaction.drawStroke}
            onSetStrokeColor={interaction.setDrawStroke}
            fillColor={interaction.drawFill}
            onSetFillColor={interaction.setDrawFill}
            strokeWidth={interaction.drawStrokeWidth}
            onSetStrokeWidth={interaction.setDrawStrokeWidth}
            hasSelectedShape={!!interaction.selectedDrawShapeId}
            onDeleteSelected={() => {
              if (interaction.selectedDrawShapeId) {
                interaction.setDrawnShapes(prev => prev.filter(s => s.id !== interaction.selectedDrawShapeId));
                interaction.setSelectedDrawShapeId(null);
              }
            }}
          />
        }
        onNewBlankCanvas={handleNewBlankCanvas}
        onNewFromBlueprint={handleNewFromBlueprint}
        onImport={handleImport}
        onOpenPlan={handleOpenPlan}
      />
      <div className="flex-1 flex overflow-hidden">
        <div
          ref={containerRef}
          className="flex-1 bg-gradient-to-br from-muted/20 via-muted/30 to-muted/40 relative overflow-hidden"
          style={{ cursor: measureMode || interaction.isDrawMode ? 'crosshair' : interaction.spaceDown ? (interaction.isPanning ? 'grabbing' : 'grab') : 'default' }}
        >
          <AiBottomBar
            items={items} roomWidthCm={roomWidthCm} roomDepthCm={roomDepthCm}
            planId={planId} getDocumentJson={getDocumentJson}
            catalogItems={catalogItems} addItem={addItem}
            updateItemTransform={updateItemTransform} clearAll={clearAll} onToast={toast}
            boqOpen={boqPanelOpen}
          />
          <CanvasStage
            stageRef={stageRef} stageSize={stageSize} zoom={zoom} panOffset={panOffset}
            onWheel={interaction.handleWheel} onMouseDown={interaction.handleStageMouseDown}
            onMouseMove={interaction.handleStageMouseMove} onMouseUp={interaction.handleStageMouseUp}
            showGrid={showGrid} roomWidthCm={roomWidthCm} roomDepthCm={roomDepthCm}
            roomOffsetX={roomOffsetX} roomOffsetY={roomOffsetY}
            roomWidthPx={roomWidthPx} roomHeightPx={roomHeightPx}
            pxPerCm={pxPerCm} showDimensions={showDimensions}
            unifiedDoc={unifiedDoc} sortedItems={sortedItems} selectedItemIds={selectedItemIds}
            onItemSelect={interaction.handleItemSelect}
            onItemChange={(id, changes) => { updateItemTransform(id, changes); setAlignmentGuides([]); }}
            onDragMoveItem={handleDragMoveItem}
            setAlignmentGuides={setAlignmentGuides} alignmentGuides={alignmentGuides}
            gridSnap={gridSnap} measurePoints={measurePoints} drawnShapes={interaction.drawnShapes}
            previewShape={previewShape}
            selectedDrawShapeId={interaction.selectedDrawShapeId}
            onSelectDrawShape={interaction.setSelectedDrawShapeId}
            isDrawMode={interaction.isDrawMode}
          />

          {interaction.pendingTextPos && (
            <div
              className="absolute z-20"
              style={{
                left: (roomOffsetX + interaction.pendingTextPos.x * pxPerCm) * zoom + panOffset.x,
                top: (roomOffsetY + interaction.pendingTextPos.y * pxPerCm) * zoom + panOffset.y,
              }}
            >
              <Input
                autoFocus
                value={interaction.pendingTextValue}
                onChange={e => interaction.setPendingTextValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleCommitText();
                  if (e.key === 'Escape') interaction.setPendingTextPos(null);
                }}
                onBlur={handleCommitText}
                placeholder="Type text..."
                className="h-7 w-40 text-xs shadow-lg border-primary"
              />
            </div>
          )}

          {interaction.isDrawMode && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-primary/90 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              {interaction.drawTool === 'draw-text' ? 'Click to place text' : 'Click & drag to draw'}
              <button aria-label="Exit draw mode" onClick={() => interaction.setDrawTool('select')} className="ml-1 hover:bg-white/20 rounded-full p-0.5">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {measureMode && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-red-500/90 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
              <Crosshair className="w-3.5 h-3.5" />
              {measurePoints.length === 0 ? 'Click first point' : measurePoints.length === 1 ? 'Click second point' : 'Click to start new measurement'}
              <button aria-label="Exit measurement mode" onClick={() => { setMeasureMode(false); setMeasurePoints([]); }} className="ml-1 hover:bg-white/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
            </div>
          )}
          <BillOfQuantitiesPanel
            open={boqPanelOpen} onClose={() => setBoqPanelOpen(false)}
            items={items} selectedItemIds={selectedItemIds}
            onSelectItems={(ids) => setSelectedItemIds(new Set(ids))}
            onZoomToItem={handleZoomToItem}
            roomWidthCm={roomWidthCm} roomDepthCm={roomDepthCm}
          />
          <CatalogPanel
            open={catalogPanelOpen} onClose={() => setCatalogPanelOpen(false)}
            catalogSearch={catalogSearch} setCatalogSearch={setCatalogSearch}
            selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
            categories={categories} filteredCatalog={filteredCatalog}
            catalogError={catalogError} refetchCatalog={refetchCatalog}
            onAddItem={(item) => addItem(item, roomWidthCm / 2 - item.widthCm / 2, roomDepthCm / 2 - item.depthCm / 2)}
          />
          <RoomSettingsPanel
            open={roomPanelOpen} onClose={() => setRoomPanelOpen(false)}
            roomWidthCm={roomWidthCm} setRoomWidthCm={setRoomWidthCm}
            roomDepthCm={roomDepthCm} setRoomDepthCm={setRoomDepthCm}
            touched={touched} setTouched={setTouched} formErrors={formErrors}
          />
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[10px] text-muted-foreground bg-card/95 backdrop-blur-md rounded-lg px-2.5 py-1.5 border shadow-md">
            <span className="font-medium text-foreground">{items.length}</span><span>items</span>
            <span className="w-px h-3 bg-border/60 hidden sm:block" />
            <span className="font-mono hidden sm:inline">{(roomWidthCm / 100).toFixed(1)}m × {(roomDepthCm / 100).toFixed(1)}m</span>
            <span className="w-px h-3 bg-border/60 hidden md:block" />
            <span className="hidden md:inline">{(totalAreaCm2 / 10000).toFixed(1)} m²</span>
            <span className="w-px h-3 bg-border/60" />
            <span className={`font-medium ${usedPct > 80 ? 'text-red-500' : usedPct > 50 ? 'text-amber-500' : 'text-emerald-500'}`}>{usedPct}%</span>
            <span className="w-px h-3 bg-border/60" />
            <span className="font-mono tabular-nums">{Math.round(zoom * 100)}%</span>
            {gridSnap && (<><span className="w-px h-3 bg-border/60" /><span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Snap</span></>)}
          </div>
          <div className="absolute bottom-3 right-3 text-[10px] text-muted-foreground/50 bg-card/90 backdrop-blur-md rounded-lg px-2.5 py-1.5 border shadow-md hidden lg:block">
            <span>Scroll: Zoom · Space+Drag: Pan · Shift: Multi · R: Rotate · Del: Delete</span>
          </div>
        </div>
        <InspectorPanel
          inspectorTab={inspectorTab} setInspectorTab={setInspectorTab}
          items={items} sortedItems={sortedItems}
          selectedItemIds={selectedItemIds} setSelectedItemIds={setSelectedItemIds}
          selectedItem={selectedItem} updateItem={updateItem}
          toggleLock={toggleLock} bringToFront={bringToFront} sendToBack={sendToBack}
        />
      </div>
      <VersionHistoryPanel
        planId={planId} getCurrentDocument={() => getDocumentJson()}
        onRestore={(docJson) => { loadDocument(docJson); toast({ title: "Version restored", description: "The plan has been restored to the selected version." }); }}
      />
      <BlueprintWizardModal
        open={blueprintWizardOpen}
        onClose={() => setBlueprintWizardOpen(false)}
        onComplete={handleBlueprintComplete}
      />
    </div>
  );
}

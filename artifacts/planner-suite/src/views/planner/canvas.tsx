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
import { FurnitureSummaryPanel } from '@/components/planner/FurnitureSummaryPanel';
import { AiToolsPanel } from '@/components/planner/AiToolsPanel';
import { CanvasStage } from '@/components/planner/CanvasStage';
import {
  type FormErrors, type AlignmentGuide,
  validateForm, computeAlignmentGuides,
} from '@/components/planner/canvas-types';

export default function CanvasPlanner() {
  const router = useRouter();
  const searchParams = new URLSearchParams(window.location.search);
  const planId = searchParams.get('id') ? Number(searchParams.get('id')) : null;

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
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<'items' | 'properties'>('items');
  const [measureMode, setMeasureMode] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<{ x: number; y: number }[]>([]);
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([]);
  const [summaryPanelOpen, setSummaryPanelOpen] = useState(false);
  const [catalogPanelOpen, setCatalogPanelOpen] = useState(false);
  const [roomPanelOpen, setRoomPanelOpen] = useState(false);

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

  const categorySummary = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach(item => { counts[item.category || 'Other'] = (counts[item.category || 'Other'] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [items]);

  const usedAreaCm2 = useMemo(() => items.reduce((sum, item) => sum + item.widthCm * item.depthCm, 0), [items]);
  const totalAreaCm2 = roomWidthCm * roomDepthCm;
  const freeAreaCm2 = Math.max(0, totalAreaCm2 - usedAreaCm2);
  const usedPct = totalAreaCm2 > 0 ? Math.round((usedAreaCm2 / totalAreaCm2) * 100) : 0;

  const handleDragMoveItem = useCallback((dragItem: PlacedItem, xCm: number, yCm: number) => {
    setAlignmentGuides(computeAlignmentGuides({ ...dragItem, x: xCm, y: yCm }, items, roomWidthCm, roomDepthCm));
  }, [items, roomWidthCm, roomDepthCm]);

  useEffect(() => {
    if (existingPlan) {
      setPlanName(existingPlan.name);
      setRoomWidthCm(existingPlan.roomWidthCm);
      setRoomDepthCm(existingPlan.roomDepthCm);
      if (existingPlan.documentJson) {
        loadDocument(existingPlan.documentJson);
        try {
          const parsed = JSON.parse(existingPlan.documentJson);
          if (parsed.drawnShapes) interaction.setDrawnShapes(parsed.drawnShapes);
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
    const payload = { name: planName, roomWidthCm, roomDepthCm, plannerType: 'canvas' as const, documentJson: getDocumentJson() };
    if (planId) {
      updatePlan.mutate({ id: planId, data: payload }, {
        onSuccess: () => {
          toast({ title: 'Plan updated successfully' });
          fetch(`/api/plans/${planId}/versions`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: `Auto-save`, documentJson: getDocumentJson() }) }).catch(() => {});
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
        summaryPanelOpen={summaryPanelOpen} setSummaryPanelOpen={setSummaryPanelOpen}
        catalogPanelOpen={catalogPanelOpen} setCatalogPanelOpen={setCatalogPanelOpen}
        roomPanelOpen={roomPanelOpen} setRoomPanelOpen={setRoomPanelOpen}
        onExportPng={handleExportPng} planId={planId}
        onNavigateQuote={() => router.push(`/plans/${planId}/quote`)}
        aiPanelOpen={aiPanelOpen} setAiPanelOpen={setAiPanelOpen}
        onSave={handleSave} isSaving={createPlan.isPending || updatePlan.isPending}
        onToggleVersionHistory={() => usePlannerStore.getState().toggleVersionHistory()}
      />
      <div className="flex-1 flex overflow-hidden">
        <div
          ref={containerRef}
          className="flex-1 bg-gradient-to-br from-muted/20 via-muted/30 to-muted/40 relative overflow-hidden"
          style={{ cursor: measureMode ? 'crosshair' : interaction.spaceDown ? (interaction.isPanning ? 'grabbing' : 'grab') : 'default' }}
        >
          <AiToolsPanel
            open={aiPanelOpen} onClose={() => setAiPanelOpen(false)}
            items={items} roomWidthCm={roomWidthCm} roomDepthCm={roomDepthCm}
            planId={planId} getDocumentJson={getDocumentJson}
            catalogItems={catalogItems} addItem={addItem}
            updateItemTransform={updateItemTransform} clearAll={clearAll} onToast={toast}
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
          />
          {measureMode && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-red-500/90 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
              <Crosshair className="w-3.5 h-3.5" />
              {measurePoints.length === 0 ? 'Click first point' : measurePoints.length === 1 ? 'Click second point' : 'Click to start new measurement'}
              <button aria-label="Exit measurement mode" onClick={() => { setMeasureMode(false); setMeasurePoints([]); }} className="ml-1 hover:bg-white/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
            </div>
          )}
          <FurnitureSummaryPanel
            open={summaryPanelOpen} onClose={() => setSummaryPanelOpen(false)}
            categorySummary={categorySummary as [string, number][]}
            totalItems={items.length} usedAreaCm2={usedAreaCm2} freeAreaCm2={freeAreaCm2} usedPct={usedPct}
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
    </div>
  );
}

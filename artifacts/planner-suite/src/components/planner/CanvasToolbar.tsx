import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Save, RotateCw, Trash2, Copy, Loader2,
  Sparkles, Grid3X3, Undo2, Redo2,
  ZoomIn, ZoomOut, Download, Ruler,
  Eye, EyeOff, Crosshair, BarChart3, FileSpreadsheet,
  History, Box, Rows3,
} from 'lucide-react';
import type { FormErrors } from './canvas-types';
import { MIN_ZOOM, MAX_ZOOM, ZOOM_STEP } from './canvas-types';

interface CanvasToolbarProps {
  planName: string;
  setPlanName: (v: string) => void;
  touched: Record<string, boolean>;
  setTouched: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  formErrors: FormErrors;
  undo: () => void;
  redo: () => void;
  selectedItemIds: Set<string>;
  duplicateItems: (ids: string[]) => void;
  rotateItem: (id: string) => void;
  deleteItems: (ids: string[]) => void;
  zoom: number;
  setZoom: (v: number | ((z: number) => number)) => void;
  setPanOffset: (v: { x: number; y: number }) => void;
  showGrid: boolean;
  setShowGrid: (v: boolean) => void;
  gridSnap: boolean;
  setGridSnap: (v: boolean) => void;
  showDimensions: boolean;
  setShowDimensions: (v: boolean) => void;
  measureMode: boolean;
  setMeasureMode: (v: boolean) => void;
  setMeasurePoints: (v: { x: number; y: number }[]) => void;
  summaryPanelOpen: boolean;
  setSummaryPanelOpen: (v: boolean) => void;
  catalogPanelOpen: boolean;
  setCatalogPanelOpen: (v: boolean) => void;
  roomPanelOpen: boolean;
  setRoomPanelOpen: (v: boolean) => void;
  onExportPng: () => void;
  planId: number | null;
  onNavigateQuote: () => void;
  aiPanelOpen: boolean;
  setAiPanelOpen: (v: boolean) => void;
  onSave: () => void;
  isSaving: boolean;
  onToggleVersionHistory: () => void;
}

export function CanvasToolbar({
  planName, setPlanName,
  touched, setTouched, formErrors,
  undo, redo,
  selectedItemIds, duplicateItems, rotateItem, deleteItems,
  zoom, setZoom, setPanOffset,
  showGrid, setShowGrid, gridSnap, setGridSnap,
  showDimensions, setShowDimensions,
  measureMode, setMeasureMode, setMeasurePoints,
  summaryPanelOpen, setSummaryPanelOpen,
  catalogPanelOpen, setCatalogPanelOpen,
  roomPanelOpen, setRoomPanelOpen,
  onExportPng, planId, onNavigateQuote,
  aiPanelOpen, setAiPanelOpen,
  onSave, isSaving,
  onToggleVersionHistory,
}: CanvasToolbarProps) {
  return (
    <header className="min-h-11 border-b flex items-center justify-between px-3 shrink-0 bg-card/95 backdrop-blur-sm flex-wrap gap-y-1 py-1 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="space-y-0">
          <Input
            value={planName}
            onChange={(e) => { setPlanName(e.target.value); setTouched(t => ({ ...t, planName: true })); }}
            className={`w-36 sm:w-48 h-7 text-sm font-medium border-transparent hover:border-input focus:border-input bg-transparent ${touched.planName && formErrors.planName ? 'border-destructive' : ''}`}
          />
          {touched.planName && formErrors.planName && (
            <p className="text-[10px] text-destructive">{formErrors.planName}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-0.5 flex-wrap">
        <div className="flex items-center gap-0.5 rounded-lg border border-border/50 bg-muted/30 p-0.5">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={undo} title="Undo (Ctrl+Z)">
            <Undo2 className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={redo} title="Redo (Ctrl+Y)">
            <Redo2 className="w-3.5 h-3.5" />
          </Button>
        </div>
        <div className="w-px h-5 bg-border/40 mx-1 hidden sm:block" />
        <div className="flex items-center gap-0.5 rounded-lg border border-border/50 bg-muted/30 p-0.5">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => duplicateItems(Array.from(selectedItemIds))} disabled={selectedItemIds.size === 0} title="Duplicate (Ctrl+D)">
            <Copy className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => selectedItemIds.forEach(id => rotateItem(id))} disabled={selectedItemIds.size === 0} title="Rotate 90° (R)">
            <RotateCw className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteItems(Array.from(selectedItemIds))} disabled={selectedItemIds.size === 0} title="Delete (Del)">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
        <div className="w-px h-5 bg-border/40 mx-1 hidden sm:block" />
        <div className="flex items-center gap-0.5 rounded-lg border border-border/50 bg-muted/30 p-0.5">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(z => Math.max(MIN_ZOOM, z - ZOOM_STEP))} title="Zoom Out (-)">
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <button
            className="h-7 px-1.5 text-[11px] font-mono text-muted-foreground hover:text-foreground tabular-nums"
            onClick={() => { setZoom(() => 1); setPanOffset({ x: 0, y: 0 }); }}
            title="Reset zoom (0)"
          >
            {Math.round(zoom * 100)}%
          </button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(z => Math.min(MAX_ZOOM, z + ZOOM_STEP))} title="Zoom In (+)">
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
        </div>
        <div className="w-px h-5 bg-border/40 mx-1 hidden sm:block" />
        <div className="flex items-center gap-0.5 rounded-lg border border-border/50 bg-muted/30 p-0.5">
          <Button variant={showGrid ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => setShowGrid(!showGrid)} title="Toggle Grid">
            <Grid3X3 className="w-3.5 h-3.5" />
          </Button>
          <Button variant={gridSnap ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => setGridSnap(!gridSnap)} title="Toggle Snap">
            <Ruler className="w-3.5 h-3.5" />
          </Button>
          <Button variant={showDimensions ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => setShowDimensions(!showDimensions)} title="Toggle Dimensions">
            {showDimensions ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </Button>
          <Button
            variant={measureMode ? 'default' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => { setMeasureMode(!measureMode); setMeasurePoints([]); }}
            title="Measurement Tool"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant={summaryPanelOpen ? 'secondary' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => setSummaryPanelOpen(!summaryPanelOpen)}
            title="Furniture Summary"
          >
            <BarChart3 className="w-3.5 h-3.5" />
          </Button>
        </div>
        <div className="w-px h-5 bg-border/40 mx-1 hidden sm:block" />
        <Button
          variant={catalogPanelOpen ? 'secondary' : 'ghost'}
          size="sm"
          className="h-7 gap-1 text-[11px]"
          onClick={() => { setCatalogPanelOpen(!catalogPanelOpen); if (!catalogPanelOpen) setRoomPanelOpen(false); }}
          title="Toggle Catalog"
        >
          <Box className="w-3 h-3" />
          <span className="hidden lg:inline">Catalog</span>
        </Button>
        <Button
          variant={roomPanelOpen ? 'secondary' : 'ghost'}
          size="sm"
          className="h-7 gap-1 text-[11px]"
          onClick={() => { setRoomPanelOpen(!roomPanelOpen); if (!roomPanelOpen) setCatalogPanelOpen(false); }}
          title="Room Settings"
        >
          <Rows3 className="w-3 h-3" />
          <span className="hidden lg:inline">Room</span>
        </Button>
        <div className="w-px h-5 bg-border/40 mx-1 hidden sm:block" />
        <Button variant="ghost" size="sm" className="h-7 gap-1 text-[11px]" onClick={onExportPng} title="Export PNG">
          <Download className="w-3 h-3" />
          <span className="hidden lg:inline">PNG</span>
        </Button>
        {planId && (
          <Button variant="outline" size="sm" className="h-7 gap-1 text-[11px]" onClick={onNavigateQuote} title="Generate Quote">
            <FileSpreadsheet className="w-3 h-3" />
            <span className="hidden lg:inline">Quote</span>
          </Button>
        )}
        <Button variant={aiPanelOpen ? 'secondary' : 'outline'} size="sm" className="h-7 gap-1 text-[11px]" onClick={() => setAiPanelOpen(!aiPanelOpen)}>
          <Sparkles className="w-3 h-3 text-primary" />
          <span className="hidden md:inline">AI</span>
        </Button>
        <Button size="sm" className="h-7 gap-1 text-[11px]" onClick={onSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
          <span className="hidden sm:inline">Save</span>
        </Button>
        {planId && (
          <Button variant="outline" size="sm" className="h-7 gap-1 text-[11px]" onClick={onToggleVersionHistory}>
            <History className="w-3 h-3" />
            <span className="hidden md:inline">Versions</span>
          </Button>
        )}
      </div>
    </header>
  );
}

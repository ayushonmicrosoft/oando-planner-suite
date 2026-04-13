import { useState } from 'react';
import type { PlacedItem } from '@/hooks/use-canvas-planner';
import {
  useGetAiAdvice,
  useGenerateAutoLayout,
  type AutoLayoutResponse,
  type CatalogItem,
  type AutoLayoutRequestRoomType,
  type AiAdvisorResponse,
} from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  X, Loader2, Sparkles, Wand2,
  AlertTriangle, CheckCircle2, RefreshCw,
} from 'lucide-react';

interface AiToolsPanelProps {
  open: boolean;
  onClose: () => void;
  items: PlacedItem[];
  roomWidthCm: number;
  roomDepthCm: number;
  planId: number | null;
  getDocumentJson: () => string;
  catalogItems: CatalogItem[] | undefined;
  addItem: (catalogItem: CatalogItem, x: number, y: number) => string;
  updateItemTransform: (id: string, changes: { rotation?: number }) => void;
  clearAll: () => void;
  onToast: (opts: { title: string }) => void;
}

export function AiToolsPanel({
  open, onClose,
  items, roomWidthCm, roomDepthCm,
  planId, getDocumentJson,
  catalogItems, addItem, updateItemTransform, clearAll,
  onToast,
}: AiToolsPanelProps) {
  const [aiAdvice, setAiAdvice] = useState<{ advice: string; suggestions: string[]; issues?: string[]; positives?: string[] } | null>(null);
  const [aiQuery, setAiQuery] = useState('Review my current canvas layout for flow and ergonomics.');
  const [aiTab, setAiTab] = useState<'advisor' | 'auto-layout'>('advisor');
  const [autoLayoutRoomType, setAutoLayoutRoomType] = useState<AutoLayoutRequestRoomType>('open-office');
  const [autoLayoutCapacity, setAutoLayoutCapacity] = useState(6);
  const [autoLayoutResult, setAutoLayoutResult] = useState<AutoLayoutResponse | null>(null);

  const getAiAdvice = useGetAiAdvice();
  const generateAutoLayout = useGenerateAutoLayout();

  const handleAskAi = (customQuery?: string) => {
    if (planId) {
      fetch(`/api/plans/${planId}/versions`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Before AI layout", documentJson: getDocumentJson() }),
      }).catch(() => {});
    }
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
      },
    }, {
      onSuccess: (data) => {
        setAiAdvice(data as AiAdvisorResponse);
      },
    });
  };

  const handleAutoLayoutGenerate = () => {
    generateAutoLayout.mutate({
      data: {
        roomWidthCm,
        roomDepthCm,
        roomType: autoLayoutRoomType,
        capacity: autoLayoutCapacity,
      },
    }, {
      onSuccess: (data) => {
        setAutoLayoutResult(data);
      },
    });
  };

  const handleAutoLayoutAccept = () => {
    if (!autoLayoutResult || !catalogItems) return;
    clearAll();
    for (const item of autoLayoutResult.layout) {
      const catalogMatch = catalogItems.find((c) => c.id === item.catalogId);
      const catalogItem: CatalogItem = {
        id: item.catalogId,
        name: item.name,
        category: item.category,
        widthCm: item.widthCm,
        depthCm: item.depthCm,
        heightCm: item.heightCm,
        color: item.color,
        shape: item.shape,
        seatCount: catalogMatch?.seatCount ?? null,
        price: catalogMatch?.price ?? null,
        description: catalogMatch?.description ?? null,
        imageUrl: catalogMatch?.imageUrl ?? null,
        seriesId: (catalogMatch as any)?.seriesId ?? null,
        subCategory: (catalogMatch as any)?.subCategory ?? null,
      };
      const instanceId = addItem(catalogItem, item.x, item.y);
      if (item.rotation && item.rotation !== 0 && instanceId) {
        updateItemTransform(instanceId, { rotation: item.rotation });
      }
    }
    setAutoLayoutResult(null);
    onToast({ title: `Auto-layout placed ${autoLayoutResult.layout.length} items` });
  };

  if (!open) return null;

  return (
    <div className="absolute top-0 right-0 w-80 h-full z-10 bg-card border-l shadow-lg flex flex-col">
      <div className="p-3 border-b flex justify-between items-center">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" /> AI Tools
        </h4>
        <button aria-label="Close AI panel" onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex border-b" role="tablist">
        <button
          role="tab"
          aria-selected={aiTab === 'advisor'}
          className={`flex-1 px-3 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${aiTab === 'advisor' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          onClick={() => setAiTab('advisor')}
        >
          <Sparkles className="w-3 h-3" /> Advisor
        </button>
        <button
          role="tab"
          aria-selected={aiTab === 'auto-layout'}
          className={`flex-1 px-3 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${aiTab === 'auto-layout' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          onClick={() => setAiTab('auto-layout')}
        >
          <Wand2 className="w-3 h-3" /> Auto-Layout
        </button>
      </div>

      {aiTab === 'advisor' && (
        <>
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
        </>
      )}

      {aiTab === 'auto-layout' && (
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Room Type</Label>
              <select
                aria-label="Room type"
                value={autoLayoutRoomType}
                onChange={(e) => setAutoLayoutRoomType(e.target.value as AutoLayoutRequestRoomType)}
                className="w-full h-8 rounded-md border bg-background px-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              >
                <option value="open-office">Open Office</option>
                <option value="conference">Conference Room</option>
                <option value="executive">Executive Office</option>
                <option value="reception">Reception Area</option>
                <option value="breakout">Breakout / Lounge</option>
                <option value="training">Training Room</option>
                <option value="hot-desk">Hot Desk Area</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Capacity (people)</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={autoLayoutCapacity}
                onChange={(e) => setAutoLayoutCapacity(Math.max(1, Math.min(100, Number(e.target.value))))}
                className="h-8 text-sm"
              />
            </div>

            <div className="text-[10px] text-muted-foreground bg-muted/40 rounded-md p-2">
              Room: {(roomWidthCm / 100).toFixed(1)}m x {(roomDepthCm / 100).toFixed(1)}m ({((roomWidthCm * roomDepthCm) / 10000).toFixed(1)} m²)
            </div>

            <Button
              size="sm"
              className="w-full h-8 text-xs gap-1.5"
              onClick={handleAutoLayoutGenerate}
              disabled={generateAutoLayout.isPending}
            >
              {generateAutoLayout.isPending ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</>
              ) : (
                <><Wand2 className="w-3.5 h-3.5" /> Generate Layout</>
              )}
            </Button>

            {autoLayoutResult && (
              <div className="space-y-3 pt-1">
                <div className="rounded-md bg-muted/50 p-2.5 text-xs text-muted-foreground leading-relaxed">
                  {autoLayoutResult.summary}
                </div>

                <div className="text-xs font-medium">
                  {autoLayoutResult.layout.length} items placed
                </div>

                {!autoLayoutResult.validation.valid && (
                  <div className="space-y-1.5">
                    {autoLayoutResult.validation.overlaps.map((o, i) => (
                      <div key={`o${i}`} className="flex items-start gap-1.5 text-[11px] text-red-600 bg-red-50 dark:bg-red-950/30 rounded-md p-2">
                        <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                        <span>{o}</span>
                      </div>
                    ))}
                    {autoLayoutResult.validation.outOfBounds.map((o, i) => (
                      <div key={`b${i}`} className="flex items-start gap-1.5 text-[11px] text-red-600 bg-red-50 dark:bg-red-950/30 rounded-md p-2">
                        <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                        <span>{o}</span>
                      </div>
                    ))}
                  </div>
                )}

                {autoLayoutResult.validation.warnings.length > 0 && (
                  <div className="space-y-1.5">
                    {autoLayoutResult.validation.warnings.map((w, i) => (
                      <div key={`w${i}`} className="flex items-start gap-1.5 text-[11px] text-amber-700 bg-amber-50 dark:bg-amber-950/30 rounded-md p-2">
                        <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                )}

                {autoLayoutResult.validation.valid && (
                  <div className="flex items-center gap-1.5 text-[11px] text-green-700 bg-green-50 dark:bg-green-950/30 rounded-md p-2">
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                    <span>Layout passed all validation checks</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 h-8 text-xs gap-1"
                    onClick={handleAutoLayoutAccept}
                  >
                    <CheckCircle2 className="w-3 h-3" /> Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1"
                    onClick={handleAutoLayoutGenerate}
                    disabled={generateAutoLayout.isPending}
                  >
                    <RefreshCw className="w-3 h-3" /> Retry
                  </Button>
                </div>
              </div>
            )}

            {!autoLayoutResult && !generateAutoLayout.isPending && (
              <div className="text-xs text-muted-foreground text-center py-6">
                <Wand2 className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p>Select a room type and capacity, then click "Generate Layout" to create an optimized furniture arrangement.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

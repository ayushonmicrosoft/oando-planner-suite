import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  Loader2, Sparkles, Wand2,
  AlertTriangle, CheckCircle2, RefreshCw,
  ChevronUp, ChevronDown, Lightbulb, X,
} from 'lucide-react';

interface AiBottomBarProps {
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
  boqOpen: boolean;
}

interface ProactiveTip {
  id: string;
  text: string;
  type: 'info' | 'warning' | 'success';
  timestamp: number;
}

function generateProactiveTips(items: PlacedItem[], roomWidthCm: number, roomDepthCm: number): ProactiveTip[] {
  const tips: ProactiveTip[] = [];
  const now = Date.now();
  const totalAreaM2 = (roomWidthCm * roomDepthCm) / 10000;
  const usedArea = items.reduce((s, i) => s + i.widthCm * i.depthCm, 0) / 10000;
  const usedPct = totalAreaM2 > 0 ? (usedArea / totalAreaM2) * 100 : 0;

  if (items.length === 0) {
    tips.push({ id: 'empty', text: `Room is ${totalAreaM2.toFixed(1)} m². Start by adding furniture from the catalog.`, type: 'info', timestamp: now });
    return tips;
  }

  const workstations = items.filter(i => i.category?.toLowerCase().includes('workstation') || i.category?.toLowerCase().includes('desk'));
  if (workstations.length > 0) {
    const suggestedRange = [Math.floor(totalAreaM2 / 7), Math.ceil(totalAreaM2 / 5)];
    tips.push({
      id: 'capacity',
      text: `Room is ${totalAreaM2.toFixed(1)} m², suited for ${suggestedRange[0]}-${suggestedRange[1]} workstations. You have ${workstations.length}.`,
      type: workstations.length > suggestedRange[1] ? 'warning' : 'info',
      timestamp: now,
    });
  }

  if (usedPct > 70) {
    tips.push({ id: 'crowded', text: `Layout is ${Math.round(usedPct)}% occupied — consider removing items for better circulation.`, type: 'warning', timestamp: now });
  } else if (usedPct > 50) {
    tips.push({ id: 'moderate', text: `Good space utilization at ${Math.round(usedPct)}%.`, type: 'success', timestamp: now });
  }

  const wallBuffer = 20;
  for (const item of items) {
    if (item.x < wallBuffer || item.y < wallBuffer || item.x + item.widthCm > roomWidthCm - wallBuffer || item.y + item.depthCm > roomDepthCm - wallBuffer) {
      tips.push({ id: `wall-${item.instanceId}`, text: `"${item.name}" is very close to a wall — ensure adequate clearance for movement.`, type: 'warning', timestamp: now });
      break;
    }
  }

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i], b = items[j];
      const overlapX = Math.min(a.x + a.widthCm, b.x + b.widthCm) - Math.max(a.x, b.x);
      const overlapY = Math.min(a.y + a.depthCm, b.y + b.depthCm) - Math.max(a.y, b.y);
      if (overlapX > 5 && overlapY > 5) {
        tips.push({ id: `overlap-${i}-${j}`, text: `"${a.name}" and "${b.name}" are overlapping — adjust placement.`, type: 'warning', timestamp: now });
        break;
      }
    }
    if (tips.some(t => t.id.startsWith('overlap'))) break;
  }

  return tips.slice(0, 3);
}

export function AiBottomBar({
  items, roomWidthCm, roomDepthCm,
  planId, getDocumentJson,
  catalogItems, addItem, updateItemTransform, clearAll,
  onToast, boqOpen,
}: AiBottomBarProps) {
  const [expanded, setExpanded] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<{ advice: string; suggestions: string[]; issues?: string[]; positives?: string[] } | null>(null);
  const [aiQuery, setAiQuery] = useState('Review my current canvas layout for flow and ergonomics.');
  const [aiTab, setAiTab] = useState<'advisor' | 'auto-layout'>('advisor');
  const [autoLayoutRoomType, setAutoLayoutRoomType] = useState<AutoLayoutRequestRoomType>('open-office');
  const [autoLayoutCapacity, setAutoLayoutCapacity] = useState(6);
  const [autoLayoutResult, setAutoLayoutResult] = useState<AutoLayoutResponse | null>(null);
  const [hasNewTip, setHasNewTip] = useState(false);
  const prevItemCountRef = useRef(items.length);

  const getAiAdvice = useGetAiAdvice();
  const generateAutoLayout = useGenerateAutoLayout();

  const proactiveTips = useMemo(() => generateProactiveTips(items, roomWidthCm, roomDepthCm), [items, roomWidthCm, roomDepthCm]);
  const latestTip = proactiveTips[0];

  useEffect(() => {
    if (items.length !== prevItemCountRef.current) {
      prevItemCountRef.current = items.length;
      if (!expanded) setHasNewTip(true);
    }
  }, [items.length, expanded]);

  useEffect(() => {
    if (expanded) setHasNewTip(false);
  }, [expanded]);

  const handleAskAi = useCallback((customQuery?: string) => {
    if (planId) {
      fetch(`/api/plans/${planId}/versions`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Before AI layout", documentJson: getDocumentJson() }),
      }).catch(() => {});
    }
    const catSet = new Set<string>();
    items.forEach(item => { if (item.category) catSet.add(item.category); });
    const spatialItems = items.map(item => ({
      x: item.x, y: item.y,
      widthCm: item.widthCm, depthCm: item.depthCm,
      rotation: item.rotation, name: item.name || 'Item',
    }));
    getAiAdvice.mutate({
      data: {
        roomWidthCm, roomDepthCm,
        itemCount: items.length,
        categories: Array.from(catSet),
        query: customQuery || aiQuery,
        items: spatialItems,
      },
    }, {
      onSuccess: (data) => setAiAdvice(data as AiAdvisorResponse),
    });
  }, [planId, getDocumentJson, items, roomWidthCm, roomDepthCm, aiQuery, getAiAdvice]);

  const handleAutoLayoutGenerate = useCallback(() => {
    generateAutoLayout.mutate({
      data: { roomWidthCm, roomDepthCm, roomType: autoLayoutRoomType, capacity: autoLayoutCapacity },
    }, {
      onSuccess: (data) => setAutoLayoutResult(data),
    });
  }, [generateAutoLayout, roomWidthCm, roomDepthCm, autoLayoutRoomType, autoLayoutCapacity]);

  const handleAutoLayoutAccept = useCallback(() => {
    if (!autoLayoutResult || !catalogItems) return;
    clearAll();
    for (const item of autoLayoutResult.layout) {
      const catalogMatch = catalogItems.find((c) => c.id === item.catalogId);
      const catalogItem: CatalogItem = {
        id: item.catalogId, name: item.name, category: item.category,
        widthCm: item.widthCm, depthCm: item.depthCm, heightCm: item.heightCm,
        color: item.color, shape: item.shape,
        seatCount: catalogMatch?.seatCount ?? null, price: catalogMatch?.price ?? null,
        description: catalogMatch?.description ?? null, imageUrl: catalogMatch?.imageUrl ?? null,
        seriesId: (catalogMatch as any)?.seriesId ?? null, subCategory: (catalogMatch as any)?.subCategory ?? null,
      };
      const instanceId = addItem(catalogItem, item.x, item.y);
      if (item.rotation && item.rotation !== 0 && instanceId) {
        updateItemTransform(instanceId, { rotation: item.rotation });
      }
    }
    setAutoLayoutResult(null);
    onToast({ title: `Auto-layout placed ${autoLayoutResult.layout.length} items` });
  }, [autoLayoutResult, catalogItems, clearAll, addItem, updateItemTransform, onToast]);

  return (
    <div className={`absolute bottom-0 left-0 z-20 bg-card border-t shadow-lg transition-all duration-300 ease-in-out ${boqOpen ? 'right-80' : 'right-0'}`}>
      <div
        className="flex items-center gap-2 px-4 py-1.5 cursor-pointer hover:bg-muted/50 transition-colors select-none"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setExpanded(!expanded); }}
      >
        <div className="relative">
          <Sparkles className="w-4 h-4 text-primary" />
          {hasNewTip && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </div>
        <span className="text-xs text-muted-foreground flex-1 truncate">
          {latestTip ? latestTip.text : 'AI Assistant — click to expand'}
        </span>
        {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />}
      </div>

      {expanded && (
        <div className="border-t" style={{ height: '320px' }}>
          <div className="h-full flex flex-col">
            <div className="flex border-b shrink-0" role="tablist">
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

            <div className="flex-1 flex overflow-hidden">
              {proactiveTips.length > 0 && (
                <div className="w-56 border-r p-2 overflow-y-auto shrink-0 bg-muted/20">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" /> Tips
                  </div>
                  <div className="space-y-1.5">
                    {proactiveTips.map(tip => (
                      <div
                        key={tip.id}
                        className={`text-[11px] rounded-md p-2 leading-relaxed ${
                          tip.type === 'warning' ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800' :
                          tip.type === 'success' ? 'bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800' :
                          'bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        }`}
                      >
                        {tip.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex-1 flex flex-col overflow-hidden">
                {aiTab === 'advisor' && (
                  <>
                    <div className="p-3 border-b space-y-2 shrink-0">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ask about your layout..."
                          value={aiQuery}
                          onChange={(e) => setAiQuery(e.target.value)}
                          className="h-8 text-sm flex-1"
                          onKeyDown={(e) => { if (e.key === 'Enter') handleAskAi(); }}
                        />
                        <Button
                          size="sm" className="h-8 text-xs gap-1.5 shrink-0"
                          onClick={() => handleAskAi()}
                          disabled={getAiAdvice.isPending}
                        >
                          {getAiAdvice.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                          Analyze
                        </Button>
                      </div>
                    </div>
                    <ScrollArea className="flex-1 p-3">
                      {aiAdvice ? (
                        <div className="space-y-3">
                          {aiAdvice.issues && aiAdvice.issues.length > 0 && (
                            <div className="space-y-1.5">
                              <h5 className="text-xs font-semibold text-red-600 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-red-500" /> Issues ({aiAdvice.issues.length})
                              </h5>
                              {aiAdvice.issues.map((issue, i) => (
                                <div key={i} className="text-xs bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md p-2 text-red-800 dark:text-red-300">{issue}</div>
                              ))}
                            </div>
                          )}
                          {aiAdvice.suggestions.length > 0 && (
                            <div className="space-y-1.5">
                              <h5 className="text-xs font-semibold text-yellow-600 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-yellow-500" /> Suggestions ({aiAdvice.suggestions.length})
                              </h5>
                              {aiAdvice.suggestions.map((s, i) => (
                                <div key={i} className="text-xs bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-md p-2 text-yellow-800 dark:text-yellow-300">{s}</div>
                              ))}
                            </div>
                          )}
                          {aiAdvice.positives && aiAdvice.positives.length > 0 && (
                            <div className="space-y-1.5">
                              <h5 className="text-xs font-semibold text-green-600 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-green-500" /> Good ({aiAdvice.positives.length})
                              </h5>
                              {aiAdvice.positives.map((p, i) => (
                                <div key={i} className="text-xs bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-md p-2 text-green-800 dark:text-green-300">{p}</div>
                              ))}
                            </div>
                          )}
                          <div className="border-t pt-2">
                            <p className="text-xs text-muted-foreground leading-relaxed">{aiAdvice.advice}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground text-center py-6">
                          <Sparkles className="w-6 h-6 mx-auto mb-2 opacity-20" />
                          <p>Ask a question or click "Analyze" for AI feedback.</p>
                        </div>
                      )}
                    </ScrollArea>
                  </>
                )}

                {aiTab === 'auto-layout' && (
                  <ScrollArea className="flex-1">
                    <div className="p-3 space-y-3">
                      <div className="flex gap-3">
                        <div className="space-y-1.5 flex-1">
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
                        <div className="space-y-1.5 w-24">
                          <Label className="text-xs">Capacity</Label>
                          <Input
                            type="number" min={1} max={100}
                            value={autoLayoutCapacity}
                            onChange={(e) => setAutoLayoutCapacity(Math.max(1, Math.min(100, Number(e.target.value))))}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            size="sm" className="h-8 text-xs gap-1.5"
                            onClick={handleAutoLayoutGenerate}
                            disabled={generateAutoLayout.isPending}
                          >
                            {generateAutoLayout.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                            Generate
                          </Button>
                        </div>
                      </div>

                      {autoLayoutResult && (
                        <div className="space-y-2">
                          <div className="rounded-md bg-muted/50 p-2 text-xs text-muted-foreground leading-relaxed">
                            {autoLayoutResult.summary}
                          </div>
                          <div className="text-xs font-medium">{autoLayoutResult.layout.length} items placed</div>

                          {!autoLayoutResult.validation.valid && (
                            <div className="space-y-1">
                              {autoLayoutResult.validation.overlaps.map((o, i) => (
                                <div key={`o${i}`} className="flex items-start gap-1.5 text-[11px] text-red-600 bg-red-50 dark:bg-red-950/30 rounded-md p-2">
                                  <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" /><span>{o}</span>
                                </div>
                              ))}
                              {autoLayoutResult.validation.outOfBounds.map((o, i) => (
                                <div key={`b${i}`} className="flex items-start gap-1.5 text-[11px] text-red-600 bg-red-50 dark:bg-red-950/30 rounded-md p-2">
                                  <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" /><span>{o}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {autoLayoutResult.validation.warnings.length > 0 && (
                            <div className="space-y-1">
                              {autoLayoutResult.validation.warnings.map((w, i) => (
                                <div key={`w${i}`} className="flex items-start gap-1.5 text-[11px] text-amber-700 bg-amber-50 dark:bg-amber-950/30 rounded-md p-2">
                                  <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" /><span>{w}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {autoLayoutResult.validation.valid && (
                            <div className="flex items-center gap-1.5 text-[11px] text-green-700 bg-green-50 dark:bg-green-950/30 rounded-md p-2">
                              <CheckCircle2 className="w-3 h-3 shrink-0" /><span>Layout passed all validation checks</span>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 h-8 text-xs gap-1"
                              variant={autoLayoutResult.validation.valid ? 'default' : 'outline'}
                              onClick={handleAutoLayoutAccept}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              {autoLayoutResult.validation.valid ? 'Accept' : 'Accept Anyway'}
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={handleAutoLayoutGenerate} disabled={generateAutoLayout.isPending}>
                              <RefreshCw className="w-3 h-3" /> Retry
                            </Button>
                          </div>
                        </div>
                      )}

                      {!autoLayoutResult && !generateAutoLayout.isPending && (
                        <div className="text-xs text-muted-foreground text-center py-4">
                          <Wand2 className="w-6 h-6 mx-auto mb-2 opacity-20" />
                          <p>Select room type and capacity, then generate.</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

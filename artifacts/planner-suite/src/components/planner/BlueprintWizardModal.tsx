"use client";

import { useState, useEffect } from 'react';
import {
  useListCategories,
  useListCatalogItems,
  useListSeries,
} from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CheckCircle2, ChevronRight, ChevronLeft, X, Plus, Minus, Loader2,
  Crown, Star, Zap, FileSignature,
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { UnifiedStructureItem } from '@/lib/unified-document';

type WizardStep = 'setup' | 'series' | 'quantities' | 'review';

interface BlueprintWizardModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: (data: BlueprintResult) => void;
}

export interface BlueprintResult {
  planName: string;
  roomWidthCm: number;
  roomDepthCm: number;
  roomType: string;
  structureItems: UnifiedStructureItem[];
  boqItems: { item: any; count: number }[];
}

const ROOM_TYPES = ['open-plan', 'meeting-room', 'executive-suite', 'breakout'];

const WALL_PRESETS: { label: string; kind: 'rect' | 'ellipse'; w: number; h: number; fill: string; details?: any[] }[] = [
  { label: 'Wall (H)', kind: 'rect', w: 160, h: 10, fill: '#374151' },
  { label: 'Wall (V)', kind: 'rect', w: 10, h: 160, fill: '#374151' },
  { label: 'Door', kind: 'rect', w: 70, h: 12, fill: '#a0522d', details: [
    { type: 'line', points: [0, 12, 35, 0], stroke: '#6b3a1f', strokeWidth: 1.5 },
  ] },
  { label: 'Window', kind: 'rect', w: 80, h: 8, fill: '#60a5fa', details: [
    { type: 'line', points: [0, 4, 80, 4], stroke: '#3b82f6', strokeWidth: 1 },
    { type: 'line', points: [40, 0, 40, 8], stroke: '#3b82f6', strokeWidth: 1 },
  ] },
  { label: 'Column', kind: 'ellipse', w: 24, h: 24, fill: '#6b7280', details: [
    { type: 'circle', x: 12, y: 12, r: 5, fill: '#4b5563' },
  ] },
];

let _uid = Date.now();

export function BlueprintWizardModal({ open, onClose, onComplete }: BlueprintWizardModalProps) {
  const [step, setStep] = useState<WizardStep>('setup');
  const [planName, setPlanName] = useState('New Blueprint');
  const [roomWidthCm, setRoomWidthCm] = useState(600);
  const [roomDepthCm, setRoomDepthCm] = useState(400);
  const [roomType, setRoomType] = useState('open-plan');
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [placedItems, setPlacedItems] = useState<{ item: any; count: number }[]>([]);

  const { data: categories, isLoading: categoriesLoading } = useListCategories();
  const { data: seriesData, isLoading: seriesLoading } = useListSeries();
  const { data: catalogItems } = useListCatalogItems();

  useEffect(() => {
    if (open) {
      setStep('setup');
      setPlanName('New Blueprint');
      setRoomWidthCm(600);
      setRoomDepthCm(400);
      setRoomType('open-plan');
      setSelectedSeriesId(null);
      setSelectedCategories([]);
      setPlacedItems([]);
    }
  }, [open]);

  if (!open) return null;

  const steps: { id: WizardStep; title: string }[] = [
    { id: 'setup', title: 'Room Setup' },
    { id: 'series', title: 'Choose Series' },
    { id: 'quantities', title: 'Quantities' },
    { id: 'review', title: 'Review' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);

  const filteredItems = catalogItems?.filter(item => {
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(item.category);
    const matchesSeries = !selectedSeriesId || (item as any).seriesId === selectedSeriesId || !(item as any).seriesId;
    return matchesCategory && matchesSeries;
  });

  const handleAddItem = (item: any) => {
    setPlacedItems(prev => {
      const existing = prev.find(p => p.item.id === item.id);
      if (existing) return prev.map(p => p.item.id === item.id ? { ...p, count: p.count + 1 } : p);
      return [...prev, { item, count: 1 }];
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setPlacedItems(prev => {
      const existing = prev.find(p => p.item.id === itemId);
      if (existing && existing.count > 1) return prev.map(p => p.item.id === itemId ? { ...p, count: p.count - 1 } : p);
      return prev.filter(p => p.item.id !== itemId);
    });
  };

  const handleToggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const buildStructureItems = (): UnifiedStructureItem[] => {
    const items: UnifiedStructureItem[] = [];
    const wallThickness = 10;
    const pxPerCm = 1;
    const w = roomWidthCm * pxPerCm;
    const h = roomDepthCm * pxPerCm;

    items.push({
      id: `struct_${_uid++}`, defLabel: 'Top Wall', kind: 'rect',
      x: 0, y: 0, width: w, height: wallThickness, fill: '#374151', rotation: 0,
    });
    items.push({
      id: `struct_${_uid++}`, defLabel: 'Bottom Wall', kind: 'rect',
      x: 0, y: h - wallThickness, width: w, height: wallThickness, fill: '#374151', rotation: 0,
    });
    items.push({
      id: `struct_${_uid++}`, defLabel: 'Left Wall', kind: 'rect',
      x: 0, y: 0, width: wallThickness, height: h, fill: '#374151', rotation: 0,
    });
    items.push({
      id: `struct_${_uid++}`, defLabel: 'Right Wall', kind: 'rect',
      x: w - wallThickness, y: 0, width: wallThickness, height: h, fill: '#374151', rotation: 0,
    });

    items.push({
      id: `struct_${_uid++}`, defLabel: 'Door', kind: 'rect',
      x: w / 2 - 35, y: h - wallThickness, width: 70, height: 12, fill: '#a0522d', rotation: 0,
      details: [{ type: 'line', points: [0, 12, 35, 0], stroke: '#6b3a1f', strokeWidth: 1.5 }],
    });

    if (roomType === 'meeting-room' || roomType === 'executive-suite') {
      items.push({
        id: `struct_${_uid++}`, defLabel: 'Window', kind: 'rect',
        x: w / 2 - 40, y: 0, width: 80, height: 8, fill: '#60a5fa', rotation: 0,
        details: [
          { type: 'line', points: [0, 4, 80, 4], stroke: '#3b82f6', strokeWidth: 1 },
          { type: 'line', points: [40, 0, 40, 8], stroke: '#3b82f6', strokeWidth: 1 },
        ],
      });
    }

    return items;
  };

  const handleComplete = () => {
    onComplete({
      planName,
      roomWidthCm,
      roomDepthCm,
      roomType,
      structureItems: buildStructureItems(),
      boqItems: placedItems,
    });
    onClose();
  };

  const canProceed = () => {
    if (step === 'setup') {
      return planName.trim().length >= 2 && roomWidthCm >= 50 && roomDepthCm >= 50;
    }
    return true;
  };

  const goNext = () => {
    const idx = currentStepIndex;
    if (idx < steps.length - 1) setStep(steps[idx + 1].id);
  };

  const goPrev = () => {
    const idx = currentStepIndex;
    if (idx > 0) setStep(steps[idx - 1].id);
  };

  const totalItems = placedItems.reduce((a, b) => a + b.count, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card rounded-2xl border shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileSignature className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">Blueprint Wizard</h2>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="px-6 py-3 border-b bg-muted/30">
          <div className="flex items-center justify-between relative max-w-md mx-auto">
            <div className="absolute left-0 top-[12px] w-full h-0.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 ease-in-out rounded-full"
                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              />
            </div>
            {steps.map((s, i) => (
              <div key={s.id} className="relative z-10 flex flex-col items-center gap-1 bg-muted/30 px-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] transition-all ${
                  i < currentStepIndex
                    ? 'bg-primary text-primary-foreground'
                    : i === currentStepIndex
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary/20'
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {i < currentStepIndex ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={`text-[9px] font-semibold tracking-wide ${
                  i <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground/60'
                }`}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1 overflow-auto">
          <div className="p-6">
            {step === 'setup' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold mb-1">Define your space</h3>
                  <p className="text-sm text-muted-foreground">Name your plan and set the dimensions.</p>
                </div>
                <div className="grid gap-5 max-w-md">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Plan Name</Label>
                    <Input value={planName} onChange={e => setPlanName(e.target.value)} className="h-9" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Width (cm)</Label>
                      <Input type="number" value={roomWidthCm} onChange={e => setRoomWidthCm(Number(e.target.value))} className="h-9" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Depth (cm)</Label>
                      <Input type="number" value={roomDepthCm} onChange={e => setRoomDepthCm(Number(e.target.value))} className="h-9" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Room Type</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {ROOM_TYPES.map(type => (
                        <div
                          key={type}
                          className={`p-3 rounded-lg border cursor-pointer transition-all text-sm ${
                            roomType === type ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/50'
                          }`}
                          onClick={() => setRoomType(type)}
                        >
                          <span className="font-medium capitalize">{type.replace(/-/g, ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 'series' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-semibold mb-1">Choose Your Series</h3>
                  <p className="text-sm text-muted-foreground">Select a furniture series for your {roomType.replace(/-/g, ' ')}.</p>
                </div>
                {seriesLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {seriesData?.map(series => {
                      const tierIcons: Record<string, typeof Crown> = { economy: Zap, medium: Star, premium: Crown };
                      const tierColors: Record<string, { border: string; bg: string; badge: string }> = {
                        economy: { border: 'border-emerald-500', bg: 'bg-emerald-500/5', badge: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' },
                        medium: { border: 'border-blue-500', bg: 'bg-blue-500/5', badge: 'bg-blue-500/10 text-blue-700 border-blue-500/20' },
                        premium: { border: 'border-amber-500', bg: 'bg-amber-500/5', badge: 'bg-amber-500/10 text-amber-700 border-amber-500/20' },
                      };
                      const TierIcon = tierIcons[series.tier] || Star;
                      const colors = tierColors[series.tier] || tierColors.medium;
                      const isSelected = selectedSeriesId === series.id;

                      return (
                        <div
                          key={series.id}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected ? `${colors.border} ${colors.bg}` : 'border-border hover:border-primary/30'
                          }`}
                          onClick={() => setSelectedSeriesId(isSelected ? null : series.id)}
                        >
                          <Badge className={`${colors.badge} border text-[10px] mb-2`}>
                            <TierIcon className="w-3 h-3 mr-1" />
                            {series.tier.charAt(0).toUpperCase() + series.tier.slice(1)}
                          </Badge>
                          <h4 className="font-semibold text-sm mb-0.5">{series.name}</h4>
                          <p className="text-[11px] text-muted-foreground line-clamp-2">{series.description}</p>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-primary mt-2" />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {categories && categories.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Filter by Category</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {categories.map(cat => (
                        <Badge
                          key={cat.name}
                          variant={selectedCategories.includes(cat.name) ? 'default' : 'outline'}
                          className="cursor-pointer capitalize text-[11px]"
                          onClick={() => handleToggleCategory(cat.name)}
                        >
                          {cat.name.replace(/-/g, ' ')} ({cat.count})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 'quantities' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-semibold mb-1">Set Quantities</h3>
                  <p className="text-sm text-muted-foreground">Choose how many of each item you need.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-auto">
                  {filteredItems?.map(item => {
                    const placed = placedItems.find(p => p.item.id === item.id);
                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-lg border transition-all ${placed ? 'border-primary/30 bg-primary/5' : 'hover:border-border'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{item.name}</p>
                            <p className="text-[10px] text-muted-foreground">{item.widthCm}×{item.depthCm}cm</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleRemoveItem(item.id)} disabled={!placed}>
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-6 text-center text-xs font-mono tabular-nums">{placed?.count || 0}</span>
                            <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleAddItem(item)}>
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 'review' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-semibold mb-1">Review & Confirm</h3>
                  <p className="text-sm text-muted-foreground">Review your blueprint before placing on canvas.</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50 border">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium">Plan Name</p>
                    <p className="text-sm font-semibold mt-1">{planName}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium">Dimensions</p>
                    <p className="text-sm font-semibold mt-1 font-mono">{roomWidthCm / 100}m × {roomDepthCm / 100}m</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium">Room Type</p>
                    <p className="text-sm font-semibold mt-1 capitalize">{roomType.replace(/-/g, ' ')}</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Walls, a door, and {roomType === 'meeting-room' || roomType === 'executive-suite' ? 'a window' : 'no windows'} will be placed as a locked structure layer.
                </div>
                {placedItems.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold mb-2">Bill of Quantities ({totalItems} items)</h4>
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs h-8">Item</TableHead>
                            <TableHead className="text-xs h-8">Category</TableHead>
                            <TableHead className="text-xs h-8 text-right">Qty</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {placedItems.map(({ item, count }) => (
                            <TableRow key={item.id}>
                              <TableCell className="text-xs py-1.5 font-medium">{item.name}</TableCell>
                              <TableCell className="text-xs py-1.5 text-muted-foreground">{item.category}</TableCell>
                              <TableCell className="text-xs py-1.5 text-right font-mono">{count}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between px-6 py-3 border-t bg-muted/20">
          <div>
            {currentStepIndex > 0 && (
              <Button variant="ghost" size="sm" onClick={goPrev} className="gap-1.5">
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            {currentStepIndex < steps.length - 1 ? (
              <Button size="sm" onClick={goNext} disabled={!canProceed()} className="gap-1.5">
                Next <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button size="sm" onClick={handleComplete} className="gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Place on Canvas
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

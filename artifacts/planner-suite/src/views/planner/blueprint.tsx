"use client";

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  useListCategories, 
  useListCatalogItems, 
  useCreatePlan,
  useGetAiAdvice
} from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle2, ChevronRight, FileSignature, Box, Plus, Minus, Loader2, Sparkles, ArrowRight, Download, AlertCircle, RefreshCw, FileSpreadsheet,
  Home
} from 'lucide-react';
import { PlannerBreadcrumb } from '@/components/planner/PlannerBreadcrumb';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Step = 'setup' | 'categories' | 'arrange' | 'review';

interface SetupErrors {
  planName?: string;
  roomWidth?: string;
  roomDepth?: string;
}

function validateSetup(planName: string, roomWidthCm: number, roomDepthCm: number): SetupErrors {
  const errors: SetupErrors = {};
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

export default function BlueprintPlanner() {
  const location = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('setup');

  const [planName, setPlanName] = useState('New Blueprint');
  const [roomWidthCm, setRoomWidthCm] = useState(600);
  const [roomDepthCm, setRoomDepthCm] = useState(400);
  const [roomType, setRoomType] = useState('open-plan');

  const [setupErrors, setSetupErrors] = useState<SetupErrors>({});
  const [setupTouched, setSetupTouched] = useState<Record<string, boolean>>({});

  const { data: categories, isLoading: categoriesLoading, isError: categoriesError, refetch: refetchCategories } = useListCategories();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const { data: catalogItems, isError: catalogError, refetch: refetchCatalog } = useListCatalogItems();
  const [placedItems, setPlacedItems] = useState<Array<{ item: any, count: number }>>([]);
  
  const createPlan = useCreatePlan();
  const getAiAdvice = useGetAiAdvice();
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  const filteredItems = catalogItems?.filter(item => 
    selectedCategories.length === 0 || selectedCategories.includes(item.category)
  );

  useEffect(() => {
    if (Object.keys(setupTouched).length > 0) {
      setSetupErrors(validateSetup(planName, roomWidthCm, roomDepthCm));
    }
  }, [planName, roomWidthCm, roomDepthCm, setupTouched]);

  const handleToggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleAddItem = (item: any) => {
    setPlacedItems(prev => {
      const existing = prev.find(p => p.item.id === item.id);
      if (existing) {
        return prev.map(p => p.item.id === item.id ? { ...p, count: p.count + 1 } : p);
      }
      return [...prev, { item, count: 1 }];
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setPlacedItems(prev => {
      const existing = prev.find(p => p.item.id === itemId);
      if (existing && existing.count > 1) {
        return prev.map(p => p.item.id === itemId ? { ...p, count: p.count - 1 } : p);
      }
      return prev.filter(p => p.item.id !== itemId);
    });
  };

  const handleGetAdvice = () => {
    getAiAdvice.mutate({
      data: {
        roomWidthCm,
        roomDepthCm,
        categories: selectedCategories,
        query: `Suggest an arrangement for a ${roomType} office.`
      }
    }, {
      onSuccess: (data) => setAiAdvice(data.advice)
    });
  };

  const handleContinueFromSetup = () => {
    setSetupTouched({ planName: true, roomWidth: true, roomDepth: true });
    const errors = validateSetup(planName, roomWidthCm, roomDepthCm);
    setSetupErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast({
        variant: "destructive",
        title: "Validation error",
        description: "Please fix the errors before continuing.",
      });
      return;
    }
    setStep('categories');
  };

  const escHtml = (str: string | number) => {
    const s = String(str);
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  const handleExportPdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({ variant: 'destructive', title: 'Pop-up blocked', description: 'Please allow pop-ups to export PDF.' });
      return;
    }
    const totalItems = placedItems.reduce((a, b) => a + b.count, 0);
    const areaSqM = (roomWidthCm * roomDepthCm) / 10000;
    const rows = placedItems.map(({ item, count }) =>
      `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:500">${escHtml(item.name)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${escHtml(item.category)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-family:monospace;font-size:12px">${escHtml(item.widthCm)}×${escHtml(item.depthCm)}×${escHtml(item.heightCm)} cm</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-family:monospace;font-weight:600">${escHtml(count)}</td>
      </tr>`
    ).join('');

    printWindow.document.write(`<!DOCTYPE html><html><head><title>${escHtml(planName)} - BOQ</title>
      <style>
        body{font-family:system-ui,-apple-system,sans-serif;margin:40px;color:#1a1a1a}
        h1{font-size:24px;margin-bottom:4px}
        .subtitle{color:#6b7280;margin-bottom:24px;font-size:14px}
        .stats{display:flex;gap:16px;margin-bottom:32px}
        .stat{flex:1;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px}
        .stat-label{font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;font-weight:600;margin-bottom:4px}
        .stat-value{font-size:18px;font-weight:700}
        table{width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px}
        th{background:#f3f4f6;text-align:left;padding:10px 12px;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;font-weight:600;border-bottom:2px solid #e5e7eb}
        th:last-child{text-align:right}
        .footer{margin-top:32px;font-size:11px;color:#9ca3af;text-align:center}
        @media print{body{margin:20px}@page{margin:15mm}}
      </style>
    </head><body>
      <h1>${escHtml(planName)}</h1>
      <div class="subtitle">Bill of Quantities Report</div>
      <div class="stats">
        <div class="stat"><div class="stat-label">Room Type</div><div class="stat-value" style="text-transform:capitalize">${escHtml(roomType.replace('-', ' '))}</div></div>
        <div class="stat"><div class="stat-label">Dimensions</div><div class="stat-value" style="font-family:monospace">${escHtml(roomWidthCm / 100)}m × ${escHtml(roomDepthCm / 100)}m</div></div>
        <div class="stat"><div class="stat-label">Area</div><div class="stat-value">${areaSqM} m²</div></div>
        <div class="stat"><div class="stat-label">Total Items</div><div class="stat-value">${totalItems} units</div></div>
      </div>
      <table><thead><tr><th>Item</th><th>Category</th><th>Dimensions</th><th>Quantity</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="4" style="text-align:center;padding:24px;color:#9ca3af">No items in Bill of Quantities</td></tr>'}</tbody>
      </table>
      <div class="footer">Generated by One&Only • ${new Date().toLocaleDateString()}</div>
    </body></html>`);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 300);
    toast({ title: 'PDF export ready', description: 'Use the print dialog to save as PDF.' });
  };

  const handleSave = (redirectToQuote = false) => {
    const documentData = {
      roomType,
      selectedCategories,
      boq: placedItems.map(p => ({ itemId: p.item.id, count: p.count }))
    };

    createPlan.mutate({
      data: {
        name: planName,
        plannerType: 'blueprint',
        roomWidthCm,
        roomDepthCm,
        documentJson: JSON.stringify(documentData)
      }
    }, {
      onSuccess: (data) => {
        if (redirectToQuote) {
          toast({ title: "Blueprint saved — opening quote builder" });
          router.push(`/plans/${data.id}/quote`);
        } else {
          toast({ title: "Blueprint saved successfully" });
          router.push('/plans');
        }
      }
    });
  };

  const steps = [
    { id: 'setup', title: 'Room Setup' },
    { id: 'categories', title: 'Categories' },
    { id: 'arrange', title: 'Quantities' },
    { id: 'review', title: 'Review & BOQ' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] max-h-screen bg-muted/20">
      <PlannerBreadcrumb
        items={[
          { label: 'Plans', href: '/plans' },
          { label: 'Blueprint Wizard' },
        ]}
        icon={<FileSignature className="w-3.5 h-3.5 text-primary" />}
      />

      <div className="bg-card/95 backdrop-blur-sm border-b px-6 sm:px-8 py-3 shrink-0 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-[14px] w-full h-0.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-in-out rounded-full"
                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              />
            </div>
            {steps.map((s, i) => (
              <div key={s.id} className="relative z-10 flex flex-col items-center gap-1.5 bg-card/95 px-2.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  i < currentStepIndex 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : i === currentStepIndex 
                      ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20' 
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {i < currentStepIndex ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-[10px] font-semibold tracking-wide hidden sm:block ${
                  i <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground/60'
                }`}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto bg-card rounded-xl border shadow-sm min-h-[500px] flex flex-col animate-in slide-in-from-bottom-4 duration-500">
          
          {step === 'setup' && (
            <div className="p-8 space-y-8 flex-1">
              <div>
                <h2 className="text-xl font-semibold">Define your space</h2>
                <p className="text-muted-foreground">Start by naming your plan and setting the basic dimensions.</p>
              </div>

              <div className="grid gap-6 max-w-xl">
                <div className="space-y-2">
                  <Label>Plan Name</Label>
                  <Input
                    value={planName}
                    onChange={e => { setPlanName(e.target.value); setSetupTouched(t => ({ ...t, planName: true })); }}
                    className={`text-lg ${setupTouched.planName && setupErrors.planName ? 'border-destructive' : ''}`}
                  />
                  {setupTouched.planName && setupErrors.planName && (
                    <p className="text-xs text-destructive">{setupErrors.planName}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Width (cm)</Label>
                    <Input
                      type="number"
                      value={roomWidthCm}
                      onChange={e => { setRoomWidthCm(Number(e.target.value)); setSetupTouched(t => ({ ...t, roomWidth: true })); }}
                      className={setupTouched.roomWidth && setupErrors.roomWidth ? 'border-destructive' : ''}
                    />
                    {setupTouched.roomWidth && setupErrors.roomWidth && (
                      <p className="text-xs text-destructive">{setupErrors.roomWidth}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Depth (cm)</Label>
                    <Input
                      type="number"
                      value={roomDepthCm}
                      onChange={e => { setRoomDepthCm(Number(e.target.value)); setSetupTouched(t => ({ ...t, roomDepth: true })); }}
                      className={setupTouched.roomDepth && setupErrors.roomDepth ? 'border-destructive' : ''}
                    />
                    {setupTouched.roomDepth && setupErrors.roomDepth && (
                      <p className="text-xs text-destructive">{setupErrors.roomDepth}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Room Type</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {['open-plan', 'meeting-room', 'executive-suite', 'breakout'].map(type => (
                      <div 
                        key={type}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${roomType === type ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/50'}`}
                        onClick={() => setRoomType(type)}
                      >
                        <div className="font-medium capitalize">{type.replace('-', ' ')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'categories' && (
            <div className="p-8 space-y-8 flex-1 flex flex-col">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">Select required categories</h2>
                  <p className="text-muted-foreground">What type of furniture do you need for this {roomType.replace('-',' ')}?</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleGetAdvice} disabled={getAiAdvice.isPending}>
                  {getAiAdvice.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2 text-primary" />}
                  AI Suggestion
                </Button>
              </div>

              {aiAdvice && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm text-primary-foreground/80 text-foreground">
                  <span className="font-semibold text-primary block mb-1">AI Suggestion:</span>
                  {aiAdvice}
                </div>
              )}

              {categoriesError ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                  <AlertCircle className="w-8 h-8 text-destructive opacity-60" />
                  <p className="text-sm text-muted-foreground">Failed to load categories.</p>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => refetchCategories()}>
                    <RefreshCw className="w-4 h-4" /> Retry
                  </Button>
                </div>
              ) : categoriesLoading ? (
                <div className="flex-1 flex justify-center items-center"><Loader2 className="animate-spin text-primary" /></div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {categories?.map(cat => (
                    <div 
                      key={cat.name}
                      className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${selectedCategories.includes(cat.name) ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                      onClick={() => handleToggleCategory(cat.name)}
                    >
                      <Checkbox checked={selectedCategories.includes(cat.name)} />
                      <div className="flex-1">
                        <Label className="cursor-pointer">{cat.name}</Label>
                        <div className="text-xs text-muted-foreground">{cat.count} items available</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 'arrange' && (
            <div className="p-0 flex-1 flex flex-col sm:flex-row h-[500px]">
              <div className="w-full sm:w-1/2 border-r flex flex-col bg-muted/10">
                <div className="p-3 border-b bg-card/95">
                  <h2 className="text-sm font-semibold">Available Catalog</h2>
                  <p className="text-[11px] text-muted-foreground">Filtered by selected categories</p>
                </div>
                <ScrollArea className="flex-1 p-4">
                  {catalogError ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                      <AlertCircle className="w-6 h-6 text-destructive opacity-60" />
                      <p className="text-sm text-muted-foreground">Failed to load catalog.</p>
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => refetchCatalog()}>
                        <RefreshCw className="w-4 h-4" /> Retry
                      </Button>
                    </div>
                  ) : (
                  <div className="space-y-3">
                    {filteredItems && filteredItems.length > 0 ? (
                      filteredItems.map(item => (
                        <Card key={item.id} className="p-3 flex items-center justify-between hover:border-primary/50 transition-colors">
                          <div>
                            <div className="font-medium text-sm">{item.name}</div>
                            <div className="text-xs text-muted-foreground">{item.category} • {item.widthCm}×{item.depthCm} cm</div>
                          </div>
                          <Button size="sm" variant="secondary" onClick={() => handleAddItem(item)}>
                            Add
                          </Button>
                        </Card>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground">
                        <Box className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-sm">No items match the selected categories.</p>
                        <p className="text-xs mt-1">Go back and select categories first.</p>
                      </div>
                    )}
                  </div>
                  )}
                </ScrollArea>
              </div>

              <div className="w-full sm:w-1/2 flex flex-col">
                <div className="p-3 border-b bg-card/95 flex justify-between items-center">
                  <div>
                    <h2 className="text-sm font-semibold">Bill of Quantities</h2>
                    <p className="text-[11px] text-muted-foreground">{placedItems.reduce((a,b)=>a+b.count,0)} total items</p>
                  </div>
                </div>
                <ScrollArea className="flex-1 p-4">
                  {placedItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                      <Box className="w-12 h-12 mb-2 opacity-20" />
                      <p className="text-sm font-medium">No items added yet</p>
                      <p className="text-xs mt-1">Select items from the catalog on the left.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {placedItems.map(({ item, count }) => (
                        <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                          <div>
                            <div className="font-medium text-sm">{item.name}</div>
                            <div className="text-xs text-muted-foreground font-mono">{item.widthCm}×{item.depthCm} cm</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button size="icon" variant="outline" className="w-8 h-8" onClick={() => handleRemoveItem(item.id)}>
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="font-mono font-medium w-4 text-center">{count}</span>
                            <Button size="icon" variant="outline" className="w-8 h-8" onClick={() => handleAddItem(item)}>
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="p-8 flex-1 flex flex-col">
              <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-primary">Plan Summary</h2>
                <p className="text-muted-foreground">Review your blueprint details before saving.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <Card className="border-border/50 bg-muted/20">
                  <CardContent className="p-4 space-y-1">
                    <span className="text-[10px] text-muted-foreground/70 uppercase font-bold tracking-[0.08em]">Plan Details</span>
                    <div className="font-semibold text-base">{planName}</div>
                    <div className="text-xs text-muted-foreground capitalize">{roomType.replace('-',' ')}</div>
                  </CardContent>
                </Card>
                <Card className="border-border/50 bg-muted/20">
                  <CardContent className="p-4 space-y-1">
                    <span className="text-[10px] text-muted-foreground/70 uppercase font-bold tracking-[0.08em]">Dimensions</span>
                    <div className="font-semibold text-base font-mono tabular-nums">{roomWidthCm / 100}m × {roomDepthCm / 100}m</div>
                    <div className="text-xs text-muted-foreground">{(roomWidthCm * roomDepthCm) / 10000} sq.m total</div>
                  </CardContent>
                </Card>
                <Card className="border-border/50 bg-muted/20">
                  <CardContent className="p-4 space-y-1">
                    <span className="text-[10px] text-muted-foreground/70 uppercase font-bold tracking-[0.08em]">Total Items</span>
                    <div className="font-semibold text-base">{placedItems.reduce((a,b)=>a+b.count,0)} units</div>
                    <div className="text-xs text-muted-foreground">{placedItems.length} unique types</div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex-1 border rounded-lg overflow-hidden bg-card">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Dimensions</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {placedItems.map(({ item, count }) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-normal">{item.category}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {item.widthCm}×{item.depthCm}×{item.heightCm}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">{count}</TableCell>
                      </TableRow>
                    ))}
                    {placedItems.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No items in Bill of Quantities. Go back and add some items.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <div className="p-4 sm:p-6 border-t bg-muted/5 shrink-0 flex justify-between items-center rounded-b-xl">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => {
                if (step === 'categories') setStep('setup');
                if (step === 'arrange') setStep('categories');
                if (step === 'review') setStep('arrange');
              }}
              disabled={step === 'setup'}
            >
              Back
            </Button>
            
            {step === 'setup' && <Button size="sm" onClick={handleContinueFromSetup}>Continue <ChevronRight className="w-3.5 h-3.5 ml-1" /></Button>}
            {step === 'categories' && <Button size="sm" onClick={() => setStep('arrange')}>Continue <ChevronRight className="w-3.5 h-3.5 ml-1" /></Button>}
            {step === 'arrange' && <Button size="sm" onClick={() => setStep('review')}>Review BOQ <ChevronRight className="w-3.5 h-3.5 ml-1" /></Button>}
            {step === 'review' && (
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <Button variant="outline" size="sm" onClick={handleExportPdf} className="gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">PDF</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleSave(true)} disabled={createPlan.isPending} className="gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Save & Quote</span>
                </Button>
                <Button size="sm" onClick={() => handleSave(false)} disabled={createPlan.isPending}>
                  {createPlan.isPending ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : null}
                  Save Blueprint
                </Button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

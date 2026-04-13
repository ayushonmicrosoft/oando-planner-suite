"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  File, FilePlus, FileSignature, FolderOpen, ImagePlus,
  Clock, Search, ChevronRight, X, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useListPlans } from '@workspace/api-client-react';

interface FileMenuProps {
  onNewBlankCanvas: () => void;
  onNewFromBlueprint: () => void;
  onImport: () => void;
  onOpenPlan: (planId: number) => void;
  currentPlanId: number | null;
  currentPlanName: string;
}

const plannerTypeLabels: Record<string, string> = {
  canvas: '2D Canvas',
  blueprint: 'Blueprint',
  cad: 'CAD Drawing',
  floorplan: 'Floor Plan',
  shapes: 'Custom Shapes',
  import: 'Import & Scale',
  'oando-site-plan': 'Site Plan',
};

export function FileMenu({
  onNewBlankCanvas,
  onNewFromBlueprint,
  onImport,
  onOpenPlan,
  currentPlanId,
  currentPlanName,
}: FileMenuProps) {
  const [open, setOpen] = useState(false);
  const [showOpenPanel, setShowOpenPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: plans, isLoading: plansLoading } = useListPlans();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowOpenPanel(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        setShowOpenPanel(false);
      }
    }
    if (open) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const recentPlans = (plans || [])
    .sort((a: any, b: any) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 5);

  const canvasCompatibleTypes = ['canvas', 'blueprint', 'floorplan', 'shapes'];

  const filteredPlans = (plans || []).filter((plan: any) => {
    const matchesSearch = !searchQuery || plan.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const canvasPlans = filteredPlans.filter((plan: any) =>
    canvasCompatibleTypes.includes(plan.plannerType)
  );

  const otherPlans = filteredPlans.filter((plan: any) =>
    !canvasCompatibleTypes.includes(plan.plannerType)
  );

  const handleAction = (action: () => void) => {
    action();
    setOpen(false);
    setShowOpenPanel(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant={open ? 'secondary' : 'ghost'}
        size="sm"
        className="h-7 gap-1.5 text-[11px] font-medium"
        onClick={() => { setOpen(!open); setShowOpenPanel(false); }}
      >
        <File className="w-3 h-3" />
        File
      </Button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 flex gap-0">
          <div className="w-56 bg-popover border rounded-lg shadow-xl animate-in fade-in slide-in-from-top-1 duration-150">
            {currentPlanId && (
              <div className="px-3 py-2 border-b bg-muted/30">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium">Current Plan</p>
                <p className="text-xs font-medium truncate mt-0.5">{currentPlanName}</p>
                <p className="text-[10px] text-muted-foreground/40">#{currentPlanId}</p>
              </div>
            )}

            <div className="py-1">
              <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-muted-foreground/50 font-semibold">New</p>
              <button
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm hover:bg-accent transition-colors text-left"
                onClick={() => handleAction(onNewBlankCanvas)}
              >
                <FilePlus className="w-3.5 h-3.5 text-muted-foreground/60" />
                Blank Canvas
              </button>
              <button
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm hover:bg-accent transition-colors text-left"
                onClick={() => handleAction(onNewFromBlueprint)}
              >
                <FileSignature className="w-3.5 h-3.5 text-muted-foreground/60" />
                From Blueprint
              </button>
              <button
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm hover:bg-accent transition-colors text-left"
                onClick={() => handleAction(onImport)}
              >
                <ImagePlus className="w-3.5 h-3.5 text-muted-foreground/60" />
                Import Image/PDF
              </button>
            </div>

            <div className="border-t py-1">
              <button
                className="w-full flex items-center justify-between px-3 py-1.5 text-sm hover:bg-accent transition-colors text-left"
                onClick={() => setShowOpenPanel(!showOpenPanel)}
              >
                <span className="flex items-center gap-2.5">
                  <FolderOpen className="w-3.5 h-3.5 text-muted-foreground/60" />
                  Open Plan
                </span>
                <ChevronRight className={`w-3 h-3 text-muted-foreground/40 transition-transform ${showOpenPanel ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {recentPlans.length > 0 && !showOpenPanel && (
              <div className="border-t py-1">
                <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-muted-foreground/50 font-semibold flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  Recent
                </p>
                {recentPlans.map((plan: any) => (
                  <button
                    key={plan.id}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-sm hover:bg-accent transition-colors text-left group"
                    onClick={() => handleAction(() => onOpenPlan(plan.id))}
                  >
                    <span className="truncate flex-1 min-w-0">{plan.name}</span>
                    <Badge variant="outline" className="text-[9px] font-mono shrink-0 ml-2 opacity-50 group-hover:opacity-100">
                      #{plan.id}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>

          {showOpenPanel && (
            <div className="w-72 bg-popover border rounded-lg shadow-xl ml-1 animate-in fade-in slide-in-from-left-1 duration-150">
              <div className="p-3 border-b">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold">Open Plan</h3>
                  <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setShowOpenPanel(false)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
                  <Input
                    placeholder="Search plans..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 text-xs pl-8"
                    autoFocus
                  />
                </div>
              </div>
              <ScrollArea className="h-64">
                <div className="p-1.5">
                  {plansLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground/40" />
                    </div>
                  ) : canvasPlans.length === 0 && otherPlans.length === 0 ? (
                    <div className="text-center py-8 text-xs text-muted-foreground/40">
                      {searchQuery ? 'No matching plans' : 'No saved plans'}
                    </div>
                  ) : (
                    <>
                      {canvasPlans.map((plan: any) => {
                        const updatedAt = plan.updatedAt
                          ? new Date(plan.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : '';
                        return (
                          <button
                            key={plan.id}
                            className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-left hover:bg-accent transition-colors ${
                              plan.id === currentPlanId ? 'bg-primary/5 border border-primary/20' : ''
                            }`}
                            onClick={() => handleAction(() => onOpenPlan(plan.id))}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{plan.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-muted-foreground/40">
                                  {plannerTypeLabels[plan.plannerType] || plan.plannerType}
                                </span>
                                {updatedAt && (
                                  <>
                                    <span className="w-0.5 h-0.5 rounded-full bg-muted-foreground/20" />
                                    <span className="text-[10px] text-muted-foreground/40">{updatedAt}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            {plan.id === currentPlanId && (
                              <Badge className="text-[9px] shrink-0">Current</Badge>
                            )}
                          </button>
                        );
                      })}
                      {otherPlans.length > 0 && (
                        <>
                          <div className="px-2.5 pt-3 pb-1">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/40 font-semibold">Other Tools</p>
                          </div>
                          {otherPlans.map((plan: any) => {
                            const typeRoutes: Record<string, string> = {
                              cad: '/tools/cad',
                              import: '/tools/import',
                              'oando-site-plan': '/tools/site-plan',
                            };
                            const route = typeRoutes[plan.plannerType] || '/planner/canvas';
                            return (
                              <a
                                key={plan.id}
                                href={`${route}?id=${plan.id}`}
                                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-left hover:bg-accent transition-colors text-muted-foreground/60"
                                onClick={() => { setOpen(false); setShowOpenPanel(false); }}
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{plan.name}</p>
                                  <span className="text-[10px] text-muted-foreground/40">
                                    {plannerTypeLabels[plan.plannerType] || plan.plannerType}
                                  </span>
                                </div>
                              </a>
                            );
                          })}
                        </>
                      )}
                    </>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

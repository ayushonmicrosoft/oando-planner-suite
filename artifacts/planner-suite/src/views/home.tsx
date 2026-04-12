"use client";

import { useState } from 'react';
import {
  useListPlans,
  useGetPlanStats,
  getListPlansQueryKey,
  useCreatePlan
} from '@workspace/api-client-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Grid3X3, FileSignature, Box, Plus, Clock, Loader2, ArrowRight, Pencil, LayoutGrid, Shapes, ImagePlus, LayoutTemplate, AlertCircle, RefreshCw, Map } from 'lucide-react';
import { format } from 'date-fns';
import { PlanThumbnail } from '@/components/plan-thumbnail';
import { DashboardStatsSkeleton, RecentPlansSkeleton } from '@/components/skeletons';

const plannerTypeRoutes: Record<string, string> = {
  canvas: '/planner/canvas',
  blueprint: '/planner/blueprint',
  cad: '/tools/cad',
  floorplan: '/tools/floor-plan',
  shapes: '/tools/shapes',
  import: '/tools/import',
  'oando-site-plan': '/tools/site-plan',
};

const plannerTypeLabels: Record<string, string> = {
  canvas: '2D Canvas',
  blueprint: 'Blueprint',
  cad: 'CAD Drawing',
  floorplan: 'Floor Plan',
  shapes: 'Custom Shapes',
  import: 'Import & Scale',
  'oando-site-plan': 'Site Plan',
};

function parsePlanItems(plan: { documentJson?: string }) {
  try {
    if (!('documentJson' in plan) || !plan.documentJson) return [];
    const doc = JSON.parse(plan.documentJson as string);
    return Array.isArray(doc?.items) ? doc.items : [];
  } catch {
    return [];
  }
}

export default function Home() {
  const router = useRouter();
  const { data: stats, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = useGetPlanStats();
  const { data: plans, isLoading: plansLoading, isError: plansError, refetch: refetchPlans } = useListPlans();

  const recentPlans = plans?.slice(0, 4) || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">One&Only</h1>
        <p className="text-muted-foreground mt-2 text-lg">Work. Space. Performance.</p>
      </div>

      {statsLoading ? (
        <DashboardStatsSkeleton />
      ) : statsError ? (
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <span className="text-sm font-medium">Failed to load statistics.</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetchStats()} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-total-plans">
                {stats?.totalPlans || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Canvas Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-canvas-plans">
                {stats?.canvas2dPlans || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Blueprint Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-blueprint-plans">
                {stats?.blueprintPlans || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Last Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium truncate" data-testid="text-recent-plan">
                {stats?.recentPlan || 'No activity'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <LayoutTemplate className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Start from Template</h3>
                <p className="text-sm text-muted-foreground">Pick a pre-made office layout and customize it</p>
              </div>
            </div>
            <Button className="gap-2 shrink-0" onClick={() => router.push('/templates')}>
              Browse Templates <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500/5 to-emerald-500/10 border-green-500/20">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Grid3X3 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Site Plan Designer</h3>
                <p className="text-sm text-muted-foreground">Create outdoor site plans with buildings, roads, and landscaping</p>
              </div>
            </div>
            <Button variant="outline" className="gap-2 shrink-0" onClick={() => router.push('/tools/site-plan')}>
              Open Site Plan <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Planning Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-primary/20 hover:border-primary/50 transition-colors shadow-sm">
            <CardHeader>
              <Grid3X3 className="w-10 h-10 text-primary mb-2" />
              <CardTitle>2D Canvas Planner</CardTitle>
              <CardDescription>Konva-powered interactive floor plan with transform handles.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4" /> Resize & rotate handles</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4" /> Undo/Redo & keyboard shortcuts</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4" /> AI-powered layout advisor</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => router.push('/planner/canvas')} data-testid="button-start-canvas">
                Start Empty Canvas
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-primary/20 hover:border-primary/50 transition-colors shadow-sm">
            <CardHeader>
              <FileSignature className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Blueprint Wizard</CardTitle>
              <CardDescription>Step-by-step guided room setup and arrangement.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4" /> Structured workflow</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4" /> Bill of quantities</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4" /> Category-based selection</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="secondary" onClick={() => router.push('/planner/blueprint')} data-testid="button-start-blueprint">
                Start Blueprint Wizard
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-sidebar">
            <CardHeader>
              <Box className="w-10 h-10 text-primary mb-2" />
              <CardTitle>3D Viewer</CardTitle>
              <CardDescription>Visualize your latest plan in interactive 3D.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4" /> First-person walkthrough</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4" /> Orbit mode</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4" /> Real-time rendering</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/viewer/3d" className="w-full">
                <Button className="w-full" variant="outline" data-testid="button-view-3d">
                  Open 3D Viewer
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Drawing Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="hover:border-primary/50 transition-colors shadow-sm">
            <CardHeader className="pb-3">
              <Pencil className="w-8 h-8 text-blue-500 mb-1" />
              <CardTitle className="text-base">CAD Drawing</CardTitle>
              <CardDescription className="text-xs">Vector drawing with lines, rectangles, ellipses, text, and measurement tools.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-center gap-1.5"><ArrowRight className="w-3 h-3" /> 6 drawing tools (V/L/R/C/T/M)</li>
                <li className="flex items-center gap-1.5"><ArrowRight className="w-3 h-3" /> Color & stroke controls</li>
                <li className="flex items-center gap-1.5"><ArrowRight className="w-3 h-3" /> Measurement with cm display</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="sm" onClick={() => router.push('/tools/cad')} data-testid="button-start-cad">
                Start
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:border-primary/50 transition-colors shadow-sm">
            <CardHeader className="pb-3">
              <LayoutGrid className="w-8 h-8 text-emerald-500 mb-1" />
              <CardTitle className="text-base">Floor Plan Creator</CardTitle>
              <CardDescription className="text-xs">Room-based layout builder with presets, dimensions, and area calculations.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-center gap-1.5"><ArrowRight className="w-3 h-3" /> 12 room type presets</li>
                <li className="flex items-center gap-1.5"><ArrowRight className="w-3 h-3" /> Auto sq ft calculation</li>
                <li className="flex items-center gap-1.5"><ArrowRight className="w-3 h-3" /> Color & property editing</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="sm" onClick={() => router.push('/tools/floor-plan')} data-testid="button-start-floor-plan">
                Start
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:border-primary/50 transition-colors shadow-sm">
            <CardHeader className="pb-3">
              <Shapes className="w-8 h-8 text-purple-500 mb-1" />
              <CardTitle className="text-base">Custom Shapes</CardTitle>
              <CardDescription className="text-xs">5 categorized shape libraries for walls, furniture, electrical, and safety.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-center gap-1.5"><ArrowRight className="w-3 h-3" /> 25+ built-in shapes</li>
                <li className="flex items-center gap-1.5"><ArrowRight className="w-3 h-3" /> Drag, resize, rotate</li>
                <li className="flex items-center gap-1.5"><ArrowRight className="w-3 h-3" /> Categorized library sidebar</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="sm" onClick={() => router.push('/tools/shapes')} data-testid="button-start-shapes">
                Start
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:border-primary/50 transition-colors shadow-sm">
            <CardHeader className="pb-3">
              <Map className="w-8 h-8 text-green-600 mb-1" />
              <CardTitle className="text-base">Site Plan</CardTitle>
              <CardDescription className="text-xs">Design outdoor site plans with buildings, roads, landscaping, and utilities.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-center gap-1.5"><ArrowRight className="w-3 h-3" /> 17 site elements</li>
                <li className="flex items-center gap-1.5"><ArrowRight className="w-3 h-3" /> Snap-to-grid layout</li>
                <li className="flex items-center gap-1.5"><ArrowRight className="w-3 h-3" /> Auto-save & recovery</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="sm" onClick={() => router.push('/tools/site-plan')} data-testid="button-start-site-plan">
                Start
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:border-primary/50 transition-colors shadow-sm">
            <CardHeader className="pb-3">
              <ImagePlus className="w-8 h-8 text-orange-500 mb-1" />
              <CardTitle className="text-base">Import & Scale</CardTitle>
              <CardDescription className="text-xs">Upload images, calibrate scale, and annotate over imported blueprints.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-center gap-1.5"><ArrowRight className="w-3 h-3" /> PNG/JPG image import</li>
                <li className="flex items-center gap-1.5"><ArrowRight className="w-3 h-3" /> Scale calibration tool</li>
                <li className="flex items-center gap-1.5"><ArrowRight className="w-3 h-3" /> Line & rect annotations</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="sm" onClick={() => router.push('/tools/import')} data-testid="button-start-import">
                Start
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Recent Plans</h2>
          <Link href="/plans">
            <Button variant="ghost" className="gap-2">View All <ArrowRight className="w-4 h-4" /></Button>
          </Link>
        </div>

        {plansLoading ? (
          <RecentPlansSkeleton />
        ) : plansError ? (
          <Card className="bg-destructive/5 border-destructive/20">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <span className="text-sm font-medium">Failed to load recent plans.</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetchPlans()} className="gap-2">
                <RefreshCw className="w-4 h-4" /> Retry
              </Button>
            </CardContent>
          </Card>
        ) : recentPlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentPlans.map((plan) => {
              const planItems = parsePlanItems(plan as { documentJson?: string });
              return (
                <Card key={plan.id} className="hover:bg-muted/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{plan.name}</CardTitle>
                      <div className="text-xs text-muted-foreground font-mono">#{plan.id}</div>
                    </div>
                    <CardDescription>
                      {plannerTypeLabels[plan.plannerType] || plan.plannerType}
                    </CardDescription>
                  </CardHeader>
                  {planItems.length > 0 && (
                    <CardContent className="pb-2">
                      <PlanThumbnail
                        roomWidthCm={plan.roomWidthCm}
                        roomDepthCm={plan.roomDepthCm}
                        items={planItems}
                        width={280}
                        height={160}
                        className="w-full rounded border bg-white"
                      />
                    </CardContent>
                  )}
                  <CardContent className="pb-2 text-sm text-muted-foreground flex justify-between">
                    <div className="flex items-center gap-1">
                      <Box className="w-4 h-4" /> {plan.itemCount} items
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {format(new Date(plan.updatedAt), 'MMM d')}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="secondary" className="w-full" onClick={() => router.push(`${plannerTypeRoutes[plan.plannerType] || '/planner/canvas'}?id=${plan.id}`)} data-testid={`button-open-plan-${plan.id}`}>
                      Open Plan
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
              <Box className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-lg font-medium">No plans created yet</p>
              <p className="text-sm mt-1">Start designing your first workspace layout.</p>
              <div className="flex gap-4 mt-4">
                <Button size="sm" onClick={() => router.push('/planner/canvas')}>Start Canvas</Button>
                <Button size="sm" variant="secondary" onClick={() => router.push('/planner/blueprint')}>Start Blueprint</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

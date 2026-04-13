"use client";

import { useState, useEffect } from 'react';
import {
  useListPlans,
  useGetPlanStats,
  useListProjects,
} from '@workspace/api-client-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Grid3X3, FileSignature, Box, Clock, ArrowRight, LayoutGrid, Shapes, ImagePlus, LayoutTemplate, AlertCircle, RefreshCw, Map, FileText, Users, Layers, TrendingUp, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { PlanThumbnail } from '@/components/plan-thumbnail';
import { DashboardStatsSkeleton, RecentPlansSkeleton } from '@/components/skeletons';
import { useAuth } from '@/hooks/use-auth';

function useHydrationSafeDate() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); }, []);
  return now;
}

const plannerTypeRoutes: Record<string, string> = {
  blueprint: '/planner/canvas',
  cad: '/tools/cad',
  floorplan: '/planner/canvas',
  shapes: '/planner/canvas',
  import: '/tools/import',
  'oando-site-plan': '/tools/site-plan',
};

const plannerTypeLabels: Record<string, string> = {
  canvas: '2D Canvas',
  blueprint: 'Blueprint',
  cad: '2D Canvas',
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

function getGreeting(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const now = useHydrationSafeDate();
  const { data: stats, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = useGetPlanStats();
  const { data: plans, isLoading: plansLoading, isError: plansError, refetch: refetchPlans } = useListPlans();
  const { data: projects } = useListProjects();
  const recentProjects = projects?.slice(0, 4) || [];
  const recentPlans = plans?.slice(0, 4) || [];

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'there';
  const firstName = displayName.split(' ')[0];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-dark-midnight-blue-500)] via-[var(--color-dark-midnight-blue-600)] to-[var(--color-dark-midnight-blue-800)] p-8 lg:p-10 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-ocean-boat-blue-500)_0%,_transparent_60%)] opacity-20" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-white/50 text-sm font-medium mb-2">
            <Calendar className="w-3.5 h-3.5" />
            {now ? format(now, 'EEEE, MMMM d, yyyy') : '\u00A0'}
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
            {now ? `${getGreeting(now)}, ${firstName}` : `Welcome, ${firstName}`}
          </h1>
          <p className="text-white/60 mt-2 text-base lg:text-lg max-w-xl">
            Your workspace planning command center. Design, manage, and visualize office layouts with precision.
          </p>
        </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="relative overflow-hidden border-[var(--color-ocean-boat-blue-100)] bg-gradient-to-br from-[var(--color-ocean-boat-blue-50)] to-white transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-1 pt-5 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold text-[var(--color-ocean-boat-blue-600)] uppercase tracking-wider">Total Plans</CardTitle>
                <div className="w-8 h-8 rounded-lg bg-[var(--color-ocean-boat-blue-500)]/10 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-[var(--color-ocean-boat-blue-600)]" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="text-3xl font-bold tracking-tight text-[var(--text-heading)]" data-testid="text-total-plans">
                {stats?.totalPlans || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Across all workspaces</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-[var(--color-sustain-300)]/30 bg-gradient-to-br from-[var(--color-sustain-300)]/5 to-white transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-1 pt-5 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold text-[var(--color-sustain-400)] uppercase tracking-wider">Canvas Plans</CardTitle>
                <div className="w-8 h-8 rounded-lg bg-[var(--color-sustain-300)]/15 flex items-center justify-center">
                  <Grid3X3 className="w-4 h-4 text-[var(--color-sustain-400)]" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="text-3xl font-bold tracking-tight text-[var(--text-heading)]" data-testid="text-canvas-plans">
                {stats?.canvas2dPlans || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Interactive layouts</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-[var(--color-bronze-300)]/30 bg-gradient-to-br from-[var(--color-bronze-300)]/8 to-white transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-1 pt-5 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold text-[var(--color-bronze-500)] uppercase tracking-wider">Blueprint Plans</CardTitle>
                <div className="w-8 h-8 rounded-lg bg-[var(--color-bronze-400)]/10 flex items-center justify-center">
                  <FileSignature className="w-4 h-4 text-[var(--color-bronze-500)]" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="text-3xl font-bold tracking-tight text-[var(--text-heading)]" data-testid="text-blueprint-plans">
                {stats?.blueprintPlans || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Guided workflows</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-[var(--color-dark-midnight-blue-100)] bg-gradient-to-br from-[var(--color-dark-midnight-blue-50)]/50 to-white transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-1 pt-5 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold text-[var(--color-dark-midnight-blue-400)] uppercase tracking-wider">Last Activity</CardTitle>
                <div className="w-8 h-8 rounded-lg bg-[var(--color-dark-midnight-blue-300)]/15 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-[var(--color-dark-midnight-blue-400)]" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="text-lg font-semibold truncate text-[var(--text-heading)]" data-testid="text-recent-plan">
                {stats?.recentPlan || 'No activity'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Most recent update</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="group relative overflow-hidden border-primary/15 bg-gradient-to-br from-primary/4 via-primary/2 to-transparent transition-all duration-300 hover:shadow-lg hover:border-primary/25">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 px-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <LayoutTemplate className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-[var(--text-heading)]">Start from Template</h3>
                <p className="text-sm text-muted-foreground">Pick a pre-made office layout and customize it</p>
              </div>
            </div>
            <Button className="gap-2 shrink-0" onClick={() => router.push('/templates')}>
              Browse Templates <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-[var(--color-sustain-300)]/20 bg-gradient-to-br from-[var(--color-sustain-300)]/6 via-[var(--color-sustain-300)]/2 to-transparent transition-all duration-300 hover:shadow-lg hover:border-[var(--color-sustain-300)]/35">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 px-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-sustain-300)]/25 to-[var(--color-sustain-300)]/5 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <Map className="w-6 h-6 text-[var(--color-sustain-500)]" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-[var(--text-heading)]">Site Plan Designer</h3>
                <p className="text-sm text-muted-foreground">Create outdoor site plans with buildings and landscaping</p>
              </div>
            </div>
            <Button variant="outline" className="gap-2 shrink-0" onClick={() => router.push('/tools/site-plan')}>
              Open Site Plan <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-heading)]">Planning Tools</h2>
          <div className="h-px flex-1 bg-border/50" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="group relative overflow-hidden border-primary/15 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/60 to-primary/20" />
            <CardHeader className="pt-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-105">
                <Grid3X3 className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">2D Canvas Planner</CardTitle>
              <CardDescription>Konva-powered interactive floor plan with transform handles.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2.5">
                <li className="flex items-center gap-2.5"><div className="w-1 h-1 rounded-full bg-primary/50" /> Resize & rotate handles</li>
                <li className="flex items-center gap-2.5"><div className="w-1 h-1 rounded-full bg-primary/50" /> Undo/Redo & keyboard shortcuts</li>
                <li className="flex items-center gap-2.5"><div className="w-1 h-1 rounded-full bg-primary/50" /> AI-powered layout advisor</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => router.push('/planner/canvas')} data-testid="button-start-canvas">
                Open Canvas Planner
              </Button>
            </CardFooter>
          </Card>

          <Card className="group relative overflow-hidden border-[var(--color-bronze-300)]/20 hover:border-[var(--color-bronze-400)]/30 transition-all duration-300 hover:shadow-lg">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-bronze-400)]/60 to-[var(--color-bronze-300)]/20" />
            <CardHeader className="pt-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-bronze-400)]/15 to-[var(--color-bronze-300)]/5 flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-105">
                <FileSignature className="w-6 h-6 text-[var(--color-bronze-500)]" />
              </div>
              <CardTitle className="text-lg">Blueprint Wizard</CardTitle>
              <CardDescription>Step-by-step guided room setup and arrangement.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2.5">
                <li className="flex items-center gap-2.5"><div className="w-1 h-1 rounded-full bg-[var(--color-bronze-400)]/50" /> Structured workflow</li>
                <li className="flex items-center gap-2.5"><div className="w-1 h-1 rounded-full bg-[var(--color-bronze-400)]/50" /> Bill of quantities</li>
                <li className="flex items-center gap-2.5"><div className="w-1 h-1 rounded-full bg-[var(--color-bronze-400)]/50" /> Category-based selection</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="secondary" onClick={() => router.push('/planner/canvas')} data-testid="button-start-blueprint">
                Open Canvas (Blueprint via File Menu)
              </Button>
            </CardFooter>
          </Card>

          <Card className="group relative overflow-hidden border-[var(--color-ocean-boat-blue-200)]/40 hover:border-[var(--color-ocean-boat-blue-300)]/50 transition-all duration-300 hover:shadow-lg">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-ocean-boat-blue-500)]/60 to-[var(--color-ocean-boat-blue-300)]/20" />
            <CardHeader className="pt-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-ocean-boat-blue-500)]/15 to-[var(--color-ocean-boat-blue-300)]/5 flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-105">
                <Box className="w-6 h-6 text-[var(--color-ocean-boat-blue-600)]" />
              </div>
              <CardTitle className="text-lg">3D Viewer</CardTitle>
              <CardDescription>Visualize your latest plan in interactive 3D.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2.5">
                <li className="flex items-center gap-2.5"><div className="w-1 h-1 rounded-full bg-[var(--color-ocean-boat-blue-500)]/50" /> First-person walkthrough</li>
                <li className="flex items-center gap-2.5"><div className="w-1 h-1 rounded-full bg-[var(--color-ocean-boat-blue-500)]/50" /> Orbit mode</li>
                <li className="flex items-center gap-2.5"><div className="w-1 h-1 rounded-full bg-[var(--color-ocean-boat-blue-500)]/50" /> Real-time rendering</li>
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
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-heading)]">Drawing Tools</h2>
          <div className="h-px flex-1 bg-border/50" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: LayoutGrid, color: 'var(--color-sustain-400)', colorLight: 'var(--color-sustain-300)', title: 'Floor Plan Creator', desc: 'Room-based layout builder with presets and area calculations.', route: '/planner/canvas', testId: 'button-start-floor-plan' },
            { icon: Shapes, color: 'var(--color-bronze-500)', colorLight: 'var(--color-bronze-400)', title: 'Custom Shapes', desc: 'Categorized shape libraries for walls, furniture, and more.', route: '/planner/canvas', testId: 'button-start-shapes' },
            { icon: Map, color: 'var(--color-sustain-500)', colorLight: 'var(--color-sustain-400)', title: 'Site Plan', desc: 'Outdoor site plans with buildings, roads, and utilities.', route: '/tools/site-plan', testId: 'button-start-site-plan' },
            { icon: ImagePlus, color: 'var(--color-bronze-400)', colorLight: 'var(--color-bronze-300)', title: 'Import & Scale', desc: 'Upload images, calibrate scale, and annotate blueprints.', route: '/tools/import', testId: 'button-start-import' },
          ].map((tool) => (
            <Card key={tool.testId} className="group hover:border-border transition-all duration-300 hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-2 transition-transform duration-300 group-hover:scale-105" style={{ background: `color-mix(in srgb, ${tool.colorLight} 12%, transparent)` }}>
                  <tool.icon className="w-5 h-5" style={{ color: tool.color }} />
                </div>
                <CardTitle className="text-base">{tool.title}</CardTitle>
                <CardDescription className="text-xs leading-relaxed">{tool.desc}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-0">
                <Button className="w-full" size="sm" variant="secondary" onClick={() => router.push(tool.route)} data-testid={tool.testId}>
                  Open
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {recentProjects.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight text-[var(--text-heading)]">Recent Projects</h2>
              <div className="h-px flex-1 bg-border/50 min-w-8" />
            </div>
            <Link href="/projects">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">View All <ArrowRight className="w-3.5 h-3.5" /></Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentProjects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`} className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-xl">
                <Card className="h-full hover:shadow-md transition-all duration-300">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base group-hover:text-primary transition-colors duration-300">{project.name}</CardTitle>
                      <Badge variant="secondary" className="text-[10px] capitalize font-medium">{project.status.replace('_', ' ')}</Badge>
                    </div>
                    {project.clientName && (
                      <CardDescription className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" /> {project.clientName}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" /> {project.planCount} plan{project.planCount !== 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> {format(new Date(project.updatedAt), 'MMM d')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-heading)]">Recent Plans</h2>
            <div className="h-px flex-1 bg-border/50 min-w-8" />
          </div>
          <Link href="/plans">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">View All <ArrowRight className="w-3.5 h-3.5" /></Button>
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
                <Card key={plan.id} className="group hover:shadow-md transition-all duration-300">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base group-hover:text-primary transition-colors duration-300">{plan.name}</CardTitle>
                      <Badge variant="outline" className="text-[10px] font-mono shrink-0">#{plan.id}</Badge>
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
                        className="w-full rounded-lg border bg-white"
                      />
                    </CardContent>
                  )}
                  <CardContent className="pb-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Box className="w-3.5 h-3.5" /> {plan.itemCount} items
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> {format(new Date(plan.updatedAt), 'MMM d')}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="secondary" size="sm" className="w-full" onClick={() => router.push(`${plannerTypeRoutes[plan.plannerType] || '/planner/canvas'}?id=${plan.id}`)} data-testid={`button-open-plan-${plan.id}`}>
                      Open Plan
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-gradient-to-br from-muted/30 to-muted/10 border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
              <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center mb-4">
                <Box className="w-7 h-7 text-primary/30" />
              </div>
              <p className="text-lg font-medium text-[var(--text-heading)]">No plans created yet</p>
              <p className="text-sm mt-1">Start designing your first workspace layout.</p>
              <div className="flex gap-3 mt-5">
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

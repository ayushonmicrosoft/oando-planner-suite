"use client";

import { useState } from 'react';
import {
  useListPlans,
  useGetPlanStats,
  useListProjects,
} from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Grid3X3, FileSignature, Box, Clock, ArrowRight, Pencil, LayoutGrid, Shapes, ImagePlus, LayoutTemplate, AlertCircle, RefreshCw, Map, Briefcase, FileText, Users, DraftingCompass, Layers3, Sparkles, TrendingUp, FolderOpen } from 'lucide-react';
import { format } from 'date-fns';
import { PlanThumbnail } from '@/components/plan-thumbnail';
import { useAuth } from '@/hooks/use-auth';

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

const planningTools = [
  { href: '/planner/canvas', icon: Grid3X3, title: '2D Canvas Planner', desc: 'Konva-powered interactive floor plan editor', color: 'from-blue-500/20 to-blue-600/5', iconColor: 'text-blue-400', borderColor: 'border-blue-500/20 hover:border-blue-500/40' },
  { href: '/planner/blueprint', icon: FileSignature, title: 'Blueprint Wizard', desc: 'Step-by-step guided room setup', color: 'from-violet-500/20 to-violet-600/5', iconColor: 'text-violet-400', borderColor: 'border-violet-500/20 hover:border-violet-500/40' },
  { href: '/planner/studio', icon: DraftingCompass, title: 'Live Planner', desc: 'Real-time collaborative workspace', color: 'from-emerald-500/20 to-emerald-600/5', iconColor: 'text-emerald-400', borderColor: 'border-emerald-500/20 hover:border-emerald-500/40' },
  { href: '/viewer/3d', icon: Box, title: '3D Viewer', desc: 'Interactive 3D walkthrough mode', color: 'from-amber-500/20 to-amber-600/5', iconColor: 'text-amber-400', borderColor: 'border-amber-500/20 hover:border-amber-500/40' },
];

const drawingTools = [
  { href: '/tools/cad', icon: Pencil, title: 'CAD Drawing', color: 'text-blue-400' },
  { href: '/tools/floor-plan', icon: LayoutGrid, title: 'Floor Plan', color: 'text-emerald-400' },
  { href: '/tools/shapes', icon: Shapes, title: 'Custom Shapes', color: 'text-purple-400' },
  { href: '/tools/site-plan', icon: Map, title: 'Site Plan', color: 'text-teal-400' },
  { href: '/tools/import', icon: ImagePlus, title: 'Import & Scale', color: 'text-orange-400' },
];

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = useGetPlanStats();
  const { data: plans, isLoading: plansLoading, isError: plansError, refetch: refetchPlans } = useListPlans();
  const { data: projects } = useListProjects();
  const recentProjects = projects?.slice(0, 4) || [];
  const recentPlans = plans?.slice(0, 4) || [];

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'there';
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-[#070D12]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8 space-y-10 animate-in fade-in duration-500">

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-[13px] uppercase tracking-[0.15em] text-white/30 font-medium mb-2">{greeting}</p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-[-0.03em] text-white">
              {displayName}
            </h1>
            <p className="text-white/40 mt-1 text-[15px]">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => router.push('/planner/canvas')}
              className="bg-white text-[#0B1324] hover:bg-white/90 rounded-full px-6 h-10 text-[13px] font-semibold gap-2"
            >
              <Sparkles className="w-4 h-4" /> New Plan
            </Button>
            <Button
              onClick={() => router.push('/templates')}
              variant="outline"
              className="border-white/10 text-white/70 hover:text-white hover:border-white/20 rounded-full px-6 h-10 text-[13px] bg-transparent"
            >
              <LayoutTemplate className="w-4 h-4 mr-2" /> Templates
            </Button>
          </div>
        </div>

        {statsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 animate-pulse">
                <div className="h-3 w-20 bg-white/5 rounded mb-4" />
                <div className="h-8 w-16 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : statsError ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-[14px] text-red-300">Failed to load statistics</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => refetchStats()} className="text-red-300 hover:text-red-200 gap-2">
              <RefreshCw className="w-4 h-4" /> Retry
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Plans', value: stats?.totalPlans || 0, icon: FolderOpen, accent: 'from-blue-500 to-cyan-400' },
              { label: 'Canvas Plans', value: stats?.canvas2dPlans || 0, icon: Grid3X3, accent: 'from-violet-500 to-purple-400' },
              { label: 'Blueprint Plans', value: stats?.blueprintPlans || 0, icon: FileSignature, accent: 'from-emerald-500 to-teal-400' },
              { label: 'Last Activity', value: stats?.recentPlan || 'None', icon: TrendingUp, accent: 'from-amber-500 to-orange-400', isText: true },
            ].map((stat, i) => (
              <div key={i} className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] p-5 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] uppercase tracking-[0.12em] text-white/30 font-medium">{stat.label}</span>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.accent} flex items-center justify-center opacity-80`}>
                    <stat.icon className="w-4 h-4 text-white" strokeWidth={2} />
                  </div>
                </div>
                {(stat as any).isText ? (
                  <p className="text-[15px] font-medium text-white/70 truncate" data-testid="text-recent-plan">{stat.value}</p>
                ) : (
                  <p className="text-3xl font-bold tracking-[-0.02em] text-white" data-testid={`text-${stat.label.toLowerCase().replace(/ /g,'-')}`}>{stat.value}</p>
                )}
              </div>
            ))}
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white tracking-[-0.02em]">Planning Tools</h2>
            <Link href="/planners" className="text-[13px] text-white/30 hover:text-white/60 transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {planningTools.map((tool) => (
              <button
                key={tool.href}
                onClick={() => router.push(tool.href)}
                className={`group text-left rounded-2xl border ${tool.borderColor} bg-gradient-to-br ${tool.color} p-5 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-black/20`}
              >
                <div className={`w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <tool.icon className={`w-5 h-5 ${tool.iconColor}`} strokeWidth={1.8} />
                </div>
                <h3 className="text-[15px] font-semibold text-white mb-1">{tool.title}</h3>
                <p className="text-[13px] text-white/40 leading-relaxed">{tool.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white tracking-[-0.02em] mb-5">Drawing Tools</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {drawingTools.map((tool) => (
              <button
                key={tool.href}
                onClick={() => router.push(tool.href)}
                className="group text-left rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] p-4 transition-all duration-300"
              >
                <tool.icon className={`w-6 h-6 ${tool.color} mb-3 group-hover:scale-110 transition-transform`} strokeWidth={1.8} />
                <h3 className="text-[13px] font-medium text-white/80 group-hover:text-white transition-colors">{tool.title}</h3>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/templates')}
            className="group text-left rounded-2xl border border-white/[0.06] bg-gradient-to-r from-blue-500/[0.08] to-cyan-500/[0.04] hover:from-blue-500/[0.12] hover:to-cyan-500/[0.08] p-6 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <LayoutTemplate className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-semibold text-white mb-0.5">Start from Template</h3>
                <p className="text-[13px] text-white/40">Pick a pre-made office layout and customize</p>
              </div>
              <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-white/50 group-hover:translate-x-1 transition-all shrink-0" />
            </div>
          </button>

          <button
            onClick={() => router.push('/tools/site-plan')}
            className="group text-left rounded-2xl border border-white/[0.06] bg-gradient-to-r from-emerald-500/[0.08] to-teal-500/[0.04] hover:from-emerald-500/[0.12] hover:to-teal-500/[0.08] p-6 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Map className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-semibold text-white mb-0.5">Site Plan Designer</h3>
                <p className="text-[13px] text-white/40">Outdoor site plans with buildings and landscaping</p>
              </div>
              <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-white/50 group-hover:translate-x-1 transition-all shrink-0" />
            </div>
          </button>
        </div>

        {recentProjects.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white tracking-[-0.02em]">Recent Projects</h2>
              <Link href="/projects" className="text-[13px] text-white/30 hover:text-white/60 transition-colors flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => router.push(`/projects/${project.id}`)}
                  className="group text-left rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] p-5 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-[14px] font-medium text-white truncate pr-2">{project.name}</h3>
                    <span className="text-[10px] uppercase tracking-wider font-medium text-white/30 bg-white/[0.06] px-2 py-0.5 rounded-full shrink-0 capitalize">
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
                  {project.clientName && (
                    <p className="text-[12px] text-white/30 flex items-center gap-1.5 mb-3">
                      <Users className="w-3 h-3" /> {project.clientName}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-[12px] text-white/25">
                    <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {project.planCount} plans</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {format(new Date(project.updatedAt), 'MMM d')}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white tracking-[-0.02em]">Recent Plans</h2>
            <Link href="/plans" className="text-[13px] text-white/30 hover:text-white/60 transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {plansLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 animate-pulse">
                  <div className="h-4 w-32 bg-white/5 rounded mb-3" />
                  <div className="h-32 bg-white/[0.03] rounded-lg mb-3" />
                  <div className="h-3 w-24 bg-white/5 rounded" />
                </div>
              ))}
            </div>
          ) : plansError ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-[14px] text-red-300">Failed to load recent plans</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => refetchPlans()} className="text-red-300 hover:text-red-200 gap-2">
                <RefreshCw className="w-4 h-4" /> Retry
              </Button>
            </div>
          ) : recentPlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentPlans.map((plan) => {
                const planItems = parsePlanItems(plan as { documentJson?: string });
                return (
                  <button
                    key={plan.id}
                    onClick={() => router.push(`${plannerTypeRoutes[plan.plannerType] || '/planner/canvas'}?id=${plan.id}`)}
                    className="group text-left rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] p-5 transition-all duration-300"
                    data-testid={`button-open-plan-${plan.id}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-[14px] font-medium text-white truncate pr-2">{plan.name}</h3>
                      <span className="text-[10px] text-white/30 font-mono shrink-0">#{plan.id}</span>
                    </div>
                    <p className="text-[12px] text-white/30 mb-3">{plannerTypeLabels[plan.plannerType] || plan.plannerType}</p>
                    {planItems.length > 0 && (
                      <div className="mb-3 rounded-lg overflow-hidden border border-white/[0.04] bg-white">
                        <PlanThumbnail
                          roomWidthCm={plan.roomWidthCm}
                          roomDepthCm={plan.roomDepthCm}
                          items={planItems}
                          width={280}
                          height={140}
                          className="w-full"
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[12px] text-white/25">
                      <span className="flex items-center gap-1"><Box className="w-3 h-3" /> {plan.itemCount} items</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {format(new Date(plan.updatedAt), 'MMM d')}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/[0.06] border-dashed bg-white/[0.01] flex flex-col items-center justify-center h-48 text-center">
              <Box className="w-10 h-10 text-white/10 mb-4" />
              <p className="text-[15px] font-medium text-white/40">No plans created yet</p>
              <p className="text-[13px] text-white/20 mt-1 mb-5">Start designing your first workspace layout</p>
              <div className="flex gap-3">
                <Button size="sm" onClick={() => router.push('/planner/canvas')} className="bg-white text-[#0B1324] hover:bg-white/90 rounded-full px-5 text-[12px] font-semibold" data-testid="button-start-canvas">
                  Start Canvas
                </Button>
                <Button size="sm" variant="outline" onClick={() => router.push('/planner/blueprint')} className="border-white/10 text-white/60 hover:text-white rounded-full px-5 text-[12px] bg-transparent" data-testid="button-start-blueprint">
                  Start Blueprint
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

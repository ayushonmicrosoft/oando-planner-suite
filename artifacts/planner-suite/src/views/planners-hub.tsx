"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  PencilRuler,
  Eye,
  FileDown,
  Ruler,
  LayoutGrid,
  Shapes,
  Import,
  Clock,
  Sparkles,
  Plus,
  Loader2,
  Box,
  Check,
  ChevronRight,
  Layers3,
  DraftingCompass,
  MousePointerClick,
  PenTool,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useListPlans, useCreatePlan, useListTemplates, useUseTemplate, getListPlansQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  WORKFLOW_STEPS,
  migrateDocument,
  getCompletedSteps,
  type WorkflowStep,
} from "@/lib/unified-document";

const WORKFLOW_DISPLAY = [
  { step: "rooms" as WorkflowStep, label: "Define Rooms", icon: LayoutGrid, tool: "Floor Plan Creator", href: "/tools/floor-plan" },
  { step: "structure" as WorkflowStep, label: "Add Structure", icon: Shapes, tool: "Custom Shapes", href: "/tools/shapes" },
  { step: "furniture" as WorkflowStep, label: "Place Furniture", icon: PenTool, tool: "Canvas Planner", href: "/planner/canvas" },
  { step: "3d-review" as WorkflowStep, label: "3D Review", icon: Eye, tool: "3D Viewer", href: "/viewer/3d" },
];

const TOOLS = [
  { title: "Floor Plan Creator", href: "/tools/floor-plan", icon: LayoutGrid, desc: "Define rooms and spaces", step: "rooms" as WorkflowStep },
  { title: "Custom Shapes", href: "/tools/shapes", icon: Shapes, desc: "Walls, doors, furniture", step: "structure" as WorkflowStep },
  { title: "Canvas Planner", href: "/planner/canvas", icon: PenTool, desc: "Drag & drop furniture", step: "furniture" as WorkflowStep },
  { title: "CAD Drawing", href: "/tools/cad", icon: PencilRuler, desc: "Vector precision drawing" },
  { title: "Site Plan", href: "/tools/site-plan", icon: DraftingCompass, desc: "Outdoor/site planning" },
  { title: "Import & Scale", href: "/tools/import", icon: Import, desc: "Upload blueprints" },
];

const START_OPTIONS = [
  { label: "Empty Floor Plan", icon: LayoutGrid, href: "/tools/floor-plan", desc: "Start by defining rooms" },
  { label: "Canvas Planner", icon: PenTool, href: "/planner/canvas", desc: "Jump into furniture layout" },
  { label: "Import Blueprint", icon: Import, href: "/tools/import", desc: "Upload an existing plan" },
  { label: "CAD Drawing", icon: PencilRuler, href: "/tools/cad", desc: "Precision vector drawing" },
];

const stagger: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } };
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

function getStepProgress(completedSteps: WorkflowStep[]): number {
  return Math.round((completedSteps.length / WORKFLOW_DISPLAY.length) * 100);
}

function PlanCard({ plan, onContinue }: { plan: any; onContinue: (id: number, step: string) => void }) {
  let completedSteps: WorkflowStep[] = [];
  try {
    if (plan.documentJson) {
      const doc = migrateDocument(plan.documentJson);
      completedSteps = getCompletedSteps(doc);
    }
  } catch {}

  const progress = getStepProgress(completedSteps);
  const nextStep = WORKFLOW_DISPLAY.find((ws) => !completedSteps.includes(ws.step));

  const updatedAt = plan.updatedAt
    ? new Date(plan.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "";

  return (
    <div className="group flex flex-col rounded-xl border bg-card overflow-hidden hover:border-primary/20 hover:shadow-md hover:shadow-black/5 transition-all">
      <div className="p-4 flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold truncate">{plan.name}</h3>
            <p className="text-[11px] text-muted-foreground/40 mt-0.5">{updatedAt}</p>
          </div>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground/60 shrink-0">
            {plan.plannerType || "plan"}
          </span>
        </div>

        <div className="flex items-center gap-1 mb-3">
          {WORKFLOW_DISPLAY.map((ws, i) => {
            const done = completedSteps.includes(ws.step);
            return (
              <div key={ws.step} className="flex items-center gap-1">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border transition-all ${
                    done
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                      : "bg-muted/30 border-border/40 text-muted-foreground/30"
                  }`}
                >
                  {done ? <Check className="w-2.5 h-2.5" /> : i + 1}
                </div>
                {i < WORKFLOW_DISPLAY.length - 1 && (
                  <div className={`w-4 h-px ${done ? "bg-emerald-500/30" : "bg-border/30"}`} />
                )}
              </div>
            );
          })}
          <span className="text-[10px] text-muted-foreground/40 ml-1.5 tabular-nums">{progress}%</span>
        </div>

        {nextStep && (
          <p className="text-[11px] text-muted-foreground/50">
            Next: <span className="font-medium text-foreground/70">{nextStep.label}</span>
          </p>
        )}
      </div>

      <div className="border-t px-4 py-2.5 flex items-center justify-between bg-muted/[0.03]">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2.5 text-xs gap-1.5 text-primary"
          onClick={() => onContinue(plan.id, nextStep?.href || "/tools/floor-plan")}
        >
          Continue
          <ArrowRight className="w-3 h-3" />
        </Button>
        <Link href={`/tools/floor-plan?id=${plan.id}`} className="text-[11px] text-muted-foreground/40 hover:text-foreground transition-colors">
          Open
        </Link>
      </div>
    </div>
  );
}

export default function PlannersHub() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showNewPlan, setShowNewPlan] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");

  const { data: plans, isLoading: plansLoading } = useListPlans();
  const { data: templates, isLoading: templatesLoading } = useListTemplates();
  const createPlan = useCreatePlan();
  const useTemplate = useUseTemplate();

  const recentPlans = (plans || [])
    .sort((a: any, b: any) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 6);

  const handleContinue = (id: number, href: string) => {
    router.push(`${href}?id=${id}`);
  };

  const handleStartNew = (href: string) => {
    if (!newPlanName.trim()) {
      router.push(href);
      setShowNewPlan(false);
      return;
    }
    createPlan.mutate(
      { data: { name: newPlanName.trim(), roomWidthCm: 900, roomDepthCm: 650, plannerType: "floorplan" as any, documentJson: JSON.stringify({ version: 3, rooms: [], structure: [], furniture: [], annotations: [], site: [], importLayer: null }) } },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: getListPlansQueryKey() });
          router.push(`${href}?id=${data.id}`);
          setShowNewPlan(false);
        },
      }
    );
  };

  const handleUseTemplate = (templateId: string, templateName: string) => {
    useTemplate.mutate(
      { id: templateId, data: { name: `${templateName} Plan` } },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: getListPlansQueryKey() });
          toast({ title: "Plan created from template" });
          router.push(`/planner/canvas?id=${data.id}`);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1200px] mx-auto px-5 md:px-8 pt-8 pb-20">
        <motion.section className="pt-4 pb-10" initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp} className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground/60 mb-1">Workspace</p>
              <h1 className="text-2xl font-semibold tracking-[-0.02em]">Planner Hub</h1>
              <p className="text-sm text-muted-foreground/60 mt-1">
                From blank room to finished plan. Define rooms, add structure, place furniture, then review.
              </p>
            </div>
            <Button
              onClick={() => setShowNewPlan(true)}
              className="gap-2 shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              New Plan
            </Button>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-6 flex items-center gap-0 overflow-x-auto">
            {WORKFLOW_DISPLAY.map((ws, i) => {
              const Icon = ws.icon;
              return (
                <div key={ws.step} className="flex items-center shrink-0">
                  <Link
                    href={ws.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/30 border border-transparent hover:border-border/50 hover:shadow-sm transition-all"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/[0.08] flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary" strokeWidth={1.8} />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground/40 font-medium uppercase tracking-wider">Step {String(i + 1).padStart(2, "0")}</p>
                      <p className="text-sm font-medium">{ws.label}</p>
                    </div>
                  </Link>
                  {i < WORKFLOW_DISPLAY.length - 1 && (
                    <div className="mx-1 flex items-center shrink-0">
                      <div className="w-6 h-px bg-border/50" />
                      <ArrowRight className="w-3 h-3 text-muted-foreground/20 -ml-0.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </motion.div>
        </motion.section>

        {showNewPlan && (
          <motion.section
            className="mb-8 rounded-2xl border bg-card p-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-base font-semibold mb-4">Start a New Plan</h2>
            <div className="mb-4">
              <Input
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
                placeholder="Plan name (optional)"
                className="max-w-sm"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {START_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.label}
                    onClick={() => handleStartNew(opt.href)}
                    disabled={createPlan.isPending}
                    className="group flex flex-col items-start gap-2 p-4 rounded-xl border bg-card hover:border-primary/20 hover:shadow-md hover:shadow-black/5 transition-all text-left disabled:opacity-50"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/[0.06] flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <Icon className="w-4 h-4 text-primary" strokeWidth={1.8} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{opt.label}</p>
                      <p className="text-[11px] text-muted-foreground/50 mt-0.5">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => setShowNewPlan(false)}>Cancel</Button>
            </div>
          </motion.section>
        )}

        {recentPlans.length > 0 && (
          <motion.section className="mb-12" initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-muted-foreground/40" strokeWidth={1.8} />
                <h2 className="text-sm font-semibold tracking-[-0.01em]">Active Plans</h2>
                <span className="text-[11px] text-muted-foreground/40 bg-muted/40 px-1.5 py-0.5 rounded">
                  {plans?.length || 0}
                </span>
              </div>
              <Link href="/plans" className="text-xs text-primary hover:underline">View all</Link>
            </motion.div>

            {plansLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground/40" />
              </div>
            ) : (
              <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {recentPlans.map((plan: any) => (
                  <PlanCard key={plan.id} plan={plan} onContinue={handleContinue} />
                ))}
              </motion.div>
            )}
          </motion.section>
        )}

        <motion.section initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp} className="flex items-center gap-2.5 mb-4">
            <Shapes className="w-4 h-4 text-muted-foreground/40" strokeWidth={1.8} />
            <h2 className="text-sm font-semibold tracking-[-0.01em]">Drawing Tools</h2>
          </motion.div>
          <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group flex flex-col items-start gap-2.5 p-3.5 rounded-xl border bg-card hover:border-primary/20 hover:shadow-md hover:shadow-black/5 transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 group-hover:bg-primary/[0.08] transition-colors">
                    <Icon className="w-4 h-4 text-muted-foreground/60 group-hover:text-primary transition-colors" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-medium block leading-tight">{tool.title}</span>
                    <span className="text-[11px] text-muted-foreground/40">{tool.desc}</span>
                  </div>
                </Link>
              );
            })}
          </motion.div>
        </motion.section>

        {templates && templates.length > 0 && (
          <motion.section className="mb-12" initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-muted-foreground/40" strokeWidth={1.8} />
                <h2 className="text-sm font-semibold tracking-[-0.01em]">Start from Template</h2>
              </div>
              <Link href="/templates" className="text-xs text-primary hover:underline">Browse all</Link>
            </motion.div>
            <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {templates.slice(0, 8).map((tpl: any) => (
                <button
                  key={tpl.id}
                  onClick={() => handleUseTemplate(tpl.id, tpl.name)}
                  disabled={useTemplate.isPending}
                  className="group flex flex-col rounded-xl border bg-card overflow-hidden hover:border-primary/20 hover:shadow-md hover:shadow-black/5 transition-all text-left disabled:opacity-50"
                >
                  <div className="p-4 flex-1">
                    <h3 className="text-sm font-medium">{tpl.name}</h3>
                    <p className="text-[11px] text-muted-foreground/40 mt-1 line-clamp-2">{tpl.description || `${tpl.roomWidthCm}×${tpl.roomDepthCm} cm`}</p>
                  </div>
                  <div className="border-t px-4 py-2 flex items-center gap-1.5 text-xs text-primary font-medium">
                    <Plus className="w-3 h-3" /> Use template
                  </div>
                </button>
              ))}
            </motion.div>
          </motion.section>
        )}

        {plansLoading && recentPlans.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground/50">Loading your workspace...</p>
          </motion.div>
        )}

        {!plansLoading && recentPlans.length === 0 && !showNewPlan && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 rounded-2xl border border-dashed border-border/50 bg-muted/[0.03]"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/[0.06] flex items-center justify-center mx-auto mb-4">
              <LayoutGrid className="w-6 h-6 text-primary/60" />
            </div>
            <h3 className="text-base font-semibold mb-1">No plans yet</h3>
            <p className="text-sm text-muted-foreground/50 mb-5">Create your first plan to get started.</p>
            <Button onClick={() => setShowNewPlan(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Create Your First Plan
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

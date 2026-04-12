"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { useListPlans, useListTemplates, useCreatePlan, useUseTemplate, getListPlansQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  LayoutGrid,
  Shapes,
  Import,
  Clock,
  Sparkles,
  Plus,
  Loader2,
  FolderOpen,
  CheckCircle2,
  ChevronRight,
  Box,
  FileSpreadsheet,
  X,
} from "lucide-react";
import {
  WORKFLOW_STEPS,
  getStepIndex,
  migrateDocument,
  type PlanStep,
  type UnifiedDocument,
} from "@/lib/unified-plan";

function getDocumentStep(documentJson: unknown): PlanStep {
  if (!documentJson) return "rooms";
  try {
    const raw = typeof documentJson === "string" ? JSON.parse(documentJson) : documentJson;
    const doc = migrateDocument(raw);
    if (doc.currentStep) return doc.currentStep;
    if ((doc.furniture?.length || 0) > 0) return "furniture";
    if ((doc.structure?.length || 0) > 0) return "structure";
    return "rooms";
  } catch {
    return "rooms";
  }
}

function getToolForStep(step: PlanStep): string {
  const ws = WORKFLOW_STEPS.find((s) => s.step === step);
  return ws?.toolPath || "/tools/floor-plan";
}

function getNextToolForPlan(documentJson: unknown): string {
  const step = getDocumentStep(documentJson);
  const idx = getStepIndex(step);
  const nextIdx = Math.min(idx + 1, WORKFLOW_STEPS.length - 1);
  return WORKFLOW_STEPS[nextIdx].toolPath;
}

function StepBadges({ documentJson }: { documentJson: unknown }) {
  const step = getDocumentStep(documentJson);
  const stepIdx = getStepIndex(step);

  return (
    <div className="flex items-center gap-0.5">
      {WORKFLOW_STEPS.slice(0, 3).map((ws, i) => {
        const done = i < stepIdx;
        const active = i === stepIdx;
        return (
          <div
            key={ws.step}
            className={`w-1.5 h-1.5 rounded-full ${
              done ? "bg-emerald-400" : active ? "bg-primary" : "bg-muted-foreground/15"
            }`}
          />
        );
      })}
    </div>
  );
}

const stagger: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp: Variants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } } };

const START_OPTIONS = [
  {
    id: "floor-plan" as const,
    title: "Define Rooms",
    desc: "Start by sketching room boundaries and zones",
    icon: LayoutGrid,
    tool: "/tools/floor-plan",
    gradient: "from-violet-500/10 to-purple-500/5",
  },
  {
    id: "import" as const,
    title: "Import Blueprint",
    desc: "Upload an existing floor plan image and annotate it",
    icon: Import,
    tool: "/tools/import",
    gradient: "from-rose-500/10 to-pink-500/5",
  },
  {
    id: "furniture" as const,
    title: "Start with Furniture",
    desc: "Jump straight to placing furniture on a blank canvas",
    icon: Box,
    tool: "/planner/canvas",
    gradient: "from-amber-500/10 to-orange-500/5",
  },
];

export default function PlannersHub() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: plans, isLoading: plansLoading } = useListPlans();
  const { data: templates } = useListTemplates();
  const createPlan = useCreatePlan();
  const useTemplate = useUseTemplate();
  const [showNewPlan, setShowNewPlan] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");

  const handleStartPlan = (tool: string) => {
    const name = newPlanName.trim() || "Untitled Plan";
    createPlan.mutate(
      {
        data: {
          name,
          roomWidthCm: 900,
          roomDepthCm: 650,
          plannerType: "floorplan" as any,
          documentJson: JSON.stringify({ version: 2, currentStep: "rooms" }),
        },
      },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: getListPlansQueryKey() });
          router.push(`${tool}?id=${data.id}`);
        },
      }
    );
  };

  const handleUseTemplate = (templateId: string) => {
    useTemplate.mutate(
      { id: templateId },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: getListPlansQueryKey() });
          router.push(`/planner/canvas?id=${data.id}`);
        },
      }
    );
  };

  const recentPlans = plans
    ?.sort((a: any, b: any) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1200px] mx-auto px-5 md:px-8 pt-8 pb-20">

        <motion.section className="pt-4 pb-8" initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp} className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground/60 mb-1">Workspace</p>
              <h1 className="text-2xl font-semibold tracking-[-0.02em]">Planner Hub</h1>
              <p className="text-sm text-muted-foreground/60 mt-1">Create a plan, build through each step, then export.</p>
            </div>
            <Button
              onClick={() => setShowNewPlan(true)}
              className="gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Plan
            </Button>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-6 flex items-center gap-0">
            {WORKFLOW_STEPS.map((step, i) => (
              <div key={step.step} className="flex items-center">
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-muted/30 border border-transparent">
                  <div className="w-7 h-7 rounded-lg bg-primary/[0.08] flex items-center justify-center text-xs font-bold text-primary">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium leading-tight">{step.label}</p>
                    <p className="text-[10px] text-muted-foreground/40">{step.description}</p>
                  </div>
                </div>
                {i < WORKFLOW_STEPS.length - 1 && (
                  <div className="mx-1 flex items-center">
                    <div className="w-5 h-px bg-border/50" />
                    <ChevronRight className="w-3 h-3 text-muted-foreground/20 -ml-0.5" />
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        </motion.section>

        {showNewPlan && (
          <motion.section
            className="mb-8 p-6 rounded-2xl border bg-card shadow-lg shadow-black/5"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Start a New Plan</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowNewPlan(false)} className="h-7 w-7 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <Input
              placeholder="Plan name (e.g. West Wing Floor 3)"
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              className="mb-4 h-10"
              autoFocus
            />
            <div className="grid grid-cols-3 gap-3">
              {START_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleStartPlan(opt.tool)}
                    disabled={createPlan.isPending}
                    className={`group flex flex-col items-center gap-3 p-5 rounded-xl border bg-gradient-to-br ${opt.gradient} hover:border-primary/30 hover:shadow-md hover:shadow-black/5 transition-all text-center`}
                  >
                    <div className="w-11 h-11 rounded-xl bg-background/80 border border-border/40 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" strokeWidth={1.6} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{opt.title}</p>
                      <p className="text-[11px] text-muted-foreground/50 mt-0.5 leading-relaxed">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.section>
        )}

        <motion.section className="mb-10" initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp} className="flex items-center gap-2.5 mb-4">
            <FolderOpen className="w-4 h-4 text-muted-foreground/40" strokeWidth={1.8} />
            <h2 className="text-sm font-semibold tracking-[-0.01em]">Your Plans</h2>
            {plans && <span className="text-xs text-muted-foreground/40">({plans.length})</span>}
          </motion.div>

          {plansLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/30" />
            </div>
          ) : !recentPlans?.length ? (
            <motion.div variants={fadeUp} className="text-center py-12 rounded-xl border border-dashed border-border/50 bg-muted/10">
              <Box className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground/50 font-medium">No plans yet</p>
              <p className="text-xs text-muted-foreground/30 mt-1">Click "New Plan" to get started</p>
            </motion.div>
          ) : (
            <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentPlans.map((plan: any) => {
                const step = getDocumentStep(plan.documentJson);
                const stepInfo = WORKFLOW_STEPS.find((s) => s.step === step);
                const nextTool = getNextToolForPlan(plan.documentJson);
                const currentTool = getToolForStep(step);
                const updatedAt = plan.updatedAt || plan.createdAt;
                const dateStr = updatedAt ? new Date(updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";

                return (
                  <div
                    key={plan.id}
                    className="group flex flex-col rounded-xl border bg-card overflow-hidden hover:border-primary/20 hover:shadow-md hover:shadow-black/5 transition-all"
                  >
                    <div className="p-4 flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold truncate">{plan.name}</h3>
                          <p className="text-[11px] text-muted-foreground/40 mt-0.5 flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            {dateStr}
                          </p>
                        </div>
                        <StepBadges documentJson={plan.documentJson} />
                      </div>

                      <div className="flex items-center gap-1.5 mt-3">
                        {WORKFLOW_STEPS.slice(0, 4).map((ws, i) => {
                          const thisIdx = getStepIndex(step);
                          const done = i < thisIdx;
                          const active = i === thisIdx;
                          return (
                            <div key={ws.step} className="flex items-center gap-1">
                              <div
                                className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                                  done
                                    ? "bg-emerald-400/10 text-emerald-500"
                                    : active
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "bg-muted/30 text-muted-foreground/30"
                                }`}
                              >
                                {done && <CheckCircle2 className="w-2.5 h-2.5" />}
                                {ws.label}
                              </div>
                              {i < 3 && <ChevronRight className="w-2.5 h-2.5 text-muted-foreground/15" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-3 border-t border-border/50 flex items-center justify-between gap-2">
                      <Link
                        href={`${currentTool}?id=${plan.id}`}
                        className="text-xs text-muted-foreground/50 hover:text-foreground transition-colors"
                      >
                        {stepInfo?.label || "Continue"}
                      </Link>
                      <Link
                        href={`${nextTool}?id=${plan.id}`}
                        className="flex items-center gap-1 text-xs font-semibold text-primary hover:gap-1.5 transition-all"
                      >
                        Continue <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
          {plans && plans.length > 6 && (
            <div className="mt-3 text-center">
              <Link href="/plans" className="text-xs text-primary hover:underline font-medium">
                View all {plans.length} plans
              </Link>
            </div>
          )}
        </motion.section>

        {templates && templates.length > 0 && (
          <motion.section className="mb-10" initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="flex items-center gap-2.5 mb-4">
              <Sparkles className="w-4 h-4 text-muted-foreground/40" strokeWidth={1.8} />
              <h2 className="text-sm font-semibold tracking-[-0.01em]">Templates</h2>
            </motion.div>
            <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {(templates as any[]).slice(0, 8).map((tpl: any) => (
                <button
                  key={tpl.id}
                  onClick={() => handleUseTemplate(tpl.id)}
                  disabled={useTemplate.isPending}
                  className="group flex flex-col rounded-xl border bg-card overflow-hidden hover:border-primary/20 hover:shadow-md hover:shadow-black/5 transition-all text-left"
                >
                  <div className="p-4 flex-1">
                    <h3 className="text-sm font-medium">{tpl.name}</h3>
                    <p className="text-[11px] text-muted-foreground/40 mt-1 line-clamp-2">{tpl.description || `${tpl.roomWidthCm}x${tpl.roomDepthCm} cm`}</p>
                  </div>
                  <div className="px-4 pb-3 flex items-center gap-1.5 text-xs font-medium text-primary">
                    <Plus className="w-3 h-3" /> Use Template
                  </div>
                </button>
              ))}
            </motion.div>
          </motion.section>
        )}

        <motion.section initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp} className="flex items-center gap-2.5 mb-4">
            <Shapes className="w-4 h-4 text-muted-foreground/40" strokeWidth={1.8} />
            <h2 className="text-sm font-semibold tracking-[-0.01em]">Drawing Tools</h2>
          </motion.div>
          <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {[
              { title: "Floor Plans", href: "/tools/floor-plan", icon: LayoutGrid, desc: "Room layouts", step: "rooms" },
              { title: "Custom Shapes", href: "/tools/shapes", icon: Shapes, desc: "Walls & doors", step: "structure" },
              { title: "Canvas Planner", href: "/planner/canvas", icon: Box, desc: "Furniture placement", step: "furniture" },
              { title: "Import & Scale", href: "/tools/import", icon: Import, desc: "Upload blueprints", step: "rooms" },
              { title: "Quote Builder", href: "/plans", icon: FileSpreadsheet, desc: "BOQ & pricing", step: "quote" },
            ].map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group flex items-center gap-3 p-3.5 rounded-xl border bg-card hover:border-primary/20 hover:shadow-md hover:shadow-black/5 transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 group-hover:bg-primary/[0.08] transition-colors">
                    <Icon className="w-4 h-4 text-muted-foreground/60 group-hover:text-primary transition-colors" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-medium block">{tool.title}</span>
                    <span className="text-[11px] text-muted-foreground/40">{tool.desc}</span>
                  </div>
                </Link>
              );
            })}
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
}

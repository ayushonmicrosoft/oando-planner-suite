"use client";

import { useRouter, usePathname } from "next/navigation";
import { ChevronRight, Home, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  WORKFLOW_STEPS,
  getStepForTool,
  getNextStep,
  getPrevStep,
  getStepIndex,
  type WorkflowStep,
} from "@/lib/unified-document";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PlannerBreadcrumbProps {
  items: BreadcrumbItem[];
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  planId?: number | null;
  planName?: string;
  completedSteps?: WorkflowStep[];
}

export function PlannerBreadcrumb({ items, icon, actions, planId, planName, completedSteps = [] }: PlannerBreadcrumbProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentStep = getStepForTool(pathname);

  const prev = currentStep ? getPrevStep(currentStep) : null;
  const next = currentStep ? getNextStep(currentStep) : null;

  const navigateToStep = (href: string) => {
    if (!href) return;
    const url = planId ? `${href}?id=${planId}` : href;
    router.push(url);
  };

  const showWorkflowNav = !!planId && !!currentStep;

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b bg-card/80 backdrop-blur-sm shrink-0">
      <nav className="flex items-center gap-1 text-sm min-w-0">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <Home className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-xs font-medium">Home</span>
        </button>
        {planName && planId && (
          <div className="flex items-center gap-1 min-w-0">
            <ChevronRight className="w-3 h-3 text-muted-foreground/50 shrink-0" />
            <button
              onClick={() => router.push("/planners")}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors truncate max-w-[120px]"
            >
              {planName}
            </button>
          </div>
        )}
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1 min-w-0">
            <ChevronRight className="w-3 h-3 text-muted-foreground/50 shrink-0" />
            {item.href ? (
              <button
                onClick={() => router.push(item.href!)}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors truncate"
              >
                {item.label}
              </button>
            ) : (
              <span className="text-xs font-semibold text-foreground truncate flex items-center gap-1.5">
                {icon && i === items.length - 1 && icon}
                {item.label}
              </span>
            )}
          </div>
        ))}

        {showWorkflowNav && currentStep && (
          <div className="hidden md:flex items-center gap-1 ml-3 pl-3 border-l border-border/50">
            {WORKFLOW_STEPS.slice(0, -1).map((ws, i) => {
              const isActive = ws.step === currentStep;
              const isCompleted = completedSteps.includes(ws.step);
              const stepIdx = getStepIndex(ws.step);
              const currentIdx = getStepIndex(currentStep);
              return (
                <button
                  key={ws.step}
                  onClick={() => navigateToStep(ws.href)}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : isCompleted
                        ? "text-emerald-600 hover:bg-emerald-50"
                        : stepIdx < currentIdx
                          ? "text-muted-foreground/60 hover:text-foreground"
                          : "text-muted-foreground/40 hover:text-muted-foreground/60"
                  }`}
                >
                  {isCompleted && !isActive ? (
                    <Check className="w-2.5 h-2.5" />
                  ) : (
                    <span className="w-3 h-3 rounded-full border text-[8px] flex items-center justify-center shrink-0"
                      style={{
                        borderColor: isActive ? "currentColor" : "transparent",
                        background: isActive ? "currentColor" : "transparent",
                        color: isActive ? "white" : "inherit",
                      }}
                    >
                      {isActive && <span className="text-primary-foreground">{i + 1}</span>}
                    </span>
                  )}
                  <span className="hidden lg:inline">{ws.label}</span>
                  {i < WORKFLOW_STEPS.length - 2 && (
                    <ChevronRight className="w-2.5 h-2.5 text-muted-foreground/30 ml-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </nav>
      <div className="flex items-center gap-2 shrink-0 ml-4">
        {showWorkflowNav && (
          <div className="flex items-center gap-1">
            {prev && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs gap-1"
                onClick={() => navigateToStep(prev.href)}
              >
                <ArrowLeft className="w-3 h-3" />
                <span className="hidden sm:inline">{prev.label}</span>
              </Button>
            )}
            {next && (
              <Button
                variant="default"
                size="sm"
                className="h-7 px-2 text-xs gap-1"
                onClick={() => navigateToStep(next.href)}
              >
                <span className="hidden sm:inline">{next.label}</span>
                <ArrowRight className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}
        {actions}
      </div>
    </div>
  );
}

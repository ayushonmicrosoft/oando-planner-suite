"use client";

import Link from "next/link";
import { ChevronRight, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  WORKFLOW_STEPS,
  getStepIndex,
  getNextStep,
  getPrevStep,
  type PlanStep,
  type UnifiedDocument,
} from "@/lib/unified-plan";

function stepHasData(doc: UnifiedDocument, step: PlanStep): boolean {
  switch (step) {
    case "rooms":
      return (doc.rooms?.length || 0) > 0;
    case "structure":
      return (doc.structure?.length || 0) > 0;
    case "furniture":
      return (doc.furniture?.length || 0) > 0;
    case "review":
      return false;
    case "quote":
      return false;
    default:
      return false;
  }
}

export function PlannerStepNav({
  planId,
  planName,
  currentStep,
  document,
}: {
  planId: number | null;
  planName: string;
  currentStep: PlanStep;
  document?: UnifiedDocument;
}) {
  if (!planId) return null;

  const currentIdx = getStepIndex(currentStep);
  const prev = getPrevStep(currentStep);
  const next = getNextStep(currentStep);

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b bg-card/50 text-sm shrink-0">
      <div className="flex items-center gap-1.5 text-muted-foreground/60 min-w-0 flex-1">
        <Link href="/planners" className="hover:text-foreground transition-colors shrink-0">
          Plans
        </Link>
        <ChevronRight className="w-3 h-3 shrink-0" />
        <span className="text-foreground font-medium truncate">{planName}</span>
        <ChevronRight className="w-3 h-3 shrink-0" />

        <div className="flex items-center gap-1">
          {WORKFLOW_STEPS.map((ws, i) => {
            const isActive = i === currentIdx;
            const isDone = document ? stepHasData(document, ws.step) : false;
            const isPast = i < currentIdx;

            return (
              <Link
                key={ws.step}
                href={`${ws.toolPath}?id=${planId}`}
                className={`
                  flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-all
                  ${isActive ? "bg-primary/10 text-primary font-medium" : ""}
                  ${isDone && !isActive ? "text-emerald-400/70" : ""}
                  ${!isActive && !isDone ? "text-muted-foreground/40 hover:text-muted-foreground/70" : ""}
                `}
              >
                {isDone && !isActive && <CheckCircle2 className="w-3 h-3" />}
                <span className="hidden sm:inline">{ws.label}</span>
                <span className="sm:hidden">{i + 1}</span>
                {i < WORKFLOW_STEPS.length - 1 && (
                  <ChevronRight className="w-2.5 h-2.5 text-muted-foreground/20 ml-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {prev && (
          <Button variant="ghost" size="sm" asChild className="h-7 text-xs gap-1">
            <Link href={`${prev.toolPath}?id=${planId}`}>
              <ArrowLeft className="w-3 h-3" />
              {prev.label}
            </Link>
          </Button>
        )}
        {next && (
          <Button variant="default" size="sm" asChild className="h-7 text-xs gap-1">
            <Link href={`${next.toolPath}?id=${planId}`}>
              {next.label}
              <ArrowRight className="w-3 h-3" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

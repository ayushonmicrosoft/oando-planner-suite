"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { StudioPlanner } from "@/features/planner/StudioPlanner";
import { usePlannerStore } from "@/features/planner/planner-store";

export default function StudioPage() {
  const searchParams = useSearchParams();
  const planIdParam = searchParams.get("id");

  useEffect(() => {
    if (planIdParam) {
      usePlannerStore.getState().setCollabPlanId(planIdParam);
    } else {
      usePlannerStore.getState().setCollabPlanId(null);
    }
    return () => {
      usePlannerStore.getState().setCollabPlanId(null);
    };
  }, [planIdParam]);

  return <StudioPlanner />;
}

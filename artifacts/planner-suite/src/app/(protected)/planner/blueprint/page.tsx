"use client";

import dynamic from "next/dynamic";
import { CanvasErrorBoundary } from "@/components/error-boundary";

const BlueprintPlanner = dynamic(() => import("@/views/planner/blueprint"), { ssr: false });

export default function BlueprintPage() {
  return (
    <CanvasErrorBoundary toolName="Blueprint Planner">
      <BlueprintPlanner />
    </CanvasErrorBoundary>
  );
}

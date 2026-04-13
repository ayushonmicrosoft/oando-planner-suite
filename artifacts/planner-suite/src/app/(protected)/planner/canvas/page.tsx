"use client";

import dynamic from "next/dynamic";
import { CanvasErrorBoundary } from "@/components/error-boundary";

const CanvasPlanner = dynamic(() => import("@/views/planner/canvas"), { ssr: false });

export default function CanvasPage() {
  return (
    <CanvasErrorBoundary toolName="Canvas Planner">
      <CanvasPlanner />
    </CanvasErrorBoundary>
  );
}

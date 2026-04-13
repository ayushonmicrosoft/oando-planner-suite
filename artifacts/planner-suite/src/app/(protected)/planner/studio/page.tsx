"use client";

import dynamic from "next/dynamic";
import { CanvasErrorBoundary } from "@/components/error-boundary";

const StudioPage = dynamic(() => import("@/views/planner/studio"), { ssr: false });

export default function StudioRouterPage() {
  return (
    <CanvasErrorBoundary toolName="Studio Planner">
      <StudioPage />
    </CanvasErrorBoundary>
  );
}

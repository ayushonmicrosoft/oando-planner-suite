"use client";

import dynamic from "next/dynamic";
import { CanvasErrorBoundary } from "@/components/error-boundary";

const Viewer3D = dynamic(() => import("@/views/viewer/viewer-3d"), { ssr: false });

export default function Viewer3DPage() {
  return (
    <CanvasErrorBoundary toolName="3D Viewer">
      <Viewer3D />
    </CanvasErrorBoundary>
  );
}

"use client";

import dynamic from "next/dynamic";
import { CanvasErrorBoundary } from "@/components/error-boundary";

const ImportScale = dynamic(() => import("@/views/tools/import-scale"), { ssr: false });

export default function ImportPage() {
  return (
    <CanvasErrorBoundary toolName="Import & Scale">
      <ImportScale />
    </CanvasErrorBoundary>
  );
}

"use client";

import dynamic from "next/dynamic";

const CustomShapes = dynamic(() => import("@/views/tools/custom-shapes"), { ssr: false });

export default function ShapesPage() {
  return <CustomShapes />;
}

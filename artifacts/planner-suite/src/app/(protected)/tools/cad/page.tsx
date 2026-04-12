"use client";

import dynamic from "next/dynamic";

const CadDrawing = dynamic(() => import("@/views/tools/cad-drawing"), { ssr: false });

export default function CadPage() {
  return <CadDrawing />;
}

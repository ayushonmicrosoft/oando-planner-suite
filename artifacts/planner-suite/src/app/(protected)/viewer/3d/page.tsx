"use client";

import dynamic from "next/dynamic";

const Viewer3D = dynamic(() => import("@/views/viewer/viewer-3d"), { ssr: false });

export default function Viewer3DPage() {
  return <Viewer3D />;
}

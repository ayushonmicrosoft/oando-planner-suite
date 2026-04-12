"use client";

import dynamic from "next/dynamic";

const CanvasPlanner = dynamic(() => import("@/views/planner/canvas"), { ssr: false });

export default function CanvasPage() {
  return <CanvasPlanner />;
}

"use client";

import dynamic from "next/dynamic";

const FloorPlanCreator = dynamic(() => import("@/views/tools/floor-plan-creator"), { ssr: false });

export default function FloorPlanPage() {
  return <FloorPlanCreator />;
}

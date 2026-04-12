"use client";

import dynamic from "next/dynamic";

const BlueprintPlanner = dynamic(() => import("@/views/planner/blueprint"), { ssr: false });

export default function BlueprintPage() {
  return <BlueprintPlanner />;
}

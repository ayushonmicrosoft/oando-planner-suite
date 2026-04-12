"use client";

import dynamic from "next/dynamic";

const StudioPage = dynamic(() => import("@/views/planner/studio"), { ssr: false });

export default function StudioRouterPage() {
  return <StudioPage />;
}

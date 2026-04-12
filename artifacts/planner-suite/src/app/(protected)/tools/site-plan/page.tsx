"use client";

import dynamic from "next/dynamic";

const SitePlan = dynamic(() => import("@/views/tools/site-plan"), { ssr: false });

export default function SitePlanPage() {
  return <SitePlan />;
}

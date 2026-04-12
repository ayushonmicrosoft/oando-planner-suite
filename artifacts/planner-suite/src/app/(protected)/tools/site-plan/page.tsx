"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const SitePlan = dynamic(() => import("@/views/tools/site-plan"), { ssr: false });

export default function SitePlanPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <SitePlan />
    </Suspense>
  );
}

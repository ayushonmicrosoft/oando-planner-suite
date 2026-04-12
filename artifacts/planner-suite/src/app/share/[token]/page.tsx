"use client";

import dynamic from "next/dynamic";
import { use } from "react";

const SharedPlanView = dynamic(() => import("@/views/shared-plan"), { ssr: false });

export default function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  return <SharedPlanView token={token} />;
}

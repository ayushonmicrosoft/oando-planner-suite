"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FloorPlanPage() {
  const router = useRouter();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    router.replace(id ? `/planner/canvas?id=${id}` : "/planner/canvas");
  }, [router]);
  return null;
}

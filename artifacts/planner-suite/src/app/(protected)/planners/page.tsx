"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PlannersPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/planner/canvas");
  }, [router]);
  return null;
}

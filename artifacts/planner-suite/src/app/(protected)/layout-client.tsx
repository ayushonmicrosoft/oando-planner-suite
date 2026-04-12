"use client";

import { AppLayout } from "@/components/layout";

export function ProtectedLayoutClient({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}

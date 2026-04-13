"use client";

import { AppLayout } from "@/components/layout";
import { ErrorBoundary } from "@/components/error-boundary";

export function ProtectedLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <AppLayout>
      <ErrorBoundary fallbackTitle="This page encountered an error">
        {children}
      </ErrorBoundary>
    </AppLayout>
  );
}

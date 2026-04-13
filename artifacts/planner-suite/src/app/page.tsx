"use client";

import { useAuth } from "@/hooks/use-auth";
import Landing from "@/views/landing";
import Home from "@/views/home";
import { Loader2 } from "lucide-react";

export default function RootPage() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <>
        <h1 className="sr-only">One&amp;Only — Office Planner &amp; Workspace Design Tool</h1>
        <main className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </>
    );
  }

  if (isSignedIn) {
    return <Home />;
  }

  return <Landing />;
}

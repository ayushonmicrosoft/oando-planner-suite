"use client";

import { useUser } from "@clerk/nextjs";
import Landing from "@/views/landing";
import Home from "@/views/home";
import { Loader2 } from "lucide-react";

export default function RootPage() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isSignedIn) {
    return <Home />;
  }

  return <Landing />;
}

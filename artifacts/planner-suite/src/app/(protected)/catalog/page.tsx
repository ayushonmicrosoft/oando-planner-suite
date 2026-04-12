"use client";

import { Suspense } from "react";
import Catalog from "@/views/catalog";
import { Loader2 } from "lucide-react";

function CatalogFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<CatalogFallback />}>
      <Catalog />
    </Suspense>
  );
}

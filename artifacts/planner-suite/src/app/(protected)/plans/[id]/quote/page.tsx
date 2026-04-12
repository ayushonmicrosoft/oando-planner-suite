"use client";

import dynamic from "next/dynamic";

const QuoteBuilder = dynamic(() => import("@/views/quote-builder"), { ssr: false });

export default function QuotePage() {
  return <QuoteBuilder />;
}

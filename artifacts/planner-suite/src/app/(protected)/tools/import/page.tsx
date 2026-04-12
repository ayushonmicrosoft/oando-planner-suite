"use client";

import dynamic from "next/dynamic";

const ImportScale = dynamic(() => import("@/views/tools/import-scale"), { ssr: false });

export default function ImportPage() {
  return <ImportScale />;
}

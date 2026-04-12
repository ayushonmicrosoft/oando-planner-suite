import type { Metadata } from "next";
import { ProtectedLayoutClient } from "./layout-client";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedLayoutClient>{children}</ProtectedLayoutClient>;
}

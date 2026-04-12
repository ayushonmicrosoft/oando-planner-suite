import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "./providers";
import "../index.css";

export const metadata: Metadata = {
  title: "One&Only | Work. Space. Performance.",
  description: "Plan, design, and visualize your workspace with our comprehensive suite of planning tools.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}

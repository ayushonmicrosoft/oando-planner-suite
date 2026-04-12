import type { Metadata } from "next";

const SITE_URL = "https://oando.co.in";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your One&Only account to access your workspace plans, floor plans, and office design tools.",
  openGraph: {
    title: "Sign In | One&Only",
    description:
      "Sign in to your One&Only account to access your workspace plans and office design tools.",
    url: `${SITE_URL}/sign-in`,
    images: [
      {
        url: "/opengraph.jpg",
        width: 1200,
        height: 630,
        alt: "One&Only - Sign In",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign In | One&Only",
    description:
      "Sign in to your One&Only account to access your workspace plans and office design tools.",
    images: ["/opengraph.jpg"],
  },
  alternates: {
    canonical: `${SITE_URL}/sign-in`,
  },
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

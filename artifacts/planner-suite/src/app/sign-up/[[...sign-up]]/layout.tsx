import type { Metadata } from "next";

const SITE_URL = "https://oando.co.in";

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create your free One&Only account and start planning your ideal workspace. Access floor plans, 3D visualization, and office design tools.",
  openGraph: {
    title: "Sign Up | One&Only",
    description:
      "Create your free One&Only account and start planning your ideal workspace with professional design tools.",
    url: `${SITE_URL}/sign-up`,
    images: [
      {
        url: "/opengraph.jpg",
        width: 1200,
        height: 630,
        alt: "One&Only - Sign Up",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign Up | One&Only",
    description:
      "Create your free One&Only account and start planning your ideal workspace with professional design tools.",
    images: ["/opengraph.jpg"],
  },
  alternates: {
    canonical: `${SITE_URL}/sign-up`,
  },
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import "../index.css";

const SITE_URL = "https://oando.co.in";
const SITE_NAME = "One&Only";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B1324",
};

export const metadata: Metadata = {
  title: {
    default: "One&Only | Office Planner & Workspace Design Tool India",
    template: "%s | One&Only",
  },
  description:
    "Plan, design, and visualize your office space with One&Only — India's office furniture planning software with 2D canvas, blueprints, and 3D viewer.",
  keywords: [
    "office planner",
    "workspace design tool",
    "office furniture planning software",
    "office layout tool India",
    "office space planner",
    "floor plan creator",
    "office interior design tool",
    "workspace planning software India",
    "2D office planner",
    "3D office viewer",
    "office furniture layout",
    "commercial space planning",
  ],
  authors: [{ name: "One&Only Office Furniture Pvt. Ltd.", url: SITE_URL }],
  creator: "One&Only Office Furniture Pvt. Ltd.",
  publisher: "One&Only Office Furniture Pvt. Ltd.",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "One&Only | Office Planner & Workspace Design Tool India",
    description:
      "Plan, design, and visualize your office space with One&Only — India's leading office furniture planning software. 2D canvas, blueprint wizard, CAD drawing, floor plans, and 3D viewer.",
    images: [
      {
        url: "/opengraph.jpg",
        width: 1200,
        height: 630,
        alt: "One&Only Office Planner — Workspace Design Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "One&Only | Office Planner & Workspace Design Tool India",
    description:
      "Plan, design, and visualize your office space with One&Only — India's leading office furniture planning software.",
    images: ["/opengraph.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
  },
  category: "Technology",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description:
        "India's leading office furniture planning software — plan, design, and visualize your workspace.",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-IN",
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "One&Only Office Furniture Pvt. Ltd.",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo-v2-white.webp`,
        width: 200,
        height: 50,
      },
      sameAs: [],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        availableLanguage: ["English", "Hindi"],
        areaServed: "IN",
      },
      address: {
        "@type": "PostalAddress",
        addressCountry: "IN",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE_URL}/#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Catalog",
          item: `${SITE_URL}/catalog`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Templates",
          item: `${SITE_URL}/templates`,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "Floor Plan Creator",
          item: `${SITE_URL}/tools/floor-plan`,
        },
        {
          "@type": "ListItem",
          position: 5,
          name: "CAD Drawing",
          item: `${SITE_URL}/tools/cad`,
        },
        {
          "@type": "ListItem",
          position: 6,
          name: "Site Plans",
          item: `${SITE_URL}/tools/site-plan`,
        },
        {
          "@type": "ListItem",
          position: 7,
          name: "3D Viewer",
          item: `${SITE_URL}/viewer/3d`,
        },
        {
          "@type": "ListItem",
          position: 8,
          name: "About",
          item: `${SITE_URL}/about`,
        },
        {
          "@type": "ListItem",
          position: 9,
          name: "Contact",
          item: `${SITE_URL}/contact`,
        },
      ],
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#application`,
      name: "One&Only Office Planner",
      applicationCategory: "DesignApplication",
      operatingSystem: "Web",
      url: SITE_URL,
      description:
        "Office planner and workspace design tool with 2D canvas, blueprint wizard, CAD drawing, floor plan creator, site plan designer, and 3D viewer.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
        description: "Free to start, no credit card required",
      },
      featureList: [
        "2D Canvas Planner",
        "Blueprint Wizard",
        "CAD Drawing",
        "Floor Plan Creator",
        "Custom Shapes",
        "Site Plan Designer",
        "Import & Scale",
        "3D Viewer",
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "120",
        bestRating: "5",
        worstRating: "1",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded focus:text-sm focus:font-medium">
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

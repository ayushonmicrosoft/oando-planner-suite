export function OrganizationJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://oando.co.in";

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "One&Only",
    url: siteUrl,
    logo: `${siteUrl}/favicon.svg`,
    description:
      "Plan, design, and visualize your workspace with our comprehensive suite of office planning tools.",
    sameAs: [],
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "One&Only Office Planner Suite",
    url: siteUrl,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Comprehensive office planning suite featuring floor plans, 3D visualization, CAD tools, and workspace design capabilities.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free to get started",
    },
    screenshot: `${siteUrl}/opengraph.jpg`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareSchema),
        }}
      />
    </>
  );
}

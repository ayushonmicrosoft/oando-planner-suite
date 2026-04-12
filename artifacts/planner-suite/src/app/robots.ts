import type { MetadataRoute } from "next";

const SITE_URL = "https://oando.co.in";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/sign-in", "/sign-up"],
        disallow: [
          "/planner/",
          "/plans/",
          "/catalog/",
          "/templates/",
          "/tools/",
          "/viewer/",
          "/planners/",
          "/api/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

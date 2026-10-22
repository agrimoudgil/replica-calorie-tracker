import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/** Search engines may read the public pages; everything behind sign-in and the APIs stays out. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/welcome", "/privacy", "/terms", "/sign-in"],
        disallow: ["/api/", "/auth/", "/log", "/meals/", "/insights", "/profile", "/progress", "/coach", "/onboarding", "/recipes", "/design"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}

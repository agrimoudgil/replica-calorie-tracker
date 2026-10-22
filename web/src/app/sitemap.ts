import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/** The public pages only. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE.url}/welcome`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/sign-in`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/privacy`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE.url}/terms`, changeFrequency: "monthly", priority: 0.3 },
  ];
}

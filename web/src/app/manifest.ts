import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/** "Add to Home Screen": Oswald's name, icon and colours ("Neel" palette: bg and accent in tokens.css). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.name,
    description: "Count calories the way India eats. Free, with no paywall and no ads.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4338ca",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

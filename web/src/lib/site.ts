/** The app's public identity: the name in titles, and who runs it on the privacy page. */
export const SITE = {
  name: "Oswald",
  operator: "Agrim Moudgil",
  contactEmail: "agrim.moudgil06@gmail.com",
  /** The share picture drawn by app/opengraph-image.tsx. */
  shareImage: { url: "/opengraph-image", width: 1200, height: 630, alt: "Oswald: count calories the way India eats" },
  /** When the privacy policy last changed (shown on the page). */
  privacyUpdated: "19 October 2026",
} as const;

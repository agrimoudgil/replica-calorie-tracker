import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

/*
 * The picture shown when someone shares Oswald's link (WhatsApp, X, LinkedIn...).
 * Drawn at build time, so it costs nothing to serve. Colours are the "Neel" palette
 * (accent and on-accent in tokens.css); CSS variables don't reach this renderer.
 */
export const alt = SITE.shareImage.alt;
export const size = { width: SITE.shareImage.width, height: SITE.shareImage.height };
export const contentType = "image/png";

const ring = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="17" fill="none" stroke="#ffffff" stroke-opacity=".3" stroke-width="7"/><path d="M32 15a17 17 0 1 1-17 17" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/></svg>',
)}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 80, background: "#4338ca", color: "#ffffff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- rendered to a PNG, not a page */}
          <img src={ring} width={104} height={104} alt="" />
          <div style={{ fontSize: 64, fontWeight: 700 }}>{SITE.name}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Lines broken on purpose, so no word is left alone on a line. */}
          <div style={{ display: "flex", flexDirection: "column", fontSize: 80, fontWeight: 700, lineHeight: 1.1 }}>
            <span>Track what you eat.</span>
            <span>That&apos;s it.</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 36, opacity: 0.88 }}>
            <span>Free calorie tracker for Indian meals.</span>
            <span>No paywall, no sales calls.</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}

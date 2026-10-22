import type { NextConfig } from "next";

/*
 * Security headers on every response (HTTPS and HSTS already come from Vercel).
 * No full Content-Security-Policy yet: Next's inline scripts would need nonces. The
 * policy below only limits what's safe to limit without that: framing, base and forms.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Camera and microphone stay possible for the app itself (photo and voice logging); the rest is off.
  { key: "Permissions-Policy", value: "camera=(self), microphone=(self), geolocation=(), payment=(), usb=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;

import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import { cookies } from "next/headers";
import { ToastProvider } from "@/components/ui/overlays";
import { SITE } from "@/lib/site";
import { THEME_COOKIE, parseTheme, themeAttribute } from "@/lib/theme";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const devanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: { default: SITE.name, template: `%s · ${SITE.name}` },
  description: "Count calories the way India eats. Type what you ate and see calories and every macro. Free, with no paywall and no ads.",
  // Lets shared links (and the share image) resolve to the live address.
  metadataBase: new URL("https://oswald-calorie-tracker.vercel.app"),
  openGraph: { siteName: SITE.name, type: "website", images: [SITE.shareImage] },
  twitter: { card: "summary_large_image", images: [SITE.shareImage] },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // The phone browser's bar matches the page ("Neel" bg tokens, light and dark).
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1016" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Light / Dark / Auto from Profile. Set here, so the first paint already has the right colours.
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);
  return (
    <html lang="en-IN" data-theme={themeAttribute(theme)} className={`${inter.variable} ${devanagari.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg font-sans text-fg">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

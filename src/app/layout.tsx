import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import AnchorScrollControl from "@/components/AnchorScrollControl";
import "./globals.css";

const sans = localFont({ src: "../../public/fonts/geist/GeistSans-Variable.woff2", weight: "100 900", variable: "--font-geist-sans", display: "swap" });
const serif = localFont({ src: "../../public/fonts/geist/GeistSerif-Regular.woff2", weight: "400", variable: "--font-geist-serif", display: "swap", fallback: ["Georgia", "serif"], adjustFontFallback: "Times New Roman" });
const mono = localFont({ src: "../../public/fonts/geist/GeistMono-Variable.woff2", weight: "100 900", variable: "--font-geist-mono", display: "swap", fallback: ["monospace"], adjustFontFallback: false });
const pixel = localFont({ src: "../../public/fonts/geist/GeistPixel-Square.woff2", weight: "400", variable: "--font-geist-pixel", display: "swap", fallback: ["monospace"], adjustFontFallback: false });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  // The homepage uses the same mandarin palette in both system appearances.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e95b30" },
    { media: "(prefers-color-scheme: dark)", color: "#e95b30" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://thimofej.de"),
  applicationName: "Thimofej Zapko",
  title: "Thimofej Zapko | AI engineer & frontend developer",
  description: "The personal website of Thimofej Zapko, an AI engineer and frontend developer working at yesterday.",
  authors: [{ name: "Thimofej Zapko", url: "https://thimofej.de" }],
  creator: "Thimofej Zapko",
  verification: {
    google: "b4v_POieUJdwiI53LDUv05w6yspsM4EVl4pwB6HR134",
  },
  openGraph: {
    type: "website",
    siteName: "Thimofej Zapko",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@thimorrowr",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = (await headers()).get("x-site-locale") === "de" ? "de" : "en";
  return (
    <html lang={locale} className={`${sans.variable} ${serif.variable} ${mono.variable} ${pixel.variable}`}>
      <body>
        {children}
        <AnchorScrollControl />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

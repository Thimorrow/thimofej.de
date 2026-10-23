import type { Metadata, Viewport } from "next";
import { Fraunces, Spectral, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], axes: ["opsz"], variable: "--font-fraunces", display: "swap" });
const spectral = Spectral({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-spectral", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-ibm-plex-mono", display: "swap" });

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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={`${fraunces.variable} ${spectral.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}

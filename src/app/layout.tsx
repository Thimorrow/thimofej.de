import type { Metadata } from "next";
import { Fraunces, Spectral, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { SkipLink } from "@/components/SkipLink";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { CanvasMount } from "@/components/canvas/CanvasMount";
import { SoundToggle } from "@/components/SoundToggle";
import { InteractionSound } from "@/components/InteractionSound";
import { AliBabaEasterEgg } from "@/components/AliBabaEasterEgg";
import { EnterGate } from "@/components/EnterGate";

const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const spectral = Spectral({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-spectral",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thimofej.de"),
  title: "Thimofej Zapko",
  description:
    "Thimofej Zapko. 15, selbst beigebracht. Ich baue Sachen, und das hier ist der Mensch dahinter.",
  openGraph: {
    title: "Thimofej Zapko",
    description: "Ich baue Sachen, und das hier ist der Mensch dahinter.",
    url: "https://thimofej.de",
    siteName: "thimofej.de",
    locale: "de_DE",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="de"
      className={`${fraunces.variable} ${spectral.variable} ${ibmPlexMono.variable} antialiased`}
    >
      <body className="min-h-dvh">
        <EnterGate />
        <CanvasMount />
        <SmoothScrollProvider>
          <SkipLink />
          <SiteNav />
          {children}
          <SiteFooter />
        </SmoothScrollProvider>
        <SoundToggle />
        <InteractionSound />
        <AliBabaEasterEgg />
      </body>
    </html>
  );
}

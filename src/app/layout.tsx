import type { Metadata } from "next";
import { Fraunces, Spectral, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { SkipLink } from "@/components/SkipLink";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { CanvasMount } from "@/components/canvas/CanvasMount";
import { SoundToggle } from "@/components/SoundToggle";
import { ReplayIntro } from "@/components/ReplayIntro";
import { InteractionSound } from "@/components/InteractionSound";
import { AliBabaEasterEgg } from "@/components/AliBabaEasterEgg";
import { EnterGate } from "@/components/EnterGate";
import { FlightCinema } from "@/components/FlightCinema";

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
    "Thimofej Zapko. 15, self-taught. I build things, and this is the human behind them.",
  openGraph: {
    title: "Thimofej Zapko",
    description: "I build things, and this is the human behind them.",
    url: "https://thimofej.de",
    siteName: "thimofej.de",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
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
        {/* Cinematic fade: content surfaces at the bottom and dissolves at the
            top in a soft blur (Star Wars vibe). Follows the viewport, fades out
            with the rest of the chrome during the intro flight. */}
        <div
          aria-hidden
          data-intro-hide
          className="pointer-events-none fixed inset-x-0 top-0 z-30 h-32 bg-gradient-to-b from-void via-void/70 to-transparent backdrop-blur-[3px] [mask-image:linear-gradient(to_bottom,black,transparent)] sm:h-52"
        />
        <div
          aria-hidden
          data-intro-hide
          className="pointer-events-none fixed inset-x-0 bottom-0 z-30 h-32 bg-gradient-to-t from-void via-void/70 to-transparent backdrop-blur-[3px] [mask-image:linear-gradient(to_top,black,transparent)] sm:h-52"
        />
        <FlightCinema />
        <SoundToggle />
        <ReplayIntro />
        <InteractionSound />
        <AliBabaEasterEgg />
      </body>
    </html>
  );
}

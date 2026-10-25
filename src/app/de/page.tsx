import type { Metadata } from "next";
import { HomeContent } from "@/components/orbit-preview/HomeContent";

export const metadata: Metadata = {
  description: "Thimofej Zapko, auch Thimorrow. Ich entwickle Frontends und arbeite mit dem Team von yesterday an der Academy.",
  alternates: { canonical: "/de", languages: { de: "/de", en: "/", "x-default": "/" } },
  openGraph: {
    type: "website",
    siteName: "Thimofej Zapko",
    locale: "de_DE",
    url: "/de",
    images: [{ url: "/opengraph-image.png?v=20261025", width: 1200, height: 630, alt: "Thimofej Zapko. AI engineer & frontend developer." }],
  },
};

export default function Home() {
  return <HomeContent locale="de" />;
}

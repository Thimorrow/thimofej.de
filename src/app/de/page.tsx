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
  },
};

export default function Home() {
  return <HomeContent locale="de" />;
}

import type { Metadata } from "next";
import { OrbitHome } from "@/components/orbit-preview/OrbitHome";

export const metadata: Metadata = {
  description: "Thimofej Zapko, auch Thimorrow. Ich entwickle Frontends und arbeite mit dem Team von yesterday an der Academy.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Thimofej Zapko",
    locale: "de_DE",
    url: "/",
  },
};

const profile = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://thimofej.de/#website",
      url: "https://thimofej.de/",
      name: "Thimofej Zapko",
      alternateName: ["Thimofej", "Thimorrow", "thimofej.de"],
      publisher: { "@id": "https://thimofej.de/#person" },
    },
    {
      "@type": "ProfilePage",
      "@id": "https://thimofej.de/#profile",
      url: "https://thimofej.de/",
      name: "Thimofej Zapko | AI engineer & frontend developer",
      isPartOf: { "@id": "https://thimofej.de/#website" },
      mainEntity: { "@id": "https://thimofej.de/#person" },
    },
    {
      "@type": "Person",
      "@id": "https://thimofej.de/#person",
      name: "Thimofej Zapko",
      givenName: "Thimofej",
      familyName: "Zapko",
      alternateName: ["Thimofej", "Thimorrow"],
      url: "https://thimofej.de/",
      jobTitle: "AI engineer & frontend developer",
      description: "Thimofej Zapko builds frontend experiences with AI and works as a frontend developer at yesterday.",
      sameAs: [
        "https://github.com/thimorrow",
        "https://x.com/thimorrowr",
        "https://www.instagram.com/thimofej_zapko/",
      ],
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(profile).replace(/</g, "\\u003c"),
        }}
      />
      <OrbitHome />
    </>
  );
}

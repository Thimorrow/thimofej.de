import type { Metadata } from "next";
import AcademyProject from "@/app/projects/academy/AcademyProject";

export const metadata: Metadata = {
  title: "yesterday Academy | Thimofej Zapko",
  description: "Mein Frontend-Beitrag zur yesterday Academy: vom Missionskatalog über den Chat bis zum Ergebnis. Ein Teamprojekt mit einer automatisch laufenden Produktdemo.",
  alternates: { canonical: "/de/projects/academy", languages: { de: "/de/projects/academy", en: "/projects/academy", "x-default": "/projects/academy" } },
  openGraph: { locale: "de_DE", url: "/de/projects/academy", images: [{ url: "/opengraph-image.png?v=20261025", width: 1200, height: 630, alt: "Thimofej Zapko. AI engineer & frontend developer." }] },
};

export default function AcademyProjectPage() {
  return <AcademyProject locale="de" />;
}

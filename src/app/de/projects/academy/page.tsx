import type { Metadata } from "next";
import AcademyProject from "@/app/projects/academy/AcademyProject";

export const metadata: Metadata = {
  title: "yesterday Academy | Thimofej Zapko",
  description: "Mein Frontend-Beitrag zur yesterday Academy: vom Missionskatalog über den Chat bis zum Ergebnis. Ein Teamprojekt mit einer automatisch laufenden Produktdemo.",
  alternates: { canonical: "/de/projects/academy", languages: { de: "/de/projects/academy", en: "/projects/academy", "x-default": "/projects/academy" } },
  openGraph: { locale: "de_DE", url: "/de/projects/academy" },
};

export default function AcademyProjectPage() {
  return <AcademyProject locale="de" />;
}

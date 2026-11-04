import type { Metadata } from "next";
import { TypeLab } from "@/components/type-lab/TypeLab";
export const metadata: Metadata = { title: "Schriftlabor · Thimofej", description: "Räumliche Schrift und interaktive Wellen mit Three.js.", robots: { index:false,follow:false } };
export default function TypeLabPage() { return <TypeLab />; }

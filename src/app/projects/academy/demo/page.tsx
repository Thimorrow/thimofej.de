import type { Metadata } from "next";
import Link from "next/link";
import AcademyDemo from "@/components/academy/AcademyDemo";
import "../academy-project.css";

export const metadata: Metadata = {
  title: "Academy interactive demo | Thimofej Zapko",
  description: "Try three sample Academy missions: chat with Tomo, follow your progress and take your own result with you.",
  alternates: { canonical: "/projects/academy/demo" },
};

export default function AcademyDemoPage() {
  return <main className="academy-standalone"><header className="academy-demo-page-header"><Link href="/projects/academy">← Back to the project</Link><a href="https://academy.yesterday-ai.de/" target="_blank" rel="noopener noreferrer">Academy website ↗<span className="academy-sr"> (opens in a new tab)</span></a></header><h1 className="academy-sr">Try the yesterday Academy demo</h1><AcademyDemo /></main>;
}

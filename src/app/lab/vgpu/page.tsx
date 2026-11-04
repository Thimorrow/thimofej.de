import type { Metadata } from "next";
import { ParticleLab } from "@/components/lab/ParticleLab";

export const metadata: Metadata = {
  title: "TZ particle lab · Three.js",
  description: "An interactive Three.js / WebGL particle study.",
  robots: { index: false, follow: false },
};

export default function ParticleLabPage() {
  return <ParticleLab />;
}

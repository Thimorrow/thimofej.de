import type { Metadata } from "next";
import { ParticleLab } from "@/components/lab/ParticleLab";

export const metadata: Metadata = {
  title: "TZ particle lab · vgpu experiment",
  description: "A local comparison of vgpu / WebGPU and Three.js particles.",
  robots: { index: false, follow: false },
};

export default function VgpuLabPage() {
  return <ParticleLab />;
}

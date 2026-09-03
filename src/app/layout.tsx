import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thimorrow — Creative developer",
  description: "Thimorrow makes thoughtful websites, interfaces, and small digital tools.",
  openGraph: { title: "Thimorrow — Creative developer", description: "Thoughtful things for the web.", type: "website" },
};

export const viewport: Viewport = { themeColor: "#101110", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="de" className="bg-background"><body>{children}</body></html>;
}

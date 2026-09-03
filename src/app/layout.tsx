import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thimorrow — Independent designer / developer",
  description: "The personal website of Thimorrow — making digital things with intention.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className="bg-background">
      <body>{children}</body>
    </html>
  );
}

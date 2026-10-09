import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://thimofej.de"),
  applicationName: "Thimorrow",
  title: "Thimofej Zapko | AI engineer & frontend developer",
  description: "The personal website of Thimofej Zapko, an AI engineer and frontend developer working at yesterday.",
  openGraph: {
    type: "website",
    siteName: "Thimorrow",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} bg-background`}>
      <body>{children}</body>
    </html>
  );
}

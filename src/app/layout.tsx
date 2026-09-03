import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thimofej Zapko — AI engineer & frontend developer",
  description: "The personal website of Thimofej Zapko, an AI engineer and frontend developer working at yesterday.",
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

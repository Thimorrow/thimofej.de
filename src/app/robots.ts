import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://thimofej.de/sitemap.xml",
    host: "https://thimofej.de",
  };
}

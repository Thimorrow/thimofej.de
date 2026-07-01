import type { MetadataRoute } from "next";

const BASE_URL = "https://thimofej.de";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: BASE_URL,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/writing`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}

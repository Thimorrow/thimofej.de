import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://thimofej.de/" },
    { url: "https://thimofej.de/projects/academy" },
  ]
}

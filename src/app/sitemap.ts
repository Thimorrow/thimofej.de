import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://thimofej.de", lastModified: new Date() },
    { url: "https://thimofej.de/projects/academy", lastModified: new Date() },
  ]
}

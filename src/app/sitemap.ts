import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/projects/academy"].flatMap(path => {
    const languages = { de: `https://thimofej.de/de${path}`, en: `https://thimofej.de${path || "/"}` };
    return Object.values(languages).map(url => ({ url, alternates: { languages } }));
  });
}

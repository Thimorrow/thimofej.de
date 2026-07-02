import type { MetadataRoute } from "next";
import { posts, getPost } from "@/lib/posts";

const BASE_URL = "https://thimofej.de";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => {
    const alt = getPost(post.altSlug);
    const enSlug = post.lang === "en" ? post.slug : alt?.slug;
    const deSlug = post.lang === "de" ? post.slug : alt?.slug;

    return {
      url: `${BASE_URL}/writing/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: {
          ...(enSlug ? { en: `${BASE_URL}/writing/${enSlug}` } : {}),
          ...(deSlug ? { de: `${BASE_URL}/writing/${deSlug}` } : {}),
        },
      },
    };
  });

  return [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/writing`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...postEntries,
  ];
}

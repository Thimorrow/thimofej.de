import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, allSlugs } from "@/lib/posts";

const SITE = "https://thimofej.de";

export function generateStaticParams() {
  return allSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  const alt = getPost(post.altSlug);
  const enSlug = post.lang === "en" ? post.slug : alt?.slug;
  const deSlug = post.lang === "de" ? post.slug : alt?.slug;
  const url = `/writing/${post.slug}`;

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: url,
      // hreflang pair so Google serves the right language and never treats the
      // two versions as duplicate content. x-default points at English.
      languages: {
        en: enSlug ? `/writing/${enSlug}` : url,
        de: deSlug ? `/writing/${deSlug}` : url,
        "x-default": enSlug ? `/writing/${enSlug}` : url,
      },
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `${SITE}${url}`,
      publishedTime: post.date,
      locale: post.lang === "de" ? "de_DE" : "en_US",
    },
  };
}

export default async function WritingPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const blogPostingLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: post.lang,
    url: `${SITE}/writing/${post.slug}`,
    image: `${SITE}/opengraph-image`,
    author: { "@type": "Person", name: "Thimofej Zapko", url: SITE },
    publisher: { "@type": "Person", name: "Thimofej Zapko", url: SITE },
    mainEntityOfPage: `${SITE}/writing/${post.slug}`,
  };

  return (
    <main
      id="main"
      className="relative mx-auto min-h-dvh max-w-3xl bg-void/70 backdrop-blur-[2px] px-6 pb-32 pt-40"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingLd) }}
      />
      <Link
        href="/writing"
        className="font-mono text-xs uppercase tracking-widest text-text-meta transition-colors hover:text-accent"
      >
        ← Writing
      </Link>
      <article lang={post.lang} className="mt-8">
        <time
          dateTime={post.date}
          className="font-mono text-xs uppercase tracking-[0.25em] text-text-meta"
        >
          {new Date(post.date).toLocaleDateString(
            post.lang === "de" ? "de-DE" : "en-US",
            { year: "numeric", month: "long", day: "numeric" },
          )}
        </time>
        <h1 className="mt-4 font-display text-4xl font-light leading-tight sm:text-5xl">
          {post.title}
        </h1>
        <div className="mt-8 space-y-6 text-lg leading-relaxed text-text-muted">
          {post.body.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </article>
    </main>
  );
}

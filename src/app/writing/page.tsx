import type { Metadata } from "next";
import Link from "next/link";
import { posts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Notes on building, AI agents, faith, and figuring out life one piece at a time. By Thimofej Zapko.",
};

export default function WritingIndex() {
  const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <main
      id="main"
      className="relative mx-auto min-h-dvh max-w-3xl bg-void/70 backdrop-blur-[2px] px-6 pb-32 pt-40"
    >
      <Link
        href="/"
        className="font-mono text-xs uppercase tracking-widest text-text-meta transition-colors hover:text-accent"
      >
        ← Home
      </Link>
      <h1 className="mt-8 font-display text-5xl font-light">Writing</h1>
      <p className="mt-6 text-lg leading-relaxed text-text-muted">
        Notes on building, AI, faith, and figuring out life one piece at a time.
      </p>

      <div className="mt-14 border-t border-line/10">
        {sorted.map((post) => (
          <Link
            key={post.slug}
            href={`/writing/${post.slug}`}
            className="group block border-b border-line/10 py-8"
          >
            <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
              <span>{post.lang}</span>
              <span className="text-text-meta">
                {new Date(post.date).toLocaleDateString(
                  post.lang === "de" ? "de-DE" : "en-US",
                  { year: "numeric", month: "short", day: "numeric" },
                )}
              </span>
            </div>
            <p className="mt-3 font-display text-2xl text-text transition-colors group-hover:text-accent">
              {post.title}
            </p>
            <p className="mt-2 text-base text-text-muted">{post.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}

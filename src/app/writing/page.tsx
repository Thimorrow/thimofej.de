import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Writing | Thimofej Zapko",
  description: "Notes on design, software, and building frontend with AI.",
}

export default function Writing() {
  return <main className="page-wrap detail-page"><header className="site-header detail-header"><Link className="name" href="/">Thimorrow<span className="name-dot">.</span></Link><Link className="back-link" href="/">Back home</Link></header><article className="detail-content"><p className="eyebrow">Writing / Notes & thoughts</p><h1>Ideas, observations, and things I&apos;m still figuring out.</h1><p className="detail-lede">Occasional notes about design, software, and making things with care.</p><div className="detail-body"><p>Coming soon: Building frontend with AI.</p><p>No articles published yet.</p></div></article><footer className="site-footer"><Link className="inline-link" href="/">← Home</Link><span>Writing</span></footer></main>
}

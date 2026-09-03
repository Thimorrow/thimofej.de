import Link from "next/link"

const notes = [{ title: "A note on making things", text: "Thoughts on taste, detail, and the web.", date: "May 2026" }, { title: "The quiet interface", text: "Why less can make a product feel more human.", date: "Feb 2026" }]

export default function Writing() {
  return <main className="page-wrap detail-page"><header className="site-header detail-header"><Link className="name" href="/">Thimorrow<span className="name-dot">.</span></Link><Link className="back-link" href="/">Back home</Link></header><article className="detail-content"><p className="eyebrow">Writing / Notes & thoughts</p><h1>Ideas, observations, and things I&apos;m still figuring out.</h1><p className="detail-lede">Occasional notes about design, software, and making things with care.</p><div className="note-list">{notes.map((note) => <a className="note-link" href="#" key={note.title}><span><strong>{note.title}</strong><small>{note.text}</small></span><time>{note.date}</time></a>)}</div></article><footer className="site-footer"><Link className="inline-link" href="/">← Home</Link><span>Writing</span></footer></main>
}

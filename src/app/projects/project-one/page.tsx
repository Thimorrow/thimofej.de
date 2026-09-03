import Link from "next/link"

export default function ProjectOne() {
  return (
    <main className="page-wrap detail-page">
      <header className="site-header detail-header"><Link className="name" href="/">Thimorrow<span className="name-dot">.</span></Link><Link className="back-link" href="/">Back home</Link></header>
      <article className="detail-content">
        <p className="eyebrow">Selected work / 2026</p>
        <h1>Academy app for yesterday.</h1>
        <p className="detail-lede">A learning platform I&apos;m building as a frontend developer at yesterday, focused on making AI education clear and approachable.</p>
        <div className="detail-meta"><span>Role<br /><strong>Frontend developer</strong></span><span>Stack<br /><strong>SvelteKit</strong></span><span>Status<br /><strong>In progress</strong></span></div>
        <div className="detail-body"><p>I&apos;m working with the team at yesterday on an Academy app that brings learning content and practical AI knowledge into one focused experience.</p><p>The app is currently in development. More details and a link will follow soon.</p></div>
      </article>
      <footer className="site-footer"><Link className="inline-link" href="/">← All work</Link><span>Project one</span></footer>
    </main>
  )
}

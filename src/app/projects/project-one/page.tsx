import Link from "next/link"

export default function ProjectOne() {
  return (
    <main className="page-wrap detail-page">
      <header className="site-header detail-header"><Link className="name" href="/">Thimorrow<span className="name-dot">.</span></Link><Link className="back-link" href="/">Back home</Link></header>
      <article className="detail-content">
        <p className="eyebrow">Selected work / 2026</p>
        <h1>A quiet digital tool for making ideas clearer.</h1>
        <p className="detail-lede">Project one is a small, focused product for collecting thoughts and turning them into something useful.</p>
        <div className="detail-meta"><span>Role<br /><strong>Design & development</strong></span><span>Type<br /><strong>Independent project</strong></span><span>Status<br /><strong>In progress</strong></span></div>
        <div className="detail-body"><p>The best tools do not ask for attention. They make space for the work. This project started with that simple idea: a calm place to think, arrange, and share.</p><p>Every interaction is deliberately small. The interface stays quiet until it is needed, and then gets out of the way again.</p></div>
      </article>
      <footer className="site-footer"><Link className="inline-link" href="/">← All work</Link><span>Project one</span></footer>
    </main>
  )
}

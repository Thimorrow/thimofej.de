const projects = [
  {
    title: "Studio Notes",
    type: "Writing & thinking",
    year: "2024",
    description: "A small collection of ideas about design, technology, and making things with care.",
  },
  {
    title: "North / South",
    type: "Digital product",
    year: "2023",
    description: "An independent experiment in building quieter, more considered tools for the web.",
  },
  {
    title: "Selected work",
    type: "Creative direction",
    year: "2022—24",
    description: "A selection of collaborations, identities, and interfaces made with good people.",
  },
]

const links = ["Are.na", "LinkedIn", "GitHub", "Email"]

export default function Home() {
  return (
    <main className="site-shell">
      <nav className="topbar" aria-label="Main navigation">
        <a className="wordmark" href="#top" aria-label="Home">TM<span className="wordmark-dot">.</span></a>
        <div className="nav-links">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>
        <span className="availability"><span className="status-dot" /> Available for select work</span>
      </nav>

      <section id="top" className="hero" aria-labelledby="intro-title">
        <p className="eyebrow">Independent designer / developer</p>
        <h1 id="intro-title">I make digital things<br /><em>with intention.</em></h1>
        <div className="hero-bottom">
          <p className="intro-copy">Hi, I&apos;m Thimorrow. I&apos;m a creative who cares about clarity, useful details, and work that feels like it belongs.</p>
          <a className="circle-link" href="#work" aria-label="Scroll to selected work">↓</a>
        </div>
      </section>

      <section id="about" className="about-section section-rule" aria-labelledby="about-title">
        <div className="section-label"><span>(01)</span><span id="about-title">About</span></div>
        <div className="about-content">
          <p className="large-copy">I work across identity, interface, and code — helping ideas become clear, useful, and a little more human.</p>
          <p className="body-copy">Based in Germany, working independently with people and teams who care about what they put into the world. When I&apos;m not designing, you&apos;ll usually find me reading, walking, or making notes.</p>
        </div>
      </section>

      <section id="work" className="work-section section-rule" aria-labelledby="work-title">
        <div className="section-label"><span>(02)</span><span id="work-title">Selected work</span></div>
        <div className="project-list">
          {projects.map((project) => (
            <a href="#contact" className="project-row" key={project.title}>
              <div className="project-index">↳</div>
              <div className="project-main"><h2>{project.title}</h2><p>{project.description}</p></div>
              <div className="project-type">{project.type}</div>
              <div className="project-year">{project.year}</div>
            </a>
          ))}
        </div>
      </section>

      <section id="contact" className="contact-section section-rule" aria-labelledby="contact-title">
        <div className="section-label"><span>(03)</span><span id="contact-title">Elsewhere</span></div>
        <div className="contact-content">
          <h2>Have something<br /><em>in mind?</em></h2>
          <a className="email-link" href="mailto:hello@example.com">hello@example.com <span>↗</span></a>
          <div className="social-links">{links.map((link) => <a href="#contact" key={link}>{link} <span>↗</span></a>)}</div>
        </div>
      </section>

      <footer className="footer"><span>© 2024 Thimorrow</span><span>Made with care in Germany</span><a href="#top">Back to top ↑</a></footer>
    </main>
  )
}

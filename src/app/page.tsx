
const projects = [
  { year: "26", title: "Academy app", description: "A learning platform I am building with the team at yesterday.", href: "/projects/project-one" },
]

const writing = [
  { title: "Building frontend with AI", description: "Notes from working at the intersection of interfaces, code, and AI.", href: "#writing" },
]

function LinkText({ children, href = "#" }: { children: React.ReactNode; href?: string }) {
  return <a className="inline-link" href={href}>{children}</a>
}

function List({ items }: { items: { title: string; description: string; year?: string; href: string }[] }) {
  return (
    <div className="item-list">
      {items.map((item) => (
        <a href={item.href} className="item" key={item.title}>
          <span className="item-title">{item.title}</span>
          <span className="item-description">{item.description}</span>
          {item.year && <span className="item-year">{item.year}</span>}
          <span className="item-arrow" aria-hidden="true">↗</span>
        </a>
      ))}
    </div>
  )
}

export default function Home() {
  return (
    <main className="page-wrap">
      <header className="site-header">
        <a className="name" href="#top" aria-label="Back to top">Thimorrow<span className="name-dot">.</span></a>
      </header>

      <section id="top" className="intro" aria-labelledby="intro-title">
        <p className="eyebrow">AI engineer / frontend developer</p>
        <h1 id="intro-title"><span className="avatar" aria-hidden="true">T</span> Thimofej Zapko makes frontend experiences with AI.</h1>
        <p>I&apos;m 15 and specialize in building frontend with AI. I care about clear interfaces, useful products, and turning ideas into working software.</p>
        <p>I&apos;m currently working as a frontend developer at yesterday, where I&apos;m building our Academy app with SvelteKit.</p>
        <p>The Academy app is currently in progress. A link will follow soon.</p>
      </section>

      <section id="projects" className="content-section" aria-labelledby="projects-title">
        <div className="section-heading"><h2 id="projects-title">things I&apos;ve built</h2><span>selected work</span></div>
        <List items={projects} />
      </section>

      <section id="writing" className="content-section" aria-labelledby="writing-title">
        <div className="section-heading"><h2 id="writing-title">writing</h2><span>notes &amp; thoughts</span></div>
        <List items={writing} />
      </section>

      <section className="content-section note-section" aria-labelledby="more-title">
        <div className="section-heading"><h2 id="more-title">more</h2><span>elsewhere</span></div>
        <p>You can find me on <LinkText href="https://x.com/thimorrowr">X</LinkText> and <LinkText href="https://github.com/thimorrow">GitHub</LinkText>, see more of my work in <LinkText href="#projects">my projects</LinkText>, and read more of my thinking in <LinkText href="#writing">my notes</LinkText>.</p>
      </section>

      <footer id="contact" className="site-footer">
        <p>Want to say hello? <LinkText href="mailto:hello@thimorrow.de">hello@thimorrow.de</LinkText>.</p>
        <span>© 2026 Thimorrow</span>
      </footer>
    </main>
  )
}

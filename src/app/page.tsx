
const projects = [
  { year: "26", title: "Project one", description: "A quiet digital tool for making ideas clearer.", href: "#contact" },
  { year: "25", title: "Project two", description: "An open-source experiment in thoughtful interfaces.", href: "#contact" },
  { year: "24", title: "Project three", description: "A small collection of work, notes, and useful things.", href: "#contact" },
]

const writing = [
  { title: "A note on making things", description: "Thoughts on taste, detail, and the web.", href: "#contact" },
  { title: "The quiet interface", description: "Why less can make a product feel more human.", href: "#contact" },
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
        <p className="eyebrow">Independent / Germany</p>
        <h1 id="intro-title"><span className="avatar" aria-hidden="true">T</span> Thimorrow is a creative developer making things for the web.</h1>
        <p>I make websites, interfaces, and small digital things with care. I like useful ideas, calm software, and details that reward attention.</p>
        <p>I&apos;m currently working independently. Previously, I helped build products for thoughtful teams.</p>
        <p>Follow me on <LinkText href="#contact">LinkedIn</LinkText>, find some of my work on <LinkText href="#projects">GitHub</LinkText>, or <LinkText href="mailto:hello@thimorrow.de">send me a note</LinkText>.</p>
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
        <p>You can see more of my work on <LinkText href="#projects">GitHub</LinkText> and more of my thinking in <LinkText href="#writing">my notes</LinkText>.</p>
      </section>

      <footer id="contact" className="site-footer">
        <p>Want to say hello? <LinkText href="mailto:hello@thimorrow.de">hello@thimorrow.de</LinkText>.</p>
        <span>© 2026 Thimorrow</span>
      </footer>
    </main>
  )
}

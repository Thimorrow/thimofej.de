import Link from "next/link"

const projects = [
  { year: "26", title: "Clearer", description: "A calm workspace for turning loose thoughts into useful ideas.", href: "/projects/project-one" },
  { year: "25", title: "Quiet UI", description: "Open-source interface primitives for products with a point of view.", href: "/projects/project-two" },
  { year: "24", title: "Field notes", description: "An evolving archive of experiments, notes, and useful things.", href: "/projects/project-three" },
]

const writing = [
  { title: "A note on making things", description: "Taste is a practice, not a finishing touch.", href: "/writing" },
  { title: "The quiet interface", description: "Why less can make a product feel more human.", href: "/writing" },
]

function LinkText({ children, href = "#" }: { children: React.ReactNode; href?: string }) {
  return <a className="inline-link" href={href}>{children}</a>
}

function List({ items }: { items: { title: string; description: string; year?: string; href: string }[] }) {
  return <div className="item-list">{items.map((item) => <Link href={item.href} className="item" key={item.title}><span className="item-title">{item.title}</span><span className="item-description">{item.description}</span>{item.year && <span className="item-year">{item.year}</span>}<span className="item-arrow" aria-hidden="true">↗</span></Link>)}</div>
}

export default function Home() {
  return <main className="page-wrap">
    <header className="site-header"><Link className="name" href="#top" aria-label="Back to top">Thimorrow<span className="name-dot">.</span></Link><nav aria-label="Main navigation"><a href="#projects">Work</a><a href="#writing">Notes</a><a href="#contact">Contact</a></nav></header>
    <section id="top" className="intro" aria-labelledby="intro-title"><p className="eyebrow">Independent / Germany</p><h1 id="intro-title"><span className="avatar" aria-hidden="true">T</span> Thimorrow is a creative developer making thoughtful things for the web.</h1><p>I make websites, interfaces, and small digital tools with care. Useful ideas, calm software, and details that reward attention.</p><p>I&apos;m currently working independently, helping thoughtful teams turn ambitious ideas into clear digital experiences.</p><p>Find me on <LinkText href="https://x.com/thimorrowr">X</LinkText>, browse the work below, or <LinkText href="mailto:hello@thimorrow.de">send me a note</LinkText>.</p></section>
    <section id="projects" className="content-section" aria-labelledby="projects-title"><div className="section-heading"><h2 id="projects-title">Selected work</h2><span>things I&apos;ve built</span></div><List items={projects} /></section>
    <section id="writing" className="content-section" aria-labelledby="writing-title"><div className="section-heading"><h2 id="writing-title">Writing</h2><span>notes &amp; thoughts</span></div><List items={writing} /></section>
    <section className="content-section note-section" aria-labelledby="more-title"><div className="section-heading"><h2 id="more-title">Elsewhere</h2><span>stay in touch</span></div><p>Mostly on <LinkText href="https://x.com/thimorrowr">X</LinkText>, occasionally in <LinkText href="/writing">my notes</LinkText>. I care about making the internet feel a little more considered.</p></section>
    <footer id="contact" className="site-footer"><p>Want to say hello? <LinkText href="mailto:hello@thimorrow.de">hello@thimorrow.de</LinkText>.</p><span>© 2026 Thimorrow</span></footer>
  </main>
}

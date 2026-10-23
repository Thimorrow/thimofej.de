import type { Metadata } from "next";
import Link from "next/link";
import AcademyDemo from "@/components/academy/AcademyDemo";
import "./academy-project.css";

export const metadata: Metadata = {
  title: "yesterday Academy | Thimofej Zapko",
  description: "Practical AI learning with missions, Tomo and useful results. My frontend work on the yesterday Academy, with an interactive product preview.",
  alternates: { canonical: "/projects/academy" },
};

const contributions = [
  { title: "Finding the next mission", text: "A mission catalogue ordered around timing, a today indicator and a sidebar that shows who is signed in." },
  { title: "A clearer conversation", text: "Making the full mission chat history available, adapting the message box to a growing draft and improving how prompts wrap." },
  { title: "Results you can take with you", text: "One-click document copying and clearer visual separation between chapters in generated results." },
  { title: "The details between the screens", text: "More consistent buttons and tooltips, clearer deep-link errors, calmer hover states and dialogs that stay stable while content loads." },
];

export default function AcademyProject() {
  return (
    <main id="main" className="page-wrap detail-page academy-page">
      <header className="site-header detail-header">
        <Link className="name" href="/">Thimorrow<span className="name-dot">.</span></Link>
        <Link className="back-link" href="/#academy">Back to work <span aria-hidden="true">↗</span></Link>
      </header>
      <article className="detail-content academy-content">
        <div className="academy-intro">
          <p className="eyebrow">Selected work / yesterday</p>
          <h1>Learning AI.<br />By doing real work.</h1>
          <p className="detail-lede">The yesterday Academy helps teams turn AI knowledge into everyday practice. I work on its frontend with the team at yesterday.</p>
          <div className="academy-links">
            <a className="academy-visit" href="https://academy.yesterday-ai.de/" target="_blank" rel="noopener noreferrer">Visit Academy website <span aria-hidden="true">↗</span><span className="academy-sr"> (opens in a new tab)</span></a>
            <a className="inline-link" href="#preview">Explore the preview ↓</a>
          </div>
        </div>
        <dl className="detail-meta academy-meta">
          <div><dt>My role</dt><dd>Frontend developer</dd></div>
          <div><dt>Team</dt><dd>yesterday</dd></div>
          <div><dt>App stack</dt><dd>SvelteKit · Svelte · TypeScript</dd></div>
          <div><dt>Focus</dt><dd>Learning experience & UI</dd></div>
        </dl>
        <section id="preview" className="academy-preview" aria-labelledby="preview-title">
          <div className="academy-section-heading"><p className="eyebrow">01 / Inside the product</p><h2 id="preview-title">Meet your learning companion.</h2></div>
          <p className="academy-section-lede">Choose a mission, add your own answers and build a document with Tomo. Follow every step, then copy or download your result.</p>
          <Link className="academy-demo-launch" href="/projects/academy/demo">Open the full demo <span aria-hidden="true">↗</span></Link>
          <div className="academy-demo-preview"><AcademyDemo /></div>
          <p className="academy-caption">An interactive recreation of the Academy experience. The German interface follows the product; conversations use a fixed demo flow, without live AI. Your answers stay in this browser.</p>
        </section>
        <section className="academy-story" aria-labelledby="product-title">
          <div className="academy-section-heading"><p className="eyebrow">02 / The idea</p><h2 id="product-title">From a training day<br />to an everyday habit.</h2></div>
          <div className="academy-prose">
            <p>Learning a new tool is one thing. Knowing where it helps in your own work takes practice. The Academy sits between training sessions, giving teams a place to try AI on tasks they actually recognise.</p>
            <p>Instead of stopping at a lesson, learners work through missions. Tomo, the AI tutor, asks questions, helps shape a brief and gives feedback. The outcome is something useful: a personal handbook, a backlog of use cases or a reusable task brief.</p>
            <p>The app is part of yesterday&apos;s wider programme: helping people learn AI, build practical solutions and share those skills with colleagues. People test the results in their approved tools and check the work themselves.</p>
          </div>
        </section>
        <section className="academy-story" aria-labelledby="contribution-title">
          <div className="academy-section-heading"><p className="eyebrow">03 / My contribution</p><h2 id="contribution-title">Making the next step<br />feel clear.</h2><p className="academy-section-lede">I contribute to the app&apos;s frontend as part of the team. My work spans the mission journey and the smaller interactions that make it easier to use.</p></div>
          <ol className="academy-contributions">{contributions.map((item, index) => <li key={item.title}><span aria-hidden="true">0{index + 1}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></li>)}</ol>
        </section>
        <section className="academy-outro" aria-labelledby="more-title"><p className="eyebrow">Explore further</p><h2 id="more-title">See the bigger picture.</h2><p>Discover the Academy and the programme it supports on yesterday&apos;s website.</p><a className="academy-visit" href="https://academy.yesterday-ai.de/" target="_blank" rel="noopener noreferrer">academy.yesterday-ai.de <span aria-hidden="true">↗</span><span className="academy-sr"> (opens in a new tab)</span></a></section>
      </article>
      <footer className="site-footer"><Link className="inline-link" href="/#academy">← All work</Link><span>A team project at yesterday</span></footer>
    </main>
  );
}

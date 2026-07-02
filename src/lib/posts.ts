// Minimal, dependency-free content model for /writing. Each post is one
// language; a DE/EN pair links through `altSlug` so we can emit correct
// hreflang alternates without an i18n framework. Add posts by appending here.
export type Post = {
  slug: string;
  lang: "en" | "de";
  title: string;
  description: string;
  date: string; // ISO date, used for BlogPosting + sitemap lastModified
  altSlug: string; // the same post in the other language (for hreflang)
  body: string[]; // paragraphs, rendered in order
};

// Seed pair — drafted from facts already public on the homepage. Thimofej owns
// the voice: edit freely. The two versions are hreflang-linked via altSlug.
export const posts: Post[] = [
  {
    slug: "how-i-won-a-hackathon-at-14",
    lang: "en",
    title: "How I won a hackathon at 14",
    description:
      "Total beginner, no clue what I was doing, one paying customer by the end of the week. The story of the Email checker and the moment tech grabbed me.",
    date: "2026-07-02",
    altSlug: "wie-ich-mit-14-einen-hackathon-gewann",
    body: [
      "I walked into my first hackathon at 14 as a total beginner. No team of pros, no clever plan, no clue what I was really doing. I just wanted to build something that worked.",
      "The idea was simple and a little stubborn: turn your inbox into voice notes and let you answer out loud. I wired it together as an n8n workflow, the Email checker. It read your new mail to you and let you reply by talking back.",
      "By the end of the week it had a paying customer, and the whole thing won at STARTPLATZ in Cologne. That was the exact moment tech grabbed me and never let go.",
      "The lesson I keep coming back to: building the thing is the easy part. Finishing it, shipping it, putting it in front of a real person who pays for it, that is the fight worth having. I have been chasing it ever since.",
    ],
  },
  {
    slug: "wie-ich-mit-14-einen-hackathon-gewann",
    lang: "de",
    title: "Wie ich mit 14 einen Hackathon gewann",
    description:
      "Kompletter Anfänger, keine Ahnung was ich tat, am Ende der Woche ein zahlender Kunde. Die Geschichte vom Email checker und dem Moment, in dem Tech mich gepackt hat.",
    date: "2026-07-02",
    altSlug: "how-i-won-a-hackathon-at-14",
    body: [
      "Mit 14 bin ich als kompletter Anfänger in meinen ersten Hackathon gegangen. Kein Profi-Team, kein cleverer Plan, keine Ahnung was ich eigentlich tat. Ich wollte einfach etwas bauen, das funktioniert.",
      "Die Idee war simpel und ein bisschen stur: dein Postfach in Sprachnachrichten verwandeln und dich laut antworten lassen. Ich habe es als n8n-Workflow zusammengebaut, den Email checker. Er hat dir neue Mails vorgelesen und dich per Sprache antworten lassen.",
      "Am Ende der Woche hatte das Ganze einen zahlenden Kunden und gewann bei STARTPLATZ in Köln. Genau in diesem Moment hat Tech mich gepackt und nie wieder losgelassen.",
      "Die Lektion, zu der ich immer zurückkomme: Das Bauen ist der leichte Teil. Es fertigzustellen, live zu bringen, vor einen echten Menschen zu stellen der dafür zahlt, das ist der Kampf, der sich lohnt. Dem jage ich seitdem hinterher.",
    ],
  },
];

const bySlug = new Map(posts.map((p) => [p.slug, p]));

export function getPost(slug: string): Post | undefined {
  return bySlug.get(slug);
}

export function allSlugs(): string[] {
  return posts.map((p) => p.slug);
}

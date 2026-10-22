export type MissionStep = {
  title: string;
  heading: string;
  question: string;
  acknowledgement: string;
  suggestions: string[];
};
export type DemoMission = {
  id: string;
  number: number;
  title: string;
  short: string;
  description: string;
  duration: string;
  cover: string;
  output: string;
  steps: MissionStep[];
};

// Mission names and visual assets come from the public Academy landing page.
// Questions and responses below are a local demonstration, not the production AI.
export const missions: DemoMission[] = [
  {
    id: 'handbook', number: 3,
    title: 'Dein Personal Handbook: Endlich mal ein gutes Onboarding',
    short: 'Dein Personal Handbook',
    description: 'Gib der KI den Kontext, den eine neue Kollegin auch bräuchte. Deine Rolle, dein Alltag und dein Stil – an einem Ort.',
    duration: '~60 Min.', cover: '/projects/academy/missions/personal-handbook.jpg', output: 'Mein Personal Handbook',
    steps: [
      { title: 'Dein Alltag', heading: 'Wer ich bin & woran ich arbeite', question: 'Hi, ich bin Tomo. Wir bauen ein kleines Personal Handbook: ein Onboarding für die Zusammenarbeit mit KI. Was ist deine Rolle und welche Aufgaben gehören zu deinem Alltag?', acknowledgement: 'Deine Rolle und Aufgaben stehen jetzt im Handbook. Damit hat eine KI schon einmal einen Ausgangspunkt.', suggestions: ['Ich arbeite im Vertrieb. Ich schreibe Angebote, beantworte Kundenfragen und bereite Termine vor.', 'Ich entwickle Frontends. Ich baue Oberflächen, behebe Fehler und stimme mich mit dem Design-Team ab.'] },
      { title: 'Dein Stil', heading: 'So möchte ich zusammenarbeiten', question: 'Wie soll eine KI mit dir arbeiten? Beschreibe deinen Ton, die gewünschte Länge und was dir bei Antworten wichtig ist.', acknowledgement: 'Dein Arbeitsstil ist ergänzt. So lässt sich beim nächsten Briefing gezielt darauf verweisen.', suggestions: ['Kurz und direkt, mit konkreten Beispielen. Bitte nachfragen, wenn Informationen fehlen.', 'Freundlich und verständlich. Erst eine kurze Zusammenfassung, dann die einzelnen Schritte.'] },
      { title: 'Handbook bauen', heading: 'Was die KI über meine Arbeit wissen sollte', question: 'Was fehlt noch, damit dein Handbook hilfreich wird? Zum Beispiel deine Zielgruppe, typische Abläufe oder Grenzen beim Umgang mit Daten.', acknowledgement: 'Auch dieser Kontext ist im Dokument. Dein Handbook verbindet jetzt Rolle, Stil und Arbeitsumfeld.', suggestions: ['Meine Zielgruppe sind mittelständische Unternehmen. Preise und vertrauliche Kundendaten gebe ich nicht weiter.', 'Ich arbeite im Team. Vorschläge sollen zu bestehenden Abläufen passen und Annahmen deutlich nennen.'] },
      { title: 'Der Beweis', heading: 'Mein erster Praxistest', question: 'Zum Schluss ein Praxistest: Für welche konkrete Aufgabe willst du dein Handbook als Nächstes nutzen? Woran erkennst du ein gutes Ergebnis?', acknowledgement: 'Dein Personal Handbook ist bereit für einen ersten Test. Kopiere es in dein freigegebenes KI-Werkzeug und prüfe, ob die Antwort deinen Kriterien entspricht.', suggestions: ['Ich teste eine Antwort auf eine Kundenanfrage. Sie soll verständlich, freundlich und ohne erfundene Zusagen sein.', 'Ich lasse eine Aufgabe erklären. Das Ergebnis soll konkrete Schritte enthalten und ohne unnötigen Fachjargon auskommen.'] },
    ],
  },
  {
    id: 'use-cases', number: 5,
    title: 'Alltagsaufgaben mit KI: Finde deine 10 Use Cases', short: 'Deine 10 Use Cases',
    description: 'Entdecke wiederkehrende Aufgaben, bei denen KI helfen könnte. Sammle Ideen und wähle deinen ersten Kandidaten.',
    duration: '~30 Min.', cover: '/projects/academy/missions/alltags-cases.jpg', output: 'Mein Use-Case-Backlog',
    steps: [
      { title: 'Use Cases sammeln', heading: 'Meine Ideen für den KI-Einsatz', question: 'Wo denkst du in deiner Woche: Das müsste doch einfacher gehen? Sammle bis zu zehn wiederkehrende Aufgaben. Du kannst sie untereinander aufschreiben.', acknowledgement: 'Deine Ideen stehen im Backlog. Das ist eine Sammlung zum Prüfen – noch kein Versprechen, dass KI jede Aufgabe zuverlässig übernehmen kann.', suggestions: ['Meeting-Notizen zusammenfassen\nKundenmails entwerfen\nAngebote vorbereiten\nTexte gegenlesen\nPräsentationen gliedern', 'Recherche strukturieren\nDokumentation pflegen\nIdeen für Tests sammeln\nFeedback sortieren\nAufgaben briefen'] },
      { title: 'Top-Kandidat & Backlog', heading: 'Mein erster Kandidat & Erfolgskriterium', question: 'Welche Idee möchtest du zuerst ausprobieren? Wähle eine überschaubare Aufgabe und beschreibe, woran du ein gutes Ergebnis erkennen würdest.', acknowledgement: 'Dein erster Kandidat steht fest. Teste ihn mit geeigneten Beispieldaten, prüfe das Ergebnis fachlich und entscheide dann, ob er in deinen Alltag passt.', suggestions: ['Meeting-Notizen zusammenfassen. Entscheidungen und nächste Schritte müssen vollständig und korrekt sein.', 'Texte gegenlesen. Ich möchte konkrete Verbesserungsvorschläge, die den Inhalt unverändert lassen.'] },
    ],
  },
  {
    id: 'snippet', number: 6,
    title: 'Dein erster Aufgaben-Snippet: Gut briefen ist die halbe Miete', short: 'Dein erster Aufgaben-Snippet',
    description: 'Mach aus einer wiederkehrenden Aufgabe ein wiederverwendbares Briefing – mit Kontext, gewünschtem Ergebnis und einem Test.',
    duration: '~30 Min.', cover: '/projects/academy/missions/aufgaben-snippet.jpg', output: 'Mein erster Aufgaben-Snippet',
    steps: [
      { title: 'Aufgabe briefen', heading: 'Meine Aufgabe & ihr Kontext', question: 'Nimm eine Aufgabe, die du häufiger erledigst. Beschreibe sie so, als würdest du sie an eine neue Kollegin übergeben: Was soll sie tun und welche Informationen braucht sie?', acknowledgement: 'Die Aufgabe ist festgehalten. Als Nächstes machen wir daraus ein Briefing, das du wiederverwenden kannst.', suggestions: ['Nach einem Kundentermin erstelle ich ein Angebot aus meinen Notizen. Es soll die besprochenen Leistungen enthalten, aber keine Preise erfinden.', 'Nach einem Meeting fasse ich Notizen zusammen. Ich brauche Entscheidungen, offene Fragen und Aufgaben mit Zuständigkeit.'] },
      { title: 'Snippet bauen', heading: 'Mein wiederverwendbares Briefing', question: 'Wie soll das Ergebnis aussehen? Gib deinem Snippet einen Namen und ergänze Format, Zielgruppe und Regeln für fehlende Informationen.', acknowledgement: 'Dein Briefing ist ergänzt. Es beschreibt jetzt nicht nur die Aufgabe, sondern auch die Form des Ergebnisses.', suggestions: ['Meeting-Klartext: eine kurze Zusammenfassung, dann Entscheidungen und Aufgaben als Liste. Fehlende Zuständigkeiten als offen markieren.', 'Angebotsentwurf: professioneller Ton, klare Leistungsübersicht. Bei fehlenden Angaben Rückfragen stellen, nichts erfinden.'] },
      { title: 'Erster Lauf', heading: 'Mein Test & Qualitätscheck', question: 'Mit welchem Beispiel testest du dein Snippet? Welche Punkte prüfst du, bevor du das Ergebnis weiterverwendest?', acknowledgement: 'Dein Aufgaben-Snippet ist bereit. Kopiere dein Briefing in ein freigegebenes KI-Werkzeug, ergänze dein Beispiel und prüfe das Ergebnis anhand deiner Kriterien.', suggestions: ['Ich nehme anonymisierte Notizen. Ich prüfe Fakten, Vollständigkeit und ob fehlende Informationen wirklich als offen markiert sind.', 'Ich starte mit einem fiktiven Beispiel und vergleiche das Ergebnis mit meiner eigenen Lösung.'] },
    ],
  },
];

export function appendAnswer(mission: DemoMission, answers: string[], input: string): string[] {
  const value = input.trim();
  if (!value || value.length > 1500 || answers.length >= mission.steps.length) return answers;
  return [...answers, value];
}

export function progressFor(mission: DemoMission, answers: string[]): number {
  return Math.min(100, Math.round(answers.length / mission.steps.length * 100));
}

export function resultMarkdown(mission: DemoMission, answers: string[]): string {
  const sections = answers.slice(0, mission.steps.length).map((answer, i) => `## ${mission.steps[i].heading}\n\n${answer}`);
  return `# ${mission.output}\n\n${sections.join('\n\n')}\n\n---\nErstellt in der interaktiven Academy-Produktdemo. Eigene Eingaben, kein KI-generiertes Ergebnis.\n`;
}

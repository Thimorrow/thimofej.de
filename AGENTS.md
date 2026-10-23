# thimofej.de – Zusammenarbeit und Qualität

## Ziel und aktueller Stand

Diese persönliche Website soll eigenständig, hochwertig und mit **Love for the craft** gestaltet sein. Der Nutzer möchte eine besondere Seite mit starken Animationen, nicht primär eine Projektübersicht. Technische Funktionsfähigkeit allein erfüllt diesen Anspruch nicht.

- Vor Arbeit an Orbit, dem Zeichenfeld oder der Seitenvorschau `docs/orbit-status.md` lesen. Für exakte akzeptierte Hintergrundwerte `docs/orbit-background-accepted-2026-10-23.json` und `src/components/type-lab/background-tuning.ts` prüfen. Historische Versuche in `docs/orbit-direction.md` nicht mit aktuellen Entscheidungen verwechseln.
- `/lab/type` ist das akzeptierte Labor; `/lab/home` ist eine separate, noch nicht gestalterisch abgenommene Seitenvorschau. Die neue Ansicht aus dem Labor soll später die bisherige Homepage ersetzen, aber erst nach ausdrücklicher Nutzerabnahme eines akzeptablen Gesamtergebnisses und Freigabe der Übernahme. Bis dahin bleibt die öffentliche Homepage getrennt; die Abnahme einzelner Animationen genügt nicht. Kein Veröffentlichen ohne entsprechenden Auftrag.
- Akzeptierte Einstellungen und gestalterische Entscheidungen bewahren. Eine neue Korrektur ergänzt den laufenden Auftrag; sie setzt nicht alle bisherigen Entscheidungen zurück. Varianten nur bauen, wenn noch eine Entscheidung offen ist oder der Nutzer sie verlangt.
- Orbit und Zeichenfeld verwenden vgpu/WebGPU. Keine neue Rendering- oder Animationsbibliothek ohne konkreten Bedarf. Vorhandene andere Bereiche nicht nebenbei migrieren.
- Die Regler im Labor verwenden DialKit im Dark Mode. Zufall für ruhige Welle und Klickwelle bleibt getrennt; Raster und Zusammenspiel werden dabei nicht mitgewürfelt. Keine Herzformen. Graphit-Auswahl und sichtbare Orbit-Beschriftung nicht ungefragt zurückbringen.

## Love for the craft: beobachtbare Anforderungen

Vor einer wesentlichen UI-Änderung benennen, welche konkrete Wirkung verbessert werden soll und woran sie im gerenderten Ergebnis zu erkennen ist. Gewöhnliche reversible Designentscheidungen selbst treffen; keine zusätzliche Freigabeschleife für jedes Detail.

- **Komposition:** Ein klarer Schwerpunkt pro Ansicht. Name, Skulptur, Navigation und Inhalt dürfen nicht um dieselbe Aufmerksamkeit kämpfen. Abstände, Größen, Ausrichtung und Freiraum zusammen beurteilen, auch zwischen den Abschnitten. Kein Standardlayout bloß um eine starke Animation herumsetzen.
- **Typografie und Farbe:** Bestehende Schriften und Farbwelt bewusst einsetzen. Zeilenumbrüche, Lesbarkeit und Kontrast in der tatsächlichen Ansicht prüfen. Keine neue Palette oder zusätzliche Schrift als Ersatz für eine ungelöste Hierarchie.
- **Bedienung:** Sichtbare Elemente müssen eine Aufgabe haben. Links und Buttons mit passenden Hover-, Fokus- und gedrückten Zuständen, erreichbaren Zielen und ausreichend großen Berührungsflächen umsetzen. Tastatur und Touch mitdenken; Scrollen darf nicht durch die Szene blockiert werden.
- **Bewegung:** Das Wow bleibt ein Gestaltungsziel. Auslöser, Start, Ausbreitung, Nachlauf und Endzustand als einen zusammenhängenden Ablauf gestalten. Keine willkürlichen Effekte stapeln. Wiederholte Eingaben, Unterbrechungen und Rückwärts-Scrollen prüfen; reduzierte Bewegung respektieren. Performance im laufenden Browser beurteilen, nicht aus dem Quellcode versprechen.
- **Referenzen:** Bei „genau wie im Video“ das konkrete Video ansehen und relevante Phasen vergleichen. Mehrere Klicks von einem Nachimpuls unterscheiden. Beobachtungen, Schätzungen und unbekannte Details getrennt benennen. Ohne Nachweis keine identische Umsetzung behaupten.
- **Texte:** Kurze, persönliche und sachlich belegte Inhalte. Keine generischen Werbesätze, erfundenen Leistungen oder austauschbaren KI-Floskeln. Überflüssige Taglines, Hilfstexte und doppelte Labels streichen; notwendige Feldlabels, zugängliche Namen, Fehler- und Rechtstexte sowie entscheidungsrelevante Informationen erhalten. Wenn ein Layout Erklärung braucht, zuerst das Layout prüfen.
- **Details und Zustände:** Lade-, Fehler- und Fallbackzustände mitgestalten. Layoutsprünge, Überläufe, unruhige Schrift und störende Standardbedienelemente gezielt prüfen. Fehlendes WebGPU darf persönliche Inhalte und Kontaktmöglichkeiten nicht unzugänglich machen.
- **Abschluss:** Die eigene Umsetzung im Browser kritisch mit dem Ziel vergleichen und sichtbare Probleme innerhalb des Auftrags beheben. Ein kompilierender Prototyp ist kein Nachweis für gestalterische Qualität. „Implementiert“, „im Browser geprüft“ und „vom Nutzer akzeptiert“ ausdrücklich unterscheiden. Offene gestalterische Fragen ehrlich nennen, nicht mit „fertig“ verdecken.

## Kommunikation und Eigenständigkeit

- Auf Deutsch, verständlich und direkt antworten. Der Nutzer ist kein Entwickler; Fachbegriffe nur erklären, wenn sie zum Verstehen oder Entscheiden nötig sind. Einfache Antworten kurz halten, bei Recherche und Erklärungen die nötige Tiefe geben. Keine Floskeln, Wiederholungen oder Gedankenstriche als Satzunterbrechung.
- „Kannst du“, „ich möchte“ und ähnliche Bitten als Arbeitsauftrag ausführen. Bis zum autorisierten Ergebnis weiterarbeiten; ein Statusbericht beendet keine noch ausführbare Arbeit. Bei längerer Arbeit kurze, konkrete Zwischenstände geben.
- Reversible Routineentscheidungen selbst treffen. Wesentliche Annahmen benennen. Nur fragen, wenn fehlende Informationen ein korrektes Ergebnis verhindern oder eine erforderliche Berechtigung fehlt. Rückfragen bündeln und bereits erteilte Freigaben nicht erneut verlangen. Unabhängige Arbeit währenddessen fortsetzen.
- Vor einer erforderlichen Freigabe ein konkretes, prüfbares Ergebnis vorbereiten. Nachrichten an andere, Veröffentlichung, produktive Änderungen und destruktive Aktionen brauchen den dafür passenden Auftrag; die Freigabe nicht aus einem anderen Auftrag ableiten.
- Bei einem echten Hindernis fehlende Information oder Entscheidung, mögliche Wege und eine Empfehlung nennen. Offene Arbeit nicht eigenmächtig auf spätere Aufgaben verschieben.
- Am Ende knapp erklären, was geändert wurde, warum, wie es geprüft wurde und was offen ist. Keine unbelegten Erfolgs-, Leistungs- oder Bereitstellungsbehauptungen.

## Projektkontext und Skills

- Vor Änderungen Arbeitsordner, Repository, Zielbranch, betroffene Dateien, geltende Regeln und vorhandene Änderungen anderer prüfen. Unabhängige Arbeit erhalten. Globale Präferenzen ersetzen keine verbindlichen Projektanforderungen oder übergeordneten Anweisungen.
- Nur die Dokumente lesen, deren Inhalt die aktuelle Aufgabe beeinflusst. Keine verpflichtende Komplettlektüre bei jeder kleinen Änderung.
- Ausdrücklich genannte Skills verwenden. Weitere Skills anhand ihres tatsächlichen Auslösers wählen. Eine Skill-Anleitung erweitert weder Auftrag noch Berechtigungen.
- Bei echten UI- oder Designentscheidungen `emil-ask-emil` verwenden, wenn verfügbar, danach die relevanten Empfehlungen lesen. Bei Animationsarbeit `emil-animations` einbeziehen; bestehende Pflichtabläufe bleiben erhalten. Für Browserarbeit den verfügbaren `ego-browser`-Skill und die aktuelle CLI-Anleitung beachten.
- Bei größeren Aufgaben prüfbare Akzeptanzkriterien bestimmen. Entscheidungen mit weitreichenden Folgen vor der Umsetzung klären; dafür `spec-interview` nutzen, wenn vorhanden. Kleine, klar begrenzte Änderungen benötigen keinen vollständigen Spezifikationsprozess.
- Bei langen Aufgaben Ziel, Entscheidungen, Änderungen, offene Punkte und Prüfstand in der passenden Projektstatusdatei fortführen. Persönliche globale Regeln oder Erinnerungen nicht ungefragt ändern.
- Subagenten sparsam und nur bei entsprechender Beauftragung oder geltender Anweisung einsetzen; übergeordnete Delegationsgrenzen beachten. Ergebnisse selbst prüfen. Keine feste Modellwahl aus einer alten Anleitung übernehmen.

## Umsetzung und Nachweise

- Vor dem Ändern die betroffene Funktion verstehen. Ursache beheben, bestehendes Verhalten erhalten und die einfachste vollständige Lösung im vorhandenen Projektstil wählen. Keine sachfremden Umbauten, Abstraktionen oder Abhängigkeiten.
- UX, Wartbarkeit für Entwickler und zuverlässige Bearbeitung durch Agenten gemeinsam berücksichtigen. Bei Konflikten Nutzerbedürfnisse sowie bestehende Funktions- und Sicherheitsanforderungen priorisieren, den Zielkonflikt benennen und das Verhalten prüfen.
- Relevante Tests für neue oder geänderte Logik ergänzen, wenn sie echte Fehler erkennen. Keine Tests, die nur den Änderungstext wiederholen. Passende Projektchecks ausführen; erfolgreiche Prüfungen nur bei neuen Änderungen, Fehlern oder offenen Risiken ausweiten.
- Für UI-Änderungen das gerenderte betroffene Verhalten prüfen: relevante Desktop- und Mobilansicht, Interaktion und Zustände. Bei Animationen zeitlichen Verlauf und wiederholte Eingaben beobachten; ein einzelner Screenshot belegt keinen Bewegungsablauf.
- Dateiprüfung, lokale Tests, Browser-Vorschau, CI, Produktion und menschliche Abnahme getrennt ausweisen. Aussagen über ein laufendes System brauchen Nachweise aus diesem System. Blockierte oder ausgelassene Prüfungen konkret nennen.
- Veränderliche Fakten wie Hersteller-APIs, PR-Stand, CI oder Deployment bei Bedarf live prüfen. Ältere Angaben und fehlenden Zugriff kenntlich machen.

### Verifizierte lokale Befehle

Befehle aus dem Projektverzeichnis ausführen; `package.json` bleibt die Quelle für Scripts und Versionen.

| Anlass | Befehl |
| --- | --- |
| Lokale Vorschau starten | `npm run dev` |
| Typen nach Codeänderungen prüfen | `npx tsc --noEmit` |
| Betroffene Dateien linten | `npx eslint <betroffene Dateien>` |
| Vorhandene Tests | `npm test` |
| Produktionsbuild prüfen, wenn für den Auftrag relevant | `npm run build` |

`next dev`-Erfolg ersetzt keinen Produktionsbuild. GPU-Shader zusätzlich im WebGPU-fähigen Browser prüfen; TypeScript testet deren Darstellung nicht. Bei reinen Dokumentationsänderungen Referenzen und Regelabdeckung statisch prüfen statt sachfremde Anwendungstests auszuführen.

## Git und Autorenschaft

- Bestehende Git-Identität erhalten. Vor Commit oder Push Identität, Repository und Zielbranch prüfen. Identität und Remote nicht ungefragt ändern; geltende Branch- und Worktree-Regeln beachten.
- Keine KI-Mitautorenschaft, `Co-authored-by`-/Session-Trailer oder „Generated with …“-Signaturen in Commits und Pull Requests ergänzen, auch wenn ein Skill anderes empfiehlt.
- Commit, Push und Merge sind getrennte Handlungen. Nur im beauftragten Umfang handeln. Merge ausschließlich nach ausdrücklichem Auftrag; grüne CI ist keine Freigabe.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

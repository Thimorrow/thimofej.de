# yesterday Academy – Recherche für das Portfolio

Stand: 23. Oktober 2026. Grundlage: öffentliche Website im Browser, der lokale Quellcode und die lokale Git-Historie. Die App selbst wurde nicht angemeldet oder gegen ihre Produktions-API getestet.

## Öffentlich geprüft

Website: https://academy.yesterday-ai.de/

- Die Academy begleitet Unternehmen beim praktischen KI-Lernen zwischen Trainingstagen.
- Lernende bearbeiten Missionen an eigenen Arbeitsaufgaben. Tomo fragt nach, begleitet das Briefing und gibt Feedback.
- Die öffentliche Produktvorschau zeigt Missionsauswahl, Fortschritt, Chat und ein Dokument als Ergebnis.
- Öffentliche Beispielmissionen: Personal Handbook (Mission 3, etwa 60 Minuten), zehn Use Cases (Mission 5, etwa 30 Minuten), erster Aufgaben-Snippet (Mission 6, etwa 30 Minuten).
- Das Programm verbindet Kompetenzaufbau, praktische Lösungen und interne KI-Botschafter*innen.
- Die Website beschreibt einen Einstieg über drei Wochen ab zwölf Personen, mit zwei Trainingstagen und Academy-Zugang. Genannt werden 1.680 Euro pro Person; Umfang, Laufzeit und weitere Angebotsbedingungen werden individuell geklärt. Diese veränderlichen Angebotsdaten wurden nicht ins Portfolio übernommen.
- Ergebnisse werden mit freigegebenen Werkzeugen getestet und von Menschen fachlich geprüft.

## Aufbau im Quellcode

- App: `experts/apps/web-academy`, SvelteKit, Svelte, TypeScript.
- Katalog: `src/routes/(app)/missionen/+page.svelte`: Workshop- bzw. flache Ansicht, Suche, Filter, Missionsstatus und Ergebniszugriff.
- Mission: `src/lib/components/missionen/MissionChatView.svelte`: Fortschritt/Schritte, Gespräch, Ergebnisbereich; mobile Ansichten für Schritte, Chat und Ergebnis.
- Landingpage: `academy-landingpage`, Next.js/React. Die öffentliche Demo liefert die drei Missionstitel, Originalbilder und Tomo-Illustration.
- Die Portfolio-Demo ist eine eigenständige React-Nachstellung. Keine Verbindung zur echten Academy, kein Login und keine echte KI. Antworten werden in einen festen Ablauf eingeordnet und wörtlich in das Dokument übernommen. Beispiele, Neustart, Missionserhalt bis zum Neuladen, Suche, Filter, Kopieren und Markdown-Export sind bedienbar.

## Belegbare eigene Beiträge

Gezielt geprüft über `git log --author='Thimofej' -- apps/web-academy` im lokalen Experts-Repository. Die Commit-Titel belegen Beiträge; sie belegen keinen aktuellen Produktionsstatus.

- Missionskatalog mit zeitlicher Reihenfolge und Heute-Markierung: ENG-480 (#916).
- Benutzeridentität in der Seitenleiste: ENG-540 (#898), ENG-615 (#1093).
- Vollständiger Missions-Chatverlauf: ENG-608 (#1074).
- Anpassbare Höhe des Chat-Eingabefelds: ENG-537 (#1082).
- Umbruch und Kopieren von Prompts: ENG-538 (#902).
- Dokumente mit einem Klick kopieren: ENG-627 (#1094).
- Kapitel in Ergebnissen optisch trennen: ENG-599 (#985).
- Tooltips und Buttons vereinheitlichen: ENG-579 (#1088).
- Verständlichere Fehler bei Direktlinks: ENG-484 (#1058).
- Stabilere Dialoghöhe beim Laden: ENG-821 (#1143).
- Ruhigere Tooltips und Hover-Zustände: ENG-828 (#1142), ENG-573 (#991), ENG-512 (#1078).
- Weitere Teamarbeit an Workshop-Oberflächen: ENG-377 (#1056), Designkorrekturen: ENG-769 (#1114).

Für die Projektseite wurden diese Beiträge thematisch zusammengefasst und ausdrücklich als Teambeitrag beschrieben. Keine Nutzerzahlen, Umsatzangaben, vollständige Produkturheberschaft oder unbelegten Erfolgsversprechen ergänzt.

## Katalogmodule statt eigener Demo-Stile

Auf Nutzerwunsch verwendet die Demo jetzt die Module aus `academy-design/base/components/`. Die CSS-Rezepte und ihre Abhängigkeiten werden durch `scripts/sync-academy-catalog.mjs` übernommen, zusammen mit den unveränderten Laufzeit-Designwerten aus Experts. `src/components/academy/catalog/manifest.json` verzeichnet Quellpfad, Katalog-Header und SHA-256-Prüfsumme pro Modul sowie den Design-Repo-Stand. Das erzeugte CSS ist auf die Demo begrenzt; die übrige Portfolio-Seite behält ihr Design.

React verbindet die dokumentierten HTML-Klassen und Zustände mit der vorhandenen Demo-Logik. Verwendet werden unter anderem Missionskarte, Suchfeld, Missionsfilter, Buttons, Seitenkopf, Sidebar, Missions-Topbar, Chatansicht, Chat-Eingabefeld, Schrittliste, Identität, Ergebnisbereich und Session-Shell. Es werden keine Katalog-Skripte oder privaten Backend-Dienste ausgeführt. Die drei `refine`-Hinweise wurden als Varianten umgesetzt: unverzerrte Cover mit kompakter Aktion, flache Schrittliste/Fortschrittsfüllung und durchgehende Dokumentabschnitte mit Kopieren im Kopfbereich. Hell/Dunkel folgt den vorhandenen Designwerten.

Das Design-Repo selbst und die ursprünglichen Tokens wurden nicht bearbeitet. Die Demo kann mit dem übernommenen Stand unabhängig vom Nachbar-Repo gebaut werden; ein erneuter Katalogimport ist ausdrücklich und reproduzierbar.

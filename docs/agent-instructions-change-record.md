# Änderung der Projektanweisungen

Datum: 23. Oktober 2026. Auftrag: projektlokale AGENTS.md und CLAUDE.md mit modernize-agent-instructions überarbeiten und „Love for the craft“ verbindlich konkretisieren.

## Struktur und geprüfter Umfang

`AGENTS.md` ist die gemeinsame Quelle. `CLAUDE.md` behält den bereits bestehenden Import `@AGENTS.md`; nur Überschrift und Pflegehinweis wurden ergänzt. Keine Änderung persönlicher/globaler Dateien, Client-Einstellungen, Hooks, CI, Git-Identität oder Deployment-Konfiguration. Keine Commits.

Inventar vor/nach der Änderung: zwei Root-Dateien, keine weiteren benannten Anweisungsdateien oder `.claude/rules` im gescannten Projekt. Keine Inventarwarnungen. `.git`, `.next`, `node_modules` und Symlink-Verzeichnisse sind vom Inventar ausgeschlossen. Die genannten Root-Dateien wurden vollständig gelesen. Auf der direkten Vorfahrenkette `/`, `/Users`, Benutzerverzeichnis und Desktop wurden keine AGENTS.md/CLAUDE.md gefunden. Persönliche client-spezifische globale Regeldateien und Einstellungen wurden nicht auditiert; der Auftrag betrifft das Projekt.

Installierte CLI-Versionen per Versionsbefehl: Claude Code 2.1.308, Codex CLI 0.163.0. Das belegt nicht die Konfiguration oder das Ladeverhalten einer neuen Desktop-Sitzung.

Der relative Claude-Import wurde gegen die aktuelle [offizielle Claude-Dokumentation](https://code.claude.com/docs/en/memory#import-additional-files) geprüft. Importziel existiert. Keine frische Modellsitzung, kein kostenpflichtiger Verhaltenstest und keine geladene-Quellen-Protokollierung ausgeführt. Daher ist nur statische Prüfung plus dokumentierte Unterstützung belegt, nicht tatsächlich beobachtetes Laden in beiden Clients. Für einen späteren Lauf in Claude `/context` bzw. `/memory` prüfen; bei Codex die geladenen Projektquellen einer frischen Sitzung im richtigen Arbeitsordner kontrollieren.

## Anforderungszuordnung

Quelle „Nutzerregeln“ bezeichnet die im Chat ausdrücklich übergebenen AGENTS.md-Anweisungen. Diese waren nicht in der bisherigen Root-Datei enthalten. Abschnitt und Bullet-Thema identifizieren die jeweilige Quelle; zusammengehörige Teilanforderungen bleiben zusammen aufgeführt. Die neuen Zielabschnitte stehen alle in AGENTS.md und werden nicht hinter optionale Dokumentlinks ausgelagert.

| Quelle | Auslöser / operative Anforderung | Neues Ziel | Disposition und Grund |
| --- | --- | --- | --- |
| AGENTS.md vorher, Zeilen 1–5 | Next.js-Code: relevante lokale Framework-Dokumentation lesen, Deprecations beachten | Generierter Block am Dateiende | Wortgetreu erhalten; Framework-Eigentümerschaft respektiert |
| CLAUDE.md vorher, Zeile 1 | Claude-Projektregeln laden | CLAUDE.md, Zeile 3 | Import erhalten; eine gemeinsame Regelquelle |
| Nutzerregeln / Zusammenarbeit 1–2 | Deutsch, verständlich, nötige Fachbegriffserklärung, angemessene Tiefe | Kommunikation und Eigenständigkeit | Erhalten, projektspezifisch dauerhaft verfügbar |
| Nutzerregeln / Zusammenarbeit 3 | Änderungen: Was/Warum/Prüfung/offene Punkte, keine unbelegten Erfolge | Kommunikation und Eigenständigkeit; Umsetzung und Nachweise | Erhalten; Nachweise explizit getrennt |
| Nutzerregeln / Zusammenarbeit 4 | Keine Floskeln oder Gedankenstrich-Unterbrechungen; sinnvolle Struktur | Kommunikation und Eigenständigkeit | Erhalten; Listen/Tabellen werden nicht eingeschränkt |
| Nutzerregeln / Eigenständig arbeiten 1 | Handlungsbitten ausführen | Kommunikation und Eigenständigkeit | Erhalten |
| Nutzerregeln / Eigenständig arbeiten 2–3 | Routine selbst entscheiden; wesentliche Annahmen und notwendige gebündelte Rückfragen; Freigaben nicht wiederholen; unabhängig weiterarbeiten | Kommunikation und Eigenständigkeit | Erhalten, keine neue Design-Freigabeschleife |
| Nutzerregeln / Eigenständig arbeiten 4 | Umfang bewahren; Korrekturen ergänzen Auftrag; nicht eigenmächtig verschieben | Ziel und aktueller Stand; Kommunikation und Eigenständigkeit | Erhalten |
| Nutzerregeln / Eigenständig arbeiten 5 | Freigabepflichtige Aktionen und konkrete Vorbereitung | Kommunikation und Eigenständigkeit; Git und Autorenschaft | Erhalten, Veröffentlichung nicht aus Vorschauauftrag ableiten |
| Nutzerregeln / Eigenständig arbeiten 6 | Weiterarbeiten nach Status; echte Hindernisse mit Wegen/Empfehlung erklären | Kommunikation und Eigenständigkeit | Erhalten |
| Nutzerregeln / Projektkontext 1 | Ordner, Repository, Regeln, Fremdänderungen und Hierarchie beachten | Projektkontext und Skills | Erhalten |
| Nutzerregeln / Projektkontext 2 | Nur relevante Unterlagen lesen | Projektkontext und Skills | Erhalten; Statusdatei nur bei Orbit-/Vorschauarbeit verpflichtend |
| Nutzerregeln / Projektkontext 3 | Genannte Skills; reale Auslöser; keine Berechtigungserweiterung | Projektkontext und Skills | Erhalten |
| Nutzerregeln / Projektkontext 4 | Bei UI-Entscheidungen emil-ask-emil und relevante Empfehlungen; Pflichtabläufe erhalten | Projektkontext und Skills | Erhalten |
| Nutzerregeln / Projektkontext 5 | Lange Aufgaben: Kontext und Status bewahren | Projektkontext und Skills | Erhalten |
| Nutzerregeln / Projektkontext 6 | Keine ungefragten globalen Regeln; Projektwissen lokal | Projektkontext und Skills | Erhalten |
| Nutzerregeln / Umsetzung 1–2 | Einfachste vollständige Lösung; Funktion verstehen; Ursache; bestehendes Verhalten; Scope; Branch-/Worktree-Regeln | Umsetzung und Nachweise; Git und Autorenschaft | Erhalten |
| Nutzerregeln / Umsetzung 3 | Große Aufgaben: Kriterien und weitreichende Entscheidungen; spec-interview; Ausnahme kleine Änderungen | Projektkontext und Skills | Erhalten einschließlich Ausnahme |
| Nutzerregeln / Umsetzung 4 | Relevante Checks, sinnvolle Logiktests, keine spiegelnden Tests, keine unbegründete Ausweitung | Umsetzung und Nachweise | Erhalten |
| Nutzerregeln / Umsetzung 5–7 | Nachweise getrennt; Live-Fakten; blockierte Prüfungen; keine erfundenen Tests | Umsetzung und Nachweise | Erhalten |
| Nutzerregeln / Umsetzung 8 | Sparsame Delegation, Ergebnisprüfung, keine alte feste Modellwahl | Projektkontext und Skills | Erhalten innerhalb übergeordneter Delegationsgrenzen |
| Nutzerregeln / Git 1 | Identität, Repository, Branch vor Commit/Push prüfen; Remote/Identität nicht ändern | Git und Autorenschaft | Erhalten |
| Nutzerregeln / Git 2 | Keine KI-Mitautorenschaft oder Signaturen, auch gegen Skill-Empfehlungen | Git und Autorenschaft | Erhalten |
| Nutzerregeln / Git 3 | Commit/Push/Merge getrennt; Merge explizit; CI keine Freigabe | Git und Autorenschaft | Erhalten |
| Nutzerregeln / UX, DX, AX | Nutzerbedarf/Funktion/Sicherheit priorisieren, Konflikt benennen und prüfen | Umsetzung und Nachweise | Erhalten |
| Nutzerregeln / UI-Leitgedanken und Ausnahmen | Überflüssige Texte streichen; notwendige Labels/Fehler/Recht/Entscheidungsinfos erhalten; gerendert prüfen | Love for the craft; Umsetzung und Nachweise | Erhalten einschließlich Ausnahmen |
| Aktueller Auftrag / Love for the craft | UI-Qualität verbindlich machen | Love for the craft | Neu: überprüfbare Qualitätsanforderungen statt bloßem Motto |
| Chatentscheidungen / akzeptiertes Labor | Orbit, vgpu, Mandarine, getrennte Random-Aktionen, Dark-DialKit, keine Herzen, keine Graphit-Auswahl | Ziel und aktueller Stand | Neu dokumentiert; bestehende Entscheidungen geschützt |
| Chatkritik / Vorschau sei lieblos | Technischen Stand nicht als gestalterisch fertig verkaufen | Love for the craft / Abschluss | Neu konkretisiert; menschliche Abnahme bleibt eigener Zustand |

## Bewusste Verhaltensänderungen

Die Dateien verlangen bei wesentlicher UI-Arbeit ein benanntes Wirkungsziel und einen kritischen Vergleich im gerenderten Ergebnis. Bewegung muss als Ablauf geprüft werden; technische Checks allein genügen nicht zur Qualitätsbehauptung. Das ist eine neue, vom Nutzer beauftragte Qualitätsvorgabe, keine reine sprachliche Kürzung. Sie verlangt keine unendliche Politur, keinen pauschalen Skill-Marathon und keine zusätzlichen menschlichen Freigaben für Routineentscheidungen.

## Statische Verifikation

- Framework-Block gegen Git-Ausgangsversion wortgetreu verglichen.
- CLAUDE-Import auf existierende lokale Datei geprüft.
- Referenzierte Projektdateien, Next.js-Dokumentationsverzeichnis und npm-Scripts geprüft.
- Anforderungsabdeckung gegen Nutzerregeln und Chatentscheidungen abgeglichen.
- `git diff --check` erfolgreich; keine Anwendungsdateien in diesem Auftrag verändert.
- Keine Anwendungstests oder Installationen für diese Dokumentationsänderung ausgeführt. Kein Nachweis, dass die neue Formulierung die Modellleistung empirisch verbessert.

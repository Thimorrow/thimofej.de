# Orbit-Labor: akzeptierter Zwischenstand

## Persönliche Vorstellung: früherer Endzustand (23. Oktober 2026, lokal)

Nutzerrückmeldung anhand der Ansicht mit vollständig sichtbarem Namen, Foto und Alter: Hier soll bereits alles im Endzustand sein. Der Einstieg bleibt bei 77% Bildschirmhöhe; Name, Foto, Alter und die daran gekoppelte Bio schließen ihren Aufbau jetzt bei 55% statt 28% ab. Die Messung folgt weiterhin der jeweiligen Elementposition und bleibt rückwärts scrollbar. Academy verwendet weiterhin die bisherigen 77%/28%; Hero und akzeptierte Hintergrundwerte unverändert.

Geprüft: lokale Desktop- und 390×844-Ansicht mit WebGPU, sichtbare Zwischenphase, wiederholter Vorwärts-/Rückwärtslauf und vollständig zusammengesetztes Foto samt ausgerichteter 15 bei der Screenshot-Position (Fotooberkante etwa 46% Bildschirmhöhe). Alle betroffenen Transformationen dort im Endzustand; kein horizontaler Überlauf. Pause, reduzierte Bewegung und Abschnittssprung geprüft. TypeScript, betroffenes ESLint und alle 41 Tests einschließlich Timing-Regressionstest erfolgreich. Für diese begrenzte Timingkorrektur kein neuer Produktionsbuild, Commit, Push oder Deployment. Gestalterische Nutzerabnahme offen.

## Tintenanimation veröffentlicht (23. Oktober 2026)

Auf „Mach live“ wurde die gewählte Tintenanimation als `770fad872ecb9baeae5162af32864026958ed0fd` auf `codex/feat/vgpu-homepage` gesichert und gepusht. Bestehende Git-Identität Thimorrow erhalten. Vollständiges ESLint zusätzlich erfolgreich; TypeScript, 40 Tests und Produktionsbuild für diese Fassung bereits lokal geprüft.

Vercel-Produktion `dpl_EmBL72rZDvGkPfscRURNgg5oTRWP` ist `READY`, weist genau diesen Commit aus und ist ohne Aliasfehler `thimofej.de` sowie `www.thimofej.de` zugeordnet. Deployment: https://thimofej-2vz58vqee-zapkothimofej-2616s-projects.vercel.app.

Direkt auf https://thimofej.de geprüft: WebGPU bereit, „Neu mischen“ entfernt, Tintenwelle in mehreren sichtbaren Klickphasen, Pause und Touch bei 390×844. Keine erfassten Browserfehler und kein horizontaler Überlauf. Die lokalen Nicht-veröffentlicht-Angaben unten beschreiben den vorherigen Zwischenstand und sind für diese Änderung überholt. Eine während des Releases separat entstandene lokale Änderung in `src/app/layout.tsx` wurde nicht in diesen Release aufgenommen.

## Thimorrow: Tinte gewählt und lokal integriert (23. Oktober 2026)

- Auftrag: „Neu mischen“ entfernen und den Hero-Klickimpuls auf das Schriftfeld übertragen.
- Der erste Versuch mit starker geometrischer Verzerrung war „lowkey cool“, aber nicht die gewünschte Richtung. Anschließend auf ausdrücklichen Wunsch mit `emil-get-creative` und `emil-prototype` vier Varianten unter `/proto/thimorrow` verglichen: Original, Tinte, Relief und Fluss.
- Nutzerentscheidung: „Hab mich für Tinte entschieden“. Tinte verändert lokal Kontur und Füllung, nicht die Geometrie. Neun Zeilen, vorhandene Farben, Ausgangskomposition und Mausreaktion bleiben. Eine rundum laufende, unregelmäßige Welle enthält einen kurzen gerichteten Nachimpuls; anschließend vollständige Rückkehr. Prototyp-Standard: Stärke 1, Tempo 1; Ringbreite gegenüber dem Hero mit Faktor 2.4, Füllwechsel über `smoothstep(0.015, 0.36, pressure)`. Pigment wird mit der Hintergrundfarbe gemischt, damit keine körnige Transparenz entsteht.
- Original, Relief und Fluss werden nicht übernommen; der Nutzer hat keinen weiteren Ablehnungsgrund genannt. Vergleichsoberfläche und ihre Quelldateien sind entfernt; `/proto/thimorrow` liefert wieder 404. Keine neue Bibliothek, kein Commit, Push oder Deployment beauftragt.
- Prototypen: TypeScript, ESLint und bestehende 38 Tests erfolgreich. Alle vier Varianten mit WebGPU auf Desktop und 390×844 visuell geprüft; kein horizontaler Überlauf. Mehrfachklicks, vollständiges Ende der GPU-Arbeit nach Ablauf, Regler, Kopierrückmeldung, Auswahl nach Neuladen und reduzierte Bewegung geprüft. Integrierte Homepage: TypeScript, betroffenes ESLint, 40 Tests einschließlich neuer Impuls-Lebenszyklusprüfungen und Produktionsbuild erfolgreich; weiterhin 16 bestehende Warnungen aus `academy/catalog/catalog.css`. Mit WebGPU auf Desktop und 390×844 geprüft: Tintenwelle, Mehrfachklicks, sichtbarer Tastaturfokus und Enter, Pause, reduzierte Bewegung, Hero sowie Vorwärts-/Rückwärtsscrollen. Keine erfassten Laufzeitfehler oder horizontalen Überläufe. Simulierter WebGPU-Ausfall: neun HTML-Schriftzeilen und Kontakt bleiben verfügbar; der dann funktionslose Wellenknopf ist deaktiviert. Vorschau unter http://localhost:3000/. Auswahl der Richtung durch den Nutzer erfolgt, Abnahme der integrierten Fassung noch offen. Kein Commit, Push oder Deployment.

## Direkter Griff und Handyverbesserungen veröffentlicht (23. Oktober 2026)

Auftrag „push live“ ausgeführt. Code-Commit `b2f60185628e276bca288928d7933774820b135c` mit bestehender Nutzeridentität auf `codex/feat/vgpu-homepage` gepusht; kein Merge nach `main`. Lokale Typprüfung, betroffenes ESLint, 38 Tests und Produktionsbuild zuvor erfolgreich; die 16 bekannten Academy-CSS-Warnungen bestehen.

Vercel-Produktion `dpl_N9myeqmzrJroW7zL5qTEBFKoGLKP` ist `READY`, weist exakt diesen Commit aus und ist ohne Aliasfehler `thimofej.de` und `www.thimofej.de` zugeordnet. Deployment: https://thimofej-f90uv664f-zapkothimofej-2616s-projects.vercel.app. Produktionsbuild bei Vercel rund 18 Sekunden.

Direkt auf https://thimofej.de geprüft: WebGPU bereit, acht Ziehschritte von je 15 px führen unmittelbar zu je 0.075 Radiant Drehung; nach Loslassen 15 aufeinanderfolgende Messwerte mit Bandversatz 0. Desktop und 390×844 visuell geprüft, kein horizontaler Überlauf, Weiter und Pause ohne Überschneidung; neue Viewport-Einstellungen ausgeliefert. Keine erfassten Browserfehler; Vercel lieferte für dieses Deployment im abgefragten 10-Minuten-Fenster keine Fehler-/Fatal-Logs. Echtes Handy und subjektives Federgefühl bleiben eine gesonderte Nutzerabnahme. Die nachfolgenden lokalen Angaben dokumentieren die Zwischenstände vor dieser Veröffentlichung.

## Korrektur: direkter Griff statt doppelter Verzögerung (23. Oktober 2026, lokal)

Nutzerrückmeldung zum vorigen lokalen Stand: Der elastische Effekt fühlt sich während des Festhaltens schlecht an, erst nach Loslassen besser. Die vorherige Abstimmung ist damit nicht gestalterisch akzeptiert.

- Während eines tatsächlichen Skulptur-Griffs folgt die Grunddrehung jetzt direkt dem Zielwinkel; die bisherige exponentielle Verzögerung entfällt in dieser Phase. Nach Loslassen bleiben das vorhandene Ausrollen und seine Dämpfung erhalten.
- Die separate Bandverformung ist kleiner: Ziel `-0.18 * tanh(angularVelocity * 0.09 / 0.18)` während des Griffs. Loslassen setzt nur das Federziel auf 0, ohne Position oder Federgeschwindigkeit zurückzusetzen. Die nachlaufende Grunddrehung erzeugt keinen neuen Bandzug. Dadurch gibt es keinen zusätzlichen Kraftaufbau beim Loslassen. Federparameter 260/23 bleiben. Vorige mobile Korrekturen unverändert.
- Zwei Regressionstests reproduzierten zuvor das Hinterherlaufen beim Griff und den neuen Zug während des Ausrollens. Jetzt alle 38 Tests, TypeScript und betroffenes ESLint erfolgreich. Browser: zwölf Ziehschritte von jeweils 15 px ergeben jeweils 0.075 Radiant ohne verbleibenden Zielabstand, auch über den Winkelsprung bei ±π. Stillhalten verändert den Grundwinkel nicht; Gegenbewegung, Loslassen und 15 aufeinanderfolgende Nullwerte der Feder geprüft. Maximaler Bandparameter im Durchlauf 0.145. Touch bei 390×844: 120 px ergeben 0.6 Radiant, ohne Neigung, Seitenscrollen oder horizontalen Überlauf. Pause und reduzierte Bewegung geprüft, keine erfassten Laufzeitfehler.
- Lokale Vorschau weiterhin http://localhost:3000/. Persönliche Abnahme offen; kein Commit, Push oder Deployment.

## Elastischer Nachlauf und mobile Bedienung (23. Oktober 2026, lokal)

Auftrag: zuerst den elastischen Effekt mit `emil-animations` verbessern, danach die Handybedienung mit `emil-mobile-native`. `emil-ask-emil` als vorgeschriebenen Router und `ego-browser` für die lokale Prüfung verwendet. Keine neue Veröffentlichung beauftragt.

- Nachlauf: bestehende Motion-Feder schneller und kontrollierter abgestimmt (Steifigkeit 260, Dämpfung 23, Masse 1). Die bisher hart begrenzte Anregung ist durch stetig zunehmenden Widerstand ersetzt: `-0.42 * tanh(angularVelocity * 0.22 / 0.42)`. Kräftige Gesten bleiben unterscheidbar, die Feder erhält ihre Geschwindigkeit bei Gegenbewegungen und schwingt einmal klein zurück. Physikparameter bewusst erhalten, da die installierte Motion-Version bei zeitbasierten Federn keine übernommene Geschwindigkeit verwendet. Shader, Ausgangswinkel und akzeptierte Hintergrundwerte unverändert.
- Homepage-Touch: erst nach 8 px zwischen horizontalem Drehen und vertikalem/diagonalem Scrollen unterscheiden. Horizontales Ziehen verändert nur den Drehwinkel; native Scrollabbrüche verwerfen das verbleibende Drehziel. Das Labor behält seine Bedienung auf beiden Achsen. Die Homepage erlaubt zusätzlich ausdrücklich Pinch-Zoom auf der Zeichenfläche.
- Mobile Oberfläche: `viewport-fit=cover`, Tastaturanpassung und passende mandarinfarbene Browserleiste für beide Systemeinstellungen. Safe-Area-Abstände für Header, Hauptinhalte, Pause und Academy-Seite. Weiter-Link und Pause überschneiden sich weder im Hoch- noch im Querformat. Eigene Druckrückmeldung, mindestens 44 px hohe Headerlinks, Hover nur mit präzisem Hover-Zeigegerät; Text und E-Mail bleiben auswählbar. Bestehende svh-Höhen und natives Dokument-Scrollen erhalten.

Prüfstand:
- TypeScript, betroffenes ESLint, alle 36 Tests und Produktionsbuild erfolgreich. Neue Regressionstests für progressive Federanregung und Touch-Gestenabsicht, bestehende Federprüfungen auf kleinen Rückschwung angepasst. Weiterhin 16 bekannte CSS-Keyframe-Warnungen in der unveränderten `catalog.css`. Der eingeschränkte Buildlauf blieb ohne Ergebnis und wurde beendet; anschließender Build außerhalb der Sandbox erfolgreich.
- Lokaler WebGPU-Browser: wiederholtes Greifen, schnelle Gegenbewegung und vollständiges Abklingen (15 aufeinanderfolgende Messwerte mit Bandversatz 0), Pause und reduzierte Bewegung. Desktop-Durchlauf maximaler Bandparameter -0.428/+0.446 während der Gegenbewegungen, keine erfassten Laufzeitfehler. Touch-Durchlauf: horizontales Drehen um 0.7 Radiant bei unverändertem Neigungswinkel und Scrollposition 0; anschließendes vertikales Wischen scrollt 234.5 px, ohne Dreh-/Neigungsänderung.
- Desktop 1440 px, mobile Emulation 320×760 / 390×844 und Querformat 844×390 visuell geprüft. Kein horizontaler Überlauf; Weiter-/Pause-Flächen getrennt. Kontakt und Academy mobil geprüft. Simulierter WebGPU-Ausfall bei 320 px lässt Schriftalternative und Kontakt erreichbar; sichtbarer Tastaturfokus auf dem Sprunglink bestätigt. Browseremulation musste pro CLI-Aufruf neu gesetzt werden; frühere Messung ohne aktive Emulation wurde verworfen.
- Kein echtes Handy getestet. Safari-Adressleiste, reale Displayausschnitte, Zweifingerzoom, Softwaretastatur und tatsächliches Touchgefühl brauchen Hardwareabnahme. Gestalterische Nutzerabnahme des Federgefühls offen. Lokale Vorschau: http://localhost:3000/. Kein Commit, Push, Merge oder Deployment in diesem Auftrag.

## Veröffentlichung am 23. Oktober 2026

Auf ausdrücklichen Auftrag „Mach live“ ist der Hero-Stand einschließlich stärkerem elastischem Nachlauf veröffentlicht. Code-Commit `f091e5ff58e6a6a9737990c503f8abaa99015e16` wurde mit der bestehenden Nutzeridentität auf `codex/feat/vgpu-homepage` gesichert und gepusht. Kein Merge nach `main`.

Vercel-Produktion `dpl_2jSoHsmdPvmbwrzVatEzxfvxjs6T` meldet `READY`, genau diesen Commit und erfolgreiche Zuordnung von `thimofej.de` sowie `www.thimofej.de`, ohne Aliasfehler. Deployment: https://thimofej-881shdt3m-zapkothimofej-2616s-projects.vercel.app.

Direkt auf https://thimofej.de geprüft: WebGPU-Szene bereit, Ausgangswinkel 2.45/0.28, drei aufeinanderfolgende Ziehbewegungen mit erneutem Greifen und jeweils 3 Radiant Drehung. Der ausgelieferte Bandversatz erreicht im Test -0.398, schwingt bis +0.029 zurück und endet bei 0. Keine erfassten Laufzeitfehler. Desktop und Mobilansicht 390×844 visuell geprüft, kein horizontaler Überlauf. Die folgenden „noch nicht veröffentlicht“-Angaben beschreiben jeweils den damaligen Zwischenstand und sind durch diesen Nachweis überholt.

## Hero: Referenzwinkel und wiederholtes Drehen (23. Oktober 2026)

### Nachlauf stärker und elastischer

Anschließender Nutzerwunsch: Nachlauf deutlicher und etwas elastischer. Verstärkung von 0.10 auf 0.18 pro Drehgeschwindigkeit, Zielbegrenzung von 0.22 auf 0.36 Radiant. Statt exponentiellem Folgen verwendet der Bandversatz jetzt eine unterdämpfte Feder aus der bereits installierten Motion-Bibliothek (Steifigkeit 190, Dämpfung 16). Sie läuft auf der vorhandenen Szenenuhr, erhält Geschwindigkeit bei Richtungswechseln und schwingt kurz über die Grundstellung. Pause und reduzierte Bewegung setzen auch die Federgeschwindigkeit zurück. Blickwinkel, Steuerung und Hintergrundwerte unverändert.

Geprüft: TypeScript, ESLint, 34 Tests und Produktionsbuild erfolgreich; weiterhin die bestehenden 16 Academy-CSS-Warnungen. Neue Tests für sanftes Überschwingen und vollständiges Abklingen bei 30/60/144 Hz, schnelle Richtungswechsel und Zurücksetzen ohne Restschwung. Desktop-Ziehen, Gegenbewegung und Touch bei 390×844 im WebGPU-Browser geprüft. Gemessener Bandparameter im Desktop-Durchlauf: maximaler Ausschlag -0.397, Rückschwingung +0.029, anschließend exakt 0; reduzierte Bewegung ebenfalls 0. Keine erfassten Laufzeitfehler oder mobiler horizontaler Überlauf. Keine Veröffentlichung; gestalterische Abnahme offen.

Aktueller Auftrag: den aufrechteren, leicht schrägen Blickwinkel aus dem Nutzerbild übernehmen; nach Loslassen und erneutem Greifen beliebig in derselben Richtung weiterdrehen. Stillhalten außerhalb der Skulptur soll keine automatische Drehung auslösen. Zusätzlich ist ein passendes gestalterisches Detail beauftragt.

- Orbit-Preset: `yaw: 2.45`, `pitch: 0.28`. Im Desktopbrowser mit der Bildreferenz abgeglichen. Gilt für die Homepage und die Standardwerte des Labors; vorhandene gespeicherte Laborwerte können weiterhin abweichen.
- Der horizontale Anschlag bei ±3.14 ist entfernt. Sichtbarer Winkel und Zielwinkel werden gemeinsam um volle Umdrehungen zurückgesetzt, ohne Sprung oder Richtungswechsel. Damit bleiben auch gespeicherte Winkel begrenzt und gültig. Die vertikale Neigungsgrenze bleibt erhalten.
- Zusätzlicher Griff-Effekt: obere Schriftbänder reagieren mit leichtem versetztem Nachlauf auf die tatsächliche Drehbewegung. Beim Stillhalten kehren sie zur Grundstellung zurück; Pause und reduzierte Bewegung deaktivieren diesen Zusatz. Keine neue Bibliothek und keine Änderung an den akzeptierten Hintergrundwerten.
- Der Scrollübergang verwendet auch für den Benutzerwinkel den kürzesten äquivalenten Drehweg, statt vorherige Umdrehungen zurückzuspulen.

Prüfstand: TypeScript, betroffenes ESLint, alle 32 Tests einschließlich neuer Regressionstests und Produktionsbuild erfolgreich. Weiterhin 16 bestehende CSS-Keyframe-Warnungen in der unveränderten Academy-Demo. Browser: Desktop 1440px, sechs echte Ziehfolgen mit je 3 Radiant, insgesamt 9 Radiant pro Richtung, erneutes Greifen und jeweils kein Weiterdrehen beim Stillhalten; keine erfassten Laufzeitfehler. Die höherliegende Browser-Mausautomatisierung lieferte zunächst nicht alle Ziehschritte aus; erfolgreiche Prüfung anschließend über direkte Browser-Eingabeereignisse. Nachlauf und Scroll-Zwischenphasen visuell geprüft, Übergang vorwärts und zurück. Mobil 390×844 ohne horizontalen Überlauf, drei wiederholte Touch-Drehungen und vertikales Touch-Scrollen geprüft. Nach aktivierter reduzierter Bewegung bleiben Szenenzeit und Drehwinkel stabil. Lokale Vorschau auf Port 3001; kein Commit, Push oder Deployment. Gestalterische Abnahme durch den Nutzer noch offen.

Stand: 23. Oktober 2026. Diese Datei fasst den aktuellen Chat zusammen und ist der Einstieg für die Fortsetzung. Frühere Versuche in `orbit-direction.md` sind teilweise überholt.

## Entscheidung des Nutzers

„Fürs Erste bin ich damit zufrieden.“ Raster und ruhige Welle gefallen; die Klickanimation ist „auch schon not bad“. Diesen Stand als Grundlage erhalten. Keine weitere ungefragte Überarbeitung der Animation. Das ist eine vorläufige gestalterische Abnahme des Labors, keine Freigabe für Veröffentlichung oder Homepage-Umbau.

## Ziel für die spätere Übernahme

Nutzerentscheidung vom 23. Oktober 2026: Die neue Ansicht aus dem Orbit-Labor soll die bisherige Homepage ersetzen. Labor und Seitenvorschau sind damit die Entwicklungsgrundlage für die künftige Hauptansicht, nicht nur ein dauerhaft separates Experiment.

**Übernahme inzwischen beauftragt.** Nach dem Auftrag zum Push hat der Nutzer am 23. Oktober 2026 ausdrücklich „mach es zur neuen Homepage“ angewiesen. Damit ist die frühere Wartevorgabe für die Übernahme aufgehoben: `/` verwendet die aktuelle Spielraum-Fassung. `/lab/type` bleibt Labor, `/lab/home` eine nicht indexierte Vorschau derselben Komponente. Git-Push, Merge und Produktionsbereitstellung weiterhin getrennt nachweisen.

## Aktueller Zustand

- Vorschau: http://127.0.0.1:3000/lab/type, bei laufendem lokalem Entwicklungsserver. Start mit `npm run dev`.
- Orbit ist gewählt. Räumliche Schrift mit Licht, Material, Drag und gedämpftem Nachlauf, umgesetzt mit vgpu/WebGPU.
- Mandarine/Tinte bleibt. Graphit-Auswahl und sichtbare Überschrift „Orbit“ sind entfernt.
- Festes Zeichenraster mit THIMOFEJ, ZAPKO und THIMORROW. Ruhige Bewegung entsteht durch langsam fließende Lichtformen.
- Hintergrundklick: Ausbreitung rundum, danach ein kurzer gerichteter Nachimpuls innerhalb der ersten Welle. Die ruhige Welle wird dabei lokal weicher und schwächer und kehrt anschließend zurück.
- Keine Herzen oder sonstigen Symbolformen. Klicks auf die Schrift variieren die Schrift; Ziehen dreht sie. Die Trennung zum Hintergrund verwendet eine angenäherte Hülle der Schrift, keine pixelgenaue Trefferprüfung.
- DialKit im Dark Mode, 27 Regler. Zwei getrennte Random-Aktionen: ruhige Welle bzw. Klickwelle einschließlich Nachimpuls. Raster und Zusammenspiel werden durch Random nicht geändert.
- Zurücksetzen stellt die akzeptierten Standardwerte her. JSON-Export und Speicherung im Browser sind vorhanden. Browserwerte können die Standardwerte überschreiben (`tz-background-tuning`).
- Folio bleibt als ungenutzter Quellcode archiviert. Echo ist aus der UI entfernt und in `echo-idea.md` beschrieben.

## Akzeptierte Einstellungen

Alle 27 vom Nutzer übermittelten Zahlenwerte sind als Standardwerte in `src/components/type-lab/background-tuning.ts` übernommen. Sie werden von DialKit, Renderer und Zurücksetzen gemeinsam verwendet.

Unabhängige Momentaufnahme: [orbit-background-accepted-2026-10-23.json](orbit-background-accepted-2026-10-23.json).

Wichtige Werte: Rasterdeckkraft 0.085, ruhige Welle 0.22, Tempo 0.55, weiche Kanten 2, Mitte zurücknehmen 0.65; Klickdeckkraft 1.15, Abklingen 0.8, Verformung 2.6, Unregelmäßigkeit 0.75; Verdrängung 0.21, Rückkehrtempo 3.6. Schrift und Material stehen separat in `src/components/type-lab/orbit-preset.json`.

## Referenz und Grenzen

Maßgebliche Referenz: https://x.com/mdnlabs/status/2110417510314967075. Im Browser abgespielt und über Screenshots bis zu 100-ms-Abständen untersucht. Bei der Analyse mehrere Klicks auseinanderhalten. Die Aufnahme zeigt keine Maustasten-Markierung; der genaue Originalalgorithmus ist unbekannt. Unsere Umsetzung ist eine visuelle Nachbildung, keine belegte identische Kopie.

Frühere Referenz: https://x.com/shivasainix/status/2110622613827682570.

## Prüfstand

- Live im Browser geprüft: WebGPU-Darstellung, einzelne Klicks und überlagerte Wellen, dunkles DialKit, getrennte Random-Aktionen mit Vergleich der tatsächlich geänderten Werte, Speicherung, Neuladen, Export und Ein-/Ausblenden.
- Nach den letzten Funktionsänderungen: TypeScript, betroffenes ESLint und neun relevante Tests erfolgreich.
- Nach Übernahme der akzeptierten Werte: alle 27 Werte exakt gegen die Nutzervorgabe verglichen, Validierung und TypeScript erfolgreich.
- Kein erneuter vollständiger Produktionsbuild nach den letzten Animationsänderungen. Keine CI- oder Produktionsbestätigung.
- Änderungen liegen lokal, teilweise noch als unversionierte Dateien vor. In diesem Auftrag kein Commit, Push oder Deployment. Die Homepage wurde nicht auf das Labor umgestellt.

## Fortsetzung

Zuerst diese Datei und die aktuellen Projektregeln lesen. Den akzeptierten Stand erhalten und auf die nächste konkrete Rückmeldung warten. Falls später veröffentlicht werden soll, zuerst den endgültigen Stand vollständig bauen und prüfen; Veröffentlichung separat beauftragen lassen.

## Erste Seitenvorschau (durch die Prototypen unten abgelöst)

Die danach beauftragte erste Ansicht und der erste Scrollübergang sind separat unter `/lab/home` umgesetzt. Komponenten: `src/components/orbit-preview/OrbitHome.tsx` und `orbit-home.css`. Das Labor `/lab/type` bleibt bestehen; die öffentliche Homepage ist unverändert.

Die Vorschau nutzt die akzeptierten Standardwerte ohne lokale DialKit-Overrides, eine kleine Navigation und eine persönliche Vorstellung aus den vorhandenen Seiteninhalten. Beim Scrollen verkleinert und verschiebt sich die Schrift, während das Zeichenfeld bestehen bleibt. Auf schmalen Ansichten rückt die Schrift nach oben; bei reduzierter Bewegung entfällt diese räumliche Scrollbewegung. Der Renderer erhält einen optionalen Präsentationswert, standardmäßig 0, sodass die Labordarstellung unverändert bleibt.

Geprüft: Vorschau HTTP 200, WebGPU-Darstellung, Desktop-Scrollübergang, Navigation, 390-Pixel-Ansicht ohne horizontalen Überlauf, TypeScript, betroffenes ESLint und 23 Tests. Noch kein Produktionsbuild/Deployment und keine menschliche Abnahme dieser neuen Seitenvorschau.

## Zwei neue Fortsetzungen unter `/lab/home` (23. Oktober 2026)

Auftrag: Den vorhandenen Hero erhalten, den restlichen bisherigen Seitenentwurf verwerfen. Nach Einsatz von `emil-get-creative` und einem Richtungsabgleich hat der Nutzer ausdrücklich zwei Prototypen bestellt: einen mit bewegter Plakattypografie und einen mit mehr visuellen Experimenten. **Inzwischen ist Spielraum als Richtung gewählt; siehe Fortsetzung unten. Keine Abnahme der gesamten Seite.**

- `/lab/home?v=1`: **Plakat**. Dunkle, große persönliche Vorstellung; mandarinenfarbener Academy-Abschnitt mit einer Aufnahme der vorhandenen lokalen Produktdemo; dunkler Kontaktabschluss. Keine erfundenen Arbeiten. Der Academy-Beitrag ist als Teamarbeit / Frontend gekennzeichnet.
- `/lab/home?v=2`: **Spielraum**. Reproduzierbare, per Klick neu mischbare Schriftkomposition; Zeilen reagieren auf Maus und Scrollen. Danach persönliche typografische Komposition mit rotierendem TZ, knapper Academy-Verweis und Kontakt.
- Beide verwenden denselben bestehenden Hero inklusive akzeptierter Material- und Hintergrundwerte. `TypeScene`, Shader, `background-tuning.ts`, Preset und `/lab/type` wurden in diesem Auftrag nicht geändert. Die öffentliche Homepage bleibt getrennt.
- Umschalten unten oder mit `1` / `2` und Pfeiltasten. `R` startet den Hero neu. Beim Wechsel nach dem Hero beginnt die neue Fortsetzung am ersten Abschnitt. URL merkt die Variante.
- „Regler“ öffnet Dark-DialKit: Schriftgröße, Freiraum, Schriftversatz und Bewegung. Werte betreffen nur die Fortsetzungen. „Entwurf speichern“ schreibt Variante und vollständige Einstellungen inklusive Seed über den lokalen, in Produktion gesperrten Endpunkt `/lab/home/save` nach `src/components/orbit-preview/saved/`. Kopie in die Zwischenablage wird versucht; bei nicht verfügbarer Dateispeicherung gibt es JSON-Download. Die kleine Vergleichsliste behält gespeicherte Stände solange die Seite geöffnet bleibt. QA-Speicherdateien wurden entfernt, sie sind keine Nutzerentscheidung.

### Gestaltungsgrundlage

Aus „halbwegs guten Hero“ und „den Rest ... von neu“ abgeleitete, anschließend als zwei Prototypen beauftragte Regeln: Hero bewahren; Schrift als Komposition; Mandarine/Tinte; klar unterschiedliche Szenen; inputgebundene Bewegung mit lesbaren Ruhephasen; keine Kartenwand oder dekorativen Endlosschleifen.

Referenzen: [Studio Dumbar / Cities in Motion](https://studiodumbar.com/work/cities-in-motion) für bewegliche Raster und [COLLINS / S.F. Symphony](https://wearecollins.com/story/sfsymphony/) für typografischen Rhythmus. Keine identische Nachbildung. Das ist eine eigene gestalterische Ableitung.

### Dateien und Prüfstand

`OrbitHome.tsx` enthält den gemeinsamen Hero und Umschalter, `Plakat.tsx` und `Spielraum.tsx` die Richtungen. `prototypes.css`, `PageDials.tsx`, `print-config.ts`, die lokale Speicherroute und `tests/page-prototypes.test.mjs` ergänzen den Vergleich. Das Academy-Bild unter `public/lab-home/academy-catalog.png` ist aus der bestehenden lokalen Demo aufgenommen, kein Screenshot eines live geprüften Produkts.

- Browser: Desktop 1500×829, Mobil 390×844, schmal 320px auch mit maximaler Schriftgröße/Freiraum; keine horizontalen Seiten- oder Überschriftenüberläufe. Alle Abschnitte angesehen.
- Geprüft: Umschalten, Tastatur, mehrfaches Mischen, Maus-/Scrollreaktion, Pause auch über Variantenwechsel, Replay, Regler einschließlich Pfeiltasten ohne versehentlichen Variantenwechsel, Zurücksetzen und JSON-Dateispeicherung. Ungültige Speicheranfrage: HTTP 400.
- Reduzierte Bewegung im Browser emuliert: Schriftbild bleibt bei Maus/Scroll ruhig. Fehlendes WebGPU simuliert: bestehender Fehlerzustand, persönliche Inhalte und Kontakt weiterhin erreichbar.
- Keine Runtime-/Log-Fehlereinträge im instrumentierten Interaktionsdurchlauf. Kurze Desktop-Stichprobe mit 90 Frame-Callbacks: Median 8,3 ms, keine Pause über 50 ms; keine allgemeine Leistungszusage.
- TypeScript, betroffenes ESLint und 25 Tests erfolgreich. `npm run build` ebenfalls erfolgreich, einschließlich `/lab/home` und Speicherroute. Der erste Build blieb in der eingeschränkten Sandbox ohne Ergebnis und wurde beendet; der reguläre lokale Lauf war erfolgreich. Sichtbarer Tastaturfokus und Variantenwahl nach Neuladen zusätzlich geprüft. Kein Commit, Push, Deployment oder menschliche Abnahme.

## Spielraum: räumlicher Übergang und weitere Ausarbeitung

Nutzerentscheidung: „Spielraum ist absolut geiler“, es fehlt aber noch der starke Wow-Moment. Danach ausdrücklich den Hero-Ausstieg und den Rest verbessern, mit kreativen Ideen und `emil-get-creative`. Die erste räumliche Verwandlung wurde während der Umsetzung positiv aufgenommen: „geiler anfang wenn das polished ist und zu Thimorrow übergeht“. Das ist Zustimmung zur Richtung, keine Abnahme der fertigen Seite und keine Veröffentlichungsfreigabe.

- `/lab/home` öffnet jetzt standardmäßig **Spielraum**. `?v=1` bleibt als frühere Plakat-Vergleichsrichtung erreichbar.
- Ein durchgehender WebGPU-Canvas trägt den Hero in den Schriftabschnitt. Die drei Ringe öffnen sich entlang ihrer Bogenlänge und verzweigen in neun Bänder. Die Schrift wechselt dabei von THIMOFEJ zu THIMORROW. Hintergrundraster und Licht wechseln kontrolliert in die dunkle Fläche; im ausgebreiteten Zustand wechseln volle und konturierte Schriftzeilen.
- Der Ablauf folgt nativem Scrollen ohne Scroll-Sperre. Zwischen 1,1 und 1,6 Bildschirmhöhen bleibt die Schrift ausgefaltet; danach öffnen sich die Bänder seitlich für die persönliche Vorstellung. Der gesamte Übergang ist rückwärts scrollbar.
- Mausposition gibt den ausgefalteten Bändern räumliche Tiefe mit gedämpftem Nachlauf. Mischen wechselt reproduzierbar den Seed. In der ruhenden Schriftfläche läuft die Hero-Zeit nicht unnötig weiter.
- Der Original-Hero bei Präsentationswert 0 und `/lab/type` verwenden weiterhin dieselben Einstellungen und Materialwerte. Die gemeinsame Renderpipeline und `TypeScene` haben einen optionalen Unfold-Zweig erhalten; Shader, Renderer und TypeScene wurden deshalb in dieser Fortsetzung verändert. `background-tuning.ts`, akzeptierte JSON-Werte und Orbit-Preset bleiben unverändert. Lokale Browser-Overrides im ursprünglichen Labor wurden nicht zurückgesetzt.
- Vorstellung: räumlich kippender, doppelt gerandeter TZ-Stempel. Academy: echte vorhandene Demo als sich beim Scrollen öffnender Ausschnitt; auf Touch und bei reduziertem Bewegungswunsch direkt sichtbar. Kontakt: reagierende Einzelbuchstaben im „Hallo“-Mail-Link, mit Rückkehr beim Verlassen. Alle Inhalte bleiben ohne Hover bedienbar.
- Bei fehlendem WebGPU bleibt die vorhandene DOM-Schriftkomposition als Alternative sichtbar. Reduzierte Bewegung zeigt eine statische Schriftfläche ohne lange angeheftete Scrollstrecke; Texte und Links bleiben sichtbar.

Prüfungen dieser Fortsetzung: WebGPU-Shader im Browser ausgeführt, mehrere Übergangsphasen visuell angesehen, rasches Vor-/Zurückscrollen, wiederholtes Mischen, Pause, Regler/Pfeiltasten, dynamische Kontaktbuchstaben samt Rückkehr, reduzierte Bewegung und WebGPU-Ausfall. Mobil 390×844 und schmal 320px mit maximaler Schriftgröße ohne Dokument-/Textüberlauf. Ursprüngliches `/lab/type` erneut gerendert. TypeScript, betroffenes ESLint, 27 Tests und vollständiger Produktionsbuild erfolgreich. Keine Runtime-/Log-Fehlereinträge im instrumentierten Interaktionslauf. Kein Commit, Push, Deployment oder finale menschliche Abnahme.

Nächster Schritt: Den zusammenhängenden Ablauf vom Hero aus ansehen und die noch offene gestalterische Abnahme einholen. Kein weiterer Richtungs-Picker nötig; Spielraum weiter ausarbeiten. Übernahme in die öffentliche Homepage weiterhin nur nach expliziter Freigabe.

### Korrektur: Übergang zurücknehmen

Nutzerfeedback danach: „Jetzt ist der Übergang schon too much“. Maßgeblicher aktueller Stand: direkte Interpolation von der bestehenden Skulptur in das THIMORROW-Schriftfeld. Das großräumige Aufrollen entlang einer expandierenden Bogenlänge, zusätzliche Drehungen, der helle Zwischenfarbwert und das seitliche Auseinanderfliegen sind entfernt. Zusätzliche Schriftzeilen entstehen erst später im Übergang. Der Schriftabschnitt ist wieder eine Bildschirmhöhe lang; keine zusätzliche halbe Bildschirmhöhe zum Anheften. Der Rest der Seite bleibt erhalten.

Diese Korrektur ersetzt die oben beschriebene Bogenlängen-/Ausstiegs-Choreografie. Browser: Desktop und 390px, Vor-/Rückwärtsscrollen, mehrere Zwischenphasen; keine Browserfehler im instrumentierten Desktop-Lauf. TypeScript, betroffenes ESLint und 27 Tests erfolgreich. Kein erneuter vollständiger Produktionsbuild für diese begrenzte Korrektur, kein Deployment und weiterhin keine gestalterische Gesamtabnahme.

### Aktuell: Mittelweg zwischen beiden Übergängen

Nächster Nutzerwunsch: „mach die mitte von jetzt und davor“. Die direkte Formverwandlung erhält in der mittleren Phase eine begrenzte räumliche Betonung: maximal etwa 14 Grad zusätzliche Drehung, 8 Prozent Größenakzent und etwas Tiefe. Alle Zusätze laufen an beiden Endpunkten auf null, damit Hero und fertiges Schriftfeld unverändert bleiben. Eine wörtliche 50/50-Mischung der gegenläufigen Geometrien zog die Schrift zu stark zusammen und wurde nach Sichtprüfung verworfen. Zusätzliche Zeilen entstehen zeitlich zwischen den beiden vorherigen Fassungen; der Schriftabschnitt umfasst 125 statt 100 bzw. 150 Bildschirmhöhen-Prozent. Der Farbblitz und das seitliche Auseinanderfliegen bleiben entfernt. Restliche Abschnitte unverändert.

Geprüft: WebGPU auf Desktop und bei 390px, mehrere Phasen, Vor-/Rückwärtsscrollen, keine Browserfehler oder horizontalen Überläufe; 27 Tests erfolgreich. Kein neuer Produktionsbuild für diese reine Shader-/CSS-Abstimmung, keine Veröffentlichung, gestalterische Bewertung offen.

### Aktuell: stärkere Fassung wiederhergestellt

Nach „mach noch meh“ folgte vor einer weiteren Verstärkung „ok mach eifnach wie es davor war“. Wiederhergestellt ist die stärkere Fassung von vor dem Zurücknehmen: vollständiges räumliches Aufrollen, Wechsel zu THIMORROW, hellerer Materialübergang, seitliches Öffnen zur Vorstellung und 150svh Schriftabschnitt. Die späteren Reduktions- und Mittelweg-Abstimmungen sind damit abgelöst. Die übrigen Seitenabschnitte bleiben erhalten.

Geprüft: WebGPU-Phasen Aufrollen, fertige Schrift und Ausstieg im Browser ohne Runtime-/Log-Fehler; TypeScript, betroffenes ESLint und vier relevante Prototyp-/Shader-Tests erfolgreich. Kein neuer Produktionsbuild oder Deployment.

### Letzte zusätzliche Umdrehung entfernt

Nutzer: „die eine Letze drehung zu viel“. Nur den Drehwinkel beim Aufrollen um eine volle Umdrehung reduziert (`turn - π` statt `turn + π`, jeweils mit dem Öffnungsfortschritt abgebaut). Die Ausgangsorientierung ist dadurch identisch; die Schrift gelangt mit einer Umdrehung weniger zum gleichen THIMORROW-Endzustand. Restliche Geometrie, Farben, Dauer, seitlicher Ausstieg und Seitenabschnitte unverändert. Im WebGPU-Browser vorwärts/rückwärts und in Zwischenphasen geprüft, keine Runtime-/Log-Fehler; vier relevante Tests erfolgreich. Kein neuer Produktionsbuild oder Deployment.

### Persönliche Vorstellung mit Foto und Alter

Der Nutzer hat den zuletzt abgestimmten Übergang mit „Ich mag es“ bestätigt. Diesen Übergang bewahren. Anschließend ausdrücklich „Code Form und ich“ komplett neu gestalten, zeigen, dass er 15 ist, und ein Foto verwenden. Das bereitgestellte Foto stammt aus `/Users/thimofejzapko/Downloads/589508867_17928695358178806_5087251624761772373_n.jpg`.

- Der bisherige Code/Form-Block und der TZ-Stempel sind durch `#ueber-mich` ersetzt: großes Porträt, „Ich bin Thimofej.“, eine eigenständige „15“ mit „Jahre alt.“, kurze Vorstellung und GitHub-Link.
- Alter 15 ist eine ausdrückliche Nutzerauskunft vom 23. Oktober 2026. Kein Geburtstag bekannt; Alter nicht aus dem Foto abgeleitet und keine automatische Altersberechnung erfunden. Bei späterer Veröffentlichung/Aktualisierung erneut beachten.
- Foto liegt als `public/lab-home/thimofej-portrait.jpg` vor. Original 1080×1080, unverändert kopiert und per SHA-256 verglichen. Darstellung über Next Image mit responsive Größen; nur CSS-Ausschnitt (Desktop 4:5, mobil quadratisch). Keine Retusche oder generierte Veränderung, keine aus dem Bild abgeleiteten Erfolgs-/Eventbehauptungen.
- Desktop: Porträt und Text nebeneinander. Mobil: Porträt, darunter Name/Alter nebeneinander und kurze Bio. Keine zusätzliche Bewegung im Fotoabschnitt. Alte About-/Stempel-CSS-Regeln entfernt.
- Navigation „Über mich“ und Skip-Link führen in Spielraum direkt zu `#ueber-mich`; der Weiter-Link am Hero führt weiterhin durch das Schriftspiel. Hero, akzeptierter Übergang, Academy und Kontakt unverändert.

Prüfstand: Bild geladen und Ausschnitt auf Desktop sowie 390px visuell geprüft, 320px mit maximaler Schriftgröße ohne Text-/Seitenüberlauf; Navigation und reduzierte Bewegung geprüft. Keine Runtime-/Log-Fehler im instrumentierten Browserlauf. TypeScript, betroffenes ESLint und 27 Tests erfolgreich. Kein neuer Produktionsbuild oder Deployment. Die neue persönliche Sektion wartet auf gestalterische Rückmeldung.

### Persönliche Vorstellung: kompakteres Foto und Scrollaufbau

Nächster Auftrag: den neuen persönlichen Abschnitt gut animieren und gestalten; ergänzende Korrektur: das Foto soll nicht riesig sein.

- Porträt auf Desktop maximal 320×400px, im mittleren Layout maximal 260px breit, mobil quadratisch mit maximal 230px Breite (bei 320px Bildschirmbreite etwa 198px). Die Gesamtkomposition ist auf 1000px begrenzt; Name, Alter und Bio haben mehr Raum.
- Drei deckungsgleiche Bildausschnitte setzen sich beim Scrollen zum vollständigen Foto zusammen. Der Aufbau folgt der Scrollposition und funktioniert rückwärts; vor dem Lesen ist das Foto geschlossen. Die Streifen verwenden dieselbe Bildgeometrie, damit im Ruhebild kein versetzter Ausschnitt entsteht.
- Dezente Mausneigung mit Rückkehr beim Verlassen. Auf Touch entfällt die Mausreaktion. Pause und reduzierte Bewegung zeigen das vollständige, unbewegte Foto. Direkter Abschnittsaufruf bleibt vollständig sichtbar.
- Umsetzung in `PersonalIntro.tsx`, `portrait-motion.ts`, `Spielraum.tsx`, `OrbitHome.tsx` und `prototypes.css`; relevanter Test für Fortschritt, Rückwärtslauf und direkte Abschnittsaufrufe ergänzt. Der akzeptierte Hero-Übergang bleibt unverändert.

Prüfstand: Desktop sowie 390px und 320px mit maximaler Schriftgröße visuell geprüft, keine horizontalen Seiten-/Überschriftenüberläufe. Mehrfacher Vor-/Rückwärtslauf, Mausreaktion/Rückkehr, Pause, reduzierte Bewegung und Bildladen beim direkten Abschnittsaufruf geprüft. Keine Runtime-/Log-Fehler im instrumentierten Bewegungsdurchlauf. TypeScript, betroffenes ESLint und 28 Tests erfolgreich. Kein neuer Produktionsbuild, Commit, Push oder Deployment. Gestalterische Abnahme weiterhin offen.

### Name und Alter als gemeinsame bewegte Komposition

Nutzerfeedback: Abschnitt insgesamt kreativer machen, ausdrücklich auch Name und 15. Die kompakte Fotogröße bleibt eine Vorgabe.

- Neues Raster: großer Name über der Komposition, darunter kleines Porträt, Alter und Bio. Desktop-Foto 280×350px; auf kleinen Mobilansichten Foto und Alter nebeneinander, Bio darunter. Tablet erhält zwei Spalten. Vorhandene Fraunces und Farbwelt bleiben bestehen.
- Name richtet sich beim Scrollen Buchstabe für Buchstabe räumlich auf. Die Ziffern 1 und 5 bewegen sich aus entgegengesetzten Richtungen in ihre gemeinsame Leseposition. Bio und Trennlinie schließen den Aufbau ab. Keine Endlosschleifen oder zusätzliche Scrollstrecke.
- Name und Alter erhalten Fortschritte aus ihrer tatsächlichen Bildschirmposition, damit ihre Bewegung beim Eintritt sichtbar ist. Derselbe vorhandene Scroll-Listener steuert alles; keine zusätzliche Bibliothek. Vorwärts und rückwärts exakt positionsabhängig; Endzustand ohne Transformation. Pause und reduzierte Bewegung stellen die vollständige Komposition ruhig dar. Überschrift und Alter behalten zusammenhängende zugängliche Texte.
- Änderungen in `PersonalIntro.tsx`, `OrbitHome.tsx` und `prototypes.css`. Hero, akzeptierter Übergang, Academy und Kontakt nicht verändert.

Geprüft: Desktop, 820px, 390px und 320px, auch maximale Schriftgröße; keine horizontalen Seitenüberläufe. Mehrere sichtbare Animationsphasen und wiederholter Rückwärtslauf, ruhiger Endzustand, Pause und reduzierte Bewegung geprüft. Keine Runtime-/Log-Fehler im instrumentierten Lauf. TypeScript, betroffenes ESLint und 28 Tests erfolgreich. Kein erneuter Produktionsbuild oder Deployment. Kreative Richtung umgesetzt, Nutzerabnahme offen.

### Korrektur: Animationen später beginnen

Nutzer: „Die animationen kommen zu früh rein bei der section“. Startschwelle von 92% auf 72% der Bildschirmhöhe verschoben; Abschluss bei 28%. Das Foto richtet seinen Fortschritt nun nach seiner eigenen Position statt nach dem Abschnittsanfang. Den zusätzlichen Vorlauf der 15 um ein Viertel der Bildschirmhöhe entfernt. Dadurch beginnen Name, Foto und Alter erst, nachdem das jeweilige Element sichtbar eingetreten ist.

Desktop und 390px: Start, Mitte, Abschluss und Rückwärtslauf im Browser geprüft; keine Runtime-/Log-Fehler. TypeScript, betroffenes ESLint und fünf relevante Tests erfolgreich. Kein Build oder Deployment für diese Timingkorrektur.

Feinabstimmung danach: Auf „ein kleines bisschen früher“ beginnt der Aufbau jetzt bei 77% statt 72% Bildschirmhöhe, also etwa 42px früher auf einem 844px hohen Bildschirm. Abschluss weiterhin bei 28%; eigene Elementpositionen und Animationen bleiben erhalten. Fortschritt in Desktop-/Mobilbrowser geprüft; TypeScript, betroffenes ESLint und fünf relevante Tests erfolgreich.

### Academy neu gestaltet; nur noch ein Entwurf

Nutzer bestätigt das zuletzt abgestimmte persönliche Timing: „Ja so passt es“. Anschließend Academy gestalterisch an den Rest angleichen. Währenddessen zusätzliche Anweisung: Plakat, Optionen, Reload und Regler entfernen.

- Academy ist jetzt eine dunkle, asymmetrische Projektfläche. Die große Fraunces-Schrift wird beim Scrollen von Kontur zu gefüllter Schrift, die Produktansicht kommt leicht gedreht herein und richtet sich aus. Versetzter Rahmen verbindet sie mit der persönlichen Foto-Komposition. Der Einstieg verwendet die akzeptierte Schwelle von 77% Bildschirmhöhe und berücksichtigt die Position der jeweiligen Elemente.
- Desktop zeigt den vorhandenen Missionskatalog, mobil eine vollständig aufgenommene Lernaufgabe der vorhandenen lokalen Produktdemo. Neues Asset `public/lab-home/academy-mobile.png`: Browseraufnahme der ersten Missionskarte bei 390px, keine Aufnahme des Live-Produkts. Texte bleiben auf die belegte Frontend-Teamarbeit beschränkt. Gesamter Projektblock führt zu `/projects/academy`.
- Neue Dateien `AcademyWork.tsx` und `academy-work.css`; alte Academy-Regeln aus `prototypes.css` entfernt. Persönlicher Abschnitt und akzeptierte Übergangsgeometrie unverändert.
- `/lab/home` rendert nur noch Spielraum. Variantenwähler, Replay, Regler und zugehörige Tastenkürzel entfernt; `?v=1` aktiviert keine andere Variante mehr. Frühere Plakat-/Regler-Quelldateien und gespeicherte Konfigurationen sind nicht mehr eingebunden. Pause für Bewegung und das interaktive Schriftspiel bleiben verfügbar. Keine Übernahme in die öffentliche Homepage.

Prüfstand: Desktop, 820px, 390px und 320px, auch größere Schrift; kein horizontaler Seitenüberlauf. Vorwärts-/Rückwärtsscrollen, Titelkontur/Füllung, Produktbewegung, Pause, reduzierte Bewegung und sichtbarer Tastaturfokus geprüft. Enter auf dem Projektlink erreicht `/projects/academy`. Entfernte Bedienelemente und Tastenkürzel auch mit `?v=1` geprüft; keine Runtime-/Log-Fehler im instrumentierten Durchlauf. TypeScript, betroffenes ESLint und 28 Tests erfolgreich. Kein neuer Produktionsbuild oder Deployment. Academy wartet auf gestalterische Abnahme.

### Git-Sicherung am 23. Oktober 2026

Der Nutzer hat Commit und Push des aktuellen Arbeitsstands auf `codex/feat/vgpu-homepage` beauftragt. Keine Übernahme in die öffentliche Homepage oder Zusammenführung nach `main` beauftragt.

Vor dem Commit erneut erfolgreich: TypeScript, ESLint für Labor, Seitenvorschau und ihre Tests, alle 28 Tests sowie vollständiger Produktionsbuild. Der erste Build blieb in der Sandbox ohne Ergebnis und wurde gezielt beendet; der anschließende reguläre lokale Build war erfolgreich. Er meldete 16 CSS-Warnungen zu verschachtelten `@keyframes` in der unveränderten Academy-Demo-Datei `src/components/academy/catalog/catalog.css`. Keine neue Browserprüfung im Rahmen der Git-Sicherung; die oben dokumentierte gestalterische Abnahme bleibt offen.

### Übernahme als neue Homepage

Während der Git-Sicherung hat der Nutzer ausdrücklich „mach es zur neuen Homepage“ beauftragt. Die aktuelle Spielraum-Fassung wird deshalb in `src/app/page.tsx` als Startseite unter `/` eingebunden. Der vorhandene Profil-JSON-LD-Block, die kanonische Adresse und die Google-Verifikation bleiben erhalten. Seitenbeschreibung und Open-Graph-Sprache passen nun zum deutschen Inhalt. Die beiden Rücklinks auf der Academy-Projektseite führen zum neuen Abschnitt `/#academy`. `/lab/home` bleibt nicht indexierte Vorschau derselben Komponente; das Labor bleibt erhalten. Keine neue Gestaltung oder Änderung an den abgestimmten Animationen.

Erneut geprüft: TypeScript, ESLint für beide geänderten Seiten und vollständiger Produktionsbuild erfolgreich; weiterhin die 16 CSS-Warnungen aus der unveränderten Academy-Demo. Die zuvor geprüften 28 Tests bleiben unverändert. Browser auf `/`: Desktop 1440×900 und Mobil 390×844 mit WebGPU, Hero vorwärts/rückwärts, persönliche Vorstellung samt geladenem Foto, Academy-Link und Rücknavigation nach `/#academy`, Pause und reduzierte Bewegung. WebGPU-Ausfall auf Desktop und bei 320px geprüft: Schriftalternative, Vorstellung und Kontakt erreichbar, keine horizontalen Überläufe oder aufgezeichneten Laufzeitfehler im Ausfalltest. Sichtbarer Tastaturfokus auf dem Sprunglink geprüft. Kanonische Adresse `https://thimofej.de/`, Profilangaben und fehlende Indexierungssperre im Browser geprüft. Keine Produktionsbereitstellung aus diesen lokalen Prüfungen ableiten.

## Handwerkliche Ausarbeitung mit Astra (23. Oktober 2026, lokal umgesetzt)

Auftrag: Nutzer bestätigt die fünf Verbesserungsschwerpunkte (Orbit-Ausführung, zusammenhängende Übergänge, Academy-Projektseite, Kontaktabschluss, Mobile/Interaktionsdetails) und beauftragt möglichst parallele Astra-Subagenten, ausdrücklich zusätzlich Performance. Korrektur: Orbit ist die stärkste Idee, seine Ausführung ist noch nicht großartig und darf innerhalb der Richtung verbessert werden. Niedriger Internetverbrauch ist eine Vorgabe: lokale Quellen/Vorschau, keine neuen Downloads, Pakete oder externe Recherche. Kein neuer Commit-, Push- oder Veröffentlichungsauftrag.

Arbeitsteilung: Astra für Orbit/Shader, Astra für Academy-Projektseite, Astra für Performance-Messung; Hauptagent für Kontakt, Seitenrhythmus, gemeinsame Bedienung und Integration. Gemeinsamer Checkout, getrennte Dateizuständigkeiten. Vorherige Akzeptanz von Hintergrundparametern, Mandarine/Tinte, kompaktem Foto, 77%-Eintritt und Entfernung einer Extra-Umdrehung bleibt maßgeblich.

Abnahmeziele:
- Orbit öffnet sich lesbar und zusammenhängend, ohne laufzeitabhängige zusätzliche Umdrehungen; Zwischenhalt und Rückwärtslauf bleiben stabil.
- Persönlicher Aufbau, Academy und Kontakt bilden einen klaren Rhythmus, ohne Scroll-Sperre; keine zusätzlichen Varianten/Regler.
- Academy-Projektseite setzt Sprache und Gestaltung der Homepage fort; Demo und belegte Teambeiträge bleiben erhalten.
- Kontakt mit klarem „Hallo.“ und zurückhaltendem Zeichenraster; Navigation führt zum Kontaktabschnitt, Mail-Link öffnet direkt E-Mail.
- Desktop, 390/320px, Keyboard, Pause, reduzierte Bewegung und WebGPU-Ausfall prüfen. Performanceaussagen nur im Umfang der lokalen Messungen.
- Abschluss: TypeScript, betroffenes ESLint, Tests, Produktionsbuild und eigene integrierte Browserprüfung. Menschliche Abnahme bleibt getrennt.

### Ergebnis und zweiter kritischer Durchgang

- Orbit: erst drei vorhandene Bänder öffnen, dann lesbares THIMORROW, danach zusätzliche Zeilen/Konturen. Skulpturuhr beim Scrollen von Hintergrundzeit getrennt; kürzester äquivalenter Öffnungswinkel und kürzester Weg beim Mischen vermeiden zusätzliche Umdrehungen. Nach eigener zweiter Sichtprüfung Materialkontrast, Desktop-Zeilenhöhe, Wölbung und Konturstärke verfeinert. Akzeptierte Hintergrundwerte und Labor-Ausgangsform unverändert. Neue Phasen-Tests für wiederholtes/unterbrochenes Mischen.
- Seitenrhythmus: überflüssige Kapitel-/Namensdoppelungen und sichtbare Seed-Zahl entfernt, Abstände zwischen Vorstellung und Academy abgestimmt. Neu-mischen bleibt im Schriftfeld lesbar und nimmt sich beim Verlassen zurück. Abschnittssprünge zeigen die persönliche Komposition bzw. Academy vollständig, bis der Abschnitt wieder verlassen wurde. Scrollmessungen werden vor den Stiländerungen gesammelt. Pause benutzt jetzt denselben ruhigen Szenenpfad wie reduzierte Bewegung.
- Kontakt: eigener `ContactFinale`, großes „Hallo.“, leichtes Zeichenraster mit lokaler Mausreaktion, Mailadresse und soziale Links. Keine weitere GPU-Szene oder neue Bibliothek. Mobile ohne Hover-Abhängigkeit, Touchziele mindestens 44 px. Zweite Sichtprüfung beseitigte eine CSS-Namenskollision mit altem Kontaktstil; E-Mail und Pfeil haben passende eigene Namen und Größen. Navigation „Kontakt“ führt nach #kontakt, der eigentliche Kontaktlink bleibt mailto.
- Academy: deutsche Projektseite mit gleicher Farb-/Schrifthierarchie, persönlichem belegtem Teambeitrag und vorhandener interaktiver Demo. Zweiter Durchgang entfernt wiederholte Team-/Frontend-Aussagen und führt mobil früher zum Produkt. Die versuchte gemeinsame Titelreise wurde nach echter Zwischenbildprüfung verworfen: Schrift kreuzte den neuen Inhalt. Verblieben ist ein kurzer nativer 160 ms-Seitenwechsel, bei reduzierter Bewegung ohne Animation. Frühes globales Opt-in vermeidet den beobachteten Übergangsabbruch durch zu spät geladene Routen-CSS.

### Prüfungen dieses Durchgangs

- TypeScript, betroffenes ESLint, 30 Tests und Produktionsbuild erfolgreich. Build meldet weiterhin 16 bereits bestehende CSS-Keyframe-Warnungen in der unveränderten Academy-Demo-Datei catalog.css.
- Eigene integrierte Browserprüfung auf lokalem Produktionsserver: Orbit vorwärts/rückwärts und Zwischenphasen; Abschnittssprung zur Vorstellung mit vollständigem Foto/Name; sichtbarer Tastatur-Sprunglink und Kontaktfokus; Mobil 320×760 mit Touch, Pause und reduzierter Bewegung ohne Seitenüberlauf. Agenten zusätzlich 1440×900, 390×844, mehrfaches Mischen, Desktop/320/390 Academy-Demo samt eigener Antwort und Ergebnis, Hin-/Rücknavigation.
- WebGPU-Ausfall in lokaler Vorschau simuliert: HTML-Schriftalternative, Vorstellung und Kontakt bleiben erreichbar; kein Mobilüberlauf. Keine aufgezeichneten Laufzeitfehler im integrierten Scroll-/Abschnittssprungdurchlauf. Der zwischenzeitliche native Seitenübergangsabbruch wurde separat diagnostiziert und korrigiert.
- Performanceagent: im fertigen Schriftspiel 1 statt 2 GPU-Durchläufe pro Bild; außerhalb der Szene nur ein abschließendes Bild, danach keine weitere GPU-Arbeit im Messfenster. 24 Kontakt-Mausbewegungen: 0 Layouts, 6,7 ms Stilberechnung, 3,3 ms JavaScript. Keine externen Assetrequests beobachtet. Zahlen vom lokalen Entwicklungsbrowser, kein reales Smartphone und kein belastbarer Vorher-/Nachher-FPS-Vergleich.
- Keine Paketinstallationen, neuen Medien-Downloads, externen Rechercheaufrufe oder Veröffentlichungen. Änderungen lokal, kein Commit/Push/Deployment. Gestalterische Nutzerabnahme bleibt offen.

Abschließende Produktionsprüfung nach Entfernung der Titelreise: nativer Seitenwechsel im Browser aktiv, ready und finished erfolgreich, keine erfassten Fehler; Dauer 160 ms, Titel hat keinen eigenen Übergangsnamen. Tatsächlicher Rücklink erreicht /#academy mit vollständig sichtbarer Produktabbildung. Letzter Produktionsbuild erfolgreich; lokale Vorschau unter http://localhost:3002/ geöffnet.

Letzte Nutzerkorrektur: Der frühere Hover-Effekt pro Buchstabe im „Hallo“ soll ausdrücklich zurück. Im neuen Kontaktaufbau wiederhergestellt: einzelne Buchstaben heben und neigen sich nach Mausnähe, mit weicher Rückkehr beim Verlassen. Rasterreaktion und neue Komposition bleiben. Pause, Touch und reduzierte Bewegung erhalten die ruhige Fassung. Im lokalen Browser drei Mauspositionen mit unterschiedlichen Buchstabenbewegungen, Rückkehr und reduzierte Bewegung geprüft; TypeScript und betroffenes ESLint erfolgreich.

Anschließender Nutzerauftrag: „push“. Die geprüfte Ausarbeitung einschließlich wiederhergestelltem Buchstaben-Hover wird auf dem bestehenden Branch `codex/feat/vgpu-homepage` gesichert. Commit und Push sind beauftragt; Merge und eine gesonderte Produktionsfreigabe sind daraus nicht abgeleitet.

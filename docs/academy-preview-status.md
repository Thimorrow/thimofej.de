# Academy-Vorschau · 24. Oktober 2026

Auftrag: Vorschau auf thimofej.de anhand der korrigierten Fassung auf academy.yesterday-ai.de verbessern.

Die öffentlich laufende Referenz im Browser geprüft und ihre lokale Quelle aus `academy-landingpage/src/components/academy-demo.tsx` samt zugehörigen Demo-Stilen und fünf Bilddateien übernommen. Neue `AcademyPreview.tsx` und `academy-preview.css` verwenden getrennte `ap-`-Klassen, damit die bestehende interaktive Produktdemo keine Stilüberschreibungen erhält. Homepage und Academy-Projektseite verwenden nun diese Vorschau: drei echte Missionsbeispiele, automatischer Karten-/Chatwechsel und parallel entstehende Dokumentabschnitte. Mobile Darstellung mit Dokument unter dem Chat.

Ergänzt: eigener Pauseknopf, Anbindung an die bestehende Homepage-Pause und dynamische Reaktion auf reduzierte Bewegung. Außerhalb des sichtbaren Bereichs und bei verborgenem Tab läuft die Zeitleiste nicht weiter. Keine neue Bibliothek. Die eigenständige interaktive Demo bleibt erhalten.

Prüfung: TypeScript, ESLint der betroffenen Komponenten, 43 vorhandene Tests, Produktionsbuild und `git diff --check` erfolgreich. Bekannte Warnungen aus dem unveränderten Academy-Katalog-CSS beim Build. Browser: Desktop, 390 und 320 Pixel, keine horizontalen Seitenüberläufe; Bilder geladen; automatische Übersicht, Chatnachrichten und Ergebnisaufbau bei stabiler Höhe beobachtet; Pause über Zeitmessung bestätigt; Missionsauswahl und Rückkehr sowie Tastaturauswahl mit Enter geprüft. Dynamisch aktivierte reduzierte Bewegung zeigt vollständigen Gesprächsverlauf und keine laufenden Vorschauanimationen. Mobile Kartenansicht nach abgeschlossenem Übergang visuell geprüft.

Stand: lokal unter http://localhost:3000/. Kein Commit, Push oder Deployment. Gestalterische Nutzerabnahme offen. Die bereits vorhandene Änderung in `docs/orbit-status.md` wurde nicht angefasst.

## Navigation und Bedienelemente · 24. Oktober

Nutzerkorrekturen: „Selbst ausprobieren“ und den Absatz unter der Projektvorschau entfernt. „Mein Beitrag“ und Rücknavigation mit lesbarer Sans-Schrift, passenden Pfeilen und ruhigen Farbhover-Zuständen überarbeitet. Folgeauftrag erweitert dies auf Homepage-Navigation, Weiter, Meine Arbeit ansehen und Zurück nach oben.

Harte Ankersprünge auf Homepage und Academy durch gemeinsame CSS-Regel für weiches Scrollen ersetzt. Das Prinzip „Fix Root Causes“ führte zur gemeinsamen Regel anstelle einzelner Click-Animationen. Native Linkziele und Browserhistorie bleiben bestehen. Ein kleiner `AnchorScrollControl` beendet eine laufende Ankerfahrt bei Mausrad, Touchbeginn oder Scroll-/Escape-Taste, weil der native Browser im Test nach einem Mausradimpuls zunächst weiter zum Ziel fuhr. Reduzierte Bewegung bleibt sofortige Navigation.

Nachweis im Browser: Vorher acht Messwerte unmittelbar bei 2156px; danach viele Zwischenpositionen von 1 bis 2156px, Zielabweichung unter einem Pixel. Academy-Anker ebenfalls mit Zwischenpositionen und genauer Ankunft. Nach Mausradunterbrechung bleibt der Beitragsabschnitt noch rund 211px unter dem Fensterrand, ohne späteres Weiterfahren. Desktop und 320/390px sowie neue Schaltflächen visuell geprüft, kein horizontaler Überlauf. Drei neue Verhaltenstests decken Unterbrechung, ausgeschlossene Links, Scrollende und Listener-Abbau ab; insgesamt 46 Tests grün, Typprüfung und ESLint grün.

Parallel entstehen Sprachversionen im gemeinsamen Arbeitsordner. Fremde Änderungen erhalten. Erster Build traf einen inzwischen nicht mehr in der Typprüfung auftretenden Locale-Prop-Fehler; zweiter Build durch einen gleichzeitig laufenden Build blockiert. Build-Abschluss noch separat prüfen. Kein Commit, Push oder Deployment.

Abschluss: Erneuter vollständiger Produktionsbuild nach Ende der parallelen Ausführung erfolgreich, einschließlich der inzwischen hinzugekommenen englischen Routen. Die bekannten 16 Katalog-CSS-Warnungen bleiben. Tastatur-Enter erreicht weiterhin `#beitrag`. Kein Veröffentlichungsauftrag.


## Korrektur: fremde Button-Gestaltung zurücknehmen · 24. Oktober

Nutzer meldet plötzlich hinzugekommene, unpassende Buttons. Die nachträglich eingeführten Flächen, abgerundeten Rahmen und Arial-Schriften bei Homepage-Navigation, Explore, Academy-Projektlink, Zurück nach oben sowie Academy-Rücknavigation und Beitragslink entfernt. Bestehende Textlink-Gestaltung wiederhergestellt; Sprachwechsel, Mindesthöhen, Fokusregeln, weiches Scrollen und Pause erhalten. Keine Änderung an den Bedienelementen der eigentlichen Produktdemo. Prinzip „Subtract Before You Add“: zusätzliche Gestaltung entfernen, statt eine neue Buttonvariante einzuführen.

Lokal geprüft: Desktop 1512px und Mobil 390px auf Homepage und Projektseite visuell geprüft, keine horizontalen Überläufe. Berechnete Stile der Homepage-Links bestätigen transparente Hintergründe und 0px Rundung. Navigation zur Vorstellung, Beitragsanker und Pause bedient und Zielzustände bestätigt. TypeScript, alle 46 Tests und git diff --check erfolgreich. Reine CSS-Korrektur; kein erneuter Produktionsbuild, Commit, Push oder Deployment. Nutzerabnahme offen.


### Nacharbeit nach Nutzerkritik an der Ausführung

Auftrag: Gestaltung der Links tatsächlich ausarbeiten, nicht bloß die Buttonflächen zurücksetzen. Akzeptanz: klare Navigation auf Desktop und Mobil, besser lesbare Hauptlinks, zusammengehörige Zustände und ausreichend große Ziele, ohne neue Buttonflächen oder Änderungen an Orbit und Produktdemo.

Homepage-Navigation: 14px Schrift, bewusst getrennte DE/EN-Gruppe, mobile Abschnittslinks links am Logo ausgerichtet statt rechts darunter. Unterstreichung bei Hover und Fokus ohne Layoutverschiebung. Academy-Projekt- und Beitragslinks: 16px Schrift, mindestens 52px hohe Zielfläche, 220px breite Linie mit zurückhaltender Deckkraft und ausgerichtetem Pfeil. Academy-Rücknavigation und Kontakt-Rücklink ebenfalls 14px; vorherige winzige Beschriftung entfernt. Bestehende Fokus-, Touch-, Pause- und Reduced-Motion-Regeln berücksichtigt.

Nachweise: Homepage und Academy-Projektseite auf 1512px bzw. 390px visuell geprüft; deutsche Homepage auf 320px ohne horizontalen Überlauf, alle fünf Headerlinks mindestens 44px hoch. Academy- und Kontaktabschnitt auf 390px nach abgeschlossener Scrollfahrt angesehen. Tastaturfokus mit sichtbarem Outline bestätigt; Reduced-Motion-Abschnittssprung erreicht die Vorstellung mit rund 0,1px Abweichung. Typprüfung und 46 Tests erfolgreich. Produktionsbuild nach gezieltem Beenden des festhängenden Sandbox-Laufs regulär erfolgreich, weiterhin bekannte Katalog-CSS-Warnungen. Keine Veröffentlichung, kein Commit/Push. Gestalterische Nutzerabnahme bleibt offen.


## Scrollkorrektur nach Nutzerfeedback · 24. Oktober

Nutzer: „das ist kacke gemacht der soft scroll“. Die globale native CSS-Glättung und den bloßen Unterbrechungswächter durch eine gezielte Ankersteuerung in AnchorScrollControl ersetzt. Normales Mausrad-/Touchscrollen bleibt nativ. Nur gültige Abschnittslinks innerhalb derselben Homepage/Academy-Seite werden abgefangen. Ziel berücksichtigt scroll-margin und das tatsächliche Seitenende. Kubischer Beschleunigungs-/Bremsverlauf, Dauer 420ms plus 0,08ms je Pixel, maximal 1000ms. Animationsuhr startet mit dem ersten ausgeführten Frame, damit ein verzögerter Browserstart die Fahrt nicht überspringt. Ein einzelner Frame-Handle ist der Zustand einer laufenden Fahrt (Prinzip Model the Domain). Ursache statt weiterer Korrektur am nativen Scrollende beheben (Fix Root Causes).

Mausrad, Touchbeginn, Navigationstasten, Tab, Zurück/Vorwärts und eine Änderung der Bewegungseinstellung stoppen die Fahrt; zweiter Abschnittsklick beginnt an der aktuellen Position. URL/Browserhistorie und hashchange bleiben verfügbar. Nach Abschluss erhält das Ziel Fokus ohne zweite Scrollfahrt. Reduzierte Bewegung springt sofort. Externe, modifizierte, fehlende oder anderswo öffnende Links bleiben nativ.

Prüfung: TypeScript, ESLint der Steuerung, alle 49 Tests und abschließender Produktionsbuild erfolgreich. Verhaltenstests für Zwischenpositionen, exaktes Ziel, Unterbrechungen, Neuauslösung, Bereinigung, Ausschlüsse, reduzierte Bewegung, Seitenende und verspäteten ersten Frame. Browser bestätigt Kontaktziel, Fokus, mobile Academy-Beitragsposition (unter 0,2px Abweichung) und unmittelbaren Reduced-Motion-Sprung. Zwischenbildmessung zeitweise stark vom Browser gedrosselt, deshalb keine belastbare Aussage zur gefühlten Flüssigkeit oder FPS aus diesem Lauf. Die letzte Änderung am ersten Frame ist durch den Verhaltenstest und Build geprüft. Kein Commit, Push oder Deployment. Nutzerabnahme des Scrollgefühls bleibt offen.


### Zusammenspiel mit den Animationen korrigiert

Nutzer weist ausdrücklich darauf hin, die tatsächlichen Animationen anzusehen. Im bereits geöffneten In-App-Browser kontrolliert. Die bisherige Fahrt durch sämtliche scrollgesteuerten Phasen innerhalb rund einer Sekunde passt nicht zum Aufbau von Orbit, Schriftspiel, Vorstellung und Academy. Lange Ankerwege über 1,25 Fensterhöhen wechseln nun mit dem vorhandenen nativen 160ms-Bildübergang direkt zum Ziel. Ohne diese Browserfunktion direkter Sprung. Kurze Wege wie Explore behalten den Scrollablauf, nun 600ms plus 0,3ms je Pixel, maximal 1100ms. Normales Scrollen bleibt unverändert.

Ein erster Übergangsversuch wartete innerhalb der DOM-Aktualisierung auf zwei Animationsframes und erzeugte im In-App-Browser Transition-Timeouts. Diese eigene Fehlumsetzung korrigiert: keine asynchrone Frame-Wartephase mehr; anchor-arrive aktualisiert die scrollgesteuerten Orbit-/Abschnittszustände synchron vor der Zielaufnahme. OrbitHome baut den Listener beim Verlassen wieder ab. Abbruch eines noch ausstehenden Übergangs verhindert spätere Sprünge.

Prüfung im tatsächlichen offenen Browser: Kontakt, zurück zum Orbit, Vorstellung, Explore ins Schriftspiel und normaler Vor-/Rückwärtslauf. Zielansichten vollständig; nach der Korrektur bei diesen Durchläufen keine neuen Transition-Timeouts. Alte Fehler bleiben im Browserlog sichtbar. TypeScript, betroffenes ESLint, 51 Tests und Produktionsbuild erfolgreich; bekannte Academy-CSS-Warnungen bleiben. Neue Tests belegen direkten Zielwechsel ohne Zwischenfahrten, synchrone Zustandsaktualisierung und Abbruch vor dem Zielwechsel. Keine neue Mobilprüfung in diesem Durchgang; bisherige Mobilprüfung gilt nur für die vorige Scrollfassung. Lokal umgesetzt, kein Commit, Push oder Deployment. Nutzerabnahme bleibt offen.

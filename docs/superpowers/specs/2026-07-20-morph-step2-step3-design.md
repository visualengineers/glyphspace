# Design: Ruhiger Morph Schritt 2 → Schritt 3 (Preprocessing-Wizard)

Datum: 2026-07-20
Branch: feat/a14-animation

## Problem

Beim Übergang von Wizard-Schritt 2 (Spaltenauswahl, Tabelle) zu Schritt 3
(Datenkonfiguration, Rail + Detailbereich) bewegen sich zu viele Elemente in zu
vielen verschiedenen Richtungen gleichzeitig. Optisch wirkt es, als würden alle
Teile aus allen Richtungen zur Mitte fließen und sich dort zusammensetzen
(„Schwarm-Effekt"). Ursachen (aus Codeanalyse):

1. **Container-Versatz:** Schritt 2 `.step-content` ist auf `max-width:1150px`
   zentriert, Schritt 3 nutzt volle Breite. Dadurch liegt die linke Kante der
   Liste in Schritt 3 nicht dort, wo die Tabelle in Schritt 2 beginnt → jede
   Zeile bekommt einen horizontalen Grund-Offset.
2. **`data-flip-id` auf `<tr>` (Schritt 2) → `<div>` (Schritt 3) mit
   `absolute:true`:** Tabellenzeilen verhalten sich unter `position:absolute`
   unzuverlässig; Zeilen springen und „fließen" dann zur Rail.
3. **Kein `stagger`:** Alle Zeilen + Suchbox + Filter animieren gleichzeitig.
4. **Header-Controls aus verschiedenen Ecken:** `col-search` breit oben (S2) vs.
   schmal in Rail (S3); `col-typefilter` rechts-mittig (S2) vs. links unter Suche
   (S3).
5. **Gegenläufige Bewegung rechts:** Stat-Zellen driften nach rechts (`x:24`),
   während die `.detail-well` gleichzeitig von rechts (`xPercent:40`) hereinkommt.

## Zielbild

Möglichst wenige, gleichgerichtete Bewegungen (statt ~10 Vektoren). Erst
kollabieren die Stat-Spalten von rechts nach links weg, dann folgt der
Detailbereich als ein Block von rechts. Insgesamt langsamer und lesbar.

## Getroffene Entscheidungen

- **Architektur:** Schritt 2 und 3 bleiben getrennte Komponenten; ihre Geometrie
  wird hart angeglichen (kein Merge zu einer Komponente).
- **Schritt 2 bleibt eine echte HTML-Tabelle** mit allen Spalten. Keine
  Zerlegung in „Zonen".
- **Choreografie:** Kollaps links zuerst, dann Detail von rechts. Name-Spalte
  bleibt die ganze Zeit stehen.
- **Timing:** ruhig, ~1,2s gesamt (Phase 1 ~0,6s, Überlappung ~0,1s, Phase 2
  ~0,6s), `power2.inOut`.
- **Suche/Filter:** Schritt-2-Layout bleibt unverändert (Suche breit oben, Filter
  rechts daneben). In Phase 1 schrumpft die Suchleiste synchron mit der Tabelle
  auf Rail-Breite, der Typ-Filter rutscht darunter.

## Ansatz

Kernidee: Der Morph reduziert die Tabelle per **Spaltenkollaps** auf die
Name-Spalte, die deckungsgleich mit der `master-rail` aus Schritt 3 liegt.
Danach slidet der Detailbereich von rechts herein. Zeilen werden nicht mehr per
GSAP Flip gematcht (sie bewegen sich nicht), wodurch das `tr → div`-Problem
entfällt.

### Geometrie-Angleichung (vorab, ohne Animation sichtbar)

- Gemeinsamer Container für beide Schritte; der `max-width:1150px`-Versatz in
  Schritt 2 wird entfernt bzw. so gesetzt, dass die linke Kante identisch liegt.
- Die Name-Spalte (inkl. vorangestellter Checkbox-Spalte) in Schritt 2 liegt an
  der linken Kante und Breite der `master-rail` (Bezug: `$wizard-rail-width:320px`,
  `$wizard-list-row-height:56px` aus `_wizard-shared.scss`).
- Zeilenhöhe bleibt 56px (bereits angeglichen).

### Phase 1 (0,0–0,6s): Kollaps nach links, gestaffelt rechts→links

- Die vier Stat-Spalten (Data Type, Count, Unique, Distribution) tweenen ihre
  Breite auf 0; Inhalt fadet aus. Stagger von der rechtesten Spalte zuerst nach
  links.
- Synchron: Suchleiste (`col-search`) schrumpft von voller Breite auf Rail-Breite
  (rechte Kante wandert mit den Spalten nach links). Der Typ-Filter
  (`col-typefilter`) rutscht per Flip unter die Suche – ein Element, ein Vektor.
- Checkbox- und Name-Spalte bleiben stehen (kein Vektor).

### Wechsel

Bei Deckungsgleichheit (Name-Spalte an Rail-Position) erfolgt der
Komponententausch Schritt 2 → 3 unsichtbar. Zeilen fliegen nicht.

### Phase 2 (0,5–1,2s, ~0,1s Überlappung): Detail von rechts

- Die `.detail-well` slidet als ein Block von rechts herein (`x` von positiv nach
  0) und fadet ein.

### Resultat

Zwei gerichtete Vektoren (Spalten-/Suche-Kollaps nach links, Detail rein von
rechts) plus ein kleiner Filter-Reflow; sonst statisch.

## Betroffene Dateien

- `src/app/preprocessing-wizard/steps/step2-column-selection/step2-column-selection.component.html`
  – kollabierbare Stat-Spalten (colgroup bzw. Breiten-Hooks), Name-Spalte auf
  Rail-Geometrie; `data-flip-id` auf `<tr>` entfernen.
- `src/app/preprocessing-wizard/steps/step2-column-selection/step2-column-selection.component.scss`
  – Spaltenbreiten/Kollaps-Vorbereitung, Name-Spalte an Rail-Breite.
- `src/app/preprocessing-wizard/preprocessing-wizard.component.ts`
  – neue Zwei-Phasen-Timeline; Breiten-Tweens + Stagger; `col-search` /
  `col-typefilter` als einzige Flip-Targets; Stat-`x:24`-Drift und
  `.detail-well`-`xPercent:40`-Konflikt entfernen; Dauer/Ease anpassen.
- `src/app/preprocessing-wizard/preprocessing-wizard.component.scss`
  – gemeinsamer Container, kein Zentrier-Versatz.
- `src/app/preprocessing-wizard/shared/_wizard-shared.scss`
  – ggf. geteilte Rail-/Name-Geometrie-Tokens ergänzen/wiederverwenden.
- Schritt 3 (`step3-configure-data-features`) bleibt Referenz und weitgehend
  unverändert.

## Verifikation

Playwright-Flow (siehe Memory „Wizard visual verification"): Wizard bis Schritt 2
durchklicken, Übergang 2→3 auslösen, prüfen, dass nur die zwei gerichteten
Bewegungen sichtbar sind (Kollaps nach links, Detail von rechts) und keine Zeilen
quer springen. Sichtprüfung der Deckungsgleichheit beim Komponentenwechsel.

## Nicht im Scope

- Kein Merge von Schritt 2 und 3 zu einer Komponente.
- Keine inhaltliche Änderung an Schritt 3.
- Keine Änderung an anderen Wizard-Schritten (1, 4).

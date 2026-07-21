# Ruhiger Morph Schritt 2 → 3 – Implementierungsplan

> **Für agentische Worker:** Umsetzung task-by-task. Da es sich um eine
> GSAP-/CSS-Animation handelt, ist die Verifikation pro Task **visuell**
> (Angular-Build ohne Fehler + Playwright-Sichtprüfung des Übergangs 2→3), nicht
> per Unit-Test. Schritte nutzen Checkbox-Syntax (`- [ ]`).

**Goal:** Der Übergang von Wizard-Schritt 2 (Tabelle) zu Schritt 3 (Rail +
Detail) soll aus wenigen, gleichgerichteten Bewegungen bestehen statt aus einem
Schwarm: Name-Spalte bleibt stehen, Stat-Spalten kollabieren nach links, dann
slidet der Detailbereich von rechts herein.

**Architecture:** Zwei getrennte Angular-Komponenten (Step2/Step3), deren
Geometrie hart angeglichen wird. Der Morph läuft weiter über GSAP Flip im
Wizard-Shell (`preprocessing-wizard.component.ts`), aber neu choreografiert:
Zeilen werden nicht mehr per Flip gematcht (kein `tr→div`-Flip), nur noch
Suchbox + Typ-Filter; die Stat-Zellen kollabieren über `onLeave`, die
`.detail-well` kommt über `onEnter`/Timeline von rechts.

**Tech Stack:** Angular (standalone components), SCSS, GSAP + Flip-Plugin.

## Global Constraints

- Schritt 2 bleibt eine echte HTML-`<table>`. Kein Umbau auf Div-Layout.
- Geteilte Geometrie kommt aus `_wizard-shared.scss`
  (`$wizard-rail-width: 320px`, `$wizard-list-row-height: 56px`). Werte dort
  zentral halten, nicht in Komponenten duplizieren.
- `prefers-reduced-motion`: Der Morph wird bei reduzierter Bewegung übersprungen
  (bestehende `reduceMotion`-Logik in `preprocessing-wizard.component.ts` bleibt).
- Gesamtdauer ~1,2s, `power2.inOut`, Phase 1 ~0,6s, Überlappung ~0,1s, Phase 2
  ~0,6s.

---

### Task 1: Container-Geometrie angleichen (linke Kante + Start-Y)

Ziel: linke Kante der Name-Spalte (Schritt 2) und der `master-rail` (Schritt 3)
liegen deckungsgleich; die erste Zeile beginnt in beiden Schritten auf gleicher
Höhe. Schritt 2 bleibt optisch unverändert; Schritt 3 wird auf denselben
zentrierten Container gebracht.

**Files:**
- Modify: `src/app/preprocessing-wizard/steps/step3-configure-data-features/step3-configure-data-features.component.scss:9-11`

**Interfaces:**
- Consumes: `w.step-content` Mixin (unverändert), `$wizard-rail-width`.
- Produces: Schritt-3-`.step-content` mit `max-width: 1150px; margin: 0 auto`
  (gleich wie Schritt 2, `step2...scss:11-18`).

- [ ] **Step 1:** In `step3...scss` den `.step-content`-Block erweitern:

```scss
  .step-content {
    @include w.step-content;
    max-width: 1150px;
    margin: 0 auto;
  }
```

- [ ] **Step 2:** Build prüfen.

Run: `npx ng build --configuration development`
Expected: Build erfolgreich, keine SCSS-Fehler.

- [ ] **Step 3:** Sichtprüfung (Playwright, Memory „Wizard visual verification"):
Schritt 2 und Schritt 3 je einen Screenshot. Erwartung: linke Kante der
Name-Spalte (S2) und der Rail (S3) liegen an derselben x-Position; Schritt 2
sieht unverändert aus.

- [ ] **Step 4:** Commit.

```bash
git add src/app/preprocessing-wizard/steps/step3-configure-data-features/step3-configure-data-features.component.scss
git commit -m "refactor(a14): gemeinsamer zentrierter Container fuer Schritt 2 und 3"
```

---

### Task 2: Zeilen aus dem Flip-Match nehmen (kein tr→div-Flip)

Ziel: Tabellenzeilen fliegen nicht mehr. Sie bleiben durch die Geometrie an
ihrem Platz; nur Suchbox und Typ-Filter bleiben Flip-Targets.

**Files:**
- Modify: `src/app/preprocessing-wizard/steps/step2-column-selection/step2-column-selection.component.html:105-110`
- Modify: `src/app/preprocessing-wizard/preprocessing-wizard.component.ts:153`

**Interfaces:**
- Consumes: `captureMorphState()` sammelt weiterhin `[data-flip-id]` (jetzt nur
  Suchbox + Typ-Filter) und das Leave-Set (Stat-Zellen).
- Produces: `<tr class="column-row">` ohne `data-flip-id`.

- [ ] **Step 1:** In `step2...html` das `data-flip-id` von der `<tr>` entfernen:

```html
              <tr
                class="column-row"
                [class.disabled]="!isColumnEnabled(column.name)"
                [class.has-issues]="hasIssues(column)"
              >
```

- [ ] **Step 2:** In `preprocessing-wizard.component.ts` den Kommentar bei
`captureMorphState` an die neue Realität anpassen (nur Suchbox/Filter gematcht;
Zeilen nicht mehr). Funktional bleibt `querySelectorAll('[data-flip-id]')`
korrekt, da die Zeilen das Attribut nicht mehr tragen. Kommentar in Zeile
147-152 entsprechend kürzen.

- [ ] **Step 3:** Build prüfen.

Run: `npx ng build --configuration development`
Expected: Build erfolgreich.

- [ ] **Step 4:** Commit.

```bash
git add src/app/preprocessing-wizard/steps/step2-column-selection/step2-column-selection.component.html src/app/preprocessing-wizard/preprocessing-wizard.component.ts
git commit -m "refactor(a14): Tabellenzeilen nicht mehr per Flip morphen"
```

---

### Task 3: Zwei-Phasen-Choreografie in `runStepMorph`

Ziel: Phase 1 – Stat-Zellen kollabieren nach links (gestaffelt rechts→links) und
die Rail-Liste in Schritt 3 blendet sanft ein; Phase 2 – `.detail-well` slidet
von rechts herein. Suchbox/Filter gleiten via Flip (nahezu 0, da Geometrie
angeglichen). Gesamt ~1,2s.

**Files:**
- Modify: `src/app/preprocessing-wizard/preprocessing-wizard.component.ts:170-221`

**Interfaces:**
- Consumes: `state: Flip.FlipState`, `this.stepContainer`, `this.morphOldHeight`.
- Produces: neue Timeline-Logik in `runStepMorph`.

- [ ] **Step 1:** `runStepMorph` ersetzen. Kernpunkte: `duration: 0.6`; `onLeave`
kollabiert Stat-Zellen mit `xPercent: -30, autoAlpha: 0`, Stagger
`{ each: 0.015, from: 'end' }` (rechte/untere zuerst → Wirkung rechts→links);
Rail-Liste (`.column-list`) blendet ein (`autoAlpha` 0→1, 0.3s); `.detail-well`
kommt bei `t=0.5` von rechts (`xPercent: 40 → 0`, 0.6s, `power2.out`).
Stat-Drift `x:24` entfällt.

```typescript
      const timeline = Flip.from(state, {
        targets: container.querySelectorAll('[data-flip-id]'),
        duration: 0.6,
        ease: 'power2.inOut',
        absolute: true,
        // Phase 1: Stat-Spalten kollabieren nach links, gestaffelt rechts->links.
        onLeave: leaving =>
          gsap.to(leaving, {
            xPercent: -30,
            autoAlpha: 0,
            duration: 0.5,
            ease: 'power2.in',
            stagger: { each: 0.015, from: 'end' },
          }),
      });

      // Rail-Liste sanft einblenden, damit der Zeileninhalt-Wechsel
      // (Checkbox weg, Config-Zeile dazu) nicht hart "poppt".
      const list = container.querySelector('.column-list');
      if (list) {
        timeline.from(list, { autoAlpha: 0, duration: 0.3, ease: 'power1.out' }, 0);
      }

      // Phase 2: Detailbereich slidet als ein Block von rechts herein.
      const well = container.querySelector('.detail-well');
      if (well) {
        timeline.from(
          well,
          { xPercent: 40, autoAlpha: 0, duration: 0.6, ease: 'power2.out' },
          0.5
        );
      }

      // Container-Höhe old->new tweenen (kein vertikaler Sprung).
      const newHeight = container.offsetHeight;
      if (this.morphOldHeight > 0 && Math.abs(this.morphOldHeight - newHeight) > 1) {
        timeline.fromTo(
          container,
          { height: this.morphOldHeight },
          {
            height: newHeight,
            duration: 1.1,
            ease: 'power2.inOut',
            onComplete: () => {
              container.style.height = '';
            },
          },
          0
        );
      }
```

- [ ] **Step 2:** Build prüfen.

Run: `npx ng build --configuration development`
Expected: Build erfolgreich.

- [ ] **Step 3:** Sichtprüfung (Playwright): Übergang 2→3 auslösen und als
Screenshot-Serie / Video beobachten. Erwartung: (a) linke Rail/Name steht;
(b) Stat-Bereich kollabiert nach links und verschwindet; (c) Detailbereich kommt
von rechts; (d) keine Zeilen springen quer. Timing spürbar langsamer (~1,2s).

- [ ] **Step 4:** Commit.

```bash
git add src/app/preprocessing-wizard/preprocessing-wizard.component.ts
git commit -m "refactor(a14): Zwei-Phasen-Morph (Kollaps links, Detail von rechts)"
```

---

### Task 4: Feinschliff Timing/Richtung + Reduced-Motion-Check

Ziel: Bewegung final abstimmen (Stagger-Richtung wirklich rechts→links, Ease,
Überlappung), Regressionen ausschließen.

**Files:**
- Modify: `src/app/preprocessing-wizard/preprocessing-wizard.component.ts` (nur
  Feintuning der in Task 3 gesetzten Werte, falls die Sichtprüfung es verlangt).

- [ ] **Step 1:** Falls der Kollaps nicht klar rechts→links wirkt: `from: 'end'`
bzw. `each` anpassen; falls Detail zu früh/spät kommt: Startzeit 0.5 justieren.
Werte nur nach visueller Kontrolle ändern.

- [ ] **Step 2:** Reduced-Motion prüfen: Mit
`prefers-reduced-motion: reduce` (Playwright `emulateMedia`) Übergang 2→3
auslösen. Erwartung: sofortiger Wechsel ohne Animation, kein Fehler.

- [ ] **Step 3:** Finaler Build.

Run: `npx ng build --configuration development`
Expected: Build erfolgreich.

- [ ] **Step 4:** Commit (falls Feintuning-Änderungen).

```bash
git add src/app/preprocessing-wizard/preprocessing-wizard.component.ts
git commit -m "polish(a14): Timing und Richtung des Morphs final abgestimmt"
```

---

## Self-Review

- **Spec-Abdeckung:** Container-Angleichung (Task 1) → Ursache 1. Kein tr→div-Flip
  (Task 2) → Ursache 2. Stagger + Zwei-Phasen (Task 3) → Ursachen 3+5. Suche/
  Filter via Flip statt querfliegen (bestehend + Task 3) → Ursache 4. Timing
  ~1,2s (Task 3/4). Alle fünf Ursachen adressiert.
- **Platzhalter:** keine.
- **Typ-Konsistenz:** `runStepMorph`/`captureMorphState`-Signaturen unverändert;
  nur Body angepasst.
- **Offener Punkt (bewusst iterativ):** Der vertikale Start (Info-Box-Höhen,
  Padding) kann in Task 1/3 eine kleine y-Differenz lassen; wird per Sichtprüfung
  in Task 3 kontrolliert und bei Bedarf über die Container-Höhen-/Padding-Werte
  nachgezogen.

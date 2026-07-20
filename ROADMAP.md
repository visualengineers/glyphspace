# Implementierungs-Tickets – Wizard-Überarbeitung

Ticketsystem für die Umsetzungsphase. Als Backbone dient der **Anforderungskatalog (A1–A15)** 
Jede Anforderung ist ein Ticket. Feingranulare Einzelbefunde werden nicht als eigene Tickets geführt, sondern innerhalb des jeweiligen Anforderungstickets als abzuhakende Punkte gelistet.

Pfadangaben sind relativ zu `Code/src/app/`. Der Wizard liegt vollständig unter `preprocessing-wizard/`.

Miro-Board (Lösungskonzepte): https://miro.com/app/board/uXjVGrxvTQs=/

**Status-Legende:** `TODO` · `In Progress` · `In Feature-Branch` (fertig entwickelt, in `feature/wizard-redesign` gemergt, noch nicht in `main`) · `Finished` (in `main`)
**Typ:** `Konzept` (durchgeplant in Miro) · `trivial` (kleiner, klar umrissener Fix)

### Branch-Strategie

Integrations-Branch `feature/wizard-redesign` von `main` abzweigen. Pro Ticket ein kurzer Branch davon, dort das Feature bauen, dann per Merge/PR zurück in `feature/wizard-redesign`. Am Ende der ganze Feature-Branch nach `main`.

- Ticket-Branch-Namensschema: `feat/aN-kurzbezeichnung` (z. B. `feat/a4-undo-historie`).
- Ticket-Branches klein halten und zügig zurückmergen, sonst driftet der Feature-Branch weg.
- Regelmäßig `main` in `feature/wizard-redesign` mergen, damit der finale Merge klein bleibt.
- Statusübergang: `TODO` → (Branch anlegen) `In Progress` → (in Feature-Branch gemergt) `In Feature-Branch` → (Feature-Branch in `main`) `Finished`.


---

## Übersicht

| Ticket | Kurztitel | Typ | Status | Branch | Hauptort im Code |
|--------|-----------|-----|--------|--------|------------------|
| A1 | Fachbegriffe/Optionen erklären | Konzept | TODO | `feat/a1-erklaertexte` | `shared/constants/help-text.ts`, `shared/help-tooltip/`, Step 3+4 |
| A2 | Voreinstellungen sichtbar/umkehrbar | Konzept | In Feature-Branch | `feat/a2-smart-defaults` | Step 2+3, `services/preprocessing.service.ts` |
| A3 | Fehlermeldungen inline/verständlich | Konzept | TODO | `feat/a3-fehleranzeige` | Step 4+5 |
| A4 | Undo/Zurücksetzen | Konzept | TODO | `feat/a4-undo-historie` | `services/preprocessing.service.ts`, Step 1+4 |
| A5 | Zusammengehöriges gruppieren | Konzept | In Feature-Branch | `feat/a5-gruppierung` | Step 3+4 |
| A6 | Review-Navigation (Direktsprünge) | Konzept | In Feature-Branch | `feat/a6-direct-links` | Step 5, `shared/progress-stepper/` |
| A7 | Ehrliche/konsistente Signifier | trivial | TODO | `feat/a7-signifier` | Step 1/2/4, `shared/progress-stepper/` |
| A8 | Systemstatus/Datenanzeige korrekt | trivial | In Feature-Branch | `feat/a8-datenanzeige` | Step 2+4 |
| A9 | Beschleuniger für Power-Nutzer | Konzept | In Feature-Branch | `feat/a9-power-shortcuts` | Step 2/3/4 |
| A10 | Layout gegen lange/viele Inhalte | Konzept | TODO | `feat/a10-layout-robust` | Step 1+4, `shared/_wizard-shared.scss` |
| A11 | Technische Defekte beheben | trivial | TODO | `feat/a11-bugfixes` | siehe Ticket |
| A12 | Zweispaltiges Layout | Konzept | In Feature-Branch | `feat/a12-two-column` | `preprocessing-wizard.component.*`, `shared/progress-stepper/` |
| A13 | Schrittlogik klären/neu ordnen | Konzept | In Feature-Branch | `feat/a13-schrittlogik` | Step 2/3/4, `shared/constants/step-info.ts` |
| A14 | Übergänge sichtbar (Animation) | Konzept | In Progress | `feat/a14-animation` | Step 2↔3, `shared/data-preview-table/` |
| A15 | Einheitliches Tabellen/Listen-System | Konzept | In Feature-Branch | `feat/a15-table-system` | `shared/data-preview-table/`, Step 2/3/4 |

---

## Umsetzungsreihenfolge und Abhängigkeiten

Die Reihenfolge ist von den Abhängigkeiten getrieben, nicht von der Katalognummer. Grundgedanke: erst das strukturelle Fundament (Layout-Shell, Schrittlogik, gemeinsame Tabelle), dann die Features, die darauf aufsetzen, zuletzt der Feinschliff. Undo (A4) kommt spät, weil es zum einen den Platz im großen Layout braucht und zum anderen den Zustand sichern muss, den erst die Smart Defaults (A2) festlegen.

| Phase | Reihenfolge | Ticket | Blockiert von | Begründung |
|-------|-------------|--------|---------------|------------|
| 1 – Fundament | 1 | A12 Zweispaltiges Layout | — | Die Shell, in der alle Schritte rendern. Muss zuerst stehen. |
| 1 – Fundament | 2 | A13 Schrittlogik/Neuzuschnitt Schritt 4 | A12 | Legt fest, welcher Inhalt in welchem Schritt lebt; spätere Tickets bauen darauf. |
| 1 – Fundament | 3 | A15 Tabellen/Listen-System | A12 (inhaltlich A13) | Gemeinsame Tabellenkomponente, die A2, A8, A9, A14 wiederverwenden. |
| 2 – Features | 4 | A5 Gruppierung/Parameter in Box | A13 | Setzt den Neuzuschnitt von Schritt 4 voraus. |
| 2 – Features | 5 | A2 Smart Defaults sichtbar/umkehrbar | A15 | Braucht die Tabelle, um Auswahl-/Default-Zustand anzuzeigen. |
| 2 – Features | 6 | A14 Übergangsanimation 2↔3 | A15, A13 | Tabelle ist Träger des Morphings; Schrittstruktur muss stehen. |
| 2 – Features | 7 | A9 Power-Beschleuniger | A15 | Shift-Klick, Select-all-gefiltert, Drag-and-drop bauen auf der Tabelle/Liste auf. |
| 2 – Features | 8 | A10 Layout-Robustheit/Feature-Suche | A15, A12 | Durchsuchbare Feature-Liste und Umbruch im neuen Layout. |
| 2 – Features | 9 | A6 Review-Direktlinks | A13 | Sprünge zielen auf die final zugeschnittenen Schritte. |
| 2 – Features | 10 | A8 Datenanzeige („-"→„0", Zeilenkontext) | A15 | Anzeige in der gemeinsamen Tabelle. |
| 3 – Zustand/Inhalt | 11 | A3 Fehleranzeige/Persistent Result | A13 | Step 4/5 müssen strukturell stehen. |
| 3 – Zustand/Inhalt | 12 | A4 Undo/Historie | A12, A2 | Braucht Platz im Layout und ein gesetztes State-/Reset-Modell. |
| 4 – Feinschliff | 13 | A1 Erklärtexte/Tooltips | — (locker) | Inhaltsschicht; sinnvoll, wenn die Komponenten existieren. |
| 4 – Feinschliff | 14 | A7 Signifier | — | Kosmetisch; final nach dem Restyle durch A12/A15. |
| 4 – Feinschliff | 15 | A11 Technische Defekte | teils — | Flaky Tooltip und doppelte „Moderate"-Option sind unabhängige Quick Wins (jederzeit, gern zuerst für Momentum); Persistent-Result-Teil zusammen mit A3. |

```mermaid
graph TD
    A12[A12 Zweispalten-Layout] --> A13[A13 Schrittlogik]
    A12 --> A15[A15 Tabellen-System]
    A13 --> A15
    A13 --> A5[A5 Gruppierung/Parameter]
    A15 --> A2[A2 Smart Defaults]
    A15 --> A14[A14 Animation 2 zu 3]
    A13 --> A14
    A15 --> A9[A9 Power-Beschleuniger]
    A15 --> A10[A10 Layout-Robustheit]
    A12 --> A10
    A13 --> A6[A6 Review-Direktlinks]
    A15 --> A8[A8 Datenanzeige]
    A13 --> A3[A3 Fehleranzeige]
    A12 --> A4[A4 Undo/Historie]
    A2 --> A4
    A1[A1 Erklaertexte]
    A7[A7 Signifier]
    A11[A11 Technische Defekte / Quick Wins]
```

Quick Wins ohne Abhängigkeit, die sich parallel zum Fundament wegräumen lassen: A11 (flaky Tooltip, doppelte Option), A7 (Signifier), teils A1 (Erklärtexte).

---

## A1 – Fachbegriffe und Optionen verständlich erklären
**Typ:** Konzept · **Miro:** Visual Tooltips Methoden · **Status:** TODO · **Branch:** `feat/a1-erklaertexte`
**Befunde:** C-S4-01, C-S4-03, C-S4-08, C-S4-10, S-S3-02, S-S3-04, P-S3-04

**Problem:** Fachbegriffe werden ohne Erklärung angeboten (Farbattribut, Projektionsmethoden, FastMap, Ausreißermethoden, Z-Wert-Standardisierung, Smart Defaults).

**Hinweis:** Aus A5 übernommen: Die unerklärten Farbabweichungen bzw. die „Farbauswahl" sind hier über einen erklärenden Text zu lösen, nicht über ein zusätzliches Farb-Steuerelement.

**Wo umsetzen:**
- Erklärtexte zentral pflegen in `shared/constants/help-text.ts`.
- Abrufbare Erklärung (Progressive Disclosure) über die bestehende `shared/help-tooltip/`-Komponente; für Projektionsmethoden auf visuelle Tooltips erweitern (Miro „Visual Tooltips Methoden", vgl. `tmp/Projektion_Methoden_Visualisierung.html`).
- Einbindung an den Optionen selbst: Farbattribut und Projektionen in `steps/step4-visualization-settings/`, Ausreißer-/Standardisierungsoptionen in `steps/step3-configure-data-features/`.

---

## A2 – Voreinstellungen sichtbar und umkehrbar machen
**Typ:** Konzept · **Miro:** Smart Defaults Button · **Status:** In Feature-Branch · **Branch:** `feat/a2-a9-defaults-power`
**Befunde:** C-S2-01, C-S3-02, S-S3-01, P-S3-04

**Problem:** Smart Defaults sind unsichtbar; unklar was automatisch gesetzt wurde; geänderte Defaults sind nicht reaktivierbar; in der Spaltenauswahl fehlt eine sinnvolle Vorauswahl.

**Wo umsetzen:**
- Smart-Default-Logik/State in `services/preprocessing.service.ts` (Kennzeichnung „vom Default abweichend", Reset-Funktion).
- Vorauswahl beim Spalten-Import in `steps/step2-column-selection/` (offensichtlich ungeeignete Spalten vorab abwählen; vgl. `missingPercentage > 50 || uniqueCount === 1`).
- Sichtbare Kennzeichnung + „Smart Defaults zurücksetzen/erneut anwenden"-Button in `steps/step3-configure-data-features/` und `steps/step4-visualization-settings/`.

---

## A3 – Fehlermeldungen inline, verständlich und lösungsorientiert
**Typ:** Konzept · **Miro:** Fehleranzeige, NEU: Persistent Result Screen + Errorhandling · **Status:** TODO · **Branch:** `feat/a3-fehleranzeige`
**Befunde:** C-S4-05, C-S5-02, P-S5-01

**Problem:** Fehler erscheinen spät, entfernt vom Ort, inhaltlich nichtssagend, teils nur als flüchtiges Popup.

**Wo umsetzen:**
- Feldnahe Inline-Validierung in `steps/step4-visualization-settings/` (Fehler am jeweiligen Parameter).
- Verständliche, dauerhaft sichtbare Fehlermeldung im Review/Processing: `steps/step5-review-processing/` (Ursache + Lösung, kein verschwindendes Popup).
- Analysegrundlage: `fehlerbehandlung-wizard-analyse.html`, `fehlerklassen-ableitbarkeit.html`.

---

## A4 – Rückgängigmachen und Zurücksetzen anbieten
**Typ:** Konzept · **Miro:** Historie einführen · **Status:** TODO · **Branch:** `feat/a4-undo-historie`
**Befunde:** C-S1-02, C-S4-09, P-S3-01

**Problem:** Folgenschwere Aktionen (erneuter Upload, Smart-Defaults-Klick, gesetzte Filter) sind nicht umkehrbar. Voraussetzung ist eine Aktionshistorie — im Code bisher **nicht vorhanden** (kein `undo`/`history` gefunden).

**Wo umsetzen:**
- Historie/Undo-Stack neu im State: `services/preprocessing.service.ts` (Snapshot der `preprocessing-state`).
- Undo nach „Upload Different File": `steps/step1-upload/`.
- Undo für Smart-Defaults-Reset: `steps/step4-visualization-settings/`.
- Filter leeren: `steps/step3-configure-data-features/`.

---

## A5 – Zusammengehöriges räumlich gruppieren
**Typ:** Konzept · **Miro:** Parameter Location, Aufbereitung Rework · **Status:** In Feature-Branch · **Branch:** `feat/a5-gruppierung`
**Erweiterter Umfang:** die Methodenbox klappt in-place auf (Höhe animiert, Breite konstant) und ist im nicht-aufgeklappten Zustand vollständig geschlossen; Reset je Box. Der Schritt-3-Tabellenteil von A5 wurde bewusst nicht hier, sondern im Zuge von A15 (Schritt-3-Redesign) behandelt.
**Befunde:** C-S3-01, C-S4-07, S-S4-03

**Problem:** Projektionsparameter liegen außerhalb ihres Methodenkastens (willkürlich platziert); Datenkonfiguration überladen, Spaltenzuordnung nicht erkennbar. *(Vom Nutzer als teils trivial markiert: Parameter in die zugehörige Parameterbox verschieben.)*

**Wo umsetzen:**
- Parameter in den Kasten der jeweiligen Methode ziehen + Reset auf Defaultwerte: `steps/step4-visualization-settings/step4-visualization-settings.component.html` und `.ts` (Miro „Parameter Location").
- Datenkonfiguration klarer strukturieren (Angabe↔Spalte erkennbar): `steps/step3-configure-data-features/`.

**Hinweis:** Der Befund zu unerklärten Farbabweichungen bzw. zur „Farbauswahl" passt inhaltlich nicht zu A5 und wird nach A1 verschoben; dort ist er über einen erklärenden Text statt über ein Farb-Steuerelement zu lösen.

---

## A6 – Navigation und Bearbeitung im Review-Schritt
**Typ:** Konzept · **Miro:** Direct Links · **Status:** In Feature-Branch · **Branch:** `feat/a6-a8-review-datenanzeige`
**Befunde:** C-S5-01, S-S5-01

**Problem:** Im Review lässt sich nichts direkt bearbeiten; Nutzer müssen sich merken, in welchem Schritt eine Einstellung lag.

**Wo umsetzen:**
- Direktsprünge je Einstellungsblock in `steps/step5-review-processing/step5-review-processing.component.html`.
- Sprung-/Aktivierungslogik in `preprocessing-wizard.component.ts` bzw. `shared/progress-stepper/` (gezielt zu Schritt X wechseln).

---

## A7 – Ehrliche und konsistente Signifier
**Typ:** trivial · **Miro:** Änderungen · **Status:** TODO · **Branch:** `feat/a7-signifier`
**Befunde:** C-S1-01, C-S4-02, C-S3-03, S-S2-01

**Problem:** Aktive Navigationsleiste wirkt deaktiviert; Auswahlfeld sieht aus wie Eingabefeld; farbliche Abweichungen unerklärt; „Select All" suggeriert falschen Zustand.

**Wo umsetzen:**
- Navigationsleisten-Farbschema: `shared/progress-stepper/progress-stepper.component.scss`.
- Auswahlfeld-Optik (Select statt Eingabe): `steps/step4-visualization-settings/`.
- „Select All"-Zustand: `steps/step2-column-selection/`.

---

## A8 – Systemstatus und Datenanzeige korrekt sichtbar machen
**Typ:** trivial · **Miro:** — · **Status:** In Feature-Branch · **Branch:** `feat/a6-a8-review-datenanzeige`
**Befunde:** C-S4-06, C-S2-03

**Problem:** Zeilenanzahl ohne Gesamtkontext; fehlende Werte als „-" statt „0".

**Wo umsetzen:**
- „-"→„0" bei fehlenden Werten: `steps/step2-column-selection/` bzw. `shared/data-preview-table/` (Missing-Spalte).
- Zeilenanzahl im Gesamtkontext anzeigen: `steps/step4-visualization-settings/`.

---

## A9 – Beschleuniger für Power-Nutzer
**Typ:** Konzept · **Miro:** Glyph Feature Search Filter · **Status:** In Feature-Branch · **Branch:** `feat/a2-a9-defaults-power`
**Befunde:** P-S2-02, P-S3-02, P-S3-03, P-S4-01

**Problem:** Fehlende Tastenkürzel (Shift-Klick, Strg+F), keine gemeinsame Bearbeitung gleichartiger Spalten, kein „alle auswählen" bei aktivem Filter, keine Drag-and-drop-Reihenfolge der Features.

**Wo umsetzen:**
- Shift-Klick/Mehrfachauswahl + „alle gefilterten auswählen": `steps/step2-column-selection/`, `steps/step3-configure-data-features/`.
- Bulk-Umstellung gleichartiger Spalten: `steps/step3-configure-data-features/`.
- Drag-and-drop-Reihenfolge der Features: `steps/step4-visualization-settings/`.
- Such-/Filterfeld als Navigationshilfe (Miro „Glyph Feature Search Filter").

---

## A10 – Layout gegen lange Inhalte und viele Elemente absichern
**Typ:** Konzept · **Miro:** Glyph Feature Search Filter · **Status:** TODO · **Branch:** `feat/a10-layout-robust`
**Befunde:** P-S1-01, C-S4-11

**Problem:** Lange Namen brechen aus dem Layout; bei vielen Eigenschaften wird die Feature-Navigation unübersichtlich.

**Wo umsetzen:**
- Umbruch/Kürzung mit Tooltip für langen Text: `shared/_wizard-shared.scss`, `steps/step1-upload/`.
- Platzsparende, durchsuchbare Feature-Liste: `steps/step4-visualization-settings/` (gemeinsam mit A9-Suchfeld).

---

## A11 – Technische Defekte beheben
**Typ:** trivial · **Miro:** Visual Tooltips Methoden, NEU: Persistent Result Screen + Errorhandling · **Status:** TODO · **Branch:** `feat/a11-bugfixes`
**Befunde:** C-S3-04, C-S4-04, S-S4-02, P-S5-02, P-S5-03

**Problem/Wo je Defekt:**
- **C-S4-04** Tooltip verschwindet beim Inspizieren (Flaky) → `shared/help-tooltip/help-tooltip.component.ts` (Hover-/Z-Index-Verhalten). *Vom Nutzer als trivial markiert.*
- **S-S3-03** verwandt (Tooltip auf falscher Z-Ebene) → gleiche Komponente / `steps/step3-configure-data-features/`.
- **C-S3-04** Option „Moderate" doppelt → `steps/step3-configure-data-features/` (Optionsliste).
- **S-S4-02** Schritt-Navigation springt nicht zurück zu Schritt 4 → `shared/progress-stepper/` bzw. `preprocessing-wizard.component.ts`.
- **P-S5-02 / P-S5-03** Zusammenfassung verschwindet beim Schließen während der Projektion / nichtssagender Screen nach Wiedereinstieg → `steps/step5-review-processing/` (Miro „Persistent Result Screen + Errorhandling").

---

## A12 – Anzeigeraum effizient und zweispaltig nutzen
**Typ:** Konzept · **Miro:** Neue two column UI, Neuer Schritt 4 Anpassung · **Status:** In Feature-Branch · **Branch:** `feat/a12-two-column`
**Befund:** K-01

**Problem:** Vertikaler Bildschirmraum schlecht genutzt; Navigation über volle Breite erzeugt langes Scrollen.

**Wo umsetzen:**
- Grundlayout (Navigation links, Arbeitsbereich rechts): `preprocessing-wizard.component.html` + `.scss`.
- Schritt-Navigation an den linken Rand: `shared/progress-stepper/`.

---

## A13 – Schrittlogik klären und neu ordnen
**Typ:** Konzept · **Miro:** Aufbereitung Rework, Neuer Schritt 4 Anpassung · **Status:** In Feature-Branch · **Branch:** `feat/a13-schrittlogik`
**Befund:** K-02

**Problem:** Aufgabe der Schritte 2/3/4 und Bedeutung der jeweiligen Spaltenauswahl konzeptionell nicht getrennt.

**Wo umsetzen:**
- Schrittbeschreibungen/mentales Modell: `shared/constants/step-info.ts`.
- Neuzuschnitt Schritt 4 (Spaltenauswahl neben Projektionsmethode): `steps/step4-visualization-settings/`.
- Abgrenzung Schritt 2 (betrachtete Spalten) vs. Schritt 3 (in Dimensionsreduktion): `steps/step2-column-selection/`, `steps/step3-configure-data-features/`.

---

## A14 – Übergänge zwischen den Schritten sichtbar machen
**Typ:** Konzept · **Miro:** Animation · **Status:** In Progress · **Branch:** `feat/a14-animation`
**Befund:** K-03

**Problem:** Zusammenhang der Tabellen von Schritt 2 und 3 nicht sichtbar; unklar, wie die Auswahl übernommen wird.

**Wo umsetzen:**
- Morphing-/Übergangsanimation Schritt 2↔3 (beidseitig): Übergang in `preprocessing-wizard.component.ts` orchestrieren, gemeinsame Tabellenkomponente `shared/data-preview-table/` als Träger der Animation.

---

## A15 – Einheitliches Tabellen- und Listen-Designsystem
**Typ:** Konzept · **Miro:** Tabellen/Listen · **Status:** In Feature-Branch · **Branch:** `feat/a15-table-system`
**Erweiterter Umfang:** zusätzlich Schritt-3-Redesign (Option 1d: Master-Rail + eingelassenes Konfigurations-Well mit Breadcrumb und Fehlwert-Badges) sowie Überarbeitung der Schritt-4-Feature-Liste (funktionale Suche/Typ-Filter, Drag-and-drop-Reihenfolge, Drop-in aus der Available-Liste, Höhenlimit mit Scroll) — Letzteres überschneidet sich mit A9.
**Befund:** K-04

**Problem:** Wiederkehrende Tabellen/Listen (Spaltenauswahl, Datenkonfiguration, Feature-Auswahl) sind funktional gleich, aber uneinheitlich gestaltet.

**Wo umsetzen:**
- Gemeinsames Muster in `shared/data-preview-table/` konsolidieren (Auswahl links, Umschalter „alle", Suchfeld, keine Typ-Farbcodierung, einheitliche blaue Akzentfarbe).
- Anwendung in `steps/step2-column-selection/`, `steps/step3-configure-data-features/`, `steps/step4-visualization-settings/`.
- Gemeinsame Styles: `shared/_wizard-shared.scss`.

---

*Ausblick (nicht im Umsetzungsrahmen): methodenspezifische Standardwerte je Projektionsmethode — laut Anforderungskatalog bewusst außerhalb des Rahmens.*

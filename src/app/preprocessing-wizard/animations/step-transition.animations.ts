import { trigger, transition, query, style, animate, group } from '@angular/animations';

/**
 * A14 – Übergangsanimation Schritt 2 → Schritt 3 (kontinuierlicher Morph).
 *
 * Anforderung (Storyboard): Es ist ein durchgehender Morph bestehender Elemente.
 * Nichts fadet weg oder erscheint per Fade/Pop-in — alle Bewegungen sind
 * Geometrie (clip/translate) und laufen zeitlich überlappend.
 *
 * Umsetzung als „Curtain/Overlay-Morph" komplett in der Wizard-Shell, ohne das
 * Markup von Step 2/Step 3 zu verändern (Selektoren nur lesend, alle `optional`):
 *
 *   Layer/Anordnung: Während des Übergangs werden aus- und eingehender Schritt
 *   überlagert (absolut). Step 2 (`:leave`) liegt OBEN und ist deckend (Hintergrund
 *   via SCSS), Step 3 (`:enter`) liegt darunter im finalen Layout
 *   (Master-Rail links + Detail-Well rechts).
 *
 *   Kollaps (Anker): Step 2 wird per `clip-path` von der rechten Kante nach links
 *   eingezogen (`inset(0 0 0 0)` → `inset(0 100% 0 0)`). Dadurch retrahieren die
 *   Detailspalten (Typ/Count/Unique/Missing/Distribution) zuerst nach links; die
 *   „Columnname"-Spalte am linken Rand bleibt am längsten stehen. In genau dieser
 *   Position liegt darunter bereits die Master-Rail von Step 3 — die Spaltennamen
 *   bleiben also über den gesamten Übergang als durchgehende Liste sichtbar
 *   (Handoff ohne Fade, Ankerelement).
 *
 *   Einfahren (gleichzeitig): Das Detail-/Konfig-Well von Step 3 fährt aus dem
 *   Offscreen rechts (`translateX(100%)` → `0`) an seinen Zielplatz neben der
 *   Columnname-Spalte. Kollaps und Einfahren laufen im selben `group()` und enden
 *   gemeinsam exakt im Step-3-Layout.
 *
 * Es wird bewusst KEINE `opacity` animiert (kein Verschwinden/Erscheinen).
 *
 * `prefers-reduced-motion` wird über das `@stepTransition.disabled`-Binding in der
 * Komponente respektiert; ist es gesetzt, überspringt Angular die Animation
 * vollständig (sofortiger Wechsel).
 */

// Material-Standard-Easing; nur Bewegung, keine harten Farb-/Layoutwerte.
const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';
// Überlappende Gesamtdauer des Morphs.
const DURATION = '450ms';

export const stepTransition = trigger('stepTransition', [
  transition('1 => 2', [
    // Aus- und eingehenden Schritt deckungsgleich überlagern.
    query(':enter, :leave', style({ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }), {
      optional: true,
    }),
    // Step 2 als deckende „Curtain" oben, Step 3 (Ziellayout) darunter.
    query(':leave', style({ zIndex: 2, clipPath: 'inset(0 0 0 0)' }), { optional: true }),
    query(':enter', style({ zIndex: 1 }), { optional: true }),
    // Detail-Well startet offscreen rechts (fährt gleich ein).
    query(':enter .detail-well', style({ transform: 'translateX(100%)' }), { optional: true }),
    // Nur während der Animation clippen (kein horizontaler Überlauf durch das Well).
    style({ overflow: 'hidden' }),

    // Kollaps und Einfahren laufen gleichzeitig / überlappend.
    group([
      // Step 2 wird von rechts nach links eingezogen (Detailspalten retrahieren,
      // Columnname-Spalte bleibt am längsten und geht in die Master-Rail über).
      query(':leave', [animate(`${DURATION} ${EASE}`, style({ clipPath: 'inset(0 100% 0 0)' }))], {
        optional: true,
      }),
      // Detail-Well fährt gleichzeitig von rechts an seinen Zielplatz.
      query(':enter .detail-well', [animate(`${DURATION} ${EASE}`, style({ transform: 'translateX(0)' }))], {
        optional: true,
      }),
    ]),
  ]),
]);

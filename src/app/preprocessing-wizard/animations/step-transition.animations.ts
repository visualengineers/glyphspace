import { trigger, transition, query, style, animate, group, sequence } from '@angular/animations';

/**
 * A14 – Übergangsanimation Schritt 2 → Schritt 3.
 *
 * Diese Animation liegt bewusst isoliert in der Wizard-Shell und greift die
 * DOM-Struktur von Schritt 2/Schritt 3 nur lesend (per CSS-Selektor) ab, ohne
 * deren Markup zu verändern. Alle Query-Selektoren sind `optional`, damit die
 * Animation degradiert (statt zu brechen), falls parallele Tickets Klassen
 * umbenennen.
 *
 * Sequenz beim Wechsel 1 => 2 (currentStep):
 *   Phase 1 (Kollaps):  Die Detailspalten der Step-2-Tabelle
 *                       (Typ/Count/Unique/Missing/Distribution) blenden aus,
 *                       übrig bleibt die Spaltennamen-Liste. Diese blendet in
 *                       die Master-Rail von Step 3 über (Crossfade).
 *   Phase 2 (Slide-in): Das Detail-/Konfig-Well von Step 3 fährt von rechts
 *                       herein (translateX 100% -> 0) und blendet dabei ein.
 *
 * `prefers-reduced-motion` wird über das `@stepTransition.disabled`-Binding in
 * der Komponente respektiert; ist es gesetzt, überspringt Angular die Animation
 * vollständig (sofortiger Wechsel wie zuvor).
 */

// Material-Standard-Easing; keine harten Farb-/Layoutwerte, nur Bewegung.
const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';

// Detailspalten der Step-2-Tabelle, die in Phase 1 kollabieren sollen.
const LEAVE_DETAIL_COLUMNS = [
  ':leave .col-type',
  ':leave .col-count',
  ':leave .col-unique',
  ':leave .col-missing',
  ':leave .col-distribution',
].join(', ');

export const stepTransition = trigger('stepTransition', [
  transition('1 => 2', [
    // Ein- und ausgehenden Schritt überlagern, damit die Sequenz staffelbar ist.
    query(':enter, :leave', style({ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }), {
      optional: true,
    }),
    // Step 3 zunächst verstecken; das Detail-Well startet rechts außerhalb.
    query(':enter', style({ opacity: 0 }), { optional: true }),
    query(':enter .detail-well', style({ transform: 'translateX(100%)', opacity: 0 }), { optional: true }),
    // Nur während der Animation clippen, damit das einfahrende Well keinen
    // horizontalen Scrollbalken erzeugt. Wird danach automatisch entfernt.
    style({ overflow: 'hidden' }),

    sequence([
      // Phase 1a: Detailspalten kollabieren (ausblenden), Spaltennamen bleiben.
      query(LEAVE_DETAIL_COLUMNS, [animate(`200ms ${EASE}`, style({ opacity: 0 }))], { optional: true }),

      // Phase 1b: Crossfade der verschlankten Tabelle in die Master-Rail.
      group([
        query(':leave', [animate(`180ms ${EASE}`, style({ opacity: 0 }))], { optional: true }),
        query(':enter', [animate(`180ms ${EASE}`, style({ opacity: 1 }))], { optional: true }),
      ]),

      // Phase 2: Detail-/Konfig-Well fährt von rechts herein.
      query(
        ':enter .detail-well',
        [animate(`300ms ${EASE}`, style({ transform: 'translateX(0)', opacity: 1 }))],
        { optional: true }
      ),
    ]),
  ]),
]);

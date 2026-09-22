/**
 * "Back to the top of the chart."
 *
 * The narrow layout stops the page scrolling and hands the vertical axis to the
 * chart pane, which is 3275px of it — a long way back to year 780 by thumb. So
 * once the reader is well into the chart, a button appears in the pane's bottom
 * left corner to return in one tap. It sits opposite the scroll cue on the
 * right, and outside the `<svg>`, so a tap on it never reaches a node.
 *
 * Unlike the cue this is a real control, so when it is not offered it is made
 * `inert` as well as transparent: a button faded out of sight must not still be
 * reachable by tab.
 */

/** How far down the reader must be before the offer is worth making. */
const SHOW_AFTER = 240;

export function backToTop(button: HTMLElement, scroller: HTMLElement): void {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const behavior: ScrollBehavior = reducedMotion ? 'auto' : 'smooth';

  const update = (): void => {
    // Whichever element is scrolling; the other contributes zero. See
    // `sticky-header.ts`, which reads the same pair.
    const on = window.scrollY + scroller.scrollTop > SHOW_AFTER;
    button.classList.toggle('on', on);
    button.inert = !on;
  };

  button.addEventListener('click', () => {
    scroller.scrollTo({ top: 0, behavior });
    window.scrollTo({ top: 0, behavior });
  });

  scroller.addEventListener('scroll', update, { passive: true });
  window.addEventListener('scroll', update, { passive: true });
  update();
}

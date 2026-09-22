/**
 * "There is more chart to the right."
 *
 * The chart is wider than its pane at every breakpoint below 2200px, and on a
 * wide screen the pane's horizontal scrollbar sits at the bottom of a box as
 * tall as the chart — 3275px down, out of sight until the page is scrolled to
 * the very end. So the affordance has to be drawn rather than left to the
 * browser.
 *
 * The cue is shown only while something is still off to the right, and stops
 * nudging once the reader has taken the hint. It is inert (`pointer-events:
 * none` in the stylesheet): an overlay sitting on the chart that swallowed a
 * click on a node would cost more than it explains.
 */

/** Slack for a fractional `scrollWidth`, and for a near-enough end. */
const EPS = 8;

export function scrollCue(cue: HTMLElement, scroller: HTMLElement): void {
  const update = (): void => {
    const remaining = scroller.scrollWidth - scroller.clientWidth - scroller.scrollLeft;
    cue.classList.toggle('on', remaining > EPS);
  };

  scroller.addEventListener(
    'scroll',
    () => {
      // One nudge is a hint; a nudge that never stops is a tic.
      if (scroller.scrollLeft > EPS) cue.classList.add('moved');
      update();
    },
    { passive: true },
  );

  // Fires once on observe, and again whenever the pane is resized — which is
  // how the 1800px and 2200px breakpoints get re-evaluated, and how the cue
  // disappears once the whole chart fits.
  new ResizeObserver(update).observe(scroller);
}

/**
 * Collapse the header into a bar once the reader has scrolled.
 *
 * Which element scrolls depends on the layout, so this watches both: on a wide
 * screen the page scrolls and the chart pane does not, and on a narrow screen
 * the page cannot scroll at all (`html, body { overflow: hidden }`) and the
 * pane scrolls instead. Adding the two offsets together covers both modes
 * without asking which one is in force — whichever is not scrolling
 * contributes zero.
 *
 * The collapsed height is published as `--hdr` so the sticky side panel can sit
 * directly beneath it instead of guessing an offset. Collapsing is animated, so
 * that height is published from a ResizeObserver rather than measured once at
 * the moment the class flips — measuring then would catch the header mid-ease
 * and leave the panel sitting under a bar that has since finished shrinking.
 */
export function stickyHeader(header: HTMLElement, pane: HTMLElement): void {
  /**
   * Collapsing hands its height to the pane, which can clamp the pane's
   * `scrollTop` back down when it is already at the bottom. Two thresholds stop
   * that from oscillating between the two states.
   */
  const COLLAPSE = 90;
  const EXPAND = 40;
  let stuck = false;

  const publish = (): void => {
    document.documentElement.style.setProperty(
      '--hdr',
      stuck ? `${header.offsetHeight + 8}px` : '0px',
    );
  };

  const update = (): void => {
    const offset = window.scrollY + pane.scrollTop;
    const want = offset > (stuck ? EXPAND : COLLAPSE);
    if (want === stuck) return;
    stuck = want;
    header.classList.toggle('stuck', stuck);
    publish();
  };

  window.addEventListener('scroll', update, { passive: true });
  pane.addEventListener('scroll', update, { passive: true });
  // Follows the ease, and a rewrap at a new width, for free. `--hdr` only feeds
  // the panel's `top`, so nothing here can resize the header back.
  new ResizeObserver(publish).observe(header);
  update();
}

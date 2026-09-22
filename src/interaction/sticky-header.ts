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
 * directly beneath it instead of guessing an offset.
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

  const update = (): void => {
    const offset = window.scrollY + pane.scrollTop;
    const want = offset > (stuck ? EXPAND : COLLAPSE);
    if (want === stuck) return;
    stuck = want;
    header.classList.toggle('stuck', stuck);
    document.documentElement.style.setProperty(
      '--hdr',
      stuck ? `${header.offsetHeight + 8}px` : '0px',
    );
  };

  window.addEventListener('scroll', update, { passive: true });
  pane.addEventListener('scroll', update, { passive: true });
  update();
}

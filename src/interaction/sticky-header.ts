/**
 * Collapse the header into a bar once the chart is scrolled.
 *
 * The collapsed height is published as `--hdr` so the sticky side panel can sit
 * directly beneath it instead of guessing an offset.
 */
export function stickyHeader(header: HTMLElement): void {
  const THRESHOLD = 90;
  let stuck = false;

  const update = (): void => {
    const want = window.scrollY > THRESHOLD;
    if (want === stuck) return;
    stuck = want;
    header.classList.toggle('stuck', stuck);
    document.documentElement.style.setProperty(
      '--hdr',
      stuck ? `${header.offsetHeight + 8}px` : '0px',
    );
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
}

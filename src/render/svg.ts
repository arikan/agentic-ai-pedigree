const SVG_NS = 'http://www.w3.org/2000/svg';

type SvgTag = keyof SVGElementTagNameMap;

/**
 * Create an SVG element with attributes, optionally appending it.
 *
 * SVG needs `createElementNS`; `document.createElement('rect')` yields an
 * unknown HTML element that silently never paints.
 */
export function el<K extends SvgTag>(
  tag: K,
  attrs: Record<string, string | number> = {},
  parent?: Element,
): SVGElementTagNameMap[K] {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) {
    node.setAttribute(key, String(value));
  }
  parent?.appendChild(node);
  return node;
}

/** Add a `<tspan>` line per entry, stacking downward by `dy`. */
export function textLines(
  text: SVGTextElement,
  lines: readonly string[],
  x: number,
  dy: number,
): void {
  for (const [index, line] of lines.entries()) {
    const span = el('tspan', { x, dy: index ? dy : 0 }, text);
    span.textContent = line;
  }
}

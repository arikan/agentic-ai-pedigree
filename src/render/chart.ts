import type { NodeId } from '../data/nodes';
import type { ChartLayout, RoutedEdge } from '../layout';
import { AXIS_W, LINE, NODE_W, PAD, TICKS, yOf } from '../layout';
import { ICONS } from './icons';
import { el, textLines } from './svg';

export type ChartView = {
  readonly svg: SVGSVGElement;
  /** The `<g>` holding every node, for delegated events. */
  readonly nodeLayer: SVGGElement;
  readonly nodeEls: ReadonlyMap<NodeId, SVGGElement>;
  /** Parallel to the routed edges passed in. */
  readonly edgeEls: readonly SVGPathElement[];
  /** Caveat labels, by edge index; only `weak` edges with a label have one. */
  readonly labelEls: ReadonlyMap<number, SVGTextElement>;
};

/**
 * Pack `items` into as few lines of `maxWidth` as they fit in, measuring with
 * `gauge` (which must already carry the class being measured).
 *
 * Nothing wraps because it was authored to: a heading or a definition stays on
 * one line whenever the lane is wide enough, and the lines that do appear are a
 * consequence of the width. An item is never broken up — for a heading the
 * items are words, and for a lane's definitions they are the definitions
 * themselves, so a lane too narrow for both breaks between them rather than
 * through one. An item wider than the lane on its own overflows, which is the
 * honest failure: it says the lane is too narrow for that name.
 */
function packToWidth(
  gauge: SVGTextElement,
  items: readonly string[],
  maxWidth: number,
  separator = ' ',
): readonly string[] {
  const lines: string[] = [];
  let line = '';

  for (const item of items) {
    const candidate = line ? `${line}${separator}${item}` : item;
    gauge.textContent = candidate;
    // getComputedTextLength is 0 where text cannot be measured; one line then.
    if (line && gauge.getComputedTextLength() > maxWidth) {
      lines.push(line);
      line = item;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);

  return lines;
}

/** Draw the whole chart once. Nothing here re-renders; focus is CSS state. */
export function renderChart(
  container: Element,
  layout: ChartLayout,
  routed: readonly RoutedEdge[],
): ChartView {
  const { width, height, lanes, placed } = layout;

  const svg = el('svg', {
    width,
    height,
    viewBox: `0 0 ${width} ${height}`,
    role: 'img',
    'aria-label': 'Pedigree chart of agentic AI traditions',
  });
  container.appendChild(svg);

  // Lane backgrounds, pictograms, headings.
  const laneLayer = el('g', {}, svg);
  // Off-canvas, for measuring candidate lines; wears the class it measures.
  const gauge = el('text', { x: -9999, y: -9999 }, svg);
  // Every heading is measured before anything is drawn, because the definition
  // lines all hang off the tallest one: a lane whose heading fits on one line
  // must not pull its definition up out of line with its neighbours'.
  gauge.setAttribute('class', 'lane-title');
  const headings = lanes.map((lane) => packToWidth(gauge, lane.title.split(' '), lane.w - PAD));
  // A lane's definitions share a line where they fit, separated by a middot.
  gauge.setAttribute('class', 'lane-def');
  const defs = lanes.map((lane) =>
    packToWidth(gauge, lane.def.split('; '), lane.w - PAD, ' \u00b7 '),
  );
  gauge.remove();
  const defY = 122 + 18 * Math.max(...headings.map((lines) => lines.length));

  for (const [index, lane] of lanes.entries()) {
    el(
      'rect',
      { x: lane.x, y: 0, width: lane.w, height, class: `lane-bg${index % 2 ? ' alt' : ''}` },
      laneLayer,
    );

    const icon = el(
      'g',
      { class: 'lane-icon', transform: `translate(${lane.x + PAD},12) scale(2.6)` },
      laneLayer,
    );
    icon.innerHTML = ICONS[lane.id] ?? '';

    const title = el('text', { x: lane.x + PAD, y: 122, class: 'lane-title' }, laneLayer);
    textLines(title, headings[index] ?? [lane.title], lane.x + PAD, 18);

    const def = el('text', { x: lane.x + PAD, y: defY, class: 'lane-def' }, laneLayer);
    textLines(def, defs[index] ?? [lane.def], lane.x + PAD, 14);
  }

  // Year gridlines.
  const tickLayer = el('g', { class: 'tick' }, svg);
  for (const year of TICKS) {
    const y = yOf(year);
    el('line', { x1: AXIS_W - 6, x2: width, y1: y, y2: y }, tickLayer);
    const label = el('text', { x: AXIS_W - 10, y: y + 4, 'text-anchor': 'end' }, tickLayer);
    label.textContent = String(year);
  }

  // Edges, under the nodes.
  const edgeLayer = el('g', {}, svg);
  const edgeEls: SVGPathElement[] = [];
  const labelEls = new Map<number, SVGTextElement>();
  for (const [index, edge] of routed.entries()) {
    edgeEls.push(
      el(
        'path',
        { d: edge.d, class: `edge${edge.kind === 'weak' ? ' weak' : ''}`, 'data-i': index },
        edgeLayer,
      ),
    );

    if (edge.kind === 'weak' && edge.label) {
      const label = el(
        'text',
        { x: edge.labelX, y: edge.labelY, class: 'edge-label', 'data-i': index },
        edgeLayer,
      );
      label.textContent = edge.label;
      labelEls.set(index, label);
    }
  }

  // Nodes, on top.
  const nodeLayer = el('g', {}, svg);
  const nodeEls = new Map<NodeId, SVGGElement>();
  for (const node of placed) {
    const group = el(
      'g',
      {
        class: 'node',
        transform: `translate(${node.x},${node.y})`,
        tabindex: 0,
        'data-id': node.id,
      },
      nodeLayer,
    );
    el('rect', { width: NODE_W, height: node.h, rx: 2 }, group);

    const year = el('text', { x: 8, y: 12, class: 'yr' }, group);
    year.textContent = String(node.year);

    const name = el('text', { x: 8, y: 26, class: 'nm' }, group);
    name.textContent = node.name;

    const work = el('text', { x: 8, y: 38, class: 'wk' }, group);
    textLines(work, node.work, 8, LINE);

    nodeEls.set(node.id, group);
  }

  return { svg, nodeLayer, nodeEls, edgeEls, labelEls };
}

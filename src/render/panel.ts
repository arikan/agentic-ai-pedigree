import type { PedigreeEdge } from '../data/edges';
import type { NodeId } from '../data/nodes';
import { nodeById } from '../data/nodes';
import { REFS } from '../data/refs';
import type { TraditionId } from '../data/types';
import type { PedigreeGraph } from '../graph';

/**
 * Tradition names for the panel subtitle.
 *
 * Keyed by tradition, so there are eight — the six lane headings in `LANES` are
 * a different, shorter set.
 */
const TRADITION_NAME: Record<TraditionId, string> = {
  logic: 'Logic & computation',
  control: 'Control & cybernetics',
  physics: 'Physics & thermodynamics',
  popstat: 'Population statistics',
  textstat: 'Text statistics & information',
  decision: 'Decision theory & RL',
  game: 'Game theory & complexity',
  neural: 'Neural networks & language models',
};

/** Escape for interpolation into panel markup. */
export function esc(value: string | number): string {
  return String(value).replace(
    /[&<>"]/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char] ?? char,
  );
}

export type PanelDeps = {
  readonly graph: PedigreeGraph;
  readonly nodeCount: number;
  readonly edgeCount: number;
  readonly weakCount: number;
};

/** The node view: what it is, what it draws on, what it feeds, where to read. */
export function renderNodePanel(
  panel: Element,
  id: NodeId,
  { graph }: PanelDeps,
  pinned: boolean,
): void {
  const node = nodeById(id);
  const ins = [...graph.edgesInto(id)].sort(byYear((edge) => edge.from));
  const outs = [...graph.edgesOutOf(id)].sort(byYear((edge) => edge.to));
  const ancestors = graph.ancestors(id).nodes.size - 1;
  const descendants = graph.descendants(id).nodes.size - 1;
  const refs = REFS[id] ?? [];

  panel.innerHTML = `
    <h2>${esc(node.name)}</h2>
    <div class="meta">${node.year} · ${esc(TRADITION_NAME[node.tradition])}</div>
    <p><b>${esc(node.work.join(' '))}.</b> ${esc(node.note)}</p>
    <h3>Draws on</h3>
    <ul>${list(ins, (edge) => edge.from, 'Nothing on this chart; a root.')}</ul>
    <h3>Feeds</h3>
    <ul>${list(outs, (edge) => edge.to, 'Nothing on this chart yet.')}</ul>
    <h3>References</h3>
    <ul class="refs">${
      refs
        .map(
          ([text, url]) =>
            `<li><a href="${esc(url)}" target="_blank" rel="noopener">${esc(text)}</a></li>`,
        )
        .join('') || '<li>None listed.</li>'
    }</ul>
    <p class="hint">${ancestors} ancestors and ${descendants} descendants highlighted. ${
      pinned ? 'Click again or press Escape to release.' : 'Click to pin.'
    }</p>`;
}

/** The resting state: how to read the chart, and what is on it. */
export function renderIntroPanel(panel: Element, deps: PanelDeps): void {
  panel.innerHTML = `
    <h2>Reading the chart</h2>
    <div class="meta">${deps.nodeCount} nodes · ${deps.edgeCount} edges · ${deps.weakCount} weak</div>
    <p>Today’s agent is a statistical prior, post-trained by RL, wrapped in a tool loop, and named after the principal–agent relation in economics. Trace the bottom row to see how little of the chart it cites.</p>
    <p><b>Solid lines</b> are documented transfers. <b>Dashed lines</b> are resemblances or priority without known transmission; their caveat appears when traced.</p>
    <p>Time runs downward, compressed before 1900. Each node carries its own year; positions within a crowded decade are approximate. Each lane is headed by what "agent" means there.</p>
    <p class="hint">Hover or tap a node. Click empty space or press Escape to release a pinned one.</p>`;
}

function byYear(end: (edge: PedigreeEdge) => NodeId) {
  return (a: PedigreeEdge, b: PedigreeEdge) => nodeById(end(a)).year - nodeById(end(b)).year;
}

function list(
  edges: readonly PedigreeEdge[],
  end: (edge: PedigreeEdge) => NodeId,
  empty: string,
): string {
  if (edges.length === 0) return `<li>${empty}</li>`;
  return edges
    .map((edge) => {
      const other = nodeById(end(edge));
      const caveat = edge.kind === 'weak' ? `<span class="w">${esc(edge.label)}</span>` : '';
      return `<li><span class="n">${esc(other.name)}</span><span class="y">${other.year}</span>${caveat}</li>`;
    })
    .join('');
}

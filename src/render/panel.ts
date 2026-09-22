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
/** Also the mobile sheet's label when nothing is selected. */
export const INTRO_HEADING = 'Reading the chart';

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
};

/**
 * The node view: what it is, what it draws on, what it feeds, where to read.
 *
 * Returns the heading, which the mobile sheet shows on its collapsed bar.
 */
export function renderNodePanel(
  panel: Element,
  id: NodeId,
  { graph }: PanelDeps,
  pinned: boolean,
): string {
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

  return node.name;
}

/**
 * The resting state: how to read the chart, and what is on it.
 *
 * Kept to the notation and the gestures. The framing — what today's agent is
 * made of — is the header subtitle's job, on every screen size, so it is not
 * repeated here.
 */
export function renderIntroPanel(panel: Element, deps: PanelDeps): string {
  panel.innerHTML = `
    <h2>${INTRO_HEADING}</h2>
    <div class="meta">${deps.nodeCount} nodes · ${deps.edgeCount} edges</div>
    <p><b>Solid lines</b> are documented influence: a citation, an acknowledgment, correspondence, a shared lab or teacher. <b>Dashed lines</b> are resemblance, or priority without known transmission.</p>
    <p>Time runs downward, compressed before 1900. Within a crowded decade the year label is the authority, not the height on the page. Each lane heading says what “agent” means there.</p>`;

  return INTRO_HEADING;
}

function byYear(end: (edge: PedigreeEdge) => NodeId) {
  return (a: PedigreeEdge, b: PedigreeEdge) => nodeById(end(a)).year - nodeById(end(b)).year;
}

/**
 * The attribute a relation row carries its target in.
 *
 * The panel is rebuilt as markup on every focus change, so these rows cannot
 * hold their own listeners; whoever mounts the panel delegates from a container
 * and reads this attribute. Exported so the two sides cannot drift.
 */
export const RELATION_ATTR = 'data-relation';

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
      // A button, not a link: this navigates the chart, it does not leave the
      // page, and it has to be reachable by keyboard and large enough to tap.
      return `<li class="rel-row"><button type="button" class="rel" ${RELATION_ATTR}="${esc(
        other.id,
      )}"><span class="n">${esc(other.name)}</span><span class="y">${
        other.year
      }</span>${caveat}</button></li>`;
    })
    .join('');
}

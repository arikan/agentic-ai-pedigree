import './styles/app.css';

import { edges } from './data/edges';
import type { NodeId } from './data/nodes';
import { nodes } from './data/nodes';
import { PedigreeGraph } from './graph';
import { FocusController } from './interaction/focus';
import { SearchBox } from './interaction/search';
import { stickyHeader } from './interaction/sticky-header';
import { computeLayout, routeEdges } from './layout';
import { renderChart } from './render/chart';
import type { PanelDeps } from './render/panel';

/** Fail loudly at startup rather than half-rendering. */
function required<T extends Element>(selector: string, type: new () => T): T {
  const found = document.querySelector(selector);
  if (!(found instanceof type)) {
    throw new Error(`Expected ${selector} to be a ${type.name}`);
  }
  return found;
}

const chartbox = required('#chartbox', HTMLDivElement);
const panel = required('#panel', HTMLElement);
const header = required('header', HTMLElement);
const input = required('#search', HTMLInputElement);
const results = required('#results', HTMLUListElement);

const layout = computeLayout(nodes);
const routed = routeEdges(edges, layout.placedById, layout.placed);
const graph = new PedigreeGraph(edges);
const view = renderChart(chartbox, layout, routed);

const panelDeps: PanelDeps = {
  graph,
  nodeCount: nodes.length,
  edgeCount: edges.length,
  weakCount: edges.filter((edge) => edge.kind === 'weak').length,
};

const focus = new FocusController(view, graph, panel, panelDeps);
stickyHeader(header);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const search = new SearchBox({
  input,
  list: results,
  nodes,
  onSelect: (id: NodeId) => {
    focus.pin(id);
    view.nodeEls.get(id)?.scrollIntoView({
      block: 'center',
      inline: 'center',
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  },
});

// Escape is the global out: drop the pin and empty the search field.
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  focus.release();
  search.reset();
});

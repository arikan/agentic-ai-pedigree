import './styles/app.css';

import { edges } from './data/edges';
import type { NodeId } from './data/nodes';
import { nodes } from './data/nodes';
import { PedigreeGraph } from './graph';
import { backToTop } from './interaction/back-to-top';
import { FocusController } from './interaction/focus';
import { scrollCue } from './interaction/scroll-cue';
import { SearchBox } from './interaction/search';
import { PanelSheet } from './interaction/sheet';
import { stickyHeader } from './interaction/sticky-header';
import { ThemeController } from './interaction/theme';
import { computeLayout, routeEdges } from './layout';
import { renderChart } from './render/chart';
import type { PanelDeps } from './render/panel';
import { RELATION_ATTR } from './render/panel';

/** Fail loudly at startup rather than half-rendering. */
function required<T extends Element>(selector: string, type: new () => T): T {
  const found = document.querySelector(selector);
  if (!(found instanceof type)) {
    throw new Error(`Expected ${selector} to be a ${type.name}`);
  }
  return found;
}

const chartbox = required('#chartbox', HTMLDivElement);
const cue = required('#scroll-cue', HTMLDivElement);
const jumpTop = required('#jump-top', HTMLButtonElement);
const panel = required('#panel', HTMLElement);
const panelBody = required('#panel-body', HTMLDivElement);
const sheetHandle = required('#sheet-handle', HTMLButtonElement);
const sheetLabel = required('#sheet-label', HTMLSpanElement);
const header = required('header', HTMLElement);
const input = required('#search', HTMLInputElement);
const results = required('#results', HTMLUListElement);
const themeToggle = required('#theme-toggle', HTMLButtonElement);

new ThemeController(themeToggle);
const sheet = new PanelSheet(panel, sheetHandle, sheetLabel);

const layout = computeLayout(nodes);
const routed = routeEdges(edges, layout.placedById, layout.placed);
const graph = new PedigreeGraph(edges);
const view = renderChart(chartbox, layout, routed);

// After the chart exists, so the pane has a scrollWidth to measure.
scrollCue(cue, chartbox);
backToTop(jumpTop, chartbox);

const panelDeps: PanelDeps = {
  graph,
  nodeCount: nodes.length,
  edgeCount: edges.length,
};

const focus = new FocusController({
  view,
  graph,
  panel: panelBody,
  deps: panelDeps,
  // A hover only renames the collapsed bar; a pin is what opens the sheet.
  onFocus: (heading, pinned) => (pinned ? sheet.show(heading) : sheet.label(heading)),
  onClear: (heading) => sheet.reset(heading),
});

stickyHeader(header, chartbox);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Go to a node: pin it, bring it on screen, and put keyboard focus on it.
 *
 * Shared by the search box and the panel's relation rows, so arriving from
 * either behaves the same. `suppressTapThrough` is required for both, since
 * neither is a click on the chart itself.
 */
function selectNode(id: NodeId): void {
  focus.pin(id, { suppressTapThrough: true });

  const element = view.nodeEls.get(id);
  if (!element) return;

  // Focus first, without scrolling, then centre it deliberately.
  element.focus({ preventScroll: true });
  element.scrollIntoView({
    block: 'center',
    inline: 'center',
    behavior: reducedMotion ? 'auto' : 'smooth',
  });
}

// The panel is rebuilt on every focus change, so its rows are handled by
// delegation from the container that survives.
panelBody.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const row = target.closest(`[${RELATION_ATTR}]`);
  const id = row?.getAttribute(RELATION_ATTR);
  // Written from a NodeId by the panel renderer.
  if (id) selectNode(id as NodeId);
});

const search = new SearchBox({
  input,
  list: results,
  nodes,
  onSelect: selectNode,
});

// Escape is the global out: drop the pin and empty the search field.
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  focus.release();
  search.reset();
});

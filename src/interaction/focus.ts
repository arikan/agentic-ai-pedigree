import type { NodeId } from '../data/nodes';
import type { PedigreeGraph } from '../graph';
import type { ChartView } from '../render/chart';
import type { PanelDeps } from '../render/panel';
import { renderIntroPanel, renderNodePanel } from '../render/panel';

/**
 * Tracing a lineage.
 *
 * Highlighting is CSS state, not a re-render: `.focused` on the `<svg>` dims
 * everything, and `.on` / `.self` lift the nodes and edges on the traced path
 * back out. With 150 nodes and 213 edges that is a few hundred class toggles
 * and no layout work.
 *
 * Hover traces transiently. A click pins, which suppresses hover until the pin
 * is released by clicking the node again, clicking empty canvas, or Escape.
 */
/**
 * How long after a programmatic pin an incoming click is ignored.
 *
 * Touch browsers deliver a click to whatever sits under the finger once the
 * gesture ends. Picking a search result hides the result list and scrolls the
 * chart, so that click lands on the chart that has just moved into place — on
 * empty canvas it would release the pin, and on a node it would pin the wrong
 * one. Neither is what the pick asked for.
 */
const TAP_THROUGH_MS = 500;

export type PinOptions = {
  /** Set when the pin came from something other than a click on the chart. */
  readonly suppressTapThrough?: boolean;
};

export type FocusOptions = {
  readonly view: ChartView;
  readonly graph: PedigreeGraph;
  /** The element the panel markup is written into. */
  readonly panel: Element;
  readonly deps: PanelDeps;
  /**
   * A lineage is being traced. `pinned` distinguishes a deliberate selection
   * from a passing hover, which is what decides whether the mobile sheet opens.
   */
  readonly onFocus?: (heading: string, pinned: boolean) => void;
  /** Back to the resting state. */
  readonly onClear?: (heading: string) => void;
};

export class FocusController {
  private pinnedId: NodeId | null = null;
  /** Set by a programmatic pin; see `PinOptions.suppressTapThrough`. */
  private ignoreClicksUntil = 0;
  private readonly view: ChartView;
  private readonly graph: PedigreeGraph;
  private readonly panel: Element;
  private readonly panelDeps: PanelDeps;

  constructor(private readonly options: FocusOptions) {
    this.view = options.view;
    this.graph = options.graph;
    this.panel = options.panel;
    this.panelDeps = options.deps;
    this.attach();
    this.clear();
  }

  get pinned(): NodeId | null {
    return this.pinnedId;
  }

  /** Trace `id`'s ancestors and descendants. */
  focus(id: NodeId): void {
    const ancestors = this.graph.ancestors(id);
    const descendants = this.graph.descendants(id);

    this.view.svg.classList.add('focused');

    for (const [nodeId, element] of this.view.nodeEls) {
      const on = ancestors.nodes.has(nodeId) || descendants.nodes.has(nodeId);
      element.classList.toggle('on', on);
      element.classList.toggle('self', nodeId === id);
    }

    for (const [index, element] of this.view.edgeEls.entries()) {
      const on = ancestors.edges.has(index) || descendants.edges.has(index);
      element.classList.toggle('on', on);
      this.view.labelEls.get(index)?.classList.toggle('on', on);
    }

    const pinned = this.pinnedId === id;
    const heading = renderNodePanel(this.panel, id, this.panelDeps, pinned);
    this.options.onFocus?.(heading, pinned);
  }

  /** Drop the highlight and go back to the intro panel. */
  clear(): void {
    this.view.svg.classList.remove('focused');
    for (const element of this.view.nodeEls.values()) {
      element.classList.remove('on', 'self');
    }
    for (const [index, element] of this.view.edgeEls.entries()) {
      element.classList.remove('on');
      this.view.labelEls.get(index)?.classList.remove('on');
    }
    const heading = renderIntroPanel(this.panel, this.panelDeps);
    this.options.onClear?.(heading);
  }

  /** Pin `id`, so hovering elsewhere no longer changes the trace. */
  pin(id: NodeId, options: PinOptions = {}): void {
    this.pinnedId = id;
    if (options.suppressTapThrough) {
      this.ignoreClicksUntil = performance.now() + TAP_THROUGH_MS;
    }
    this.focus(id);
  }

  /** Release any pin and clear. */
  release(): void {
    this.pinnedId = null;
    this.clear();
  }

  /** True while a stray click from a finished touch gesture may still arrive. */
  private tapThrough(): boolean {
    return performance.now() < this.ignoreClicksUntil;
  }

  private attach(): void {
    const { nodeLayer, svg } = this.view;

    // On a touch screen a tap would fire pointerover and then click, tracing
    // twice and leaving the trace behind on the way out. Bind hover only where
    // a pointer can actually hover.
    if (window.matchMedia('(hover: hover)').matches) {
      nodeLayer.addEventListener('pointerover', (event) => {
        const id = nodeIdFrom(event);
        if (id && !this.pinnedId) this.focus(id);
      });

      nodeLayer.addEventListener('pointerout', (event) => {
        if (nodeIdFrom(event) && !this.pinnedId) this.clear();
      });
    }

    nodeLayer.addEventListener('click', (event) => {
      if (this.tapThrough()) return;
      const id = nodeIdFrom(event);
      if (!id) return;
      if (this.pinnedId === id) this.release();
      else this.pin(id);
    });

    // Keyboard equivalent of the click, for tab-through.
    nodeLayer.addEventListener('keydown', (event) => {
      const target = groupFrom(event);
      if (!target) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
    });

    nodeLayer.addEventListener('focusin', (event) => {
      const id = nodeIdFrom(event);
      if (id && !this.pinnedId) this.focus(id);
    });

    // A click on empty canvas releases — unless it is the tap-through click
    // from a pin made somewhere else entirely.
    svg.addEventListener('click', (event) => {
      if (groupFrom(event) || !this.pinnedId) return;
      if (this.tapThrough()) return;
      this.release();
    });
  }
}

function groupFrom(event: Event): SVGGElement | null {
  const target = event.target;
  if (!(target instanceof Element)) return null;
  const group = target.closest('.node');
  return group instanceof SVGGElement ? group : null;
}

function nodeIdFrom(event: Event): NodeId | null {
  const id = groupFrom(event)?.dataset.id;
  // `data-id` is written from a NodeId at render time.
  return (id as NodeId | undefined) ?? null;
}

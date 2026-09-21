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
export class FocusController {
  private pinnedId: NodeId | null = null;

  constructor(
    private readonly view: ChartView,
    private readonly graph: PedigreeGraph,
    private readonly panel: Element,
    private readonly panelDeps: PanelDeps,
  ) {
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

    renderNodePanel(this.panel, id, this.panelDeps, this.pinnedId === id);
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
    renderIntroPanel(this.panel, this.panelDeps);
  }

  /** Pin `id`, so hovering elsewhere no longer changes the trace. */
  pin(id: NodeId): void {
    this.pinnedId = id;
    this.focus(id);
  }

  /** Release any pin and clear. */
  release(): void {
    this.pinnedId = null;
    this.clear();
  }

  private attach(): void {
    const { nodeLayer, svg } = this.view;

    nodeLayer.addEventListener('pointerover', (event) => {
      const id = nodeIdFrom(event);
      if (id && !this.pinnedId) this.focus(id);
    });

    nodeLayer.addEventListener('pointerout', (event) => {
      if (nodeIdFrom(event) && !this.pinnedId) this.clear();
    });

    nodeLayer.addEventListener('click', (event) => {
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

    // A click on empty canvas releases.
    svg.addEventListener('click', (event) => {
      if (!groupFrom(event) && this.pinnedId) this.release();
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

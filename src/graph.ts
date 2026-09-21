import type { PedigreeEdge } from './data/edges';
import type { NodeId } from './data/nodes';

export type Lineage = {
  /** Every node reached, including the starting one. */
  readonly nodes: ReadonlySet<NodeId>;
  /** Indices into the edge list, so callers can find the drawn paths. */
  readonly edges: ReadonlySet<number>;
};

/** Which end of an edge a walk moves toward. */
type Direction = 'ancestors' | 'descendants';

/**
 * Adjacency over the edge list, plus transitive-closure walks.
 *
 * Edges are referred to by index throughout: the data, the routed geometry and
 * the rendered paths all share one ordering, which is what lets a focus pass be
 * a matter of toggling classes instead of re-deriving anything.
 */
export class PedigreeGraph {
  private readonly incoming = new Map<NodeId, number[]>();
  private readonly outgoing = new Map<NodeId, number[]>();

  constructor(private readonly edges: readonly PedigreeEdge[]) {
    for (const [index, edge] of edges.entries()) {
      append(this.incoming, edge.to, index);
      append(this.outgoing, edge.from, index);
    }
  }

  /** Edges arriving at `id`, in data order. */
  edgesInto(id: NodeId): readonly PedigreeEdge[] {
    return this.resolve(this.incoming.get(id));
  }

  /** Edges leaving `id`, in data order. */
  edgesOutOf(id: NodeId): readonly PedigreeEdge[] {
    return this.resolve(this.outgoing.get(id));
  }

  /** Everything `id` descends from, transitively. */
  ancestors(id: NodeId): Lineage {
    return this.walk(id, 'ancestors');
  }

  /** Everything that descends from `id`, transitively. */
  descendants(id: NodeId): Lineage {
    return this.walk(id, 'descendants');
  }

  /** Depth-first. The visited set makes it safe on a cycle. */
  private walk(start: NodeId, direction: Direction): Lineage {
    const adjacency = direction === 'ancestors' ? this.incoming : this.outgoing;
    const nodes = new Set<NodeId>([start]);
    const edges = new Set<number>();
    const stack: NodeId[] = [start];

    for (let current = stack.pop(); current !== undefined; current = stack.pop()) {
      for (const index of adjacency.get(current) ?? []) {
        const edge = this.edges[index];
        if (!edge) continue;

        edges.add(index);
        const next = direction === 'ancestors' ? edge.from : edge.to;
        if (!nodes.has(next)) {
          nodes.add(next);
          stack.push(next);
        }
      }
    }

    return { nodes, edges };
  }

  private resolve(indices: readonly number[] | undefined): readonly PedigreeEdge[] {
    if (!indices) return [];
    return indices.flatMap((index) => {
      const edge = this.edges[index];
      return edge ? [edge] : [];
    });
  }
}

function append(map: Map<NodeId, number[]>, key: NodeId, value: number): void {
  const existing = map.get(key);
  if (existing) existing.push(value);
  else map.set(key, [value]);
}

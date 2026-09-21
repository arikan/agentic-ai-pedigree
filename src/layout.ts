import type { PedigreeEdge } from './data/edges';
import { LANES, LANE_OF } from './data/lanes';
import type { LaneId } from './data/lanes';
import type { NodeId, PedigreeNode } from './data/nodes';

/** Chart metrics, in user units (1 unit = 1px at scale 1). */
export const AXIS_W = 64;
export const TOP = 190;
export const NODE_W = 176;
export const NODE_H = 44;
/** Height added per extra `work` line. */
export const LINE = 12;
/** Minimum vertical gap between two boxes in the same slot. */
export const GAP = 10;
export const PAD = 14;

/**
 * The time axis is piecewise-linear: `[startYear, endYear, pixels]`.
 *
 * Deep history is compressed and the last few years are stretched, so that a
 * millennium of precursors and five years of agent products can share one page.
 * Editing this rescales the whole chart.
 */
const SEG: readonly (readonly [from: number, to: number, px: number])[] = [
  [780, 1700, 190],
  [1700, 1900, 260],
  [1900, 1950, 330],
  [1950, 1980, 420],
  [1980, 2000, 560],
  [2000, 2020, 420],
  [2020, 2027, 760],
];

/** Years that get a gridline and a label. */
export const TICKS: readonly number[] = [
  800, 1000, 1200, 1400, 1600, 1700, 1800, 1850, 1900, 1925, 1950, 1975, 1990, 2000, 2010, 2020,
  2025,
];

/** Vertical position of a year, walking the piecewise scale. */
export function yOf(year: number): number {
  let y = TOP + 30;
  for (const [from, to, px] of SEG) {
    if (year <= from) return y;
    if (year >= to) {
      y += px;
      continue;
    }
    return y + ((year - from) / (to - from)) * px;
  }
  return y;
}

export type LaneBox = {
  readonly id: LaneId;
  readonly title: string;
  readonly def: string;
  /** One column per member tradition. */
  readonly cols: number;
  readonly x: number;
  readonly w: number;
};

export type PlacedNode = PedigreeNode & {
  readonly x: number;
  readonly y: number;
  readonly h: number;
};

export type ChartLayout = {
  readonly width: number;
  readonly height: number;
  readonly lanes: readonly LaneBox[];
  readonly placed: readonly PlacedNode[];
  readonly placedById: ReadonlyMap<NodeId, PlacedNode>;
};

/**
 * Place every node: lane by tradition, column slot by tradition, vertical
 * position by year.
 *
 * A node wants to sit centred on its own year. When that overlaps whatever is
 * already in its slot it takes another free slot in the same lane, and failing
 * that it is pushed down. So position within a crowded decade is approximate —
 * the node's own year label is the authority, not its height on the page.
 */
export function computeLayout(nodes: readonly PedigreeNode[]): ChartLayout {
  let x = AXIS_W;
  const lanes: LaneBox[] = LANES.map((lane) => {
    const cols = lane.members.length;
    const box: LaneBox = {
      id: lane.id,
      title: lane.title,
      def: lane.def,
      cols,
      x,
      w: cols * NODE_W + (cols + 1) * PAD,
    };
    x += box.w;
    return box;
  });

  const placed: PlacedNode[] = [];

  for (const [index, lane] of LANES.entries()) {
    const box = lanes[index];
    if (!box) continue;

    const members: readonly string[] = lane.members;
    const inLane = nodes
      .filter((node) => LANE_OF[node.tradition] === lane.id)
      .sort((a, b) => a.year - b.year || a.tradition.localeCompare(b.tradition));

    // Lowest occupied edge of each slot; the sentinel keeps the first node free.
    const bottoms: number[] = members.map(() => -1e9);

    for (const node of inLane) {
      const h = NODE_H + LINE * (node.work.length - 1);
      const want = yOf(node.year) - h / 2;

      let slot = members.indexOf(node.tradition);
      if (box.cols > 1 && want < (bottoms[slot] ?? -1e9) + GAP) {
        const free = bottoms.findIndex((bottom) => want >= bottom + GAP);
        slot = free >= 0 ? free : bottoms.indexOf(Math.min(...bottoms));
      }

      const floor = (bottoms[slot] ?? -1e9) + GAP;
      const y = Math.max(want, floor);
      bottoms[slot] = y + h;

      placed.push({ ...node, h, y, x: box.x + PAD + slot * (NODE_W + PAD) });
    }
  }

  const minHeight = yOf(2027) + 40;
  return {
    width: AXIS_W + lanes.reduce((total, lane) => total + lane.w, 0) + 16,
    height: Math.max(minHeight, ...placed.map((node) => node.y + node.h)) + 40,
    lanes,
    placed,
    placedById: new Map(placed.map((node) => [node.id, node])),
  };
}

export type RoutedEdge = PedigreeEdge & {
  /** SVG path data from the bottom of `from` to the top of `to`. */
  readonly d: string;
  /** Midpoint for a `weak` edge's caveat label. */
  readonly labelX: number;
  readonly labelY: number;
};

/**
 * Turn each edge into a path.
 *
 * Within a column a straight line will do, unless it would run through an
 * intervening box — then it bows out, alternating sides by index so that
 * parallel skips stay distinguishable. Across columns it is a vertical-tangent
 * cubic, which reads as descent rather than as a wire.
 */
export function routeEdges(
  edges: readonly PedigreeEdge[],
  placedById: ReadonlyMap<NodeId, PlacedNode>,
  placed: readonly PlacedNode[],
): readonly RoutedEdge[] {
  return edges.flatMap((edge, index) => {
    const a = placedById.get(edge.from);
    const b = placedById.get(edge.to);
    if (!a || !b) return [];

    const x1 = a.x + NODE_W / 2;
    const y1 = a.y + a.h;
    const x2 = b.x + NODE_W / 2;
    const y2 = b.y;

    let d: string;
    if (a.x === b.x) {
      const skipped = placed.some(
        (m) => m.x === a.x && m.id !== a.id && m.id !== b.id && m.y > y1 && m.y < y2,
      );
      if (skipped) {
        const side = (index % 2 ? 1 : -1) * (NODE_W / 2 + 6);
        const t = (y2 - y1) / 3;
        d = `M${x1},${y1} C${x1 + side},${y1 + t} ${x2 + side},${y2 - t} ${x2},${y2}`;
      } else {
        d = `M${x1},${y1} L${x2},${y2}`;
      }
    } else {
      const dy = Math.max(30, (y2 - y1) * 0.5);
      d = `M${x1},${y1} C${x1},${y1 + dy} ${x2},${y2 - dy} ${x2},${y2}`;
    }

    return [{ ...edge, d, labelX: (x1 + x2) / 2 + 4, labelY: (y1 + y2) / 2 + 3 }];
  });
}

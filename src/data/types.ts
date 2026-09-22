/**
 * The chart's vocabulary.
 *
 * A *tradition* is an intellectual line (logic, cybernetics, …). A *lane* is a
 * rendered column. They are not the same: `physics` shares the cybernetics lane
 * and `popstat`/`textstat` share the statistics lane, so eight traditions are
 * drawn in six lanes. See `lanes.ts`.
 */
export type TraditionId =
  | 'logic'
  | 'control'
  | 'physics'
  | 'popstat'
  | 'textstat'
  | 'neural'
  | 'decision'
  | 'game';

/**
 * `doc` is a documented transfer, drawn solid. `weak` is a resemblance, or
 * priority without known transmission, drawn dashed and carrying its caveat.
 */
export type EdgeKind = 'doc' | 'weak';

export type Lane = {
  /** Stable id, also the key into `ICONS`. */
  readonly id: string;
  /** Heading. Plain text; the renderer wraps it only if the lane is too narrow. */
  readonly title: string;
  /** What "agent" means in this lane, one definition per member; `'; '` between. */
  readonly def: string;
  /** Traditions sharing this column, one slot each, left to right. */
  readonly members: readonly TraditionId[];
};

/** Authoring shape of a node in `NODE_TUPLES`. */
export type NodeTuple = readonly [
  id: string,
  tradition: TraditionId,
  year: number,
  name: string,
  work: readonly string[],
  note: string,
];

/** Further reading, as `[linkText, url]`. */
export type Reference = readonly [text: string, url: string];

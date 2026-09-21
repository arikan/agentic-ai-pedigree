import type { Lane, TraditionId } from './types';

/**
 * The six rendered columns, left to right.
 *
 * `members` lists the tradition ids that share the column: each member gets one
 * slot inside the lane, so a lane's width is a function of how many it holds.
 * Two lanes are shared — `physics` rides with `control`, `popstat` with
 * `textstat` — which is why there are eight traditions but six lanes.
 *
 * `title` splits on `|` into heading lines; `def` splits on `'; '`.
 */
export const LANES = [
  { id: 'logic', title: 'Logic &|Computation', def: 'a calculating reasoner', members: ['logic'] },
  {
    id: 'control',
    title: 'Cybernetics &|Thermodynamics',
    def: 'a loop holding a goal; a measuring demon',
    members: ['control', 'physics'],
  },
  {
    id: 'stats',
    title: 'Statistics &|Information Theory',
    def: 'a draw from a distribution; a next-symbol predictor',
    members: ['popstat', 'textstat'],
  },
  {
    id: 'neural',
    title: 'Neural Networks &|Large Language Models',
    def: 'a trained function; a next-token predictor',
    members: ['neural'],
  },
  {
    id: 'decision',
    title: 'Decision Theory|& RL',
    def: 'a reward optimizer',
    members: ['decision'],
  },
  {
    id: 'game',
    title: 'Game Theory &|Complexity',
    def: 'a rule in a population',
    members: ['game'],
  },
] as const satisfies readonly Lane[];

export type LaneId = (typeof LANES)[number]['id'];

/** tradition id -> the lane that renders it. */
export const LANE_OF = Object.fromEntries(
  LANES.flatMap((lane) => lane.members.map((member) => [member, lane.id])),
) as Record<TraditionId, LaneId>; // fromEntries widens keys to string; every tradition is covered by construction.

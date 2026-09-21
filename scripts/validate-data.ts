/**
 * Data invariants the type checker cannot reach.
 *
 * `NodeId` already makes an unknown edge endpoint or an orphan reference a
 * compile error. What is left is the kind of mistake that type-checks fine and
 * still makes a wrong chart: two nodes sharing an id, an edge pointing back in
 * time, a tradition no lane renders. Run by `bun run validate`, and in `build`.
 */
import { EDGE_TUPLES } from '../src/data/edges';
import { LANES, LANE_OF } from '../src/data/lanes';
import { NODE_TUPLES } from '../src/data/nodes';
import { REFS } from '../src/data/refs';

const problems: string[] = [];
const fail = (message: string): void => {
  problems.push(message);
};

/**
 * Edges that legitimately point at an earlier year.
 *
 * A node is dated by its first work, but its note may name a later one, and an
 * edge can land on that. Listed explicitly so a *new* backwards edge still
 * fails — these are judgements about the content, not a blanket exemption.
 */
const BACKWARDS_BY_DESIGN = new Map<string, string>([
  [
    'ratio->ashby',
    'Ashby is dated to the 1948 homeostat; the Ratio Club fed requisite variety (1956), named in the same node.',
  ],
  [
    'bak->langton',
    'Langton is dated to the 1986 ALife workshop; self-organized criticality fed the edge of chaos (~1990), named in the same node.',
  ],
]);

/** Accepted oddities, printed so they stay visible. */
const notes: string[] = [];

// One node per id.
const seen = new Set<string>();
for (const [id] of NODE_TUPLES) {
  if (seen.has(id)) fail(`duplicate node id "${id}"`);
  seen.add(id);
}

// Every tradition used by a node is rendered by some lane.
const rendered = new Set(LANES.flatMap((lane) => lane.members));
for (const [id, tradition] of NODE_TUPLES) {
  if (!rendered.has(tradition)) {
    fail(`node "${id}" has tradition "${tradition}", which no lane renders`);
  }
  if (!LANE_OF[tradition]) fail(`tradition "${tradition}" has no lane`);
}

// Years must be plottable on the piecewise scale.
for (const [id, , year] of NODE_TUPLES) {
  if (!Number.isInteger(year) || year < 780 || year > 2027) {
    fail(`node "${id}" has year ${year}, outside the 780–2027 axis`);
  }
}

// Descent runs downward: an edge may not point at an earlier node.
const yearOf = new Map(NODE_TUPLES.map(([id, , year]) => [id, year]));
const edgeKeys = new Set<string>();
for (const [from, to, kind, label] of EDGE_TUPLES) {
  const fromYear = yearOf.get(from);
  const toYear = yearOf.get(to);

  if (from === to) fail(`edge "${from}" → "${to}" is a self-loop`);

  const key = `${from}->${to}`;
  if (edgeKeys.has(key)) fail(`duplicate edge ${key}`);
  edgeKeys.add(key);

  if (fromYear !== undefined && toYear !== undefined && fromYear > toYear) {
    const allowed = BACKWARDS_BY_DESIGN.get(key);
    if (allowed) notes.push(`${key} (${fromYear} → ${toYear}): ${allowed}`);
    else fail(`edge ${key} runs backwards in time (${fromYear} → ${toYear})`);
  }

  // A weak edge without its caveat would render as an unexplained dashed line.
  if (kind === 'weak' && !label) fail(`weak edge ${key} has no caveat label`);
  if (kind === 'doc' && label) fail(`documented edge ${key} carries a label`);
}

// References must be usable links.
for (const [id, list] of Object.entries(REFS)) {
  for (const [text, url] of list ?? []) {
    if (!text.trim()) fail(`reference for "${id}" has empty link text`);
    if (!/^https?:\/\//.test(url)) fail(`reference for "${id}" is not an http(s) url: ${url}`);
  }
}

const counts = `${NODE_TUPLES.length} nodes, ${EDGE_TUPLES.length} edges, ${
  Object.keys(REFS).length
} referenced nodes`;

for (const [key] of BACKWARDS_BY_DESIGN) {
  if (!edgeKeys.has(key)) fail(`BACKWARDS_BY_DESIGN lists ${key}, which is no longer an edge`);
}

if (problems.length > 0) {
  console.error(`✗ ${problems.length} problem(s) in the pedigree data:\n`);
  for (const problem of problems) console.error(`  · ${problem}`);
  process.exit(1);
}

console.log(`✓ ${counts}; all invariants hold`);
for (const note of notes) console.log(`  · backwards by design: ${note}`);

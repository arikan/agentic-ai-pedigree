# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An interactive pedigree chart of agentic-AI intellectual traditions — 150 nodes, 213 edges, six lanes — as a static Vite + TypeScript app with no framework and no runtime dependencies. Course material for *AI Agent & Platform Design*, Week 4. It began as a single 754-line `index.html`; that file is now an app shell and everything else lives in `src/`.

Package manager is **bun**.

## Commands

```sh
bun install
bun run dev         # dev server, opens a browser
bun run build       # validate + typecheck + vite build -> dist/
bun run check       # validate + typecheck + lint, as CI runs it
bun run validate    # data invariants only (fast)
bun run format      # apply Biome fixes
```

There is no test runner. `bun run validate` is the data safety net; `tsc` is the code one.

## Architecture

One-way data flow, and the chart is drawn exactly once:

```
data/ -> layout.ts -> render/ -> interaction/
         graph.ts  ------------^
```

- **`src/data/`** — the content. `nodes.ts`, `edges.ts`, `refs.ts` and `lanes.ts`, plus `types.ts` for the vocabulary.
- **`src/layout.ts`** — the time scale, lane and slot placement, and edge routing. Pure geometry; no DOM.
- **`src/graph.ts`** — `PedigreeGraph`: adjacency plus the ancestor/descendant walks behind a trace.
- **`src/render/`** — `svg.ts` (the `el()` namespace helper), `chart.ts` (one pass, builds everything), `icons.ts`, `panel.ts`.
- **`src/interaction/`** — `focus.ts` (`FocusController`), `search.ts` (`SearchBox`), `theme.ts` (`ThemeController`), `sheet.ts` (`PanelSheet`), `sticky-header.ts`.
- **`src/main.ts`** — resolves the DOM, wires the above, owns the global Escape handler.

**Focus is CSS state, not a re-render.** `FocusController` puts `.focused` on the `<svg>` to dim everything, then `.on`/`.self` on the traced nodes and edges to lift them back out. Nothing is rebuilt, and no layout is recomputed. Keep it that way — re-rendering 150 nodes on hover is what this design avoids.

**Edges are identified by index.** The data order, the routed geometry, and the rendered `<path>` elements all share one ordering, and `PedigreeGraph` returns edge *indices* from its walks. Anything that reorders edges must reorder all three together.

### Two layout modes

`@media (max-width: 899px)` is not a set of tweaks — it is a different shell.
Wide screens scroll the page and put the panel in a sticky column. Narrow
screens stop the page scrolling (`html, body { overflow: hidden }`), make
`.chartbox` a pane that scrolls in both axes, and turn the panel into a fixed
bottom sheet that `PanelSheet` collapses to a `--sheet-peek` bar.

Two traps live here:

- The narrow `.layout` **must** set `align-items: stretch`. The base rule says
  `align-items: start`, which in a row flex container leaves the chart pane as
  tall as its 3275px content — and with the page no longer scrolling, the bottom
  of the chart becomes unreachable.
- `--wrap-max` and `--panel-w` are raised at 1800px and 2200px so wide screens
  spend width on the chart. `.layout` reads `var(--panel-w)`; don't hardcode it
  back.

### Touch and the tap-through click

Hover tracing is bound only when `(hover: hover)` matches, so on a touch device
a tap pins instead of tracing on the way past.

`FocusController.pin()` takes `{ suppressTapThrough: true }`, which the search
box passes. Touch browsers deliver a click to whatever is under the finger when
the gesture ends; picking a result hides the result list *and* scrolls the chart,
so that click would land on the chart that just moved into place — releasing the
pin on empty canvas, or pinning the wrong node. The guard ignores both node and
canvas clicks for `TAP_THROUGH_MS`. If you add another programmatic pin, pass
the same option.

### Theme

Two states, `light` and `dark`, on one button pinned to the header's top-right
corner (absolute, so it survives all three header arrangements without joining
their flex rows). Stored under `pedigree-theme`.

The system preference is only a seed for the first visit — there is no "follow
the system" state, so `data-theme` is always set once the page has loaded. The
`prefers-color-scheme` block in `tokens.css` still matters as the no-JS and
storage-unavailable fallback. Storage access is wrapped in try/catch because it
throws in private mode, and the inline script in `index.html` repeats the read
on purpose to beat first paint; keep its storage key in step with `theme.ts`.

### Navigating from the card

The relation rows under "Draws on" and "Feeds" are `<button>`s carrying
`data-relation="<node id>"` (`RELATION_ATTR`, exported from `panel.ts` so both
sides cannot drift). The panel is rebuilt as markup on every focus change, so
they cannot own listeners — `main.ts` delegates from `#panel-body`.

All navigation goes through `selectNode()` in `main.ts`: pin, focus the node
element with `preventScroll`, then centre it deliberately. Search and the
relation rows share it, so arriving from either behaves identically. Both are
programmatic pins and must pass `{ suppressTapThrough: true }`.

### Traditions vs. lanes

Eight *traditions* render into six *lanes*: `physics` shares the cybernetics lane with `control`, and `popstat` shares the statistics lane with `textstat`. A node's second tuple field is its tradition, which picks both the lane (via `LANE_OF`) and the column slot inside it.

`TRADITION_NAME` in `render/panel.ts` is a separate map with all eight entries, feeding the panel subtitle — distinct from the six lane headings in `LANES`.

The `// logic`, `// control` … comments in `nodes.ts` and `edges.ts` are the original authoring groups and have drifted from the data (`mcculloch` sits under `// control` but is tradition `neural`). The tuple field is authoritative.

### Layout specifics

- The time axis is **piecewise-linear**: `SEG` maps year spans to pixel budgets, so 780–1700 gets 190px and 2020–2027 gets 760px. Editing it rescales the chart.
- Lane width is derived from member count, so adding a tradition to a lane's `members` widens the chart by a column.
- Within a lane each tradition owns a column. A node wants to sit centred on its year; if that overlaps its slot's previous occupant it takes another free slot in the same lane, and failing that is pushed down. **Vertical position within a crowded decade is therefore approximate** — the year label is the authority, not the height on the page.
- Same-column edges that would pass through an intervening box bow out, alternating side by edge index.

## Editing the data

Types catch what used to fail silently: `NodeId` is a literal union derived from `NODE_TUPLES`, so an edge or reference pointing at a node that does not exist is a **compile error**, and a mistyped tradition is too.

`scripts/validate-data.ts` covers what types cannot: duplicate ids, self-loops, duplicate edges, years off the axis, `weak` edges missing their caveat (and `doc` edges carrying one), non-http references, and edges that run backwards in time.

Two edges legitimately run backwards, because a node is dated by its *first* work while an edge may land on a later one named in the same note. They are listed by name in `BACKWARDS_BY_DESIGN` with a reason, so a *new* backwards edge still fails the build. If you retire one of those edges, remove its entry — the validator checks the list for staleness.

Prose style in `note` is terse and specific: one to three sentences, usually naming a citation, a date, or the objection to the claim. A `weak` edge's label always says *why* the link is weak.

## Conventions

- **`src/data/nodes.ts`, `edges.ts` and `refs.ts` are excluded from the formatter** (see `overrides` in `biome.json`). They are content, one record per line; letting Biome reflow them would explode the diff and destroy scannability. Everything else is formatted.
- Files use typographic punctuation (curly apostrophes, en dashes) inline. Don't convert to ASCII, and don't let shell heredocs mangle `\u` escapes back into literal combining characters.
- Colour tokens live in `src/styles/tokens.css` in **three blocks that must stay in sync**: `:root`, the `prefers-color-scheme: dark` block guarded by `:root:not([data-theme="light"])`, and `:root[data-theme="dark"]`.
- Lane pictograms in `render/icons.ts` are 32×32 inline SVG keyed by **lane** id; inside them `.f` fills with ink, `.a` strokes with the accent, `.af` fills with it. The `*_unused` entries are leftovers from an earlier eight-lane layout.
- Panel markup is built from template strings, so every interpolated value goes through `esc()`.
- `vite.config.ts` reads `BASE_PATH` so the Pages build can be served from `/<repo>/`.

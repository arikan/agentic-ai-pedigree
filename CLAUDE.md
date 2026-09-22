# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An interactive pedigree chart of agentic-AI intellectual traditions — 150 nodes, 213 edges, six lanes — as a static Vite + TypeScript app with no framework and no runtime dependencies. Course material for *AI Agent & Platform Design*, Week 4. It began as a single 754-line `index.html`; that file is now an app shell and everything else lives in `src/`.

Package manager is **bun**.

**Everything stays inside this folder.** No scratch files, logs, screenshots or
helper scripts outside the project directory — not in `/tmp`, not anywhere else.
Throwaway artefacts go in `dist/`, which is gitignored, and are deleted when the
task is done.

## Commands

```sh
bun install
bun run dev         # dev server on :5173, opens a browser
bun run build       # validate + typecheck + vite build -> dist/
bun run preview     # serve the built dist/
bun run check       # validate + typecheck + lint, as CI runs it
bun run validate    # data invariants only (fast)
bun run typecheck   # tsc --noEmit
bun run lint        # biome check . (lint *and* format check)
bun run format      # apply Biome fixes
```

There is no test runner. `bun run validate` is the data safety net; `tsc` is the code one.
Before calling a change done, run `bun run check` — CI runs the same three steps in
that order, cheapest signal first.

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
- **`src/interaction/`** — `focus.ts` (`FocusController`), `search.ts` (`SearchBox`), `theme.ts` (`ThemeController`), `sheet.ts` (`PanelSheet`), `sticky-header.ts`, `scroll-cue.ts`, `back-to-top.ts`.
- **`src/main.ts`** — resolves the DOM, wires the above, owns the global Escape handler.

**Focus is CSS state, not a re-render.** `FocusController` puts `.focused` on the `<svg>` to dim everything, then `.on`/`.self` on the traced nodes and edges to lift them back out. Nothing is rebuilt, and no layout is recomputed. Keep it that way — re-rendering 150 nodes on hover is what this design avoids.

**Edges are identified by index.** The data order, the routed geometry, and the rendered `<path>` elements all share one ordering, and `PedigreeGraph` returns edge *indices* from its walks. Anything that reorders edges must reorder all three together.

### Two layout modes

`@media (max-width: 899px)` is not a set of tweaks — it is a different shell.
Wide screens scroll the page and put the panel in a sticky column. Narrow
screens stop the page scrolling (`html, body { overflow: hidden }`), make
`.chartbox` a pane that scrolls in both axes, and turn the panel into a fixed
bottom sheet that `PanelSheet` collapses to a `--sheet-peek` bar.

`.chartbox` is wrapped in `.chartpane`, which exists only to be a positioning
context for the scroll cue — the cue cannot live inside the element that
scrolls. On narrow screens **`.chartpane` is the flex child** that stretches,
and `.chartbox` fills it; the flex rules belong to the wrapper now.

Two traps live here:

- The narrow `.layout` **must** set `align-items: stretch`. The base rule says
  `align-items: start`, which in a row flex container leaves the chart pane as
  tall as its 3275px content — and with the page no longer scrolling, the bottom
  of the chart becomes unreachable.
- `--wrap-max` and `--panel-w` are raised at 1800px and 2200px so wide screens
  spend width on the chart. `.layout` reads `var(--panel-w)`; don't hardcode it
  back.

### The scroll cue

The chart is wider than its pane below 2200px, and `.chartbox`'s horizontal
scrollbar sits at the bottom of a box as tall as the chart — 3275px down, out of
sight. So `scroll-cue.ts` draws the affordance: a right-edge fade plus a pill
reading *Scroll* or, under `(hover: none)`, *Swipe*. It is shown only while
`scrollWidth - clientWidth - scrollLeft` is still positive, stops nudging once
the reader scrolls (`.moved`), and is `pointer-events: none` — an overlay that
swallowed a click on a node would cost more than it explains.

The pill is `position: sticky; bottom: 16px` **and its flow position has to be
the bottom of the strip** (hence `justify-content: flex-end`). A bottom sticky
offset only ever pulls a box *up* into view; it never pushes one down, so a pill
anchored at the top of the strip would simply scroll away with the page. On
narrow screens nothing scrolls the page at all, so there is no scrollport for
sticky to work against and the pill is positioned absolutely instead.

Its counterpart is `back-to-top.ts`: the narrow layout hands 3275px of vertical
scroll to the pane, so past 240px a button appears in the pane's bottom-left
corner — mirroring the cue on the right — and returns to the top in one tap.
Both of them, and anything else overlaid on the chart, must be children of
**`.chartpane`**: it is the only positioning context around the pane, and a
control placed in `.layout` instead anchors to the viewport and lands under the
bottom sheet. Unlike the cue this one is a real control, so `update()` sets
`inert` as well as the class — a button faded out of sight must not still be
reachable by tab.

Both read `window.scrollY + pane.scrollTop`, the same pair as `stickyHeader`:
whichever element is not scrolling in the current layout contributes zero, so
neither has to ask which mode is in force.

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

Swapping theme repaints every colour at once, so `ThemeController` puts
`theme-anim` on `:root` for the length of the swap and takes it off again. That
class carries a blanket colour transition (`background-color`, `color`,
`border-color`, `fill`, `stroke`, `box-shadow`, `opacity`) at `(0,2,0)`
specificity, which beats the 0.12–0.15s hover rules without `!important` and
loses to the reduced-motion block. Keep it temporary: left on, it would slow
every hover and focus across 150 nodes. The `theme-color` meta is read from the
`--ground` token rather than the computed background, because a custom property
is not animated and so already holds the new colour while the page is still
easing towards it.

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

### Keyboard, and who owns which key

Spread across three files, so it is easy to break by halves:

- Every node `<g>` is `tabindex=0`. `FocusController` traces on `focusin`, and
  handles Enter/Space itself rather than synthesising a click — a synthetic
  click would then have to be told apart from a real one by the tap-through
  guard.
- `SearchBox` binds `/` and ⌘K/Ctrl-K on `document` to focus the field, and
  arrows/Enter on the field itself. The `/` binding is skipped while the user is
  typing in any input.
- Escape is **global and lives in `main.ts`**: release the pin *and* clear the
  search field. `SearchBox` separately handles Escape on its own field to close
  the menu without clearing.

### The panel heading is the sheet's label

`renderNodePanel` and `renderIntroPanel` return the heading string they wrote.
`FocusController` passes it to `onFocus(heading, pinned)` / `onClear(heading)`,
and `main.ts` maps those onto `PanelSheet`: a hover only **renames** the
collapsed bar, a pin **opens** the sheet. That `pinned` flag is the whole reason
a mouse-over on a wide screen does not fight the bottom sheet on a narrow one.

`stickyHeader` has a similar one-value contract in the other direction: it
writes the collapsed header height to `--hdr` on `:root`, and the sticky panel's
`top` in `app.css` reads it. Neither side guesses an offset. The collapse is
animated (padding and title size both ease), so the height is published from a
**ResizeObserver** rather than measured when the class flips — measuring then
catches the header mid-ease. That is safe only because `--hdr` feeds the panel's
`top` and nothing that can resize the header back.

### The subtitle frames, the card explains

The header subtitle in `index.html` carries the framing — what today's agent is
made of and the scope of the chart — and it is visible at **every** screen size,
with the byline on its own line above it. `renderIntroPanel` is therefore only about
notation: what the two line styles mean, how time runs, what a lane heading is.
Don't let the framing sentence migrate back into the card, and don't restore the
gesture hint or the weak-edge count — both were cut deliberately.

### Traditions vs. lanes

Eight *traditions* render into six *lanes*: `physics` shares the cybernetics lane with `control`, and `popstat` shares the statistics lane with `textstat`. A node's second tuple field is its tradition, which picks both the lane (via `LANE_OF`) and the column slot inside it.

`TRADITION_NAME` in `render/panel.ts` is a separate map with all eight entries, feeding the panel subtitle — distinct from the six lane headings in `LANES`.

The `// logic`, `// control` … comments in `nodes.ts` and `edges.ts` are the original authoring groups and have drifted from the data (`mcculloch` sits under `// control` but is tradition `neural`). The tuple field is authoritative.

### Layout specifics

- The time axis is **piecewise-linear**: `SEG` maps year spans to pixel budgets, so 780–1700 gets 190px and 2020–2027 gets 760px. Editing it rescales the chart.
- Lane width is derived from member count, so adding a tradition to a lane's `members` widens the chart by a column.
- **Lane headings and definitions are laid out by measurement, not by hand.** `LANES[].title` is plain text and `def` lists its definitions with `'; '`; `packToWidth()` in `render/chart.ts` measures candidate lines with `getComputedTextLength()` against `lane.w - PAD` and starts a new one only when the next item does not fit. Headings pack words, definitions pack whole definitions joined by a middot — so a lane too narrow for both breaks between them, never through one. There is no `|` convention any more — don't reintroduce one. Every heading is measured before anything is drawn, because the definition lines all hang off the tallest heading (`defY`); a lane whose heading fits on one line must not pull its definition out of line with its neighbours'. A heading longer than its lane is the lane telling you it is too narrow for that name: shorten the name, or give the lane a second tradition.
- Within a lane each tradition owns a column. A node wants to sit centred on its year; if that overlaps its slot's previous occupant it takes another free slot in the same lane, and failing that is pushed down. **Vertical position within a crowded decade is therefore approximate** — the year label is the authority, not the height on the page.
- Same-column edges that would pass through an intervening box bow out, alternating side by edge index.

## Deploying

Push to `main` runs `.github/workflows/deploy.yml`: validate, typecheck, lint,
build, publish to Pages. The `base` is **computed in the workflow**, not
committed — `/<repo>/` for a project site, `/` for an `<account>.github.io` repo
or when `public/CNAME` exists — and handed to `vite.config.ts` as `BASE_PATH`.

Pages has to be switched on by hand (Settings > Pages > Source: GitHub Actions).
`actions/configure-pages`'s `enablement` input cannot do it: `GITHUB_TOKEN` may
not create a Pages site, and it fails with "Resource not accessible by
integration". That was tried and reverted; don't re-add it.

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
- `tsconfig.json` is strict plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noUnusedLocals`/`Parameters` and `verbatimModuleSyntax`. The first explains the house style in `layout.ts` and `chart.ts` — every index into an array is guarded (`if (!box) continue`, `?? -1e9`) rather than asserted. The last means type-only imports must say `import type`.
- Two places cross from `string` back into `NodeId` with a cast, both commented: `data-id` in `focus.ts` and `data-relation` in `main.ts`. They are the seam where the DOM hands ids back; don't add a third without the same comment.
- `ICONS` markup is injected with `innerHTML` in `chart.ts` — the one unescaped path in the app, and fine only because the icons are hand-authored constants. Keep it that way.

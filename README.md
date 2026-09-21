# A Pedigree of Agentic AI

Where the ideas behind today’s AI agents came from, and who took what from
whom. 150 people, papers, machines and institutions, from year 780 to 2026, in
eight traditions drawn as six columns. Hover or tap a box to trace its
ancestry: solid lines are documented transfers, dashed lines are resemblances
or priority without known transmission, each carrying the caveat that makes it
weak.

Course material for *AI Agent & Platform Design*, Week 4.

## Running it

```sh
bun install
bun run dev        # http://localhost:5173
```

| Command | What it does |
| --- | --- |
| `bun run dev` | Dev server with hot reload |
| `bun run build` | Validate data, typecheck, then build to `dist/` |
| `bun run preview` | Serve the built `dist/` |
| `bun run validate` | Check the data invariants on their own |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run lint` | Biome lint + format check |
| `bun run format` | Apply Biome fixes |
| `bun run check` | validate + typecheck + lint, as CI runs them |

Pushing to `main` builds and publishes to GitHub Pages.

## Theme and layout

**Theme** is one button in the top right: light or dark. The system preference
seeds the first visit and nothing after that, so the choice stays the reader's;
it persists in `localStorage`, and an inline script in `index.html` applies it
before first paint so a dark page never flashes light. The colours themselves
are pure CSS — `src/styles/tokens.css` holds three blocks that must stay in
sync, and `ThemeController` only sets `data-theme`.

**Layout** has two modes:

- **Wide (≥900px)** — the page scrolls, the panel is a sticky column, and the
  header collapses to a bar once you scroll. From 1800px the panel widens and
  the page's width ceiling rises; by 2200px the whole 1684px chart fits beside
  the panel with no horizontal scrolling at all.
- **Narrow (<900px)** — an app shell. The page itself stops scrolling, the chart
  becomes a pane that scrolls in both directions, and the panel becomes a bottom
  sheet collapsed to a labelled bar. Tapping a node opens it; tapping the bar,
  or Escape, closes it. Hover tracing is not bound at all on a device that
  cannot hover, so a tap pins cleanly instead of tracing twice.

**Navigating** works three ways, and they all end in the same place: click a
node in the chart, search by name, work or year, or click a row under **Draws
on** / **Feeds** on the card. Those rows are buttons — a click or Enter pins
that node, centres it in the chart and moves keyboard focus onto it, so you can
walk a lineage card by card without going back to the diagram.

## Editing the chart

All content is in `src/data/`, and it is typed so that the mistakes that used to
fail silently now fail to compile.

- **A node** goes in `src/data/nodes.ts` as
  `[id, tradition, year, name, [work lines], note]`. The second field is the
  *tradition*, which picks both the lane and the column within it.
- **An edge** goes in `src/data/edges.ts` as `[from, to, kind, caveat?]`, where
  `kind` is `'doc'` (solid) or `'weak'` (dashed, and its caveat is required).
  Endpoints are checked against the node ids, so a typo will not compile.
- **References** go in `src/data/refs.ts`, keyed by node id.
- **A lane** goes in `src/data/lanes.ts`, and needs a pictogram in
  `src/render/icons.ts`. Adding a tradition to a lane's `members` widens the
  chart by one column.

`bun run validate` then checks what the types cannot: duplicate ids, self-loops,
duplicate edges, years off the axis, dashed edges missing their caveat, and
edges that run backwards in time.

## Layout

There is no framework. The chart is built once as SVG and never re-rendered;
tracing a lineage toggles CSS classes on the existing elements.

```
src/
  main.ts                 wiring
  layout.ts               time scale, lane and slot placement, edge routing
  graph.ts                adjacency and ancestor/descendant walks
  data/                   the content, typed
  render/                 SVG construction, lane icons, side panel
  interaction/            focus and pinning, typeahead, sticky header
  styles/                 tokens.css (colours, three theme blocks) + app.css
scripts/validate-data.ts  data invariants
```

Time runs downward on a piecewise scale (`SEG` in `layout.ts`) that compresses
deep history and stretches the last few years. A node sits on its own year
unless its slot is taken, in which case it is pushed down — so height on the
page is approximate within a crowded decade, and the year label is the
authority.

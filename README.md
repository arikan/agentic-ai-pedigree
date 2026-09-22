# A Pedigree of Agentic AI

Today's AI agent is a statistical prior, post-trained by Reinforcement Learning, wrapped in a tool loop, and named after the principal-agent relation in economics. Where did the ideas behind today's AI agents come from, and who took what from whom? 150 people, papers, machines and institutions, from year 780 to 2026.

Hover or tap a box to trace its ancestry. **Solid lines** are documented
influence: a citation, an acknowledgment, correspondence, a shared lab or
teacher. **Dashed lines** are resemblance, or priority without known
transmission, and carry the caveat that makes them weak.

> **Ongoing work.** The chart works as it stands. Templates for the data files
> are coming, so the same chart can carry another subject’s lineage.

## Running it

```sh
bun install
bun run dev        # http://localhost:5173
```

## Publishing

Pushing to `main` runs `.github/workflows/deploy.yml`: validate, typecheck,
lint, build, publish to Pages. You set **Settings > Pages > Source: GitHub
Actions** once, and every push after that redeploys. The workflow computes the
base path itself, so a project site, an `<account>.github.io` repo and a
`public/CNAME` domain all build correctly.

## Reading it

**Theme** is one button, top right. Light or dark, and the choice is remembered
between visits.

**On a wide screen** (≥900px) the page scrolls, the card sits in a sticky
column, and the header collapses to a bar once you scroll. By 2200px the whole
chart fits beside the card.

**On a narrow screen** (<900px) the layout becomes an app shell. The chart is
the pane that scrolls, the card is a bottom sheet, and scrolling the chart
collapses the header. A cue in one corner says the chart continues to the
right, and a button in the other goes back to the top.

**To navigate**, click a node, search by name, work or year, or click a row
under **Draws on** / **Feeds**. Each of the three pins the node and centres it.

## Editing the chart

Everything is in `src/data/`, typed so that a reference to a node that does not
exist fails to compile.

- **A node** in `nodes.ts`: `[id, tradition, year, name, [work lines], note]`;
  the tradition picks the lane and the column within it.
- **An edge** in `edges.ts`: `[from, to, kind, caveat?]`, where `'doc'` draws
  solid and `'weak'` draws dashed with its caveat required.
- **References** in `refs.ts`, keyed by node id.
- **A lane** in `lanes.ts`, with a pictogram in `render/icons.ts`.

`bun run validate` then checks what types cannot: duplicate ids, self-loops,
duplicate edges, years off the axis, a dashed edge with no caveat, an edge
running backwards in time.

## How it is built

There is no framework and no runtime dependencies. The chart is drawn once as
SVG and never re-rendered; tracing a lineage only toggles CSS classes. Time
runs downward on a piecewise scale (`SEG` in `layout.ts`), so height within a
crowded decade is approximate — the year label is the authority.

```
src/
  main.ts       wiring
  layout.ts     time scale, lane and slot placement, edge routing
  graph.ts      adjacency and ancestor/descendant walks
  data/         the content, typed
  render/       SVG construction, lane icons, side panel
  interaction/  focus, search, theme, sheet, header, scroll cues
  styles/       tokens.css (colours) + app.css
```

`CLAUDE.md` has the rest: the focus model, the two layout shells and the traps
in them, and the conventions the data files follow.

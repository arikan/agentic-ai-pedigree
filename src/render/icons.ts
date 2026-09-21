import type { LaneId } from '../data/lanes';

/**
 * A 32x32 pictogram per lane, as inner SVG markup scaled up at render time.
 *
 * Inside an icon: `.f` fills with ink, `.a` strokes with the accent colour,
 * `.af` fills with it. The `*_unused` entries are leftovers from an earlier
 * eight-lane layout, kept for reference.
 */
export const ICONS: Record<LaneId, string> & Record<string, string> = {
  logic:
    '<circle cx="16" cy="16" r="13"/><circle cx="16" cy="16" r="8"/><circle cx="16" cy="16" r="3"/><path d="M16 3v5M16 24v5M3 16h5M24 16h5M6.8 6.8l3.5 3.5M21.7 21.7l3.5 3.5M6.8 25.2l3.5-3.5M21.7 10.3l3.5-3.5"/><circle class="af" cx="16" cy="8" r="1.8"/>',
  control:
    '<path d="M1 12h5"/><path d="M4.5 10l1.5 2-1.5 2"/><circle cx="9" cy="12" r="3"/><path d="M7.6 12h2.8M9 10.6v2.8"/><path d="M12 12h4"/><path d="M14.5 10l1.5 2-1.5 2"/><rect x="16" y="7" width="11" height="10"/><path d="M27 12h4"/><path d="M29.5 10l1.5 2-1.5 2"/><path class="a" d="M29 12v10H9v-6"/><path class="a" d="M7.5 17.5L9 15.5l1.5 2"/>',
  physics_unused:
    '<rect x="3" y="7" width="26" height="18"/><path d="M16 7v6M16 19v6"/><path class="a" d="M16 13l4 3-4 3"/><circle class="f" cx="8" cy="12" r="1.3"/><circle class="f" cx="10" cy="20" r="1.3"/><circle class="f" cx="7" cy="16.5" r="1.3"/><circle class="f" cx="12" cy="15" r="1.3"/><circle class="f" cx="24" cy="18" r="1.3"/>',
  stats:
    '<path d="M3 26h26"/><path d="M3 25.0L4 25.0L5 24.9L6 24.8L7 24.6L8 24.1L9 23.2L10 21.7L11 19.5L12 16.5L13 13.2L14 10.1L15 7.8L16 7.0L17 7.8L18 10.1L19 13.2L20 16.5L21 19.5L22 21.7L23 23.2L24 24.1L25 24.6L26 24.8L27 24.9L28 25.0L29 25.0"/><path class="a" d="M16 9v16"/><circle class="af" cx="16" cy="9" r="1.8"/>',
  textstat:
    '<path d="M4 27h24"/><rect class="f" x="5" y="6" width="3" height="21"/><rect class="f" x="10" y="13" width="3" height="14"/><rect class="f" x="15" y="16" width="3" height="11"/><rect class="f" x="20" y="21" width="3" height="6"/><rect class="af" x="25" y="24" width="3" height="3"/>',
  decision:
    '<circle class="f" cx="16" cy="5" r="2"/><path d="M16 7v6"/><path d="M16 13l-9 7M16 13v8M16 13l9 7"/><path d="M7 20l-2 6M7 20l3 6"/><path class="a" d="M25 20l3 6"/><circle cx="16" cy="25" r="1.6"/><path class="af" d="M28 26l-1.6 1.2.6-1.9-1.6-1.2h2l.6-1.9.6 1.9h2l-1.6 1.2.6 1.9z"/>',
  game: '<rect x="3.5" y="3.5" width="25" height="25"/><path d="M8.5 3.5v25M13.5 3.5v25M18.5 3.5v25M23.5 3.5v25M3.5 8.5h25M3.5 13.5h25M3.5 18.5h25M3.5 23.5h25"/><rect class="f" x="13.5" y="8.5" width="5" height="5"/><rect class="f" x="18.5" y="13.5" width="5" height="5"/><rect class="f" x="8.5" y="18.5" width="5" height="5"/><rect class="f" x="13.5" y="18.5" width="5" height="5"/><rect class="af" x="18.5" y="18.5" width="5" height="5"/>',
  neural:
    '<circle cx="5" cy="8" r="2.2"/><circle cx="5" cy="16" r="2.2"/><circle cx="5" cy="24" r="2.2"/><circle cx="16" cy="6" r="2.2"/><circle cx="16" cy="12.7" r="2.2"/><circle cx="16" cy="19.3" r="2.2"/><circle cx="16" cy="26" r="2.2"/><circle class="af" cx="27" cy="16" r="2.4"/><path d="M7.2 8L13.8 6M7.2 8l6.6 4.7M7.2 8l6.6 11.3M7.2 8l6.6 18M7.2 16l6.6-10M7.2 16l6.6-3.3M7.2 16l6.6 3.3M7.2 16l6.6 10M7.2 24l6.6-18M7.2 24l6.6-11.3M7.2 24l6.6-4.7M7.2 24l6.6 2"/><path class="a" d="M18.2 6l6.6 10M18.2 12.7l6.6 3.3M18.2 19.3l6.6-3.3M18.2 26l6.6-10"/>',
  agents_unused:
    '<circle cx="8" cy="16" r="4"/><circle class="a" cx="24" cy="16" r="4"/><path d="M12.5 12.5c3-4 8-4 11-1"/><path d="M22.5 8.5l1 3-3 .5"/><path class="a" d="M19.5 19.5c-3 4-8 4-11 1"/><path class="a" d="M9.5 23.5l-1-3 3-.5"/>',
};

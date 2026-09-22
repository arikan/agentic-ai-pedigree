const STORAGE_KEY = 'pedigree-theme';

/** How long `theme-anim` stays on: the .35s in app.css, plus a frame of slack. */
const SWAP_MS = 420;

export type Theme = 'light' | 'dark';

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark';
}

/** Storage throws in private mode and is empty once site data is cleared. */
function readStored(): Theme | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isTheme(stored) ? stored : null;
  } catch {
    return null;
  }
}

function writeStored(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // A theme that does not persist is still a theme that works.
  }
}

/** What the operating system asks for, used only to pick the first value. */
function systemPreference(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Light or dark, on one button.
 *
 * The palettes are pure CSS: `:root` is light and `:root[data-theme="dark"]` is
 * dark, so this only has to set an attribute. The attribute is always set once
 * the page has loaded — the system preference seeds the first visit and nothing
 * more, so the choice afterwards is the reader's.
 *
 * An inline script in the document head performs the same read before first
 * paint, so a dark page never flashes light on load.
 */
export class ThemeController {
  private theme: Theme;
  private swapTimer = 0;

  constructor(private readonly button: HTMLButtonElement) {
    this.theme = readStored() ?? systemPreference();
    this.apply();
    this.button.addEventListener('click', () => this.toggle());
  }

  get current(): Theme {
    return this.theme;
  }

  toggle(): void {
    this.set(this.theme === 'dark' ? 'light' : 'dark');
  }

  set(theme: Theme): void {
    this.theme = theme;
    writeStored(theme);
    this.easeSwap();
    this.apply();
  }

  /**
   * Turn the blanket colour transition on for the length of the swap and then
   * off again. Leaving it on would slow every hover and focus on the chart;
   * this way the page crossfades only when the whole palette changes. The
   * first `apply()` deliberately skips it — a page should not fade in on load.
   */
  private easeSwap(): void {
    const root = document.documentElement;
    root.classList.add('theme-anim');
    window.clearTimeout(this.swapTimer);
    this.swapTimer = window.setTimeout(() => root.classList.remove('theme-anim'), SWAP_MS);
  }

  private apply(): void {
    document.documentElement.setAttribute('data-theme', this.theme);
    const dark = this.theme === 'dark';

    // A toggle button: the label names the thing, `aria-pressed` its state.
    this.button.setAttribute('aria-pressed', String(dark));
    this.button.title = dark ? 'Switch to light theme' : 'Switch to dark theme';

    // Keep the mobile browser chrome the same colour as the page. Read the
    // token, not the computed background: a custom property is not animated, so
    // it already holds the new colour while the background is still easing
    // towards it.
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta instanceof HTMLMetaElement) {
      const ground = getComputedStyle(document.documentElement).getPropertyValue('--ground').trim();
      if (ground) meta.content = ground;
    }
  }
}

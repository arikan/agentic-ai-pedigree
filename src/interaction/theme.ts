const STORAGE_KEY = 'pedigree-theme';

export const THEME_CHOICES = ['system', 'light', 'dark'] as const;
export type ThemeChoice = (typeof THEME_CHOICES)[number];

function isThemeChoice(value: string | null): value is ThemeChoice {
  return value !== null && (THEME_CHOICES as readonly string[]).includes(value);
}

/** Storage throws in private mode and returns nothing with site data cleared. */
function readStored(): ThemeChoice | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isThemeChoice(stored) ? stored : null;
  } catch {
    return null;
  }
}

function writeStored(choice: ThemeChoice): void {
  try {
    if (choice === 'system') localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // A theme that does not persist is still a theme that works.
  }
}

/**
 * Light, dark, or whatever the system says.
 *
 * The colours themselves are CSS: `:root` is light, a `prefers-color-scheme`
 * block covers system dark, and `[data-theme]` pins one. So this only has to
 * set an attribute — `system` removes it and lets the media query decide.
 *
 * The same attribute is set by an inline script in the document head, before
 * first paint, so a pinned dark theme does not flash light on load.
 */
export class ThemeController {
  private choice: ThemeChoice;
  private readonly systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  constructor(private readonly group: HTMLElement) {
    this.choice = readStored() ?? 'system';
    this.apply();

    for (const button of this.buttons()) {
      button.addEventListener('click', () => {
        const next = button.dataset.theme;
        if (isThemeChoice(next ?? null)) this.set(next as ThemeChoice);
      });
    }

    // Following the system means noticing when it changes.
    this.systemDark.addEventListener('change', () => {
      if (this.choice === 'system') this.syncMeta();
    });

    this.group.addEventListener('keydown', (event) => this.onKeydown(event));
  }

  get current(): ThemeChoice {
    return this.choice;
  }

  /** True when the page is currently painting dark, whatever the choice. */
  get resolvedDark(): boolean {
    return this.choice === 'dark' || (this.choice === 'system' && this.systemDark.matches);
  }

  set(choice: ThemeChoice): void {
    this.choice = choice;
    writeStored(choice);
    this.apply();
  }

  private buttons(): HTMLButtonElement[] {
    return [...this.group.querySelectorAll('button')];
  }

  private apply(): void {
    const root = document.documentElement;
    if (this.choice === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', this.choice);

    for (const button of this.buttons()) {
      button.setAttribute('aria-checked', String(button.dataset.theme === this.choice));
      button.tabIndex = button.dataset.theme === this.choice ? 0 : -1;
    }

    this.syncMeta();
  }

  /** Keep the mobile browser chrome the same colour as the page. */
  private syncMeta(): void {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (!(meta instanceof HTMLMetaElement)) return;
    meta.content = getComputedStyle(document.body).backgroundColor;
  }

  /** Arrow keys move within the group, as a radiogroup should. */
  private onKeydown(event: KeyboardEvent): void {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (step === 0) return;
    event.preventDefault();

    const order = THEME_CHOICES;
    const next = order[(order.indexOf(this.choice) + step + order.length) % order.length];
    if (!next) return;

    this.set(next);
    this.group.querySelector<HTMLButtonElement>(`button[data-theme="${next}"]`)?.focus();
  }
}

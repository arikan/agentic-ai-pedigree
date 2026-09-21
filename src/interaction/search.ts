import type { NodeId, PedigreeNode } from '../data/nodes';
import { esc } from '../render/panel';

const MAX_HITS = 10;

/** Strip case and diacritics, so "godel" finds "Gödel". */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

/**
 * Rank a node against the query. Lower is better; `null` means no match.
 *
 * The order encodes what a reader is most likely to have typed: a name first,
 * then a year, then the work, and only then the body of the note.
 */
function score(node: PedigreeNode, query: string): number | null {
  const name = normalize(node.name);
  if (name.startsWith(query)) return 0;
  if (name.includes(query)) return 1;
  if (String(node.year).startsWith(query)) return 2;
  if (normalize(node.work.join(' ')).includes(query)) return 3;
  if (normalize(node.note).includes(query)) return 4;
  return null;
}

export type SearchOptions = {
  readonly input: HTMLInputElement;
  readonly list: HTMLElement;
  readonly nodes: readonly PedigreeNode[];
  /** Pin the node and bring it on screen. */
  readonly onSelect: (id: NodeId) => void;
};

/** Typeahead over the node list: `/` or ⌘K to focus, arrows and Enter to pick. */
export class SearchBox {
  private hits: readonly PedigreeNode[] = [];
  private selected = -1;

  constructor(private readonly options: SearchOptions) {
    this.attach();
  }

  /** Empty the field and close the menu. */
  reset(): void {
    this.options.input.value = '';
    this.hits = [];
    this.selected = -1;
    this.close();
  }

  private attach(): void {
    const { input } = this.options;

    input.addEventListener('input', () => {
      const query = normalize(input.value.trim());
      this.selected = -1;

      if (!query) {
        this.hits = [];
        this.render();
        return;
      }

      this.hits = this.options.nodes
        .flatMap((node) => {
          const rank = score(node, query);
          return rank === null ? [] : [{ rank, node }];
        })
        .sort((a, b) => a.rank - b.rank || a.node.year - b.node.year)
        .slice(0, MAX_HITS)
        .map((hit) => hit.node);

      if (this.hits.length > 0) this.selected = 0;
      this.render();
    });

    input.addEventListener('keydown', (event) => {
      if (this.options.list.hidden || this.hits.length === 0) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          this.selected = (this.selected + 1) % this.hits.length;
          this.render();
          break;
        case 'ArrowUp':
          event.preventDefault();
          this.selected = (this.selected - 1 + this.hits.length) % this.hits.length;
          this.render();
          break;
        case 'Enter': {
          event.preventDefault();
          const hit = this.hits[this.selected];
          if (hit) this.choose(hit);
          break;
        }
        case 'Escape':
          this.close();
          break;
        default:
          break;
      }
    });

    input.addEventListener('focus', () => {
      if (this.hits.length > 0 && input.value.trim()) this.render();
    });

    // Deferred so a pointerdown on a result still lands.
    input.addEventListener('blur', () => {
      setTimeout(() => this.close(), 120);
    });

    document.addEventListener('keydown', (event) => {
      const active = document.activeElement;
      const typing =
        (active instanceof HTMLElement && active.isContentEditable) ||
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        active instanceof HTMLSelectElement;

      const slash =
        event.key === '/' && !typing && !event.metaKey && !event.ctrlKey && !event.altKey;
      const commandK = (event.metaKey || event.ctrlKey) && (event.key === 'k' || event.key === 'K');

      if (slash || commandK) {
        event.preventDefault();
        input.focus();
        input.select();
      }
    });
  }

  private choose(node: PedigreeNode): void {
    this.options.onSelect(node.id);
    this.options.input.value = node.name;
    this.close();
  }

  private render(): void {
    const { list, input } = this.options;
    list.replaceChildren();

    if (!input.value.trim()) {
      this.close();
      return;
    }

    if (this.hits.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'none';
      empty.textContent = 'Nothing on the chart matches.';
      list.appendChild(empty);
    }

    for (const [index, node] of this.hits.entries()) {
      const item = document.createElement('li');
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', String(index === this.selected));
      if (index === this.selected) item.className = 'sel';
      item.innerHTML = `<span class="ry">${node.year}</span><span class="rn">${esc(
        node.name,
      )}</span><span class="rw">${esc(node.work.join(' '))}</span>`;
      item.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        this.choose(node);
      });
      list.appendChild(item);
    }

    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }

  private close(): void {
    this.options.list.hidden = true;
    this.options.input.setAttribute('aria-expanded', 'false');
  }
}

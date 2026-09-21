/**
 * The side panel as a bottom sheet, on screens too narrow for a column.
 *
 * Collapsed it is a labelled bar naming what is on show; expanded it is the
 * same panel as on a wide screen. Selecting a node opens it, because the
 * selection is the thing you asked to read; clearing the selection closes it
 * again, handing the space back to the chart.
 *
 * On a wide screen the handle is display:none and none of this applies, so the
 * controller can stay attached and simply have no visible effect.
 */
export class PanelSheet {
  private expanded = false;

  constructor(
    private readonly panel: HTMLElement,
    private readonly handle: HTMLElement,
    private readonly labelEl: HTMLElement,
  ) {
    this.handle.addEventListener('click', () => this.toggle());
    this.apply();
  }

  /** Rename the collapsed bar without opening it. */
  label(title: string): void {
    this.labelEl.textContent = title;
  }

  /** Name the sheet after what it is showing, and open it. */
  show(title: string): void {
    this.labelEl.textContent = title;
    this.setExpanded(true);
  }

  /** Back to the resting label, closed. */
  reset(title: string): void {
    this.labelEl.textContent = title;
    this.setExpanded(false);
  }

  toggle(): void {
    this.setExpanded(!this.expanded);
  }

  private setExpanded(value: boolean): void {
    if (value === this.expanded) return;
    this.expanded = value;
    this.apply();
  }

  private apply(): void {
    this.panel.dataset.expanded = String(this.expanded);
    this.handle.setAttribute('aria-expanded', String(this.expanded));
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  output,
} from '@angular/core';

import { ToothConditionGroup } from '../models/tooth-condition-group.model';

export interface ToothHoverEvent {
  id: string;
  element: SVGGElement;
}

/**
 * A single tooth rendered as an SVG `<g>` group: outline path, fill (shadow)
 * path and highlight lines. Selection, hover and keyboard interaction events
 * bubble up to the odontogram.
 */
@Component({
  selector: 'g[ngOdontogramTooth]',
  templateUrl: './tooth.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
    '[attr.role]': "readOnly() ? null : 'option'",
    '[attr.aria-selected]': 'readOnly() ? null : selected()',
    '[attr.aria-label]': 'readOnly() ? null : ariaLabel()',
    '[attr.aria-disabled]': 'readOnly()',
    '[attr.tabindex]': 'readOnly() ? -1 : 0',
    '[style.cursor]': "readOnly() ? 'default' : 'pointer'",
    '[style.color]': 'strokeColor()',
    '(click)': 'onToggle()',
    '(keydown)': 'onKeyDown($event)',
    '(mouseenter)': 'onEnter()',
    '(focus)': 'onEnter()',
    '(mouseleave)': 'onLeave()',
    '(blur)': 'onLeave()',
  },
})
export class ToothComponent {
  private readonly elementRef = inject<ElementRef<SVGGElement>>(ElementRef);

  /** Full tooth id, e.g. `teeth-11`. */
  readonly toothId = input.required<string>();
  /** Text shown in the native `<title>` tooltip, in the active notation. */
  readonly displayName = input.required<string>();
  readonly outlinePath = input.required<string>();
  readonly shadowPath = input.required<string>();
  readonly lineHighlightPath = input.required<string | string[]>();
  readonly selected = input(false);
  readonly readOnly = input(false);
  readonly condition = input<ToothConditionGroup | undefined>(undefined);

  readonly toggled = output<string>();
  readonly hovered = output<ToothHoverEvent>();
  readonly left = output<void>();

  protected readonly strokeColor = computed(
    () => this.condition()?.outlineColor ?? 'currentColor',
  );
  protected readonly fillColor = computed(() => this.condition()?.fillColor ?? 'currentColor');

  protected readonly highlightPaths = computed(() => {
    const path = this.lineHighlightPath();
    return Array.isArray(path) ? path : [path];
  });

  protected readonly hostClasses = computed(
    () => `${this.toothId()} odontogram-tooth${this.selected() ? ' selected' : ''}`,
  );

  protected readonly ariaLabel = computed(
    () => `Tooth ${this.toothId().replace('teeth-', '')}`,
  );

  protected onToggle(): void {
    if (this.readOnly()) {
      return;
    }
    this.toggled.emit(this.toothId());
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (this.readOnly()) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggled.emit(this.toothId());
    }
  }

  protected onEnter(): void {
    this.hovered.emit({ id: this.toothId(), element: this.elementRef.nativeElement });
  }

  protected onLeave(): void {
    this.left.emit();
  }
}

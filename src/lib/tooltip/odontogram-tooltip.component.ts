import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  afterRenderEffect,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';

import {
  OdontogramTooltipContext,
  TooltipPosition,
} from '../models/odontogram-types';
import { ToothDetail } from '../models/tooth-detail.model';
import { TooltipCoords, computeTooltipCoords } from '../utils/tooltip.utils';

/**
 * Fixed-position tooltip shown next to the hovered/focused tooth. Content
 * defaults to the tooth's notations and type; a custom string or
 * `ng-template` (receiving the `ToothDetail` as implicit context) can be
 * provided through the odontogram's `tooltip.content` option.
 */
@Component({
  selector: 'ng-odontogram-tooltip',
  imports: [NgTemplateOutlet],
  templateUrl: './odontogram-tooltip.component.html',
  styleUrl: './odontogram-tooltip.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'odontogram-tooltip',
    role: 'tooltip',
    '[style.left.px]': 'coords()?.left ?? -9999',
    '[style.top.px]': 'coords()?.top ?? -9999',
    '[style.opacity]': 'coords() ? 1 : 0',
  },
})
export class OdontogramTooltipComponent {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly payload = input.required<ToothDetail>();
  readonly position = input<TooltipPosition | undefined>(undefined);
  readonly content = input<string | TemplateRef<OdontogramTooltipContext> | undefined>(undefined);

  protected readonly coords = signal<TooltipCoords | null>(null);

  protected readonly contentTemplate = computed(() => {
    const content = this.content();
    return content instanceof TemplateRef ? content : null;
  });

  protected readonly contentText = computed(() => {
    const content = this.content();
    return typeof content === 'string' ? content : null;
  });

  protected readonly templateContext = computed<OdontogramTooltipContext>(() => ({
    $implicit: this.payload(),
  }));

  constructor() {
    // The tooltip must be measured after it renders to clamp it inside the
    // viewport, mirroring the original React implementation.
    afterRenderEffect(() => {
      const position = this.position();
      this.payload();

      if (!position) {
        this.coords.set(null);
        return;
      }

      const box = this.elementRef.nativeElement.getBoundingClientRect();
      this.coords.set(
        computeTooltipCoords(
          { width: box.width, height: box.height },
          position,
          { width: window.innerWidth, height: window.innerHeight },
        ),
      );
    });
  }
}

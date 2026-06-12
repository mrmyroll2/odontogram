import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';

import { ToothConditionGroup } from '../models/tooth-condition-group.model';

/**
 * Legend listing the configured tooth conditions with their colors.
 * Rendered below the chart when `showLabels` is enabled.
 */
@Component({
  selector: 'ng-odontogram-legend',
  templateUrl: './odontogram-legend.component.html',
  styleUrl: './odontogram-legend.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OdontogramLegendComponent {
  readonly conditions = input<ToothConditionGroup[] | undefined>(undefined);
}

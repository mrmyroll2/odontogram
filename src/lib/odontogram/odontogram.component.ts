import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';

import {
  CIRCLE_QUADRANTS,
  CIRCLE_TEETH_PATHS,
  SQUARE_QUADRANTS,
  SQUARE_TEETH_PATHS,
} from '../data/tooth-data';
import { convertFdiToNotation, getToothNotations } from '../data/tooth-notations';
import { OdontogramLegendComponent } from '../legend/odontogram-legend.component';
import {
  OdontogramColors,
  OdontogramHalf,
  OdontogramLayout,
  OdontogramTheme,
  OdontogramTooltipConfig,
  ToothNotation,
  TooltipPosition,
} from '../models/odontogram-types';
import { ToothConditionGroup } from '../models/tooth-condition-group.model';
import { ToothDetail } from '../models/tooth-detail.model';
import { OdontogramTooltipComponent } from '../tooltip/odontogram-tooltip.component';
import { ToothComponent, ToothHoverEvent } from '../tooth/tooth.component';
import { buildConditionMap } from '../utils/condition.utils';
import { getViewBox } from '../utils/layout.utils';
import { clampMaxTeeth, toggleToothSelection } from '../utils/selection.utils';
import { TOOLTIP_PLACEMENTS } from '../utils/tooltip.utils';

const LIGHT_THEME_COLORS: Required<OdontogramColors> = {
  darkBlue: '#3e5edc',
  baseBlue: '#8a98be',
  lightBlue: '#c6ccf8',
};

const DARK_THEME_COLORS: Required<OdontogramColors> = {
  darkBlue: '#aab6ff',
  baseBlue: '#d0d5f6',
  lightBlue: '#5361e6',
};

interface TooltipState {
  active: boolean;
  position?: TooltipPosition;
  payload?: ToothDetail;
}

/**
 * Interactive dental chart for selecting teeth and visualizing conditions.
 * Angular port of `react-odontogram`
 * (https://github.com/biomathcode/react-odontogram, MIT License).
 */
@Component({
  selector: 'ng-odontogram',
  imports: [ToothComponent, OdontogramTooltipComponent, OdontogramLegendComponent],
  templateUrl: './odontogram.component.html',
  styleUrl: './odontogram.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'containerClasses()',
    'aria-label': 'Odontogram',
    '[attr.role]': "readOnly() ? 'group' : 'listbox'",
    '[attr.aria-multiselectable]': 'readOnly() ? null : !singleSelect()',
    '[attr.data-read-only]': "readOnly() ? 'true' : 'false'",
    '[attr.tabindex]': 'readOnly() ? -1 : 0',
    '[style.--dark-blue]': 'finalColors().darkBlue',
    '[style.--base-blue]': 'finalColors().baseBlue',
    '[style.--light-blue]': 'finalColors().lightBlue',
  },
})
export class OdontogramComponent {
  /** Tooth ids selected on first render, e.g. `['teeth-11', 'teeth-21']`. */
  readonly defaultSelected = input<string[]>([]);
  /** Allow only one selected tooth; clicking the selected tooth clears it. */
  readonly singleSelect = input(false);
  /** Name of the hidden form input carrying the selected ids as JSON. */
  readonly name = input('teeth');
  /** Extra class(es) added to the host element for customization. */
  readonly className = input('');
  readonly theme = input<OdontogramTheme>('light');
  /** Palette overrides applied on top of the active theme. */
  readonly colors = input<OdontogramColors>({});
  /** Notation used for the native tooth titles. */
  readonly notation = input<ToothNotation>('FDI');
  readonly tooltip = input<OdontogramTooltipConfig>({ placement: 'top', margin: 10 });
  readonly showTooltip = input(true);
  readonly showHalf = input<OdontogramHalf>('full');
  /** Teeth rendered per quadrant (for baby/mixed dentition views). */
  readonly maxTeeth = input(8);
  readonly teethConditions = input<ToothConditionGroup[] | undefined>(undefined);
  readonly readOnly = input(false);
  /** Show the condition legend under the chart. */
  readonly showLabels = input(false);
  readonly layout = input<OdontogramLayout>('circle');

  /** Emits the selected teeth (full details) whenever the selection changes. */
  readonly selectionChange = output<ToothDetail[]>();
  /** Emits the selected tooth ids whenever the selection changes. */
  readonly selectedIdsChange = output<string[]>();

  protected readonly selected = linkedSignal(
    () =>
      new Set(this.singleSelect() ? this.defaultSelected().slice(0, 1) : this.defaultSelected()),
  );

  protected readonly tooltipState = signal<TooltipState>({ active: false });

  protected readonly teethPaths = computed(() =>
    this.layout() === 'circle' ? CIRCLE_TEETH_PATHS : SQUARE_TEETH_PATHS,
  );

  private readonly quadrants = computed(() =>
    this.layout() === 'circle' ? CIRCLE_QUADRANTS : SQUARE_QUADRANTS,
  );

  protected readonly visibleQuadrants = computed(() => {
    const quadrants = this.quadrants();
    const half = this.showHalf();
    if (half === 'upper') {
      return quadrants.slice(0, 2);
    }
    if (half === 'lower') {
      return quadrants.slice(2);
    }
    return quadrants;
  });

  protected readonly filteredTeeth = computed(() => {
    const teeth = this.teethPaths();
    return teeth.slice(0, clampMaxTeeth(this.maxTeeth(), teeth.length));
  });

  protected readonly conditionMap = computed(() => buildConditionMap(this.teethConditions()));

  protected readonly viewBox = computed(() => getViewBox(this.layout(), this.showHalf()));

  protected readonly finalColors = computed<Required<OdontogramColors>>(() => {
    const themeColors = this.theme() === 'dark' ? DARK_THEME_COLORS : LIGHT_THEME_COLORS;
    const overrides = this.colors();
    return {
      darkBlue: overrides.darkBlue ?? themeColors.darkBlue,
      baseBlue: overrides.baseBlue ?? themeColors.baseBlue,
      lightBlue: overrides.lightBlue ?? themeColors.lightBlue,
    };
  });

  protected readonly containerClasses = computed(() =>
    ['Odontogram', this.theme() === 'dark' ? 'dark-theme' : '', this.className()]
      .filter(Boolean)
      .join(' '),
  );

  protected readonly selectedJson = computed(() => JSON.stringify(Array.from(this.selected())));

  private readonly toothTypeByName = computed(
    () => new Map(this.teethPaths().map((tooth) => [tooth.name, tooth.type])),
  );

  protected displayName(toothId: string): string {
    return convertFdiToNotation(toothId, this.notation());
  }

  protected handleToggle(id: string): void {
    if (this.readOnly()) {
      return;
    }

    const updated = toggleToothSelection(this.selected(), id, this.singleSelect());
    this.selected.set(updated);

    const ids = Array.from(updated);
    this.selectionChange.emit(ids.map((toothId) => this.buildToothDetail(toothId)));
    this.selectedIdsChange.emit(ids);
  }

  protected handleHover(event: ToothHoverEvent): void {
    const path = event.element.querySelector('path');
    if (!path) {
      return;
    }

    const toothBox = path.getBoundingClientRect();
    const placement = this.tooltip().placement ?? 'top';
    const margin = this.tooltip().margin ?? 10;
    const { x } = (TOOLTIP_PLACEMENTS[placement] ?? TOOLTIP_PLACEMENTS['right'])(toothBox, margin);

    this.tooltipState.set({
      active: true,
      position: {
        x,
        placement,
        margin,
        anchorRect: {
          top: toothBox.top,
          right: toothBox.right,
          bottom: toothBox.bottom,
          left: toothBox.left,
        },
      },
      payload: this.buildToothDetail(event.id),
    });
  }

  protected handleLeave(): void {
    this.tooltipState.update((state) => ({ ...state, active: false }));
  }

  private buildToothDetail(id: string): ToothDetail {
    return {
      id,
      notations: getToothNotations(id),
      type: this.getToothType(id),
    };
  }

  private getToothType(id: string): string {
    const toothName = id.replace('teeth-', '').slice(1);
    return this.toothTypeByName().get(toothName) ?? 'Unknown';
  }
}

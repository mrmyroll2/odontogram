import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { action } from 'storybook/actions';

import {
  OdontogramColors,
  OdontogramHalf,
  OdontogramLayout,
  OdontogramTheme,
  OdontogramTooltipConfig,
  ToothNotation,
} from '../src/lib/models/odontogram-types';
import { ToothConditionGroup } from '../src/lib/models/tooth-condition-group.model';
import { ToothDetail } from '../src/lib/models/tooth-detail.model';
import { OdontogramComponent } from '../src/lib/odontogram/odontogram.component';

interface LayoutsStoryArgs {
  defaultSelected: string[];
  singleSelect: boolean;
  name: string;
  className: string;
  theme: OdontogramTheme;
  colors: OdontogramColors;
  notation: ToothNotation;
  tooltip: OdontogramTooltipConfig;
  showTooltip: boolean;
  showHalf: OdontogramHalf;
  maxTeeth: number;
  teethConditions?: ToothConditionGroup[];
  readOnly: boolean;
  showLabels: boolean;
  layout: OdontogramLayout;
  /** Story-only knob: width of the wrapper around the chart. */
  maxWidth: string;
  /** Story-only knob: pop up an alert with the selection, like the React demo. */
  alertOnChange: boolean;
}

const CHART_TEMPLATE = `
  <div [style.max-width]="maxWidth" style="width: 100vw; margin: 0 auto;">
    <ng-odontogram
      [defaultSelected]="defaultSelected"
      [singleSelect]="singleSelect"
      [name]="name"
      [className]="className"
      [theme]="theme"
      [colors]="colors"
      [notation]="notation"
      [tooltip]="tooltip"
      [showTooltip]="showTooltip"
      [showHalf]="showHalf"
      [maxTeeth]="maxTeeth"
      [teethConditions]="teethConditions"
      [readOnly]="readOnly"
      [showLabels]="showLabels"
      [layout]="layout"
      (selectionChange)="selectionChange($event)"
      (selectedIdsChange)="selectedIdsChange($event)"
    />
  </div>
`;

// The handlers are injected through props (not args) because the Angular
// renderer drops function-valued args before they reach the template.
const withHandlers = (args: LayoutsStoryArgs) => ({
  ...args,
  selectionChange: (selected: ToothDetail[]) => {
    action('selectionChange')(selected);
    if (args.alertOnChange) {
      window.alert(`Selected teeth:\n${JSON.stringify(selected, null, 2)}`);
    }
  },
  selectedIdsChange: (ids: string[]) => action('selectedIdsChange')(ids),
});

const meta: Meta<LayoutsStoryArgs> = {
  title: 'Components/Layouts',
  decorators: [moduleMetadata({ imports: [OdontogramComponent] })],
  parameters: {
    layout: 'centered',
  },
  render: (args) => ({
    props: withHandlers(args),
    template: CHART_TEMPLATE,
  }),
  args: {
    defaultSelected: [],
    singleSelect: false,
    name: 'teeth',
    className: '',
    theme: 'light',
    colors: {},
    notation: 'FDI',
    tooltip: { placement: 'top', margin: 10 },
    showTooltip: true,
    showHalf: 'full',
    maxTeeth: 8,
    teethConditions: undefined,
    readOnly: false,
    showLabels: false,
    layout: 'square',
    maxWidth: '800px',
    alertOnChange: false,
  },
  argTypes: {
    theme: { control: 'radio', options: ['light', 'dark'] },
    notation: { control: 'radio', options: ['FDI', 'Universal', 'Palmer'] },
    showHalf: { control: 'select', options: ['full', 'upper', 'lower'] },
    layout: { control: 'select', options: ['circle', 'square'] },
    colors: { control: 'object' },
    tooltip: { control: 'object' },
    teethConditions: { control: 'object' },
    singleSelect: { control: 'boolean' },
    showTooltip: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    showLabels: { control: 'boolean' },
    alertOnChange: { control: 'boolean' },
    maxTeeth: { control: { type: 'number', min: 0, max: 8 } },
    maxWidth: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<LayoutsStoryArgs>;

export const Light: Story = {
  args: {
    theme: 'light',
    defaultSelected: ['teeth-11', 'teeth-12', 'teeth-22'],
    alertOnChange: true,
  },
};

export const Dark: Story = {
  args: {
    theme: 'dark',
    colors: {
      darkBlue: '#aab6ff',
      baseBlue: '#d0d5f6',
      lightBlue: '#5361e6',
    },
    defaultSelected: ['teeth-11', 'teeth-12', 'teeth-22'],
  },
  globals: {
    backgrounds: { value: 'dark' },
  },
};

export const Default: Story = {
  args: {
    defaultSelected: ['teeth-11', 'teeth-12', 'teeth-22'],
  },
};

export const SingleSelect: Story = {
  name: 'Single Select',
  args: {
    singleSelect: true,
    defaultSelected: ['teeth-11'],
  },
};

export const WithCustomTooltip: Story = {
  name: 'Custom Tooltip',
  args: {
    defaultSelected: ['teeth-11'],
  },
  render: (args) => ({
    props: withHandlers(args),
    template: `
      <ng-template #customTip let-tooth>
        <div
          style="
            padding: 8px 12px;
            border-radius: 6px;
            background: #333;
            color: #fff;
            font-size: 13px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
          "
        >
          <strong>Tooth #{{ tooth.notations.fdi }}</strong>
          <br />
          Type: {{ tooth.type }}
        </div>
      </ng-template>

      <div [style.max-width]="maxWidth" style="width: 100vw; margin: 0 auto;">
        <ng-odontogram
          [defaultSelected]="defaultSelected"
          [singleSelect]="singleSelect"
          [theme]="theme"
          [colors]="colors"
          [notation]="notation"
          [tooltip]="{ placement: 'top', margin: 10, content: customTip }"
          [showTooltip]="showTooltip"
          [showHalf]="showHalf"
          [maxTeeth]="maxTeeth"
          [readOnly]="readOnly"
          [layout]="layout"
          (selectionChange)="selectionChange($event)"
          (selectedIdsChange)="selectedIdsChange($event)"
        />
      </div>
    `,
  }),
};

export const WithoutTooltip: Story = {
  name: 'Without Tooltip',
  args: {
    defaultSelected: ['teeth-11', 'teeth-21'],
    showTooltip: false,
  },
};

export const UpperHalf: Story = {
  args: {
    defaultSelected: ['teeth-11', 'teeth-21'],
    showHalf: 'upper',
  },
};

export const LowerHalf: Story = {
  args: {
    defaultSelected: ['teeth-11', 'teeth-21'],
    showHalf: 'lower',
  },
};

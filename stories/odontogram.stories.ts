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

interface OdontogramStoryArgs {
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
}

const SAMPLE_CONDITIONS: ToothConditionGroup[] = [
  {
    label: 'caries',
    teeth: ['teeth-16', 'teeth-17', 'teeth-36', 'teeth-37'],
    fillColor: '#ef4444',
    outlineColor: '#b91c1c',
  },
  {
    label: 'filling',
    teeth: ['teeth-14', 'teeth-24'],
    fillColor: '#60a5fa',
    outlineColor: '#1d4ed8',
  },
  {
    label: 'missing',
    teeth: ['teeth-18', 'teeth-28'],
    fillColor: '#e5e7eb',
    outlineColor: '#6b7280',
  },
];

const meta: Meta<OdontogramStoryArgs> = {
  title: 'Components/Odontogram',
  decorators: [moduleMetadata({ imports: [OdontogramComponent] })],
  parameters: {
    layout: 'centered',
  },
  render: (args) => ({
    // The actions are injected here (not through args) because the Angular
    // renderer drops function-valued args before they reach the template.
    props: {
      ...args,
      selectionChange: (selected: ToothDetail[]) => action('selectionChange')(selected),
      selectedIdsChange: (ids: string[]) => action('selectedIdsChange')(ids),
    },
    template: `
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
    `,
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
    layout: 'circle',
    maxWidth: '340px',
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
    maxTeeth: { control: { type: 'number', min: 0, max: 8 } },
    maxWidth: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<OdontogramStoryArgs>;

export const Default: Story = {};

export const DarkTheme: Story = {
  args: {
    theme: 'dark',
    defaultSelected: ['teeth-11', 'teeth-12', 'teeth-22'],
  },
  globals: {
    backgrounds: { value: 'dark' },
  },
};

export const CustomColors: Story = {
  args: {
    colors: {
      darkBlue: '#7c9cff',
      baseBlue: '#c7d2fe',
      lightBlue: '#4f46e5',
    },
    defaultSelected: ['teeth-11', 'teeth-21'],
  },
};

export const SingleSelect: Story = {
  args: {
    singleSelect: true,
    defaultSelected: ['teeth-11'],
  },
};

export const DefaultSelectedTeeth: Story = {
  args: {
    defaultSelected: ['teeth-11', 'teeth-12', 'teeth-22'],
  },
};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    defaultSelected: ['teeth-11', 'teeth-21'],
    showTooltip: false,
  },
};

export const WithConditions: Story = {
  args: {
    teethConditions: SAMPLE_CONDITIONS,
  },
};

export const WithConditionsAndLegend: Story = {
  args: {
    teethConditions: SAMPLE_CONDITIONS,
    showLabels: true,
  },
};

export const UpperArchOnly: Story = {
  args: {
    showHalf: 'upper',
    defaultSelected: ['teeth-11', 'teeth-21'],
  },
};

export const LowerArchOnly: Story = {
  args: {
    showHalf: 'lower',
    defaultSelected: ['teeth-11', 'teeth-21'],
  },
};

export const SquareLayout: Story = {
  args: {
    layout: 'square',
    maxWidth: '800px',
    defaultSelected: ['teeth-11', 'teeth-12', 'teeth-22'],
  },
};

export const FdiNotation: Story = {
  name: 'FDI Notation',
  args: {
    notation: 'FDI',
  },
};

export const UniversalNotation: Story = {
  args: {
    notation: 'Universal',
  },
};

export const PalmerNotation: Story = {
  args: {
    notation: 'Palmer',
  },
};

export const TooltipDisabled: Story = {
  args: {
    showTooltip: false,
  },
};

export const CustomTooltipPlacement: Story = {
  args: {
    tooltip: { placement: 'right-start', margin: 18 },
  },
};

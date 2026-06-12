# 🦷 ng-odontogram

An interactive **Angular odontogram** (dental chart) component for tooth selection and
condition visualization. This is an Angular port of
[react-odontogram](https://github.com/biomathcode/react-odontogram) — same SVG artwork,
same behavior, reimplemented with idiomatic Angular (standalone components, signals,
`input()`/`output()`, OnPush change detection). No React dependency.

## Features

- Full permanent dentition chart (32 teeth) rendered as SVG
- Classic arch (`circle`) and linear (`square`) layouts
- Upper-arch-only / lower-arch-only views (`showHalf`)
- `maxTeeth` per quadrant for baby/mixed dentition views
- Multi-select and single-select modes (clicking a selected tooth unselects it)
- Read-only mode
- Condition coloring per tooth group (`teethConditions`) with optional legend
- Light/dark themes plus custom palette overrides via CSS variables
- Tooltip on hover/focus with 12 placements and custom content (string or `ng-template`)
- FDI, Universal and Palmer notations
- Keyboard accessible (listbox/option roles, Enter/Space to toggle)
- Hidden form input carrying the selected ids as JSON (for plain HTML forms)

## Installation

This repository is a standalone Angular workspace. From the project root:

```bash
npm install
```

The component lives under `src/lib` and is exported through `src/public-api.ts`, so it
can be lifted into an Angular library package as-is.

## Quick start

```ts
import { Component } from '@angular/core';
import { OdontogramComponent, ToothDetail } from './lib ... (or your library entry)';

@Component({
  selector: 'app-example',
  imports: [OdontogramComponent],
  template: `
    <ng-odontogram
      [defaultSelected]="['teeth-21', 'teeth-12']"
      [singleSelect]="false"
      theme="light"
      notation="FDI"
      (selectionChange)="onSelectionChange($event)"
    />
  `,
})
export class ExampleComponent {
  onSelectionChange(selected: ToothDetail[]) {
    console.log(selected);
    /*
      [
        {
          "id": "teeth-21",
          "notations": { "fdi": "21", "universal": "9", "palmer": "1UL" },
          "type": "Central Incisor"
        },
        ...
      ]
    */
  }
}
```

## Inputs

| Input             | Type                                                           | Default                              | Description                                                                       |
| ----------------- | -------------------------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------- |
| `defaultSelected` | `string[]`                                                      | `[]`                                 | Tooth ids selected initially (resets the selection when the input changes).       |
| `singleSelect`    | `boolean`                                                       | `false`                              | Allow only one selected tooth; clicking the selected tooth clears it.             |
| `name`            | `string`                                                        | `'teeth'`                            | Name of the hidden form input.                                                    |
| `className`       | `string`                                                        | `''`                                 | Extra class(es) added to the host element.                                        |
| `theme`           | `'light' \| 'dark'`                                             | `'light'`                            | Built-in palette.                                                                 |
| `colors`          | `{ darkBlue?; baseBlue?; lightBlue? }`                          | `{}`                                 | Palette overrides (mapped to `--dark-blue`, `--base-blue`, `--light-blue`).       |
| `notation`        | `'FDI' \| 'Universal' \| 'Palmer'`                              | `'FDI'`                              | Notation used in the native tooth titles.                                         |
| `tooltip`         | `{ placement?; margin?; content? }`                             | `{ placement: 'top', margin: 10 }`   | Tooltip behavior; `content` is a string or `ng-template` (implicit `ToothDetail`). |
| `showTooltip`     | `boolean`                                                       | `true`                               | Enables/disables the tooltip.                                                     |
| `showHalf`        | `'full' \| 'upper' \| 'lower'`                                  | `'full'`                             | Render the full chart or only one arch.                                           |
| `maxTeeth`        | `number`                                                        | `8`                                  | Teeth per quadrant (clamped to 0–8).                                              |
| `teethConditions` | `ToothConditionGroup[]`                                         | `undefined`                          | Colorize specific teeth by condition.                                             |
| `readOnly`        | `boolean`                                                       | `false`                              | Disables interaction and selection changes.                                       |
| `showLabels`      | `boolean`                                                       | `false`                              | Shows the condition legend under the chart.                                       |
| `layout`          | `'circle' \| 'square'`                                          | `'circle'`                           | Classic arch layout or linear row layout.                                         |

Tooltip `placement` values: `top`, `top-start`, `top-end`, `right`, `right-start`,
`right-end`, `bottom`, `bottom-start`, `bottom-end`, `left`, `left-start`, `left-end`.

## Outputs

| Output              | Payload         | Description                                          |
| ------------------- | --------------- | ---------------------------------------------------- |
| `selectionChange`   | `ToothDetail[]` | Emits the full details of the selected teeth.        |
| `selectedIdsChange` | `string[]`      | Emits the selected tooth ids (e.g. `['teeth-11']`).  |

### `ToothDetail`

```ts
interface ToothDetail {
  id: string; // e.g. "teeth-21"
  notations: {
    fdi: string; // "21"
    universal: string; // "9"
    palmer: string; // "1UL"
  };
  type: string; // "Central Incisor"
}
```

### `ToothConditionGroup`

```ts
interface ToothConditionGroup {
  label: string; // e.g. "caries"
  teeth: string[]; // e.g. ["teeth-16", "teeth-26"]
  outlineColor: string;
  fillColor: string;
}
```

Example:

```ts
const conditions: ToothConditionGroup[] = [
  {
    label: 'caries',
    teeth: ['teeth-16', 'teeth-26', 'teeth-36'],
    fillColor: '#ef4444',
    outlineColor: '#b91c1c',
  },
];
```

```html
<ng-odontogram [teethConditions]="conditions" [showLabels]="true" [readOnly]="true" />
```

## Theming

The palette is exposed as CSS custom properties on the component host:
`--dark-blue` (selected outline accents), `--base-blue` (default line color) and
`--light-blue` (selected/hover fill). Override them with the `colors` input or CSS.
The tooltip colors can be themed with `--odontogram-tooltip-bg` and
`--odontogram-tooltip-fg`.

## Development

```bash
npm start            # demo app on http://localhost:4200
npm run storybook    # Storybook on http://localhost:6006
npm run build        # production build
npm test             # unit tests (vitest)
npm run build-storybook  # static Storybook into ./storybook-static
```

Storybook contains interactive stories for every feature (themes, custom colors,
single select, conditions/legend, arch halves, layouts, notations, tooltip options).
`selectionChange` / `selectedIdsChange` emissions are logged in the Actions panel.

> Note: `@storybook/angular` is installed with `--legacy-peer-deps` because its
> published peer range does not list Angular 22 yet; it works correctly with the
> `@angular-devkit/build-angular@21` dev dependency that accompanies it.

## License and attribution

MIT — see [LICENSE](LICENSE).

The SVG tooth shapes, tooth metadata, notation tables, styles and component behavior
are ported from [react-odontogram](https://github.com/biomathcode/react-odontogram)
(MIT License, © Pratik Sharma / [biomathcode](https://github.com/biomathcode)).

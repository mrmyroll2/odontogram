import { TemplateRef } from '@angular/core';

import { ToothDetail } from './tooth-detail.model';

export type ToothNotation = 'FDI' | 'Universal' | 'Palmer';

export type OdontogramTheme = 'light' | 'dark';

export type OdontogramLayout = 'circle' | 'square';

export type OdontogramHalf = 'full' | 'upper' | 'lower';

export type TooltipPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end';

/**
 * Palette overrides. Values are any valid CSS color and are exposed to the
 * component styles as the `--dark-blue`, `--base-blue` and `--light-blue`
 * CSS custom properties.
 */
export interface OdontogramColors {
  darkBlue?: string;
  baseBlue?: string;
  lightBlue?: string;
}

/** Template context for custom tooltip content. */
export interface OdontogramTooltipContext {
  $implicit: ToothDetail;
}

/**
 * Tooltip behavior configuration. `content` may be a plain string or an
 * `ng-template` receiving the hovered `ToothDetail` as implicit context.
 */
export interface OdontogramTooltipConfig {
  placement?: TooltipPlacement;
  margin?: number;
  content?: string | TemplateRef<OdontogramTooltipContext>;
}

/** Anchor information captured when a tooth is hovered or focused. */
export interface TooltipPosition {
  x: number;
  placement: TooltipPlacement;
  margin: number;
  anchorRect: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

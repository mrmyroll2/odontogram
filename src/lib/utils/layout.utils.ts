import { OdontogramHalf, OdontogramLayout } from '../models/odontogram-types';

/**
 * SVG viewBox for a layout/half combination. Values mirror the original
 * `react-odontogram` implementation so the rendered chart matches visually.
 */
export function getViewBox(layout: OdontogramLayout, showHalf: OdontogramHalf): string {
  if (layout === 'square') {
    if (showHalf === 'upper') {
      return '0 0 900 75';
    }
    if (showHalf === 'lower') {
      return '0 75 900 75';
    }
    return '0 0 900 150';
  }

  if (showHalf === 'upper') {
    return '0 0 409 347';
  }
  if (showHalf === 'lower') {
    return '0 347 409 347';
  }
  return '0 0 409 694';
}

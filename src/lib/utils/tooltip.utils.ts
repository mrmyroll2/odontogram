import { TooltipPlacement, TooltipPosition } from '../models/odontogram-types';

const ARROW_OFFSET = 12;
const VIEWPORT_PADDING = 8;

interface AnchorBox {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Horizontal/vertical anchor point for each tooltip placement, relative to
 * the hovered tooth's bounding box.
 */
export const TOOLTIP_PLACEMENTS: Record<
  TooltipPlacement,
  (toothBox: AnchorBox, margin: number) => { x: number; y: number }
> = {
  top: (t, m) => ({ x: t.left + t.width / 2, y: t.top - m }),
  'top-start': (t, m) => ({ x: t.left, y: t.top - m }),
  'top-end': (t, m) => ({ x: t.right, y: t.top - m }),
  bottom: (t, m) => ({ x: t.left + t.width / 2, y: t.bottom + m }),
  'bottom-start': (t, m) => ({ x: t.left, y: t.bottom + m }),
  'bottom-end': (t, m) => ({ x: t.right, y: t.bottom + m }),
  left: (t, m) => ({ x: t.left - m, y: t.top + t.height / 2 }),
  'left-start': (t, m) => ({ x: t.left - m, y: t.top }),
  'left-end': (t, m) => ({ x: t.left - m, y: t.bottom }),
  right: (t, m) => ({ x: t.right + m, y: t.top + t.height / 2 }),
  'right-start': (t, m) => ({ x: t.right + m, y: t.top }),
  'right-end': (t, m) => ({ x: t.right + m, y: t.bottom }),
};

export interface TooltipCoords {
  left: number;
  top: number;
  isBottomPlacement: boolean;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/**
 * Final fixed-position coordinates for the tooltip, flipped above/below the
 * anchor when it would overflow the viewport.
 */
export function computeTooltipCoords(
  tooltipBox: { width: number; height: number },
  position: TooltipPosition,
  viewport: { width: number; height: number },
): TooltipCoords {
  const { x, placement, margin, anchorRect } = position;

  const maxLeft = Math.max(VIEWPORT_PADDING, viewport.width - tooltipBox.width - VIEWPORT_PADDING);
  const left = clamp(x - tooltipBox.width / 2, VIEWPORT_PADDING, maxLeft);

  const topWhenAbove = anchorRect.top - tooltipBox.height - margin - ARROW_OFFSET;
  const topWhenBelow = anchorRect.bottom + margin + ARROW_OFFSET;

  const shouldStartBelow = placement.startsWith('bottom');
  let isBottomPlacement = shouldStartBelow;
  let top = shouldStartBelow ? topWhenBelow : topWhenAbove;

  if (!isBottomPlacement && top < VIEWPORT_PADDING) {
    isBottomPlacement = true;
    top = topWhenBelow;
  }

  const maxTop = Math.max(VIEWPORT_PADDING, viewport.height - tooltipBox.height - VIEWPORT_PADDING);

  if (isBottomPlacement && top > maxTop) {
    isBottomPlacement = false;
    top = topWhenAbove;
  }

  top = clamp(top, VIEWPORT_PADDING, maxTop);

  return { left, top, isBottomPlacement };
}

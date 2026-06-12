/**
 * Returns a new selection set with `id` toggled. In single-select mode,
 * selecting a new tooth replaces the previous selection, and clicking the
 * selected tooth clears it.
 */
export function toggleToothSelection(
  current: ReadonlySet<string>,
  id: string,
  singleSelect: boolean,
): Set<string> {
  const updated = new Set(current);

  if (singleSelect) {
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.clear();
      updated.add(id);
    }
    return updated;
  }

  if (updated.has(id)) {
    updated.delete(id);
  } else {
    updated.add(id);
  }
  return updated;
}

/**
 * Clamps the `maxTeeth` input to `[0, total]`. Non-numeric values fall back
 * to the full set, matching the original React behavior.
 */
export function clampMaxTeeth(value: number | undefined, total: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return total;
  }
  return Math.max(0, Math.min(total, Math.floor(value)));
}

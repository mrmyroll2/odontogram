import { ToothConditionGroup } from '../models/tooth-condition-group.model';

/**
 * Indexes condition groups by tooth id for O(1) lookup while rendering.
 * When a tooth appears in several groups, the last group wins (matching the
 * original React behavior).
 */
export function buildConditionMap(
  conditions: ToothConditionGroup[] | undefined,
): Map<string, ToothConditionGroup> {
  const map = new Map<string, ToothConditionGroup>();

  if (conditions) {
    for (const condition of conditions) {
      for (const toothId of condition.teeth) {
        map.set(toothId, condition);
      }
    }
  }

  return map;
}

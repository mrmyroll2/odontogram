/**
 * Colors a group of teeth to visualize a dental condition (e.g. caries, filling).
 */
export interface ToothConditionGroup {
  label: string;
  /** Tooth ids in FDI form, e.g. `["teeth-11", "teeth-12"]`. */
  teeth: string[];
  outlineColor: string;
  fillColor: string;
}

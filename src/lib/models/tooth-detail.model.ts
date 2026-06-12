/**
 * Notations for a single tooth in the three common dental numbering systems.
 */
export interface ToothNotations {
  fdi: string;
  universal: string;
  palmer: string;
}

/**
 * Payload describing a selected tooth, emitted through `selectionChange`.
 */
export interface ToothDetail {
  id: string;
  notations: ToothNotations;
  type: string;
}

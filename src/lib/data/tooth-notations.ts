/**
 * Dental notation conversion tables and helpers, ported from
 * `react-odontogram` (https://github.com/biomathcode/react-odontogram,
 * MIT License, Copyright (c) Pratik Sharma / biomathcode).
 */
import { ToothNotation } from '../models/odontogram-types';
import { ToothNotations } from '../models/tooth-detail.model';

/** FDI tooth number → Universal (American) tooth number. */
export const FDI_TO_UNIVERSAL: Readonly<Record<string, number>> = {
  '11': 8,
  '12': 7,
  '13': 6,
  '14': 5,
  '15': 4,
  '16': 3,
  '17': 2,
  '18': 1,
  '21': 9,
  '22': 10,
  '23': 11,
  '24': 12,
  '25': 13,
  '26': 14,
  '27': 15,
  '28': 16,
  '31': 24,
  '32': 23,
  '33': 22,
  '34': 21,
  '35': 20,
  '36': 19,
  '37': 18,
  '38': 17,
  '41': 25,
  '42': 26,
  '43': 27,
  '44': 28,
  '45': 29,
  '46': 30,
  '47': 31,
  '48': 32,
};

/** FDI quadrant digit → Palmer quadrant symbol. */
export const PALMER_QUADRANT_SYMBOLS: Readonly<Record<string, string>> = {
  '1': 'UR',
  '2': 'UL',
  '3': 'LL',
  '4': 'LR',
};

/**
 * Converts a tooth id in FDI form (e.g. `"teeth-21"` or `"21"`) to the
 * requested notation's display value.
 */
export function convertFdiToNotation(fdi: string, notation: ToothNotation): string {
  const num = fdi.replace('teeth-', '');

  if (notation === 'Universal') {
    return String(FDI_TO_UNIVERSAL[num] ?? num);
  }

  if (notation === 'Palmer') {
    if (num.length < 2) {
      return num;
    }
    const quadrant = num[0];
    const tooth = num[1];
    return `${tooth}${PALMER_QUADRANT_SYMBOLS[quadrant] ?? ''}`;
  }

  return num;
}

/** Returns the tooth number in all three notations. */
export function getToothNotations(fdi: string): ToothNotations {
  return {
    fdi: fdi.replace('teeth-', ''),
    universal: convertFdiToNotation(fdi, 'Universal'),
    palmer: convertFdiToNotation(fdi, 'Palmer'),
  };
}

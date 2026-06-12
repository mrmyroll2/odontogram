import { convertFdiToNotation, getToothNotations } from '../data/tooth-notations';
import { ToothConditionGroup } from '../models/tooth-condition-group.model';
import { buildConditionMap } from './condition.utils';
import { getViewBox } from './layout.utils';
import { clampMaxTeeth, toggleToothSelection } from './selection.utils';

describe('notation helpers', () => {
  it('converts FDI notation to Universal and Palmer', () => {
    expect(convertFdiToNotation('teeth-21', 'Universal')).toBe('9');
    expect(convertFdiToNotation('teeth-21', 'Palmer')).toBe('1UL');
    expect(convertFdiToNotation('teeth-21', 'FDI')).toBe('21');
  });

  it('returns the complete notation object', () => {
    expect(getToothNotations('teeth-48')).toEqual({
      fdi: '48',
      universal: '32',
      palmer: '8LR',
    });
  });
});

describe('toggleToothSelection', () => {
  it('adds and removes teeth in multi-select mode', () => {
    let selection = toggleToothSelection(new Set(), 'teeth-11', false);
    expect(Array.from(selection)).toEqual(['teeth-11']);

    selection = toggleToothSelection(selection, 'teeth-12', false);
    expect(Array.from(selection)).toEqual(['teeth-11', 'teeth-12']);

    selection = toggleToothSelection(selection, 'teeth-11', false);
    expect(Array.from(selection)).toEqual(['teeth-12']);
  });

  it('replaces the selection in single-select mode and clears on re-click', () => {
    let selection = toggleToothSelection(new Set(['teeth-11']), 'teeth-12', true);
    expect(Array.from(selection)).toEqual(['teeth-12']);

    selection = toggleToothSelection(selection, 'teeth-12', true);
    expect(selection.size).toBe(0);
  });

  it('does not mutate the input set', () => {
    const original = new Set(['teeth-11']);
    toggleToothSelection(original, 'teeth-12', false);
    expect(Array.from(original)).toEqual(['teeth-11']);
  });
});

describe('clampMaxTeeth', () => {
  it('clamps to the available range', () => {
    expect(clampMaxTeeth(5, 8)).toBe(5);
    expect(clampMaxTeeth(99, 8)).toBe(8);
    expect(clampMaxTeeth(-3, 8)).toBe(0);
    expect(clampMaxTeeth(4.9, 8)).toBe(4);
  });

  it('falls back to the full set for non-numeric values', () => {
    expect(clampMaxTeeth(undefined, 8)).toBe(8);
    expect(clampMaxTeeth(Number.NaN, 8)).toBe(8);
  });
});

describe('buildConditionMap', () => {
  const conditions: ToothConditionGroup[] = [
    { label: 'caries', teeth: ['teeth-16', 'teeth-26'], fillColor: '#f00', outlineColor: '#900' },
    { label: 'filling', teeth: ['teeth-26'], fillColor: '#00f', outlineColor: '#009' },
  ];

  it('indexes conditions by tooth id', () => {
    const map = buildConditionMap(conditions);
    expect(map.get('teeth-16')?.label).toBe('caries');
  });

  it('lets the last group win on overlap', () => {
    const map = buildConditionMap(conditions);
    expect(map.get('teeth-26')?.label).toBe('filling');
  });

  it('returns an empty map when no conditions are provided', () => {
    expect(buildConditionMap(undefined).size).toBe(0);
  });
});

describe('getViewBox', () => {
  it('returns circle layout view boxes', () => {
    expect(getViewBox('circle', 'full')).toBe('0 0 409 694');
    expect(getViewBox('circle', 'upper')).toBe('0 0 409 347');
    expect(getViewBox('circle', 'lower')).toBe('0 347 409 347');
  });

  it('returns square layout view boxes', () => {
    expect(getViewBox('square', 'full')).toBe('0 0 900 150');
    expect(getViewBox('square', 'upper')).toBe('0 0 900 75');
    expect(getViewBox('square', 'lower')).toBe('0 75 900 75');
  });
});

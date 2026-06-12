import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToothDetail } from '../models/tooth-detail.model';
import { OdontogramComponent } from './odontogram.component';

describe('OdontogramComponent', () => {
  let fixture: ComponentFixture<OdontogramComponent>;
  let component: OdontogramComponent;

  const root = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const options = (): NodeListOf<SVGGElement> => root().querySelectorAll('g[role="option"]');
  const tooth = (id: string): SVGGElement | null => root().querySelector(`g.${id}`);

  const click = async (element: Element) => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await fixture.whenStable();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(OdontogramComponent);
    component = fixture.componentInstance;
  });

  it('creates the component', async () => {
    await fixture.whenStable();
    expect(component).toBeTruthy();
  });

  it('renders all 32 permanent teeth by default as listbox options', async () => {
    await fixture.whenStable();

    expect(root().getAttribute('role')).toBe('listbox');
    expect(root().getAttribute('aria-label')).toBe('Odontogram');
    expect(options()).toHaveLength(32);
  });

  it('renders only upper or lower halves when requested', async () => {
    fixture.componentRef.setInput('showHalf', 'upper');
    await fixture.whenStable();
    expect(options()).toHaveLength(16);

    fixture.componentRef.setInput('showHalf', 'lower');
    await fixture.whenStable();
    expect(options()).toHaveLength(16);
  });

  it('respects maxTeeth for each quadrant', async () => {
    fixture.componentRef.setInput('maxTeeth', 5);
    await fixture.whenStable();
    expect(options()).toHaveLength(20);
  });

  it('marks defaultSelected teeth as selected', async () => {
    fixture.componentRef.setInput('defaultSelected', ['teeth-11', 'teeth-12']);
    await fixture.whenStable();

    expect(tooth('teeth-11')?.getAttribute('aria-selected')).toBe('true');
    expect(tooth('teeth-12')?.getAttribute('aria-selected')).toBe('true');
    expect(tooth('teeth-21')?.getAttribute('aria-selected')).toBe('false');
  });

  it('toggles selection and emits detailed selectionChange payloads', async () => {
    const selectionChange = vi.fn();
    const selectedIdsChange = vi.fn();
    component.selectionChange.subscribe(selectionChange);
    component.selectedIdsChange.subscribe(selectedIdsChange);
    await fixture.whenStable();

    const tooth11 = tooth('teeth-11')!;
    await click(tooth11);

    expect(selectionChange).toHaveBeenCalledTimes(1);
    expect(selectionChange).toHaveBeenLastCalledWith([
      {
        id: 'teeth-11',
        notations: { fdi: '11', universal: '8', palmer: '1UR' },
        type: 'Central Incisor',
      },
    ]);
    expect(selectedIdsChange).toHaveBeenLastCalledWith(['teeth-11']);

    const hiddenInput = root().querySelector<HTMLInputElement>('input[type="hidden"]');
    expect(hiddenInput?.name).toBe('teeth');
    expect(hiddenInput?.value).toBe(JSON.stringify(['teeth-11']));

    // Clicking the selected tooth again unselects it.
    await click(tooth11);
    expect(selectionChange).toHaveBeenCalledTimes(2);
    expect(selectionChange).toHaveBeenLastCalledWith([]);
    expect(selectedIdsChange).toHaveBeenLastCalledWith([]);
  });

  it('supports multi-select by default', async () => {
    const selectedIdsChange = vi.fn();
    component.selectedIdsChange.subscribe(selectedIdsChange);
    await fixture.whenStable();

    expect(root().getAttribute('aria-multiselectable')).toBe('true');

    await click(tooth('teeth-11')!);
    await click(tooth('teeth-12')!);

    expect(tooth('teeth-11')?.getAttribute('aria-selected')).toBe('true');
    expect(tooth('teeth-12')?.getAttribute('aria-selected')).toBe('true');
    expect(selectedIdsChange).toHaveBeenLastCalledWith(['teeth-11', 'teeth-12']);
  });

  it('limits selection to one tooth in singleSelect mode', async () => {
    const selectionChange = vi.fn();
    component.selectionChange.subscribe(selectionChange);
    fixture.componentRef.setInput('singleSelect', true);
    await fixture.whenStable();

    expect(root().getAttribute('aria-multiselectable')).toBe('false');

    await click(tooth('teeth-11')!);
    expect(tooth('teeth-11')?.getAttribute('aria-selected')).toBe('true');

    await click(tooth('teeth-12')!);
    expect(tooth('teeth-11')?.getAttribute('aria-selected')).toBe('false');
    expect(tooth('teeth-12')?.getAttribute('aria-selected')).toBe('true');
    expect(selectionChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ id: 'teeth-12' }),
    ]);

    await click(tooth('teeth-12')!);
    expect(tooth('teeth-12')?.getAttribute('aria-selected')).toBe('false');
    expect(selectionChange).toHaveBeenLastCalledWith([]);
  });

  it('keeps only the first defaultSelected tooth in singleSelect mode', async () => {
    fixture.componentRef.setInput('singleSelect', true);
    fixture.componentRef.setInput('defaultSelected', ['teeth-11', 'teeth-12']);
    await fixture.whenStable();

    expect(tooth('teeth-11')?.getAttribute('aria-selected')).toBe('true');
    expect(tooth('teeth-12')?.getAttribute('aria-selected')).toBe('false');
  });

  it('prevents selection changes when readOnly', async () => {
    const selectionChange = vi.fn();
    component.selectionChange.subscribe(selectionChange);
    fixture.componentRef.setInput('readOnly', true);
    await fixture.whenStable();

    expect(root().getAttribute('role')).toBe('group');
    expect(root().getAttribute('data-read-only')).toBe('true');
    expect(options()).toHaveLength(0);

    const tooth11 = tooth('teeth-11')!;
    await click(tooth11);

    expect(selectionChange).not.toHaveBeenCalled();
    expect(tooth11.classList.contains('selected')).toBe(false);
  });

  it('supports keyboard selection with Enter and Space', async () => {
    await fixture.whenStable();
    const tooth12 = tooth('teeth-12')!;

    tooth12.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await fixture.whenStable();
    expect(tooth12.getAttribute('aria-selected')).toBe('true');

    tooth12.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    await fixture.whenStable();
    expect(tooth12.getAttribute('aria-selected')).toBe('false');
  });

  it('colors teeth from the matching condition group', async () => {
    fixture.componentRef.setInput('teethConditions', [
      {
        label: 'caries',
        teeth: ['teeth-16', 'teeth-26'],
        fillColor: '#ef4444',
        outlineColor: '#b91c1c',
      },
    ]);
    await fixture.whenStable();

    const conditioned = tooth('teeth-16')!;
    const paths = conditioned.querySelectorAll('path');
    expect(paths[0].getAttribute('stroke')).toBe('#b91c1c');
    expect(paths[1].getAttribute('fill')).toBe('#ef4444');
    expect(paths[1].getAttribute('data-colored')).toBe('true');

    const unconditioned = tooth('teeth-11')!;
    expect(unconditioned.querySelectorAll('path')[1].getAttribute('fill')).toBe('currentColor');
    expect(unconditioned.querySelectorAll('path')[1].hasAttribute('data-colored')).toBe(false);
  });

  it('shows the condition legend only when showLabels is set', async () => {
    fixture.componentRef.setInput('teethConditions', [
      { label: 'caries', teeth: ['teeth-16'], fillColor: '#ef4444', outlineColor: '#b91c1c' },
    ]);
    await fixture.whenStable();
    expect(root().querySelector('.odontogram-legend')).toBeNull();

    fixture.componentRef.setInput('showLabels', true);
    await fixture.whenStable();

    const legend = root().querySelector('.odontogram-legend');
    expect(legend).not.toBeNull();
    expect(legend?.textContent).toContain('caries');
  });

  it('shows a tooltip on hover and hides it on leave', async () => {
    await fixture.whenStable();
    const tooth11 = tooth('teeth-11')!;

    tooth11.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
    await fixture.whenStable();

    const tooltip = root().querySelector('[role="tooltip"]');
    expect(tooltip).not.toBeNull();
    expect(tooltip?.textContent).toContain('Tooth: 11');
    expect(tooltip?.textContent).toContain('Central Incisor');

    tooth11.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false }));
    await fixture.whenStable();
    expect(root().querySelector('[role="tooltip"]')).toBeNull();
  });

  it('does not render a tooltip when showTooltip is false', async () => {
    fixture.componentRef.setInput('showTooltip', false);
    await fixture.whenStable();

    tooth('teeth-11')!.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
    await fixture.whenStable();

    expect(root().querySelector('[role="tooltip"]')).toBeNull();
  });

  it('renders native titles in the configured notation', async () => {
    fixture.componentRef.setInput('notation', 'Universal');
    await fixture.whenStable();

    expect(tooth('teeth-11')?.querySelector('title')?.textContent).toBe('8');

    fixture.componentRef.setInput('notation', 'Palmer');
    await fixture.whenStable();
    expect(tooth('teeth-11')?.querySelector('title')?.textContent).toBe('1UR');
  });

  it('emits ToothDetail payloads typed with all notations', async () => {
    let lastSelection: ToothDetail[] = [];
    component.selectionChange.subscribe((selection) => (lastSelection = selection));
    await fixture.whenStable();

    await click(tooth('teeth-48') ?? tooth('teeth-41')!);

    expect(lastSelection).toHaveLength(1);
    expect(lastSelection[0].notations.fdi).toBeTruthy();
    expect(lastSelection[0].notations.universal).toBeTruthy();
    expect(lastSelection[0].notations.palmer).toBeTruthy();
    expect(lastSelection[0].type).not.toBe('Unknown');
  });
});

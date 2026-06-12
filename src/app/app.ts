import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { OdontogramComponent } from '../lib/odontogram/odontogram.component';
import { ToothDetail } from '../lib/models/tooth-detail.model';

@Component({
  selector: 'app-root',
  imports: [OdontogramComponent, JsonPipe],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('ng-odontogram');
  protected readonly selectedTeeth = signal<ToothDetail[]>([]);

  protected onSelectionChange(selected: ToothDetail[]): void {
    this.selectedTeeth.set(selected);
  }
}

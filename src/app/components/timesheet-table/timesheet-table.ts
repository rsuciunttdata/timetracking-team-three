import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, effect, inject, Signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { AddEditModal } from '../add-edit-modal/add-edit-modal';
import { TimesheetEntry, TimeSheetService } from '../../services/timesheet.service';

@Component({
  selector: 'app-timesheet-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,

  ],
  templateUrl: './timesheet-table.html',
  styleUrl: './timesheet-table.css'
})
export class TimesheetTable {
  columns: string[] = ['date', 'startTime', 'endTime', 'breakDuration', 'workedTime', 'status', 'actions'];

  private timesheetService = inject(TimeSheetService);
  private dialog = inject(MatDialog);

  timesheetEntries: Signal<TimesheetEntry[]> = this.timesheetService.getEntries();

  constructor() {
    // Reactive effect to log changes (optional)
    effect(() => {
      console.log('Entries changed:', this.timesheetEntries());
    });

    // Load data initially
    this.timesheetService.loadData();
  }

  getWorkedTime(entry: TimesheetEntry): string {
    const [startHour, startMin] = entry.startTime.split(':').map(Number);
    const [endHour, endMin] = entry.endTime.split(':').map(Number);
    const [breakHour, breakMin] = entry.breakDuration.split(':').map(Number);

    const totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin) - (breakHour * 60 + breakMin);
    const h = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
    const m = (totalMinutes % 60).toString().padStart(2, '0');

    return `${h}:${m}`;
  }

  onEdit(entry: TimesheetEntry) {
    this.dialog.open(AddEditModal, {
      data: entry,
      width: '600px',
      panelClass: 'custom-dialog-container'
    });
  }

  onAdd() {
    const dialogRef = this.dialog.open(AddEditModal, {
      data: null,
      width: '600px',
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      console.log('Dialog closed with result:', result);
      if (result === 'saved') {
        await this.timesheetService.loadData();
      }
    });
  }

  onDelete(id: string) {
    console.log('Delete', id);
  }
}

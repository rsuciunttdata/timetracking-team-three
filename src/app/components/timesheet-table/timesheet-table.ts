import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule, DateRange } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { AddEditModal } from '../add-edit-modal/add-edit-modal';
import { FormsModule } from '@angular/forms';
import { TimesheetEntry, TimeSheetService } from '../../services/timesheet.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-timesheet-table',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatButtonModule,
    MatIconModule, MatFormFieldModule,
    MatInputModule, MatDatepickerModule, MatNativeDateModule, MatProgressSpinnerModule
  ],
  templateUrl: './timesheet-table.html',
  styleUrl: './timesheet-table.css'
})
export class TimesheetTable implements OnInit {
  private timeSheetService = inject(TimeSheetService);

  entries = this.timeSheetService.getEntries();

  selectedRange = signal<DateRange<Date>>(new DateRange<Date>(null, null));

  columns: string[] = ['date', 'startTime', 'endTime', 'breakDuration', 'workedTime', 'status', 'actions'];

  isLoading = signal(true);

  timesheetEntries: TimesheetEntry[] = [];
  constructor(private dialog: MatDialog, private timesheetService: TimeSheetService,) {
  }


  async ngOnInit() {
    this.isLoading.set(true);

    try {
      await this.timeSheetService.loadData();
      const today = new Date();
      const day = today.getDay();
      const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(today.setDate(diffToMonday));
      const sunday = new Date(new Date(monday).setDate(monday.getDate() + 6));
      this.selectedRange.set(new DateRange(monday, sunday));

    } finally {
      this.isLoading.set(false);
    }
  }


  filteredEntries = computed(() => {
    const range = this.selectedRange();
    if (!range.start || !range.end) return [];

    const dateList = this.getDatesInRange(range.start, range.end);

    console.log('Selected Range:', range.start, 'to', range.end);
    console.log('Date List:', dateList);

    return dateList.map(dateStr => {
      const normalizedDateStr = new Date(dateStr).toISOString().split('T')[0];

      const entry = this.entries().find(e => {
        const entryDateStr = new Date(e.date).toISOString().split('T')[0];
        return entryDateStr === normalizedDateStr;
      });

      if (entry) return entry;

      return {
        id: '',
        date: normalizedDateStr,
        startTime: '',
        endTime: '',
        breakDuration: '',
        status: '',
      };
    });
  });


  getWorkedTime(entry: TimesheetEntry): string {
    if (!entry.startTime || !entry.endTime) return '00:00';

    const [startHour, startMin] = entry.startTime.split(':').map(Number);
    const [endHour, endMin] = entry.endTime.split(':').map(Number);

    let breakHour = 0;
    let breakMin = 0;

    if (entry.breakDuration && entry.breakDuration.includes(':')) {
      [breakHour, breakMin] = entry.breakDuration.split(':').map(Number);
    }
    const totalMinutes =
      (endHour * 60 + endMin) - (startHour * 60 + startMin) - (breakHour * 60 + breakMin);
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
      console.log('Dialog closed with result:', result); //  log
      if (result === 'saved') {
        console.log('Reloading timesheet data...');
        await this.timesheetService.loadData();
        this.timesheetEntries = this.timesheetService.getEntries()(); //  important!
        console.log('Updated timesheet entries:', this.timesheetEntries);
      }
    });
  }

  onDelete(id: string) {
    console.log('Delete', id);
  }

  getDatesInRange(start: Date, end: Date): string[] {
    const dates: string[] = [];
    const current = new Date(start.getFullYear(), start.getMonth(), start.getDate()); // clone, clear time
    const final = new Date(end.getFullYear(), end.getMonth(), end.getDate());         // clear time

    while (current <= final) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  selectedDate = signal<Date | null>(null);

  onCalendarDateSelect(date: Date | null) {
    if (!date) return;

    const day = date.getDay(); 
    const monday = new Date(date);
    monday.setDate(date.getDate() - day );

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    this.selectedRange.set(new DateRange(monday, sunday));
    this.selectedDate.set(date);
  }



  dateClass = (d: Date) => {
    const range = this.selectedRange();
    if (!range.start || !range.end) return '';

    const time = d.getTime();
    const startTime = range.start.setHours(0, 0, 0, 0);
    const endTime = range.end.setHours(0, 0, 0, 0);

    return (time >= startTime && time <= endTime) ? 'selected-range' : '';
  };

  isWeekend(dateStr: string): boolean {
    const day = new Date(dateStr).getDay();
    return day === 0 || day === 6;
  }
}

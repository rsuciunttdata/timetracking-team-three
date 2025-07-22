import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { AddEditModal } from '../add-edit-modal/add-edit-modal';

export interface TimesheetEntry {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  breakDuration: string;
  status: 'editat' | 'trimis';
}

@Component({
  selector: 'app-timesheet-table',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule],
  templateUrl: './timesheet-table.html',
  styleUrl: './timesheet-table.css'
})
export class TimesheetTable {
  columns: string[] = ['date', 'startTime', 'endTime', 'breakDuration', 'workedTime', 'status', 'actions'];

  // dummy data
  timesheetEntries: TimesheetEntry[] = [
    {
      id: '1',
      date: '2025-06-27',
      startTime: '08:00',
      endTime: '16:00',
      breakDuration: '00:30',
      status: 'trimis'
    }
  ];

  constructor(private dialog: MatDialog) {
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
   console.log('Editing entry:', entry); 
     this.dialog.open(AddEditModal, {
      data: entry,
      width: '600px',
      panelClass: 'custom-dialog-container' 
    });
  }

   onAdd() {
    this.dialog.open(AddEditModal, {
      data: null,
      width: '600px',
      panelClass: 'custom-dialog-container'
    });
  }

  onDelete(id: string) {
    
    console.log('Delete', id);
  }
}

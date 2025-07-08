import { Component, Inject } from '@angular/core';
import { TimesheetEntry } from '../timesheet-table/timesheet-table';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-add-edit-modal',
  imports: [],
  templateUrl: './add-edit-modal.html',
  styleUrl: './add-edit-modal.css'
})
export class AddEditModal {
  isEdit = false; 

  constructor(@Inject(MAT_DIALOG_DATA) public data: TimesheetEntry | null){
    this.isEdit = !!data;
  }
}

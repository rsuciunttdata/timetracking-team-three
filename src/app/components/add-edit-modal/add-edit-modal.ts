import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TimesheetEntry, TimeSheetService } from '../../services/timesheet.service';
@Component({
  selector: 'app-add-edit-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-edit-modal.html',
  styleUrl: './add-edit-modal.css'
})
export class AddEditModal {
  isEdit = false;
  form: FormGroup;
  constructor(@Inject(MAT_DIALOG_DATA) public data: TimesheetEntry | null, private fb: FormBuilder, private dialogRef: MatDialogRef<AddEditModal>, private timesheetService: TimeSheetService) {
    console.log('MODAL opened with data:', data); 
    this.isEdit = !!data;
    this.form = this.fb.group({
      date: [data?.date || ''],
      startTime: [data?.startTime || ''],
      endTime: [data?.endTime || ''],
      breakDuration: [data?.breakDuration || '']
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

 async onSubmit() {
    if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  try {
    await this.timesheetService.addEntry(this.form.value);
    this.dialogRef.close('saved'); 
  } catch (err) {
    console.error('Eroare la salvare:', err);
    
  }
    console.log('Form submitted:', this.form.value);
    this.dialogRef.close(this.form.value);
  }


}

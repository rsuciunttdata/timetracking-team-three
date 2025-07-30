import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, } from '@angular/forms';
import { CommonModule, } from '@angular/common';
import { TimesheetEntry, TimeSheetService } from '../../services/timesheet.service';
import { ValidationMessage } from "../validation-message/validation-message";
@Component({
  selector: 'app-add-edit-modal',
  imports: [CommonModule, ReactiveFormsModule, ValidationMessage],
  templateUrl: './add-edit-modal.html',
  styleUrl: './add-edit-modal.css'
})
export class AddEditModal {
  isEdit = false;
  form: FormGroup;
  validationMessage = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: TimesheetEntry | null, private fb: FormBuilder, private dialogRef: MatDialogRef<AddEditModal>, private timesheetService: TimeSheetService) {
    console.log('MODAL opened with data:', data);
    this.isEdit = !!data;

    this.form = this.fb.group({
      date: [data?.date || '', Validators.required],
      startTime: [data?.startTime || '', Validators.required],
      endTime: [data?.endTime || '', Validators.required],
      breakDuration: [data?.breakDuration || '', Validators.required]
    });

  }

  validateTimeRange(): boolean {
    const start = this.form.get('startTime')?.value;
    const end = this.form.get('endTime')?.value;

    if (!start || !end) return true;

    const startDate = new Date(`1970-01-01T${start}`);
    const endDate = new Date(`1970-01-01T${end}`);

    return endDate > startDate;
  }

  onCancel() {
    this.dialogRef.close();
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.validationMessage = 'Please complete all required fields.';
      return;
    }

    const formData = this.form.value;

    console.log('Form submission:', formData);

    const breakVal = this.form.get('breakDuration')?.value;

    if (!this.isValidTimeFormat(breakVal)) {
      this.validationMessage = 'Break duration must be in hh:mm format (e.g. 01:30)';
      return;
    }

    if (!this.validateTimeRange()) {
      this.validationMessage = 'End time must be after start time.';
      return;
    }

    try {
      if (this.isEdit && this.data?.id != null) {

        await this.timesheetService.updateEntry(this.data.id, formData);
      } else {

        await this.timesheetService.addEntry(formData);
      }

      this.dialogRef.close('saved');
    } catch (err) {
      console.error('Eroare la salvare:', err);
      this.validationMessage = 'Unexpected error. Please try again.';
    }
  }

  private isValidTimeFormat(value: string): boolean {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
  }

  isBreakFormatValid(): boolean {
    const value = this.form.get('breakDuration')?.value;
    if (!value) return true;
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
  }

}

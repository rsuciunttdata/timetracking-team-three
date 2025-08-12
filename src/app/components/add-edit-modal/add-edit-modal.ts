import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, } from '@angular/forms';
import { CommonModule, } from '@angular/common';
import { TimesheetEntry, TimeSheetService } from '../../services/timesheet.service';
import { ValidationMessage } from "../validation-message/validation-message";
import { workedTimeValidator } from '../custom-validators/custom-validators';
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
    }, {
      updateOn: 'blur',
      validators: [workedTimeValidator()]
    });
    if (this.isEdit) {
      this.form.get('date')?.disable();
    }
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
      this.showValidationMessage('Please complete all required fields.');
      return;
    }

    const formData = this.form.getRawValue();

    console.log('Form submission:', formData);

    const selectedDateStr = new Date(formData.date).toISOString().split('T')[0];

    if (!this.isEdit) {
      const existingEntry = this.timesheetService.getEntries()().find(entry => {
        const entryDateStr = new Date(entry.date).toISOString().split('T')[0];
        return entryDateStr === selectedDateStr &&
          (entry.startTime || entry.endTime || entry.breakDuration);
      });

      if (existingEntry) {
        this.showValidationMessage('A timesheet already exists for this date. Please edit it instead.');
        return;
      }
    }

    const breakVal = this.form.get('breakDuration')?.value;

    if (!this.isValidTimeFormat(breakVal)) {
      this.showValidationMessage('Break duration must be in hh:mm format (e.g. 01:30)');
      return;
    }

    if (!this.validateTimeRange()) {
      this.showValidationMessage('End time must be after start time.');
      return;
    }

    // const timeValidationError = this.validateWorkedTimeLogic();
    // if (timeValidationError) {
    //   this.validationMessage = timeValidationError;
    //   return;
    // }

    try {
      if (this.isEdit && this.data?.date != null) {

        await this.timesheetService.updateEntry(this.data.date, formData);
      } else {

        await this.timesheetService.addEntry(formData);
      }

      this.dialogRef.close('saved');
    } catch (err) {
      console.error('Eroare la salvare:', err);
      this.showValidationMessage('Unexpected error. Please try again.');
    }
  }

  showValidationMessage(msg: string) {
    this.validationMessage = '';
    setTimeout(() => {
      this.validationMessage = msg;
    }, 0);
  }

  private isValidTimeFormat(value: string): boolean {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
  }

  isBreakFormatValid(): boolean {
    const value = this.form.get('breakDuration')?.value;
    if (!value) return true;
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
  }

  // private validateWorkedTimeLogic(): string | null {
  //   const start = this.form.get('startTime')?.value;
  //   const end = this.form.get('endTime')?.value;
  //   const breakVal = this.form.get('breakDuration')?.value;

  //   if (!start || !end || !breakVal) return 'Missing time fields.';

  //   const [sh, sm] = start.split(':').map(Number);
  //   const [eh, em] = end.split(':').map(Number);
  //   const [bh, bm] = breakVal.split(':').map(Number);

  //   const startMinutes = sh * 60 + sm;
  //   const endMinutes = eh * 60 + em;
  //   const breakMinutes = bh * 60 + bm;

  //   const totalSpan = endMinutes - startMinutes;

  //   if (breakMinutes >= totalSpan) {
  //     return 'Break time cannot exceed or equal total shift time.';
  //   }

  //   return null;
  // }

}

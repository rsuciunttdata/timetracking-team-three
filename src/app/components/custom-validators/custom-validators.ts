import { Component } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-custom-validators',
  imports: [],
  templateUrl: './custom-validators.html',
  styleUrl: './custom-validators.css'
})
export class CustomValidators {

}
export function workedTimeValidator(): ValidatorFn {
  return (group: AbstractControl): { [key: string]: any } | null => {
    const start = group.get('startTime')?.value;
    const end = group.get('endTime')?.value;
    const breakVal = group.get('breakDuration')?.value;

    if (!start || !end || !breakVal) return null;

    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const [bh, bm] = breakVal.split(':').map(Number);

    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;
    const breakMinutes = bh * 60 + bm;

    const totalSpan = endMinutes - startMinutes;

    return breakMinutes >= totalSpan ? { breakTooLong: true } : null;
  };
}
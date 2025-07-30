import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-validation-message',
  imports: [],
  templateUrl: './validation-message.html',
  styleUrl: './validation-message.css'
})
export class ValidationMessage {
 @Input() message = '';
}

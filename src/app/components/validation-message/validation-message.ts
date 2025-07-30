import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-validation-message',
  imports: [],
  templateUrl: './validation-message.html',
  styleUrl: './validation-message.css'
})
export class ValidationMessage implements OnChanges {
  @Input() message = '';

  visible = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['message']) {
      if (this.message) {
        this.visible = true;
        setTimeout(() => this.visible = false, 3000); 
      } else {
        this.visible = false;
      }
    }
  }
}

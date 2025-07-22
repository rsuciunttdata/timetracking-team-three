import { Component } from '@angular/core';
import {
  trigger,
  transition,
  style,
  animate,
} from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('4000ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class Landing {

}

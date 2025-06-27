import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TimesheetTable } from "./components/timesheet-table/timesheet-table";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TimesheetTable],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'time-tracking';
}

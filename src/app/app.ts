import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TimesheetTable } from "./components/timesheet-table/timesheet-table";
import { Header } from "./components/header/header";
import { Footer } from "./components/footer/footer";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'time-tracking';
}

import { Routes } from '@angular/router';
import { Landing } from './pages/landing/landing';
import { Login } from './pages/login/login';
import { TimesheetTable } from './components/timesheet-table/timesheet-table';

export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'login', component: Login },
  { path: 'dashboard', component: TimesheetTable },
  { path: '**', redirectTo: '' }
];
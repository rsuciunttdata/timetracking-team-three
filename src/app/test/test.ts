import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { TimeSheetService } from '../services/timesheet.service';

@Component({
  selector: 'app-test',
  imports: [],
  templateUrl: './test.html',
  styleUrl: './test.css'
})
export class Test {
  constructor(private authService:AuthService, private timeSheetService:TimeSheetService) { }

  async ngOnInit() {
    const success = await this.authService.login('aschiop2002@yahoo.com', 'password123');
    console.log('Login success:', success);
    console.log('Current user:', this.authService.getUser()());


    console.log('User ID:', this.authService.getUserId());

    await this.timeSheetService.loadData();
    console.log('Initial entries:', this.timeSheetService.getEntries()());

     await this.timeSheetService.addEntry({
      date: '2023-07-05',
      startTime: '08:00',
      endTime: '16:00',
      breakDuration: '00:30',
      status: 'draft'
    });
    console.log('After add:', this.timeSheetService.getEntries()());

    const entryToUpdate = this.timeSheetService.getEntries()()[0];
    if (entryToUpdate) {
      await this.timeSheetService.updateEntry(entryToUpdate.date, { status: 'draft' });
      console.log('After update:', this.timeSheetService.getEntries()());
    }

    const entryToDelete = this.timeSheetService.getEntries()()[0];
    if (entryToDelete) {
      await this.timeSheetService.deleteEntry(entryToDelete.date);
      console.log('After delete:', this.timeSheetService.getEntries()());
    }

  }
}
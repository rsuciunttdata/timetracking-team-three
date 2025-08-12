import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

export interface TimesheetEntry {
  id: number;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  breakDuration: string;
  status: 'draft' | 'submitted';
}

@Injectable({ providedIn: 'root' })
export class TimeSheetService {
  private entries = signal<TimesheetEntry[]>([]);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private get currentUserId(): string | null {
    const USE_MOCK = true
    return USE_MOCK ? '5c421851-df7e-440f-a93e-a4d98576ef7f' : this.authService.getUserId();
  }

  async loadData(): Promise<void> {
    const userId = this.currentUserId;
    if (userId === null) return;

    const result = await firstValueFrom(
      this.http.get<TimesheetEntry[]>(`/api/timesheets?userId=${userId}`)
    );
    this.entries.set(result);
  }

  getEntries() {
    return this.entries.asReadonly();
  }

  async addEntry(entry: Omit<TimesheetEntry, 'id' | 'userId'>) {
    const userId = this.currentUserId;
    if (userId === null) return;

    const result = await firstValueFrom(
      this.http.post<TimesheetEntry>('/api/timesheets', { ...entry, userId })
    );
    this.entries.update(e => [...e, result]);
  }

  async updateEntry(date: string, updated: Partial<TimesheetEntry>) {
    const result = await firstValueFrom(
      this.http.put<TimesheetEntry>(`/api/timesheets/${date}`, updated)
    );
    this.entries.update(list =>
      list.map(e => (e.date === date ? result : e))
    );
  }

  async deleteEntry(date: string) {
    await firstValueFrom(this.http.delete(`/api/timesheets/${date}`));
    this.entries.update(list => list.filter(e => e.date !== date));
  }
}

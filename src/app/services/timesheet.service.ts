import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

export interface TimesheetEntry {
  id: number;
  userId: number;
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
  ) {}

  private get currentUserId(): number | null {
    const USE_MOCK = true
    return USE_MOCK ? 2 : this.authService.getUserId();
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

  async updateEntry(id: number, updated: Partial<TimesheetEntry>) {
    const result = await firstValueFrom(
      this.http.put<TimesheetEntry>(`/api/timesheets/${id}`, updated)
    );
    this.entries.update(list =>
      list.map(e => (e.id === id ? result : e))
    );
  }

  async deleteEntry(id: number) {
    await firstValueFrom(this.http.delete(`/api/timesheets/${id}`));
    this.entries.update(list => list.filter(e => e.id !== id));
  }
}

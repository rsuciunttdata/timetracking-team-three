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
  private weekEntries = signal<TimesheetEntry[]>([]);

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

  private toIsoLocal(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  async loadByWeek(date: Date): Promise<void> {
    const userId = this.currentUserId;
    if (!userId) return;

    const iso = this.toIsoLocal(date);
    const { from, to } = this.getWeekRange(iso);

    const result = await firstValueFrom(
      this.http.get<TimesheetEntry[]>(
        `/api/timesheets?userId=${userId}&from=${from}&to=${to}`
      )
    );
    this.weekEntries.set(result ?? []);
  }

  getWeekRange(dateStr: string): { from: string, to: string } {
    const date = new Date(dateStr);
    const day = date.getDay();
    const sunday = new Date(date);
    sunday.setDate(date.getDate() - day);

    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);

    const toIso = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    return { from: toIso(sunday), to: toIso(saturday) };
  }

  getEntries() {
    return this.entries.asReadonly();
  }

  getWeekEntries() {
    return this.weekEntries.asReadonly();
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

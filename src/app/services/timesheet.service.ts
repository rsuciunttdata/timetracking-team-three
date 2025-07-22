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

const USE_MOCK = true;
const STORAGE_KEY = 'mock-timesheets';

@Injectable({ providedIn: 'root' })
export class TimeSheetService {
  private entries = signal<TimesheetEntry[]>([]);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private get currentUserId(): number | null {
    if (USE_MOCK) return 2;
    return this.authService.getUserId();
  }

  private loadFromStorage(): TimesheetEntry[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private saveToStorage(allEntries: TimesheetEntry[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allEntries));
  }

  async loadData(): Promise<void> {
    const userId = 2;
    if (userId === null) return;

    if (USE_MOCK) {
      const allEntries = this.loadFromStorage();
      const userEntries = allEntries.filter(e => e.userId === userId);
      this.entries.set(userEntries);
    } else {
      try {
        const result = await firstValueFrom(
          this.http.get<TimesheetEntry[]>(`/api/timesheets?userId=${userId}`)
        );
        this.entries.set(result);
      } catch (err) {
        console.error('Failed to load timesheet from backend:', err);
      }
    }
  }

  getEntries() {
    return this.entries.asReadonly();
  }

  async addEntry(entry: Omit<TimesheetEntry, 'id' | 'userId'>) {
    const userId = this.currentUserId;
    if (userId === null) return;

    if (USE_MOCK) {
      const allEntries = this.loadFromStorage();
      const newEntry: TimesheetEntry = {
        ...entry,
        id: Date.now(),
        userId,
        status: 'draft'
      };
      const updatedEntries = [...allEntries, newEntry];
      this.saveToStorage(updatedEntries);

      // Actualizează doar pentru user-ul curent în Signal
      const userEntries = updatedEntries.filter(e => e.userId === userId);
      this.entries.set(userEntries);
    } else {
      try {
        const result = await firstValueFrom(
          this.http.post<TimesheetEntry>('/api/timesheets', { ...entry, userId })
        );
        this.entries.update(e => [...e, result]);
      } catch (err) {
        console.error('Failed to add entry to backend:', err);
      }
    }
  }

  async updateEntry(id: number, updated: Partial<TimesheetEntry>) {
    if (USE_MOCK) {
      const allEntries = this.loadFromStorage();
      const newList = allEntries.map(e => (e.id === id ? { ...e, ...updated } : e));
      this.saveToStorage(newList);

      const userEntries = newList.filter(e => e.userId === this.currentUserId);
      this.entries.set(userEntries);
    } else {
      try {
        const result = await firstValueFrom(
          this.http.put<TimesheetEntry>(`/api/timesheets/${id}`, updated)
        );
        this.entries.update(list =>
          list.map(e => (e.id === id ? result : e))
        );
      } catch (err) {
        console.error('Failed to update entry:', err);
      }
    }
  }

  async deleteEntry(id: number) {
    if (USE_MOCK) {
      const allEntries = this.loadFromStorage();
      const filtered = allEntries.filter(e => e.id !== id);
      this.saveToStorage(filtered);

      const userEntries = filtered.filter(e => e.userId === this.currentUserId);
      this.entries.set(userEntries);
    } else {
      try {
        await firstValueFrom(this.http.delete(`/api/timesheets/${id}`));
        this.entries.update(list => list.filter(e => e.id !== id));
      } catch (err) {
        console.error('Failed to delete entry:', err);
      }
    }
  }
}

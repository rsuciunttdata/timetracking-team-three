import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, of, from, throwError } from 'rxjs';
import { delay, catchError } from 'rxjs/operators';
import { TimesheetEntry } from '../services/timesheet.service';

const USE_MOCK = true;
const STORAGE_KEY = 'mock-timesheets';
const MOCK_JSON_PATH = '/timesheet.mock.json';
const MOCK_USER_ID = '5c421851-df7e-440f-a93e-a4d98576ef7f'; 
const MOCK_DELAY = 300; 

function getStored(): TimesheetEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
}

function setStored(data: TimesheetEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
}

function mergeJsonAndStorage(json: TimesheetEntry[], storage: TimesheetEntry[]): TimesheetEntry[] {
  const combined = [...json, ...storage];
  const unique = new Map<number, TimesheetEntry>();
  for (const entry of combined) {
    unique.set(entry.id, entry);
  }
  const merged = Array.from(unique.values());
  setStored(merged);
  return merged;
}

@Injectable()
export class TimesheetInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!USE_MOCK || !this.isTimesheetRequest(req.url)) {
      return next.handle(req);
    }

    try {
      return this.handleMockRequest(req).pipe(
        delay(MOCK_DELAY),
        catchError(error => {
          console.error('Mock request error:', error);
          return throwError(() => new HttpErrorResponse({
            error: error.message || 'Mock request failed',
            status: 500,
            statusText: 'Internal Server Error'
          }));
        })
      );
    } catch (error) {
      return throwError(() => new HttpErrorResponse({
        error: 'Mock interceptor error',
        status: 500,
        statusText: 'Internal Server Error'
      }));
    }
  }

  private isTimesheetRequest(url: string): boolean {
    return url.includes('/api/timesheets');
  }

  private handleMockRequest(req: HttpRequest<any>): Observable<HttpEvent<any>> {
    const method = req.method;
    const url = req.url;

    switch (method) {
      case 'GET':
        return this.handleGet(req);
      case 'POST':
        return this.handlePost(req);
      case 'PUT':
        return this.handlePut(req, url);
      case 'DELETE':
        return this.handleDelete(req, url);
      default:
        return throwError(() => new Error(`Unsupported method: ${method}`));
    }
  }

  private handleGet(req: HttpRequest<any>): Observable<HttpEvent<any>> {
    const userId = this.extractUserIdFromRequest(req);
    const entries = getStored();

    console.log('GET for userId:', userId, 'Found entries:', entries.length);

    if (entries.length === 0) {
      return from(
        fetch(MOCK_JSON_PATH)
          .then(res => {
            if (!res.ok) {
              throw new Error(`Failed to load mock data: ${res.status}`);
            }
            return res.json();
          })
          .then((jsonEntries: TimesheetEntry[]) => {
            const merged = mergeJsonAndStorage(jsonEntries, []);
            const userEntries = merged.filter(e => e.userId === userId);
            return new HttpResponse({ status: 200, body: userEntries });
          })
          .catch(error => {
            console.warn('Could not load mock JSON, using empty array:', error);
            return new HttpResponse({ status: 200, body: [] });
          })
      );
    } else {

      const userEntries = entries.filter(e => e.userId === userId);
      return of(new HttpResponse({ status: 200, body: userEntries }));
    }
  }

  private handlePost(req: HttpRequest<any>): Observable<HttpEvent<any>> {
    const requestBody = req.body;
    
    if (!requestBody) {
      return throwError(() => new Error('Request body is required for POST'));
    }

    const userId = requestBody.userId ?? MOCK_USER_ID;
    const entries = getStored();
    
    if (!this.isValidTimesheetEntry(requestBody)) {
      return throwError(() => new Error('Invalid timesheet entry data'));
    }

    const newEntry: TimesheetEntry = {
      ...requestBody,
      id: this.generateId(),
      userId,
      status: requestBody.status || 'draft'
    };

    const updated = [...entries, newEntry];
    setStored(updated);

    console.log('POST: Created entry with ID:', newEntry.id);
    return of(new HttpResponse({ status: 201, body: newEntry }));
  }

  private handlePut(req: HttpRequest<any>, url: string): Observable<HttpEvent<any>> {
    const date = this.extractDateFromUrl(url);
    const updatedData = req.body;

    if (!updatedData) {
      return throwError(() => new Error('Request body is required for PUT'));
    }

    const entries = getStored();
    const entryIndex = entries.findIndex(e => e.date === date);

    if (entryIndex === -1) {
      return throwError(() => new Error(`Timesheet entry with date ${date} not found`));
    }

    const updatedEntry = { ...entries[entryIndex], ...updatedData };
    entries[entryIndex] = updatedEntry;
    setStored(entries);

    console.log('PUT: Updated entry with date:', date);
    return of(new HttpResponse({ status: 200, body: updatedEntry }));
  }

  private handleDelete(req: HttpRequest<any>, url: string): Observable<HttpEvent<any>> {
    const date = this.extractDateFromUrl(url);
    const entries = getStored();
    
    const initialLength = entries.length;
    const filtered = entries.filter(e => e.date !== date);

    if (filtered.length === initialLength) {
      return throwError(() => new Error(`Timesheet entry with date ${date} not found`));
    }

    setStored(filtered);

    console.log('DELETE: Removed entry with date:', date);
    return of(new HttpResponse({ status: 204, body: null }));
  }

  private extractUserIdFromRequest(req: HttpRequest<any>): string {
    const urlParts = req.url.split('?');
    if (urlParts.length > 1) {
      const params = new URLSearchParams(urlParts[1]);
      const userId = params.get('userId');
      if (userId) {
        return userId;
      }
    }

    const userIdParam = req.params.get('userId');
    if (userIdParam) {
      return userIdParam;
    }

   
    return MOCK_USER_ID;
  }

  private extractDateFromUrl(url: string): string {
  const parts = url.split('/');
  return parts[parts.length - 1].split('?')[0]; 
}

  private generateId(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  private isValidTimesheetEntry(entry: any): boolean {
    return (
      entry &&
      typeof entry.date === 'string' &&
      typeof entry.startTime === 'string' &&
      typeof entry.endTime === 'string' &&
      typeof entry.breakDuration === 'string'
    );
  }
}
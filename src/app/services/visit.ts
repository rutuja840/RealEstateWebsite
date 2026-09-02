import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VisitService {

  private apiUrl = 'https://localhost:7056/api/Visits';

  constructor(private http: HttpClient) {}

  schedule(visit: {
    propertyId: number;
    visitDate: string;
    notes?: string;
  }): Observable<any> {

    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(
      this.apiUrl,
      visit,
      { headers }
    );
  }

  createVisit(visit: {
    propertyId: number;
    visitDate: string;
    notes?: string;
  }): Observable<any> {

    return this.schedule(visit);
  }

  getVisitById(id: number): Observable<any> {

    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(
      `${this.apiUrl}/${id}`,
      { headers }
    );
  }
}
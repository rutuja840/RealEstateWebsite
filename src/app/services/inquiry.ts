import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Inquiry as InquiryModel, InquiryRequest } from '../models/inquiry';

@Injectable({
  providedIn: 'root',
})
export class InquiryService {
  private readonly apiUrl = `${environment.apiUrl}/Inquiries`;

  constructor(private http: HttpClient) {}

  create(request: InquiryRequest): Observable<InquiryModel> {
    return this.http.post<InquiryModel>(this.apiUrl, request);
  }

  getForAgent(agentId: number): Observable<InquiryModel[] | { data: InquiryModel[] }> {
    return this.http.get<InquiryModel[] | { data: InquiryModel[] }>(`${this.apiUrl}/agent/${agentId}`);
  }

  markRead(id: number): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/${id}/read`, {});
  }
}

export { InquiryService as Inquiry };

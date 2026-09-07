import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Favorite as FavoriteModel } from '../models/favorite';

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  private readonly apiUrl = `${environment.apiUrl}/Favorites`;

  constructor(private http: HttpClient) {}

  getFavorites(): Observable<FavoriteModel[] | { data: FavoriteModel[] }> {
    return this.http.get<FavoriteModel[] | { data: FavoriteModel[] }>(this.apiUrl);
  }

  add(propertyId: number): Observable<FavoriteModel> {
    return this.http.post<FavoriteModel>(`${this.apiUrl}/${propertyId}`, { propertyId });
  }

  remove(propertyId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${propertyId}`);
  }
}

export { FavoriteService as Favorite };

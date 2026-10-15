import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Unit, UnitRequest } from '../models/unit.model';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.bffBaseUrl}/api/catalog/units`;

  getAll(): Observable<Unit[]> {
    return this.http.get<Unit[]>(this.baseUrl);
  }

  create(request: UnitRequest): Observable<Unit> {
    return this.http.post<Unit>(this.baseUrl, request);
  }

  update(id: number, request: UnitRequest): Observable<Unit> {
    return this.http.put<Unit>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

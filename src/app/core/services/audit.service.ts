import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuditEvent, PageResponse } from '../models/audit-event.model';

export interface AuditFilters {
  usuario?: string;
  tipoEvento?: string;
  desde?: string;
  hasta?: string;
  page?: number;
  size?: number;
}

@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.bffBaseUrl}/api/audit`;

  search(filters: AuditFilters): Observable<PageResponse<AuditEvent>> {
    let params = new HttpParams()
      .set('page', String(filters.page ?? 0))
      .set('size', String(filters.size ?? 20));

    if (filters.usuario) params = params.set('usuario', filters.usuario);
    if (filters.tipoEvento) params = params.set('tipoEvento', filters.tipoEvento);
    if (filters.desde) params = params.set('desde', filters.desde);
    if (filters.hasta) params = params.set('hasta', filters.hasta);

    return this.http.get<PageResponse<AuditEvent>>(this.baseUrl, { params });
  }
}

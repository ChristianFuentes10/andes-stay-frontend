import { Component, inject, signal } from '@angular/core';
import { AuditService } from '../../core/services/audit.service';
import { AuditEvent } from '../../core/models/audit-event.model';

@Component({
  selector: 'app-audit',
  standalone: false,
  templateUrl: './audit.component.html',
  styleUrl: './audit.component.css',
})
export class AuditComponent {
  private readonly auditService = inject(AuditService);

  readonly events = signal<AuditEvent[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly page = signal(0);
  readonly totalPages = signal(0);

  usuario = '';
  tipoEvento = '';

  constructor() {
    this.load();
  }

  load(page = 0): void {
    this.loading.set(true);
    this.error.set(null);
    this.auditService
      .search({ usuario: this.usuario || undefined, tipoEvento: this.tipoEvento || undefined, page })
      .subscribe({
        next: (result) => {
          this.events.set(result.content);
          this.page.set(result.number);
          this.totalPages.set(result.totalPages);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar la auditoria. Revisa que el BFF y audit esten corriendo.');
          this.loading.set(false);
        },
      });
  }

  search(): void {
    this.load(0);
  }

  next(): void {
    if (this.page() + 1 < this.totalPages()) this.load(this.page() + 1);
  }

  prev(): void {
    if (this.page() > 0) this.load(this.page() - 1);
  }
}

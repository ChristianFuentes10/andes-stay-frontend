import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { CatalogService } from '../../core/services/catalog.service';
import { Unit, UnitRequest } from '../../core/models/unit.model';

const EMPTY_FORM: UnitRequest = {
  name: '',
  type: 'HABITACION',
  capacity: 1,
  pricePerNight: 0,
  available: true,
};

@Component({
  selector: 'app-catalog',
  standalone: false,
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css',
})
export class CatalogComponent {
  private readonly catalogService = inject(CatalogService);
  private readonly auth = inject(AuthService);

  readonly units = signal<Unit[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly editingId = signal<number | null>(null);
  readonly form = signal<UnitRequest>({ ...EMPTY_FORM });
  readonly showForm = signal(false);

  /** Unidad resaltada por el huésped al tocar su tarjeta (solo UI, no hay reserva aún). */
  readonly selectedId = signal<number | null>(null);

  /** Solo ADMIN puede crear/editar/eliminar unidades (igual que en el backend). */
  readonly isAdmin = this.auth.hasRole('ADMIN');

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.catalogService.getAll().subscribe({
      next: (units) => {
        this.units.set(units);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el catalogo. Revisa que el BFF y catalog esten corriendo.');
        this.loading.set(false);
      },
    });
  }

  updateForm<K extends keyof UnitRequest>(field: K, value: UnitRequest[K]): void {
    this.form.set({ ...this.form(), [field]: value });
  }

  newUnit(): void {
    this.editingId.set(null);
    this.form.set({ ...EMPTY_FORM });
    this.showForm.set(true);
  }

  startEdit(unit: Unit): void {
    this.editingId.set(unit.id);
    this.form.set({
      name: unit.name,
      type: unit.type,
      capacity: unit.capacity,
      pricePerNight: unit.pricePerNight,
      available: unit.available,
    });
    this.showForm.set(true);
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.form.set({ ...EMPTY_FORM });
    this.showForm.set(false);
  }

  save(): void {
    const id = this.editingId();
    const request = this.form();
    const action$ = id != null
      ? this.catalogService.update(id, request)
      : this.catalogService.create(request);

    action$.subscribe({
      next: () => {
        this.cancelEdit();
        this.load();
      },
      error: () => this.error.set('No se pudo guardar la unidad. ¿Tienes rol ADMIN?'),
    });
  }

  remove(unit: Unit): void {
    if (!confirm(`¿Eliminar "${unit.name}"?`)) return;
    this.catalogService.delete(unit.id).subscribe({
      next: () => this.load(),
      error: () => this.error.set('No se pudo eliminar la unidad. ¿Tienes rol ADMIN?'),
    });
  }

  /** Selecciona/deselecciona una tarjeta al hacer click sobre ella. */
  toggleSelect(unit: Unit): void {
    this.selectedId.set(this.selectedId() === unit.id ? null : unit.id);
  }

  typeLabel(type: string): string {
    switch (type) {
      case 'HABITACION': return 'Habitación';
      case 'CABANA': return 'Cabaña';
      case 'LODGE': return 'Lodge';
      default: return type;
    }
  }
}

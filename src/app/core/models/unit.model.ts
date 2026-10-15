export interface Unit {
  id: number;
  name: string;
  type: string; // HABITACION, CABANA, LODGE
  capacity: number;
  pricePerNight: number;
  available: boolean;
}

export type UnitRequest = Omit<Unit, 'id'>;

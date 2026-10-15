export interface AuditEvent {
  id: number;
  eventType: string;
  aggregateId: string;
  actor: string;
  occurredAt: string;
  receivedAt: string;
  traceId: string;
  correlationId: string;
}

export interface PageResponse<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface Visit {
	id?: number;
	propertyId: number;
	name: string;
	email: string;
	phone: string;
	preferredVisitDate: string;
	message?: string;
	status?: string;
}

export interface VisitRequest {
  propertyId: number;
  visitDate: string;
  notes: string;
}
export interface Inquiry {
	id?: number;
	propertyId: number;
	propertyTitle?: string;
	name: string;
	email: string;
	phone?: string;
	phoneNumber?: string;
	userId?: number;
	preferredVisitDate?: string;
	isRead?: boolean;
	message: string;
	createdAt?: string;
}

export type InquiryRequest = Omit<Inquiry, 'id' | 'createdAt'>;

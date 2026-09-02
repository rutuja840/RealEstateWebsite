export interface Favorite {
	id: number;
	propertyId: number;
	userId?: number;
	property?: Property;
	createdAt?: string;
}

import { Property } from './property';

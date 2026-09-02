export interface Property {

  id: number;

  agentId?: number;
  agentName?: string;

  propertyTypeId?: number;
  propertyType?: string;
  propertyTypeName?: string;

  title: string;
  description: string;

  price: number;

  location?: string;
  city?: string;
  address?: string;

  bedrooms: number;
  bathrooms: number;

  area: number;
  areaUnit?: string;

  isFurnished?: boolean;
  isReadyToMove?: boolean;
  isActive?: boolean;

  latitude: number;
  longitude: number;

  createdAt?: string;

  imageUrl?: string;
  images?: string[];

  amenities?: string[];

  constructionStatus?: string;
  furnishedStatus?: string;
}


export interface PropertyFilters {

  location?: string;

  minPrice?: number;

  maxPrice?: number;

  propertyType?: string;

  bedrooms?: number;

  bathrooms?: number;

  area?: number;

  furnishedStatus?: string;

  constructionStatus?: string;
}
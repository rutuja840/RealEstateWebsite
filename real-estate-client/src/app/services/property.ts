
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  Observable,
  map,
  timeout
} from 'rxjs';

import {
  Property,
  PropertyFilters
} from '../models/property';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = '/api/Properties';


  
  // GET ALL PROPERTIES
  

  getAllProperties(): Observable<Property[]> {

    console.log('GET ALL PROPERTIES:', this.apiUrl);

    return this.http
      .get<any>(this.apiUrl)
      .pipe(
        timeout(10000),

        map(response => {

          console.log(
            'RAW PROPERTY API RESPONSE:',
            response
          );

          const properties =
            PropertyService.unwrapList(response);

          console.log(
            'UNWRAPPED PROPERTIES:',
            properties
          );

          return properties;
        })
      );
  }


 
  // GET PROPERTY BY ID
 

 getPropertyById(id: number): Observable<Property> {

  const url = `${this.apiUrl}/${id}`;

  console.log('GET PROPERTY BY ID URL:', url);

  return this.http
    .get<any>(url)
    .pipe(
      timeout({ first: 10000 }),

      map(response => {

        console.log(
          'RAW PROPERTY DETAILS RESPONSE:',
          response
        );

        const property =
          PropertyService.unwrapOne(response);

        console.log(
          'UNWRAPPED PROPERTY:',
          property
        );

        return property;
      })
    );
}

 
  // CREATE PROPERTY
 

  createProperty(property: any): Observable<any> {

    return this.http.post<any>(
      this.apiUrl,
      property
    );
  }


  
  // UPDATE PROPERTY
 

  updateProperty(
    id: number,
    property: any
  ): Observable<any> {

    return this.http.put<any>(
      `${this.apiUrl}/${id}`,
      property
    );
  }


 
  // DELETE PROPERTY
 

  deleteProperty(id: number): Observable<any> {

    return this.http.delete<any>(
      `${this.apiUrl}/${id}`
    );
  }


 
  // UPLOAD IMAGES
  

  uploadImages(
    propertyId: number,
    files: File[]
  ): Observable<any> {

    const formData = new FormData();

    for (const file of files) {

      formData.append(
        'images',
        file,
        file.name
      );
    }

    return this.http.post<any>(
      `${this.apiUrl}/${propertyId}/images`,
      formData
    );
  }


 
  // SEARCH PROPERTIES
 
searchProperties(
  filters: PropertyFilters
): Observable<Property[]> {

  let params = new HttpParams();

  if (filters.location?.trim()) {
    params = params.set(
      'location',
      filters.location.trim()
    );
  }

  if (
    filters.minPrice !== undefined &&
    filters.minPrice !== null
  ) {
    params = params.set(
      'minPrice',
      filters.minPrice.toString()
    );
  }

  if (
    filters.maxPrice !== undefined &&
    filters.maxPrice !== null
  ) {
    params = params.set(
      'maxPrice',
      filters.maxPrice.toString()
    );
  }

  if (filters.propertyType?.trim()) {
    params = params.set(
      'propertyType',
      filters.propertyType.trim()
    );
  }

  if (filters.bedrooms !== undefined) {
    params = params.set(
      'bedrooms',
      filters.bedrooms.toString()
    );
  }

  if (filters.bathrooms !== undefined) {
    params = params.set(
      'bathrooms',
      filters.bathrooms.toString()
    );
  }

  if (filters.area !== undefined) {
    params = params.set(
      'area',
      filters.area.toString()
    );
  }

  if (filters.furnishedStatus?.trim()) {
    params = params.set(
      'furnishedStatus',
      filters.furnishedStatus.trim()
    );
  }

  if (filters.constructionStatus?.trim()) {
    params = params.set(
      'constructionStatus',
      filters.constructionStatus.trim()
    );
  }

  console.log(
    'PROPERTY SEARCH URL:',
    `${this.apiUrl}/search?${params.toString()}`
  );

  return this.http
    .get<any>(
      `${this.apiUrl}/search`,
      { params }
    )
    .pipe(
      map(response => {

        console.log(
          'RAW SEARCH RESPONSE:',
          response
        );

        const properties =
          PropertyService.unwrapList(response);

        console.log(
          'UNWRAPPED SEARCH PROPERTIES:',
          properties
        );

        return properties;
      })
    );
}


  // UNWRAP LIST
 

  static unwrapList(
    response: any
  ): Property[] {

    // API:
    // [ {...}, {...} ]

    if (Array.isArray(response)) {
      return response;
    }


    // API:
    // { data: [...] }

    if (Array.isArray(response?.data)) {
      return response.data;
    }


    // API:
    // { items: [...] }

    if (Array.isArray(response?.items)) {
      return response.items;
    }


    // API:
    // { result: [...] }

    if (Array.isArray(response?.result)) {
      return response.result;
    }


    // API:
    // { properties: [...] }

    if (Array.isArray(response?.properties)) {
      return response.properties;
    }


    // API:
    // { data: { items: [...] } }

    if (
      Array.isArray(
        response?.data?.items
      )
    ) {

      return response.data.items;
    }


    // API:
    // { result: { items: [...] } }

    if (
      Array.isArray(
        response?.result?.items
      )
    ) {

      return response.result.items;
    }


    console.warn(
      'Unknown property API response format:',
      response
    );

    return [];
  }


  
  // UNWRAP SINGLE PROPERTY
 

 static unwrapOne(response: any): Property {

  console.log(
    'unwrapOne response:',
    response
  );

  if (!response) {
    throw new Error('Property not found.');
  }

  if (response.success === false) {
    throw new Error(
      response.message ?? 'Property not found.'
    );
  }

  // Direct property
  if (
    response.id !== undefined &&
    response.id !== null
  ) {
    return response as Property;
  }

  // { data: property }
  if (
    response.data &&
    response.data.id !== undefined
  ) {
    return response.data as Property;
  }

  // { result: property }
  if (
    response.result &&
    response.result.id !== undefined
  ) {
    return response.result as Property;
  }

  // { property: property }
  if (
    response.property &&
    response.property.id !== undefined
  ) {
    return response.property as Property;
  }

  console.error(
    'Unknown property response format:',
    response
  );

  throw new Error(
    'Property response does not contain a valid property.'
  );
}
}
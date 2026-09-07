import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';

import { Property, PropertyFilters } from '../../../models/property';
import { PropertyService } from '../../../services/property';
import { FavoriteService } from '../../../services/favorite';
import { AuthService } from '../../../services/auth';
import { PropertyMapComponent, MapMarker } from '../../../shared/property-map/property-map.component';

@Component({
  selector: 'app-property-list',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    PropertyMapComponent
  ],

  templateUrl: './property-list.html',
  styleUrl: './property-list.css'
})
export class PropertyList implements OnInit {

  private readonly propertyService = inject(PropertyService);
  private readonly favoriteService = inject(FavoriteService);
  private readonly authService = inject(AuthService);

  
  // FILTERS
 

  filters = {
    location: '',
    propertyType: '',
    minPrice: null as number | null,
    maxPrice: null as number | null,
    bedrooms: undefined as number | undefined,
    bathrooms: undefined as number | undefined,
    furnishedStatus: '',
    amenities: ''
  };

 
  // PAGE DATA
  

  properties: Property[] = [];

  showCompare = false;

  favorites = new Set<number>();

  loading = false;

  errorMessage = '';

  favoriteError = '';

  sortBy: 'newest' | 'price-low' | 'price-high' | 'area' = 'newest';
  viewMode: 'list' | 'map' = 'list';
  showFilters = true;
  compareIds = new Set<number>();
  quickViewProperty: Property | null = null;
  quickViewImageIndex = 0;

  get propertyList(): Property[] {
    return Array.isArray(this.properties) ? this.properties : [];
  }

  get displayedProperties(): Property[] {
    const filteredProperties = this.propertyList.filter(property => {
      const amenities = property.amenities ?? [];
      return !this.filters.amenities || amenities.some(amenity =>
        amenity.toLowerCase().includes(this.filters.amenities.toLowerCase())
      );
    });

    return [...filteredProperties].sort((first, second) => {
      if (this.sortBy === 'price-low') return first.price - second.price;
      if (this.sortBy === 'price-high') return second.price - first.price;
      if (this.sortBy === 'area') return second.area - first.area;
      return (Date.parse(second.createdAt ?? '') || 0) - (Date.parse(first.createdAt ?? '') || 0);
    });
  }

  get compareProperties(): Property[] {
    return this.propertyList.filter(property => this.compareIds.has(property.id));
  }

  get mapMarkers(): MapMarker[] {
    return this.displayedProperties
      .filter(property => property.latitude && property.longitude)
      .map(property => ({
        id: property.id,
        latitude: property.latitude,
        longitude: property.longitude,
        title: property.title
      }));
  }

  ngOnInit(): void {
    this.loadProperties();
    this.loadFavorites();
  }

  private normalizeProperties(response: any): Property[] {
    console.log('Raw API response:', response);

    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.items)) return response.items;
    if (Array.isArray(response?.properties)) return response.properties;
    if (Array.isArray(response?.result)) return response.result;
    // { data: { items: [...] } }
   

    if (Array.isArray(response?.data?.items)) {

      return response.data.items;

    }

    
    // { data: { properties: [...] } }
   

    if (Array.isArray(response?.data?.properties)) {

      return response.data.properties;

    }

   
    // { data: { result: [...] } }
    

    if (Array.isArray(response?.data?.result)) {

      return response.data.result;

    }

    
    // Single property object
    

    if (
      response &&
      typeof response === 'object' &&
      !Array.isArray(response) &&
      response.id !== undefined &&
      response.title !== undefined
    ) {

      return [response];

    }

    console.error(
      'Unexpected properties API response:',
      response
    );

    return [];

  }

  
  // LOAD PROPERTIES
  

  loadProperties(): void {

    this.loading = true;

    this.errorMessage = '';

    this.propertyService
      .getAllProperties()
      .pipe(

        timeout({
          first: 10000
        }),

        finalize(() => {

          this.loading = false;

        })

      )
      .subscribe({

        next: (response: any) => {

          console.log(
            'Properties API response:',
            response
          );

          const result =
            this.normalizeProperties(response);

          this.properties =
            this.normalizePropertyImages(result);

          console.log(
            'Normalized properties:',
            this.properties
          );

          if (this.properties.length === 0) {

            this.errorMessage =
              'No properties found.';

          }

        },

        error: (error) => {

          console.error(
            'Failed to load properties:',
            error
          );

          this.properties = [];

          this.errorMessage =
            'Unable to load properties. Please make sure the backend is running.';

        }

      });

  }

 
  // SEARCH
 

  search(): void {
    this.errorMessage = '';

    const matchingProperties = this.propertyList.filter(property => {
      const location = [property.title, property.location, property.city, property.address]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const propertyType = this.getPropertyType(property).toLowerCase();
      const furnishedStatus = (property.furnishedStatus ?? '').toLowerCase();
      const amenities = (property.amenities ?? []).join(' ').toLowerCase();
      const searchLocation = this.filters.location.trim().toLowerCase();
      const searchType = this.filters.propertyType.trim().toLowerCase();
      const searchFurnishedStatus = this.filters.furnishedStatus.trim().toLowerCase();
      const searchAmenity = this.filters.amenities.trim().toLowerCase();

      return (!searchLocation || location.includes(searchLocation))
        && (!searchType || propertyType === searchType)
        && (this.filters.minPrice === null || property.price >= this.filters.minPrice)
        && (this.filters.maxPrice === null || property.price <= this.filters.maxPrice)
        && (this.filters.bedrooms === undefined || property.bedrooms >= this.filters.bedrooms)
        && (this.filters.bathrooms === undefined || property.bathrooms >= this.filters.bathrooms)
        && (!searchFurnishedStatus || furnishedStatus === searchFurnishedStatus)
        && (!searchAmenity || amenities.includes(searchAmenity));
    });

    this.properties = matchingProperties;
    if (!matchingProperties.length) {
      this.errorMessage = 'No properties match your search.';
    }

  }
  getPropertyType(property: Property) {
    return property.propertyType || property.propertyTypeName || 'Property';
  }

 
  // CLEAR FILTERS
  

  clearFilters(): void {

    this.filters = {

      location: '',

      propertyType: '',

      minPrice: null,

      maxPrice: null,

      bedrooms: undefined,

      bathrooms: undefined,

      furnishedStatus: '',
      amenities: ''

    };

    this.errorMessage = '';

    this.loadProperties();

  }

  
  // LOAD FAVORITES
 
  private loadFavorites(): void {

    if (
      !this.authService.isAuthenticated()
    ) {

      return;

    }

    this.favoriteService
      .getFavorites()
      .subscribe({

        next: (response: any) => {

          console.log(
            'Favorites response:',
            response
          );

          const favorites =
            Array.isArray(response)
              ? response
              : Array.isArray(response?.data)
                ? response.data
                : Array.isArray(response?.items)
                  ? response.items
                  : [];

          this.favorites =
            new Set(

              favorites
                .map(
                  (favorite: any) =>
                    Number(
                      favorite.propertyId
                    )
                )
                .filter(
                  (id: number) =>
                    !Number.isNaN(id)
                )

            );

        },

        error: (error) => {

          console.error(
            'Failed to load favorites:',
            error
          );

          if (
            error.status !== 401
          ) {

            this.favoriteError =
              'Unable to load your favorites.';

          }

        }

      });

  }

  
  // TOGGLE FAVORITE
  
  toggleFavorite(
    property: Property
  ): void {

    this.favoriteError = '';

    if (
      !this.authService.isAuthenticated()
    ) {

      this.favoriteError =
        'Please log in to manage favorites.';

      return;

    }

    
    // REMOVE FAVORITE
    
    if (
      this.favorites.has(property.id)
    ) {

      this.favoriteService
        .remove(property.id)
        .subscribe({

          next: () => {

            this.favorites.delete(
              property.id
            );

          },

          error: (error) => {

            console.error(
              'Remove favorite error:',
              error
            );

            this.favoriteError =
              error.status === 401
                ? 'Please log in to manage favorites.'
                : 'Unable to remove this favorite.';

          }

        });

      return;

    }

    // ADD FAVORITE
    
    this.favoriteService
      .add(property.id)
      .subscribe({

        next: () => {

          this.favorites.add(
            property.id
          );

        },

        error: (error) => {

          console.error(
            'Add favorite error:',
            error
          );

          if (
            error.status === 401
          ) {

            this.favoriteError =
              'Please log in to manage favorites.';

          }
          else if (
            error.status === 409
          ) {

            this.favoriteError =
              'This property is already in your favorites.';

          }
          else {

            this.favoriteError =
              'Unable to add this favorite.';

          }

        }

      });

  }

  
  // IMAGE

  toggleCompare(property: Property): void {
    if (this.compareIds.has(property.id)) {
      this.compareIds.delete(property.id);
    } else if (this.compareIds.size < 3) {
      this.compareIds.add(property.id);
    }
  }

  openCompare(): void {
    if (this.compareProperties.length >= 2) {
      this.showCompare = true;
    }
  }

  closeCompare(): void {
    this.showCompare = false;
  }

  openQuickView(property: Property): void {
    this.quickViewProperty = property;
    this.quickViewImageIndex = 0;
  }

  closeQuickView(): void {
    this.quickViewProperty = null;
  }

  quickViewImages(): string[] {
    return this.quickViewProperty ? this.imagesFor(this.quickViewProperty) : [];
  }

  showQuickViewImage(direction: number): void {
    const imageCount = this.quickViewImages().length;
    if (imageCount > 1) {
      this.quickViewImageIndex = (this.quickViewImageIndex + direction + imageCount) % imageCount;
    }
  }

  imagesFor(property: Property): string[] {
    return [...new Set([
      property.imageUrl ?? '',
      ...(property.images ?? [])
    ].filter((image): image is string => Boolean(image)))];
  }

  private normalizePropertyImages(properties: Property[]): Property[] {
    return properties.map(property => {
      const propertyData = property as Property & {
        imageURL?: unknown;
        imageUrls?: unknown;
      };
      const images = Array.isArray(propertyData.images)
        ? propertyData.images.map(image => this.imageUrlFrom(image)).filter(Boolean)
        : [];
      const primaryImage = this.imageUrlFrom(
        propertyData.imageUrl ?? propertyData.imageURL
      );

      return {
        ...property,
        imageUrl: primaryImage || images[0] || '',
        images
      };
    });
  }

  private imageUrlFrom(value: unknown): string {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }

    if (value && typeof value === 'object') {
      const image = value as { imageUrl?: unknown; url?: unknown };
      return this.imageUrlFrom(image.imageUrl ?? image.url);
    }

    return '';
  }
 
  imageFor(
    property: Property
  ): string {

    if (
      property.imageUrl &&
      property.imageUrl.trim() !== ''
    ) {

      return property.imageUrl;

    }

    if (
      property.images &&
      Array.isArray(property.images) &&
      property.images.length > 0 &&
      property.images[0]
    ) {

      return property.images[0];

    }

    return '/assets/images/default-property.svg';

  }

  
  // IMAGE FALLBACK

  imageFallback(
    event: Event
  ): void {

    const image =
      event.target as HTMLImageElement;

    if (!image) {

      return;

    }

    image.onerror = null;

    image.src =
      '/assets/images/default-property.svg';

  }

  // LOCATION
  
  getLocation(
    property: Property
  ): string {

    const propertyAny =
      property as any;

    return (

      propertyAny.location ||

      propertyAny.city ||

      propertyAny.address ||

      propertyAny.locality ||

      'Location not available'

    );

  }

  // STATUS

  getStatus(
    property: Property
  ): string {

    if (
      property.isReadyToMove
    ) {

      return 'READY TO MOVE';

    }

    if (
      property.constructionStatus
    ) {

      return property.constructionStatus;

    }

    return 'AVAILABLE';

  }

}
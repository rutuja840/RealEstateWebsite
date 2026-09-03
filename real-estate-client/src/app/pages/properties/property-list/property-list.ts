import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';

import { Property, PropertyFilters } from '../../../models/property';
import { PropertyService } from '../../../services/property';
import { FavoriteService } from '../../../services/favorite';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-property-list',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
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
    furnishedStatus: ''
  };

 
  // PAGE DATA
  

  properties: Property[] = [];

  favorites = new Set<number>();

  loading = false;

  errorMessage = '';

  favoriteError = '';

 
  // SAFE PROPERTY LIST
  

  get propertyList(): Property[] {

    return Array.isArray(this.properties)
      ? this.properties
      : [];

  }

  
  // INIT
  

  ngOnInit(): void {

    this.loadProperties();

    this.loadFavorites();

  }

  
  // NORMALIZE API RESPONSE
 
  private normalizeProperties(response: any): Property[] {

    console.log('Raw API response:', response);

   
    // Direct array
   
    if (Array.isArray(response)) {

      return response;

    }

    
    // { data: [...] }
    

    if (Array.isArray(response?.data)) {

      return response.data;

    }

    
    // { items: [...] }
    
    if (Array.isArray(response?.items)) {

      return response.items;

    }

    
    // { properties: [...] }
    

    if (Array.isArray(response?.properties)) {

      return response.properties;

    }

    
    // { result: [...] }
    
    if (Array.isArray(response?.result)) {

      return response.result;

    }

   
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
            Array.isArray(result)
              ? result
              : [];

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

    console.log(
      'Search button clicked'
    );

    console.log(
      'Current filters:',
      this.filters
    );

    this.loading = true;

    this.errorMessage = '';

    const filters: PropertyFilters = {

      location:
        this.filters.location?.trim() || undefined,

      propertyType:
        this.filters.propertyType || undefined,

      minPrice:
        this.filters.minPrice !== null &&
        this.filters.minPrice > 0
          ? this.filters.minPrice
          : undefined,

      maxPrice:
        this.filters.maxPrice !== null &&
        this.filters.maxPrice > 0
          ? this.filters.maxPrice
          : undefined,

      bedrooms:
        this.filters.bedrooms !== undefined
          ? this.filters.bedrooms
          : undefined,

      bathrooms:
        this.filters.bathrooms !== undefined
          ? this.filters.bathrooms
          : undefined,

      furnishedStatus:
        this.filters.furnishedStatus || undefined

    };

    console.log(
      'Search filters sent to API:',
      filters
    );

    const hasFilters =
      Object.values(filters)
        .some(
          value =>
            value !== undefined
        );

    console.log(
      'Has filters:',
      hasFilters
    );

    const request =
      hasFilters
        ? this.propertyService.searchProperties(filters)
        : this.propertyService.getAllProperties();

    request
      .pipe(

        timeout({
          first: 10000
        }),

        finalize(() => {

          console.log(
            'Search request completed'
          );

          this.loading = false;

        })

      )
      .subscribe({

        next: (response: any) => {

          console.log(
            'Search API response:',
            response
          );

          const result =
            this.normalizeProperties(response);

          this.properties =
            Array.isArray(result)
              ? result
              : [];

          console.log(
            'Search normalized properties:',
            this.properties
          );

          if (this.properties.length === 0) {

            this.errorMessage =
              'No properties match your search.';

          }

        },

        error: (error) => {

          console.error(
            'Property search error:',
            error
          );

          this.properties = [];

          this.errorMessage =
            'Unable to search properties right now.';

          this.loading = false;

        }

      });

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

      furnishedStatus: ''

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
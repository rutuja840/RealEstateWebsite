import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Property } from '../../models/property';
import { PropertyService } from '../../services/property';
import { FavoriteService } from '../../services/favorite';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-home',
  standalone: true,

  imports: [
    CommonModule,
    RouterLink
  ],

  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  // =========================================================
  // SERVICES
  // =========================================================

  private readonly propertyService =
    inject(PropertyService);

  private readonly favoriteService =
    inject(FavoriteService);

  private readonly authService =
    inject(AuthService);

  private readonly cdr =
    inject(ChangeDetectorRef);


  // =========================================================
  // PROPERTIES
  // =========================================================

  properties: Property[] = [];

  propertiesLoading = true;

  propertiesError = '';

  favoriteIds = new Set<number>();

  favoriteError = '';


  // =========================================================
  // SERVICES / FEATURES
  // =========================================================

  services = [
    {
      icon: '⌂',
      title: 'Property Search',
      description:
        'Find properties that match your lifestyle and budget.',
      route: '/properties'
    },

    {
      icon: '◈',
      title: 'Property Valuation',
      description:
        'Understand the value of your property with confidence.',
      route: '/properties'
    },

    {
      icon: '♢',
      title: 'Agent Support',
      description:
        'Connect with trusted real estate professionals.',
      route: '/properties'
    },

    {
      icon: '↗',
      title: 'Buy or Rent',
      description:
        'Explore premium properties for buying or renting.',
      route: '/properties'
    }
  ];


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    console.log('==============================');
    console.log('HOME INITIALIZED');
    console.log('==============================');

    this.loadProperties();

    this.loadFavorites();
  }


  // =========================================================
  // LOAD PROPERTIES
  // =========================================================

  loadProperties(): void {

    console.log('HOME: Starting property request...');

    // IMPORTANT
    this.propertiesLoading = true;

    this.propertiesError = '';

    this.propertyService
      .getAllProperties()
      .subscribe({

        // ===================================================
        // SUCCESS
        // ===================================================

        next: (response: any) => {

          console.log(
            'RAW PROPERTY API RESPONSE:',
            response
          );

          const result =
            PropertyService.unwrapList(response);

          console.log(
            'UNWRAPPED PROPERTIES:',
            result
          );

          // Set properties
          this.properties = result ?? [];

          console.log(
            'HOME: Properties received:',
            this.properties
          );

          console.log(
            'HOME: Property count:',
            this.properties.length
          );

          // IMPORTANT:
          // Stop loading AFTER properties are assigned
          this.propertiesLoading = false;

          if (this.properties.length === 0) {

            this.propertiesError =
              'No properties available.';
          }

          // IMPORTANT FOR ANGULAR CHANGE DETECTION
          this.cdr.detectChanges();

          console.log(
            'HOME: Property request completed.'
          );
        },


        // ===================================================
        // ERROR
        // ===================================================

        error: (error: any) => {

          console.error(
            'HOME PROPERTY API ERROR:',
            error
          );

          this.properties = [];

          this.propertiesLoading = false;

          if (error.status === 0) {

            this.propertiesError =
              'Unable to connect to the backend API. Please make sure the backend is running.';

          }
          else if (error.status === 404) {

            this.propertiesError =
              'Property API endpoint was not found.';

          }
          else if (error.status === 500) {

            this.propertiesError =
              'Server error while loading properties.';

          }
          else {

            this.propertiesError =
              'Unable to load featured properties.';
          }

          // IMPORTANT
          this.cdr.detectChanges();
        }
      });
  }


  // =========================================================
  // FAVORITES
  // =========================================================

  loadFavorites(): void {

    if (!this.authService.isAuthenticated()) {
      return;
    }

    this.favoriteService
      .getFavorites()
      .subscribe({

        next: (response: any) => {

          const favorites =
            Array.isArray(response)
              ? response
              : response?.data ?? [];

          this.favoriteIds =
            new Set(
              favorites
                .map(
                  (favorite: any) =>
                    favorite.propertyId
                )
                .filter(
                  (id: any) =>
                    id !== undefined &&
                    id !== null
                )
            );

          this.cdr.detectChanges();
        },

        error: (error: any) => {

          console.error(
            'Favorite loading error:',
            error
          );

          if (error.status !== 401) {

            this.favoriteError =
              'Unable to load favorites.';
          }

          this.cdr.detectChanges();
        }
      });
  }


  // =========================================================
  // IMAGE
  // =========================================================

  imageFor(
    property: Property
  ): string {

    // First use backend image
    if (
      property.imageUrl &&
      property.imageUrl.trim() !== ''
    ) {

      return property.imageUrl;
    }


    // Then use property images
    if (
      property.images &&
      property.images.length > 0 &&
      property.images[0]
    ) {

      return property.images[0];
    }


    // Google/Unsplash-style fallback image
    return this.getFallbackImage(property);
  }


  // =========================================================
  // HARDCODED PROPERTY IMAGES
  // =========================================================

  getFallbackImage(
    property: Property
  ): string {

    const images = [

      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85',

      'https://unsplash.com/s/photos/real-estate-projects?auto=format&fit=crop&w=1200&q=85',

      'https://www.investormart.co.in/news/property-search-portal',

      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',

      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=85',

      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85',

      'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=85',

      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=85',

      'https://images.unsplash.com/photo-1600566753051-6b7f5c0b8d7d?auto=format&fit=crop&w=1200&q=85'

    ];

    return images[
      property.id % images.length
    ];
  }


  // =========================================================
  // IMAGE FALLBACK
  // =========================================================

  propertyImageFallback(
    event: Event
  ): void {

    const image =
      event.target as HTMLImageElement;

    if (!image) {
      return;
    }

    image.onerror = null;

    image.src =
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85';
  }


  // =========================================================
  // LIFESTYLE IMAGE FALLBACK
  // =========================================================

  lifestyleImageFallback(
    event: Event
  ): void {

    const image =
      event.target as HTMLImageElement;

    if (!image) {
      return;
    }

    image.onerror = null;

    image.src =
      'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1600&q=90';
  }


  // =========================================================
  // PROPERTY STATUS
  // =========================================================

  getPropertyStatus(
    property: Property
  ): string {

    if (property.isReadyToMove === true) {

      return 'READY TO MOVE';
    }

    if (property.constructionStatus) {

      return property.constructionStatus;
    }

    return 'AVAILABLE';
  }


  // =========================================================
  // PROPERTY TYPE
  // =========================================================

  getPropertyType(
    property: Property
  ): string {

    return (
      property.propertyType ||
      property.propertyTypeName ||
      'PROPERTY'
    );
  }


  // =========================================================
  // LOCATION
  // =========================================================

  getPropertyLocation(
    property: Property
  ): string {

    return (
      property.location ||
      property.city ||
      property.address ||
      this.getHardcodedLocation(property)
    );
  }


  // =========================================================
  // HARDCODED LOCATION
  // =========================================================

  getHardcodedLocation(
    property: Property
  ): string {

    const locations = [

      'Baner, Pune',

      'Kothrud, Pune',

      'Wakad, Pune',

      'Hinjewadi, Pune',

      'Viman Nagar, Pune',

      'Kharadi, Pune',

      'Aundh, Pune',

      'Koregaon Park, Pune',

      'Hadapsar, Pune'

    ];

    return locations[
      property.id % locations.length
    ];
  }


  // =========================================================
  // AREA UNIT
  // =========================================================

  getAreaUnit(
    property: Property
  ): string {

    return property.areaUnit || 'sq.ft';
  }


  // =========================================================
  // FAVORITE TOGGLE
  // =========================================================

  toggleFavorite(
    property: Property
  ): void {

    if (!this.authService.isAuthenticated()) {

      this.favoriteError =
        'Please login to manage favorites.';

      return;
    }

    this.favoriteError = '';


    // =====================================================
    // REMOVE
    // =====================================================

    if (
      this.favoriteIds.has(property.id)
    ) {

      this.favoriteService
        .remove(property.id)
        .subscribe({

          next: () => {

            this.favoriteIds.delete(
              property.id
            );

            this.cdr.detectChanges();
          },

          error: (error: any) => {

            console.error(
              'Remove favorite error:',
              error
            );

            this.favoriteError =
              'Unable to remove favorite.';

            this.cdr.detectChanges();
          }
        });

      return;
    }


    // =====================================================
    // ADD
    // =====================================================

    this.favoriteService
      .add(property.id)
      .subscribe({

        next: () => {

          this.favoriteIds.add(
            property.id
          );

          this.cdr.detectChanges();
        },

        error: (error: any) => {

          console.error(
            'Add favorite error:',
            error
          );

          if (error.status === 409) {

            this.favoriteIds.add(
              property.id
            );

            this.favoriteError =
              'Property is already in favorites.';

          }
          else {

            this.favoriteError =
              'Unable to add favorite.';
          }

          this.cdr.detectChanges();
        }
      });
  }
}
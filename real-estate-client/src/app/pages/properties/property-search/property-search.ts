import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';

import { PropertyService } from '../../../services/property';
import { Property } from '../../../models/property';

@Component({
  selector: 'app-property-search',
  imports: [CommonModule, RouterLink],
  templateUrl: './property-search.html',
  styleUrl: './property-search.css'
})
export class PropertySearchComponent implements OnInit {

  private propertyService = inject(PropertyService);

  properties: Property[] = [];

  loading = false;

  errorMessage = '';

  imageFor(property: Property): string {
    if (property.imageUrl && property.imageUrl.trim() !== '') {
      return property.imageUrl;
    }

    if (property.images && property.images.length > 0 && property.images[0]) {
      return property.images[0];
    }

    return '/assets/images/default-property.svg';
  }

  getPropertyType(property: Property): string {
    return property.propertyType || property.propertyTypeName || 'Property';
  }

  getLocation(property: Property): string {
    const city = property.city?.trim();
    const address = property.address?.trim();
    const location = property.location?.trim();

    if (city && address) {
      return `${city}, ${address}`;
    }

    return city || address || location || 'Location not available';
  }

  imageFallback(event: Event): void {
    const image = event.target as HTMLImageElement;
    if (!image) {
      return;
    }

    image.onerror = null;
    image.src = '/assets/images/default-property.svg';
  }

  ngOnInit(): void {

    this.loadProperties();
  }

  loadProperties(): void {

    this.loading = true;

    this.propertyService.getAllProperties().pipe(
      timeout({ first: 8000 }),
      finalize(() => this.loading = false)
    )
      .subscribe({

        next: (response) => {

          console.log('Properties API:', response);

          this.properties = response;
        },

        error: (error) => {

          console.error(
            'Property API Error:',
            error
          );

          this.errorMessage =
            'Unable to load properties.';

        }
      });
  }
}

export default PropertySearchComponent;
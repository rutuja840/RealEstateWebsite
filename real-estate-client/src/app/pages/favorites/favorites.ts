import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, finalize, forkJoin, map, of, switchMap, timeout } from 'rxjs';
import { Favorite as FavoriteModel } from '../../models/favorite';
import { FavoriteService } from '../../services/favorite';
import { PropertyService } from '../../services/property';

@Component({
  selector: 'app-favorites',
  imports: [CommonModule, RouterLink],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css',
})
export class Favorites implements OnInit {
  private readonly favoriteService = inject(FavoriteService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly propertyService = inject(PropertyService);

  favorites: FavoriteModel[] = [];
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.loading = true;
    this.errorMessage = '';

    this.favoriteService.getFavorites().pipe(
      timeout({ first: 8000 }),
      map(response => this.normalizeFavorites(response)),
      switchMap(favorites => favorites.length === 0
        ? of(favorites)
        : forkJoin(favorites.map(favorite => this.hydrateFavorite(favorite)))
      ),
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: response => {
        this.favorites = response;
        this.cdr.detectChanges();
      },
      error: error => {
        this.loading = false;
        this.errorMessage = error.status === 401
          ? 'Your login session expired. Please log in again.'
          : error.name === 'TimeoutError'
            ? 'The favorites request timed out. Please check that the backend is running.'
          : 'Unable to load your favorites right now.';
        this.cdr.detectChanges();
      }
    });
  }

  private normalizeFavorites(response: unknown): FavoriteModel[] {
    if (Array.isArray(response)) {
      return response as FavoriteModel[];
    }

    if (!response || typeof response !== 'object') {
      return [];
    }

    const payload = response as {
      data?: unknown;
      items?: unknown;
      favorites?: unknown;
    };

    if (Array.isArray(payload.data)) {
      return payload.data as FavoriteModel[];
    }

    if (Array.isArray(payload.items)) {
      return payload.items as FavoriteModel[];
    }

    if (Array.isArray(payload.favorites)) {
      return payload.favorites as FavoriteModel[];
    }

    if (payload.data && typeof payload.data === 'object') {
      return this.normalizeFavorites(payload.data);
    }

    return [];
  }

  private hydrateFavorite(favorite: FavoriteModel) {
    if (favorite.property) {
      return of(favorite);
    }

    return this.propertyService.getPropertyById(favorite.propertyId).pipe(
      map(property => ({ ...favorite, property })),
      catchError(() => of(favorite))
    );
  }

  remove(favorite: FavoriteModel): void {
    this.favoriteService.remove(favorite.propertyId).subscribe({
      next: () => {
        this.favorites = this.favorites.filter(item => item.propertyId !== favorite.propertyId);
      },
      error: () => {
        this.errorMessage = 'Unable to remove this favorite right now.';
      }
    });
  }

  imageFor(favorite: FavoriteModel): string {
    const image = favorite.property?.imageUrl || favorite.property?.images?.[0];

    if (typeof image === 'string' && image.trim()) {
      return image;
    }

    if (image && typeof image === 'object') {
      const imageData = image as unknown as { imageUrl?: string; url?: string };
      return imageData.imageUrl || imageData.url || '/assets/images/default-property.svg';
    }

    return '/assets/images/default-property.svg';
  }

  imageFallback(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.onerror = null;
    image.src = '/assets/images/default-property.svg';
  }

}

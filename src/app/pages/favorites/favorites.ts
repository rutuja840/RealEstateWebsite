import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { Favorite as FavoriteModel } from '../../models/favorite';
import { FavoriteService } from '../../services/favorite';

@Component({
  selector: 'app-favorites',
  imports: [CommonModule, RouterLink],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css',
})
export class Favorites implements OnInit {
  private readonly favoriteService = inject(FavoriteService);

  favorites: FavoriteModel[] = [];
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.loading = false;
    this.errorMessage = '';

    this.favoriteService.getFavorites().pipe(
      timeout({ first: 4000 }),
      finalize(() => this.loading = false)
    ).subscribe({
      next: response => {
        this.favorites = Array.isArray(response) ? response : response.data ?? [];
      },
      error: error => {
        this.errorMessage = error.status === 401
          ? 'Your login session expired. Please log in again.'
          : 'Unable to load your favorites right now.';
      }
    });
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
    return favorite.property?.imageUrl || favorite.property?.images?.[0] || '/assets/images/default-property.svg';
  }

  imageFallback(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.onerror = null;
    image.src = '/assets/images/default-property.svg';
  }

}

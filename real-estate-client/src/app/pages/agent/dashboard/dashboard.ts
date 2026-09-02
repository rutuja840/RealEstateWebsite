import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PropertyService } from '../../../services/property';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly propertyService = inject(PropertyService);
  propertyCount = 0;
  loading = true;

  constructor() {
    this.propertyService.getAllProperties().subscribe({
      next: response => { this.propertyCount = PropertyService.unwrapList(response).length; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}

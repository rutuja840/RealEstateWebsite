import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Property } from '../../../models/property';
import { PropertyService } from '../../../services/property';

@Component({
  selector: 'app-my-properties',
  imports: [CommonModule, RouterLink],
  templateUrl: './my-properties.html',
  styleUrl: './my-properties.css',
})
export class MyProperties implements OnInit {
  private readonly propertyService = inject(PropertyService);
  properties: Property[] = [];
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.propertyService.getAllProperties().subscribe({
      next: response => { this.properties = PropertyService.unwrapList(response); this.loading = false; },
      error: () => { this.errorMessage = 'Unable to load your properties.'; this.loading = false; }
    });
  }

  delete(property: Property):  void {
    if (!confirm(`Delete ${property.title}?`)) return;
    this.propertyService.deleteProperty(property.id).subscribe({
      next: () => {
        this.properties = this.properties.filter(item => item.id !== property.id);
      },
      error: () => {
        this.errorMessage = 'Unable to delete this property right now.';
      }
    });
  }

}

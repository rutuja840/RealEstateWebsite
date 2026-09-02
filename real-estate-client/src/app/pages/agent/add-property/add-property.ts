import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PropertyService } from '../../../services/property';

@Component({
  selector: 'app-add-property',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './add-property.html',
  styleUrl: './add-property.css',
})
export class AddProperty {
  private readonly propertyService = inject(PropertyService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  readonly form = this.formBuilder.nonNullable.group({ title: ['', Validators.required], description: '', price: [0, Validators.required], location: ['', Validators.required], propertyType: ['', Validators.required], bedrooms: [1, Validators.required], bathrooms: [1, Validators.required], area: [0, Validators.required], imageUrl: '', latitude: 0, longitude: 0 });
  submitting = false; errorMessage = '';
  selectedFiles: File[] = [];
  previews: string[] = [];

  selectImages(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFiles = Array.from(input.files ?? []);
    this.previews.forEach(url => URL.revokeObjectURL(url));
    this.previews = this.selectedFiles.map(file => URL.createObjectURL(file));
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    this.errorMessage = '';
    this.propertyService.createProperty(this.form.getRawValue()).subscribe({
      next: property => {
        const upload = this.selectedFiles.length
          ? this.propertyService.uploadImages(property.id, this.selectedFiles)
          : null;
        if (!upload) { this.router.navigate(['/agent/properties']); return; }
        upload.subscribe({
          next: () => this.router.navigate(['/agent/properties']),
          error: () => { this.errorMessage = 'Property saved, but images could not be uploaded.'; this.submitting = false; }
        });
      },
      error: () => { this.errorMessage = 'Unable to save the property.'; this.submitting = false; }
    });
  }

}

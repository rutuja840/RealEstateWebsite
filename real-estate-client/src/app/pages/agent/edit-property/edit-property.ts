import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PropertyService } from '../../../services/property';

@Component({
  selector: 'app-edit-property',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './edit-property.html',
  styleUrl: './edit-property.css',
})
export class EditProperty implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly propertyService = inject(PropertyService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private propertyId = 0;
  readonly form = this.formBuilder.nonNullable.group({ title: ['', Validators.required], description: '', price: [0, Validators.required], location: ['', Validators.required], propertyType: ['', Validators.required], bedrooms: [1, Validators.required], bathrooms: [1, Validators.required], area: [0, Validators.required], imageUrl: '', latitude: 0, longitude: 0 });
  loading = true; submitting = false; errorMessage = '';
  selectedFiles: File[] = [];
  previews: string[] = [];
  images: string[] = [];

  ngOnInit(): void {
    this.propertyId = Number(this.route.snapshot.paramMap.get('id'));
    this.propertyService.getPropertyById(this.propertyId).subscribe({
      next: response => {
        const property = PropertyService.unwrapOne(response);
        this.form.patchValue(property);
        this.images = property.images ?? [];
        this.loading = false;
      },
      error: () => { this.errorMessage = 'Unable to load the property.'; this.loading = false; }
    });
  }

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
    this.propertyService.updateProperty(this.propertyId, this.form.getRawValue()).subscribe({
      next: () => {
        const upload = this.selectedFiles.length
          ? this.propertyService.uploadImages(this.propertyId, this.selectedFiles)
          : null;
        if (!upload) { this.router.navigate(['/agent/properties']); return; }
        upload.subscribe({
          next: () => this.router.navigate(['/agent/properties']),
          error: () => { this.errorMessage = 'Property updated, but images could not be uploaded.'; this.submitting = false; }
        });
      },
      error: () => { this.errorMessage = 'Unable to update the property.'; this.submitting = false; }
    });
  }

}

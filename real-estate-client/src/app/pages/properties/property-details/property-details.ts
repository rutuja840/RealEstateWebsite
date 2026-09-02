import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  catchError,
  finalize,
  of,
  timeout
} from 'rxjs';

import { Property } from '../../../models/property';
import { PropertyService } from '../../../services/property';
import { PropertyMapComponent } from '../../../shared/property-map/property-map.component';
import { InquiryService } from '../../../services/inquiry';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-property-details',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    PropertyMapComponent
  ],

  templateUrl: './property-details.html',
  styleUrl: './property-details.css'
})
export class PropertyDetails implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly propertyService = inject(PropertyService);
  private readonly inquiryService = inject(InquiryService);
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly inquiryForm = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    preferredVisitDate: '',
    message: ['', [Validators.required, Validators.minLength(10)]]
  });

  showInquiryForm = false;
  submittingInquiry = false;
  inquiryError = '';
  inquirySuccess = false;

  // =========================================================
  // PAGE DATA
  // =========================================================

  property: Property | null = null;

  loading = false;

  errorMessage = '';

  selectedImageIndex = 0;

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    const currentUser = this.authService.getCurrentUser();
    const storedEmail = localStorage.getItem('email');
    const storedName = localStorage.getItem('fullName');

    this.inquiryForm.patchValue({
      name: currentUser?.['fullName'] || storedName || '',
      email: currentUser?.['email'] || storedEmail || ''
    });

    console.log('======================================');
    console.log('PropertyDetails component loaded');
    console.log('======================================');

    this.route.paramMap.subscribe({

      next: (params) => {

        const idString = params.get('id');

        console.log('Route property id:', idString);

        if (!idString) {

          this.loading = false;

          this.errorMessage =
            'Property ID is missing.';

          return;
        }

        const id = Number(idString);

        if (
          Number.isNaN(id) ||
          id <= 0
        ) {

          this.loading = false;

          this.errorMessage =
            'Invalid property ID.';

          return;
        }

        this.loadProperty(id);
      },

      error: (error) => {

        console.error(
          'Route parameter error:',
          error
        );

        this.loading = false;

        this.errorMessage =
          'Unable to read property ID.';
      }

    });
  }

  // =========================================================
  // LOAD PROPERTY
  // =========================================================

  loadProperty(id: number): void {

    console.log('======================================');
    console.log('Loading property ID:', id);
    console.log('======================================');

    this.loading = true;

    this.property = null;

    this.errorMessage = '';

    this.propertyService
      .getPropertyById(id)
      .pipe(

        /*
         * Prevent infinite loading.
         * If API does not respond within 8 seconds,
         * request will fail and loading will stop.
         */
        timeout(8000),

        /*
         * Convert API error into a normal response
         * so finalize definitely executes.
         */
        catchError((error) => {

          console.error(
            'Property API error:',
            error
          );

          this.property = null;

          if (error?.name === 'TimeoutError') {

            this.errorMessage =
              'Property request timed out. Please make sure the backend API is running.';
          }

          else if (error?.status === 404) {

            this.errorMessage =
              `Property with ID ${id} was not found.`;
          }

          else if (error?.status === 0) {

            this.errorMessage =
              'Cannot connect to backend API. Please make sure ASP.NET Core API is running and HTTPS certificate is trusted.';
          }

          else {

            this.errorMessage =
              'Unable to load property details.';
          }

          return of(null);
        }),

        /*
         * IMPORTANT:
         * This always changes loading to false.
         */
        finalize(() => {

          console.log(
            'Property loading finished'
          );

          this.loading = false;
          this.cdr.detectChanges();
        })

      )
      .subscribe({

        next: (response: any) => {

          console.log(
            '======================================'
          );

          console.log(
            'PROPERTY API RESPONSE:',
            response
          );

          console.log(
            '======================================'
          );

          if (!response) {
            this.property = null;
            this.errorMessage = `Property with ID ${id} was not found.`;
            return;
          }

          if (response.success === false) {
            this.property = null;
            this.errorMessage = response.message ?? `Property with ID ${id} was not found.`;
            return;
          }

          // ===================================================
          // GET ACTUAL PROPERTY OBJECT
          // ===================================================

          let data: any = response;

          /*
           * Response:
           *
           * {
           *   success: true,
           *   message: "...",
           *   data: {...}
           * }
           */
          if (
            response.data !== undefined &&
            response.data !== null
          ) {

            data = response.data;
          }

          /*
           * Response:
           *
           * {
           *   result: {...}
           * }
           */
          else if (
            response.result !== undefined &&
            response.result !== null
          ) {

            data = response.result;
          }

          /*
           * Response:
           *
           * {
           *   property: {...}
           * }
           */
          else if (
            response.property !== undefined &&
            response.property !== null
          ) {

            data = response.property;
          }

          // ===================================================
          // ARRAY RESPONSE
          // ===================================================

          if (Array.isArray(data)) {

            console.log(
              'API returned array:',
              data
            );

            data =
              data.length > 0
                ? data[0]
                : null;
          }

          // ===================================================
          // CHECK PROPERTY
          // ===================================================

          if (
            !data ||
            typeof data !== 'object'
          ) {

            console.error(
              'Invalid property response:',
              data
            );

            this.property = null;

            this.errorMessage =
              `Property with ID ${id} was not found.`;

            return;
          }

          // ===================================================
          // NORMALIZE PROPERTY
          // ===================================================

          const normalizedProperty: any = {

            ...data,

            // -------------------------------------------------
            // ID
            // -------------------------------------------------

            id: Number(
              data.id ??
              data.propertyId ??
              id
            ),

            // -------------------------------------------------
            // TITLE
            // -------------------------------------------------

            title:
              data.title ??
              data.name ??
              'Property',

            // -------------------------------------------------
            // PRICE
            // -------------------------------------------------

            price: Number(
              data.price ?? 0
            ),

            // -------------------------------------------------
            // BEDROOMS
            // -------------------------------------------------

            bedrooms: Number(
              data.bedrooms ?? 0
            ),

            // -------------------------------------------------
            // BATHROOMS
            // -------------------------------------------------

            bathrooms: Number(
              data.bathrooms ?? 0
            ),

            // -------------------------------------------------
            // AREA
            // -------------------------------------------------

            area: Number(
              data.area ?? 0
            ),

            areaUnit:
              data.areaUnit ??
              data.areaUnitName ??
              'sq.ft',

            // -------------------------------------------------
            // PROPERTY TYPE
            // -------------------------------------------------

            propertyType:
              data.propertyType ??
              data.propertyTypeName ??
              data.type ??
              '',

            propertyTypeName:
              data.propertyTypeName ??
              data.propertyType ??
              data.type ??
              '',

            // -------------------------------------------------
            // LOCATION
            // -------------------------------------------------

            location:
              data.location ??
              data.city ??
              data.address ??
              data.locality ??
              '',

            city:
              data.city ??
              data.location ??
              '',

            address:
              data.address ??
              data.location ??
              data.city ??
              '',

            locality:
              data.locality ??
              '',

          
            // IMAGES
           
            images:
              Array.isArray(data.images)
                ? data.images
                : [],

            
            // IMAGE URL
           

            imageUrl:
              data.imageUrl ??
              data.imageURL ??
              ''
          };

          
          // IMAGE DATA NORMALIZATION
          

          /*
           * Sometimes backend may return:
           *
           * images: [
           *   { imageUrl: "..." }
           * ]
           *
           * Convert it to:
           *
           * images: [
           *   "..."
           * ]
           */

          if (
            Array.isArray(normalizedProperty.images)
          ) {

            normalizedProperty.images =
              normalizedProperty.images
                .map((image: any) => {

                  if (
                    typeof image === 'string'
                  ) {

                    return image;
                  }

                  if (
                    image?.imageUrl
                  ) {

                    return image.imageUrl;
                  }

                  if (
                    image?.url
                  ) {

                    return image.url;
                  }

                  return '';
                })
                .filter(
                  (image: string) =>
                    image.trim() !== ''
                );
          }

         
          // SET PROPERTY
          

          this.property =
            normalizedProperty as Property;

          this.cdr.detectChanges();

          console.log(
            '======================================'
          );

          console.log(
            'PROPERTY LOADED SUCCESSFULLY:',
            this.property
          );

          console.log(
            'Property ID:',
            this.property.id
          );

          console.log(
            'Property Title:',
            this.property.title
          );

          console.log(
            'Property Images:',
            this.property.images
          );

          console.log(
            '======================================'
          );

          this.errorMessage = '';
        }

      });
  }

 
  // IMAGE

  getGalleryImages(): string[] {
    const property = this.property;

    if (!property) {
      return [];
    }

    const gallery: string[] = [];

    if (property.imageUrl && property.imageUrl.trim() !== '') {
      gallery.push(property.imageUrl);
    }

    if (Array.isArray(property.images)) {
      for (const image of property.images) {
        if (image && image.trim() !== '' && !gallery.includes(image)) {
          gallery.push(image);
        }
      }
    }

    return gallery.length > 0 ? gallery : ['/assets/images/default-property.svg'];
  }

  currentImage(): string {
    const images = this.getGalleryImages();

    if (images.length === 0) {
      return '/assets/images/default-property.svg';
    }

    return images[this.selectedImageIndex] ?? images[0];
  }

  showPreviousImage(): void {
    const images = this.getGalleryImages();
    if (images.length <= 1) {
      return;
    }

    this.selectedImageIndex = (this.selectedImageIndex - 1 + images.length) % images.length;
  }

  showNextImage(): void {
    const images = this.getGalleryImages();
    if (images.length <= 1) {
      return;
    }

    this.selectedImageIndex = (this.selectedImageIndex + 1) % images.length;
  }

  selectImage(index: number): void {
    const images = this.getGalleryImages();
    if (!images.length) {
      return;
    }

    this.selectedImageIndex = (index + images.length) % images.length;
  }

  imageFor(property: Property): string {
    const images = this.getGalleryImages();

    if (property && images.length > 0) {
      return images[this.selectedImageIndex] ?? images[0];
    }

    return '/assets/images/default-property.svg';
  }


  // IMAGE FALLBACK
  

  imageFallback(event: Event): void {

    const image =
      event.target as HTMLImageElement;

    if (!image) {
      return;
    }

    /*
     * Prevent infinite image error loop.
     */
    image.onerror = null;

    image.src =
      '/assets/images/default-property.svg';
  }

  
  // LOCATION
  

  getLocation(): string {

    if (!this.property) {

      return 'Location not available';
    }

    const propertyAny =
      this.property as any;

    return (
      propertyAny.location ||
      propertyAny.city ||
      propertyAny.address ||
      propertyAny.locality ||
      'Location not available'
    );
  }

 
  // STATUS
  

  getStatus(): string {

    if (!this.property) {

      return 'AVAILABLE';
    }

    if (
      this.property.isReadyToMove
    ) {

      return 'READY TO MOVE';
    }

    if (
      this.property.constructionStatus
    ) {

      return this.property.constructionStatus;
    }

    return 'AVAILABLE';
  }

  // =========================================================
  // PROPERTY TYPE
  // =========================================================

  getPropertyType(): string {

    if (!this.property) {

      return 'PROPERTY';
    }

    const propertyAny =
      this.property as any;

    return (
      propertyAny.propertyType ||
      propertyAny.propertyTypeName ||
      'PROPERTY'
    );
  }

  // =========================================================
  // RETRY
  // =========================================================

  retry(): void {

    const idString =
      this.route.snapshot.paramMap.get('id');

    if (!idString) {

      this.loading = false;

      this.errorMessage =
        'Property ID is missing.';

      return;
    }

    const id =
      Number(idString);

    if (
      Number.isNaN(id) ||
      id <= 0
    ) {

      this.loading = false;

      this.errorMessage =
        'Invalid property ID.';

      return;
    }

    this.loadProperty(id);
  }

  toggleInquiryForm(): void {
    this.showInquiryForm = !this.showInquiryForm;
    this.inquiryError = '';
    this.inquirySuccess = false;
  }

  submitInquiry(): void {
    if (!this.property) {
      return;
    }

    if (this.inquiryForm.invalid) {
      this.inquiryForm.markAllAsTouched();
      this.inquiryError = 'Please fill in all required inquiry fields.';
      return;
    }

    const formValue = this.inquiryForm.getRawValue();
    const preferredVisitDate = formValue.preferredVisitDate
      ? new Date(formValue.preferredVisitDate).toISOString()
      : undefined;

    this.submittingInquiry = true;
    this.inquiryError = '';
    this.inquirySuccess = false;

    this.inquiryService.create({
      propertyId: this.property.id,
      name: formValue.name.trim(),
      email: formValue.email.trim(),
      phone: formValue.phone.trim(),
      preferredVisitDate,
      message: formValue.message.trim()
    }).subscribe({
      next: () => {
        this.submittingInquiry = false;
        this.inquirySuccess = true;
        this.inquiryForm.reset({
          name: this.inquiryForm.get('name')?.value || '',
          email: this.inquiryForm.get('email')?.value || '',
          phone: this.inquiryForm.get('phone')?.value || '',
          preferredVisitDate: '',
          message: ''
        });
      },
      error: (error) => {
        this.submittingInquiry = false;
        this.inquiryError = error?.error?.message || 'Unable to send inquiry right now.';
      }
    });
  }
}
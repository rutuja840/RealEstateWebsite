import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth';

interface CurrentUser {
  userId?: number;
  id?: number;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {

  private readonly auth = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

 
  // CURRENT USER
  
  readonly user =
    this.auth.getCurrentUser() as CurrentUser | null;


  
  // PROFILE FORM
  

  readonly form =
    this.formBuilder.nonNullable.group({

      fullName: [
        this.user?.fullName ?? '',
        Validators.required
      ],

      phoneNumber: [
        this.user?.phoneNumber ?? '',
        Validators.required
      ]

    });


  
  // ALIAS FOR EXISTING profile.html
  

  readonly profileForm = this.form;


 
  // STATE
 

  saving = false;

  message = '';

  errorMessage = '';


  
  // ALIAS FOR EXISTING HTML
 

  get successMessage(): string {
    return this.message;
  }


 
  // SAVE PROFILE
  

  save(): void {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;
    }


    // Get user ID from current user first
    const userId =
      this.user?.userId ??
      this.user?.id ??
      Number(localStorage.getItem('userId'));


    if (!userId) {

      this.errorMessage =
        'User information is not available. Please login again.';

      return;
    }


    this.saving = true;

    this.message = '';

    this.errorMessage = '';


    this.auth
      .updateUser(
        userId,
        this.form.getRawValue()
      )
      .subscribe({

        next: (response: any) => {

          console.log(
            'PROFILE UPDATE RESPONSE:',
            response
          );


          this.message =
            'Profile updated successfully.';

          this.saving = false;


          // Update local storage user if response contains user
          this.updateStoredUser(
            response
          );
        },


        error: (error) => {

          console.error(
            'PROFILE UPDATE ERROR:',
            error
          );


          this.errorMessage =
            'Unable to update your profile right now.';

          this.saving = false;
        }

      });
  }


 
  // UPDATE STORED USER
  

  private updateStoredUser(
    response: any
  ): void {

    try {

      const updatedUser =
        response?.data ??
        response?.user ??
        response;


      if (
        updatedUser &&
        typeof updatedUser === 'object'
      ) {

        localStorage.setItem(
          'user',
          JSON.stringify(updatedUser)
        );
      }

    } catch (error) {

      console.warn(
        'Unable to update stored user:',
        error
      );

    }
  }


 
  // LOGOUT
  
  logout(): void {

    // Clear authentication information
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');

    // Go to login page
    this.router.navigate(['/login']);
  }

}
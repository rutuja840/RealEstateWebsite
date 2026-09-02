import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  private authService = inject(AuthService);

  private router = inject(Router);


  registerData = {

    fullName: '',

    email: '',

    phoneNumber: '',

    password: '',

    confirmPassword: '',

    role: 'User'

  };


  loading = false;

  successMessage = '';

  errorMessage = '';


  register(): void {

    console.log(
      'REGISTER BUTTON CLICKED'
    );


    this.successMessage = '';

    this.errorMessage = '';


    // Validation

    if (
      !this.registerData.fullName ||
      !this.registerData.email ||
      !this.registerData.phoneNumber ||
      !this.registerData.password ||
      !this.registerData.confirmPassword
    ) {

      this.errorMessage =
        'Please fill all required fields.';

      return;
    }


    // Password validation

    if (
      this.registerData.password !==
      this.registerData.confirmPassword
    ) {

      this.errorMessage =
        'Password and confirm password do not match.';

      return;
    }


    // Phone validation

    if (
      this.registerData.phoneNumber.length !== 10
    ) {

      this.errorMessage =
        'Phone number must contain 10 digits.';

      return;
    }


    this.loading = true;


    // Do not send confirmPassword to backend

    const requestData = {

      fullName:
        this.registerData.fullName,

      email:
        this.registerData.email,

      phoneNumber:
        this.registerData.phoneNumber,

      password:
        this.registerData.password,

      role:
        this.registerData.role

    };


    console.log(
      'REGISTER REQUEST:',
      requestData
    );


    this.authService
      .register(requestData)
      .subscribe({

        next: (response) => {

          console.log(
            'REGISTER RESPONSE:',
            response
          );


          this.loading = false;


          this.successMessage =
            response?.message ||
            'Registration successful!';


          // Clear form

          this.registerData = {

            fullName: '',

            email: '',

            phoneNumber: '',

            password: '',

            confirmPassword: '',

            role: 'User'

          };


          // Go to login after 1.5 seconds

          setTimeout(() => {

            this.router.navigate([
              '/login'
            ]);

          }, 1500);

        },


        error: (error) => {

          console.error(
            'REGISTER ERROR:',
            error
          );


          this.loading = false;


          this.errorMessage =
            error?.error?.message ||
            'Registration failed. Please try again.';

        }

      });

  }

}
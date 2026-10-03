import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    Card,
    InputText,
    Password,
    Button
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';

  errorMessage = signal<string | null>(null);
  infoNotice = signal<string | null>(null);
  loading = signal<boolean>(false);

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    if (params['email']) {
      this.email = decodeURIComponent(params['email']);
    }
    if (params['reason'] === 'not_registered') {
      this.infoNotice.set(
        `Your Google account (${this.email || 'provided'}) is not yet registered. Please complete registration below to create your account.`
      );
    }
  }

  onSubmit(): void {
    this.errorMessage.set(null);

    if (!this.firstName.trim() || !this.lastName.trim() || !this.email.trim() || !this.password.trim()) {
      this.errorMessage.set('Please fill in all required fields.');
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage.set('Password must be at least 6 characters long.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage.set('Passwords do not match. Please re-enter.');
      return;
    }

    this.loading.set(true);

    this.authService.register({
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      email: this.email.trim().toLowerCase(),
      phone: this.phone.trim(),
      password: this.password.trim(),
      role: 'USER'
    }).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Registration Successful',
          detail: 'Your account has been created! Please sign in.',
          life: 5000
        });

        this.router.navigate(['/login'], {
          queryParams: {
            registered: 'true',
            email: this.email.trim().toLowerCase()
          }
        });
      },
      error: (err) => {
        this.loading.set(false);
        const detail = err.error?.message || 'Registration failed. Please check your information and try again.';
        this.errorMessage.set(detail);
      }
    });
  }
}

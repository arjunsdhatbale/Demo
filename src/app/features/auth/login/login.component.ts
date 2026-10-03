import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Card,
    InputText,
    Password,
    Button
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  username = '';
  password = '';
  errorMessage = signal<string | null>(null);
  loading = signal<boolean>(false);

  quickFill() {
    this.username = 'user';
    this.password = 'password';
    this.errorMessage.set(null);
  }

  loginWithGoogle() {
    this.authService.loginWithGoogle();
  }

  onSubmit() {
    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage.set('Please enter both username and password.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.login({
      username: this.username.trim(),
      password: this.password.trim()
    }).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Authenticated',
          detail: `Welcome, ${response.data.username}!`
        });

        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.loading.set(false);
        const detail = err.error?.message || 'Invalid username or password. Please try again.';
        this.errorMessage.set(detail);
      }
    });
  }
}

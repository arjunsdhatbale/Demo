import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgressSpinner } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-oauth2-callback',
  standalone: true,
  imports: [CommonModule, ProgressSpinner],
  template: `
    <div class="callback-container">
      <div class="callback-card">
        <p-progressSpinner
          strokeWidth="4"
          animationDuration=".8s"
          [style]="{ width: '56px', height: '56px' }">
        </p-progressSpinner>
        <h2>Completing Google Sign-In...</h2>
        <p>Please wait while we verify your account and redirect you to the dashboard.</p>
      </div>
    </div>
  `,
  styles: [`
    .callback-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at top right, #1e1b4b 0%, #0f172a 70%);
      padding: 1.5rem;
    }
    .callback-card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 3rem 2.5rem;
      text-align: center;
      max-width: 440px;
      width: 100%;
      color: #f8fafc;
      box-shadow: 0 20px 35px -5px rgba(0, 0, 0, 0.4);
    }
    h2 {
      margin: 1.5rem 0 0.5rem 0;
      font-size: 1.3rem;
      font-weight: 700;
    }
    p {
      color: #94a3b8;
      font-size: 0.9rem;
      line-height: 1.5;
    }
  `]
})
export class OAuth2CallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    const token = params['token'];
    const username = params['username'];
    const email = params['email'];

    if (token) {
      this.authService.handleOAuthSuccess(token, username, email);

      this.messageService.add({
        severity: 'success',
        summary: 'Google Sign-In Successful',
        detail: `Welcome, ${username || 'User'}!`
      });

      // Brief delay so user sees smooth transition
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 500);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Authentication Failed',
        detail: 'Could not complete Google authentication.'
      });
      this.router.navigate(['/login']);
    }
  }
}

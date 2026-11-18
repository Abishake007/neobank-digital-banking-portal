import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-account-action',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './account-action.component.html',
  styleUrls: ['./account-action.component.css']
})
export class AccountActionComponent implements OnInit {
  token = '';
  email = '';
  password = '';
  confirmPassword = '';
  message = '';
  error = '';
  processing = false;
  completed = false;

  get passwordMeetsRequirements(): boolean {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/.test(this.password);
  }

  constructor(private route: ActivatedRoute, private authService: AuthService) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  requestResetLink(): void {
    this.error = '';
    this.message = '';
    this.processing = true;
    this.authService.requestPasswordReset(this.email.trim()).subscribe({
      next: response => {
        this.message = response.message;
        this.processing = false;
      },
      error: () => {
        this.error = 'Email delivery is unavailable. Please try again later or contact support.';
        this.processing = false;
      }
    });
  }

  resetPassword(): void {
    this.error = '';
    this.message = '';
    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }
    if (!this.passwordMeetsRequirements) {
      this.error = 'Use 8–72 characters with uppercase and lowercase letters, a number, and a special character.';
      return;
    }
    this.processing = true;
    this.authService.completePasswordReset(this.token, this.password).subscribe({
      next: response => {
        this.message = response.message;
        this.completed = true;
        this.processing = false;
      },
      error: error => {
        this.error = error.error?.detail || 'This reset link is invalid or expired. Request a new one.';
        this.processing = false;
      }
    });
  }
}

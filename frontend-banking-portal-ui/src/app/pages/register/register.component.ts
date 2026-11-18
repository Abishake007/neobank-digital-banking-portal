import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  error = '';
  accountNumber = '';
  submitting = false;

  get passwordMeetsRequirements(): boolean {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/.test(this.password);
  }

  constructor(private authService: AuthService) {}

  register() {
    this.error = '';
    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }
    if (!this.passwordMeetsRequirements) {
      this.error = 'Use 8–72 characters with uppercase and lowercase letters, a number, and a special character.';
      return;
    }

    this.submitting = true;
    this.authService.register(this.name.trim(), this.email.trim(), this.password).subscribe({
      next: response => {
        this.accountNumber = response.accountNumber;
        this.submitting = false;
      },
      error: error => {
        this.error = error.status === 409
          ? 'An account with this email already exists.'
          : error.status === 400
            ? 'Check your name and email. Password must be 8–72 characters and include uppercase, lowercase, a number, and a special character.'
            : 'We could not create your account. Please try again.';
        this.submitting = false;
      }
    });
  }
}

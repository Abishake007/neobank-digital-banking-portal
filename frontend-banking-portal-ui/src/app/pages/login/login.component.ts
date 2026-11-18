import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  email = '';
  password = '';
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router   // ✅ REQUIRED
  ) {}

  login() {
  this.authService.login(this.email, this.password).subscribe({
    next: (res) => {
      // ✅ SAVE TOKENS
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('refreshToken', res.refreshToken);

      // ✅ NAVIGATE
      this.router.navigate(['/dashboard']);
    },
    error: (err) => {
      console.error('LOGIN ERROR:', err);
      this.error = err.status === 403
        ? (typeof err.error === 'string' ? err.error : 'This account is disabled.')
        : 'Invalid credentials';
    }
  });
}
  
}

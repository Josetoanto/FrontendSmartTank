import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private http = inject(HttpClient);
  private router = inject(Router);

  isLoading = false;

  handleLogin(event: Event, email: string, password: string): void {
    event.preventDefault();

    if (this.isLoading) return;
    this.isLoading = true;

    if (!email || !password) {
      this.showErrorMessage('Por favor llena todos los campos');
      this.isLoading = false;
      return;
    }

    const body = { email, password };

    this.http.post<{ token: string }>('http://127.0.0.1:8000/user/login', body).subscribe({
      next: (res) => {
        this.isLoading = false;
        console.log('Login exitoso', res);
        // Guarda el token en localStorage
        if (res && res.token) {
          localStorage.setItem('authToken', res.token);
        }
        this.showSuccessMessage('Login exitoso!');
        this.router.navigate(['/water']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error de login', err);
        this.showErrorMessage('Credenciales incorrectas o error del servidor.');
      }
    });
  }

  onForgotPassword(event: Event): void {
    event.preventDefault();
    this.showInfoMessage('Funcionalidad de recuperación aún no implementada.');
  }

  loginWithGoogle(): void {
    this.showInfoMessage('Google login no implementado todavía.');
  }

  loginWithGithub(): void {
    this.showInfoMessage('GitHub login no implementado todavía.');
  }

  loginWithFacebook(): void {
    this.showInfoMessage('Facebook login no implementado todavía.');
  }

  private showSuccessMessage(message: string): void {
    alert(message);
  }

  private showErrorMessage(message: string): void {
    alert(message);
  }

  private showInfoMessage(message: string): void {
    alert(message);
  }
}
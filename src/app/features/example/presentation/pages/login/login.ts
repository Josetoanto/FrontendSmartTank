import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

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

    this.http.post<{ token: string }>('https://smarttank.backend.upprojects.online/user/login', body).subscribe({
      next: (res) => {
        this.isLoading = false;
        console.log('Login exitoso', res);
        if (res && res.token) {
          localStorage.setItem('authToken', res.token);
        }
        this.showSuccessMessage('Login exitoso!');
        this.router.navigate(['/water-frecuence']);
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
    Swal.fire({
      icon: 'success',
      title: message,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    });
  }

  private showErrorMessage(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      confirmButtonText: 'Aceptar'
    });
  }

  private showInfoMessage(message: string): void {
    Swal.fire({
      icon: 'info',
      title: 'Información',
      text: message,
      confirmButtonText: 'Entendido'
    });
  }
}

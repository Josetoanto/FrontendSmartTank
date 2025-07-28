import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  formularioRegistro: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.formularioRegistro = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      repetirContrasena: ['', [Validators.required]]
    }, { validators: this.validarCoincidenciaContrasena });
  }

  validarCoincidenciaContrasena(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('contrasena')?.value;
    const confirm = group.get('repetirContrasena')?.value;
    return pass === confirm ? null : { noCoincide: true };
  }

  registrarUsuario() {
    if (this.formularioRegistro.valid) {
      const { correo, contrasena } = this.formularioRegistro.value;
      const usuario = {
        id_user: '',
        email: correo,
        password: contrasena
      };

      // Reemplaza la URL que no funciona si no se desea duplicar
      this.http.post('https://smarttank.backend.upprojects.online/user/signup', usuario).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: '¡Registro exitoso!',
            text: 'Tu cuenta ha sido creada correctamente.',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          });
          this.formularioRegistro.reset();
          this.router.navigate(['/login']);
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error al registrar',
            text: 'Ocurrió un problema al registrar tu cuenta.',
          });
          console.error(err);
        }
      });

    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Campos inválidos',
        text: 'Por favor llena todos los campos correctamente.',
      });
    }
  }

  registrarseConGoogle() {
    Swal.fire({
      icon: 'info',
      title: 'Google',
      text: 'Registro con Google no implementado todavía.',
    });
  }

  registrarseConGithub() {
    Swal.fire({
      icon: 'info',
      title: 'GitHub',
      text: 'Registro con GitHub no implementado todavía.',
    });
  }

  registrarseConFacebook() {
    Swal.fire({
      icon: 'info',
      title: 'Facebook',
      text: 'Registro con Facebook no implementado todavía.',
    });
  }

  cambiarModo(event: Event) {
    event.preventDefault();
  }
}

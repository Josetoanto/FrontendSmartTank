import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

      this.http.post('http://127.0.0.1:8000/user/signup', usuario).subscribe({
        next: (res) => {
          alert('Usuario registrado correctamente');
          this.formularioRegistro.reset();
          this.router.navigate(['/login']);
        },
        error: (err) => {
          alert('Error al registrar usuario');
          console.error(err);
        }
      });
    } else {
      alert('Por favor llena todos los campos correctamente');
    }
  }

  registrarseConGoogle() {
    alert('Registro con Google no implementado');
  }

  registrarseConGithub() {
    alert('Registro con GitHub no implementado');
  }

  registrarseConFacebook() {
    alert('Registro con Facebook no implementado');
  }

  cambiarModo(event: Event) {
    event.preventDefault();
  }
}
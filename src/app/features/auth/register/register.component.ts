import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: false
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  showPassword = false;


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      mail: ['', [Validators.required, Validators.email]],
      pwd: ['', [Validators.required, Validators.minLength(6)]],
      confirmPwd: ['', Validators.required],
      userType: ['Common']
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit() {
    // Se já estiver autenticado, redireciona para dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('pwd')?.value;
    const confirmPassword = form.get('confirmPwd')?.value;

    if (password !== confirmPassword) {
      form.get('confirmPwd')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }

    return null;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formData = this.registerForm.value;

    const { confirmPwd, ...registerData } = formData;

    this.authService.register(registerData)
      .subscribe({
        next: () => {
          this.loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Registro realizado com sucesso! Faça login para continuar.'
          });
        },
        error: (error) => {
          this.loading = false;
          console.error('Erro de registro:', error);

          let errorMessage = 'Ocorreu um erro ao tentar realizar o registro';

          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (typeof error.error === 'string') {
            try {
              const parsedError = JSON.parse(error.error);
              if (parsedError.message) {
                errorMessage = parsedError.message;
              }
            } catch (e) {
            }
          } else if (error.message) {
            errorMessage = error.message;
          }

          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: errorMessage,
            life: 5000
          });
        }
      });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
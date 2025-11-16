import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      mail: ['', [Validators.required]],
      pwd: ['', Validators.required],
      remember: [false]
    });
  }

  ngOnInit() {
    // Verificação de autenticação
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  formatCPF(event: any): void {
    const input = event.target;
    let value = input.value.replace(/\D/g, '');

    // Verifica se é um email
    if (/[a-zA-Z@]/.test(input.value)) {
      return;
    }

    // Limita a 11 dígitos
    if (value.length > 11) {
      value = value.slice(0, 11);
    }

    // Formatação do CPF
    if (value.length > 9) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (value.length > 6) {
      value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (value.length > 3) {
      value = value.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }

    input.value = value;
    this.loginForm.get('mail')?.setValue(value);
  }

  forgotPassword(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Recuperação de Senha',
      detail: 'Um email de recuperação será enviado para o seu endereço cadastrado.'
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return; 
    }

    this.loading = true;
    const { mail, pwd } = this.loginForm.value;

    this.authService.login({ mail, pwd, name: mail })
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Login realizado com sucesso!'
          });
        },
        error: (error) => {
          this.loading = false;
          console.error('Erro de login:', error);

          let errorMessage = 'Falha na autenticação. Verifique suas credenciais.';

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
          }

          if (error.status === 401) {
            errorMessage = 'Email ou senha incorretos. Por favor, tente novamente.';
          }

          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: errorMessage
          });
        }
      });
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
}
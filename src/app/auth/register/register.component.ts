import { Component, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { SharedModule } from '../../theme/shared/shared.module';
import { AuthService } from '../../core/services/auth.service';
import { AuthRegisterRequest, Role } from '../../shared/models/types';

@Component({
  selector: 'app-auth-register',
  imports: [SharedModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  error = signal<string | null>(null);
  loading = signal(false);

  form = this.fb.nonNullable.group({
    role: ['CANDIDAT', [Validators.required]],
    nom: ['', [Validators.required]],
    prenom: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    motDePasse: ['', [Validators.required, Validators.minLength(8)]],
    telephone: ['', [Validators.required]],
    adresse: '',
    dateNaissance: '',
    niveauEtude: '',
    experience: 0,
    nomEntreprise: '',
    adresseEntreprise: '',
    secteurActivite: '',
    description: '',
    logo: ''
  });

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.updateValidators(this.form.value.role as Role);
    this.form.get('role')?.valueChanges.subscribe((role) => {
      this.updateValidators(role as Role);
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const payload = this.form.getRawValue() as AuthRegisterRequest;

    this.authService.register(payload).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.navigateByRole(response.user.role as Role);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Registration failed');
      }
    });
  }

  private updateValidators(role: Role): void {
    const candidatFields = ['adresse', 'dateNaissance', 'niveauEtude', 'experience'];
    const entrepriseFields = ['nomEntreprise', 'adresseEntreprise', 'secteurActivite', 'description'];

    candidatFields.forEach((field) => {
      const control = this.form.get(field);
      if (!control) {
        return;
      }
      control.clearValidators();
      if (role === 'CANDIDAT') {
        control.addValidators([Validators.required]);
      }
      control.updateValueAndValidity({ emitEvent: false });
    });

    entrepriseFields.forEach((field) => {
      const control = this.form.get(field);
      if (!control) {
        return;
      }
      control.clearValidators();
      if (role === 'ENTREPRISE') {
        control.addValidators([Validators.required]);
      }
      control.updateValueAndValidity({ emitEvent: false });
    });
  }

  private navigateByRole(role: Role): void {
    if (role === 'CANDIDAT') {
      this.router.navigate(['/candidat/dashboard']);
      return;
    }
    if (role === 'ENTREPRISE') {
      this.router.navigate(['/entreprise/dashboard']);
      return;
    }
    this.router.navigate(['/admin/dashboard']);
  }
}

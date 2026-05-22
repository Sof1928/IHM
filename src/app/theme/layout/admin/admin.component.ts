import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TokenService } from '../../../core/services/token.service';
import { Role } from '../../../shared/models/types';

@Component({
  selector: 'app-admin-layout',
  imports: [CommonModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
  role: Role | null = this.tokenService.getRole();

  constructor(private tokenService: TokenService, private router: Router) {}

  get isAdmin(): boolean {
    return this.role === 'SUPER_ADMIN';
  }

  get isCandidat(): boolean {
    return this.role === 'CANDIDAT';
  }

  get isEntreprise(): boolean {
    return this.role === 'ENTREPRISE';
  }

  logout(): void {
    this.tokenService.clearToken();
    this.router.navigate(['/login']);
  }
}

import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
  standalone: false
})
export class TopbarComponent implements OnInit {
  isUserMenuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  get userEmail(): string {
    const user = this.authService.getCurrentUser();
    return user?.mail || '';
  }

  get userInitials(): string {
    const user = this.authService.getCurrentUser();
    return user?.name?.charAt(0).toUpperCase() || 'U';
  }

  toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeUserMenu(): void {
    this.isUserMenuOpen = false;
  }

  navigateToProfile(): void {
    this.isUserMenuOpen = false;
    // Implemente a navegação para o perfil quando disponível
    // this.router.navigate(['/profile']);
    console.log('Navegar para perfil');
  }

  navigateToSettings(): void {
    this.isUserMenuOpen = false;
    // Implemente a navegação para configurações quando disponível
    // this.router.navigate(['/settings']);
    console.log('Navegar para configurações');
  }

  logout(): void {
    this.isUserMenuOpen = false;
    this.authService.logout();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.isUserMenuOpen) {
      this.isUserMenuOpen = false;
    }
  }
}
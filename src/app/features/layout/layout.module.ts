// src/app/features/layout/layout.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';

import { TopbarComponent } from './topbar/topbar.component';
import { LayoutComponent } from './layout/layout.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ClickOutsideDirective } from '../../core/directives/click-outside.directive';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadChildren: () => import('../dashboard/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'calculators',
        loadChildren: () => import('../calculators/calculators.module').then(m => m.CalculatorsModule)
      }
    ]
  }
];

@NgModule({
  declarations: [
    LayoutComponent,
    SidebarComponent,
    TopbarComponent,
    ClickOutsideDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    // PrimeNG
    MenubarModule,
    ButtonModule,
    AvatarModule,
    MenuModule,
    RippleModule,
    TooltipModule,
    BadgeModule,
    InputTextModule,
    DividerModule
  ]
})
export class LayoutModule { }
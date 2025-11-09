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

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      /* 
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full'
          },
          {
            path: 'dashboard',
            loadChildren: () => import('../../dashboard/dashboard/dashboard.module').then(m => m.DashboardModule)
          },
          {
            path: 'devices',
            loadChildren: () => import('../../devices/devices.module').then(m => m.DevicesModule)
          }
          Outras rotas serão adicionadas conforme os módulos forem criados
          {
            path: 'protocols',
            loadChildren: () => import('../../protocols/protocols.module').then(m => m.ProtocolsModule)
          },
          {
            path: 'messages',
            loadChildren: () => import('../../messages/messages.module').then(m => m.MessagesModule)
          },
          {
            path: 'users',
            loadChildren: () => import('../../users/users.module').then(m => m.UsersModule)
          } */
    ]
  }
];

@NgModule({
  declarations: [
    LayoutComponent,
    SidebarComponent,
    TopbarComponent
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
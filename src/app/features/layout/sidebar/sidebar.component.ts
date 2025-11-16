import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: false
})
export class SidebarComponent implements OnInit {
  calculatorsExpanded = false;
  menuItems = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      routerLink: '/dashboard'
    },
    {
      label: 'Calculadoras',
      icon: 'pi pi-calculator',
      items: [
        {
          label: 'Cálculo de Potência',
          icon: 'pi pi-bolt',
          routerLink: '/calculators/power'
        },
        {
          label: 'Cálculo de Tensão',
          icon: 'pi pi-sync',
          disabled: true
        },
        {
          label: 'Comparativo de Canecas',
          icon: 'pi pi-chart-bar',
          routerLink: '/calculators/comparison'
        }
      ]
    }
  ];

  constructor(private router: Router) { }

  ngOnInit() {
  }

  toggleCalculators(): void {
    this.calculatorsExpanded = !this.calculatorsExpanded;
  }
}
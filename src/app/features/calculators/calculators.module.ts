import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ChartModule } from 'primeng/chart';
import { PowerCalculatorComponent } from './power-calculator/power-calculator.component';
import { ComparisonCalculatorComponent } from './comparison-calculator/comparison-calculator.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { Dialog } from 'primeng/dialog';

const routes: Routes = [
  {
    path: 'power',
    component: PowerCalculatorComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'comparison',
    component: ComparisonCalculatorComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  declarations: [
    PowerCalculatorComponent,
    ComparisonCalculatorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    CardModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DividerModule,
    TooltipModule,
    DialogModule,
    ScrollPanelModule,
    TableModule,
    ToastModule,
    ChartModule,
    Dialog
  ]
})
export class CalculatorsModule { }
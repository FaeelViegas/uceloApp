import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CalculatorService } from '../../../core/services/calculator.service';
import { PowerCalculationRequest, PowerCalculationResponse } from '../../../core/models/power-calculation.model';

@Component({
  selector: 'app-power-calculator',
  templateUrl: './power-calculator.component.html',
  styleUrls: ['./power-calculator.component.scss'],
  standalone: false
})
export class PowerCalculatorComponent implements OnInit {
  // Formulário
  calculationForm: FormGroup;

  // Estados
  calculating = false;
  saving = false;
  showSaveDialog = false;
  calculationName: string = '';

  // Resultados e histórico
  calculationResult: PowerCalculationResponse | null = null;
  savedCalculations: PowerCalculationResponse[] = [];
  filteredCalculations: PowerCalculationResponse[] = [];
  selectedCalculation: PowerCalculationResponse | null = null;

  // Pesquisa e ordenação
  searchQuery: string = '';
  currentSort: 'date' | 'power' = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';

  constructor(
    private fb: FormBuilder,
    private calculatorService: CalculatorService,
    private messageService: MessageService
  ) {
    this.calculationForm = this.createForm();
  }

  ngOnInit() {
    this.loadSavedCalculations();
  }

  createForm(): FormGroup {
    return this.fb.group({
      height: [38, [Validators.required, Validators.min(1), Validators.max(1000)]],
      rotation: [100, [Validators.required, Validators.min(1), Validators.max(1000)]],
      capacity: [100, [Validators.required, Validators.min(1), Validators.max(10000)]],
      gravity: [9.81, [Validators.required, Validators.min(9), Validators.max(10)]],
      generalEfficiency: [0.85, [Validators.required, Validators.min(0.1), Validators.max(1)]],
      efficiency: [0.9, [Validators.required, Validators.min(0.1), Validators.max(1)]],
      powerFactor: [0.8, [Validators.required, Validators.min(0.1), Validators.max(1)]],
      serviceFactor: [1.5, [Validators.required, Validators.min(1), Validators.max(2)]]
    });
  }

  loadSavedCalculations() {
    this.calculatorService.getUserPowerCalculations().subscribe({
      next: (calculations) => {
        this.savedCalculations = calculations;
        this.filterCalculations();
      },
      error: (error) => {
        console.error('Erro ao carregar cálculos salvos:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar os cálculos salvos.'
        });
      }
    });
  }

  calculate() {
    if (this.calculationForm.invalid) {
      this.calculationForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Por favor, preencha todos os campos corretamente.'
      });
      return;
    }

    this.calculating = true;
    const request: PowerCalculationRequest = this.calculationForm.value;

    this.calculatorService.calculatePower(request).subscribe({
      next: (result) => {
        this.calculationResult = result;
        this.calculating = false;
      },
      error: (error) => {
        console.error('Erro ao calcular potência:', error);
        this.calculating = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Ocorreu um erro ao calcular. Tente novamente.'
        });
      }
    });
  }

  openSaveDialog() {
    if (!this.calculationResult) {
      this.messageService.add({
        severity: 'info',
        summary: 'Informação',
        detail: 'Realize um cálculo antes de salvar.'
      });
      return;
    }

    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
    this.calculationName = `Elevador - ${formattedDate}`;
    this.showSaveDialog = true;
  }

  saveCalculation() {
    if (!this.calculationName.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Digite um nome para o cálculo.'
      });
      return;
    }

    this.saving = true;
    const request: PowerCalculationRequest = {
      ...this.calculationForm.value,
      name: this.calculationName
    };

    this.calculatorService.savePowerCalculation(request).subscribe({
      next: (result) => {
        this.saving = false;
        this.showSaveDialog = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Cálculo salvo com sucesso!'
        });
        this.loadSavedCalculations();
      },
      error: (error) => {
        console.error('Erro ao salvar cálculo:', error);
        this.saving = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Ocorreu um erro ao salvar o cálculo. Tente novamente.'
        });
      }
    });
  }

  loadCalculation(calculation: PowerCalculationResponse) {
    if (!calculation.id) return;

    this.selectedCalculation = calculation;

    this.calculatorService.getCalculationById(calculation.id).subscribe({
      next: (data) => {
        this.calculationResult = data;
      },
      error: (error) => {
        console.error('Erro ao carregar cálculo:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Ocorreu um erro ao carregar o cálculo. Tente novamente.'
        });
      }
    });
  }

  resetForm() {
    this.calculationForm.reset({
      height: 38,
      rotation: 100,
      capacity: 100,
      gravity: 9.81,
      generalEfficiency: 0.85,
      efficiency: 0.9,
      powerFactor: 0.8,
      serviceFactor: 1.5
    });
    this.calculationResult = null;
    this.selectedCalculation = null;
  }

  // Incrementar/decrementar valores
  incrementValue(controlName: string, step: number = 1) {
    const control = this.calculationForm.get(controlName);
    if (control) {
      const currentValue = control.value || 0;
      control.setValue(parseFloat((currentValue + step).toFixed(2)));
    }
  }

  decrementValue(controlName: string, step: number = 1) {
    const control = this.calculationForm.get(controlName);
    if (control) {
      const currentValue = control.value || 0;
      control.setValue(parseFloat((currentValue - step).toFixed(2)));
    }
  }

  // Filtragem e ordenação
  filterCalculations() {
    let filtered = [...this.savedCalculations];

    // Aplicar filtro de busca
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(calc =>
        (calc.name && calc.name.toLowerCase().includes(query)) ||
        calc.powerKW.toString().includes(query) ||
        calc.powerCV.toString().includes(query)
      );
    }

    // Aplicar ordenação
    filtered = this.sortCalculations(filtered);

    this.filteredCalculations = filtered;
  }

  sortCalculations(calculations: PowerCalculationResponse[]): PowerCalculationResponse[] {
    return calculations.sort((a, b) => {
      let result = 0;

      if (this.currentSort === 'date') {
        // Ordenar por data
        const dateA = a.calculatedAt ? new Date(a.calculatedAt).getTime() : 0;
        const dateB = b.calculatedAt ? new Date(b.calculatedAt).getTime() : 0;
        result = dateA - dateB;
      } else if (this.currentSort === 'power') {
        // Ordenar por potência
        result = a.powerKW - b.powerKW;
      }

      // Inverter se a direção for descendente
      return this.sortDirection === 'asc' ? result : -result;
    });
  }

  setSortOrder(field: 'date' | 'power') {
    // Se clicar no mesmo campo, inverte a direção
    if (this.currentSort === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSort = field;
      this.sortDirection = 'desc'; // Padrão ao mudar de campo
    }

    this.filterCalculations();
  }

  clearSearch() {
    this.searchQuery = '';
    this.filterCalculations();
  }
}
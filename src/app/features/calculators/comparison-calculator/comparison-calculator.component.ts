import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CalculatorService } from '../../../core/services/calculator.service';
import {
  ComparisonCalculationRequest,
  ComparisonCalculationResponse,
  BucketListItemDto,
  MaterialDto
} from '../../../core/models/comparison-calculation.model';

@Component({
  selector: 'app-comparison-calculator',
  templateUrl: './comparison-calculator.component.html',
  styleUrls: ['./comparison-calculator.component.scss'],
  standalone: false
})
export class ComparisonCalculatorComponent implements OnInit {
  // FormulÃ¡rio
  calculationForm: FormGroup;

  // Estados
  calculating = false;
  saving = false;
  showSaveDialog = false;
  calculationName: string = '';
  loadingBuckets = false;
  loadingMaterials = false;
  
  // Estados do Insight IA
  generatingInsight = false;
  insightError: string | null = null;

  // Resultados e histÃ³rico
  calculationResult: ComparisonCalculationResponse | null = null;
  savedCalculations: ComparisonCalculationResponse[] = [];
  filteredCalculations: ComparisonCalculationResponse[] = [];
  selectedCalculation: ComparisonCalculationResponse | null = null;

  // Dados das canecas e materiais
  buckets: BucketListItemDto[] = [];
  materials: MaterialDto[] = [];

  // Pesquisa e ordenaÃ§Ã£o
  searchQuery: string = '';
  currentSort: 'date' | 'capacity' = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Propriedades para os grÃ¡ficos
  barChartData: any = { labels: [], datasets: [] };
  barChartOptions: any = {};
  radarChartData: any = { labels: [], datasets: [] };
  radarChartOptions: any = {};

  bucketOptions: { label: string; value: number }[] = [];
  selectedDropdown: string | null = null;

  constructor(
    private fb: FormBuilder,
    private calculatorService: CalculatorService,
    private messageService: MessageService
  ) {
    this.calculationForm = this.createForm();
  }

  ngOnInit() {
    this.loadBuckets();
    this.loadMaterials();
    this.loadSavedCalculations();
    this.initChartOptions();
  }


  // Inicializa opÃ§Ãµes dos grÃ¡ficos
  initChartOptions() {
    // OpÃ§Ãµes do grÃ¡fico de barras
    this.barChartOptions = {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Valor relativo (%)'
          }
        }
      }
    };

    // OpÃ§Ãµes do grÃ¡fico de radar
    this.radarChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        },
      },
      scales: {
        r: {
          angleLines: {
            display: true
          },
          suggestedMin: 0,
          suggestedMax: 100,
          ticks: {
            display: false
          }
        }
      }
    };
  }

  createForm(): FormGroup {
    return this.fb.group({
      speed: [3.0, [Validators.required, Validators.min(0.1), Validators.max(10)]],
      productDensity: [750, [Validators.required, Validators.min(100), Validators.max(5000)]],
      numberOfRows: [2, [Validators.required, Validators.min(1), Validators.max(10)]],
      pitch: [150, [Validators.required, Validators.min(50), Validators.max(500)]],
      filling: [95, [Validators.required, Validators.min(1), Validators.max(100)]],
      selectedBucketId: [null, Validators.required],
      comparisonBucketId: [null, Validators.required],
      selectedBucketUnitPrice: [null, [Validators.min(0)]],
      comparisonBucketUnitPrice: [null, [Validators.min(0)]],
    });
  }

  loadBuckets() {
    this.loadingBuckets = true;
    this.calculatorService.getBuckets().subscribe({
      next: (buckets) => {
        this.buckets = buckets;

        // Preparar as opÃ§Ãµes para os dropdowns
        this.bucketOptions = buckets.map(bucket => {
          return {
            label: `${bucket.code} (${bucket.dimensions}) - ${bucket.materialName}`,
            value: bucket.id
          };
        });

        this.loadingBuckets = false;
      },
      error: (error) => {
        console.error('Erro ao carregar canecas:', error);
        this.loadingBuckets = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'NÃ£o foi possÃ­vel carregar a lista de canecas.'
        });
      }
    });
  }

  loadMaterials() {
    this.loadingMaterials = true;
    this.calculatorService.getMaterials().subscribe({
      next: (materials) => {
        this.materials = materials;
        this.loadingMaterials = false;
      },
      error: (error) => {
        console.error('Erro ao carregar materiais:', error);
        this.loadingMaterials = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'NÃ£o foi possÃ­vel carregar a lista de materiais.'
        });
      }
    });
  }

  loadSavedCalculations() {
    this.calculatorService.getUserComparisonCalculations().subscribe({
      next: (calculations) => {
        this.savedCalculations = calculations;
        this.filterCalculations();
      },
      error: (error) => {
        console.error('Erro ao carregar cÃ¡lculos salvos:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'NÃ£o foi possÃ­vel carregar os cÃ¡lculos salvos.'
        });
      }
    });
  }

  calculate() {
    if (this.calculationForm.invalid) {
      this.calculationForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'AtenÃ§Ã£o',
        detail: 'Por favor, preencha todos os campos corretamente.'
      });
      return;
    }

    this.calculating = true;
    const request: ComparisonCalculationRequest = this.calculationForm.value;

    this.calculatorService.calculateComparison(request).subscribe({
      next: (result) => {
        this.calculationResult = result;
        this.prepareChartData();
        this.calculating = false;
      },
      error: (error) => {
        console.error('Erro ao calcular comparativo:', error);
        this.calculating = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Ocorreu um erro ao calcular. Tente novamente.'
        });
      }
    });
  }

  // Prepara os dados para os grÃ¡ficos
  prepareChartData() {
    if (!this.calculationResult) return;

    // Dados para o grÃ¡fico de barras (caracterÃ­sticas importantes)
    const barChartKeys = [
      { key: 'volumeDifference', label: 'Volume' },
      { key: 'capacityDifference', label: 'Capacidade' },
      { key: 'abrasionResistanceDifference', label: 'ResistÃªncia Ã  abrasÃ£o' },
      { key: 'tractionResistanceDifference', label: 'ResistÃªncia Ã  traÃ§Ã£o' },
      { key: 'pricePerMeterDifference', label: 'PreÃ§o por metro' }
    ];

    const barLabels = barChartKeys.map(item => item.label);
    const barData = barChartKeys.map(item => this.calculationResult!.comparisonResult[item.key]);

    this.barChartData = {
      labels: barLabels,
      datasets: [
        {
          label: 'DiferenÃ§a (%)',
          data: barData,
          backgroundColor: barData.map(value => value >= 0 ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)'),
          borderColor: barData.map(value => value >= 0 ? 'rgb(75, 192, 192)' : 'rgb(255, 99, 132)'),
          borderWidth: 1
        }
      ]
    };

    // Dados para o grÃ¡fico de radar (comparaÃ§Ã£o normalizada)
    const radarChartKeys = [
      { key: 'volume', label: 'Volume', normalize: true },
      { key: 'capacity', label: 'Capacidade', normalize: true },
      { key: 'abrasionResistance', label: 'ResistÃªncia Ã  abrasÃ£o', normalize: true },
      { key: 'tractionResistance', label: 'ResistÃªncia Ã  traÃ§Ã£o', normalize: true },
      { key: 'pricePerMeter', label: 'PreÃ§o por metro', normalize: true, invert: true }
    ];

    const radarLabels = radarChartKeys.map(item => item.label);

    // Normalizar valores para 0-100
    const normalizeValue = (key: string, value: number, invert: boolean = false) => {
      const selected = this.calculationResult!.selectedBucket[key];
      const comparison = this.calculationResult!.comparisonBucket[key];
      const max = Math.max(selected, comparison);

      // Para preÃ§o, menor Ã© melhor, entÃ£o invertemos
      if (invert) {
        return 100 - (value / max * 100);
      }

      return value / max * 100;
    };

    const selectedBucketData = radarChartKeys.map(item =>
      normalizeValue(
        item.key,
        this.calculationResult!.selectedBucket[item.key],
        item.invert
      )
    );

    const comparisonBucketData = radarChartKeys.map(item =>
      normalizeValue(
        item.key,
        this.calculationResult!.comparisonBucket[item.key],
        item.invert
      )
    );

    this.radarChartData = {
      labels: radarLabels,
      datasets: [
        {
          label: this.calculationResult.selectedBucket.code,
          data: selectedBucketData,
          backgroundColor: 'rgba(13, 127, 242, 0.2)',
          borderColor: 'rgb(13, 127, 242)',
          pointBackgroundColor: 'rgb(13, 127, 242)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(13, 127, 242)'
        },
        {
          label: this.calculationResult.comparisonBucket.code,
          data: comparisonBucketData,
          backgroundColor: 'rgba(242, 127, 13, 0.2)',
          borderColor: 'rgb(242, 127, 13)',
          pointBackgroundColor: 'rgb(242, 127, 13)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(242, 127, 13)'
        }
      ]
    };
  }

  openSaveDialog() {
    if (!this.calculationResult) {
      this.messageService.add({
        severity: 'info',
        summary: 'InformaÃ§Ã£o',
        detail: 'Realize um cÃ¡lculo antes de salvar.'
      });
      return;
    }

    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
    this.calculationName = `Comparativo - ${formattedDate}`;
    this.showSaveDialog = true;
  }

  saveCalculation() {
    if (!this.calculationName.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'AtenÃ§Ã£o',
        detail: 'Digite um nome para o cÃ¡lculo.'
      });
      return;
    }

    this.saving = true;
    const request: ComparisonCalculationRequest = {
      ...this.calculationForm.value,
      name: this.calculationName
    };

    this.calculatorService.saveComparisonCalculation(request).subscribe({
      next: (result) => {
        this.saving = false;
        this.showSaveDialog = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'CÃ¡lculo salvo com sucesso!'
        });
        this.loadSavedCalculations();
      },
      error: (error) => {
        console.error('Erro ao salvar cÃ¡lculo:', error);
        this.saving = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Ocorreu um erro ao salvar o cÃ¡lculo. Tente novamente.'
        });
      }
    });
  }

  loadCalculation(calculation: ComparisonCalculationResponse) {
    if (!calculation.id) return;

    this.selectedCalculation = calculation;

    this.calculatorService.getComparisonById(calculation.id).subscribe({
      next: (data) => {
        this.calculationResult = data;
        this.prepareChartData();

        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'CÃ¡lculo carregado com sucesso!'
        });
      },
      error: (error) => {
        console.error('Erro ao carregar cÃ¡lculo:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Ocorreu um erro ao carregar o cÃ¡lculo. Tente novamente.'
        });
      }
    });
  }

  resetForm() {
    this.calculationForm.reset({
      speed: 3.0,
      productDensity: 750,
      numberOfRows: 2,
      pitch: 150,
      filling: 95,
      selectedBucketId: null,
      comparisonBucketId: null,
      selectedBucketUnitPrice: null,
      comparisonBucketUnitPrice: null,
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

  // Filtragem e ordenaÃ§Ã£o
  filterCalculations() {
    let filtered = [...this.savedCalculations];

    // Aplicar filtro de busca
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(calc =>
        (calc.name && calc.name.toLowerCase().includes(query)) ||
        calc.selectedBucket.capacity.toString().includes(query) ||
        calc.comparisonBucket.capacity.toString().includes(query)
      );
    }

    // Aplicar ordenaÃ§Ã£o
    filtered = this.sortCalculations(filtered);

    this.filteredCalculations = filtered;
  }

  sortCalculations(calculations: ComparisonCalculationResponse[]): ComparisonCalculationResponse[] {
    return calculations.sort((a, b) => {
      let result = 0;

      if (this.currentSort === 'date') {
        // Ordenar por data
        const dateA = a.calculatedAt ? new Date(a.calculatedAt).getTime() : 0;
        const dateB = b.calculatedAt ? new Date(b.calculatedAt).getTime() : 0;
        result = dateA - dateB;
      } else if (this.currentSort === 'capacity') {
        // Ordenar por capacidade
        result = a.selectedBucket.capacity - b.selectedBucket.capacity;
      }

      // Inverter se a direÃ§Ã£o for descendente
      return this.sortDirection === 'asc' ? result : -result;
    });
  }

  setSortOrder(field: 'date' | 'capacity') {
    // Se clicar no mesmo campo, inverte a direÃ§Ã£o
    if (this.currentSort === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSort = field;
      this.sortDirection = 'desc'; // PadrÃ£o ao mudar de campo
    }

    this.filterCalculations();
  }

  clearSearch() {
    this.searchQuery = '';
    this.filterCalculations();
  }

  // Formatadores e auxiliares
  getDifferenceClass(value: number): string {
    if (value === 0) return 'neutral';
    if (value > 0) return 'positive';
    return 'negative';
  }

  formatDifference(value: number): string {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  }

  // MÃ©todo para formatar o valor absoluto da diferenÃ§a
  formatDifferenceAbs(value: number): string {
    return Math.abs(value).toFixed(2);
  }

  getBucketName(id: number): string {
    const bucket = this.buckets.find(b => b.id === id);
    return bucket ? bucket.code : '';
  }

  getMaterialName(id: number): string {
    const material = this.materials.find(m => m.id === id);
    return material ? material.name : '';
  }



  toggleDropdown(dropdownId: string) {
    // Feche outros dropdowns abertos
    if (this.selectedDropdown && this.selectedDropdown !== dropdownId) {
      const element = document.getElementById(this.selectedDropdown);
      if (element) {
        element.classList.remove('open');
        const parent = element.closest('.custom-dropdown');
        if (parent) {
          parent.classList.remove('open');
        }
      }
    }

    const dropdown = document.getElementById(dropdownId);
    if (dropdown) {
      const isOpen = dropdown.classList.contains('open');
      dropdown.classList.toggle('open');

      const parent = dropdown.closest('.custom-dropdown');
      if (parent) {
        parent.classList.toggle('open');
      }

      // Atualizar o dropdown selecionado
      this.selectedDropdown = isOpen ? null : dropdownId;
    }
  }

  filterOptions(searchInputId: string, optionsListId: string) {
    const searchInput = document.getElementById(searchInputId) as HTMLInputElement;
    const optionsList = document.getElementById(optionsListId);

    if (searchInput && optionsList) {
      const searchText = searchInput.value.toLowerCase();

      // Filtrar as opÃ§Ãµes
      Array.from(optionsList.children).forEach(option => {
        const optionText = option.textContent?.toLowerCase() || '';
        (option as HTMLElement).style.display = optionText.includes(searchText) ? 'block' : 'none';
      });
    }
  }

  selectOption(controlName: string, value: number, dropdownId: string, label: string) {
    // Atualizar o valor no formulÃ¡rio
    const control = this.calculationForm.get(controlName);
    if (control) {
      control.setValue(value);
    }

    // Atualizar o texto exibido
    const displayInput = document.getElementById(controlName === 'selectedBucketId' ? 'selectedBucketDisplay' : 'comparisonBucketDisplay') as HTMLInputElement;
    if (displayInput) {
      displayInput.value = label;
    }

    // Fechar o dropdown
    this.toggleDropdown(dropdownId);
  }


  getSelectedBucketLabel(controlName: string): string {
    const control = this.calculationForm.get(controlName);
    if (control && control.value) {
      const selectedOption = this.bucketOptions.find(bucket => bucket.value === control.value);
      return selectedOption ? selectedOption.label : '';
    }
    return '';
  }


  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.selectedDropdown) {
      const dropdown = document.getElementById(this.selectedDropdown);
      if (dropdown) {
        const target = event.target as HTMLElement;
        // Verifica se o clique foi fora do dropdown e do seu trigger
        const isOutsideDropdown = !dropdown.contains(target);
        const isOutsideDropdownTrigger = !target.closest('.custom-dropdown');

        if (isOutsideDropdown && isOutsideDropdownTrigger) {
          dropdown.classList.remove('open');
          const parent = dropdown.closest('.custom-dropdown');
          if (parent) {
            parent.classList.remove('open');
          }
          this.selectedDropdown = null;
        }
      }
    }
  }

  // Métodos para Insight IA
  generateInsight(regenerate: boolean = false): void {
    if (!this.calculationResult?.id) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Salve o cálculo antes de gerar o insight.'
      });
      return;
    }

    this.generatingInsight = true;
    this.insightError = null;

    this.calculatorService.generateComparisonInsight(this.calculationResult.id, regenerate).subscribe({
      next: (result) => {
        this.calculationResult = result;
        this.generatingInsight = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Insight gerado com sucesso!'
        });
      },
      error: (error) => {
        console.error('Erro ao gerar insight:', error);
        this.generatingInsight = false;
        this.insightError = 'Não foi possível gerar o insight. Tente novamente.';
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao gerar insight com IA.'
        });
      }
    });
  }

  copyInsightToClipboard(): void {
    if (!this.calculationResult?.insight?.text) return;

    navigator.clipboard.writeText(this.calculationResult.insight.text).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Copiado',
        detail: 'Insight copiado para a área de transferência!'
      });
    }).catch(() => {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Não foi possível copiar o texto.'
      });
    });
  }

  exportInsightAsPDF(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Em breve',
      detail: 'Exportação em PDF será implementada em breve.'
    });
  }
}
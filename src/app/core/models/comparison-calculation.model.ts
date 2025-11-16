// Modelo de requisição para o comparativo de canecas
export interface ComparisonCalculationRequest {
    id?: number;
    name?: string;

    speed: number;             // Velocidade (m/s)
    productDensity: number;    // Densidade do produto (kg/m³)
    numberOfRows?: number;     // Nº de fileiras
    pitch?: number;            // Passo (mm)
    filling?: number;          // Enchimento (%)
    selectedBucketUnitPrice?: number;  // Preço/Unidade da caneca selecionada
    comparisonBucketUnitPrice?: number; // Preço/Unidade da caneca de comparação
    selectedBucketId: number;  // ID da caneca selecionada
    comparisonBucketId: number;// ID da caneca para comparação
}

export interface ComparisonCalculationResponse {
    id?: number;
    name?: string;

    // Dados da caneca selecionada
    selectedBucket: BucketDetailsDto;

    // Dados da caneca para comparação
    comparisonBucket: BucketDetailsDto;

    // Diferenças calculadas
    comparisonResult: ComparisonResultDto;

    calculatedAt?: Date;
}

export interface BucketDetailsDto {
    id: number;
    code: string;
    dimensions: string;
    volume: number;
    edgeVolume: number;
    materialId: number;
    materialName: string;
    drilling: string;
    displacement: number;
    tractionResistance: number;
    recommendedPitch: number;
    unitPrice?: number;

    bucketsPerMeter: number;
    filling: number;
    numberOfRows: number;
    capacity: number;
    abrasionResistance: number;
    pricePerMeter: number;
    [key: string]: any;
}

export interface ComparisonResultDto {
    dimensionsDifference: number;
    volumeDifference: number;
    bucketsPerMeterDifference: number;
    fillingDifference: number;
    capacityDifference: number;
    edgeVolumeDifference: number;
    abrasionResistanceDifference: number;
    tractionResistanceDifference: number;
    displacementDifference: number;
    pricePerUnitDifference: number;
    pricePerMeterDifference: number;
    [key: string]: number;
}

export interface BucketListItemDto {
    id: number;
    code: string;
    dimensions: string;
    materialId: number;
    materialName: string;
}

export interface MaterialDto {
    id: number;
    name: string;
}
// Modelo de requisição para o comparativo de canecas
export interface ComparisonCalculationRequest {
    id?: number;
    name?: string;
    speed: number;
    productDensity: number;
    numberOfRows?: number;
    pitch?: number;
    filling?: number;
    selectedBucketUnitPrice?: number;
    comparisonBucketUnitPrice?: number;
    selectedBucketId: number;
    comparisonBucketId: number;
}

export interface ComparisonCalculationResponse {
    id?: number;
    name?: string;
    selectedBucket: BucketDetailsDto;
    comparisonBucket: BucketDetailsDto;
    comparisonResult: ComparisonResultDto;
    calculatedAt?: Date;
    insight?: InsightDto;
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

export interface InsightDto {
    text: string;
    generatedAt: Date;
    model: string;
}
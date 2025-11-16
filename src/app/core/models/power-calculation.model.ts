// src/app/core/models/power-calculation.model.ts
export interface PowerCalculationRequest {
    name?: string;
    height: number;
    rotation: number;
    capacity: number;
    gravity: number;
    generalEfficiency: number;
    efficiency: number;
    powerFactor: number;
    serviceFactor: number;
}

export interface PowerCalculationResponse {
    id?: number;
    name?: string;
    powerKW: number;
    powerCV: number;
    moment: number;
    maxMoment: number;
    calculatedAt?: Date;
}
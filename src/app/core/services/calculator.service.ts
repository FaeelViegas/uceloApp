import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PowerCalculationRequest, PowerCalculationResponse } from '../models/power-calculation.model';
import { BucketListItemDto, ComparisonCalculationRequest, ComparisonCalculationResponse, MaterialDto } from '../models/comparison-calculation.model';

@Injectable({
    providedIn: 'root'
})
export class CalculatorService {
    private apiUrl = `${environment.apiUrl}/calculations`;

    constructor(private http: HttpClient) { }

    calculatePower(request: PowerCalculationRequest): Observable<PowerCalculationResponse> {
        return this.http.post<PowerCalculationResponse>(`${this.apiUrl}/power/calculate`, request);
    }

    savePowerCalculation(request: PowerCalculationRequest): Observable<PowerCalculationResponse> {
        return this.http.post<PowerCalculationResponse>(`${this.apiUrl}/power/save`, request);
    }

    getUserPowerCalculations(): Observable<PowerCalculationResponse[]> {
        return this.http.get<PowerCalculationResponse[]>(`${this.apiUrl}/power/user`);
    }

    getCalculationById(id: number): Observable<PowerCalculationResponse> {
        return this.http.get<PowerCalculationResponse>(`${this.apiUrl}/${id}`);
    }

    calculateComparison(request: ComparisonCalculationRequest): Observable<ComparisonCalculationResponse> {
        return this.http.post<ComparisonCalculationResponse>(`${this.apiUrl}/comparison/calculate`, request);
    }

    saveComparisonCalculation(request: ComparisonCalculationRequest): Observable<ComparisonCalculationResponse> {
        return this.http.post<ComparisonCalculationResponse>(`${this.apiUrl}/comparison/save`, request);
    }

    getUserComparisonCalculations(): Observable<ComparisonCalculationResponse[]> {
        return this.http.get<ComparisonCalculationResponse[]>(`${this.apiUrl}/comparison/user`);
    }

    getComparisonById(id: number): Observable<ComparisonCalculationResponse> {
        return this.http.get<ComparisonCalculationResponse>(`${this.apiUrl}/comparison/${id}`);
    }

    getBuckets(): Observable<BucketListItemDto[]> {
        return this.http.get<BucketListItemDto[]>(`${environment.apiUrl}/buckets`);
    }

    getMaterials(): Observable<MaterialDto[]> {
        return this.http.get<MaterialDto[]>(`${environment.apiUrl}/buckets/materials`);
    }
}
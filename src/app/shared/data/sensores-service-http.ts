import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_BASE = 'http://localhost:8000/sensors';

@Injectable({
  providedIn: 'root'
})
export class SensoresServiceHttp {
  constructor(private http: HttpClient) {}

  // Obtener últimas lecturas
  getLastReadings(): Observable<any> {
    return this.http.get(`${API_BASE}/`);
  }

  // Obtener última lectura de pH
  getLastPhReading(): Observable<any> {
    return this.http.get(`${API_BASE}/ph`);
  }

  // Obtener última lectura de turbidez
  getLastTurbidityReading(): Observable<any> {
    return this.http.get(`${API_BASE}/turbidity`);
  }

  // Obtener última lectura de conductividad
  getLastConductivityReading(): Observable<any> {
    return this.http.get(`${API_BASE}/conductivity`);
  }
  
  getAvgPh(): Observable<number> {
  return this.http.get<number>(`${API_BASE}/sensors/ph/avg`);

    
}
}

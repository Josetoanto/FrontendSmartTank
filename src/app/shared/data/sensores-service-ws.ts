import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface SensorMessage {
  sensor: string;
  data: { [key: string]: any };
  date?: string;
}

const WS_BASE = 'wss://smarttank.backend.upprojects.online/sensors';

@Injectable({
  providedIn: 'root'
})
export class SensoresServiceWs implements OnDestroy {
  private sockets: { [key: string]: WebSocket } = {};
  private subjects: { [key: string]: Subject<any> } = {};
  avgPhValue: number | null = null;


  // Conecta a un endpoint y retorna su observable
  connect(endpoint: string): Observable<any> {
    if (!this.subjects[endpoint]) {
      this.subjects[endpoint] = new Subject<any>();
      const ws = new WebSocket(`${WS_BASE}${endpoint}`);
      this.sockets[endpoint] = ws;

      ws.onopen = () => {
        console.log(`✅ WebSocket conectado a ${endpoint}`);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.subjects[endpoint].next(data);
        } catch (err) {
          console.error(`❌ Error parsing message from ${endpoint}:`, err);
        }
      };

      ws.onerror = (error) => {
        console.error(`❌ WebSocket error en ${endpoint}:`, error);
      };

      ws.onclose = () => {
        console.warn(`⚠️ WebSocket cerrado en ${endpoint}`);
      };
    }
    return this.subjects[endpoint].asObservable();
  }

  

  // Envía un mensaje a un endpoint
  send(endpoint: string, message: any): void {
    const ws = this.sockets[endpoint];
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    } else {
      console.warn(`⚠️ No se pudo enviar mensaje: WebSocket no conectado en ${endpoint}`);
    }
  }

  // Cierra todas las conexiones
  closeAll(): void {
    Object.values(this.sockets).forEach(ws => ws.close());
    Object.values(this.subjects).forEach(subject => subject.complete());
    this.sockets = {};
    this.subjects = {};
  }

  ngOnDestroy(): void {
    this.closeAll();
  }

  
}
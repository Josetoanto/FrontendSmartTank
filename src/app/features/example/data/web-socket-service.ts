import { Injectable, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { bufferTime, mergeMap, throttleTime } from 'rxjs/operators';

export interface SensorMessage {
  sensor: string;
  data: { [key: string]: any };
  date: string; // ISO string
}

const WS_URL = 'ws://54.81.41.194:8000/sensors/ws';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService implements OnDestroy {
  private socket: WebSocket | null = null;
  private messages$ = new Subject<SensorMessage>();
  private connectionStatus$ = new BehaviorSubject<boolean>(false);
  private reconnectInterval = 5000;
  private reconnectTimer: any = null;
  private isManuallyClosed = false;

  constructor() {
    this.connect();
  }

  private connect(): void {
    if (typeof window === 'undefined') return;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.isManuallyClosed = false;

    try {
      this.socket = new WebSocket(WS_URL);

      this.socket.onopen = () => {
        console.log('✅ WebSocket connected');
        this.connectionStatus$.next(true);
      };

      this.socket.onmessage = this.handleMessage.bind(this);

      this.socket.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };

      this.socket.onclose = this.handleClose.bind(this);
    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      this.handleClose();
    }
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data: SensorMessage = JSON.parse(event.data);
      console.log('📩 Message received:', data);
      this.messages$.next(data);
    } catch (error) {
      console.error('❌ Error parsing WebSocket message:', error);
    }
  }

  private handleClose(): void {
    this.connectionStatus$.next(false);
    console.warn('⚠️ WebSocket closed');

    if (!this.isManuallyClosed) {
      console.log(`🔄 Attempting reconnection in ${this.reconnectInterval / 1000} seconds...`);
      this.reconnectTimer = setTimeout(() => this.connect(), this.reconnectInterval);
    }
  }

  sendMessage(message: SensorMessage): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('⚠️ Could not send message: WebSocket not connected');
    }
  }

  // 🔧 Aquí aplicamos manejo de concurrencia
  getMessages(): Observable<SensorMessage> {
    return this.messages$.pipe(
      bufferTime(500),        // agrupa mensajes cada 0.5s
      mergeMap(batch => batch), // los procesa en paralelo
      throttleTime(100)       // evita saturar la UI si llegan ráfagas
    );
  }

  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus$.asObservable();
  }

  close(): void {
    this.isManuallyClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.socket?.close();
  }

  ngOnDestroy(): void {
    this.close();
  }
}

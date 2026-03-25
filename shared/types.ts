export interface Vehicle {
  id: string;
  code: string;              // ← Código do ônibus (ex: "BUS-001")
  name: string;              // ← Nome do ônibus
  plate: string;             // ← Placa
  driver: string;            // ← Nome do motorista
  driverId?: string;         // ← ID do motorista (opcional)
  route: string;             // ← Rota/Escala
  
  // Telemetria
  latitude: number;
  longitude: number;
  speed: number;
  maxSpeed: number;
  battery: number;
  odometer: number;
  
  // Status
  status: 'active' | 'warning' | 'error' | 'offline';
  lastUpdate: Date;
}

export interface Alert {
  id: string;
  vehicleId: string;
  type: 'speed' | 'battery' | 'odometer' | 'maintenance' | 'location';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export interface TelemetryPoint {
  vehicleId: string;
  timestamp: Date;
  speed: number;
  latitude: number;
  longitude: number;
  fuel: number;
  temperature: number;
}

export type DriverEventType = 'hard_brake' | 'hard_acceleration' | 'sharp_curve';

export interface DriverEvent {
  id: string;
  vehicleId: string;
  type: 'hard_brake' | 'hard_acceleration' | 'sharp_curve';
  timestamp: Date;
  severity: 'high' | 'medium' | 'low';
  location: string;
  speed: number;
}
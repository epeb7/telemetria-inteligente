export interface Vehicle {
  id: string;
  code: number;
  name: string;
  plate: string;
  status: 'active' | 'warning' | 'error' | 'offline';
  latitude: number;
  longitude: number;
  speed: number;
  maxSpeed: number;
  odometer: number;
  fuel: number;
  battery: number;
  lastUpdate: Date;
  driver?: string;
  driverPhone?: string;        // ADICIONE
  driverEmail?: string;        // ADICIONE
  route?: string;
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
  type: DriverEventType;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
  location?: string;
  speed?: number;
}
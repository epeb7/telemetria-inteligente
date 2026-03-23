export interface Vehicle {
  id: string;
  name: string;
  plate: string;
  status: 'active' | 'warning' | 'error' | 'offline';
  latitude: number;
  longitude: number;
  speed: number;
  fuel: number;
  temperature: number;
  lastUpdate: Date;
  driver: string;
  route?: string;
}

export interface Alert {
  id: string;
  vehicleId: string;
  type: 'speed' | 'temperature' | 'fuel' | 'maintenance' | 'location';
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

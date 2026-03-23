import { Vehicle, Alert } from './types';

export const mockVehicles: Vehicle[] = [
  {
    id: 'v1',
    name: 'Ônibus 001',
    plate: 'ABC-1234',
    status: 'active',
    latitude: -23.5505,
    longitude: -46.6333,
    speed: 65,
    fuel: 85,
    temperature: 92,
    lastUpdate: new Date(),
    driver: 'João Silva',
    route: 'São Paulo - Campinas'
  },
  {
    id: 'v2',
    name: 'Ônibus 002',
    plate: 'DEF-5678',
    status: 'active',
    latitude: -23.5495,
    longitude: -46.6343,
    speed: 48,
    fuel: 45,
    temperature: 88,
    lastUpdate: new Date(),
    driver: 'Maria Santos',
    route: 'São Paulo - Sorocaba'
  },
  {
    id: 'v3',
    name: 'Ônibus 003',
    plate: 'GHI-9012',
    status: 'warning',
    latitude: -23.5515,
    longitude: -46.6323,
    speed: 0,
    fuel: 20,
    temperature: 105,
    lastUpdate: new Date(Date.now() - 5 * 60000),
    driver: 'Pedro Costa',
    route: 'São Paulo - Santos'
  },
  {
    id: 'v4',
    name: 'Ônibus 004',
    plate: 'JKL-3456',
    status: 'active',
    latitude: -23.5485,
    longitude: -46.6353,
    speed: 72,
    fuel: 92,
    temperature: 90,
    lastUpdate: new Date(),
    driver: 'Ana Oliveira',
    route: 'São Paulo - Guarulhos'
  },
  {
    id: 'v5',
    name: 'Ônibus 005',
    plate: 'MNO-7890',
    status: 'error',
    latitude: -23.5525,
    longitude: -46.6313,
    speed: 0,
    fuel: 5,
    temperature: 115,
    lastUpdate: new Date(Date.now() - 15 * 60000),
    driver: 'Carlos Mendes',
    route: 'São Paulo - Ribeirão Preto'
  },
  {
    id: 'v6',
    name: 'Ônibus 006',
    plate: 'PQR-2345',
    status: 'active',
    latitude: -23.5475,
    longitude: -46.6363,
    speed: 55,
    fuel: 68,
    temperature: 91,
    lastUpdate: new Date(),
    driver: 'Fernanda Lima',
    route: 'São Paulo - Jundiaí'
  }
];

export const mockAlerts: Alert[] = [
  {
    id: 'a1',
    vehicleId: 'v3',
    type: 'temperature',
    severity: 'high',
    message: 'Temperatura do motor acima de 100°C',
    timestamp: new Date(Date.now() - 3 * 60000),
    resolved: false
  },
  {
    id: 'a2',
    vehicleId: 'v5',
    type: 'fuel',
    severity: 'high',
    message: 'Combustível crítico - menos de 10%',
    timestamp: new Date(Date.now() - 10 * 60000),
    resolved: false
  },
  {
    id: 'a3',
    vehicleId: 'v2',
    type: 'fuel',
    severity: 'medium',
    message: 'Combustível baixo - 45%',
    timestamp: new Date(Date.now() - 20 * 60000),
    resolved: false
  },
  {
    id: 'a4',
    vehicleId: 'v1',
    type: 'speed',
    severity: 'low',
    message: 'Velocidade acima de 60 km/h',
    timestamp: new Date(Date.now() - 5 * 60000),
    resolved: true
  }
];

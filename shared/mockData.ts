import { Vehicle, Alert, DriverEvent } from './types';

export const mockVehicles: Vehicle[] = [
  {
    id: 'v1',
    code: 305,
    name: 'Ônibus 001',
    plate: 'ABC-1234',
    status: 'active',
    latitude: -23.5505,
    longitude: -46.6333,
    speed: 65,
    maxSpeed: 120,
    odometer: 150000,
    fuel: 85,
    battery: 95,
    lastUpdate: new Date(),
    driver: 'João Silva',
    driverPhone: '(11) 98765-4321',
    driverEmail: 'joao.silva@email.com',
    route: 'São Paulo - Campinas'
  },
  {
    id: 'v2',
    code: 306,
    name: 'Ônibus 002',
    plate: 'DEF-5678',
    status: 'active',
    latitude: -23.5495,
    longitude: -46.6343,
    speed: 48,
    maxSpeed: 120,
    odometer: 125000,
    fuel: 45,
    battery: 88,
    lastUpdate: new Date(),
    driver: 'Maria Santos',
    driverPhone: '(11) 98765-4322',
    driverEmail: 'maria.santos@email.com',
    route: 'São Paulo - Sorocaba'
  },
  {
    id: 'v3',
    code: 307,
    name: 'Ônibus 003',
    plate: 'GHI-9012',
    status: 'warning',
    latitude: -23.5515,
    longitude: -46.6323,
    speed: 0,
    maxSpeed: 120,
    odometer: 200000,
    fuel: 20,
    battery: 65,
    lastUpdate: new Date(Date.now() - 5 * 60000),
    driver: 'Pedro Costa',
    driverPhone: '(11) 98765-4323',
    driverEmail: 'pedro.costa@email.com',
    route: 'São Paulo - Santos'
  },
  {
    id: 'v4',
    code: 308,
    name: 'Ônibus 004',
    plate: 'JKL-3456',
    status: 'active',
    latitude: -23.5485,
    longitude: -46.6353,
    speed: 72,
    maxSpeed: 120,
    odometer: 180000,
    fuel: 92,
    battery: 92,
    lastUpdate: new Date(),
    driver: 'Ana Oliveira',
    driverPhone: '(11) 98765-4324',
    driverEmail: 'ana.oliveira@email.com',
    route: 'São Paulo - Guarulhos'
  },
  {
    id: 'v5',
    code: 309,
    name: 'Ônibus 005',
    plate: 'MNO-7890',
    status: 'error',
    latitude: -23.5525,
    longitude: -46.6313,
    speed: 0,
    maxSpeed: 120,
    odometer: 220000,
    fuel: 5,
    battery: 30,
    lastUpdate: new Date(Date.now() - 15 * 60000),
    driver: 'Carlos Mendes',
    driverPhone: '(11) 98765-4325',
    driverEmail: 'carlos.mendes@email.com',
    route: 'São Paulo - Ribeirão Preto'
  },
  {
    id: 'v6',
    code: 310,
    name: 'Ônibus 006',
    plate: 'PQR-2345',
    status: 'active',
    latitude: -23.5475,
    longitude: -46.6363,
    speed: 55,
    maxSpeed: 120,
    odometer: 165000,
    fuel: 68,
    battery: 85,
    lastUpdate: new Date(),
    driver: 'Fernanda Lima',
    driverPhone: '(11) 98765-4326',
    driverEmail: 'fernanda.lima@email.com',
    route: 'São Paulo - Jundiaí'
  }
];

export const mockAlerts: Alert[] = [
  {
    id: 'a1',
    vehicleId: 'v3',
    type: 'battery',
    severity: 'high',
    message: 'Bateria baixa - 65%',
    timestamp: new Date(Date.now() - 3 * 60000),
    resolved: false
  },
  {
    id: 'a2',
    vehicleId: 'v5',
    type: 'battery',
    severity: 'high',
    message: 'Bateria crítica - 30%',
    timestamp: new Date(Date.now() - 10 * 60000),
    resolved: false
  },
  {
    id: 'a3',
    vehicleId: 'v2',
    type: 'odometer',
    severity: 'medium',
    message: 'Odômetro alto - 125000 km',
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

export const mockDriverEvents: DriverEvent[] = [
  {
    id: 'e1',
    vehicleId: 'v1',
    type: 'hard_brake',
    timestamp: new Date(Date.now() - 10 * 60000),
    severity: 'high',
    location: 'Av. Paulista',
    speed: 65
  },
  {
    id: 'e2',
    vehicleId: 'v1',
    type: 'sharp_curve',
    timestamp: new Date(Date.now() - 5 * 60000),
    severity: 'medium',
    location: 'Rua Augusta',
    speed: 45
  },
  {
    id: 'e3',
    vehicleId: 'v2',
    type: 'hard_acceleration',
    timestamp: new Date(Date.now() - 15 * 60000),
    severity: 'medium',
    location: 'Av. Brasil',
    speed: 50
  },
  {
    id: 'e4',
    vehicleId: 'v2',
    type: 'hard_brake',
    timestamp: new Date(Date.now() - 2 * 60000),
    severity: 'high',
    location: 'Av. Imigrantes',
    speed: 70
  },
  {
    id: 'e5',
    vehicleId: 'v4',
    type: 'sharp_curve',
    timestamp: new Date(Date.now() - 8 * 60000),
    severity: 'low',
    location: 'Rodovia Dutra',
    speed: 80
  },
  {
    id: 'e6',
    vehicleId: 'v1',
    type: 'hard_acceleration',
    timestamp: new Date(Date.now() - 20 * 60000),
    severity: 'low',
    location: 'Av. Paulista',
    speed: 40
  }
];
// ============================================================================
// TIPOS ENTERPRISE - Telemetria FrotaTrack
// ============================================================================
import { Vehicle } from './types';
import { DriverEvent } from './types';

export interface FilterState {
  searchCode: string;
  searchDriver: string;
  searchScale: string;
  statusFilter: 'all' | 'active' | 'warning' | 'error' | 'offline';
  eventFilter: 'all' | 'hard_brake' | 'hard_acceleration' | 'sharp_curve';
}

export interface PanelState {
  isMinimized: boolean;
  activeTab: 'vehicles' | 'dashboard' | 'events';
}

export interface EventAggregate {
  hardBrake: number;
  hardAcceleration: number;
  sharpCurve: number;
}

export interface DriverRank {
  driverId: string;
  driverName: string;
  score: number; // 0-100
  events: EventAggregate;
  totalEvents: number;
  vehicleCode: string;
  lastEventTime: Date | null;
}

export interface KPIDashboard {
  totalVehicles: number;
  activeCount: number;
  warningCount: number;
  errorCount: number;
  offlineCount: number;
  eventsByType: EventAggregate;
  topDrivers: DriverRank[];
  averageScore: number;
}

export interface VehicleWithScore extends Vehicle {
  driverScore: number;
  eventCount: EventAggregate;
  eventsSummary: string; // ex: "2 freadas, 1 curva"
}

export interface SearchResult {
  vehicles: VehicleWithScore[];
  totalCount: number;
  filteredCount: number;
}

// ============================================================================
// COMPONENTES STATE
// ============================================================================

export interface HeaderProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  kpis: KPIDashboard;
}

export interface MainLayoutProps {
  vehicles: VehicleWithScore[];
  selectedVehicle: VehicleWithScore | null;
  onSelectVehicle: (vehicle: VehicleWithScore) => void;
  panelState: PanelState;
  onPanelStateChange: (state: PanelState) => void;
  filters: FilterState;
  kpis: KPIDashboard;
}

export interface ControlPanelProps {
  vehicles: VehicleWithScore[];
  selectedVehicle: VehicleWithScore | null;
  onSelectVehicle: (vehicle: VehicleWithScore) => void;
  isMinimized: boolean;
  onMinimizeToggle: () => void;
  activeTab: 'vehicles' | 'dashboard' | 'events';
  onTabChange: (tab: 'vehicles' | 'dashboard' | 'events') => void;
  filters: FilterState;
  kpis: KPIDashboard;
}

export interface VehicleGridProps {
  vehicles: VehicleWithScore[];
  selectedVehicleId?: string;
  onSelectVehicle: (vehicle: VehicleWithScore) => void;
  filters: FilterState;
}

export interface KPIDashboardProps {
  kpis: KPIDashboard;
  onDriverClick?: (driver: DriverRank) => void;
}

export interface DriverRankingProps {
  drivers: DriverRank[];
  onDriverClick?: (driver: DriverRank) => void;
}

export interface EventsTimelineProps {
  events: DriverEvent[];
  vehicles: VehicleWithScore[];
  onEventClick?: (event: DriverEvent) => void;
}

// ============================================================================
// UTILITÁRIOS
// ============================================================================

export function calculateDriverScore(events: EventAggregate): number {
  // Score baseado em eventos (quanto menos eventos, maior o score)
  // Máximo 100 pontos
  const totalEvents = events.hardBrake + events.hardAcceleration + events.sharpCurve;
  
  // Pesos diferentes para cada tipo de evento
  const weightedScore = 
    (events.hardBrake * 5) +
    (events.hardAcceleration * 3) +
    (events.sharpCurve * 2);
  
  // Converter para escala 0-100 (100 = melhor)
  return Math.max(0, 100 - Math.min(100, weightedScore));
}

export function aggregateEvents(events: DriverEvent[]): EventAggregate {
  return {
    hardBrake: events.filter(e => e.type === 'hard_brake').length,
    hardAcceleration: events.filter(e => e.type === 'hard_acceleration').length,
    sharpCurve: events.filter(e => e.type === 'sharp_curve').length,
  };
}

export function formatEventsSummary(events: EventAggregate): string {
  const parts: string[] = [];
  
  if (events.hardBrake > 0) parts.push(`${events.hardBrake} freada${events.hardBrake > 1 ? 's' : ''}`);
  if (events.hardAcceleration > 0) parts.push(`${events.hardAcceleration} aceleração${events.hardAcceleration > 1 ? 's' : ''}`);
  if (events.sharpCurve > 0) parts.push(`${events.sharpCurve} curva${events.sharpCurve > 1 ? 's' : ''}`);
  
  return parts.length > 0 ? parts.join(', ') : 'Sem eventos';
}

export function filterVehicles(
  vehicles: VehicleWithScore[],
  filters: FilterState
): VehicleWithScore[] {
  return vehicles.filter(vehicle => {
    // Filtro por código
    if (filters.searchCode && !vehicle.code.toLowerCase().includes(filters.searchCode.toLowerCase())) {
      return false;
    }
    
    // Filtro por motorista
    if (filters.searchDriver && !vehicle.driver.toLowerCase().includes(filters.searchDriver.toLowerCase())) {
      return false;
    }
    
    // Filtro por escala
    if (filters.searchScale && !vehicle.route?.toLowerCase().includes(filters.searchScale.toLowerCase())) {
      return false;
    }
    
    // Filtro por status
    if (filters.statusFilter !== 'all' && vehicle.status !== filters.statusFilter) {
      return false;
    }
    
    // Filtro por eventos
    if (filters.eventFilter !== 'all') {
      const eventCount = vehicle.eventCount[
        filters.eventFilter === 'hard_brake' ? 'hardBrake' :
        filters.eventFilter === 'hard_acceleration' ? 'hardAcceleration' :
        'sharpCurve'
      ];
      if (eventCount === 0) return false;
    }
    
    return true;
  });
}

export function calculateKPIs(vehicles: VehicleWithScore[], allEvents: DriverEvent[]): KPIDashboard {
  const activeCount = vehicles.filter(v => v.status === 'active').length;
  const warningCount = vehicles.filter(v => v.status === 'warning').length;
  const errorCount = vehicles.filter(v => v.status === 'error').length;
  const offlineCount = vehicles.filter(v => v.status === 'offline').length;
  
  const eventsByType = aggregateEvents(allEvents);
  
  // Calcular ranking de motoristas
  const driverMap = new Map<string, DriverRank>();
  
  vehicles.forEach(vehicle => {
    const driverId = vehicle.driverId || vehicle.driver;
    const vehicleEvents = allEvents.filter(e => e.vehicleId === vehicle.id);
    const score = calculateDriverScore(vehicle.eventCount);
    
    driverMap.set(driverId, {
      driverId,
      driverName: vehicle.driver,
      score,
      events: vehicle.eventCount,
      totalEvents: vehicleEvents.length,
      vehicleCode: vehicle.code,
      lastEventTime: vehicleEvents.length > 0 ? vehicleEvents[0].timestamp : null,
    });
  });
  
  const topDrivers = Array.from(driverMap.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  
  const averageScore = topDrivers.length > 0
    ? topDrivers.reduce((sum, d) => sum + d.score, 0) / topDrivers.length
    : 0;
  
  return {
    totalVehicles: vehicles.length,
    activeCount,
    warningCount,
    errorCount,
    offlineCount,
    eventsByType,
    topDrivers,
    averageScore: Math.round(averageScore),
  };
}
import { useState, useEffect, useMemo } from 'react';
import { Vehicle, Alert, DriverEvent } from '@/../../shared/types';
import { mockVehicles, mockAlerts, mockDriverEvents } from '@/../../shared/mockData';
import { VehicleMap } from '@/components/VehicleMap';
import { DriverModal } from '@/components/DriverModal';
import { EventDetailModal } from '@/components/EventDetailModal';
import { Header } from '@/components/Header-Enterprise';
import { MainLayout } from '@/components/MainLayout-Enterprise';
import { ControlPanel } from '@/components/ControlPanel-Enterprise';
import { VehicleGrid } from '@/components/VehicleGrid-Enterprise';
import { KPIDashboard } from '@/components/KPIDashboard-Enterprise';
import { EventsTimeline } from '@/components/EventsTimeline-Enterprise';
import { cn } from '@/lib/utils';

// ============================================================================
// TIPOS
// ============================================================================

interface FilterState {
  searchCode: string;
  searchDriver: string;
  searchScale: string;
  statusFilter: 'all' | 'active' | 'warning' | 'error' | 'offline';
  eventFilter: 'all' | 'hard_brake' | 'hard_acceleration' | 'sharp_curve';
}

interface PanelState {
  isMinimized: boolean;
  activeTab: 'vehicles' | 'dashboard' | 'events';
}

interface EventAggregate {
  hardBrake: number;
  hardAcceleration: number;
  sharpCurve: number;
}

interface DriverRank {
  driverId: string;
  driverName: string;
  score: number;
  events: EventAggregate;
  totalEvents: number;
  vehicleCode: string;
  lastEventTime: Date | null;
}

interface KPIDashboardData {
  totalVehicles: number;
  activeCount: number;
  warningCount: number;
  errorCount: number;
  offlineCount: number;
  eventsByType: EventAggregate;
  topDrivers: DriverRank[];
  averageScore: number;
}

// Interface simplificada para o KPIDashboard (apenas o que ele precisa)
interface VehicleForDashboard {
  id: string;
  code: string;
  name: string;
  driver: string;
  status: string;
  speed?: number;
  battery?: number;
  driverScore: number;
  eventCount: EventAggregate;
  eventsSummary: string;
  lastUpdate?: Date;
}

interface VehicleWithScore extends Vehicle {
  driverScore: number;
  eventCount: EventAggregate;
  eventsSummary: string;
}

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

function calculateDriverScore(events: EventAggregate): number {
  const weightedScore =
    events.hardBrake * 5 +
    events.hardAcceleration * 3 +
    events.sharpCurve * 2;
  return Math.max(0, 100 - Math.min(100, weightedScore));
}

function aggregateEvents(events: DriverEvent[]): EventAggregate {
  return {
    hardBrake: events.filter((e) => e.type === 'hard_brake').length,
    hardAcceleration: events.filter((e) => e.type === 'hard_acceleration').length,
    sharpCurve: events.filter((e) => e.type === 'sharp_curve').length,
  };
}

function formatEventsSummary(events: EventAggregate): string {
  const parts: string[] = [];
  if (events.hardBrake > 0) parts.push(`${events.hardBrake} freada${events.hardBrake > 1 ? 's' : ''}`);
  if (events.hardAcceleration > 0) parts.push(`${events.hardAcceleration} aceleração${events.hardAcceleration > 1 ? 's' : ''}`);
  if (events.sharpCurve > 0) parts.push(`${events.sharpCurve} curva${events.sharpCurve > 1 ? 's' : ''}`);
  return parts.length > 0 ? parts.join(', ') : 'Sem eventos';
}

function filterVehicles(vehicles: VehicleWithScore[], filters: FilterState): VehicleWithScore[] {
  return vehicles.filter((vehicle) => {
    if (filters.searchCode && !vehicle.code.toLowerCase().includes(filters.searchCode.toLowerCase())) {
      return false;
    }
    if (filters.searchDriver && !vehicle.driver.toLowerCase().includes(filters.searchDriver.toLowerCase())) {
      return false;
    }
    if (filters.searchScale && !vehicle.route?.toLowerCase().includes(filters.searchScale.toLowerCase())) {
      return false;
    }
    if (filters.statusFilter !== 'all' && vehicle.status !== filters.statusFilter) {
      return false;
    }
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

function calculateKPIs(vehicles: VehicleWithScore[], allEvents: DriverEvent[]): KPIDashboardData {
  const activeCount = vehicles.filter((v) => v.status === 'active').length;
  const warningCount = vehicles.filter((v) => v.status === 'warning').length;
  const errorCount = vehicles.filter((v) => v.status === 'error').length;
  const offlineCount = vehicles.filter((v) => v.status === 'offline').length;

  const eventsByType = aggregateEvents(allEvents);

  const driverMap = new Map<string, DriverRank>();

  vehicles.forEach((vehicle) => {
    const driverId = vehicle.driverId || vehicle.driver;
    const vehicleEvents = allEvents.filter((e) => e.vehicleId === vehicle.id);
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

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function Home() {
  // Estado de veículos e eventos
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [driverEvents] = useState<DriverEvent[]>(mockDriverEvents);

  // Estado de UI
  const [filters, setFilters] = useState<FilterState>({
    searchCode: '',
    searchDriver: '',
    searchScale: '',
    statusFilter: 'all',
    eventFilter: 'all',
  });

  const [panelState, setPanelState] = useState<PanelState>({
    isMinimized: false,
    activeTab: 'vehicles',
  });
  
  // Estado de modais
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithScore | null>(null);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<DriverEvent | null>(null);
  const [isEventDetailModalOpen, setIsEventDetailModalOpen] = useState(false);

  // ============================================================================
  // SIMULAÇÃO DE TELEMETRIA EM TEMPO REAL
  // ============================================================================

  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles((prevVehicles) => {
        return prevVehicles.map((vehicle) => {
          let newSpeed = vehicle.speed + (Math.random() - 0.5) * 10;
          newSpeed = Math.max(0, Math.min(vehicle.maxSpeed, newSpeed));

          let newBattery = vehicle.battery - Math.random() * 0.2;
          newBattery = Math.max(0, newBattery);

          let newOdometer = vehicle.odometer + newSpeed * 0.05;

          let newStatus: 'active' | 'warning' | 'error' | 'offline' = 'active';
          if (newBattery < 10) newStatus = 'error';
          else if (newBattery < 25) newStatus = 'warning';

          const latChange = (Math.random() - 0.5) * 0.001;
          const lngChange = (Math.random() - 0.5) * 0.001;

          return {
            ...vehicle,
            speed: Math.round(newSpeed),
            battery: Math.round(newBattery * 10) / 10,
            odometer: Math.round(newOdometer),
            latitude: vehicle.latitude + latChange,
            longitude: vehicle.longitude + lngChange,
            status: newStatus,
            lastUpdate: new Date(),
          };
        });
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // ============================================================================
  // COMPUTAÇÕES MEMORIZADAS
  // ============================================================================

  // Enriquecer veículos com scores e eventos
  const vehiclesWithScore = useMemo<VehicleWithScore[]>(() => {
    return vehicles.map((vehicle) => {
      const vehicleEvents = driverEvents.filter((e) => e.vehicleId === vehicle.id);
      const eventCount = aggregateEvents(vehicleEvents);
      const driverScore = calculateDriverScore(eventCount);

      return {
        ...vehicle,
        driverScore,
        eventCount,
        eventsSummary: formatEventsSummary(eventCount),
      };
    });
  }, [vehicles, driverEvents]);

  // Converter para o formato que o Dashboard espera (apenas os campos necessários)
  const vehiclesForDashboard = useMemo<VehicleForDashboard[]>(() => {
    return vehiclesWithScore.map((vehicle) => ({
      id: vehicle.id,
      code: vehicle.code,
      name: vehicle.name,
      driver: vehicle.driver,
      status: vehicle.status,
      speed: vehicle.speed,
      battery: vehicle.battery,
      driverScore: vehicle.driverScore,
      eventCount: vehicle.eventCount,
      eventsSummary: vehicle.eventsSummary,
      lastUpdate: vehicle.lastUpdate,
    }));
  }, [vehiclesWithScore]);

  // Filtrar veículos
  const filteredVehicles = useMemo(() => {
    return filterVehicles(vehiclesWithScore, filters);
  }, [vehiclesWithScore, filters]);

  // Calcular KPIs
  const kpis = useMemo(() => {
    return calculateKPIs(vehiclesWithScore, driverEvents);
  }, [vehiclesWithScore, driverEvents]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSelectVehicle = (vehicle: VehicleWithScore) => {
    setSelectedVehicle(vehicle);
    setIsDriverModalOpen(true);
  };

  const handleSelectEvent = (event: DriverEvent) => {
    setSelectedEvent(event);
    setIsEventDetailModalOpen(true);
  };

  const handlePanelMinimize = () => {
    setPanelState((prev) => ({
      ...prev,
      isMinimized: !prev.isMinimized,
    }));
  };

  const handleTabChange = (tab: 'vehicles' | 'dashboard' | 'events') => {
    setPanelState((prev) => ({
      ...prev,
      activeTab: tab,
    }));
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Header com Filtros */}
      <Header
        filters={filters}
        onFilterChange={setFilters}
        kpis={kpis}
      />

      {/* Main Layout - Mapa + Painel */}
      <MainLayout
        mapComponent={
          <VehicleMap
            vehicles={vehiclesWithScore}
            selectedVehicle={selectedVehicle || undefined}
          />
        }
        panelComponent={
          <ControlPanel
            vehiclesTab={
              <VehicleGrid
                vehicles={filteredVehicles}
                selectedVehicleId={selectedVehicle?.id}
                onSelectVehicle={handleSelectVehicle}
              />
            }
            dashboardTab={
              <KPIDashboard
                kpis={kpis}
                vehicles={vehiclesForDashboard}
                onDriverClick={(driver) => {
                  setFilters((prev) => ({
                    ...prev,
                    searchDriver: driver.driverName,
                  }));
                  handleTabChange('vehicles');
                }}
                onVehicleClick={(vehicle) => {
                  const fullVehicle = vehiclesWithScore.find(v => v.id === vehicle.id);
                  if (fullVehicle) {
                    handleSelectVehicle(fullVehicle);
                  }
                }}
              />
            }
            eventsTab={
              <EventsTimeline
                events={driverEvents}
                vehicles={vehiclesWithScore}
                onEventClick={handleSelectEvent}
              />
            }
            activeTab={panelState.activeTab}
            onTabChange={handleTabChange}
          />
        }
        isMinimized={panelState.isMinimized}
        onMinimizeToggle={handlePanelMinimize}
      />

      {/* Modais */}
      {selectedVehicle && (
        <DriverModal
          vehicle={selectedVehicle}
          events={driverEvents.filter((e) => e.vehicleId === selectedVehicle.id)}
          isOpen={isDriverModalOpen}
          onClose={() => {
            setIsDriverModalOpen(false);
            setSelectedVehicle(null);
          }}
        />
      )}

      {selectedEvent && selectedVehicle && (
        <EventDetailModal
          event={selectedEvent}
          vehicle={selectedVehicle}
          isOpen={isEventDetailModalOpen}
          onClose={() => {
            setIsEventDetailModalOpen(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
}
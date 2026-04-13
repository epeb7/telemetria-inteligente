import { useMemo, useState, useCallback } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Shield, Award, Gauge, Battery, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PDFDownloadButton } from './PDFReport';

// ============================================================================
// TIPOS
// ============================================================================

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

interface VehicleWithScore {
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

interface KPIDashboardProps {
  kpis: KPIDashboardData;
  vehicles?: VehicleWithScore[];
  onDriverClick?: (driver: DriverRank) => void;
  onVehicleClick?: (vehicle: VehicleWithScore) => void;
}

type FilterType = 'info' | 'warning' | 'alert';

// Configuração visual dos filtros
const filterConfig = {
  info: {
    label: 'Informações',
    activeBg: 'bg-emerald-50',
    activeText: 'text-emerald-700',
    activeBorder: 'border-emerald-200',
    inactiveBg: 'bg-slate-100',
    inactiveText: 'text-slate-500',
    checkboxColor: 'text-emerald-600 focus:ring-emerald-500',
  },
  warning: {
    label: 'Avisos',
    activeBg: 'bg-amber-50',
    activeText: 'text-amber-700',
    activeBorder: 'border-amber-200',
    inactiveBg: 'bg-slate-100',
    inactiveText: 'text-slate-500',
    checkboxColor: 'text-amber-600 focus:ring-amber-500',
  },
  alert: {
    label: 'Alertas',
    activeBg: 'bg-red-50',
    activeText: 'text-red-700',
    activeBorder: 'border-red-200',
    inactiveBg: 'bg-slate-100',
    inactiveText: 'text-slate-500',
    checkboxColor: 'text-red-600 focus:ring-red-500',
  },
} as const;

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

function formatRelativeTime(date?: Date): string {
  if (!date) return '—';
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Agora';
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'active': return 'emerald';
    case 'warning': return 'amber';
    case 'error': return 'red';
    default: return 'slate';
  }
}

function getFilterTypeFromStatus(status: string): FilterType | null {
  if (status === 'active') return 'info';
  if (status === 'warning') return 'warning';
  if (status === 'error') return 'alert';
  return null;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function KPIDashboard({ kpis, vehicles = [], onDriverClick, onVehicleClick }: KPIDashboardProps) {
  const totalEvents = kpis.eventsByType.hardBrake + kpis.eventsByType.hardAcceleration + kpis.eventsByType.sharpCurve;

  // Estado dos filtros para o grid de veículos
  const [activeFilters, setActiveFilters] = useState<FilterType[]>(['info', 'warning', 'alert']);

  const toggleFilter = useCallback((filter: FilterType) => {
    setActiveFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  }, []);

  const showAllFilters = useCallback(() => {
    setActiveFilters(['info', 'warning', 'alert']);
  }, []);

  // Ordena veículos por total de eventos (mais problemáticos primeiro)
  const sortedVehicles = useMemo(() => {
    if (!vehicles || vehicles.length === 0) return [];
    return [...vehicles].sort((a, b) => {
      const totalA = a.eventCount.hardBrake + a.eventCount.hardAcceleration + a.eventCount.sharpCurve;
      const totalB = b.eventCount.hardBrake + b.eventCount.hardAcceleration + b.eventCount.sharpCurve;
      return totalB - totalA;
    });
  }, [vehicles]);

  // Contagens por tipo (independente dos filtros)
  const counts = useMemo(() => {
    return {
      info: vehicles.filter(v => v.status === 'active').length,
      warning: vehicles.filter(v => v.status === 'warning').length,
      alert: vehicles.filter(v => v.status === 'error').length,
    };
  }, [vehicles]);

  // Aplica os filtros na lista ordenada
  const filteredVehicles = useMemo(() => {
    return sortedVehicles.filter(vehicle => {
      const type = getFilterTypeFromStatus(vehicle.status);
      if (!type) return false;
      return activeFilters.includes(type);
    });
  }, [sortedVehicles, activeFilters]);

  const hasActiveFilters = activeFilters.length < 3;

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-white to-slate-50" style={{ position: 'relative', zIndex: 1 }}>
      {/* Botão de relatório */}
      <div className="flex justify-end">
        <PDFDownloadButton
          kpis={kpis}
          topDrivers={kpis.topDrivers}
          eventsByType={kpis.eventsByType}
          vehiclesWithEvents={vehicles}
          buttonText="📄 Exportar Relatório"
        />
      </div>

      {/* Cards de status */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Total</p>
              <p className="text-3xl font-bold text-[#0F3D5E]">{kpis.totalVehicles}</p>
            </div>
            <div className="p-2.5 bg-[#0F3D5E]/10 rounded-xl">
              <TrendingUp className="w-5 h-5 text-[#0F3D5E]" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ativos</p>
              <p className="text-3xl font-bold text-emerald-600">{kpis.activeCount}</p>
            </div>
            <div className="p-2.5 bg-emerald-100 rounded-xl">
              <div className="w-5 h-5 bg-emerald-500 rounded-full" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Avisos</p>
              <p className="text-3xl font-bold text-amber-600">{kpis.warningCount}</p>
            </div>
            <div className="p-2.5 bg-amber-100 rounded-xl">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Erros</p>
              <p className="text-3xl font-bold text-red-600">{kpis.errorCount}</p>
            </div>
            <div className="p-2.5 bg-red-100 rounded-xl">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Colunas laterais: Eventos e Score */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Eventos por Tipo */}
        <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-1.5 bg-[#0F3D5E]/10 rounded-lg">
              <Gauge className="w-4 h-4 text-[#0F3D5E]" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Eventos por Tipo</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                  <span className="text-sm font-medium text-slate-600">Freada Brusca</span>
                </div>
                <span className="text-lg font-bold text-red-600">{kpis.eventsByType.hardBrake}</span>
              </div>
              <div className="w-full h-1.5 bg-red-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${totalEvents ? (kpis.eventsByType.hardBrake / totalEvents) * 100 : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                  <span className="text-sm font-medium text-slate-600">Aceleração Brusca</span>
                </div>
                <span className="text-lg font-bold text-amber-600">{kpis.eventsByType.hardAcceleration}</span>
              </div>
              <div className="w-full h-1.5 bg-amber-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${totalEvents ? (kpis.eventsByType.hardAcceleration / totalEvents) * 100 : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
                  <span className="text-sm font-medium text-slate-600">Curva Acentuada</span>
                </div>
                <span className="text-lg font-bold text-orange-600">{kpis.eventsByType.sharpCurve}</span>
              </div>
              <div className="w-full h-1.5 bg-orange-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${totalEvents ? (kpis.eventsByType.sharpCurve / totalEvents) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4 mt-4 flex justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Geral</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-[#0F3D5E]">{totalEvents}</span>
                <span className="text-xs text-slate-400">eventos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Score Médio + Top Motoristas */}
        <div className="space-y-6">
          {/* Score Médio */}
          <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-1.5 bg-[#0F3D5E]/10 rounded-lg">
                <Shield className="w-4 h-4 text-[#0F3D5E]" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Score Médio</h3>
            </div>
            <div className="flex items-center justify-between">
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#0F3D5E] to-[#0F3D5E]/80 flex items-center justify-center shadow-lg">
                  <span className="text-3xl font-bold text-white">{Math.round(kpis.averageScore)}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
                  <Award className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 mb-1">Escala de Pontuação</p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-xs text-slate-400">0</span>
                  <div className="w-8 h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 rounded-full mx-1" />
                  <span className="text-xs text-slate-400">100</span>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                </div>
                <p className="text-xs font-medium text-emerald-600 mt-2">
                  {kpis.averageScore >= 80 ? 'Excelente' : kpis.averageScore >= 60 ? 'Bom' : 'Regular'}
                </p>
              </div>
            </div>
          </div>

          {/* Top Motoristas com scroll vertical */}
          <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-1.5 bg-amber-100 rounded-lg">
                <Award className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Top Motoristas</h3>
              <span className="ml-auto text-xs text-slate-400">{kpis.topDrivers.length} motoristas</span>
            </div>
            <div className="max-h-80 overflow-y-auto overflow-x-hidden pr-1 space-y-3">
              {kpis.topDrivers.map((driver, index) => (
                <div
                  key={driver.driverId}
                  onClick={() => onDriverClick?.(driver)}
                  className="group flex items-center justify-between p-3 rounded-xl bg-slate-50/50 hover:bg-slate-100 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                      index === 0 ? "bg-amber-100 text-amber-700" :
                        index === 1 ? "bg-slate-200 text-slate-600" :
                          index === 2 ? "bg-orange-100 text-orange-700" :
                            "bg-slate-100 text-slate-500"
                    )}>
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-700 group-hover:text-[#0F3D5E] truncate">
                        {driver.driverName}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {driver.vehicleCode} • {driver.totalEvents} evento{driver.totalEvents !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-bold flex-shrink-0 ml-2",
                    driver.score >= 80 ? "bg-emerald-100 text-emerald-700" :
                      driver.score >= 60 ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                  )}>
                    {driver.score}
                  </div>
                </div>
              ))}
              {kpis.topDrivers.length === 0 && (
                <div className="text-center py-8">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Nenhum motorista encontrado</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Veículos por Eventos - com filtros Informações/Avisos/Alertas */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#0F3D5E]/10 rounded-lg">
              <Battery className="w-4 h-4 text-[#0F3D5E]" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Veículos por Eventos</h3>
          </div>
          <div className="text-xs text-slate-400">
            {filteredVehicles.length} de {vehicles.length} veículo{vehicles.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Filtros no estilo checkboxes */}
        <div className="mb-5 flex flex-wrap items-center gap-3 pb-3 border-b border-slate-200/80">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Filtrar por
          </span>
          {(Object.keys(filterConfig) as FilterType[]).map(filter => (
            <label
              key={filter}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-all duration-200",
                activeFilters.includes(filter)
                  ? `${filterConfig[filter].activeBg} ${filterConfig[filter].activeText} ${filterConfig[filter].activeBorder} border`
                  : `${filterConfig[filter].inactiveBg} ${filterConfig[filter].inactiveText} border border-transparent hover:bg-slate-200`
              )}
            >
              <input
                type="checkbox"
                checked={activeFilters.includes(filter)}
                onChange={() => toggleFilter(filter)}
                className={cn(
                  "w-4 h-4 rounded border-slate-300 focus:ring-offset-0",
                  filterConfig[filter].checkboxColor
                )}
              />
              <span className="text-sm font-medium">{filterConfig[filter].label}</span>
              <span className="text-xs bg-white/60 rounded-full px-1.5 py-0.5 ml-1">
                {counts[filter]}
              </span>
            </label>
          ))}
          {hasActiveFilters && (
            <button
              onClick={showAllFilters}
              className="ml-auto text-sm font-semibold text-white bg-[#0F3D5E] hover:bg-[#F97316] px-4 py-1.5 rounded-full transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Mostrar todos
            </button>
          )}
        </div>

        {filteredVehicles.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 font-medium">Nenhum veículo com os filtros selecionados</p>
            {hasActiveFilters && (
              <button onClick={showAllFilters} className="mt-2 text-sm text-[#0F3D5E] hover:text-[#F97316]">
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVehicles.map((vehicle) => {
              const vehicleTotalEvents = vehicle.eventCount.hardBrake + vehicle.eventCount.hardAcceleration + vehicle.eventCount.sharpCurve;
              const hasEvents = vehicleTotalEvents > 0;
              const statusColor = getStatusColor(vehicle.status);
              return (
                <div
                  key={vehicle.id}
                  onClick={() => onVehicleClick?.(vehicle)}
                  className={cn(
                    "group relative overflow-hidden rounded-xl bg-white cursor-pointer transition-all",
                    "border border-slate-100 hover:shadow-lg",
                    hasEvents ? "hover:border-red-200" : "hover:border-[#0F3D5E]/20"
                  )}
                >
                  <div className={cn(
                    "absolute top-0 left-0 right-0 h-1",
                    statusColor === 'emerald' ? "bg-emerald-500" :
                      statusColor === 'amber' ? "bg-amber-500" :
                        statusColor === 'red' ? "bg-red-500" : "bg-slate-300"
                  )} />
                  <div className="p-4">
                    <div className="flex justify-between mb-3">
                      <div>
                        <p className="text-base font-bold text-slate-700 group-hover:text-[#0F3D5E] transition-colors">
                          {vehicle.name || vehicle.code}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{vehicle.code} • {vehicle.driver}</p>
                      </div>
                      <div className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        vehicle.status === 'active' ? "bg-emerald-100 text-emerald-700" :
                          vehicle.status === 'warning' ? "bg-amber-100 text-amber-700" :
                            vehicle.status === 'error' ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-500"
                      )}>
                        {vehicle.status === 'active' ? 'Ativo' :
                          vehicle.status === 'warning' ? 'Aviso' :
                            vehicle.status === 'error' ? 'Erro' : 'Offline'}
                      </div>
                    </div>
                    <div className="flex gap-4 mb-3 text-xs">
                      {vehicle.speed !== undefined && (
                        <div className="flex items-center gap-1 text-slate-500">
                          <Gauge className="w-3.5 h-3.5 text-slate-400" />
                          <span>{vehicle.speed} <span className="text-slate-400">km/h</span></span>
                        </div>
                      )}
                      {vehicle.battery !== undefined && (
                        <div className="flex items-center gap-1 text-slate-500">
                          <Battery className="w-3.5 h-3.5 text-slate-400" />
                          <span>{vehicle.battery}v</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatRelativeTime(vehicle.lastUpdate)}</span>
                      </div>
                    </div>
                    {vehicle.driverScore !== undefined && (
                      <div className="mb-3 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={cn(
                            "h-full rounded-full",
                            vehicle.driverScore >= 80 ? "bg-emerald-500" :
                              vehicle.driverScore >= 60 ? "bg-amber-500" : "bg-red-500"
                          )} style={{ width: `${vehicle.driverScore}%` }} />
                        </div>
                        <span className="text-xs font-bold text-slate-600">{vehicle.driverScore}</span>
                      </div>
                    )}
                    <div className={cn("mt-3 pt-3 border-t", hasEvents ? "border-slate-100" : "border-slate-50")}>
                      <p className="text-xs font-medium text-slate-500 mb-2">
                        Eventos registrados
                        {hasEvents && <span className="ml-1 text-[#0F3D5E]">({vehicleTotalEvents})</span>}
                      </p>
                      {hasEvents ? (
                        <div className="grid grid-cols-3 gap-2">
                          {vehicle.eventCount.hardBrake > 0 && (
                            <div className="text-center p-1.5 rounded-lg bg-red-50">
                              <p className="text-xs font-bold text-red-600">{vehicle.eventCount.hardBrake}</p>
                              <p className="text-[10px] text-red-500">Freada</p>
                            </div>
                          )}
                          {vehicle.eventCount.hardAcceleration > 0 && (
                            <div className="text-center p-1.5 rounded-lg bg-amber-50">
                              <p className="text-xs font-bold text-amber-600">{vehicle.eventCount.hardAcceleration}</p>
                              <p className="text-[10px] text-amber-500">Aceleração</p>
                            </div>
                          )}
                          {vehicle.eventCount.sharpCurve > 0 && (
                            <div className="text-center p-1.5 rounded-lg bg-orange-50">
                              <p className="text-xs font-bold text-orange-600">{vehicle.eventCount.sharpCurve}</p>
                              <p className="text-[10px] text-orange-500">Curva</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex justify-center py-2">
                          <p className="text-xs text-slate-400">Nenhum evento registrado</p>
                        </div>
                      )}
                    </div>
                    <ChevronRight className="absolute right-3 bottom-3 w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
import { useMemo } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Zap, Shield, Award, Gauge, Battery, Clock, ChevronRight } from 'lucide-react';
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

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function KPIDashboard({ kpis, vehicles = [], onDriverClick, onVehicleClick }: KPIDashboardProps) {
  const totalEvents = kpis.eventsByType.hardBrake + kpis.eventsByType.hardAcceleration + kpis.eventsByType.sharpCurve;

  // Ordenar veículos por total de eventos (mais problemáticos primeiro)
  const sortedVehicles = useMemo(() => {
    if (!vehicles || vehicles.length === 0) return [];
    return [...vehicles].sort((a, b) => {
      const totalA = a.eventCount.hardBrake + a.eventCount.hardAcceleration + a.eventCount.sharpCurve;
      const totalB = b.eventCount.hardBrake + b.eventCount.hardAcceleration + b.eventCount.sharpCurve;
      return totalB - totalA;
    });
  }, [vehicles]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-br from-slate-50 via-white to-slate-50">
      
      {/* HEADER: Título + Botão de Exportação */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800">Dashboard</h2>
        <PDFDownloadButton
          kpis={kpis}
          topDrivers={kpis.topDrivers}
          eventsByType={kpis.eventsByType}
          vehiclesWithEvents={vehicles}
          buttonText="📄 Exportar Relatório"
        />
      </div>

      {/* ======================================================================
          STATUS CARDS - Grid 4 colunas moderno
          ==================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Veículos */}
        <div className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 hover:border-[#0F3D5E]/20">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#0F3D5E]/5 to-transparent rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
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

        {/* Ativos */}
        <div className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 hover:border-emerald-500/20">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
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

        {/* Avisos */}
        <div className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 hover:border-amber-500/20">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-500/5 to-transparent rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
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

        {/* Erros */}
        <div className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 hover:border-red-500/20">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-500/5 to-transparent rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
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

      {/* ======================================================================
          LADO A LADO: Eventos por Tipo | Score + Top Motoristas
          ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* COLUNA ESQUERDA: Eventos por Tipo */}
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#0F3D5E]/5 via-transparent to-transparent rounded-full -mr-16 -mt-16" />
          
          <div className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-1.5 bg-[#0F3D5E]/10 rounded-lg">
                <Gauge className="w-4 h-4 text-[#0F3D5E]" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Eventos por Tipo</h3>
            </div>

            <div className="space-y-4">
              {/* Freada Brusca */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-sm shadow-red-200" />
                    <span className="text-sm font-medium text-slate-600">Freada Brusca</span>
                  </div>
                  <span className="text-lg font-bold text-red-600">{kpis.eventsByType.hardBrake}</span>
                </div>
                <div className="w-full h-1.5 bg-red-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-500"
                    style={{ width: `${totalEvents ? (kpis.eventsByType.hardBrake / totalEvents) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Aceleração Brusca */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full shadow-sm shadow-yellow-200" />
                    <span className="text-sm font-medium text-slate-600">Aceleração Brusca</span>
                  </div>
                  <span className="text-lg font-bold text-amber-600">{kpis.eventsByType.hardAcceleration}</span>
                </div>
                <div className="w-full h-1.5 bg-amber-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${totalEvents ? (kpis.eventsByType.hardAcceleration / totalEvents) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Curva Acentuada */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full shadow-sm shadow-orange-200" />
                    <span className="text-sm font-medium text-slate-600">Curva Acentuada</span>
                  </div>
                  <span className="text-lg font-bold text-orange-600">{kpis.eventsByType.sharpCurve}</span>
                </div>
                <div className="w-full h-1.5 bg-orange-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500"
                    style={{ width: `${totalEvents ? (kpis.eventsByType.sharpCurve / totalEvents) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Geral</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-[#0F3D5E]">{totalEvents}</span>
                  <span className="text-xs text-slate-400">eventos</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: Score Médio + Top Motoristas */}
        <div className="space-y-6">
          
          {/* Score Médio */}
          <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-[#0F3D5E]/10 to-transparent rounded-full" />
            <div className="p-6">
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
          </div>

          {/* Top Motoristas */}
          <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-500/5 to-transparent rounded-full -mr-20 -mt-20" />
            <div className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-1.5 bg-amber-100 rounded-lg">
                  <Award className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Top Motoristas</h3>
              </div>

              <div className="space-y-3">
                {kpis.topDrivers.slice(0, 5).map((driver, index) => (
                  <div
                    key={driver.driverId}
                    onClick={() => onDriverClick?.(driver)}
                    className="group relative flex items-center justify-between p-3 rounded-xl bg-slate-50/50 hover:bg-slate-100 cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                        index === 0 ? "bg-amber-100 text-amber-700" :
                        index === 1 ? "bg-slate-200 text-slate-600" :
                        index === 2 ? "bg-orange-100 text-orange-700" :
                        "bg-slate-100 text-slate-500"
                      )}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700 group-hover:text-[#0F3D5E] transition-colors">
                          {driver.driverName}
                        </p>
                        <p className="text-xs text-slate-400">
                          {driver.vehicleCode} • {driver.totalEvents} evento{driver.totalEvents !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold",
                      driver.score >= 80 ? "bg-emerald-100 text-emerald-700" :
                      driver.score >= 60 ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      {driver.score}
                    </div>
                  </div>
                ))}
              </div>

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

      {/* ======================================================================
          BLOCO: Veículos e seus Eventos
          ==================================================================== */}
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#0F3D5E]/5 via-transparent to-transparent rounded-full -mr-32 -mt-32" />
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#0F3D5E]/10 rounded-lg">
                <Battery className="w-4 h-4 text-[#0F3D5E]" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Veículos por Eventos</h3>
            </div>
            <div className="text-xs text-slate-400">
              {vehicles.length} veículo{vehicles.length !== 1 ? 's' : ''}
            </div>
          </div>

          {vehicles.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500 font-medium">Nenhum veículo disponível</p>
              <p className="text-xs text-slate-400 mt-1">
                Os veículos aparecerão aqui quando os dados forem carregados
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedVehicles.map((vehicle) => {
                const vehicleTotalEvents = vehicle.eventCount.hardBrake + vehicle.eventCount.hardAcceleration + vehicle.eventCount.sharpCurve;
                const hasEvents = vehicleTotalEvents > 0;
                const statusColor = getStatusColor(vehicle.status);
                
                return (
                  <div
                    key={vehicle.id}
                    onClick={() => onVehicleClick?.(vehicle)}
                    className={cn(
                      "group relative overflow-hidden rounded-xl bg-white cursor-pointer transition-all duration-300",
                      "border border-slate-100 hover:shadow-lg hover:scale-[1.02]",
                      hasEvents ? "hover:border-red-200" : "hover:border-[#0F3D5E]/20"
                    )}
                  >
                    {/* Barra superior colorida baseada no status */}
                    <div className={cn(
                      "absolute top-0 left-0 right-0 h-1",
                      statusColor === 'emerald' ? "bg-emerald-500" :
                      statusColor === 'amber' ? "bg-amber-500" :
                      statusColor === 'red' ? "bg-red-500" :
                      "bg-slate-300"
                    )} />

                    <div className="p-4">
                      {/* Header do Veículo */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-base font-bold text-slate-700 group-hover:text-[#0F3D5E] transition-colors">
                            {vehicle.name || vehicle.code}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {vehicle.code} • {vehicle.driver}
                          </p>
                        </div>
                        <div className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          vehicle.status === 'active' ? "bg-emerald-100 text-emerald-700" :
                          vehicle.status === 'warning' ? "bg-amber-100 text-amber-700" :
                          vehicle.status === 'error' ? "bg-red-100 text-red-700" :
                          "bg-slate-100 text-slate-500"
                        )}>
                          {vehicle.status === 'active' ? 'Ativo' :
                           vehicle.status === 'warning' ? 'Aviso' :
                           vehicle.status === 'error' ? 'Erro' : 'Offline'}
                        </div>
                      </div>

                      {/* Métricas do Veículo */}
                      <div className="flex items-center gap-4 mb-3 text-xs">
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

                      {/* Score do Motorista */}
                      {vehicle.driverScore !== undefined && (
                        <div className="mb-3 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                vehicle.driverScore >= 80 ? "bg-emerald-500" :
                                vehicle.driverScore >= 60 ? "bg-amber-500" :
                                "bg-red-500"
                              )}
                              style={{ width: `${vehicle.driverScore}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-600">{vehicle.driverScore}</span>
                        </div>
                      )}

                      {/* Eventos do Veículo */}
                      <div className={cn(
                        "mt-3 pt-3 border-t rounded-lg transition-all",
                        hasEvents ? "border-slate-100" : "border-slate-50"
                      )}>
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
                          <div className="flex items-center justify-center py-2">
                            <p className="text-xs text-slate-400">Nenhum evento registrado</p>
                          </div>
                        )}
                      </div>

                      {/* Seta indicadora */}
                      <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
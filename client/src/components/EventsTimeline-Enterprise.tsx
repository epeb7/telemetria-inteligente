import { useMemo } from 'react';
import { TrendingDown, Zap, AlertCircle, Clock, MapPin, Calendar, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DriverEvent {
  id: string;
  vehicleId: string;
  type: 'hard_brake' | 'hard_acceleration' | 'sharp_curve';
  timestamp: Date;
  severity: 'high' | 'medium' | 'low';
  location: string;
  speed: number;
}

interface Vehicle {
  id: string;
  code: string;
  name: string;
  driver: string;
}

export interface EventsTimelineProps {
  events: DriverEvent[];
  vehicles: Vehicle[];
  onEventClick?: (event: DriverEvent) => void;
}

function getEventIcon(type: string) {
  switch (type) {
    case 'hard_brake':
      return <TrendingDown className="w-4 h-4" />;
    case 'hard_acceleration':
      return <Zap className="w-4 h-4" />;
    case 'sharp_curve':
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <AlertCircle className="w-4 h-4" />;
  }
}

function getEventLabel(type: string): string {
  switch (type) {
    case 'hard_brake':
      return 'Freada Brusca';
    case 'hard_acceleration':
      return 'Aceleração Brusca';
    case 'sharp_curve':
      return 'Curva Acentuada';
    default:
      return 'Evento';
  }
}

function getEventColorClass(type: string): string {
  switch (type) {
    case 'hard_brake':
      return 'red';
    case 'hard_acceleration':
      return 'amber';
    case 'sharp_curve':
      return 'orange';
    default:
      return 'slate';
  }
}

function getEventGradient(type: string): string {
  switch (type) {
    case 'hard_brake':
      return 'from-red-500 to-red-600';
    case 'hard_acceleration':
      return 'from-amber-500 to-amber-600';
    case 'sharp_curve':
      return 'from-orange-500 to-orange-600';
    default:
      return 'from-slate-500 to-slate-600';
  }
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'high':
      return 'bg-red-100 text-red-700';
    case 'medium':
      return 'bg-amber-100 text-amber-700';
    case 'low':
      return 'bg-emerald-100 text-emerald-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}

function getSeverityLabel(severity: string): string {
  switch (severity) {
    case 'high':
      return 'Alto';
    case 'medium':
      return 'Médio';
    case 'low':
      return 'Baixo';
    default:
      return 'Desconhecido';
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatRelativeDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateStr = formatDate(date);
  const todayStr = formatDate(today);
  const yesterdayStr = formatDate(yesterday);

  if (dateStr === todayStr) return 'Hoje';
  if (dateStr === yesterdayStr) return 'Ontem';
  return dateStr;
}

/**
 * Timeline de eventos em tempo real
 * Mostra os eventos mais recentes com detalhes
 */
export function EventsTimeline({
  events,
  vehicles,
  onEventClick,
}: EventsTimelineProps) {
  // Ordenar eventos por timestamp (mais recentes primeiro)
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [events]);

  // Agrupar eventos por data
  const groupedEvents = useMemo(() => {
    const groups: { [key: string]: DriverEvent[] } = {};

    sortedEvents.forEach((event) => {
      const dateKey = formatDate(event.timestamp);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
    });

    return groups;
  }, [sortedEvents]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {Object.entries(groupedEvents).length === 0 ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-slate-300" />
            </div>
            <p className="text-slate-600 font-medium mb-1">Nenhum evento registrado</p>
            <p className="text-sm text-slate-400">
              Os eventos aparecerão aqui conforme ocorrerem
            </p>
          </div>
        </div>
      ) : (
        <>
          {Object.entries(groupedEvents).map(([date, dateEvents]) => {
            const relativeDate = formatRelativeDate(new Date(date));
            const isToday = relativeDate === 'Hoje';
            
            return (
              <div key={date} className="space-y-4">
                {/* Data Header - Design Moderno */}
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-semibold",
                    isToday 
                      ? "bg-gradient-to-r from-[#0F3D5E] to-[#0F3D5E]/80 text-white shadow-sm" 
                      : "bg-slate-100 text-slate-600"
                  )}>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      <span>{relativeDate}</span>
                    </div>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-slate-200 via-slate-300 to-transparent" />
                  <span className="text-xs text-slate-400 font-medium">
                    {dateEvents.length} evento{dateEvents.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Eventos da Data - Cards Modernos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dateEvents.map((event) => {
                    const vehicle = vehicles.find((v) => v.id === event.vehicleId);
                    const eventColor = getEventColorClass(event.type);
                    const eventGradient = getEventGradient(event.type);
                    
                    return (
                      <div
                        key={event.id}
                        onClick={() => onEventClick?.(event)}
                        className={cn(
                          'group relative overflow-hidden rounded-xl bg-white cursor-pointer transition-all duration-300',
                          'border border-slate-100 hover:shadow-lg hover:scale-[1.02] hover:border-transparent'
                        )}
                      >
                        {/* Gradiente de fundo no hover */}
                        <div className={cn(
                          'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                          `bg-gradient-to-br from-${eventColor}-50/50 to-transparent`
                        )} />
                        
                        {/* Barra lateral colorida */}
                        <div className={cn(
                          'absolute left-0 top-0 bottom-0 w-1 rounded-l-xl',
                          `bg-gradient-to-b ${eventGradient}`
                        )} />

                        <div className="p-4 relative">
                          {/* Header do Evento */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center',
                                eventColor === 'red' ? 'bg-red-100 text-red-600' :
                                eventColor === 'amber' ? 'bg-amber-100 text-amber-600' :
                                'bg-orange-100 text-orange-600'
                              )}>
                                {getEventIcon(event.type)}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-700">
                                  {getEventLabel(event.type)}
                                </p>
                                {vehicle && (
                                  <p className="text-xs text-slate-400">
                                    {vehicle.code} • {vehicle.driver}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span
                              className={cn(
                                'text-xs font-semibold px-2 py-1 rounded-full',
                                getSeverityColor(event.severity)
                              )}
                            >
                              {getSeverityLabel(event.severity)}
                            </span>
                          </div>

                          {/* Detalhes - Grid Moderno */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{formatTime(event.timestamp)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Zap className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-medium">{event.speed} <span className="text-slate-400">km/h</span></span>
                            </div>
                            <div className="col-span-2 flex items-center gap-1.5 text-slate-500">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          </div>

                          {/* Seta indicadora de clique */}
                          <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <ChevronRight className="w-4 h-4 text-slate-300" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* Info de Contagem - Footer Estilizado */}
      <div className="sticky bottom-0 left-0 right-0 mt-6 p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-100 text-center text-xs text-slate-400 shadow-sm">
        <span className="font-medium text-[#0F3D5E]">{events.length}</span>
        {' '}evento{events.length !== 1 ? 's' : ''} registrado{events.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
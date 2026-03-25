import { useMemo } from 'react';
import { TrendingDown, Zap, AlertCircle, Clock, MapPin } from 'lucide-react';
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

function getEventColor(type: string): string {
  switch (type) {
    case 'hard_brake':
      return 'bg-red-50 border-red-200 text-red-600';
    case 'hard_acceleration':
      return 'bg-yellow-50 border-yellow-200 text-yellow-600';
    case 'sharp_curve':
      return 'bg-orange-50 border-orange-200 text-orange-600';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-600';
  }
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
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
    <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-background">
      {Object.entries(groupedEvents).length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground mb-1">Nenhum evento registrado</p>
            <p className="text-xs text-muted-foreground">
              Os eventos aparecerão aqui conforme ocorrerem
            </p>
          </div>
        </div>
      ) : (
        Object.entries(groupedEvents).map(([date, dateEvents]) => (
          <div key={date}>
            {/* Data Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs font-semibold text-muted-foreground px-2">
                {date}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Eventos da Data */}
            <div className="space-y-2">
              {dateEvents.map((event, index) => {
                const vehicle = vehicles.find((v) => v.id === event.vehicleId);

                return (
                  <div
                    key={event.id}
                    onClick={() => onEventClick?.(event)}
                    className={cn(
                      'p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md',
                      getEventColor(event.type)
                    )}
                  >
                    {/* Header do Evento */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getEventIcon(event.type)}
                        <div>
                          <p className="text-sm font-semibold">
                            {getEventLabel(event.type)}
                          </p>
                          {vehicle && (
                            <p className="text-xs opacity-75">
                              {vehicle.code} • {vehicle.driver}
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className={cn(
                          'text-xs font-semibold px-2 py-1 rounded',
                          getSeverityColor(event.severity)
                        )}
                      >
                        {getSeverityLabel(event.severity)}
                      </span>
                    </div>

                    {/* Detalhes */}
                    <div className="grid grid-cols-2 gap-2 text-xs opacity-75">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(event.timestamp)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        <span>{event.speed} km/h</span>
                      </div>
                      <div className="col-span-2 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Info de Contagem */}
      <div className="sticky bottom-0 left-0 right-0 mt-4 p-3 bg-secondary/50 rounded-lg border border-border text-center text-xs text-muted-foreground">
        {events.length} evento{events.length !== 1 ? 's' : ''} registrado{events.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
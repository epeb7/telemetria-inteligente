import { Vehicle, DriverEvent } from '@/../../shared/types';
import { X, Phone, Mail, AlertCircle, Zap, TrendingDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface DriverModalProps {
  vehicle: Vehicle | null;
  events: DriverEvent[];
  isOpen: boolean;
  onClose: () => void;
}

function getEventIcon(type: string) {
  switch (type) {
    case 'hard_brake':
      return <TrendingDown className="w-5 h-5" />;
    case 'hard_acceleration':
      return <Zap className="w-5 h-5" />;
    case 'sharp_curve':
      return <AlertCircle className="w-5 h-5" />;
    default:
      return <AlertCircle className="w-5 h-5" />;
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
      return 'text-red-600 bg-red-50';
    case 'hard_acceleration':
      return 'text-yellow-600 bg-yellow-50';
    case 'sharp_curve':
      return 'text-orange-600 bg-orange-50';
    default:
      return 'text-gray-600 bg-gray-50';
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

function formatTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function DriverModal({ vehicle, events, isOpen, onClose }: DriverModalProps) {
  if (!vehicle) return null;

  const vehicleEvents = events.filter((e) => e.vehicleId === vehicle.id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <DialogTitle className="text-2xl">{vehicle.name}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">Código: {vehicle.code}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-secondary rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Driver Information */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <h3 className="font-semibold text-lg text-card-foreground mb-4">
              Informações do Motorista
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {vehicle.driver ? vehicle.driver.charAt(0).toUpperCase() : 'N'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-card-foreground">{vehicle.driver || 'N/A'}</p>
                  <p className="text-xs text-muted-foreground">Motorista</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Telefone</p>
                    <p className="text-sm font-medium text-card-foreground">
                      {vehicle.driverPhone || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium text-card-foreground">
                      {vehicle.driverEmail || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-white/50 rounded-lg border border-blue-200">
                <p className="text-xs text-muted-foreground mb-1">Rota</p>
                <p className="text-sm font-medium text-card-foreground">{vehicle.route || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Driver Events */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-card-foreground">
                Eventos do Veículo
              </h3>
              <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                {vehicleEvents.length} eventos
              </span>
            </div>

            {vehicleEvents.length === 0 ? (
              <div className="bg-secondary/50 rounded-lg p-8 text-center border border-border">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">Nenhum evento registrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {vehicleEvents
                  .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                  .map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        'p-4 rounded-lg border transition-all hover:shadow-md',
                        getEventColor(event.type)
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={cn('p-2 rounded-lg', getEventColor(event.type))}>
                            {getEventIcon(event.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-sm">
                                {getEventLabel(event.type)}
                              </h4>
                              <span
                                className={cn(
                                  'text-xs px-2 py-1 rounded-full font-medium',
                                  getSeverityColor(event.severity)
                                )}
                              >
                                {event.severity === 'high'
                                  ? 'Alto'
                                  : event.severity === 'medium'
                                    ? 'Médio'
                                    : 'Baixo'}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {event.location && (
                                <>
                                  📍 {event.location}
                                  {event.speed && ` • ${event.speed} km/h`}
                                </>
                              )}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{formatDate(event.timestamp)}</span>
                              <span className="font-mono font-semibold">
                                {formatTime(event.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3 bg-secondary/50 rounded-lg p-4 border border-border">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {vehicleEvents.filter((e) => e.type === 'hard_brake').length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Freadas Bruscas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {vehicleEvents.filter((e) => e.type === 'hard_acceleration').length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Acelerações Bruscas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {vehicleEvents.filter((e) => e.type === 'sharp_curve').length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Curvas Acentuadas</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
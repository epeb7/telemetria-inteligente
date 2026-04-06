import { useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Vehicle, DriverEvent } from '@/../../shared/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingDown, Zap, AlertCircle, Phone, Mail, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EventDetailModal } from '@/components/EventDetailModal';
import { TermoAvisoMotoristaPDF } from './TermoAvisoMotoristaPDF';

interface DriverModalProps {
  vehicle: Vehicle | null;
  events: DriverEvent[];
  isOpen: boolean;
  onClose: () => void;
}

// Funções auxiliares (já existentes, mantidas)
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

// Função para calcular score do motorista
function calculateDriverScore(events: DriverEvent[]): number {
  const eventCounts = {
    hardBrake: events.filter(e => e.type === 'hard_brake').length,
    hardAcceleration: events.filter(e => e.type === 'hard_acceleration').length,
    sharpCurve: events.filter(e => e.type === 'sharp_curve').length,
  };
  const weightedScore =
    eventCounts.hardBrake * 5 +
    eventCounts.hardAcceleration * 3 +
    eventCounts.sharpCurve * 2;
  return Math.max(0, 100 - Math.min(100, weightedScore));
}

export function DriverModal({
  vehicle,
  events,
  isOpen,
  onClose,
}: DriverModalProps) {
  const [selectedEvent, setSelectedEvent] = useState<DriverEvent | null>(null);
  const [isEventDetailOpen, setIsEventDetailOpen] = useState(false);
  const [gestorNome, setGestorNome] = useState('');

  if (!vehicle) return null;

  // Filtrar eventos do veículo atual
  const vehicleEvents = events.filter((e) => e.vehicleId === vehicle.id);

  // Contar eventos por tipo
  const eventCounts = {
    hard_brake: vehicleEvents.filter((e) => e.type === 'hard_brake').length,
    hard_acceleration: vehicleEvents.filter((e) => e.type === 'hard_acceleration').length,
    sharp_curve: vehicleEvents.filter((e) => e.type === 'sharp_curve').length,
  };

  // Calcular score e status
  const score = calculateDriverScore(vehicleEvents);
  const status = score < 60 ? 'Crítico - Sob Aviso' : score < 80 ? 'Atenção' : 'Bom';

  // Dados do motorista
  const driver = {
    nome: vehicle.driver,
    telefone: '(11) 98765-4321', // Se vier do mock futuramente, use dado real
    email: 'motorista@email.com',
  };

  const handleEventClick = (event: DriverEvent) => {
    setSelectedEvent(event);
    setIsEventDetailOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>{vehicle.name}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">Código: {vehicle.code}</p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Informações do Motorista */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <p className="text-sm font-semibold mb-4">Informações do Motorista</p>
                <div className="space-y-4">
                  {/* Avatar e Nome */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-blue-700">
                        {vehicle.driver ? vehicle.driver.charAt(0).toUpperCase() : 'N'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{vehicle.driver || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">Motorista</p>
                    </div>
                  </div>

                  {/* Contato e Rota */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Telefone</p>
                        <p className="text-sm font-semibold">{driver.telefone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-semibold">{driver.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Rota</p>
                      <p className="text-sm font-semibold">{vehicle.route || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Eventos do Veículo */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold">Eventos do Veículo</p>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {vehicleEvents.length} eventos
                </span>
              </div>

              {vehicleEvents.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground py-4">
                      Nenhum evento registrado
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {vehicleEvents.map((event) => (
                    <Card
                      key={event.id}
                      className={cn(
                        'cursor-pointer hover:shadow-md transition-shadow',
                        getEventColor(event.type)
                      )}
                      onClick={() => handleEventClick(event)}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="mt-1">{getEventIcon(event.type)}</div>
                            <div className="flex-1">
                              <p className="font-semibold">{getEventLabel(event.type)}</p>
                              <p className="text-sm opacity-75 mt-1">
                                📍 {event.location} • {event.speed} km/h
                              </p>
                              <p className="text-xs opacity-60 mt-1">
                                {formatDate(event.timestamp)} às {formatTime(event.timestamp)}
                              </p>
                            </div>
                          </div>
                          <span
                            className={cn(
                              'px-2 py-1 rounded text-xs font-medium whitespace-nowrap ml-2',
                              getSeverityColor(event.severity)
                            )}
                          >
                            {getSeverityLabel(event.severity)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Resumo de Eventos */}
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-semibold mb-4">Resumo de Eventos</p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-center">
                    <p className="text-2xl font-bold text-red-600">{eventCounts.hard_brake}</p>
                    <p className="text-xs text-muted-foreground mt-1">Freadas Bruscas</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{eventCounts.hard_acceleration}</p>
                    <p className="text-xs text-muted-foreground mt-1">Acelerações Bruscas</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200 text-center">
                    <p className="text-2xl font-bold text-orange-600">{eventCounts.sharp_curve}</p>
                    <p className="text-xs text-muted-foreground mt-1">Curvas Acentuadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* NOVO: Campo para nome do diretor */}
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700">Nome do Diretor/Gestor (para assinatura):</label>
              <input
                type="text"
                value={gestorNome}
                onChange={(e) => setGestorNome(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 mt-1 text-sm"
                placeholder="Digite o nome completo do diretor"
              />
            </div>

            {/* NOVO: Botão para gerar PDF do termo de aviso */}
            <div className="flex justify-end mt-4">
              <PDFDownloadLink
                document={
                  <TermoAvisoMotoristaPDF
                    vehicle={vehicle}
                    driver={{
                      nome: vehicle.driver,
                      telefone: driver.telefone,
                      email: driver.email,
                    }}
                    events={vehicleEvents}
                    summary={{
                      totalEvents: vehicleEvents.length,
                      score,
                      status,
                    }}
                    gestorNome={gestorNome.trim() || '_________________________'}
                    motoristaNome={vehicle.driver}
                    dataDocumento={new Date().toLocaleDateString('pt-BR')}
                  />
                }
                fileName={`termo_aviso_${vehicle.driver}_${new Date().toISOString().slice(0, 10)}.pdf`}
              >
                {({ loading }) => (
                  <button
                    className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 transition-colors disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? 'Gerando PDF...' : 'Gerar Termo de Aviso'}
                  </button>
                )}
              </PDFDownloadLink>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes do Evento */}
      <EventDetailModal
        event={selectedEvent}
        vehicle={vehicle}
        isOpen={isEventDetailOpen}
        onClose={() => {
          setIsEventDetailOpen(false);
          setSelectedEvent(null);
        }}
      />
    </>
  );
}
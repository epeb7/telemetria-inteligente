import { useRef, useEffect } from 'react';
import { DriverEvent, Vehicle } from '@/../../shared/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { MapView } from '@/components/Map';
import { TrendingDown, Zap, AlertCircle, MapPin, Clock, Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventDetailModalProps {
  event: DriverEvent | null;
  vehicle: Vehicle | null;
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

export function EventDetailModal({
  event,
  vehicle,
  isOpen,
  onClose,
}: EventDetailModalProps) {
  const mapRef = useRef<any>(null);

  if (!event || !vehicle) return null;

  const handleMapReady = (map: any) => {
    mapRef.current = map;

    // Limpar marcadores e polylines anteriores
    if (map.clearMarkers) map.clearMarkers();
    if (map.clearPolylines) map.clearPolylines();

    // Coordenadas do evento
    const eventLocation = {
      lat: vehicle.latitude,
      lng: vehicle.longitude,
    };

    // Centralizar mapa no evento
    if (map.setCenter) map.setCenter(eventLocation);
    if (map.setZoom) map.setZoom(15);

    // Gerar pontos de rota simulados ao redor do evento
    const routePoints: any[] = [];
    for (let i = 0; i < 10; i++) {
      routePoints.push({
        lat: vehicle.latitude + (Math.random() - 0.5) * 0.01,
        lng: vehicle.longitude + (Math.random() - 0.5) * 0.01,
      });
    }

    // Desenhar polyline da rota
    try {
      if (map.Polyline) {
        new map.Polyline({
          path: routePoints,
          geodesic: true,
          strokeColor: '#3b82f6',
          strokeOpacity: 0.7,
          strokeWeight: 3,
          map: map,
        });
      }
    } catch (e) {
      console.log('Polyline não disponível');
    }

    // Adicionar marcador do evento
    try {
      if (map.marker?.AdvancedMarkerElement) {
        new map.marker.AdvancedMarkerElement({
          map: map,
          position: eventLocation,
          title: getEventLabel(event.type),
        });
      } else if (map.Marker) {
        new map.Marker({
          map: map,
          position: eventLocation,
          title: getEventLabel(event.type),
        });
      }
    } catch (e) {
      console.log('Marcador não disponível');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', getEventColor(event.type))}>
              {getEventIcon(event.type)}
            </div>
            <div>
              <DialogTitle>{getEventLabel(event.type)}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {vehicle.name} • {vehicle.plate}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Evento */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Data e Hora</p>
                  <p className="font-semibold">
                    {formatDate(event.timestamp)} às {formatTime(event.timestamp)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Severidade</p>
                  <span className={cn('inline-block px-3 py-1 rounded-full text-sm font-medium', getSeverityColor(event.severity))}>
                    {getSeverityLabel(event.severity)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Localização</p>
                  <p className="font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Velocidade</p>
                  <p className="font-semibold flex items-center gap-2">
                    <Gauge className="w-4 h-4" />
                    {event.speed} km/h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mapa com Google Maps ou Mockado */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm font-semibold mb-3">Localização do Evento</p>
              <MapView
                initialCenter={{
                  lat: vehicle.latitude,
                  lng: vehicle.longitude,
                }}
                initialZoom={15}
                onMapReady={handleMapReady}
                className="w-full h-64 rounded-lg border border-gray-200"
              />
            </CardContent>
          </Card>

          {/* Métricas Detalhadas */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm font-semibold mb-4">Métricas do Evento</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-muted-foreground mb-1">Velocidade Máxima</p>
                  <p className="text-2xl font-bold text-blue-600">{event.speed}</p>
                  <p className="text-xs text-muted-foreground">km/h</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-xs text-muted-foreground mb-1">Desaceleração</p>
                  <p className="text-2xl font-bold text-red-600">
                    {event.type === 'hard_brake' ? '8.5' : '2.1'}
                  </p>
                  <p className="text-xs text-muted-foreground">m/s²</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-xs text-muted-foreground mb-1">Duração</p>
                  <p className="text-2xl font-bold text-amber-600">0.8</p>
                  <p className="text-xs text-muted-foreground">segundos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coordenadas Precisas */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm font-semibold mb-3">Coordenadas Precisas</p>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-muted-foreground">Latitude:</span>
                  <span className="font-semibold">{vehicle.latitude.toFixed(6)}</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-muted-foreground">Longitude:</span>
                  <span className="font-semibold">{vehicle.longitude.toFixed(6)}</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-muted-foreground">Localização:</span>
                  <span className="font-semibold">{event.location}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
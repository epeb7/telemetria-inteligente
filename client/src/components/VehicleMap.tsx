import { useEffect, useRef, useState } from 'react';
import { Vehicle } from '@/../../shared/types';
import { cn } from '@/lib/utils';
import { MapView } from './Map';

interface VehicleMapProps {
  vehicles: Vehicle[];
  selectedVehicle?: Vehicle;
  onVehicleSelect?: (vehicle: Vehicle) => void;
}

export function VehicleMap({ vehicles, selectedVehicle, onVehicleSelect }: VehicleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [hoveredVehicle, setHoveredVehicle] = useState<string | null>(null);

  // Convert lat/lng to pixel position on the map
  // São Paulo center: -23.5505, -46.6333
  // Map bounds: roughly -23.54 to -23.56 lat, -46.62 to -46.64 lng
  const getPixelPosition = (lat: number, lng: number) => {
    const mapWidth = 800;
    const mapHeight = 400;
    // Center coordinates
    const centerLat = -23.5505;
    const centerLng = -46.6333;
    
    // Scale (pixels per degree)
    const latScale = mapHeight / 0.04; // ~0.04 degrees visible
    const lngScale = mapWidth / 0.04;
    
    const x = mapWidth / 2 + (lng - centerLng) * lngScale;
    const y = mapHeight / 2 - (lat - centerLat) * latScale;
    
    return { x: Math.max(0, Math.min(mapWidth, x)), y: Math.max(0, Math.min(mapHeight, y)) };
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'warning':
        return 'bg-amber-500';
      case 'error':
        return 'bg-red-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-blue-500';
    }
  };

  const getStatusBgColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'bg-green-100';
      case 'warning':
        return 'bg-amber-100';
      case 'error':
        return 'bg-red-100';
      case 'offline':
        return 'bg-gray-100';
      default:
        return 'bg-blue-100';
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Map container */}
      <div
        ref={mapRef}
        className="relative w-full flex-1 bg-gradient-to-br from-blue-50 to-blue-100 border border-border rounded-lg overflow-hidden"
        style={{ minHeight: '400px' }}
      >
        {/* Grid background */}
        <svg
          className="absolute inset-0 w-full h-full opacity-10"
          style={{ pointerEvents: 'none' }}
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#333" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Center marker */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-2 h-2 bg-gray-400 rounded-full" />
          <div className="absolute top-4 left-2 text-xs text-gray-500 whitespace-nowrap">
            São Paulo
          </div>
        </div>

        {/* Vehicle markers */}
        {vehicles.map((vehicle) => {
          const { x, y } = getPixelPosition(vehicle.latitude, vehicle.longitude);
          const isSelected = selectedVehicle?.id === vehicle.id;
          const isHovered = hoveredVehicle === vehicle.id;

          return (
            <div
              key={vehicle.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{ left: `${x}px`, top: `${y}px` }}
              onMouseEnter={() => setHoveredVehicle(vehicle.id)}
              onMouseLeave={() => setHoveredVehicle(null)}
              onClick={() => onVehicleSelect?.(vehicle)}
            >
              {/* Marker pulse */}
              <div
                className={cn(
                  'absolute inset-0 rounded-full animate-pulse',
                  getStatusBgColor(vehicle.status)
                )}
                style={{
                  width: isSelected ? '48px' : isHovered ? '40px' : '32px',
                  height: isSelected ? '48px' : isHovered ? '40px' : '32px',
                  left: isSelected ? '-24px' : isHovered ? '-20px' : '-16px',
                  top: isSelected ? '-24px' : isHovered ? '-20px' : '-16px',
                  transition: 'all 200ms ease-out'
                }}
              />

              {/* Main marker */}
              <div
                className={cn(
                  'relative w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-lg transition-all duration-200 border-2',
                  getStatusColor(vehicle.status),
                  isSelected ? 'border-white ring-2 ring-primary scale-125' : 'border-white hover:scale-110'
                )}
              >
                {/* Icon or initial */}
                <span className="text-lg">🚚</span>
              </div>

              {/* Tooltip */}
              {(isHovered || isSelected) && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-card text-card-foreground px-3 py-2 rounded-lg shadow-lg text-xs whitespace-nowrap border border-border z-10 pointer-events-none">
                  <div className="font-semibold">{vehicle.name}</div>
                  <div className="text-muted-foreground text-xs">{vehicle.plate}</div>
                  <div className="text-muted-foreground text-xs mt-1">
                    {vehicle.speed} km/h
                  </div>
                  <div>
                    odometer: {vehicle.odometer} km
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-border shadow-sm">
          <div className="text-xs font-semibold text-card-foreground mb-2">Status</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-muted-foreground">Ativo</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-amber-500 rounded-full" />
              <span className="text-muted-foreground">Aviso</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-muted-foreground">Erro</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-gray-400 rounded-full" />
              <span className="text-muted-foreground">Offline</span>
            </div>
          </div>
        </div>

        {/* Coordinates display */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 border border-border shadow-sm text-xs text-muted-foreground">
          <div>São Paulo, SP</div>
          <div className="font-mono text-xs">-23.55° S, -46.63° W</div>
        </div>
      </div>

      {/* Info bar */}
      <div className="bg-secondary border-t border-border px-4 py-2 text-xs text-muted-foreground">
        {selectedVehicle ? (
          <span>
            Selecionado: <strong>{selectedVehicle.name}</strong> • Velocidade:{' '}
            <strong>{selectedVehicle.speed} km/h</strong> • Combustível:{' '}
          </span>
        ) : (
          <span>Clique em um veículo no mapa para ver detalhes</span>
        )}
      </div>
    </div>
  );
}

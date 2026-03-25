import { useMemo, useRef, useEffect, useState } from 'react';
import { VehicleCard } from './VehicleCard';
import { cn } from '@/lib/utils';

  interface VehicleGridProps {
  vehicles: any[];
  selectedVehicleId?: string;
  onSelectVehicle: (vehicle: any) => void;
}

/**
 * Grid dinâmico que:
 * - Adapta número de colunas baseado no tamanho da tela
 * - Cresce dinamicamente quando novos veículos são adicionados
 * - Sem scrollbar do navegador (usa scroll interno)
 * - Otimizado para 300+ veículos
 */
export function VehicleGrid({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
}: VehicleGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(3);
  const [containerWidth, setContainerWidth] = useState(0);

  // Calcular número de colunas baseado na largura
  useEffect(() => {
    const updateColumns = () => {
      if (!containerRef.current) return;

      const width = containerRef.current.clientWidth;
      setContainerWidth(width);

      // Cada card tem ~280px de largura mínima
      const cardWidth = 280;
      const gap = 16;
      const newColumns = Math.max(1, Math.floor((width + gap) / (cardWidth + gap)));

      setColumns(newColumns);
    };

    updateColumns();

    const resizeObserver = new ResizeObserver(updateColumns);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Calcular altura dinâmica do grid
  const rows = useMemo(() => {
    return Math.ceil(vehicles.length / columns);
  }, [vehicles.length, columns]);

  const cardHeight = 220; // Altura aproximada de um card
  const gridHeight = rows * cardHeight + (rows - 1) * 16; // 16px gap

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto overflow-x-hidden p-4 bg-background"
    >
      {/* Grid Container */}
      <div
        className="grid gap-4 auto-rows-max"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          minHeight: `${gridHeight}px`,
        }}
      >
        {vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            selected={selectedVehicleId === vehicle.id}
            onClick={() => onSelectVehicle(vehicle)}
          />
        ))}
      </div>

      {/* Empty State */}
      {vehicles.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">Nenhum veículo encontrado</p>
            <p className="text-xs text-muted-foreground">
              Tente ajustar os filtros
            </p>
          </div>
        </div>
      )}

      {/* Info de Contagem */}
      <div className="sticky bottom-0 left-0 right-0 mt-4 p-3 bg-secondary/50 rounded-lg border border-border text-center text-xs text-muted-foreground">
        {vehicles.length} veículo{vehicles.length !== 1 ? 's' : ''} encontrado{vehicles.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

/**
 * Versão compacta do grid para mobile
 */
export function VehicleGridMobile({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
}: VehicleGridProps) {
  return (
    <div className="flex-1 overflow-y-auto p-3 bg-background space-y-2">
      {vehicles.map((vehicle) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          selected={selectedVehicleId === vehicle.id}
          onClick={() => onSelectVehicle(vehicle)}
            
        />
      ))}

      {vehicles.length === 0 && (
        <div className="flex items-center justify-center h-32">
          <p className="text-sm text-muted-foreground">Nenhum veículo encontrado</p>
        </div>
      )}
    </div>
  );
}
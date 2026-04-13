import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { VehicleCard } from './VehicleCard';
import { cn } from '@/lib/utils';

interface VehicleGridProps {
  vehicles: any[];
  selectedVehicleId?: string;
  onSelectVehicle: (vehicle: any) => void;
}

type FilterType = 'info' | 'warning' | 'alert';

// Mapeamento de status para tipo de filtro
const getFilterTypeFromStatus = (status: string): FilterType | null => {
  if (status === 'active') return 'info';
  if (status === 'warning') return 'warning';
  if (status === 'error') return 'alert';
  return null;
};

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

export function VehicleGrid({ vehicles, selectedVehicleId, onSelectVehicle }: VehicleGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(3);
  const [activeFilters, setActiveFilters] = useState<FilterType[]>(['info', 'warning', 'alert']);

  // Atualiza número de colunas baseado na largura do container (otimizado)
  useEffect(() => {
    const updateColumns = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const cardWidth = 280;
      const gap = 16;
      const newColumns = Math.max(1, Math.floor((width + gap) / (cardWidth + gap)));
      setColumns(newColumns);
    };
    updateColumns();
    const resizeObserver = new ResizeObserver(updateColumns);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Alterna um filtro (memoizada)
  const toggleFilter = useCallback((filter: FilterType) => {
    setActiveFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  }, []);

  // Mostra todos os filtros
  const showAllFilters = useCallback(() => {
    setActiveFilters(['info', 'warning', 'alert']);
  }, []);

  // Contagens memoizadas (evita recalcular em cada render)
  const counts = useMemo(() => {
    return {
      info: vehicles.filter(v => v.status === 'active').length,
      warning: vehicles.filter(v => v.status === 'warning').length,
      alert: vehicles.filter(v => v.status === 'error').length,
    };
  }, [vehicles]);

  // Filtragem memoizada (evita recriar array em cada render)
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      const type = getFilterTypeFromStatus(vehicle.status);
      if (!type) return false;
      return activeFilters.includes(type);
    });
  }, [vehicles, activeFilters]);

  const hasActiveFilters = activeFilters.length < 3;

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto overflow-x-hidden p-4 bg-background"
      style={{ height: '100%' }}
    >
      {/* Header com filtros */}
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
            className="ml-auto text-xs font-medium text-[#0F3D5E] hover:text-[#F97316] transition-colors flex items-center gap-1"
          >
            <span>Mostrar todos</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>

      {/* Grid de veículos */}
      <div
        className="grid gap-4 auto-rows-max transition-all duration-300"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {filteredVehicles.map(vehicle => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            selected={selectedVehicleId === vehicle.id}
            onClick={() => onSelectVehicle(vehicle)}
          />
        ))}
      </div>

      {/* Estado vazio */}
      {filteredVehicles.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-muted-foreground">Nenhum veículo encontrado com os filtros selecionados</p>
          {hasActiveFilters && (
            <button
              onClick={showAllFilters}
              className="mt-2 text-sm text-[#0F3D5E] hover:text-[#F97316] transition-colors"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}

      {/* Rodapé com contagem */}
      <div className="mt-5 p-3 bg-slate-50/80 rounded-xl text-center text-xs text-slate-500 border border-slate-100">
        {filteredVehicles.length} veículo{filteredVehicles.length !== 1 ? 's' : ''} exibido
        {filteredVehicles.length !== 1 ? 's' : ''} de {vehicles.length} total
      </div>
    </div>
  );
}

// ============================================================================
// VERSÃO MOBILE (com chips estilizados e layout otimizado)
// ============================================================================

export function VehicleGridMobile({ vehicles, selectedVehicleId, onSelectVehicle }: VehicleGridProps) {
  const [activeFilters, setActiveFilters] = useState<FilterType[]>(['info', 'warning', 'alert']);

  const toggleFilter = useCallback((filter: FilterType) => {
    setActiveFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  }, []);

  const showAllFilters = useCallback(() => {
    setActiveFilters(['info', 'warning', 'alert']);
  }, []);

  const counts = useMemo(() => ({
    info: vehicles.filter(v => v.status === 'active').length,
    warning: vehicles.filter(v => v.status === 'warning').length,
    alert: vehicles.filter(v => v.status === 'error').length,
  }), [vehicles]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      const type = getFilterTypeFromStatus(vehicle.status);
      if (!type) return false;
      return activeFilters.includes(type);
    });
  }, [vehicles, activeFilters]);

  const hasActiveFilters = activeFilters.length < 3;

  return (
    <div className="flex-1 overflow-y-auto p-3 bg-background space-y-3" style={{ height: '100%' }}>
      {/* Filtros estilo chips */}
      <div className="flex flex-wrap gap-2 pb-3 border-b border-slate-200/80">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider self-center mr-1">
          Filtros
        </span>
        {(Object.keys(filterConfig) as FilterType[]).map(filter => (
          <button
            key={filter}
            onClick={() => toggleFilter(filter)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
              activeFilters.includes(filter)
                ? `${filterConfig[filter].activeBg} ${filterConfig[filter].activeText} border ${filterConfig[filter].activeBorder}`
                : "bg-slate-100 text-slate-500 border border-transparent"
            )}
          >
            {filterConfig[filter].label} ({counts[filter]})
          </button>
        ))}
        {hasActiveFilters && (
          <button
            onClick={showAllFilters}
            className="px-3 py-1.5 text-xs font-medium text-[#0F3D5E] hover:text-[#F97316] transition-colors"
          >
            Mostrar todos
          </button>
        )}
      </div>

      {/* Lista de veículos */}
      {filteredVehicles.map(vehicle => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          selected={selectedVehicleId === vehicle.id}
          onClick={() => onSelectVehicle(vehicle)}
        />
      ))}
      {filteredVehicles.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">Nenhum veículo encontrado</p>
          {hasActiveFilters && (
            <button
              onClick={showAllFilters}
              className="mt-2 text-xs text-[#0F3D5E] hover:text-[#F97316]"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}
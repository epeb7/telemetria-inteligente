import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface FilterState {
  searchCode: string;
  searchDriver: string;
  searchScale: string;
  statusFilter: 'all' | 'active' | 'warning' | 'error' | 'offline';
  eventFilter: 'all' | 'hard_brake' | 'hard_acceleration' | 'sharp_curve';
}

interface KPIDashboard {
  totalVehicles: number;
  activeCount: number;
  warningCount: number;
  errorCount: number;
  offlineCount: number;
  eventsByType: {
    hardBrake: number;
    hardAcceleration: number;
    sharpCurve: number;
  };
  averageScore: number;
}

interface HeaderProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  kpis: KPIDashboard;
}

export function Header({ filters, onFilterChange, kpis }: HeaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const handleClearFilters = () => {
    onFilterChange({
      searchCode: '',
      searchDriver: '',
      searchScale: '',
      statusFilter: 'all',
      eventFilter: 'all',
    });
  };

  const hasActiveFilters = 
    filters.searchCode || 
    filters.searchDriver || 
    filters.searchScale || 
    filters.statusFilter !== 'all' || 
    filters.eventFilter !== 'all';

  return (
    <header className="border-b border-border bg-card shadow-sm sticky top-0 z-40">
      {/* Top Row - Logo e Status Global */}
      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Logo e Título */}
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FT</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-card-foreground">FrotaTrack</h1>
                <p className="text-xs text-muted-foreground">Telemetria Inteligente</p>
              </div>
            </div>
          </div>

          {/* Status Global - Desktop */}
          <div className="hidden md:flex items-center gap-6">
            {/* Veículos Ativos */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Ativos</p>
              <p className="text-2xl font-bold text-green-600">{kpis.activeCount}</p>
            </div>

            {/* Avisos */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Avisos</p>
              <p className="text-2xl font-bold text-amber-600">{kpis.warningCount}</p>
            </div>

            {/* Erros */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Erros</p>
              <p className="text-2xl font-bold text-red-600">{kpis.errorCount}</p>
            </div>

            {/* Score Médio */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Score</p>
              <p className="text-2xl font-bold text-blue-600">{kpis.averageScore}</p>
            </div>
          </div>

          {/* Toggle Filtros */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filtros</span>
            {hasActiveFilters && (
              <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                {[
                  filters.searchCode,
                  filters.searchDriver,
                  filters.searchScale,
                  filters.statusFilter !== 'all' ? '1' : '',
                  filters.eventFilter !== 'all' ? '1' : '',
                ].filter(Boolean).length}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Filtros Expandidos */}
      {isExpanded && (
        <div className="border-t border-border bg-secondary/30 px-4 py-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Busca por Código */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                Código do Ônibus
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Ex: BUS-001"
                  value={filters.searchCode}
                  onChange={(e) => handleFilterChange('searchCode', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Busca por Motorista */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                Motorista
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Ex: João Silva"
                  value={filters.searchDriver}
                  onChange={(e) => handleFilterChange('searchDriver', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Busca por Escala */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                Escala/Rota
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Ex: Manhã"
                  value={filters.searchScale}
                  onChange={(e) => handleFilterChange('searchScale', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Filtro de Status */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                Status
              </label>
              <Select
                value={filters.statusFilter}
                onValueChange={(value) =>
                  handleFilterChange('statusFilter', value as any)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="warning">Avisos</SelectItem>
                  <SelectItem value="error">Erros</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de Eventos */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                Eventos
              </label>
              <Select
                value={filters.eventFilter}
                onValueChange={(value) =>
                  handleFilterChange('eventFilter', value as any)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="hard_brake">Freada Brusca</SelectItem>
                  <SelectItem value="hard_acceleration">Aceleração Brusca</SelectItem>
                  <SelectItem value="sharp_curve">Curva Acentuada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botão Limpar Filtros */}
          {hasActiveFilters && (
            <div className="mt-3 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
                Limpar Filtros
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Status Global - Mobile */}
      <div className="md:hidden border-t border-border px-4 py-3 sm:px-6">
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div>
            <p className="text-muted-foreground mb-1">Ativos</p>
            <p className="font-bold text-green-600">{kpis.activeCount}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Avisos</p>
            <p className="font-bold text-amber-600">{kpis.warningCount}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Erros</p>
            <p className="font-bold text-red-600">{kpis.errorCount}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Score</p>
            <p className="font-bold text-blue-600">{kpis.averageScore}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
import { useState } from 'react';
import { Search, Filter, X, Layers, LayoutDashboard } from 'lucide-react';
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

  const handleNavigateToManagement = () => {
    window.location.href = '/events-management';
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/95 border-b border-slate-200/80 shadow-lg shadow-slate-200/20">
      {/* Top Row */}
      <div className="px-6 py-5 lg:px-10">
        <div className="flex items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="/Images/frotatrack.png"
                  alt="FrotaTrack Logo"
                  className="h-11 w-auto object-contain drop-shadow-sm"
                />
                <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-[#0F3D5E] via-[#F97316] to-transparent rounded-full" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-[#0F3D5E] to-[#0F3D5E]/80 bg-clip-text text-transparent">
                  FrotaTrack
                </h1>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                  Telemetria Inteligente
                </p>
              </div>
            </div>
          </div>

          {/* KPIs Desktop */}
          <div className="hidden md:flex items-center gap-10">
            <div className="text-center group">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1 group-hover:text-emerald-600 transition-colors">
                Ativos
              </p>
              <p className="text-2xl font-bold text-emerald-600">{kpis.activeCount}</p>
            </div>
            <div className="text-center group">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1 group-hover:text-amber-500 transition-colors">
                Avisos
              </p>
              <p className="text-2xl font-bold text-amber-500">{kpis.warningCount}</p>
            </div>
            <div className="text-center group">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1 group-hover:text-red-500 transition-colors">
                Erros
              </p>
              <p className="text-2xl font-bold text-red-500">{kpis.errorCount}</p>
            </div>
            <div className="pl-6 border-l border-slate-200 text-center group">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1 group-hover:text-[#0F3D5E] transition-colors">
                Score Médio
              </p>
              <p className="text-2xl font-bold text-[#0F3D5E]">{kpis.averageScore}</p>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex items-center gap-3">
            {/* Botão Gerenciamento Painel */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleNavigateToManagement}
              className="
                gap-2 
                border-slate-300 
                text-[#0F3D5E] 
                hover:bg-[#0F3D5E] 
                hover:text-white 
                hover:border-[#0F3D5E] 
                transition-all 
                duration-300 
                shadow-sm
              "
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Gerenciamento Painel</span>
            </Button>

            {/* Botão Filtros */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "gap-2 border-slate-300 text-[#0F3D5E] hover:bg-[#0F3D5E] hover:text-white hover:border-[#0F3D5E] transition-all duration-300 shadow-sm",
                isExpanded && "bg-[#0F3D5E] text-white border-[#0F3D5E]"
              )}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filtros</span>
              {hasActiveFilters && (
                <span className="ml-1 px-2 py-0.5 bg-[#F97316] text-white rounded-full text-xs font-semibold shadow-sm">
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
      </div>

      {/* Filtros Expandidos (mesmo código) */}
      {isExpanded && (
        <div className="border-t border-slate-200 bg-white/98 backdrop-blur-sm px-6 py-8 lg:px-10 shadow-inner">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Código */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2 block">
                Código do Ônibus
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Ex: BUS-001"
                  value={filters.searchCode}
                  onChange={(e) => handleFilterChange('searchCode', e.target.value)}
                  className="pl-9 focus:ring-2 focus:ring-[#0F3D5E]/20 focus:border-[#0F3D5E] transition-all"
                />
              </div>
            </div>

            {/* Motorista */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2 block">
                Motorista
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Ex: João Silva"
                  value={filters.searchDriver}
                  onChange={(e) => handleFilterChange('searchDriver', e.target.value)}
                  className="pl-9 focus:ring-2 focus:ring-[#0F3D5E]/20 focus:border-[#0F3D5E] transition-all"
                />
              </div>
            </div>

            {/* Escala */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2 block">
                Escala/Rota
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Ex: Manhã"
                  value={filters.searchScale}
                  onChange={(e) => handleFilterChange('searchScale', e.target.value)}
                  className="pl-9 focus:ring-2 focus:ring-[#0F3D5E]/20 focus:border-[#0F3D5E] transition-all"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2 block">
                Status
              </label>
              <Select
                value={filters.statusFilter}
                onValueChange={(value) => handleFilterChange('statusFilter', value as any)}
              >
                <SelectTrigger className="focus:ring-2 focus:ring-[#0F3D5E]/20 focus:border-[#0F3D5E] transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Eventos */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2 block flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                Eventos
              </label>
              <Select
                value={filters.eventFilter}
                onValueChange={(value) => handleFilterChange('eventFilter', value as any)}
              >
                <SelectTrigger
                  className={cn(
                    "focus:ring-2 focus:ring-[#0F3D5E]/20 focus:border-[#0F3D5E] transition-all",
                    filters.eventFilter !== 'all' && "border-[#0F3D5E]/40 bg-[#0F3D5E]/5"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {filters.eventFilter !== 'all' && (
                      <span className="w-2 h-2 rounded-full bg-[#0F3D5E] animate-pulse" />
                    )}
                    <SelectValue placeholder="Todos" />
                  </div>
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

          {hasActiveFilters && (
            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="
                  gap-2 
                  border-slate-300 
                  text-[#0F3D5E] 
                  hover:bg-[#0F3D5E] 
                  hover:text-white 
                  hover:border-[#0F3D5E] 
                  transition-all 
                  duration-300 
                  shadow-sm
                  group
                "
              >
                <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                Limpar Filtros
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Mobile KPIs */}
      <div className="md:hidden border-t border-slate-200 px-4 py-4 bg-white/90 backdrop-blur-sm">
        <div className="grid grid-cols-4 gap-4 text-center text-xs">
          <div>
            <p className="text-slate-400 mb-1">Ativos</p>
            <p className="font-bold text-emerald-600">{kpis.activeCount}</p>
          </div>
          <div>
            <p className="text-slate-400 mb-1">Avisos</p>
            <p className="font-bold text-amber-500">{kpis.warningCount}</p>
          </div>
          <div>
            <p className="text-slate-400 mb-1">Erros</p>
            <p className="font-bold text-red-500">{kpis.errorCount}</p>
          </div>
          <div>
            <p className="text-slate-400 mb-1">Score</p>
            <p className="font-bold text-[#0F3D5E]">{kpis.averageScore}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
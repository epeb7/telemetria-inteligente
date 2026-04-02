import { Vehicle } from '@/../../shared/types';
import { Gauge,Clock, Battery, User ,Bus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JSX } from 'react';

interface VehicleCardProps {
  vehicle: Vehicle;
  selected?: boolean;
  onClick?: () => void;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'active': return 'text-green-600';
    case 'warning': return 'text-amber-600';
    case 'error': return 'text-red-600';
    case 'offline': return 'text-gray-400';
    default: return 'text-gray-600';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'active': return 'Ativo';
    case 'warning': return 'Aviso';
    case 'error': return 'Erro';
    case 'offline': return 'Offline';
    default: return 'Desconhecido';
  }
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Agora';
  if (minutes < 60) return `${minutes}m atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  return date.toLocaleDateString();
}

export function VehicleCard({ vehicle, selected, onClick }: VehicleCardProps): JSX.Element {
 return (
  <button
    onClick={onClick}
    className={cn(
      'w-full min-h-[200px] text-left p-6 rounded-2xl border relative overflow-hidden transition-all duration-300 group',
      selected
        ? 'bg-gradient-to-br from-[#0F3D5E]/5 to-[#F97316]/5 border-[#0F3D5E]/40 shadow-[0_10px_35px_rgba(15,61,94,0.12)]'
        : 'bg-white border-slate-200 hover:border-[#0F3D5E]/40 hover:shadow-[0_8px_30px_rgba(15,61,94,0.08)] hover:-translate-y-1'
    )}
  >
    {/* Header */}
    <div className="flex items-start justify-between mb-6">
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-[#0F3D5E] flex items-center gap-2 truncate">
          <Bus className="w-5 h-5 text-[#F97316]" />
          {vehicle.name}
        </h3>
        <p className="text-sm text-slate-500">{vehicle.plate}</p>
      </div>

      <div
        className={cn(
          'px-3 py-1 rounded-full text-xs font-semibold tracking-wide',
          vehicle.status === 'active'
            ? 'bg-emerald-50 text-emerald-600'
            : vehicle.status === 'warning'
            ? 'bg-amber-50 text-amber-600'
            : vehicle.status === 'error'
            ? 'bg-red-50 text-red-600'
            : 'bg-slate-100 text-slate-500'
        )}
      >
        {getStatusLabel(vehicle.status)}
      </div>
    </div>

    {/* Métricas reorganizadas */}
    <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">

      <div className="flex flex-col">
        <span className="text-xs text-slate-400 uppercase tracking-wide">
          Velocidade
        </span>
        <div className="flex items-center gap-2 text-[#0F3D5E] font-semibold">
          <Gauge className="w-4 h-4 text-[#F97316]" />
          {vehicle.speed} km/h
        </div>
      </div>

      <div className="flex flex-col">
        <span className="text-xs text-slate-400 uppercase tracking-wide">
          Odômetro
        </span>
        <div className="flex items-center gap-2 text-[#0F3D5E] font-semibold">
          <Gauge className="w-4 h-4 text-[#F97316]" />
          {vehicle.odometer} km
        </div>
      </div>

      <div className="flex flex-col">
        <span className="text-xs text-slate-400 uppercase tracking-wide">
          Bateria
        </span>
        <div className="flex items-center gap-2 text-[#0F3D5E] font-semibold">
          <Battery className="w-4 h-4 text-[#F97316]" />
          {vehicle.battery}v
        </div>
      </div>

      <div className="flex flex-col">
        <span className="text-xs text-slate-400 uppercase tracking-wide">
          Atualização
        </span>
        <div className="flex items-center gap-2 text-[#0F3D5E] font-semibold">
          <Clock className="w-4 h-4 text-[#F97316]" />
          {formatTime(vehicle.lastUpdate)}
        </div>
      </div>
    </div>

    {/* Driver */}
    {vehicle.driver && (
      <div className="mt-6 pt-4 border-t border-slate-100 text-sm">
        <span className="text-slate-400">Motorista:</span>{' '}
        <span className="font-semibold text-[#0F3D5E]">
          {vehicle.driver}
        </span>
      </div>
    )}

    {/* Linha inferior de identidade visual */}
    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#0F3D5E] via-[#F97316] to-transparent opacity-70" />
  </button>
);
}
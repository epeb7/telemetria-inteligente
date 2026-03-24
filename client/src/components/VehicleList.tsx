import { Vehicle } from '@/../../shared/types';
import { Gauge, Battery, Thermometer, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VehicleCard } from './VehicleCard';   
import { JSX } from 'react';


interface VehicleListProps {
  vehicles: Vehicle[];
  selectedVehicleId?: string | number; // cobre os dois casos
  onSelectVehicle?: (vehicle: Vehicle) => void;
}


function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'text-green-600';
    case 'warning':
      return 'text-amber-600';
    case 'error':
      return 'text-red-600';
    case 'offline':
      return 'text-gray-400';
    default:
      return 'text-gray-600';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'active':
      return 'Ativo';
    case 'warning':
      return 'Aviso';
    case 'error':
      return 'Erro';
    case 'offline':
      return 'Offline';
    default:
      return 'Desconhecido';
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
export function VehicleList({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
}: VehicleListProps): JSX.Element {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-2 px-2 py-4 overflow-y-auto h-full max-h-[400px]">
      {vehicles.map((vehicle) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          selected={selectedVehicleId === vehicle.id}
          onClick={() => onSelectVehicle?.(vehicle)}
        />
      ))}
    </div>
  );
}

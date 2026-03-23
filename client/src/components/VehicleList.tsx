import { Vehicle } from '@/../../shared/types';
import { Gauge, Droplets, Thermometer, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VehicleListProps {
  vehicles: Vehicle[];
  selectedVehicleId?: string;
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

export function VehicleList({ vehicles, selectedVehicleId, onSelectVehicle }: VehicleListProps) {
  return (
  <div className="flex flex-row gap-4 row-autgrid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2 overflow-auto  py-4">
      {vehicles.map((vehicle) => (
        <button
          key={vehicle.id}
          onClick={() => onSelectVehicle?.(vehicle)}
          className={cn(
            'w-full text-left p-5 rounded-xl border transition-all duration-200', // padding maior
            'hover:shadow-lg hover:border-blue-500/50',
            selectedVehicleId === vehicle.id
              ? 'bg-blue-50 border-blue-500 shadow-md'
              : 'bg-white border-gray-200 hover:bg-orange-50'
          )}
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base text-gray-900 truncate"> {/* text-base = maior */}
                {vehicle.name}
              </h3>
              <p className="text-sm text-gray-500">{vehicle.plate}</p> {/* text-sm = +2px */}
            </div>
            <div className={cn('flex items-center gap-1.5', getStatusColor(vehicle.status))}>
              <div className={cn('status-indicator', `status-${vehicle.status}`)} />
              <span className="text-sm font-medium">{getStatusLabel(vehicle.status)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm"> {/* text-sm = maior que text-xs */}
            <div className="flex items-center gap-2 text-gray-600">
              <Gauge className="w-4 h-4 text-blue-600" /> {/* ícone maior */}
              <span>{vehicle.speed} km/h</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Droplets className="w-4 h-4 text-orange-500" />
              <span>{vehicle.fuel}%</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Thermometer className="w-4 h-4 text-red-500" />
              <span>{vehicle.temperature}°C</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4 text-purple-500" />
              <span>{formatTime(vehicle.lastUpdate)}</span>
            </div>
          </div>

          {vehicle.driver && (
            <p className="text-sm text-gray-600 mt-3"> {/* text-sm = maior */}
              Motorista: <span className="font-medium text-orange-600">{vehicle.driver}</span>
            </p>
          )}
        </button>
      ))}
    </div>
  );
}


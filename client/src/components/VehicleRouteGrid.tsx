// client/src/components/VehicleRouteGrid.tsx
import { useMemo } from 'react';
import { MapPin, Clock, User, Gauge, Battery, TrendingUp, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VehicleRouteGridProps {
  vehicles: any[];
  onSelectVehicle: (vehicle: any) => void;
}

// Funções auxiliares (exemplo – substitua pelos dados reais)
const getDepartureTime = (vehicle: any) => {
  if (vehicle.departureTime) return vehicle.departureTime;
  const times = ['06:30', '07:15', '08:00', '09:30', '10:45', '12:00', '13:20', '14:50', '16:10', '17:40'];
  const index = parseInt(vehicle.id.replace(/\D/g, '')) % times.length;
  return times[index];
};

const getTripProgress = (vehicle: any) => {
  if (vehicle.routeProgress !== undefined) return vehicle.routeProgress;
  return Math.floor(Math.random() * 100);
};

export function VehicleRouteGrid({ vehicles, onSelectVehicle }: VehicleRouteGridProps) {
  const routeVehicles = useMemo(() => {
    return vehicles.filter(v => v.status === 'active');
  }, [vehicles]);

  if (routeVehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
          <Navigation className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-500 font-medium">Nenhum veículo em rota no momento</p>
        <p className="text-xs text-slate-400 mt-1">Os veículos aparecerão aqui quando iniciarem a viagem</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-3">
      {routeVehicles.map((vehicle) => {
        const departureTime = getDepartureTime(vehicle);
        const progress = getTripProgress(vehicle);
        const routeName = vehicle.route || `Rota ${vehicle.code.slice(-3)}`;

        return (
          <div
            key={vehicle.id}
            onClick={() => onSelectVehicle(vehicle)}
            className="group relative bg-white rounded-lg border border-slate-200 hover:border-[#0F3D5E]/30 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
          >
            {/* Barra superior fina */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#0F3D5E] via-[#F97316] to-[#0F3D5E]" />
            
            <div className="p-3">
              {/* Cabeçalho: código + rota + status (código sempre primeiro) */}
              <div className="flex items-start justify-between mb-2 gap-2">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <MapPin className="w-3.5 h-3.5 text-[#0F3D5E] flex-shrink-0" />
                  <div className="flex items-center gap-1 flex-wrap min-w-0">
                    <span className="text-sm font-bold text-slate-800 truncate group-hover:text-[#0F3D5E]">
                      {vehicle.code}
                    </span>
                    <span className="text-slate-300 text-xs">•</span>
                    <span className="text-sm font-bold text-slate-800 truncate group-hover:text-[#0F3D5E]">
                      {routeName}
                    </span>
                  </div>
                </div>
                <div className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700 flex-shrink-0">
                  Em Rota
                </div>
              </div>

              {/* Motorista */}
              <div className="text-xs text-slate-500 mb-2 truncate">
                Motorista: {vehicle.driver}
              </div>

              {/* Grid de informações em 2 colunas */}
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-2 text-xs">
                <div className="flex items-center gap-1 text-slate-500">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{departureTime}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                  <Gauge className="w-3 h-3 text-slate-400" />
                  <span>{vehicle.speed} km/h</span>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                  <Battery className="w-3 h-3 text-slate-400" />
                  <span>{vehicle.battery}v</span>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                  <User className="w-3 h-3 text-slate-400" />
                  <span className="truncate">{vehicle.driver}</span>
                </div>
              </div>

              {/* Barra de progresso fina */}
              <div className="mt-1">
                <div className="flex items-center justify-between text-[9px] text-slate-400 mb-0.5">
                  <span>Progresso</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#0F3D5E] to-[#F97316] rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Score compacto */}
              {vehicle.driverScore !== undefined && (
                <div className="mt-2 flex items-center justify-end gap-1 pt-1 border-t border-slate-100">
                  <TrendingUp className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] text-slate-500">Score:</span>
                  <span className={cn(
                    "text-[10px] font-bold px-1 py-0.5 rounded",
                    vehicle.driverScore >= 80 ? "text-emerald-600 bg-emerald-50" :
                    vehicle.driverScore >= 60 ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50"
                  )}>
                    {vehicle.driverScore}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
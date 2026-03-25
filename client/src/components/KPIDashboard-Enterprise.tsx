import { TrendingUp, TrendingDown, AlertCircle, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface KPIDashboard {
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
  topDrivers: any[];
  averageScore: number;
}

interface KPIDashboardProps {
  kpis: KPIDashboard;
  onDriverClick?: (driver: any) => void;
}

export function KPIDashboard({ kpis, onDriverClick }: KPIDashboardProps) {
  const totalEvents =
    kpis.eventsByType.hardBrake +
    kpis.eventsByType.hardAcceleration +
    kpis.eventsByType.sharpCurve;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total de Veículos */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 font-semibold mb-1">Total</p>
                <p className="text-2xl font-bold text-blue-900">{kpis.totalVehicles}</p>
              </div>
              <div className="p-2 bg-blue-200 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ativos */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 font-semibold mb-1">Ativos</p>
                <p className="text-2xl font-bold text-green-900">{kpis.activeCount}</p>
              </div>
              <div className="p-2 bg-green-200 rounded-lg">
                <div className="w-5 h-5 bg-green-700 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avisos */}
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-amber-600 font-semibold mb-1">Avisos</p>
                <p className="text-2xl font-bold text-amber-900">{kpis.warningCount}</p>
              </div>
              <div className="p-2 bg-amber-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Erros */}
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-600 font-semibold mb-1">Erros</p>
                <p className="text-2xl font-bold text-red-900">{kpis.errorCount}</p>
              </div>
              <div className="p-2 bg-red-200 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Eventos por Tipo */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Eventos por Tipo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Freada Brusca */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full" />
              <span className="text-xs text-muted-foreground">Freada Brusca</span>
            </div>
            <span className="text-sm font-semibold text-red-600">
              {kpis.eventsByType.hardBrake}
            </span>
          </div>

          {/* Aceleração Brusca */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-600 rounded-full" />
              <span className="text-xs text-muted-foreground">Aceleração Brusca</span>
            </div>
            <span className="text-sm font-semibold text-yellow-600">
              {kpis.eventsByType.hardAcceleration}
            </span>
          </div>

          {/* Curva Acentuada */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-600 rounded-full" />
              <span className="text-xs text-muted-foreground">Curva Acentuada</span>
            </div>
            <span className="text-sm font-semibold text-orange-600">
              {kpis.eventsByType.sharpCurve}
            </span>
          </div>

          {/* Total */}
          <div className="border-t border-border pt-2 mt-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-card-foreground">Total</span>
            <span className="text-sm font-bold text-primary">{totalEvents}</span>
          </div>
        </CardContent>
      </Card>

      {/* Score Médio */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Score Médio dos Motoristas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <div className="w-full h-16 bg-gradient-to-t from-blue-500 to-blue-300 rounded-lg relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {kpis.averageScore}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">Escala</p>
              <p className="text-xs font-semibold">0 - 100</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Motoristas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Top Motoristas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {kpis.topDrivers.slice(0, 5).map((driver, index) => (
              <div
                key={driver.driverId}
                onClick={() => onDriverClick?.(driver)}
                className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary w-5">
                      #{index + 1}
                    </span>
                    <span className="text-xs font-semibold text-card-foreground truncate">
                      {driver.driverName}
                    </span>
                  </div>
                  <span
                    className={cn(
                      'text-xs font-bold px-2 py-0.5 rounded',
                      driver.score >= 80
                        ? 'bg-green-100 text-green-700'
                        : driver.score >= 60
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                    )}
                  >
                    {driver.score}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {driver.vehicleCode} • {driver.totalEvents} evento{driver.totalEvents !== 1 ? 's' : ''}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
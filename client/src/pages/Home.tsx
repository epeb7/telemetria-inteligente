import { useState, useEffect } from 'react';
import { Vehicle, Alert, DriverEvent} from '@/../../shared/types';
import { mockVehicles, mockAlerts, mockDriverEvents} from '@/../../shared/mockData';
import { VehicleMap } from '@/components/VehicleMap';
import { VehicleList } from '@/components/VehicleList';
import { TelemetryChart } from '@/components/TelemetryChart';
import { useTelemetry } from '@/hooks/useTelemetry';
import { AlertCircle,AlertTriangle, MapPin, Battery, Gauge  } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DriverModal } from '@/components/DriverModal';
import { cn } from '@/lib/utils';
import { JSX } from 'react';


export default function Home() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [driverEvents] = useState<DriverEvent[]>(mockDriverEvents);
  
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | undefined>(mockVehicles[0]);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);

  // Função para abrir o modal ao clicar no veículo
  const handleSelectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDriverModalOpen(true);
  };

  // Simulate real-time telemetry updates
  useEffect(() => {
const interval = setInterval(() => {
  setVehicles((prevVehicles) => {
    return prevVehicles.map((vehicle) => {
      // velocidade (varia levemente, limitada pela maxSpeed)
      let newSpeed = vehicle.speed + (Math.random() - 0.5) * 10;
      newSpeed = Math.max(0, Math.min(vehicle.maxSpeed, newSpeed));

      // bateria (cai lentamente)
      let newBattery = vehicle.battery - Math.random() * 0.2;
      newBattery = Math.max(0, newBattery);

      // odômetro (acumula conforme velocidade)
      let newOdometer = vehicle.odometer + newSpeed * 0.05;
      // cada tick soma ~0.05 km por unidade de velocidade

      // status baseado em bateria
      let newStatus: 'active' | 'warning' | 'error' | 'offline' = 'active';
      if (newBattery < 10) newStatus = 'error';
      else if (newBattery < 25) newStatus = 'warning';

      // posição (simulação de movimento)
      const latChange = (Math.random() - 0.5) * 0.001;
      const lngChange = (Math.random() - 0.5) * 0.001;

      return {
        ...vehicle,
        speed: Math.round(newSpeed),
        battery: Math.round(newBattery * 10) / 10,
        odometer: Math.round(newOdometer),
        latitude: vehicle.latitude + latChange,
        longitude: vehicle.longitude + lngChange,
        status: newStatus,
        lastUpdate: new Date()
      };
    })
 });

}, 3000)

    return () => clearInterval(interval);
  }, []);

  // Update selected vehicle when vehicles change
  useEffect(() => {
    if (selectedVehicle) {
      const updated = vehicles.find((v) => v.id === selectedVehicle.id);
      if (updated) {
        setSelectedVehicle(updated);
      }
    }
  }, [vehicles, selectedVehicle]);

  const activeAlerts = alerts.filter((a) => !a.resolved);
  const activeVehicles = vehicles.filter((v) => v.status === 'active').length;
  const warningVehicles = vehicles.filter((v) => v.status === 'warning').length;
  const errorVehicles = vehicles.filter((v) => v.status === 'error').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                {/* Logo FrotaTrack */}
                  <img
                    src="/Images/frotatrack.png"
                    alt="FrotaTrack Logo"
                    className="h-15 w-auto"
                          />
              <div>
                <h1 className="text-2xl font-bold text-card-foreground">
                  Telemetria FrotaTrack
                </h1>
                <p className="text-sm text-muted-foreground" style={{fontFamily: 'Roboto'}}>
                  Telemetria Inteligente
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total de veículos</p>
                <p className="text-2xl font-bold text-card-foreground">{vehicles.length}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Status cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ativos</p>
                  <p className="text-3xl font-bold text-green-600">{activeVehicles}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <div className="w-6 h-6 bg-green-600 rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avisos</p>
                  <p className="text-3xl font-bold text-amber-600">{warningVehicles}</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Erros</p>
                  <p className="text-3xl font-bold text-red-600">{errorVehicles}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main layout: Map (70%) + Panel (30%) */}
        <div className="flex flex-col gap-6 mb-6">
          {/* Map section */}
          <div className="col-span-2">
            <Card className="h-[500px]">
              <CardHeader>
                <CardTitle className="text-lg">Mapa de Frotas</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-96 rounded-b-lg overflow-hidden">
                  <VehicleMap
                    vehicles={vehicles}
                    selectedVehicle={selectedVehicle}
                    onVehicleSelect={setSelectedVehicle}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Vehicle list */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Veículos</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4 overflow-y-auto p-6">
                  <VehicleList
                    vehicles={vehicles}
                    selectedVehicleId={selectedVehicle ? String(selectedVehicle.id) : undefined}
                    onSelectVehicle={handleSelectVehicle}
                  />
                </CardContent>
            </Card>

            {/* Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Alertas ({activeAlerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {activeAlerts.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum alerta ativo
                    </p>
                  ) : (
                    activeAlerts.map((alert) => {
                      const vehicle = vehicles.find((v) => v.id === alert.vehicleId);
                      const severityColors: Record<string, string> = {
                        low: 'bg-blue-100 text-blue-800',
                        medium: 'bg-amber-100 text-amber-800',
                        high: 'bg-red-100 text-red-800'
                      };

                      return (
                        <div
                          key={alert.id}
                          className={`p-2 rounded-lg text-xs ${severityColors[alert.severity]}`}
                        >
                          <p className="font-semibold">{vehicle?.name}</p>
                          <p className="text-xs opacity-90">{alert.message}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Selected vehicle details */}
        {selectedVehicle && (
          <div className="mt-6 space-y-6">
            <SelectedVehicleDetails vehicle={selectedVehicle} />
          </div>
        )}
      </main>

      {/* Driver Modal - Abre ao clicar no card do veículo */}
      <DriverModal
        vehicle={selectedVehicle || null}
        events={driverEvents}
        isOpen={isDriverModalOpen}
        onClose={() => {
          setIsDriverModalOpen(false);
        }}
      />
    </div>
  );
}

function SelectedVehicleDetails({ vehicle }: { vehicle: Vehicle }) {
  const telemetryData = useTelemetry(vehicle.id);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{vehicle.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{vehicle.plate}</p>
            </div>
            <div className="text-right">
              <div
                className={cn(
                  'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium',
                  vehicle.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : vehicle.status === 'warning'
                      ? 'bg-amber-100 text-amber-800'
                      : vehicle.status === 'error'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                )}
              >
                <div className={cn('status-indicator', `status-${vehicle.status}`)} />
                {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="metrics">Métricas</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Motorista</p>
                  <p className="text-lg font-semibold">{vehicle.driver}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rota</p>
                  <p className="text-lg font-semibold">{vehicle.route || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Localização</p>
                  <p className="text-sm font-mono flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {vehicle.latitude.toFixed(4)}, {vehicle.longitude.toFixed(4)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Última atualização</p>
                  <p className="text-sm font-mono">
                    {vehicle.lastUpdate.toLocaleTimeString('pt-BR')}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Velocidade</p>
                  <p className="text-2xl font-bold text-blue-600">{vehicle.speed}</p>
                  <p className="text-xs text-muted-foreground">km/h</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Bateria</p>
                  <span className="text-2xl font-bold text-green-600">{vehicle.battery.toFixed(1)}</span>
                  <p className="text-xs text-muted-foreground">V</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Odômetro</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {vehicle.odometer.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">km</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <p className="text-sm font-semibold text-purple-600 capitalize">
                    {vehicle.status}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}
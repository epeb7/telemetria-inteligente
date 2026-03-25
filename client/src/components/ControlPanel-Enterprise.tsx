import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Truck, BarChart3, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ControlPanelProps {
  vehiclesTab: React.ReactNode;
  dashboardTab: React.ReactNode;
  eventsTab: React.ReactNode;
  activeTab: 'vehicles' | 'dashboard' | 'events';
  onTabChange: (tab: 'vehicles' | 'dashboard' | 'events') => void;
}

/**
 * Painel de controle com 3 abas principais:
 * 1. Veículos - Grid dinâmico com filtros
 * 2. Dashboard - KPIs e ranking de motoristas
 * 3. Eventos - Timeline de eventos em tempo real
 */
 export function ControlPanel({
  vehiclesTab,
  dashboardTab,
  eventsTab,
  activeTab,
  onTabChange,
}: ControlPanelProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => onTabChange(value as any)}
      className="flex flex-col h-full"
    >
      {/* Tabs List */}
      <TabsList className="grid w-full grid-cols-3 rounded-none border-b border-border bg-secondary/30 p-0 h-auto">
        <TabsTrigger
          value="vehicles"
          className={cn(
            'rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent',
            'flex items-center justify-center gap-2 py-3'
          )}
        >
          <Truck className="w-4 h-4" />
          <span className="hidden sm:inline text-sm">Veículos</span>
        </TabsTrigger>

        <TabsTrigger
          value="dashboard"
          className={cn(
            'rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent',
            'flex items-center justify-center gap-2 py-3'
          )}
        >
          <BarChart3 className="w-4 h-4" />
          <span className="hidden sm:inline text-sm">Dashboard</span>
        </TabsTrigger>

        <TabsTrigger
          value="events"
          className={cn(
            'rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent',
            'flex items-center justify-center gap-2 py-3',
          )}
        >
          <AlertCircle className="w-4 h-4" />
          <span className="hidden sm:inline text-sm">Eventos</span>
        </TabsTrigger>
      </TabsList>

      {/* Tabs Content */}
      <div className="flex-1 overflow-hidden">
        <TabsContent
          value="vehicles"
          className="h-full overflow-hidden data-[state=inactive]:hidden"
        >
          {vehiclesTab}
        </TabsContent>

        <TabsContent
          value="dashboard"
          className="h-full overflow-y-auto data-[state=inactive]:hidden"
        >
          {dashboardTab}
        </TabsContent>

        <TabsContent
          value="events"
          className="h-full overflow-y-auto data-[state=inactive]:hidden"
        >
          {eventsTab}
        </TabsContent>
      </div>
    </Tabs>
  );
}
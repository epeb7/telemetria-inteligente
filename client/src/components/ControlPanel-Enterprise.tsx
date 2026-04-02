import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bus, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ControlPanelProps {
  vehiclesTab: React.ReactNode;
  dashboardTab: React.ReactNode;
  eventsTab: React.ReactNode; // mantido para não quebrar dependências
  activeTab: 'vehicles' | 'dashboard' | 'events';
  onTabChange: (tab: 'vehicles' | 'dashboard' | 'events') => void;
}

export function ControlPanel({
  vehiclesTab,
  dashboardTab,
  eventsTab,
  activeTab,
  onTabChange,
}: ControlPanelProps) {
  return (
    <Tabs
      value={activeTab === 'events' ? 'dashboard' : activeTab}
      onValueChange={(value) => onTabChange(value as any)}
      className="flex flex-col h-full"
    >
      {/* Tabs List */}
      <TabsList
        className="
          grid w-full grid-cols-2
          bg-gradient-to-r from-slate-50 via-white to-slate-50
          shadow-sm
          p-2
        "
      >
        <TabsTrigger
          value="vehicles"
          className={cn(`
            relative
            flex items-center justify-center gap-2
            py-3 rounded-xl
            text-slate-600 font-medium text-sm
            transition-all duration-300

            hover:bg-slate-100
            hover:text-slate-800

            data-[state=active]:bg-white
            data-[state=active]:text-[#0F3D5E]
            data-[state=active]:shadow-md
            data-[state=active]:font-semibold
          `)}
        >
          <Bus className="w-4 h-4" />
          <span className="hidden sm:inline">Veículos</span>
        </TabsTrigger>

        <TabsTrigger
          value="dashboard"
          className={cn(`
            relative
            flex items-center justify-center gap-2
            py-3 rounded-xl
            text-slate-600 font-medium text-sm
            transition-all duration-300

            hover:bg-slate-100
            hover:text-slate-800

            data-[state=active]:bg-white
            data-[state=active]:text-[#0F3D5E]
            data-[state=active]:shadow-md
            data-[state=active]:font-semibold
          `)}
        >
          <BarChart3 className="w-4 h-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </TabsTrigger>
      </TabsList>

      {/* Tabs Content */}
      <div className="flex-1 overflow-hidden bg-white">
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
          {/* Dashboard principal */}
          {dashboardTab}

          {/* Eventos agora incorporados no dashboard */}
          <div className="mt-8">
            {eventsTab}
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}
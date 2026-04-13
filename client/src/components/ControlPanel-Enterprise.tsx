// client/src/components/ControlPanel-Enterprise.tsx
import { Bus, BarChart3, CalendarClock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ControlPanelProps {
  vehiclesTab: React.ReactNode;
  dashboardTab: React.ReactNode;
  eventsTab: React.ReactNode;   // Receberá o EventsTimeline (não mais o EventsList)
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
  const currentTab = activeTab;

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="sticky top-0 z-50 bg-gradient-to-r from-slate-50 via-white to-slate-50 shadow-sm">
        <div className="grid grid-cols-3 gap-2 p-2">
          <button
            onClick={() => onTabChange('vehicles')}
            className={cn(
              "flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-300",
              "hover:bg-slate-100 hover:text-slate-800",
              currentTab === 'vehicles'
                ? "bg-white text-[#0F3D5E] shadow-md font-semibold"
                : "bg-transparent text-slate-600"
            )}
          >
            <Bus className="w-4 h-4" />
            <span className="hidden sm:inline">Veículos</span>
          </button>
          <button
            onClick={() => onTabChange('dashboard')}
            className={cn(
              "flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-300",
              "hover:bg-slate-100 hover:text-slate-800",
              currentTab === 'dashboard'
                ? "bg-white text-[#0F3D5E] shadow-md font-semibold"
                : "bg-transparent text-slate-600"
            )}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <button
            onClick={() => onTabChange('events')}
            className={cn(
              "flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-300",
              "hover:bg-slate-100 hover:text-slate-800",
              currentTab === 'events'
                ? "bg-white text-[#0F3D5E] shadow-md font-semibold"
                : "bg-transparent text-slate-600"
            )}
          >
            <CalendarClock className="w-4 h-4" />
            <span className="hidden sm:inline">Events Timeline</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {currentTab === 'vehicles' && vehiclesTab}
        {currentTab === 'dashboard' && dashboardTab}
        {currentTab === 'events' && eventsTab}
      </div>
    </div>
  );
}
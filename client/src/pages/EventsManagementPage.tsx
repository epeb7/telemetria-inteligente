// client/src/pages/EventsManagementPage.tsx
import { EventList } from '@/components/EventList';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useLocation } from 'wouter';

export default function EventsManagementPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Cabeçalho padrão FrotaTrack (tamanhos aumentados) */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/95 border-b border-slate-200/80 shadow-lg shadow-slate-200/20">
        <div className="px-6 py-5 lg:px-10">
          <div className="flex items-center justify-between">
            {/* Logo e título - tamanhos maiores */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/')}
                className="gap-2 text-[#0F3D5E] hover:bg-[#0F3D5E]/10 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Voltar ao Painel</span>
              </Button>
              <div className="h-6 w-px bg-slate-200" />
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src="/Images/frotatrack.png"
                    alt="FrotaTrack Logo"
                    className="h-11 w-auto object-contain drop-shadow-sm" // aumentado de h-8 para h-11
                  />
                  <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-[#0F3D5E] via-[#F97316] to-transparent rounded-full" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-[#0F3D5E] to-[#0F3D5E]/80 bg-clip-text text-transparent"> {/* aumentado de text-lg para text-2xl */}
                    Gerenciamento de Eventos
                  </h1>
                  <p className="text-xs uppercase tracking-wider text-slate-400 font-medium mt-0.5"> {/* texto um pouco maior */}
                    Consulta avançada de telemetria
                  </p>
                </div>
              </div>
            </div>

            {/* Botão alternativo para o painel principal */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/')}
              className="gap-2 border-slate-300 text-[#0F3D5E] hover:bg-[#0F3D5E] hover:text-white transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Painel Principal</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo da lista de eventos */}
      <div className="flex-1 overflow-hidden">
        <EventList />
      </div>
    </div>
  );
}
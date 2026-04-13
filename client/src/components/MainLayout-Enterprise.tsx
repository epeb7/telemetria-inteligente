// client/src/components/MainLayout-Enterprise.tsx
import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Chatbot } from '@/components/Chatbot'; // <-- único acréscimo

interface MainLayoutProps {
  mapComponent: React.ReactNode;
  panelComponent: React.ReactNode;
  isMinimized: boolean;
  onMinimizeToggle: () => void;
}

/**
 * Layout responsivo com mapa e painel lado a lado
 * - Desktop: Mapa 70% + Painel 30%
 * - Tablet: Mapa 60% + Painel 40%
 * - Mobile: Stack vertical com toggle
 */
export function MainLayout({
  mapComponent,
  panelComponent,
  isMinimized,
  onMinimizeToggle,
}: MainLayoutProps) {
  const [panelWidth, setPanelWidth] = useState(30); // Percentual
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const newWidth = ((e.clientX - rect.left) / rect.width) * 100;

    // Limitar entre 20% e 50%
    if (newWidth >= 20 && newWidth <= 50) {
      setPanelWidth(newWidth);
    }
  };

  useEffect(() => {
    if (isDragging.current) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] overflow-hidden">
      <div
        ref={containerRef}
        className="flex flex-col lg:flex-row h-full gap-0 overflow-hidden"
      >
        {/* Mapa Principal */}
        <div
          className={cn(
            'flex-1 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg overflow-hidden transition-all duration-300',
            isMinimized ? 'w-full' : 'w-full lg:w-[70%]'
          )}
        >
          {mapComponent}
        </div>

        {/* Divisor Redimensionável (Desktop) */}
        {!isMinimized && (
          <div
            onMouseDown={handleMouseDown}
            className="hidden lg:block w-1 bg-border hover:bg-primary cursor-col-resize transition-colors group"
            title="Arraste para redimensionar"
          />
        )}

        {/* Painel de Controle */}
        <div
          className={cn(
            'flex flex-col bg-card border-l border-border transition-all duration-300 overflow-hidden',
            isMinimized
              ? 'hidden lg:flex w-12 hover:w-16'
              : 'w-full lg:flex-none',
            !isMinimized && `lg:w-[${panelWidth}%]`
          )}
        >
          {/* Header do Painel */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
            {!isMinimized && (
              <h2 className="text-sm font-semibold text-card-foreground">
                Painel de Controle
              </h2>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onMinimizeToggle}
              className="ml-auto"
              title={isMinimized ? 'Expandir' : 'Minimizar'}
            >
              {isMinimized ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Conteúdo do Painel */}
          {!isMinimized && (
            <div className="flex-1 overflow-hidden">
              {panelComponent}
            </div>
          )}

          {/* Ícone quando minimizado */}
          {isMinimized && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-xs text-muted-foreground writing-vertical">
                Painel
              </div>
            </div>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <Button
            onClick={onMinimizeToggle}
            className="rounded-full w-12 h-12 shadow-lg"
            title={isMinimized ? 'Mostrar painel' : 'Ocultar painel'}
          >
            {isMinimized ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Chatbot - aparece sobre tudo, sem interferir no layout */}
      <Chatbot />
    </div>
  );
}

/**
 * Versão mobile do layout com stack vertical
 */
export function MainLayoutMobile({
  mapComponent,
  panelComponent,
  isMinimized,
  onMinimizeToggle,
}: MainLayoutProps) {
  return (
    <div className="flex flex-col h-[calc(100vh-200px)] gap-4 p-4 overflow-hidden">
      {/* Mapa */}
      <div className={cn(
        'rounded-lg overflow-hidden transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100',
        isMinimized ? 'h-32' : 'h-1/2'
      )}>
        {mapComponent}
      </div>

      {/* Painel */}
      <div className={cn(
        'flex-1 rounded-lg border border-border bg-card overflow-hidden transition-all duration-300 flex flex-col',
        isMinimized ? 'h-12' : 'h-1/2'
      )}>
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/30">
          {!isMinimized && (
            <h2 className="text-sm font-semibold text-card-foreground">
              Painel de Controle
            </h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMinimizeToggle}
            className="ml-auto"
          >
            {isMinimized ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        </div> 

        {!isMinimized && (
          <div className="flex-1 overflow-hidden">
            {panelComponent}
          </div>
        )}
      </div>

      {/* Chatbot também no mobile */}
      <Chatbot />
    </div>
  );
}
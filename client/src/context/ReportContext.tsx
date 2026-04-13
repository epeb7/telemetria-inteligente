// client/src/context/ReportContext.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { pdf } from '@react-pdf/renderer';
import { PDFDocument } from '@/components/PDFReport';
import { TermoAvisoMotoristaPDF } from '@/components/TermoAvisoMotoristaPDF';

// ============================================================================
// TIPOS — RELATÓRIO PADRÃO (PDFDocument)
// ============================================================================

export interface ReportFilters {
  driver?: string;
  vehicleCode?: string;
  status?: 'active' | 'warning' | 'error' | 'offline';
  eventType?: 'hard_brake' | 'hard_acceleration' | 'sharp_curve';
}

export interface ReportData {
  kpis: any;
  topDrivers: any[];
  eventsByType: any;
  vehiclesWithEvents: any[];
  allEvents?: any[];
  filterDescription?: string;
}

export type ReportDataProvider = (filters: ReportFilters) => ReportData;

// ============================================================================
// TIPOS — TERMO DE AVISO (TermoAvisoMotoristaPDF)
// ============================================================================

export interface TermoData {
  vehicle: any;
  driver: { nome: string; telefone?: string; email?: string };
  events: any[];
  summary: { totalEvents: number; score: number; status: string };
}

/** Recebe um fragmento do nome do motorista; retorna os dados ou null se não encontrado. */
export type TermoDataProvider = (driverName: string) => TermoData | null;

export type TermoResult = 'ok' | 'not_found' | 'error';

// ============================================================================
// INTERFACE DO CONTEXTO
// ============================================================================

interface ReportContextValue {
  /** Gera relatório geral filtrado via PDFDocument. */
  generateReport: (filters?: ReportFilters) => Promise<void>;
  /** Gera Termo de Aviso para o motorista especificado. */
  generateTermo: (driverName: string, gestorNome?: string) => Promise<TermoResult>;
  /** True enquanto qualquer PDF está sendo gerado. */
  isGenerating: boolean;
  registerDataProvider: (provider: ReportDataProvider) => void;
  registerTermoProvider: (provider: TermoDataProvider) => void;
}

// ============================================================================
// PROVIDER
// ============================================================================

const ReportContext = createContext<ReportContextValue | null>(null);

export function ReportProvider({ children }: { children: React.ReactNode }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const dataProviderRef = useRef<ReportDataProvider | null>(null);
  const termoProviderRef = useRef<TermoDataProvider | null>(null);

  const registerDataProvider = useCallback((p: ReportDataProvider) => {
    dataProviderRef.current = p;
  }, []);

  const registerTermoProvider = useCallback((p: TermoDataProvider) => {
    termoProviderRef.current = p;
  }, []);

  // --------------------------------------------------------------------------
  // Relatório geral
  // --------------------------------------------------------------------------
  const generateReport = useCallback(async (filters: ReportFilters = {}) => {
    if (!dataProviderRef.current) {
      console.warn('[ReportContext] Nenhum data provider registrado.');
      return;
    }
    setIsGenerating(true);
    try {
      const data = dataProviderRef.current(filters);
      const blob = await pdf(
        <PDFDocument
          kpis={data.kpis}
          topDrivers={data.topDrivers}
          eventsByType={data.eventsByType}
          vehiclesWithEvents={data.vehiclesWithEvents}
          allEvents={data.allEvents ?? []}
        />
      ).toBlob();

      const date = new Date().toISOString().slice(0, 10);
      const suffix = data.filterDescription
        ? `_${data.filterDescription.replace(/\s+/g, '_').toLowerCase()}`
        : '';
      triggerDownload(blob, `relatorio_frota${suffix}_${date}.pdf`);
    } catch (err) {
      console.error('[ReportContext] Falha ao gerar relatório:', err);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // --------------------------------------------------------------------------
  // Termo de Aviso
  // --------------------------------------------------------------------------
  const generateTermo = useCallback(
    async (driverName: string, gestorNome = 'Gestor Responsável'): Promise<TermoResult> => {
      if (!termoProviderRef.current) {
        console.warn('[ReportContext] Nenhum termo provider registrado.');
        return 'error';
      }

      const data = termoProviderRef.current(driverName);
      if (!data) return 'not_found';

      setIsGenerating(true);
      try {
        const blob = await pdf(
          <TermoAvisoMotoristaPDF
            vehicle={data.vehicle}
            driver={data.driver}
            events={data.events}
            summary={data.summary}
            gestorNome={gestorNome}
            motoristaNome={data.driver.nome}
            dataDocumento={new Date().toLocaleDateString('pt-BR')}
          />
        ).toBlob();

        const safeName = data.driver.nome.replace(/\s+/g, '_');
        const date = new Date().toISOString().slice(0, 10);
        triggerDownload(blob, `termo_aviso_${safeName}_${date}.pdf`);
        return 'ok';
      } catch (err) {
        console.error('[ReportContext] Falha ao gerar Termo de Aviso:', err);
        return 'error';
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  return (
    <ReportContext.Provider
      value={{ generateReport, generateTermo, isGenerating, registerDataProvider, registerTermoProvider }}
    >
      {children}
    </ReportContext.Provider>
  );
}

export function useReport() {
  const ctx = useContext(ReportContext);
  if (!ctx) throw new Error('useReport deve ser usado dentro de <ReportProvider>.');
  return ctx;
}

// ============================================================================
// UTILITÁRIO INTERNO
// ============================================================================

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// client/src/lib/reportService.ts
//
// Catálogo central de relatórios do FrotaTrack.
//
// Para adicionar um novo tipo de relatório:
//   1. Adicione o id em ReportTypeId.
//   2. Adicione a entrada em REPORT_CATALOG com label, description, emoji e filters.
//   3. Mencione o novo tipo no SYSTEM_PROMPT de groq.ts.
//   Não é necessário alterar nenhum outro arquivo.

import type { ReportFilters } from '@/context/ReportContext';

// ============================================================================
// TIPOS
// ============================================================================

/** Identificadores de todos os relatórios disponíveis no sistema. */
export type ReportTypeId =
  | 'full_dashboard'       // Completo — todos os veículos e KPIs
  | 'driver_warnings'      // Motoristas/veículos com status warning
  | 'vehicle_errors'       // Veículos com status crítico (error)
  | 'active_vehicles'      // Apenas veículos ativos (em rota)
  | 'events_hard_brake'    // Veículos com freadas bruscas
  | 'events_acceleration'  // Veículos com acelerações bruscas
  | 'events_sharp_curve'   // Veículos com curvas acentuadas
  | 'top_drivers'          // Ranking de motoristas por score
  | 'termo_aviso';         // Termo de Registro de Eventos — documento formal por motorista

export interface ReportDefinition {
  id: ReportTypeId;
  /** Rótulo amigável exibido no chat e no nome do arquivo PDF. */
  label: string;
  /** Descrição curta usada na UI e no system prompt da IA. */
  description: string;
  /** Emoji para exibição na lista de relatórios do chat. */
  emoji: string;
  /** Filtros pré-definidos aplicados ao dataset ao gerar este relatório. */
  filters: ReportFilters;
  /**
   * Quando true, este relatório exige um nome de motorista específico e é
   * gerado via generateTermo() em vez de generateReport().
   * O chip na lista do chat preenche o input em vez de gerar imediatamente.
   */
  requiresDriver?: boolean;
}

// ============================================================================
// CATÁLOGO
// ============================================================================

export const REPORT_CATALOG: Record<ReportTypeId, ReportDefinition> = {
  full_dashboard: {
    id: 'full_dashboard',
    label: 'Relatório Completo',
    description: 'Todos os veículos, KPIs gerais, ranking de motoristas e eventos totais',
    emoji: '📊',
    filters: {},
  },

  driver_warnings: {
    id: 'driver_warnings',
    label: 'Motoristas com Aviso',
    description: 'Veículos com status de aviso (bateria entre 10V e 25V)',
    emoji: '⚠️',
    filters: { status: 'warning' },
  },

  vehicle_errors: {
    id: 'vehicle_errors',
    label: 'Veículos com Erro',
    description: 'Veículos com status crítico (bateria abaixo de 10V)',
    emoji: '🚨',
    filters: { status: 'error' },
  },

  active_vehicles: {
    id: 'active_vehicles',
    label: 'Veículos em Rota',
    description: 'Apenas veículos com status ativo (em rota no momento)',
    emoji: '🟢',
    filters: { status: 'active' },
  },

  events_hard_brake: {
    id: 'events_hard_brake',
    label: 'Freadas Bruscas',
    description: 'Veículos que registraram freadas bruscas (≥ −6 km/h/s)',
    emoji: '🛑',
    filters: { eventType: 'hard_brake' },
  },

  events_acceleration: {
    id: 'events_acceleration',
    label: 'Acelerações Bruscas',
    description: 'Veículos com acelerações bruscas (≥ 4 km/h/s)',
    emoji: '⚡',
    filters: { eventType: 'hard_acceleration' },
  },

  events_sharp_curve: {
    id: 'events_sharp_curve',
    label: 'Curvas Acentuadas',
    description: 'Veículos com curvas acentuadas (>0,3g)',
    emoji: '🔄',
    filters: { eventType: 'sharp_curve' },
  },

  top_drivers: {
    id: 'top_drivers',
    label: 'Ranking de Motoristas',
    description: 'Todos os motoristas ordenados por score de segurança (sem filtro de evento)',
    emoji: '🏆',
    filters: {},
  },

  termo_aviso: {
    id: 'termo_aviso',
    label: 'Termo de Aviso — Motorista',
    description: 'Documento formal com lista de eventos, resumo de score e campo de assinatura do motorista e gestor. Requer o nome do motorista.',
    emoji: '📋',
    filters: {},
    requiresDriver: true,
  },
};

// ============================================================================
// UTILITÁRIOS
// ============================================================================

/** Retorna a definição de um relatório pelo id, ou undefined se não existir. */
export function getReportDefinition(id: ReportTypeId): ReportDefinition {
  return REPORT_CATALOG[id];
}

/** Retorna todos os relatórios cadastrados como array ordenado. */
export function listReports(): ReportDefinition[] {
  return Object.values(REPORT_CATALOG);
}

/** Verifica se uma string é um ReportTypeId válido. */
export function isReportTypeId(value: string): value is ReportTypeId {
  return value in REPORT_CATALOG;
}

/**
 * Resolve os filtros finais de um pedido de relatório.
 * Se houver `type`, usa os filtros do catálogo como base e aplica
 * quaisquer overrides adicionais em cima (ex: type + driver).
 */
export function resolveFilters(raw: ReportFilters & { type?: ReportTypeId }): ReportFilters {
  const { type, ...rest } = raw;
  if (!type) return rest;
  const base = REPORT_CATALOG[type]?.filters ?? {};
  return { ...base, ...rest };
}

/** Gera o texto da lista de relatórios para exibir no sistema prompt da IA. */
export function buildReportCatalogText(): string {
  return Object.values(REPORT_CATALOG)
    .map(r => `  - "${r.id}": ${r.label} — ${r.description}`)
    .join('\n');
}

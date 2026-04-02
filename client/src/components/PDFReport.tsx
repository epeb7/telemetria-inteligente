import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

// ============================================================================
// ESTILOS DO PDF
// ============================================================================

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#0F3D5E',
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F3D5E',
  },
  subtitle: {
    fontSize: 10,
    color: '#666666',
    marginTop: 4,
  },
  date: {
    fontSize: 9,
    color: '#666666',
    textAlign: 'right',
  },
  // Seção de Alerta (Motoristas em Risco)
  alertSection: {
    marginTop: 15,
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  alertTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 6,
  },
  alertText: {
    fontSize: 9,
    color: '#7F1D1D',
    marginBottom: 2,
  },
  // Seção de Aviso (Motoristas com atenção)
  warningSection: {
    marginTop: 15,
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  warningTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#D97706',
    marginBottom: 6,
  },
  // Cards de Motoristas
  driverCard: {
    marginTop: 15,
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  driverCardCritical: {
    marginTop: 15,
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  driverCardWarning: {
    marginTop: 15,
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F3D5E',
  },
  driverBadgeGood: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#22C55E',
    color: '#FFFFFF',
  },
  driverBadgeWarning: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#F59E0B',
    color: '#FFFFFF',
  },
  driverBadgeCritical: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
  },
  driverInfo: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 15,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 8,
    color: '#64748B',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  eventsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  eventCard: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  eventCardRed: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
  },
  eventCardAmber: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
  },
  eventCardOrange: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: '#FFEDD5',
  },
  eventNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventNumberRed: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  eventNumberAmber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  eventNumberOrange: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F97316',
  },
  eventLabel: {
    fontSize: 8,
    marginTop: 2,
  },
  eventLabelRed: {
    fontSize: 8,
    marginTop: 2,
    color: '#EF4444',
  },
  eventLabelAmber: {
    fontSize: 8,
    marginTop: 2,
    color: '#F59E0B',
  },
  eventLabelOrange: {
    fontSize: 8,
    marginTop: 2,
    color: '#F97316',
  },
  eventTable: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0F3D5E',
    padding: 6,
    borderRadius: 4,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tableCell: {
    fontSize: 8,
    color: '#334155',
    flex: 1,
  },
  tableCellRed: {
    fontSize: 8,
    color: '#EF4444',
    flex: 1,
  },
  tableCellAmber: {
    fontSize: 8,
    color: '#F59E0B',
    flex: 1,
  },
  tableCellOrange: {
    fontSize: 8,
    color: '#F97316',
    flex: 1,
  },
  // Score Section
  scoreSection: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 9,
    color: '#64748B',
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scoreBar: {
    width: '60%',
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  scoreBarFillGreen: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  scoreBarFillAmber: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  scoreBarFillRed: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  // Resumo
  summarySection: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F3D5E',
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 9,
    color: '#334155',
    marginBottom: 4,
  },
  summaryTextBold: {
    fontSize: 9,
    color: '#334155',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  // Rodapé
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 7,
    color: '#94A3B8',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    fontSize: 7,
    color: '#94A3B8',
  },
});

// ============================================================================
// TIPOS
// ============================================================================

interface EventAggregate {
  hardBrake: number;
  hardAcceleration: number;
  sharpCurve: number;
}

interface DriverEventDetail {
  id: string;
  type: 'hard_brake' | 'hard_acceleration' | 'sharp_curve';
  timestamp: Date;
  location: string;
  speed: number;
  vehicleCode: string;
}

interface DriverRank {
  driverId: string;
  driverName: string;
  score: number;
  events: EventAggregate;
  totalEvents: number;
  vehicleCode: string;
  lastEventTime: Date | null;
}

interface PDFReportProps {
  kpis: any;
  topDrivers: DriverRank[];
  eventsByType: any;
  vehiclesWithEvents: any[];
  allEvents?: DriverEventDetail[];
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

function getEventLabel(type: string): string {
  switch (type) {
    case 'hard_brake': return 'Freada Brusca';
    case 'hard_acceleration': return 'Aceleração Brusca';
    case 'sharp_curve': return 'Curva Acentuada';
    default: return type;
  }
}

function getEventColor(type: string): 'red' | 'amber' | 'orange' {
  switch (type) {
    case 'hard_brake': return 'red';
    case 'hard_acceleration': return 'amber';
    case 'sharp_curve': return 'orange';
    default: return 'red';
  }
}

function getScoreColor(score: number): 'green' | 'amber' | 'red' {
  if (score >= 80) return 'green';
  if (score >= 60) return 'amber';
  return 'red';
}

function getScoreStatus(score: number): string {
  if (score >= 80) return ' Bom';
  if (score >= 60) return 'Atenção';
  return ' Crítico - Deve ficar sob aviso';
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

// ============================================================================
// COMPONENTE PDF
// ============================================================================

const PDFDocument = ({ kpis, topDrivers, eventsByType, vehiclesWithEvents, allEvents = [] }: PDFReportProps) => {
  const totalEvents = eventsByType.hardBrake + eventsByType.hardAcceleration + eventsByType.sharpCurve;
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Encontrar motoristas em situação crítica (score < 60)
  const criticalDrivers = topDrivers.filter(d => d.score < 60);
  const warningDrivers = topDrivers.filter(d => d.score >= 60 && d.score < 80);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>FrotaTrack</Text>
            <Text style={styles.subtitle}>Relatório de Motoristas - Análise de Eventos</Text>
          </View>
          <Text style={styles.date}>Gerado em: {currentDate}</Text>
        </View>

        {/* SEÇÃO DE ALERTA - MOTORISTAS CRÍTICOS */}
        {criticalDrivers.length > 0 && (
          <View style={styles.alertSection}>
            <Text style={styles.alertTitle}> ALERTA CRÍTICO - AÇÃO IMEDIATA NECESSÁRIA</Text>
            {criticalDrivers.map(driver => (
              <Text key={driver.driverId} style={styles.alertText}>
                • {driver.driverName} (Veículo {driver.vehicleCode}) - Score {driver.score} - {driver.totalEvents} eventos
              </Text>
            ))}
            <Text style={[styles.alertText, { marginTop: 6, fontWeight: 'bold' }]}>
              ⚠️ Recomendação: Suspensão imediata e treinamento obrigatório
            </Text>
          </View>
        )}

        {/* SEÇÃO DE AVISO - MOTORISTAS COM ATENÇÃO */}
        {warningDrivers.length > 0 && (
          <View style={styles.warningSection}>
            <Text style={styles.warningTitle}> MOTORISTAS SOB AVISO</Text>
            {warningDrivers.map(driver => (
              <Text key={driver.driverId} style={styles.alertText}>
                • {driver.driverName} (Veículo {driver.vehicleCode}) - Score {driver.score} - {driver.totalEvents} eventos
              </Text>
            ))}
            <Text style={[styles.alertText, { marginTop: 6, fontWeight: 'bold' }]}>
              📋 Recomendação: Acompanhamento e treinamento preventivo
            </Text>
          </View>
        )}

        {/* RANKING COMPLETO DE MOTORISTAS (DO PIOR PARA O MELHOR) */}
        <View style={{ marginTop: 15 }}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#0F3D5E', marginBottom: 10 }}>
             Ranking de Motoristas (Piores para Melhores)
          </Text>
          
          {[...topDrivers].sort((a, b) => a.score - b.score).map((driver, index) => {
            const scoreColor = getScoreColor(driver.score);
            const scoreStatus = getScoreStatus(driver.score);
            const isCritical = driver.score < 60;
            const isWarning = driver.score >= 60 && driver.score < 80;
            
            // Filtrar eventos deste motorista
            const driverEvents = allEvents.filter(e => e.vehicleCode === driver.vehicleCode);
            
            // Escolher o estilo do card baseado no score
            let cardStyle = styles.driverCard;
            if (isCritical) cardStyle = styles.driverCardCritical;
            else if (isWarning) cardStyle = styles.driverCardWarning;
            
            // Escolher o estilo do badge
            let badgeStyle = styles.driverBadgeGood;
            if (isCritical) badgeStyle = styles.driverBadgeCritical;
            else if (isWarning) badgeStyle = styles.driverBadgeWarning;
            
            return (
              <View key={driver.driverId} style={cardStyle}>
                {/* Cabeçalho do Motorista */}
                <View style={styles.driverHeader}>
                  <Text style={styles.driverName}>
                    {index + 1}º - {driver.driverName}
                  </Text>
                  <View style={badgeStyle}>
                    <Text style={{ color: '#FFF', fontSize: 9, fontWeight: 'bold' }}>
                      Score: {driver.score}
                    </Text>
                  </View>
                </View>

                {/* Informações do Motorista */}
                <View style={styles.driverInfo}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Veículo</Text>
                    <Text style={styles.infoValue}>{driver.vehicleCode}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Total de Eventos</Text>
                    <Text style={styles.infoValue}>{driver.totalEvents}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Status</Text>
                    <Text style={styles.infoValue}>{scoreStatus}</Text>
                  </View>
                </View>

                {/* Eventos por Tipo */}
                <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 6, color: '#475569' }}>
                  Eventos registrados:
                </Text>
                <View style={styles.eventsGrid}>
                  <View style={styles.eventCardRed}>
                    <Text style={styles.eventNumberRed}>{driver.events.hardBrake}</Text>
                    <Text style={styles.eventLabelRed}>Freadas</Text>
                  </View>
                  <View style={styles.eventCardAmber}>
                    <Text style={styles.eventNumberAmber}>{driver.events.hardAcceleration}</Text>
                    <Text style={styles.eventLabelAmber}>Acelerações</Text>
                  </View>
                  <View style={styles.eventCardOrange}>
                    <Text style={styles.eventNumberOrange}>{driver.events.sharpCurve}</Text>
                    <Text style={styles.eventLabelOrange}>Curvas</Text>
                  </View>
                </View>

                {/* Tabela de Eventos Detalhados */}
                {driverEvents.length > 0 && (
                  <>
                    <Text style={{ fontSize: 9, fontWeight: 'bold', marginTop: 10, marginBottom: 6, color: '#475569' }}>
                      Últimos eventos:
                    </Text>
                    <View style={styles.eventTable}>
                      <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderCell, { flex: 0.25 }]}>Data</Text>
                        <Text style={[styles.tableHeaderCell, { flex: 0.25 }]}>Horário</Text>
                        <Text style={[styles.tableHeaderCell, { flex: 0.3 }]}>Tipo</Text>
                        <Text style={[styles.tableHeaderCell, { flex: 0.2 }]}>Velocidade</Text>
                      </View>
                      {driverEvents.slice(0, 5).map((event) => {
                        const eventColor = getEventColor(event.type);
                        let cellStyle = styles.tableCell;
                        if (eventColor === 'red') cellStyle = styles.tableCellRed;
                        else if (eventColor === 'amber') cellStyle = styles.tableCellAmber;
                        else if (eventColor === 'orange') cellStyle = styles.tableCellOrange;
                        
                        return (
                          <View style={styles.tableRow} key={event.id}>
                            <Text style={[styles.tableCell, { flex: 0.25 }]}>{formatDate(event.timestamp)}</Text>
                            <Text style={[styles.tableCell, { flex: 0.25 }]}>{formatTime(event.timestamp)}</Text>
                            <Text style={[cellStyle, { flex: 0.3 }]}>
                              {getEventLabel(event.type)}
                            </Text>
                            <Text style={[styles.tableCell, { flex: 0.2 }]}>{event.speed} km/h</Text>
                          </View>
                        );
                      })}
                    </View>
                  </>
                )}

                {/* Barra de Score */}
                <View style={styles.scoreSection}>
                  <Text style={styles.scoreLabel}>Score de Segurança</Text>
                  <View style={styles.scoreBar}>
                    <View style={[
                      scoreColor === 'green' ? styles.scoreBarFillGreen :
                      scoreColor === 'amber' ? styles.scoreBarFillAmber :
                      styles.scoreBarFillRed,
                      { width: `${driver.score}%` }
                    ]} />
                  </View>
                  <Text style={[styles.scoreValue, { color: scoreColor === 'green' ? '#22C55E' : scoreColor === 'amber' ? '#F59E0B' : '#EF4444' }]}>
                    {driver.score}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* RESUMO EXECUTIVO */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}> Resumo Executivo</Text>
          <Text style={styles.summaryText}>• Total de motoristas analisados: {topDrivers.length}</Text>
          <Text style={styles.summaryText}>• Motoristas em situação crítica: {criticalDrivers.length}</Text>
          <Text style={styles.summaryText}>• Motoristas sob aviso: {warningDrivers.length}</Text>
          <Text style={styles.summaryText}>• Total de eventos registrados: {totalEvents}</Text>
          <Text style={styles.summaryTextBold}>
             Ação recomendada: {criticalDrivers.length > 0 ? 'Reunião urgente com motoristas críticos' : 'Manter monitoramento preventivo'}
          </Text>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text>Relatório confidencial - Uso interno da empresa</Text>
          <Text>FrotaTrack Telemetria Inteligente - Análise focada em motoristas</Text>
        </View>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>
    </Document>
  );
};

// ============================================================================
// COMPONENTE DE BOTÃO PARA DOWNLOAD
// ============================================================================

interface PDFDownloadButtonProps {
  kpis: any;
  topDrivers: DriverRank[];
  eventsByType: any;
  vehiclesWithEvents: any[];
  allEvents?: any[];
  buttonText?: string;
  buttonClassName?: string;
}

export const PDFDownloadButton = ({
  kpis,
  topDrivers,
  eventsByType,
  vehiclesWithEvents,
  allEvents = [],
  buttonText = '📄 Relatório de Motoristas',
  buttonClassName = 'px-4 py-2 bg-[#0F3D5E] text-white rounded-lg hover:bg-[#0F3D5E]/90 transition-colors text-sm font-medium',
}: PDFDownloadButtonProps) => {
  return (
    <PDFDownloadLink
      document={
        <PDFDocument
          kpis={kpis}
          topDrivers={topDrivers}
          eventsByType={eventsByType}
          vehiclesWithEvents={vehiclesWithEvents}
          allEvents={allEvents}
        />
      }
      fileName={`relatorio_motoristas_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`}
    >
      {({ loading, error }) => (
        <button
          className={buttonClassName}
          disabled={loading}
        >
          {loading ? '⏳ Gerando relatório...' : buttonText}
        </button>
      )}
    </PDFDownloadLink>
  );
};
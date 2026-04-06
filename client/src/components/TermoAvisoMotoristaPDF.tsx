import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#0F3D5E',
  },
  subtitle: {
    fontSize: 10,
    color: '#4B5563',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
    backgroundColor: '#F3F4F6',
    padding: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: '30%',
    fontWeight: 'bold',
    color: '#374151',
  },
  value: {
    width: '70%',
    color: '#111827',
  },
  eventTable: {
    marginTop: 8,
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    padding: 6,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#D1D5DB',
    padding: 6,
  },
  cellDate: { width: '15%' },
  cellTime: { width: '12%' },
  cellType: { width: '20%' },
  cellSeverity: { width: '13%' },
  cellLocation: { width: '25%' },
  cellSpeed: { width: '15%' },
  signatureBox: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureField: {
    width: '45%',
    borderTopWidth: 0.5,
    borderTopColor: '#000',
    paddingTop: 8,
    marginTop: 20,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#9CA3AF',
    textAlign: 'center',
    borderTopWidth: 0.5,
    paddingTop: 6,
  },
});

interface TermoAvisoProps {
  vehicle: any;
  driver: any;
  events: any[];
  summary: {
    totalEvents: number;
    score: number;
    status: string;
  };
  gestorNome: string;
  motoristaNome: string;
  dataDocumento: string;
}

export const TermoAvisoMotoristaPDF = ({
  vehicle,
  driver,
  events,
  summary,
  gestorNome,
  motoristaNome,
  dataDocumento,
}: TermoAvisoProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.title}>Termo de Registro de Eventos e Notificação</Text>
        <Text style={styles.subtitle}>Documento nº {new Date().getTime()}</Text>
      </View>

      {/* Identificação */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Identificação do Motorista e Veículo</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Motorista:</Text>
          <Text style={styles.value}>{driver.nome}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Veículo:</Text>
          <Text style={styles.value}>{vehicle.name} - Cód. {vehicle.code}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Rota / Linha:</Text>
          <Text style={styles.value}>{vehicle.route || 'Não informada'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Data do documento:</Text>
          <Text style={styles.value}>{dataDocumento}</Text>
        </View>
      </View>

      {/* Lista de eventos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Eventos Registrados</Text>
        <View style={styles.eventTable}>
          <View style={styles.tableHeader}>
            <Text style={styles.cellDate}>Data</Text>
            <Text style={styles.cellTime}>Hora</Text>
            <Text style={styles.cellType}>Tipo</Text>
            <Text style={styles.cellSeverity}>Gravidade</Text>
            <Text style={styles.cellLocation}>Local</Text>
            <Text style={styles.cellSpeed}>Veloc.</Text>
          </View>
          {events.map((ev, idx) => (
            <View style={styles.tableRow} key={idx}>
              <Text style={styles.cellDate}>{new Date(ev.timestamp).toLocaleDateString('pt-BR')}</Text>
              <Text style={styles.cellTime}>{new Date(ev.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
              <Text style={styles.cellType}>{ev.type === 'hard_brake' ? 'Freada brusca' : ev.type === 'hard_acceleration' ? 'Aceleração brusca' : 'Curva acentuada'}</Text>
              <Text style={styles.cellSeverity}>{ev.severity === 'high' ? 'Alto' : ev.severity === 'medium' ? 'Médio' : 'Baixo'}</Text>
              <Text style={styles.cellLocation}>{ev.location || '--'}</Text>
              <Text style={styles.cellSpeed}>{ev.speed} km/h</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Resumo */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Resumo e Pontuação</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Total de eventos no período:</Text>
          <Text style={styles.value}>{summary.totalEvents}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Score de segurança (0-100):</Text>
          <Text style={styles.value}>{summary.score} – {summary.status}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Conduta esperada:</Text>
          <Text style={styles.value}>Manter direção defensiva, respeitar limites de velocidade, evitar frenagens bruscas e curvas acentuadas.</Text>
        </View>
      </View>

      {/* Declaração */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. Declaração de Ciência e Compromisso</Text>
        <Text style={{ marginBottom: 8 }}>
          Eu, {driver.nome}, declaro que fui devidamente notificado sobre os eventos de direção acima listados,
          ciente de que tais condutas comprometem a segurança e a eficiência operacional. Comprometo-me a adotar as medidas corretivas
          necessárias para melhoria do meu desempenho, sob pena de aplicação das sanções previstas no regulamento interno da empresa.
        </Text>
      </View>

      {/* Assinaturas */}
      <View style={styles.signatureBox}>
        <View style={styles.signatureField}>
          <Text>Assinatura do Motorista</Text>
          <Text style={{ marginTop: 12, fontSize: 9 }}>{motoristaNome || '_________________________'}</Text>
          <Text style={{ marginTop: 4, fontSize: 8 }}>Nome legível ou rubrica</Text>
        </View>
        <View style={styles.signatureField}>
          <Text>Assinatura do Diretor / Gestor</Text>
          <Text style={{ marginTop: 12, fontSize: 9 }}>{gestorNome}</Text>
          <Text style={{ marginTop: 4, fontSize: 8 }}>Carimbo e nome completo</Text>
        </View>
      </View>

      <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text>Local: _________________________</Text>
        <Text>Data: {dataDocumento}</Text>
      </View>

      <View style={styles.footer} fixed>
        <Text>Documento gerado eletronicamente por FrotaTrack Telemetria – válido como notificação formal.</Text>
        <Text>Este documento é de uso interno da empresa e deve ser arquivado junto ao prontuário do motorista.</Text>
      </View>
    </Page>
  </Document>
);
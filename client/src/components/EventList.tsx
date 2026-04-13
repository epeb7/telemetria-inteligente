// client/src/components/EventsList.tsx
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { jsPDF } from 'jspdf';
import { Search, Filter, X, Calendar, MapPin, Truck, User, Route, FileDown, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

// Tipos
interface EventoListagem {
  veiculo: string;
  motorista: string;
  evento: string;
  dataHora: string;
  dataHoraRaw?: string;
  rota: string;
  deviceid?: string;
  positionid?: string;
  imei?: string;
  tipoRaw?: string;
  _posEvento?: { lat: number; lon: number; speedKmh: number };
  _endereco?: string;
}

interface Totais {
  [evento: string]: number;
}

interface Posicao {
  lat: number;
  lon: number;
  speedKmh?: number;
}

export function EventList() {
  // Estados de filtros
  const [clientes, setClientes] = useState<string[]>([]);
  const [todosEventos, setTodosEventos] = useState<string[]>([]);
  const [eventosSelecionados, setEventosSelecionados] = useState<Set<string>>(new Set());
  const [tipoFiltro, setTipoFiltro] = useState<'veiculo' | 'motorista' | 'rota' | ''>('');
  const [itensTipoSelecionados, setItensTipoSelecionados] = useState<Set<string>>(new Set());
  const [dadosTipo, setDadosTipo] = useState<any[]>([]);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState('');
  const [registros, setRegistros] = useState<EventoListagem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalizador, setTotalizador] = useState<Totais>({});
  const [showTotalizador, setShowTotalizador] = useState(false);

  // Estados dos modais e popovers
  const [modalEventosOpen, setModalEventosOpen] = useState(false);
  const [modalTipoOpen, setModalTipoOpen] = useState(false);
  const [modalDetalheOpen, setModalDetalheOpen] = useState(false);
  const [registroAtual, setRegistroAtual] = useState<EventoListagem | null>(null);
  const [popoverEventosOpen, setPopoverEventosOpen] = useState(false);
  const [popoverTipoOpen, setPopoverTipoOpen] = useState(false);
  const [buscaTipo, setBuscaTipo] = useState('');

  // Configuração do filtro por tipo
  const configTipo = tipoFiltro === 'veiculo' ? {
    label: 'Veículos',
    titulo: 'Selecionar Veículos',
    endpoint: '/api/veiculos',
    campo: (r: any) => `${r.cod} — ${r.placa || ''}`,
    valor: (r: any) => `${r.cod} — ${r.placa || ''}`
  } : tipoFiltro === 'motorista' ? {
    label: 'Motoristas',
    titulo: 'Selecionar Motoristas',
    endpoint: '/api/motoristas',
    campo: (r: any) => `${r.cod} — ${r.nome}`,
    valor: (r: any) => `${r.cod} — ${r.nome}`
  } : tipoFiltro === 'rota' ? {
    label: 'Rotas',
    titulo: 'Selecionar Rotas',
    endpoint: '/api/rotas',
    campo: (r: any) => r,
    valor: (r: any) => r
  } : null;

  // Refs para o mapa
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  // ============================================================================
  // Carregar dados iniciais
  // ============================================================================
  useEffect(() => {
    fetch('/api/clientes')
      .then(res => res.json())
      .then(data => setClientes(data.clientes || []))
      .catch(console.error);
    fetch('/api/eventos')
      .then(res => res.json())
      .then(data => setTodosEventos(data.eventos || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!configTipo) return;
    fetch(configTipo.endpoint)
      .then(res => res.json())
      .then(data => {
        const items = data.veiculos ?? data.motoristas ?? data.rotas ?? [];
        setDadosTipo(items);
      })
      .catch(console.error);
  }, [configTipo]);

  // ============================================================================
  // Funções de busca
  // ============================================================================
  const handleBuscar = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (dataInicio) params.append('dataInicio', dataInicio);
    if (dataFim) params.append('dataFim', dataFim);
    if (eventosSelecionados.size > 0) params.append('eventos', [...eventosSelecionados].join(','));
    if (tipoFiltro && itensTipoSelecionados.size > 0) {
      params.append('tipoFiltro', tipoFiltro);
      params.append('valoresFiltro', [...itensTipoSelecionados].join(','));
    }
    if (clienteSelecionado) params.append('cliente', clienteSelecionado);
    try {
      const res = await fetch(`/api/listagem?${params.toString()}`);
      const data = await res.json();
      setRegistros(data.registros || []);
      setTotalizador(data.totais || {});
      setShowTotalizador(Object.keys(data.totais || {}).length > 0);
    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // Modal de detalhe com mapa
  // ============================================================================
  const abrirDetalhe = async (evento: EventoListagem) => {
    setRegistroAtual(evento);
    setModalDetalheOpen(true);

    // Inicializar mapa
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([-15, -50], 4);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    if (!evento.deviceid || !evento.dataHoraRaw) return;

    const params = new URLSearchParams({
      deviceid: evento.deviceid,
      dataHora: evento.dataHoraRaw,
    });
    if (evento.positionid) params.append('positionid', evento.positionid);

    try {
      const res = await fetch(`/api/posicoes?${params.toString()}`);
      const data = await res.json();
      if (data.posicoes?.length && mapRef.current) {
        const latlngs = data.posicoes.map((p: Posicao) => [p.lat, p.lon] as L.LatLngExpression);
        L.polyline(latlngs, { color: '#0F3D5E', weight: 3 }).addTo(mapRef.current);
        if (data.posEvento) {
          const ev = data.posEvento;
          L.circleMarker([ev.lat, ev.lon], {
            radius: 10,
            color: '#ef4444',
            fillColor: '#fca5a5',
            fillOpacity: 0.9,
          }).bindPopup(`<b>${evento.evento}</b><br>${evento.dataHora}`).addTo(mapRef.current).openPopup();
          setRegistroAtual(prev => ({ ...prev!, _posEvento: ev }));
          // Reverse geocode
          try {
            const geo = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${ev.lat}&lon=${ev.lon}&format=json`, {
              headers: { 'Accept-Language': 'pt-BR' },
            }).then(r => r.json());
            const addr = geo.address || {};
            const rua = [addr.road, addr.suburb || addr.neighbourhood, addr.city || addr.town || addr.municipality, addr.state]
              .filter(Boolean).join(', ') || geo.display_name || '—';
            setRegistroAtual(prev => ({ ...prev!, _endereco: rua }));
          } catch {}
        }
        mapRef.current.fitBounds(L.latLngBounds(latlngs));
      }
    } catch (error) {
      console.error('Erro ao carregar posições:', error);
    }
  };

  const fecharDetalhe = () => {
    setModalDetalheOpen(false);
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
  };

  // ============================================================================
  // Gerar PDF da listagem
  // ============================================================================
  const gerarListagemPDF = () => {
    if (registros.length === 0) return;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const W = 297, ml = 12, mr = 12, lw = W - ml - mr;
    const hoje = new Date().toLocaleDateString('pt-BR');
    let y = 16;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Listagem de Eventos de Telemetria', ml, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Gerado em ${hoje}  •  ${registros.length} registro${registros.length !== 1 ? 's' : ''}`, W - mr, y, { align: 'right' });
    y += 4;
    doc.line(ml, y, W - mr, y);
    y += 7;

    const cols = [
      { label: 'Veículo', x: ml, w: 38 },
      { label: 'Motorista', x: ml + 40, w: 48 },
      { label: 'Evento', x: ml + 90, w: 60 },
      { label: 'Data/Hora', x: ml + 152, w: 36 },
      { label: 'Rota', x: ml + 190, w: lw - 190 },
    ];

    doc.setFillColor(220, 225, 235);
    doc.rect(ml, y - 4.5, lw, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(40, 60, 100);
    cols.forEach(c => doc.text(c.label, c.x + 1, y));
    doc.setTextColor(30, 30, 30);
    y += 4;
    doc.line(ml, y, W - mr, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    registros.forEach((r, i) => {
      if (i % 2 === 0) {
        doc.setFillColor(248, 249, 252);
        doc.rect(ml, y - 3.5, lw, 6.5, 'F');
      }
      const cells = [r.veiculo, r.motorista, r.evento, r.dataHora, r.rota];
      cells.forEach((val, ci) => {
        const c = cols[ci];
        const wrapped = doc.splitTextToSize(val || '—', c.w - 2);
        doc.text(wrapped[0], c.x + 1, y);
      });
      y += 6.5;
      if (y > 190) {
        doc.addPage();
        y = 16;
        doc.setFillColor(220, 225, 235);
        doc.rect(ml, y - 4.5, lw, 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(40, 60, 100);
        cols.forEach(c => doc.text(c.label, c.x + 1, y));
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 30, 30);
        y += 4;
        doc.line(ml, y, W - mr, y);
        y += 4;
      }
    });
    doc.save(`Listagem_Telemetria_${hoje.replace(/\//g, '-')}.pdf`);
  };

  // ============================================================================
  // Gerar Termo de Ciência e Responsabilidade (PDF)
  // ============================================================================
  const gerarTermo = () => {
    if (!registroAtual) return;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210, ml = 15, mr = 15, lw = W - ml - mr;
    const docNum = Date.now();
    const hoje = new Date().toLocaleDateString('pt-BR');
    let y = 18;

    const setColor = (r: number, g: number, b: number) => doc.setTextColor(r, g, b);
    const resetColor = () => doc.setTextColor(30, 30, 30);
    const secao = (num: number, titulo: string) => {
      y += 4;
      doc.setFillColor(240, 240, 240);
      doc.rect(ml, y, lw, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      resetColor();
      doc.text(`${num}. ${titulo}`, ml + 3, y + 5.5);
      y += 12;
    };
    const linhaKV = (label: string, valor: string, col2 = ml + 52) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      setColor(60, 80, 120);
      doc.text(label + ':', ml + 3, y);
      doc.setFont('helvetica', 'normal');
      resetColor();
      const wrapped = doc.splitTextToSize(String(valor || '—'), lw - (col2 - ml) - 3);
      doc.text(wrapped, col2, y);
      y += wrapped.length * 5.5;
    };

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    resetColor();
    doc.text('TERMO DE CIÊNCIA E RESPONSABILIDADE', ml, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    setColor(120, 120, 120);
    doc.text(`Documento nº ${docNum}`, W - mr, y, { align: 'right' });
    resetColor();
    y += 5;
    doc.line(ml, y, W - mr, y);
    y += 6;

    secao(1, 'Identificação do Motorista e Veículo');
    linhaKV('Motorista', '_____________');
    linhaKV('Veículo', registroAtual.veiculo);
    linhaKV('Rota / Linha', registroAtual.rota);
    linhaKV('Data do documento', hoje);
    y += 2;

    secao(2, 'Evento Registrado');
    const colData = ml + 3, colHora = ml + 27, colTipo = ml + 53, colVeloc = ml + 120, colLocal = ml + 142;
    doc.setFillColor(220, 225, 235);
    doc.rect(ml, y - 4, lw, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    setColor(40, 60, 100);
    doc.text('Data', colData, y);
    doc.text('Hora', colHora, y);
    doc.text('Tipo', colTipo, y);
    doc.text('Veloc.', colVeloc, y);
    doc.text('Local', colLocal, y);
    resetColor();
    y += 7;
    const [dataEv, horaEv] = (registroAtual.dataHora || '— —').split(' ');
    const localEv = registroAtual._endereco ? registroAtual._endereco.split(',').slice(0, 2).join(',') : '—';
    const velocEv = registroAtual._posEvento ? `${registroAtual._posEvento.speedKmh} km/h` : '—';
    doc.text(dataEv || '—', colData, y);
    doc.text(horaEv || '—', colHora, y);
    const tipoWrapped = doc.splitTextToSize(registroAtual.evento || '—', 62);
    doc.text(tipoWrapped, colTipo, y);
    doc.text(velocEv, colVeloc, y);
    const localWrapped = doc.splitTextToSize(localEv, 40);
    doc.text(localWrapped, colLocal, y);
    y += Math.max(tipoWrapped.length, localWrapped.length) * 5 + 8;
    if (registroAtual._posEvento) {
      doc.setFontSize(7.5);
      setColor(100, 100, 100);
      doc.text(`Coordenadas: ${registroAtual._posEvento.lat.toFixed(6)}, ${registroAtual._posEvento.lon.toFixed(6)}`, ml + 3, y);
      y += 5.5;
    }
    if (registroAtual.imei) {
      doc.text(`IMEI do rastreador: ${registroAtual.imei}`, ml + 3, y);
      y += 5.5;
    }
    resetColor();
    y += 4;

    secao(3, 'Resumo e Pontuação');
    const totalMotorista = registros.filter(r => r.motorista === registroAtual.motorista).length;
    linhaKV('Total de eventos no período', String(totalMotorista || 1));
    linhaKV('Conduta esperada', 'Manter direção defensiva, respeitar limites de velocidade, evitar frenagens bruscas e acelerações abruptas.');
    y += 2;

    secao(4, 'Declaração de Ciência e Compromisso');
    y += 4;
    const decl = `Eu, _________________, declaro que fui devidamente notificado(a) sobre o evento de telemetria veicular registrado no veículo indicado acima, ocorrido em ${registroAtual.dataHora}, classificado como "${registroAtual.evento}".

Estou ciente de que tal ocorrência foi registrada pelo sistema de monitoramento e que é de minha responsabilidade conduzir o veículo de forma segura, respeitando as normas internas e a legislação vigente. Comprometo-me a adotar as medidas corretivas necessárias para evitar a reincidência, bem como a participar dos treinamentos e orientações disponibilizados pela empresa.`;
    const declWrapped = doc.splitTextToSize(decl, lw - 6);
    doc.text(declWrapped, ml + 3, y);
    y += declWrapped.length * 5 + 6;

    y = Math.max(y, 220);
    doc.line(ml, y, W - mr, y);
    y += 10;
    const cA = ml + 10, cB = W / 2 + 15;
    doc.line(cA, y, cA + 65, y);
    doc.line(cB, y, cB + 65, y);
    y += 5;
    doc.setFontSize(8);
    setColor(80, 80, 80);
    doc.text('Assinatura do Motorista', cA, y);
    doc.text('Assinatura do Diretor / Gestor', cB, y);
    y += 5;
    doc.text('Nome legivel ou rubrica', cA, y);
    doc.text('Carimbo e nome completo', cB, y);
    y += 10;
    doc.line(ml, y, ml + 65, y);
    doc.text('Local: _________', ml, y + 5);
    doc.text(`Data: ${hoje}`, W - mr, y + 5, { align: 'right' });
    doc.setFontSize(7);
    setColor(150, 150, 150);
    doc.text('Documento gerado eletronicamente pelo sistema de Telemetria Veicular – valido como notificacao formal.', W / 2, 282, { align: 'center' });
    doc.text('Este documento e de uso interno da empresa e deve ser arquivado junto ao prontuario do motorista.', W / 2, 286, { align: 'center' });
    const nomeArquivo = `Termo_${(registroAtual.motorista || 'motorista').replace(/\s+/g, '_')}_${registroAtual.dataHoraRaw || 'data'}.pdf`;
    doc.save(nomeArquivo);
  };

  // ============================================================================
  // Renderização JSX (padrão FrotaTrack)
  // ============================================================================
  const filtroTipoOptions = [
    { value: '', label: '(Nenhum filtro escolhido)' },
    { value: 'veiculo', label: 'Veículo' },
    { value: 'motorista', label: 'Motorista' },
    { value: 'rota', label: 'Rota' },
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Cabeçalho / Filtros */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          {/* Tipo de filtro */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tipo do filtro</label>
            <select
              value={tipoFiltro}
              onChange={e => setTipoFiltro(e.target.value as any)}
              className="bg-white border border-slate-200 text-slate-700 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0F3D5E]/20 focus:border-[#0F3D5E] transition-colors"
            >
              {filtroTipoOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Seleção dinâmica (veículo/motorista/rota) */}
          {configTipo && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{configTipo.label}</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModalTipoOpen(true)}
                  className="bg-white border border-[#0F3D5E] text-[#0F3D5E] text-sm rounded-md px-3 py-1.5 hover:bg-[#0F3D5E]/5 transition-colors"
                >
                  Selecionar
                </button>
                <span className="relative">
                  <span
                    onClick={() => setPopoverTipoOpen(!popoverTipoOpen)}
                    className="bg-amber-50 text-amber-600 text-xs font-bold px-2 py-0.5 rounded-full cursor-pointer hover:bg-amber-100 transition-colors select-none border border-amber-200"
                  >
                    {itensTipoSelecionados.size === 0
                      ? '0 selecionados'
                      : `${itensTipoSelecionados.size} selecionado${itensTipoSelecionados.size > 1 ? 's' : ''}`}
                  </span>
                  {popoverTipoOpen && (
                    <div className="absolute top-8 left-0 z-50 bg-white border border-slate-200 rounded-xl shadow-lg py-2 min-w-52 max-w-72">
                      <p className="text-xs text-slate-400 px-3 pb-1 border-b border-slate-100 mb-1 font-semibold uppercase tracking-wider">{configTipo.label}</p>
                      <ul className="max-h-48 overflow-y-auto">
                        {itensTipoSelecionados.size === 0 ? (
                          <li className="px-3 py-2 text-xs text-slate-400 italic">Nenhum selecionado</li>
                        ) : (
                          Array.from(itensTipoSelecionados).map(v => (
                            <li key={v} className="px-3 py-1.5 text-xs text-slate-600 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0F3D5E] shrink-0" />
                              {v}
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Eventos */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Eventos</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setModalEventosOpen(true)}
                className="bg-white border border-[#0F3D5E] text-[#0F3D5E] text-sm rounded-md px-3 py-1.5 hover:bg-[#0F3D5E]/5 transition-colors"
              >
                Selecionar Eventos
              </button>
              <span className="relative">
                <span
                  onClick={() => setPopoverEventosOpen(!popoverEventosOpen)}
                  className="bg-amber-50 text-amber-600 text-xs font-bold px-2 py-0.5 rounded-full cursor-pointer hover:bg-amber-100 transition-colors select-none border border-amber-200"
                >
                  {eventosSelecionados.size === 0
                    ? '0 selecionados'
                    : `${eventosSelecionados.size} selecionado${eventosSelecionados.size > 1 ? 's' : ''}`}
                </span>
                {popoverEventosOpen && (
                  <div className="absolute top-8 left-0 z-50 bg-white border border-slate-200 rounded-xl shadow-lg py-2 min-w-52 max-w-72">
                    <p className="text-xs text-slate-400 px-3 pb-1 border-b border-slate-100 mb-1 font-semibold uppercase tracking-wider">Eventos selecionados</p>
                    <ul className="max-h-48 overflow-y-auto">
                      {eventosSelecionados.size === 0 ? (
                        <li className="px-3 py-2 text-xs text-slate-400 italic">Nenhum evento selecionado</li>
                      ) : (
                        Array.from(eventosSelecionados).map(ev => (
                          <li key={ev} className="px-3 py-1.5 text-xs text-slate-600 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0F3D5E] shrink-0" />
                            {ev}
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                )}
              </span>
            </div>
          </div>

          {/* Datas */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Data Início</label>
            <input
              type="date"
              value={dataInicio}
              onChange={e => setDataInicio(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0F3D5E]/20 focus:border-[#0F3D5E] transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Data Fim</label>
            <input
              type="date"
              value={dataFim}
              onChange={e => setDataFim(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0F3D5E]/20 focus:border-[#0F3D5E] transition-colors"
            />
          </div>

          {/* Cliente */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cliente</label>
            <select
              value={clienteSelecionado}
              onChange={e => setClienteSelecionado(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0F3D5E]/20 focus:border-[#0F3D5E] transition-colors"
            >
              <option value="">(Todos)</option>
              {clientes.map(cliente => (
                <option key={cliente} value={cliente}>{cliente}</option>
              ))}
            </select>
          </div>

          {/* Botão Buscar */}
          <button
            onClick={handleBuscar}
            disabled={loading}
            className="bg-[#0F3D5E] hover:bg-[#0F3D5E]/90 text-white text-sm font-semibold px-5 py-1.5 rounded-md transition-colors flex items-center gap-2 self-end disabled:opacity-50 shadow-sm"
          >
            <Search className="w-4 h-4" />
            Buscar
          </button>
        </div>
      </div>

      {/* Resultados */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {loading && (
          <div className="py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-[#0F3D5E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Buscando eventos...</p>
          </div>
        )}

        {!loading && registros.length === 0 && (
          <div className="py-16 text-center text-slate-400">
            <Filter className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Use os filtros acima e clique em Buscar.</p>
          </div>
        )}

        {!loading && registros.length > 0 && (
          <>
            {/* Totalizador */}
            {showTotalizador && Object.keys(totalizador).length > 0 && (
              <div className="mb-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Totalizador de eventos</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(totalizador).map(([evento, qty]) => (
                    <div key={evento} className="flex items-center gap-1.5 bg-sky-50 border border-sky-100 rounded-lg px-3 py-1.5">
                      <span className="text-sky-700 text-xs font-medium">{evento}</span>
                      <span className="bg-sky-100 text-sky-700 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.5rem] text-center">{qty}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

                {/* Tabela */}
                    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                            <th className="px-4 py-3 text-left font-semibold">Veículo</th>
                            <th className="px-4 py-3 text-left font-semibold">Motorista</th>
                            <th className="px-4 py-3 text-left font-semibold">Evento</th>
                            <th className="px-4 py-3 text-left font-semibold">Data/Hora</th>
                            <th className="px-4 py-3 text-left font-semibold">Rota</th>
                            <th className="px-4 py-3 text-center w-12"></th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {registros.map((r, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-2.5 text-slate-700 font-medium">{r.veiculo || '—'}</td>
                            <td className="px-4 py-2.5 text-slate-500">{r.motorista || '—'}</td>
                            <td className="px-4 py-2.5">
                                <span className="bg-sky-50 text-sky-700 text-xs px-2 py-0.5 rounded-full border border-sky-100">{r.evento || '—'}</span>
                            </td>
                            <td className="px-4 py-2.5 text-slate-500 text-xs tabular-nums">{r.dataHora || '—'}</td>
                            <td className="px-4 py-2.5 text-slate-400">{r.rota || '—'}</td>
                            <td className="px-4 py-2.5 text-center">
                                <button
                                onClick={() => abrirDetalhe(r)}
                                className="text-slate-400 hover:text-[#0F3D5E] transition-colors"
                                title="Ver detalhes"
                                >
                                <Eye className="w-4 h-4" />
                                </button>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>

            {/* Rodapé da tabela */}
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-slate-400">
                {registros.length} registro{registros.length !== 1 ? 's' : ''} encontrado{registros.length !== 1 ? 's' : ''}
              </p>
              <button
                onClick={gerarListagemPDF}
                className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shadow-sm"
              >
                <FileDown className="w-3.5 h-3.5" />
                Exportar PDF
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modal de seleção de eventos */}
      {modalEventosOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-80 flex flex-col gap-4 p-5 max-h-[80vh]">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Selecionar Eventos</h3>
              <button onClick={() => setModalEventosOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
            </div>
            <div className="overflow-y-auto flex flex-col gap-1 max-h-72 pr-1">
              {todosEventos.map(ev => (
                <label key={ev} className="flex items-center gap-3 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={eventosSelecionados.has(ev)}
                    onChange={e => {
                      const newSet = new Set(eventosSelecionados);
                      if (e.target.checked) newSet.add(ev);
                      else newSet.delete(ev);
                      setEventosSelecionados(newSet);
                    }}
                    className="accent-[#0F3D5E] w-4 h-4 cursor-pointer"
                  />
                  <span>{ev}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEventosSelecionados(new Set())}
                className="flex-1 text-sm border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300 py-1.5 rounded-lg transition-colors"
              >
                Limpar
              </button>
              <button
                onClick={() => setEventosSelecionados(new Set(todosEventos))}
                className="flex-1 text-sm border border-slate-200 text-slate-600 hover:text-slate-800 hover:border-slate-300 py-1.5 rounded-lg transition-colors"
              >
                Todos
              </button>
              <button
                onClick={() => setModalEventosOpen(false)}
                className="flex-1 text-sm bg-[#0F3D5E] hover:bg-[#0F3D5E]/90 text-white py-1.5 rounded-lg transition-colors font-medium"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de seleção de tipo (veículo/motorista/rota) */}
      {modalTipoOpen && configTipo && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-80 flex flex-col gap-4 p-5 max-h-[80vh]">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">{configTipo.titulo}</h3>
              <button onClick={() => setModalTipoOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
            </div>
            <input
              type="text"
              placeholder="Buscar..."
              value={buscaTipo}
              onChange={e => setBuscaTipo(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0F3D5E]/20 focus:border-[#0F3D5E] transition-colors"
            />
            <div className="overflow-y-auto flex flex-col gap-1 max-h-64 pr-1">
              {dadosTipo
                .filter(item => configTipo.campo(item).toLowerCase().includes(buscaTipo.toLowerCase()))
                .map((item, idx) => {
                  const valor = configTipo.valor(item);
                  return (
                    <label key={idx} className="flex items-center gap-3 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors text-sm text-slate-600">
                      <input
                        type="checkbox"
                        checked={itensTipoSelecionados.has(valor)}
                        onChange={e => {
                          const newSet = new Set(itensTipoSelecionados);
                          if (e.target.checked) newSet.add(valor);
                          else newSet.delete(valor);
                          setItensTipoSelecionados(newSet);
                        }}
                        className="accent-[#0F3D5E] w-4 h-4 cursor-pointer"
                      />
                      <span>{configTipo.campo(item)}</span>
                    </label>
                  );
                })}
            </div>
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setItensTipoSelecionados(new Set())}
                className="flex-1 text-sm border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300 py-1.5 rounded-lg transition-colors"
              >
                Limpar
              </button>
              <button
                onClick={() => setModalTipoOpen(false)}
                className="flex-1 text-sm bg-[#0F3D5E] hover:bg-[#0F3D5E]/90 text-white py-1.5 rounded-lg transition-colors font-medium"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalhe do evento */}
      {modalDetalheOpen && registroAtual && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-[640px] max-w-full flex flex-col overflow-hidden" style={{ maxHeight: '90vh' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
              <h3 className="font-semibold text-[#0F3D5E] text-sm">Detalhes do Evento</h3>
              <button onClick={fecharDetalhe} className="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
            </div>
            <div ref={mapContainerRef} className="shrink-0 bg-slate-100" style={{ height: 280, minHeight: 280 }} />
            <div className="flex items-center gap-4 px-5 py-2 border-b border-slate-100 shrink-0 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-[#0F3D5E]" /> Trajeto</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-red-400" /> Local do evento</span>
            </div>
            <div className="px-5 py-4 flex flex-col gap-3 text-sm overflow-y-auto">
              <div className="flex flex-col gap-1.5 pb-3 border-b border-slate-100">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Veículo</span>
                  <span className="text-slate-700 text-right font-medium">{registroAtual.veiculo || '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Motorista</span>
                  <span className="text-slate-700 text-right">{registroAtual.motorista || '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Rota</span>
                  <span className="text-slate-700 text-right">{registroAtual.rota || '—'}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 pb-3 border-b border-slate-100">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Evento</span>
                  <span className="bg-sky-50 text-sky-700 text-xs px-2 py-0.5 rounded-full border border-sky-100">{registroAtual.evento || '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Data/Hora</span>
                  <span className="text-slate-700 text-right tabular-nums">{registroAtual.dataHora || '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">IMEI</span>
                  <span className="text-slate-700 text-right font-mono text-xs">{registroAtual.imei || '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Velocidade</span>
                  <span className="text-slate-700 text-right">{registroAtual._posEvento ? `${registroAtual._posEvento.speedKmh} km/h` : '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Lat / Lon</span>
                  <span className="text-slate-700 text-right text-xs">
                    {registroAtual._posEvento ? `${registroAtual._posEvento.lat.toFixed(6)}, ${registroAtual._posEvento.lon.toFixed(6)}` : '—'}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Endereço</span>
                  <span className="text-slate-700 text-right text-xs max-w-[65%]">{registroAtual._endereco || 'carregando…'}</span>
                </div>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-slate-100 shrink-0 flex justify-end">
              <button
                onClick={gerarTermo}
                className="flex items-center gap-2 bg-[#0F3D5E] hover:bg-[#0F3D5E]/90 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                <FileDown className="w-4 h-4" />
                Gerar Termo de Ciência e Responsabilidade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
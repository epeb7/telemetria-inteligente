// client/src/components/Chatbot.tsx
import { useState, useRef, useEffect } from 'react';
import {
  MessageCircle, X, Send, MessageSquare,
  Phone, HelpCircle, FileDown, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAIResponse } from '@/lib/groq';
import { useReport, ReportFilters } from '@/context/ReportContext';
import type { TermoResult } from '@/context/ReportContext';
import {
  listReports,
  isReportTypeId,
  resolveFilters,
  type ReportDefinition,
} from '@/lib/reportService';

// ============================================================================
// TIPOS DE MENSAGEM
// ============================================================================

interface Message {
  role: 'user' | 'bot';
  content: string;
  needsWhatsApp?: boolean;
  /** Exibe o badge verde "PDF baixado". */
  reportGenerated?: boolean;
  /** Exibe a grade de botões de relatório clicáveis. */
  showReportList?: boolean;
}

// ============================================================================
// FAQ LOCAL — respostas instantâneas sem chamada de rede
// ============================================================================

const faqData = [
  {
    keywords: ['velocidade', 'velocímetro', 'km/h'],
    answer: 'A velocidade é capturada em tempo real pelo GPS do veículo. Valores acima do limite geram alertas.',
  },
  {
    keywords: ['bateria', 'carga', 'energia'],
    answer: 'A tensão da bateria é lida pelo sistema elétrico. Abaixo de 25V é aviso; abaixo de 10V é erro crítico.',
  },
  {
    keywords: ['evento', 'freada', 'aceleração', 'curva'],
    answer: 'Freada brusca (≥ −6 km/h/s), aceleração brusca (≥ 4 km/h/s) e curva acentuada (>0,3g). Cada evento desconta pontos do score.',
  },
  {
    keywords: ['score', 'pontuação', 'nota'],
    answer: 'Score começa em 100. Freada: −6pts, Aceleração: −4pts, Curva: −5pts. Quanto maior, melhor a condução.',
  },
  {
    keywords: ['mapa', 'localização', 'rastreio'],
    answer: 'Cada veículo tem sua posição atualizada a cada 3 segundos no mapa.',
  },
  {
    keywords: ['filtro', 'filtrar', 'buscar'],
    answer: 'Use os filtros no cabeçalho para buscar por código, motorista, rota, status ou tipo de evento.',
  },
];

/**
 * Tenta responder localmente. Retorna null para pedidos de relatório,
 * forçando que a IA trate com contexto completo.
 */
function quickLocalAnswer(question: string): string | null {
  const n = question.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (/relat[oó]rio|exportar|pdf|baixar|gerar|enviar|lista.*relat|termo|notifica[cç]/.test(n)) return null;
  for (const item of faqData) {
    for (const kw of item.keywords) {
      if (n.includes(kw)) return item.answer;
    }
  }
  return null;
}

// ============================================================================
// PARSER DE AÇÕES DA IA
// ============================================================================

interface ParsedAction {
  cleanText: string;
  filters: ReportFilters | null;
  showList: boolean;
  /** Nome do motorista para geração de Termo de Aviso, ou null. */
  termoDriver: string | null;
  /** Nome do gestor para o Termo de Aviso (opcional). */
  termoGestor: string | undefined;
}

function parseAction(raw: string): ParsedAction {
  const base = { filters: null, showList: false, termoDriver: null, termoGestor: undefined };

  // <<LIST_REPORTS>>
  if (/<<LIST_REPORTS>>/.test(raw)) {
    return { ...base, cleanText: raw.replace('<<LIST_REPORTS>>', '').trim(), showList: true };
  }

  // <<TERMO_AVISO:{...}>>
  const termoMatch = raw.match(/<<TERMO_AVISO:(\{.*?\})>>/s);
  if (termoMatch) {
    let parsed: { driver?: string; gestor?: string } = {};
    try { parsed = JSON.parse(termoMatch[1]); } catch { /* usa vazio */ }
    return {
      ...base,
      cleanText: raw.replace(/<<TERMO_AVISO:(\{.*?\})>>/s, '').trim(),
      termoDriver: parsed.driver?.trim() || null,
      termoGestor: parsed.gestor?.trim(),
    };
  }

  // <<REPORT:{...}>>
  const match = raw.match(/<<REPORT:(\{.*?\})>>/s);
  if (!match) return { ...base, cleanText: raw.trim() };

  let parsed: Record<string, unknown> = {};
  try { parsed = JSON.parse(match[1]); } catch { /* exporta sem filtros */ }

  const { type, ...rest } = parsed as { type?: string } & ReportFilters;
  const filters = type && isReportTypeId(type)
    ? resolveFilters({ ...rest, type })
    : resolveFilters(rest);

  return { ...base, cleanText: raw.replace(/<<REPORT:(\{.*?\})>>/s, '').trim(), filters };
}

// ============================================================================
// COMPONENTE
// ============================================================================

export function Chatbot() {
  const { generateReport, generateTermo, isGenerating } = useReport();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content:
        'Olá! Sou o assistente virtual da FrotaTrack. Posso responder dúvidas e gerar relatórios PDF filtrados diretamente pelo chat.\n\nDigite "quais relatórios estão disponíveis?" para ver o que posso exportar.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Drag-and-drop
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const chatWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && position.x === 0 && position.y === 0) {
      setPosition({
        x: window.innerWidth - 400 - 20,
        y: window.innerHeight - 600 - 20,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: Math.min(window.innerWidth - 400, Math.max(0, e.clientX - dragStart.x)),
        y: Math.min(window.innerHeight - 500, Math.max(0, e.clientY - dragStart.y)),
      });
    };
    const onUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDragging, dragStart]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --------------------------------------------------------------------------
  // FUNÇÃO PARA FECHAR E LIMPAR O CHAT (ÚNICA ALTERAÇÃO)
  // --------------------------------------------------------------------------
  const handleClose = () => {
    setIsOpen(false);
    // Reseta as mensagens para o estado inicial
    setMessages([
      {
        role: 'bot',
        content:
          'Olá! Sou o assistente virtual da FrotaTrack. Posso responder dúvidas e gerar relatórios PDF filtrados diretamente pelo chat.\n\nDigite "quais relatórios estão disponíveis?" para ver o que posso exportar.',
      },
    ]);
    setInput('');
    setIsLoading(false);
  };

  // --------------------------------------------------------------------------
  // GERAÇÃO DE RELATÓRIO A PARTIR DE UM CHIP CLICADO
  // --------------------------------------------------------------------------

  const handleReportChipClick = async (report: ReportDefinition) => {
    if (isGenerating || isLoading) return;

    // Termo de Aviso requer nome do motorista — preenche o input em vez de gerar.
    if (report.requiresDriver) {
      setInput('Gerar Termo de Aviso do motorista: ');
      return;
    }

    setMessages(prev => [
      ...prev,
      { role: 'user', content: `Gerar: ${report.label}` },
      { role: 'bot', content: `Gerando "${report.label}"...`, reportGenerated: true },
    ]);

    try {
      await generateReport(report.filters);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'bot', content: 'Não foi possível gerar o PDF. Tente novamente.', needsWhatsApp: true },
      ]);
    }
  };

  // --------------------------------------------------------------------------
  // ENVIO DE MENSAGEM
  // --------------------------------------------------------------------------

  const handleSend = async () => {
    if (!input.trim() || isLoading || isGenerating) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);

    // 1. FAQ local instantâneo.
    const localAnswer = quickLocalAnswer(userMsg);
    if (localAnswer) {
      setMessages(prev => [...prev, { role: 'bot', content: localAnswer }]);
      return;
    }

    // 2. Chama a IA.
    setIsLoading(true);
    try {
      const apiMessages = [...messages, { role: 'user' as const, content: userMsg }].map(m => ({
        role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.content,
      }));

      const aiReply = await getAIResponse(apiMessages);
      const { cleanText, filters, showList, termoDriver, termoGestor } = parseAction(aiReply);

      if (showList) {
        setMessages(prev => [
          ...prev,
          { role: 'bot', content: cleanText || 'Aqui estão os relatórios que posso gerar:', showReportList: true },
        ]);

      } else if (termoDriver) {
        // Termo de Aviso — motorista identificado pela IA.
        setMessages(prev => [
          ...prev,
          { role: 'bot', content: cleanText || `Gerando Termo de Aviso para "${termoDriver}"...`, reportGenerated: true },
        ]);
        const result: TermoResult = await generateTermo(termoDriver, termoGestor);
        if (result === 'not_found') {
          setMessages(prev => [
            ...prev,
            { role: 'bot', content: `Não encontrei o motorista "${termoDriver}" na frota. Verifique o nome e tente novamente.` },
          ]);
        } else if (result === 'error') {
          setMessages(prev => [
            ...prev,
            { role: 'bot', content: 'Ocorreu um erro ao gerar o Termo de Aviso. Tente novamente.', needsWhatsApp: true },
          ]);
        }

      } else if (filters !== null) {
        // Relatório geral filtrado.
        setMessages(prev => [
          ...prev,
          { role: 'bot', content: cleanText || 'Gerando seu relatório PDF, aguarde...', reportGenerated: true },
        ]);
        await generateReport(filters);

      } else {
        setMessages(prev => [...prev, { role: 'bot', content: cleanText }]);
      }
    } catch (error) {
      console.error('Erro na IA ou ao gerar PDF:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          content: 'Desculpe, encontrei um problema. Tente novamente ou fale com o suporte.',
          needsWhatsApp: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) handleSend();
  };

  const whatsappLink = 'https://wa.me/message/HXL27HWO6URQB1';
  const isBusy = isLoading || isGenerating;
  const allReports = listReports();

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------

  return (
    <>
      {/* Botão flutuante WhatsApp */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-6 z-50 p-3 bg-green-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        title="Falar no WhatsApp"
      >
        <Phone className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse" />
      </a>

      {/* Botão flutuante do chat */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-50 p-3 bg-gradient-to-r from-[#0F3D5E] to-[#0F3D5E]/90 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105',
          isOpen && 'hidden'
        )}
      >
        <div className="relative">
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        </div>
      </button>

      {/* Janela de chat */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          className="fixed z-50 flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          style={{ left: position.x, top: position.y, width: 380, maxWidth: 'calc(100vw - 20px)' }}
        >
          {/* Header arrastável */}
          <div
            className="chat-drag-handle cursor-grab active:cursor-grabbing flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#0F3D5E] to-[#0F3D5E]/90 text-white select-none"
            onMouseDown={e => {
              if ((e.target as HTMLElement).closest('.chat-drag-handle')) {
                setIsDragging(true);
                setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
              }
            }}
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <MessageSquare className="w-5 h-5" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              </div>
              <span className="font-semibold">Assistente FrotaTrack</span>
              <div className="ml-1 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-[10px] font-bold">
                AI
              </div>
            </div>
            <button
              onClick={handleClose}  // ← CHAMA A FUNÇÃO DE LIMPAR
              className="hover:bg-white/20 rounded-full p-1 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Área de mensagens */}
          <div className="h-[420px] overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[90%] px-3 py-2 rounded-xl text-sm',
                    msg.role === 'user'
                      ? 'bg-[#0F3D5E] text-white rounded-br-none'
                      : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
                  )}
                >
                  {/* Label "Assistente" */}
                  {msg.role === 'bot' && (
                    <div className="flex items-center gap-1 mb-1 text-xs text-slate-400">
                      <HelpCircle className="w-3 h-3" />
                      <span>Assistente</span>
                    </div>
                  )}

                  {/* Texto da mensagem */}
                  {msg.content && (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  )}

                  {/* Grade de relatórios clicáveis */}
                  {msg.showReportList && (
                    <div className="mt-3 grid grid-cols-2 gap-1.5">
                      {allReports.map(report => (
                        <button
                          key={report.id}
                          onClick={() => handleReportChipClick(report)}
                          disabled={isBusy}
                          title={report.description}
                          className={cn(
                            'flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-left text-xs font-medium transition-all',
                            'bg-slate-50 border-slate-200 text-slate-700 hover:bg-[#0F3D5E]/5 hover:border-[#0F3D5E]/30',
                            'disabled:opacity-50 disabled:cursor-not-allowed'
                          )}
                        >
                          <span className="text-base leading-none">{report.emoji}</span>
                          <span className="leading-tight">{report.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Badge PDF baixado */}
                  {msg.reportGenerated && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full w-fit">
                      <FileDown className="w-3 h-3" />
                      PDF baixado automaticamente
                    </div>
                  )}

                  {/* Botão WhatsApp */}
                  {msg.needsWhatsApp && (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full hover:bg-green-600 transition"
                    >
                      <Phone className="w-3 h-3" />
                      Falar com suporte no WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}

            {/* Indicador de carregamento */}
            {isBusy && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-xl rounded-bl-none px-3 py-2 shadow-sm">
                  {isGenerating ? (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Gerando PDF...
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 p-3 flex gap-2 bg-white">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isBusy ? 'Aguarde...' : 'Digite sua dúvida ou peça um relatório...'}
              disabled={isBusy}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3D5E]/20 focus:border-[#0F3D5E] text-sm disabled:bg-slate-100"
            />
            <button
              onClick={handleSend}
              disabled={isBusy || !input.trim()}
              className="p-2 bg-[#0F3D5E] text-white rounded-lg hover:bg-[#0F3D5E]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBusy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
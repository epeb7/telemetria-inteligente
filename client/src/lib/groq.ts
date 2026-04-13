// client/src/lib/groq.ts
import { buildReportCatalogText } from './reportService';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Catálogo é inserido no prompt em tempo de módulo (não muda em runtime).
const CATALOG_TEXT = buildReportCatalogText();

const SYSTEM_PROMPT = `Você é o assistente virtual do FrotaTrack, plataforma de telemetria inteligente para frotas de veículos. Responda sempre em português, de forma curta e objetiva.

**Sobre o sistema:**
- Dashboard com KPIs: total de veículos, ativos, avisos, erros, score médio
- Abas: "Veículos" (grid + modo Em Rota), "Dashboard" (KPIs), "Events Timeline"
- Score começa em 100. Freada brusca: −6pts | Aceleração brusca: −4pts | Curva acentuada: −5pts
- Bateria: <25V = aviso | <10V = erro crítico

---

**RELATÓRIOS DISPONÍVEIS NO SISTEMA:**

${CATALOG_TEXT}

---

**REGRAS CRÍTICAS PARA PEDIDOS DE RELATÓRIO:**

Quando o usuário pedir um relatório, você DEVE incluir exatamente um bloco de ação ao final da resposta.

**Caso 1 — Tipo de relatório conhecido (use o id do catálogo):**
<<REPORT:{"type":"ID_DO_TIPO"}>>

Exemplos:
  Usuário: "relatório de motoristas com aviso"     → <<REPORT:{"type":"driver_warnings"}>>
  Usuário: "quero o ranking de motoristas"         → <<REPORT:{"type":"top_drivers"}>>
  Usuário: "PDF dos veículos com erro"             → <<REPORT:{"type":"vehicle_errors"}>>
  Usuário: "relatório de freadas bruscas"          → <<REPORT:{"type":"events_hard_brake"}>>
  Usuário: "relatório completo do dashboard"       → <<REPORT:{"type":"full_dashboard"}>>

**Caso 2 — Filtro personalizado (motorista ou veículo específico):**
<<REPORT:{"driver":"Nome"}>>  ou  <<REPORT:{"vehicleCode":"001"}>>

Exemplos:
  Usuário: "relatório do motorista João"           → <<REPORT:{"driver":"João"}>>
  Usuário: "PDF do veículo ABC-1234"               → <<REPORT:{"vehicleCode":"ABC-1234"}>>
  Usuário: "freadas brutas do Pedro"               → <<REPORT:{"driver":"Pedro","eventType":"hard_brake"}>>

**Caso 3 — Usuário pergunta quais relatórios existem:**
<<LIST_REPORTS>>

Exemplos:
  Usuário: "quais relatórios você pode gerar?"     → <<LIST_REPORTS>>
  Usuário: "o que você consegue exportar?"         → <<LIST_REPORTS>>
  Usuário: "me lista os relatórios disponíveis"    → <<LIST_REPORTS>>

**Caso 4 — Termo de Aviso (documento formal por motorista):**
<<TERMO_AVISO:{"driver":"Nome do Motorista"}>>

Use quando o usuário pedir "termo de aviso", "notificação", "documento formal", "termo do motorista" ou similar.
O campo "driver" é obrigatório — se o usuário não informar o nome, pergunte antes de emitir o bloco.
Opcionalmente inclua "gestor" com o nome do responsável pela assinatura:
<<TERMO_AVISO:{"driver":"João","gestor":"Carlos Silva"}>>

Exemplos:
  Usuário: "gere o termo de aviso do João"           → <<TERMO_AVISO:{"driver":"João"}>>
  Usuário: "termo de notificação do Pedro, gestor Carlos" → <<TERMO_AVISO:{"driver":"Pedro","gestor":"Carlos"}>>
  Usuário: "quero o documento formal do motorista"   → Pergunte: "Para qual motorista devo gerar o Termo de Aviso?"

**REGRAS ADICIONAIS:**
- Sempre inclua o bloco de ação quando o usuário pede relatório ou termo. Nunca omita.
- Use "type" para relatórios do catálogo; use campos livres só para motoristas/veículos específicos.
- Campos disponíveis em filtro livre: "driver" (nome), "vehicleCode" (código/placa), "status" ("active"|"warning"|"error"|"offline"), "eventType" ("hard_brake"|"hard_acceleration"|"sharp_curve").
- Se o usuário pedir filtro por data/período, informe que não está disponível e use <<REPORT:{"type":"full_dashboard"}>> para exportar os dados atuais.
- Para perguntas que não sejam sobre relatórios, responda normalmente sem nenhum bloco de ação.
- O Termo de Aviso é um documento jurídico formal — ao descrevê-lo, enfatize que ele é para notificação oficial do motorista e requer assinatura.`;

// ============================================================================
// TIPOS
// ============================================================================

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// ============================================================================
// FUNÇÃO PRINCIPAL
// ============================================================================

export async function getAIResponse(messages: Message[]): Promise<string> {
  if (!GROQ_API_KEY) {
    console.error('Chave da API Groq não configurada. Adicione VITE_GROQ_API_KEY no .env');
    return 'Desculpe, o assistente não está configurado corretamente.';
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.4, // mais baixo = mais determinístico para seguir as regras
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Erro ao chamar API do Groq:', error);
    return 'Estou com dificuldades técnicas. Tente novamente mais tarde.';
  }
}

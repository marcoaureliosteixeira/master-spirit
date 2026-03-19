# Claude Code Prompt — Módulo "Evangelho no Lar"
## Master Spirit · Spyrit Systems · spyritsystems.com

---

## CONTEXTO DO PROJETO

Você está desenvolvendo um novo módulo para o **Master Spirit** (masterspirit.spyritsystems.com), um SaaS espiritual hospedado em **Vercel** com auto-deploy via GitHub. O app usa:

- **Supabase** — autenticação (email/senha + Google OAuth) e rastreamento de uso
- **Anthropic API** — protegida via Vercel Serverless Function em `api/chat.js` (chave em `ANTHROPIC_KEY`)
- **ElevenLabs** — síntese de voz (planejada; integrar quando disponível)
- Dois arquivos principais hoje: `index.html` (login/landing) e `app.html` (app principal)
- Stack: HTML/CSS/JS puro, sem frameworks frontend, PowerShell como shell do dev

O Master Spirit já possui dois pilares:
1. **Consolador** — IA que fala como Jesus, sem citações de fontes
2. **Enciclopédia Espiritual** — formato enciclopédico com passagens de fontes

Este prompt especifica o **terceiro pilar: Evangelho no Lar**.

---

## OBJETIVO DO MÓDULO

Criar `evangelho.html` — uma experiência guiada de **Evangelho no Lar** baseada em *O Evangelho Segundo o Espiritismo* de Allan Kardec. O módulo deve:

- Guiar o usuário por uma sessão completa de Evangelho no Lar (15–30 min)
- Apresentar um **facilitador/avatar com IA** diferente a cada sessão
- Permitir leitura **sequencial** (capítulo por capítulo) ou **aleatória** do livro de Kardec
- Usar a **API do Claude (claude-sonnet-4-20250514)** como backbone da IA do facilitador
- Ser autossuficiente — rota protegida, requer login Supabase
- Ser acessível para **idosos**: fontes grandes, alto contraste, alvos de toque generosos (min 48px)

---

## ESTRUTURA DA SESSÃO (Roteiro Padrão)

A sessão tem 5 etapas fixas, cada uma com duração configurável pelo usuário:

```
1. PRECE INICIAL       → 1–3 min  — IA gera oração de abertura espontânea
2. LEITURA             → 5–15 min — Trecho de O Evangelho Segundo o Espiritismo
3. COMENTÁRIOS         → 5–15 min — IA facilita reflexões sobre o trecho
4. VIBRAÇÕES/SILÊNCIO  → 1–5 min  — Contador regressivo + fundo meditativo
5. PRECE FINAL         → 1–3 min  — IA gera oração de encerramento + Pai Nosso
```

---

## FUNCIONALIDADES DETALHADAS

### 1. Configuração da Sessão (`/evangelho.html#config`)

Tela de configuração exibida antes de cada sessão. Opções:

**Frequência e horário**
- Dia(s) da semana preferidos (multi-select: Seg, Ter, Qua, Qui, Sex, Sáb, Dom)
- Horário preferido (seletor HH:MM)
- Duração total desejada: 15 min / 20 min / 30 min (adapta duração de cada etapa)

**Modo de leitura**
- 🔄 **Sequencial** — segue a ordem do livro, capítulo por capítulo, 1 item por vez (estado salvo no Supabase por usuário)
- 🎲 **Aleatório** — IA seleciona um trecho que caiba no tempo disponível; o usuário pode solicitar **nova seleção aleatória** antes de confirmar
- Indicador visual do progresso sequencial: "Cap. III — Item 4 de 12"

**Participantes**
- Número de participantes: 1 / 2–4 / 5+ (afeta o tom dos comentários da IA)
- Contexto familiar livre (opcional): campo de texto de até 200 caracteres para a IA personalizar

**Persistência**
- Salvar configurações como padrão (Supabase `user_preferences`)
- Botão "Iniciar Sessão"

---

### 2. Seleção do Facilitador/Avatar

Antes de cada sessão, o sistema sorteia aleatoriamente um **facilitador** dentre um elenco de avatares. Cada um tem:

| Campo | Descrição |
|-------|-----------|
| `id` | identificador único |
| `nome` | ex.: "Irmã Serafina", "Mentor Elias", "Guia Aurora" |
| `descricao_curta` | 1 linha, ex.: "Antiga missionária espírita do Século XIX" |
| `estilo` | adjetivo de tom: `acolhedor`, `sábio`, `animado`, `contemplativo`, `encorajador` |
| `avatar_svg` | SVG gerado inline (rosto estilizado, não fotorrealista) |
| `prompt_persona` | fragmento de sistema que define voz e personalidade |

Deve haver ao menos **6 facilitadores** implementados. O avatar sorteado é exibido em destaque na tela inicial da sessão com nome, descrição e SVG. O usuário pode **embaralhar** para sortear outro antes de começar.

**Importante:** os avatares são neutros espiritualmente — facilitadores, não entidades. Tom: educador amoroso, não médium.

---

### 3. Tela da Sessão (`/evangelho.html#sessao`)

Layout de tela cheia, fundo escuro suave (tom sépia/azul-noite), sem distrações.

**Header fixo:**
- Nome do facilitador + mini-avatar
- Etapa atual (ex.: "2 de 5 · Leitura")
- Timer da etapa atual (contagem progressiva ou regressiva, configurável)
- Botão "Pausar" e "Encerrar sessão"

**Área central (muda por etapa):**

#### Etapa 1 — Prece Inicial
- IA gera oração via API (streaming) enquanto texto aparece gradualmente
- Fonte grande (min 20px), espaçamento generoso
- Botão "Estamos prontos" para avançar manualmente

#### Etapa 2 — Leitura
- Exibe o **título do capítulo e item** (ex.: "Capítulo III — A lei de progresso · Item 7")
- Texto da passagem com fonte legível (min 20px, line-height 1.8)
- Em modo aleatório: botão "🎲 Outra passagem" visível **antes** de confirmar leitura
- Após o usuário sinalizar conclusão: botão "Li a passagem" → avança
- Referência: "O Evangelho Segundo o Espiritismo — Allan Kardec"

> **Nota técnica:** O texto de Kardec deve estar em um JSON local (`kardec_passagens.json`) ou equivalente. Monte uma estrutura com capítulos 1–28, cada um com título e array de itens. A IA **seleciona qual trecho** ler baseando-se no tempo disponível (aprox. 150 palavras por minuto de leitura silenciosa).

#### Etapa 3 — Comentários / Facilitação
- IA recebe o trecho lido e o contexto da sessão, então:
  1. Oferece uma **reflexão inicial** (3–5 frases)
  2. Propõe **1–2 perguntas** para o grupo discutir
  3. Fica disponível para **chat livre**: campo de texto onde participantes digitam reflexões e a IA responde como o facilitador
- Histórico de mensagens visível, estilo chat
- Botão "Encerrar comentários" → avança

#### Etapa 4 — Vibrações / Silêncio
- Tela minimalista: apenas o avatar do facilitador, uma frase de incentivo curta e um **timer regressivo** em destaque
- Fundo com animação CSS sutil (respiração de luz, pulsação suave)
- Som opcional: botão mudo/ativo (se ElevenLabs disponível, reproduz música ou mantra curto)
- Ao fim do timer: avança automaticamente (com opção de prolongar)

#### Etapa 5 — Prece Final
- IA gera oração de encerramento (streaming)
- Seguida do **Pai Nosso** exibido em texto completo (não gerado por IA)
- Botão "Concluir sessão" → tela de encerramento

---

### 4. Tela de Encerramento

- Mensagem personalizada do facilitador
- Resumo: capítulo/item lido + data/hora
- Botão "Salvar reflexões" (opcional — salva o histórico de comentários no Supabase)
- Botão "Nova sessão" → volta para configuração
- Botão "Voltar ao Master Spirit" → `app.html`

---

### 5. Histórico de Sessões

Tabela `evangelho_sessions` no Supabase:

```sql
CREATE TABLE evangelho_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_date TIMESTAMPTZ DEFAULT now(),
  capitulo INT,
  item INT,
  modo_leitura TEXT CHECK (modo_leitura IN ('sequencial', 'aleatorio')),
  facilitador_id TEXT,
  duracao_minutos INT,
  reflexoes_json JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Progresso sequencial por usuário
CREATE TABLE evangelho_progresso (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  capitulo_atual INT DEFAULT 1,
  item_atual INT DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## ESPECIFICAÇÕES DA IA (API Claude)

### Endpoint
`POST /api/evangelho-chat` — novo Vercel Serverless Function separado de `api/chat.js`.

### System Prompt Base (Facilitador)
```
Você é {facilitador.nome}, {facilitador.descricao_curta}. 
Seu estilo é {facilitador.estilo}.

Você facilita o Evangelho no Lar baseado em "O Evangelho Segundo o Espiritismo" 
de Allan Kardec. Esta é uma prática espírita familiar simples, sem rituais, 
baseada no estudo racional da moral de Jesus.

Diretrizes:
- Fale em primeira pessoa como {facilitador.nome}
- Seja acolhedor, inclusivo e amoroso — nunca dogmático ou impositivo
- Adapte o nível de linguagem para que crianças e idosos entendam
- Nas reflexões, conecte o trecho de Kardec com situações do cotidiano
- Nas perguntas, priorize a vivência pessoal sobre o conhecimento teórico
- Nunca mencione outras religiões de forma negativa
- Número de participantes: {n_participantes}
- Contexto familiar: {contexto_familiar}
- Etapa atual: {etapa}
- Trecho em estudo: {titulo_capitulo} — Item {n_item}: "{texto_trecho}"
```

### Seleção de Trecho Aleatório
Quando `modo_leitura = 'aleatorio'`, enviar à API:
```json
{
  "tarefa": "selecionar_trecho",
  "tempo_disponivel_minutos": 8,
  "palavras_por_minuto": 150,
  "historico_sessoes": ["cap2_item3", "cap7_item1"]
}
```
A IA retorna o `capitulo` e `item` escolhidos + justificativa em 1 frase.

### Streaming
Todas as gerações de prece e comentário devem usar **streaming SSE** para aparecimento gradual do texto.

---

## ARQUITETURA DE ARQUIVOS

```
/
├── api/
│   ├── chat.js                  ← existente (não modificar)
│   └── evangelho-chat.js        ← NOVO: handler do facilitador
├── evangelho.html               ← NOVO: módulo completo
├── kardec_passagens.json        ← NOVO: estrutura de capítulos/itens
├── index.html                   ← existente
└── app.html                     ← existente (adicionar link ao módulo)
```

---

## REQUISITOS TÉCNICOS

### Geral
- Autenticação Supabase obrigatória; redirecionar para `index.html` se não logado
- Supabase CDN carregado ao final do `<body>` com init em `onload`
- Sem frameworks — HTML/CSS/JS puro
- Compatível com Chrome, Safari, Firefox (mobile e desktop)

### UX / Acessibilidade (prioridade para idosos)
- Fonte base: mínimo 18px, escalável via configuração
- Alvos de toque: mínimo 48×48px
- Contraste WCAG AA em todos os textos
- Animações respeitam `prefers-reduced-motion`
- Feedback visual claro em cada ação (loading, sucesso, erro)

### Visual / Identidade
- Paleta: tons sépia, dourado suave, azul-noite — evitar branco frio
- Avatar SVG: rostos estilizados, não fotorrealistas; expressão serena
- Tipografia: serif para passagens de Kardec; sans-serif para interface
- Logo Spyrit Systems no rodapé (base64, igual ao `app.html`)
- Transições suaves entre etapas (fade 400ms)

### Performance
- `kardec_passagens.json` carregado via `fetch` na inicialização
- Respostas da IA em cache local (`sessionStorage`) para evitar re-chamadas
- Sem dependências externas além do Supabase CDN e da API interna

---

## DADOS INICIAIS: `kardec_passagens.json`

Monte o JSON com a seguinte estrutura (preencher ao menos Caps. 1–5 completos como amostra):

```json
{
  "titulo": "O Evangelho Segundo o Espiritismo",
  "autor": "Allan Kardec",
  "capitulos": [
    {
      "numero": 1,
      "titulo": "Não vim destruir a lei",
      "itens": [
        {
          "numero": 1,
          "texto": "...",
          "palavras": 120
        }
      ]
    }
  ]
}
```

---

## FLUXO DE NAVEGAÇÃO

```
index.html (login)
    ↓
app.html (menu principal)
    ↓ [botão "Evangelho no Lar"]
evangelho.html#config (configuração)
    ↓ [Iniciar Sessão]
evangelho.html#facilitador (sorteio do avatar)
    ↓ [Confirmar / Embaralhar]
evangelho.html#sessao (sessão ativa — 5 etapas)
    ↓ [Concluir]
evangelho.html#encerramento (resumo)
    ↓
app.html
```

---

## ENTREGÁVEIS ESPERADOS

1. **`evangelho.html`** — arquivo completo e autossuficiente
2. **`api/evangelho-chat.js`** — serverless function com suporte a streaming
3. **`kardec_passagens.json`** — ao menos Caps. 1–5 completos
4. **Migrations SQL** — scripts para criar as tabelas `evangelho_sessions` e `evangelho_progresso` no Supabase
5. **Diff para `app.html`** — adicionar card/botão "Evangelho no Lar" no menu principal

---

## NOTAS FINAIS

- **Verificar** que todos os elementos visuais (logo, footer, botões) estão presentes antes de finalizar
- Funções globais expostas via `window.fnName` para evitar conflitos de escopo em `onclick`
- Nenhum `JSON.stringify` com aspas dentro de atributos `onclick` — usar padrão `data-*` ou `window.fn(id)`
- O módulo deve funcionar de forma **completamente independente** — um usuário pode ir direto a `evangelho.html` e ser redirecionado ao login se necessário
- Testar fluxo completo: login → configurar → sortear facilitador → sessão de 5 etapas → encerramento → salvar no Supabase

---

*Prompt elaborado para Claude Code — Master Spirit · Spyrit Systems*  
*Versão: 1.0 · Data: Março 2026*

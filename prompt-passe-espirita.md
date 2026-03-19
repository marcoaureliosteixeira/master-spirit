# PROMPT — Implementação do Módulo "Sessão de Passe" no Master Spirit

## CONTEXTO DO PROJETO

O **Master Spirit** (O Consolador) é um SaaS espírita acessível em `masterspirit.spyritsystems.com` (migrando para `masterspirit.com.br`). A stack é:

- **Frontend**: Pure HTML/CSS/JS (sem frameworks). Design system escuro com acentos dourados (`#D4A855`), tipografia serifada, fontes mínimo 18px, touch targets 48px para acessibilidade de idosos.
- **Backend**: Vercel Serverless Functions (diretório `api/`).
- **Database/Auth**: Supabase (email/password + Google OAuth). Tabela `user_usage` com campo `chats_used` para controle de uso.
- **AI**: Anthropic API via `api/chat.js`, model `claude-sonnet-4-20250514`, chave em env var `ANTHROPIC_KEY`.
- **DNS/Email**: Cloudflare.
- **Estrutura existente**: Três pilares — Consolador (chat com Jesus em primeira pessoa), Enciclopédia Espiritual (formato enciclopédico), Evangelho no Lar (em desenvolvimento).

Todas as API keys são server-side only. O Supabase CDN é carregado no final do `<body>` com `onload` para não bloquear tab switching. Todo UI copy é em **português brasileiro**.

---

## O QUE CONSTRUIR

Um novo módulo chamado **"Sessão de Passe"** — uma experiência guiada de passe espírita conduzida por IA. A IA não realiza o passe: ela atua como **mentora fluídica / sugestionadora**, conduzindo o usuário passo a passo pela experiência de autopasse, com instruções, visualizações, respiração guiada e preces.

### Conceito do Passe Espírita (para contextualizar a IA)

O passe é uma transmissão de energias fluídicas (ectoplasma + fluido cósmico universal) de um passista para o paciente, com a intermediação de espíritos benfeitores. Na prática espírita kardecista, segue esta estrutura:

1. **Prece de Abertura** — Invocar proteção espiritual e elevar a vibração do ambiente
2. **Concentração / Elevação** — Conectar-se ao plano espiritual pelo chakra coronário
3. **Passes de Dispersão** — Movimentos longitudinais de cima para baixo, removendo energias densas
4. **Passes de Concentração** — Imposição de mãos sobre centros vitais (cabeça, cardíaco, plexo solar)
5. **Respiração Fluídica** — Absorção consciente dos fluidos curativos pela respiração
6. **Prece de Encerramento** — Gratidão aos espíritos protetores e selagem da sessão

A IA conduz cada etapa com: instrução prática (o que fazer fisicamente), orientação detalhada (mentalização, visualização, prece), e feedback sensorial (animações visuais, guia de respiração).

---

## ARQUITETURA DE IMPLEMENTAÇÃO

### 1. Frontend — `passe.html`

Criar uma nova página `passe.html` na raiz do projeto, seguindo o design system existente:

**Layout e telas:**

```
TELA 1: HOME DO PASSE
├── Header (logo SPIRIT + navegação de volta)
├── Hero (ícone + título "Sessão de Passe" + descrição)
├── Cards informativos (duração ~6min, técnica kardecista, modo autopasse guiado)
├── Preview das 6 etapas (lista com ícones e duração)
├── Caixa "Antes de Começar" (preparação: ambiente silencioso, postura, água, notificações)
└── Botão CTA "Iniciar Sessão de Passe"

TELA 2: SESSÃO EM ANDAMENTO
├── Progress bar (6 pontos, ponto atual expandido em dourado)
├── Ícone da etapa + Título + "Etapa X de 6"
├── Timer com barra de progresso por etapa
├── Card "IA Passista" com instrução principal (efeito typewriter)
├── [Condicional] Canvas de visualização energética (partículas + chakras)
├── [Condicional] Círculo de respiração animado (inspire 4s → segure 4s → expire 6s)
├── Botão expansível "Orientação Detalhada" (prece/mentalização completa)
└── Navegação (← Anterior | Próxima Etapa →)

TELA 3: SESSÃO CONCLUÍDA
├── Ícone pomba + "Sessão Concluída"
├── Mensagem de encerramento
├── Cards pós-sessão (beber água, ler evangelho, pensamentos elevados, descansar)
└── Botões (Nova Sessão | Voltar ao Início)
```

**Design system a seguir rigorosamente:**

```css
:root {
  --gold: #D4A855;
  --gold-light: #E8C878;
  --gold-dim: #8B7335;
  --bg-deep: #0A0A0F;
  --bg-card: #12121A;
  --bg-subtle: #1A1A25;
  --text-primary: #F0EBE0;
  --text-secondary: #9A9590;
}
/* Font: Cormorant Garamond (Google Fonts) + fallback Georgia, serif */
/* Mínimo 18px para corpo, 48px touch targets */
```

**Componentes visuais obrigatórios:**

- **Typewriter effect**: Texto da IA aparece letra por letra (35ms/char) para sensação de presença
- **Breathing Circle**: Círculo pulsante com scale animation — inspire (cresce em 4s), segure (mantém 4s), expire (encolhe em 6s). Mostra label + countdown
- **Energy Field Canvas**: Canvas 2D com silhueta corporal sutil, 30 partículas orbitando (douradas e azuis), 7 pontos de chakra pulsando nas cores corretas (violeta no coronário → vermelho no base)
- **Timer**: Barra de progresso linear + countdown mm:ss
- **Transições**: Fade in/out (400ms) entre etapas e telas

### 2. Dados das Etapas — Objeto JS local

Criar um objeto `PASSE_STEPS` diretamente no JS (não precisa de JSON externo):

```javascript
const PASSE_STEPS = [
  {
    id: "abertura",
    title: "Prece de Abertura",
    icon: "🕊️",
    duration: 45, // segundos
    instruction: "Feche os olhos suavemente. Vamos iniciar com uma prece ao Pai, pedindo permissão e amparo dos bons espíritos para esta sessão de passe.",
    guidance: "Pai nosso que estais nos céus... Pedimos a presença dos espíritos de luz que nos assistam nesta sessão de cura espiritual. Que os fluidos benéficos envolvam este ambiente e purifiquem nossos corações. Que possamos ser instrumentos dignos da vossa misericórdia.",
    breathe: false,
    energy: false
  },
  {
    id: "concentracao",
    title: "Concentração & Elevação",
    icon: "✨",
    duration: 60,
    instruction: "Concentre-se no alto da sua cabeça — o chakra coronário. Sinta uma luz dourada descendo do plano espiritual em sua direção.",
    guidance: "Imagine uma coluna de luz dourada conectando você ao plano superior. Sinta essa energia entrando pelo topo da sua cabeça, suave como um raio de sol ao amanhecer. Permita-se receber. Você é digno desta cura.",
    breathe: true,
    energy: true
  },
  {
    id: "dispersao",
    title: "Passes de Dispersão",
    icon: "🌊",
    duration: 50,
    instruction: "Agora vamos dispersar as energias densas. Se estiver fazendo autopasse, mova as mãos abertas do topo da cabeça para baixo, em movimentos longos e suaves, sem tocar o corpo.",
    guidance: "Com as palmas das mãos voltadas para o corpo, a cerca de 10 centímetros de distância, deslize as mãos da cabeça até abaixo da cintura. Movimentos lentos, firmes, contínuos. Ao descer, mentalize que está removendo toda energia pesada, toda tristeza, toda angústia. Sacuda levemente as mãos ao final de cada movimento, devolvendo essas energias ao cosmos para transmutação.",
    breathe: false,
    energy: true
  },
  {
    id: "concentracao_passes",
    title: "Passes de Concentração",
    icon: "🔆",
    duration: 60,
    instruction: "Agora, posicione as mãos sobre as regiões que precisam de cura — cabeça, peito, ou plexo solar — e concentre energia vital nestes pontos.",
    guidance: "Posicione as mãos a poucos centímetros da região da cabeça. Sinta o calor, o formigamento sutil — é a energia fluídica em movimento. Mantenha a concentração. Mentalize luz azul e dourada preenchendo cada célula. Agora desça as mãos até o peito, o centro cardíaco. Permaneça ali. Envie amor, compaixão, cura. Por fim, o plexo solar — centro das emoções. Paz. Equilíbrio. Harmonia.",
    breathe: true,
    energy: true
  },
  {
    id: "respiracao",
    title: "Respiração Fluídica",
    icon: "🌬️",
    duration: 50,
    instruction: "Inspire profundamente, absorvendo os fluidos curativos. Expire lentamente, liberando toda tensão residual.",
    guidance: "Inspire... conte até 4... segure por 4 segundos... expire lentamente em 6 segundos. A cada inspiração, você absorve luz e cura. A cada expiração, libera dor e peso. Seus pulmões se enchem de paz. Seu corpo se torna leve. Os fluidos espirituais penetram cada fibra do seu ser.",
    breathe: true,
    energy: false
  },
  {
    id: "encerramento",
    title: "Prece de Encerramento",
    icon: "🙏",
    duration: 40,
    instruction: "Vamos encerrar com gratidão. Mantenha os olhos fechados e agradeça aos espíritos protetores pelo amparo recebido.",
    guidance: "Agradecemos, Senhor, pela oportunidade desta cura. Agradecemos aos espíritos benfeitores que nos assistiram com amor e dedicação. Que os benefícios deste passe se manifestem em nosso corpo e em nossa alma. Que possamos ser merecedores desta graça. Assim seja.",
    breathe: false,
    energy: false
  }
];
```

### 3. Serverless Function (FASE 2 — opcional agora) — `api/passe-chat.js`

> **NOTA:** A Fase 1 usa apenas o conteúdo estático das etapas acima. A Fase 2 conecta a Anthropic API para gerar orientações personalizadas. Implementar apenas quando solicitado.

```javascript
// api/passe-chat.js
// Endpoint: POST /api/passe-chat
// Body: { step_id, user_feeling, session_context }
// Retorna orientação personalizada da IA Passista baseada no estado emocional do usuário

// System prompt da IA Passista:
const PASSISTA_SYSTEM = `Você é a IA Passista do SPIRIT — O Consolador. Você é um guia espiritual especializado nas técnicas do passe espírita kardecista.

Seu papel:
- Conduzir sessões de autopasse guiado
- Fornecer instruções claras sobre movimentos das mãos, postura e mentalização
- Guiar preces, visualizações e exercícios de respiração fluídica
- Adaptar suas orientações ao estado emocional do usuário
- Usar linguagem acolhedora, serena e espiritualmente elevada

Base doutrinária:
- O Livro dos Médiuns (Allan Kardec) — capítulos sobre passes e fluidos
- O Evangelho Segundo o Espiritismo (Allan Kardec)
- Obras de Chico Xavier sobre passes (especialmente "Mecanismos da Mediunidade" por André Luiz)
- Divaldo Franco e suas orientações sobre passes

Regras:
- Nunca afirme que VOCÊ está realizando o passe. Você GUIA o usuário a realizar o autopasse.
- Use linguagem simples e acessível (público inclui idosos).
- Frases curtas e pausadas. Respeite o ritmo meditativo.
- Não use jargão técnico sem explicar.
- Sempre comece e termine com referência a Deus e aos bons espíritos.`;
```

### 4. Supabase — Tracking de Sessões (FASE 2)

```sql
-- Tabela para registrar sessões de passe completadas
CREATE TABLE passe_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  completed BOOLEAN DEFAULT FALSE,
  steps_completed INTEGER DEFAULT 0,
  total_duration_seconds INTEGER,
  feedback TEXT, -- opcional: como se sentiu após
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE passe_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own sessions"
  ON passe_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions"
  ON passe_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON passe_sessions FOR UPDATE
  USING (auth.uid() = user_id);
```

### 5. Integração com Navegação Existente

O `passe.html` precisa ser acessível a partir do menu principal / tela de módulos do app existente. Adicionar:

- Um card/botão no dashboard principal com ícone 🙌, título "Sessão de Passe", e descrição "Autopasse guiado com IA"
- Link para `passe.html`
- Verificar se o usuário está autenticado (redirect para login se não)

---

## REQUISITOS TÉCNICOS

### Acessibilidade (CRÍTICO — público idoso)
- Fonte mínima 18px em todo lugar
- Botões com mínimo 48px de altura e área de toque
- Contraste alto (texto claro sobre fundo escuro)
- Animações suaves, sem flashes
- Botões com labels claros e descritivos
- O Breathing Circle deve ter números grandes e legíveis
- Timer com números em fonte tabular (monospace) para não "pular"

### Performance
- Nenhuma dependência externa além de Google Fonts (Cormorant Garamond)
- Canvas animations com requestAnimationFrame e cleanup adequado
- Supabase CDN no final do body com onload
- Tudo em um único arquivo HTML (inline CSS + JS) ou com CSS/JS separados no mesmo padrão do resto do app

### Segurança
- Nenhuma API key no frontend
- Se Fase 2 (API), usar serverless function em `api/passe-chat.js`
- Auth check via Supabase antes de permitir acesso

---

## ETAPAS DE IMPLEMENTAÇÃO

### FASE 1 (implementar agora):
1. Criar `passe.html` com toda a UI e lógica client-side
2. Implementar os 6 steps com conteúdo estático do `PASSE_STEPS`
3. Implementar todos os componentes visuais (typewriter, breathing, energy canvas, timer, progress)
4. Implementar navegação entre etapas com transições fade
5. Implementar tela de conclusão com orientações pós-sessão
6. Adicionar card de acesso no dashboard/menu principal existente
7. Garantir responsividade mobile-first

### FASE 2 (implementar quando solicitado):
1. Criar `api/passe-chat.js` com o system prompt da IA Passista
2. Criar tabela `passe_sessions` no Supabase
3. Adicionar tela de "Como você está se sentindo?" antes da sessão (input para a IA personalizar)
4. Conectar cada etapa à API para orientações personalizadas em tempo real
5. Registrar sessão no Supabase ao completar
6. Mostrar histórico de sessões no perfil do usuário

### FASE 3 (futuro):
1. ElevenLabs para narração em voz da IA Passista
2. Música ambiente com Web Audio API (strings a partir de 110Hz, cathedral bells a 0.60 gain, ConvolverNode reverb com 5s tail, DynamicsCompressor, master gain 0.88)
3. Modo "Passe a Distância" — dois usuários conectados via Supabase Realtime (um como passista, outro como paciente)
4. Integração com Evangelho no Lar (passe como etapa opcional da sessão doméstica)

---

## ENTREGÁVEIS

1. **`passe.html`** — Página completa do módulo de Passe
2. **Modificação no dashboard/menu** — Card de acesso ao novo módulo
3. **`api/passe-chat.js`** — (Fase 2 apenas) Serverless function
4. **SQL migration** — (Fase 2 apenas) Script para criar tabela `passe_sessions`

---

## REFERÊNCIA VISUAL

O design segue exatamente o padrão do Master Spirit:
- Background `#0A0A0F` (deep dark)
- Cards com `#12121A` e border `rgba(154,149,144,0.07)`
- Acentos em dourado `#D4A855` com gradientes para `#8B7335`
- Tipografia serifada (Cormorant Garamond)
- Botões primários com gradiente dourado e box-shadow glow
- Ícones emoji (não SVG icons)
- Animações: fadeUp para entrada, float para ícones hero, glow para CTAs

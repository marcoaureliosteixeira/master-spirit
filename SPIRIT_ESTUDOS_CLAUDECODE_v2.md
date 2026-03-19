# SPIRIT — Aba "Estudos": Salas & Grupos de Estudo
## Prompt completo para Claude Code

---

Você está implementando a aba **Estudos** no app **SPIRIT** (Master Spirit — O Consolador),
produto da **Spyrit Systems**. Esta feature cobre o ciclo completo:
catálogo de salas → criação de grupo → sessão ao vivo com professor IA.

### Stack do projeto
- Next.js 14 (App Router, TypeScript)
- Supabase (Auth, Postgres, Realtime, RLS)
- Stripe (billing — pacote Grupos de Estudo)
- Anthropic SDK (`claude-sonnet-4-20250514`)
- Tailwind CSS + design system do SPIRIT (tema escuro, tons dourados #D4A855)
- Vercel (deploy)
- Resend (emails transacionais)

---

## Arquitetura conceitual

```
study_rooms        ← "a sala" — livro + currículo gerado pela IA
                      pode ser default (Spyrit) ou personalizada (usuário)

study_groups       ← "a turma" — criada DENTRO de uma sala
                      um room pode ter N grupos simultâneos

study_group_members ← participantes de um grupo
study_sessions     ← execuções reais de cada sessão do currículo
study_messages     ← chat ao vivo: professor IA + alunos
```

**Fluxo do usuário:**
```
Aba Estudos
  ├── Meus Grupos          ← grupos que participa ou criou
  └── Catálogo de Salas
        ├── Salas Oficiais SPIRIT (pré-criadas, currículo revisado)
        └── Criar Sala Personalizada (IA gera currículo na hora)
              └── [Selecionar Sala] → Ver currículo + carga horária
                    └── [Criar Grupo] → Nome + Convites
                          └── Dashboard do Grupo
                                └── [Iniciar Sessão] → Sala ao vivo
```

---

## 1. Banco de dados — `supabase/migrations/YYYYMMDD_estudos.sql`

```sql
-- ─────────────────────────────────────────────
-- SALAS DE ESTUDO
-- ─────────────────────────────────────────────
create table study_rooms (
  id            uuid primary key default gen_random_uuid(),
  book_id       text not null,          -- slug do livro ex: "livro-dos-espiritos"
  book_title    text not null,
  book_author   text not null,
  book_year     int,
  cover_emoji   text default '📖',
  description   text,
  estimated_hours int,
  curriculum    jsonb,                  -- gerado pela IA ou inserido via seed
  is_default    boolean default false,  -- TRUE = sala oficial Spyrit Systems
  status        text default 'published', -- published | draft
  created_by    uuid references auth.users(id) null, -- NULL = sistema
  created_at    timestamptz default now()
);

-- ─────────────────────────────────────────────
-- GRUPOS DE ESTUDO
-- ─────────────────────────────────────────────
create table study_groups (
  id            uuid primary key default gen_random_uuid(),
  room_id       uuid references study_rooms(id) not null,
  host_id       uuid references auth.users(id) not null,
  name          text not null,
  description   text,
  status        text default 'active',  -- active | paused | completed
  invite_token  text unique default encode(gen_random_bytes(16), 'hex'),
  created_at    timestamptz default now()
);

-- ─────────────────────────────────────────────
-- MEMBROS
-- ─────────────────────────────────────────────
create table study_group_members (
  id                      uuid primary key default gen_random_uuid(),
  group_id                uuid references study_groups(id) on delete cascade,
  user_id                 uuid references auth.users(id) null,
  email                   text not null,
  role                    text default 'member',    -- host | member
  invite_status           text default 'pending',   -- pending | accepted | declined
  stripe_subscription_id  text,
  joined_at               timestamptz,
  created_at              timestamptz default now(),
  unique(group_id, email)
);

-- ─────────────────────────────────────────────
-- SESSÕES AO VIVO
-- ─────────────────────────────────────────────
create table study_sessions (
  id             uuid primary key default gen_random_uuid(),
  group_id       uuid references study_groups(id),
  session_number int not null,          -- aponta para curriculum.sessions[n]
  started_by     uuid references auth.users(id),
  started_at     timestamptz,
  ended_at       timestamptz,
  status         text default 'scheduled' -- scheduled | live | completed
);

-- ─────────────────────────────────────────────
-- MENSAGENS DA SESSÃO
-- ─────────────────────────────────────────────
create table study_messages (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid references study_sessions(id),
  sender_type  text not null,   -- "professor" | "student"
  sender_id    uuid null,       -- null = IA
  sender_name  text,
  content      text not null,
  created_at   timestamptz default now()
);

-- ─────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────
alter table study_rooms enable row level security;
alter table study_groups enable row level security;
alter table study_group_members enable row level security;
alter table study_sessions enable row level security;
alter table study_messages enable row level security;

-- Salas: qualquer autenticado vê published; owner vê suas drafts
create policy "salas published visíveis"
  on study_rooms for select
  using (status = 'published' or created_by = auth.uid());

-- Grupos: apenas membros com invite aceito ou o host
create policy "grupos apenas membros"
  on study_groups for select
  using (
    auth.uid() = host_id
    or exists (
      select 1 from study_group_members m
      where m.group_id = study_groups.id
        and m.user_id = auth.uid()
        and m.invite_status = 'accepted'
    )
  );

-- Membros: host vê todos; membro vê a si mesmo
create policy "membros visíveis"
  on study_group_members for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from study_groups g
      where g.id = group_id and g.host_id = auth.uid()
    )
  );

-- Sessões e mensagens: mesma lógica de membro do grupo
create policy "sessões do grupo"
  on study_sessions for select
  using (
    exists (
      select 1 from study_groups g
      left join study_group_members m on m.group_id = g.id
      where g.id = study_sessions.group_id
        and (g.host_id = auth.uid() or (m.user_id = auth.uid() and m.invite_status = 'accepted'))
    )
  );

create policy "mensagens da sessão"
  on study_messages for select
  using (
    exists (
      select 1 from study_sessions s
      join study_groups g on g.id = s.group_id
      left join study_group_members m on m.group_id = g.id
      where s.id = study_messages.session_id
        and (g.host_id = auth.uid() or (m.user_id = auth.uid() and m.invite_status = 'accepted'))
    )
  );
```

---

## 2. Seed — Salas Oficiais SPIRIT

### `supabase/seed/study_rooms_default.sql`

Insira as 8 salas oficiais com currículo completo pré-gerado.
Para cada sala, o campo `curriculum` é um JSONB com a estrutura:

```json
{
  "overview": "descrição do curso",
  "totalSessions": 10,
  "totalHours": 24,
  "sessions": [
    {
      "number": 1,
      "title": "Introdução e Contexto Histórico",
      "topics": ["Vida de Allan Kardec", "O movimento espírita no século XIX"],
      "durationMinutes": 90,
      "type": "lecture"
    }
  ]
}
```

**As 8 salas oficiais (is_default = true, created_by = NULL):**

| book_id | book_title | book_author | book_year | estimated_hours | sessions |
|---|---|---|---|---|---|
| livro-dos-espiritos | O Livro dos Espíritos | Allan Kardec | 1857 | 40 | 14 |
| evangelho-espiritismo | O Evangelho Segundo o Espiritismo | Allan Kardec | 1864 | 24 | 10 |
| livro-dos-mediuns | O Livro dos Médiuns | Allan Kardec | 1861 | 28 | 12 |
| a-genese | A Gênese | Allan Kardec | 1868 | 22 | 10 |
| nosso-lar | Nosso Lar | André Luiz / Chico Xavier | 1944 | 18 | 8 |
| ceu-e-inferno | O Céu e o Inferno | Allan Kardec | 1865 | 20 | 9 |
| caminho-verdade-vida | Caminho, Verdade e Vida | Emmanuel / Chico Xavier | 1938 | 16 | 8 |
| os-mensageiros | Os Mensageiros | André Luiz / Chico Xavier | 1944 | 16 | 8 |

Para cada sala, gere o currículo chamando a Claude API localmente antes de inserir no seed:

```typescript
// scripts/generate-default-curricula.ts
// Execute: npx ts-node scripts/generate-default-curricula.ts
// Salva os JSONs em supabase/seed/curricula/*.json
// Depois insere no SQL seed

import Anthropic from "@anthropic-ai/sdk"
const client = new Anthropic()

async function generateCurriculum(book: Book) {
  const msg = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [{
      role: "user",
      content: `Crie um plano de estudos detalhado para o livro "${book.title}" de ${book.author} (${book.year}).
Retorne SOMENTE JSON válido:
{
  "overview": "objetivo do curso em 2 frases",
  "totalSessions": ${book.sessions},
  "totalHours": ${book.estimatedHours},
  "sessions": [
    {
      "number": 1,
      "title": "título da sessão",
      "topics": ["tópico 1", "tópico 2", "tópico 3"],
      "durationMinutes": 90,
      "type": "lecture"
    }
  ]
}
Tipos disponíveis: lecture (aula expositiva), discussion (debate), practice (exercício), review (revisão).
Baseie-se no conteúdo real e estrutura do livro. Escreva em português.`
    }]
  })
  return JSON.parse(msg.content[0].text)
}
```

---

## 3. API Routes — `app/api/estudos/`

### `POST /api/estudos/rooms/generate-curriculum`
Chamada quando usuário cria sala personalizada (não default).
- Recebe: `{ bookId, bookTitle, bookAuthor, bookYear }`
- Chama Claude API com o prompt de geração de currículo
- Retorna: `{ curriculum }` — ainda não salva no banco
- O salvamento ocorre apenas ao criar o grupo

### `POST /api/estudos/groups/create`
- Recebe: `{ roomId?, bookData?, curriculum?, name, description, inviteEmails[] }`
- Se `roomId` fornecido → usa sala existente (default ou custom já criada)
- Se `bookData` fornecido → cria nova `study_room` primeiro, depois o grupo
- Insere `study_groups` com `room_id`
- Insere host em `study_group_members` com `role: "host"`, `invite_status: "accepted"`
- Para cada email em `inviteEmails`:
  - Busca se existe em `auth.users` por email
  - Se existe → insere membro com `user_id`, `invite_status: "pending"`, dispara notificação interna
  - Se não existe → insere com `user_id: null`, dispara email de convite externo com link `https://spirit.app/convite/{invite_token}?email={email}`
- Retorna grupo criado com membros

### `GET /api/estudos/rooms`
- Query params: `?type=default|custom|all`
- Retorna lista de salas publicadas
- Inclui `curriculumSummary` (overview + totalSessions + totalHours) sem o array completo de sessões

### `GET /api/estudos/rooms/[roomId]`
- Retorna sala completa com curriculum JSONB completo

### `GET /api/estudos/groups`
- Retorna grupos do usuário autenticado (host ou membro aceito)
- Inclui: room info, progresso (sessões concluídas / total), próxima sessão, contagem de membros

### `GET /api/estudos/groups/[groupId]`
- Retorna grupo completo + membros + room + sessões com status

### `POST /api/estudos/groups/[groupId]/sessions/start`
- Recebe: `{ sessionNumber }`
- Apenas host pode chamar (verificar via RLS + validação explícita)
- Cria/atualiza registro em `study_sessions` com `status: "live"`, `started_at: now()`
- Emite broadcast Supabase Realtime no canal `group:{groupId}`:
  ```json
  { "event": "session_started", "payload": { "sessionNumber": 1 } }
  ```

### `POST /api/estudos/groups/[groupId]/sessions/[sessionNumber]/teach`
- Apenas host pode chamar
- Busca o segmento do currículo (`curriculum.sessions[sessionNumber - 1]`)
- Chama Claude API com streaming:
  ```typescript
  const systemPrompt = `Você é um professor espiritual sábio e didático ministrando uma aula sobre "${room.book_title}".
Fale sempre em primeira pessoa como professor, de forma envolvente, usando exemplos e analogias acessíveis.
Ao final, indique que vai abrir para perguntas da turma.`

  const userPrompt = `Apresente o segmento ${sessionNumber}: "${session.title}".
Tópicos a cobrir: ${session.topics.join(", ")}.
Duração estimada: ${session.durationMinutes} minutos de aula.
Seja fluido, didático e inspirador. Máximo 300 palavras.`

  const stream = await anthropic.messages.stream({ model, system, messages })
  ```
- Cada chunk de texto: salva em `study_messages` (acumula) E faz broadcast via Realtime:
  ```json
  { "event": "professor_chunk", "payload": { "text": "..." } }
  ```
- Ao finalizar: broadcast `{ "event": "teaching_done" }`

### `POST /api/estudos/groups/[groupId]/sessions/[sessionNumber]/question`
- Recebe: `{ question, askerName, askerId }`
- Salva pergunta em `study_messages` com `sender_type: "student"`
- Chama Claude para responder:
  ```typescript
  const prompt = `O aluno ${askerName} perguntou sobre "${session.title}": "${question}"
Responda como professor espiritual — com clareza, afeto e sabedoria.
Máximo 120 palavras.`
  ```
- Salva resposta e faz broadcast para todos

### `POST /api/estudos/invite/accept`
- Recebe: `{ token, email }` (token = invite_token do grupo)
- Se usuário não autenticado → `{ redirect: "/auth?next=/convite?token=..." }`
- Busca grupo pelo token
- Verifica se usuário tem assinatura ativa do pacote Grupos
- Se não tem → `{ redirect: "/planos?feature=grupos&groupToken=..." }`
- Se tem → atualiza membro: `invite_status: "accepted"`, `user_id`, `joined_at`
- Retorna `{ groupId }` para redirecionar ao dashboard do grupo

### Stripe Webhook — `app/api/webhooks/stripe/route.ts`
```typescript
case "checkout.session.completed":
  const { groupToken, email } = session.metadata
  // Ativa o membro no grupo
  await supabase
    .from("study_group_members")
    .update({
      invite_status: "accepted",
      stripe_subscription_id: session.subscription,
      joined_at: new Date().toISOString(),
      user_id: session.client_reference_id  // user_id passado no checkout
    })
    .match({ invite_token_ref: groupToken, email })
  break
```

---

## 4. Aba Estudos — estrutura de páginas

### `app/(app)/estudos/`

```
estudos/
├── page.tsx                          ← hub principal (Meus Grupos + acesso ao catálogo)
├── salas/
│   ├── page.tsx                      ← catálogo de salas
│   └── [roomId]/
│       └── page.tsx                  ← detalhe da sala + currículo completo
├── criar-sala/
│   └── page.tsx                      ← wizard: escolher livro → IA gera currículo
├── grupos/
│   ├── novo/
│   │   └── page.tsx                  ← wizard: configurar grupo + convidar
│   └── [groupId]/
│       ├── page.tsx                  ← dashboard do grupo
│       └── sessao/
│           └── [number]/
│               └── page.tsx          ← sala ao vivo
```

---

## 5. Componentes e UX de cada página

### `estudos/page.tsx` — Hub principal

**Layout em duas seções:**

**Seção "Meus Grupos"** (topo):
- Se não tem grupos: empty state elegante com CTA "Explorar Salas de Estudo"
- Se tem grupos: cards horizontais scrolláveis mostrando:
  - Emoji + título do livro
  - Nome do grupo
  - Progresso: barra + "X de Y sessões concluídas"
  - Membros: N avatars sobrepostos
  - Status da próxima sessão
  - Botão "Entrar" → `/estudos/grupos/{id}`

**Seção "Catálogo de Salas"** (abaixo):
- Título: "Salas Oficiais SPIRIT ✦"
- Subtítulo: "Curadoria espírita — currículo revisado e pronto para uso"
- Grid de cards de salas (ver design abaixo)
- Link "Criar Sala Personalizada →" para usuários de planos superiores

**Card de sala:**
- Background com gradiente baseado no `cover_emoji` / cor do livro
- Badge "✦ Oficial" para salas default
- Emoji cover (grande)
- Título + autor + ano
- Descrição curta (2 linhas, truncada)
- Pills: `⏱ 40h` · `📅 14 sessões` · `👥 X grupos ativos`
- CTA: "Ver Currículo →"

---

### `estudos/salas/page.tsx` — Catálogo

- Header: "Salas de Estudo"
- Tabs: "Oficiais SPIRIT" | "Minhas Salas" | "Todas"
- Grid responsivo de cards de sala
- Cada card: clique → `/estudos/salas/{roomId}`

---

### `estudos/salas/[roomId]/page.tsx` — Detalhe da sala

**Layout duas colunas (desktop) / uma coluna (mobile):**

**Coluna principal:**
- Header: emoji grande + título + autor + ano + badge Oficial/Custom
- Descrição completa
- Seção "Plano de Estudos":
  - 4 cards de resumo: sessões / horas / frequência sugerida / tamanho ideal
  - Parágrafo de overview
  - Lista de sessões com: número, título, tópicos, duração, tipo (cor)
  - Legenda de tipos

**Coluna lateral:**
- Card de ação principal:
  ```
  ┌─────────────────────────┐
  │ 📚 O Livro dos Espíritos│
  │ 40h · 14 sessões        │
  │                         │
  │ [Criar Grupo nesta Sala]│
  │                         │
  │ Grupos ativos: 3        │
  └─────────────────────────┘
  ```
- "Criar Grupo nesta Sala" → `/estudos/grupos/novo?roomId={id}`

---

### `estudos/criar-sala/page.tsx` — Sala personalizada

Wizard em 2 steps:

**Step 1 — Escolher livro:**
- Campo de busca + grid de livros sugeridos do catálogo base
- Ou: campos livres (título, autor, ano, descrição) para livro não listado
- CTA: "Gerar Currículo com IA →"

**Step 2 — Revisar currículo gerado:**
- Loading com animação enquanto Claude processa
- Exibe currículo gerado (mesmo layout do detalhe da sala)
- Opção de editar títulos de sessões (textarea)
- CTA: "Salvar Sala e Criar Grupo →" → vai para `/estudos/grupos/novo?roomId={id}`
- CTA secundário: "Salvar só a Sala" (sem criar grupo ainda)

---

### `estudos/grupos/novo/page.tsx` — Criar grupo

Recebe `?roomId={id}` na query string.

**Layout:**
- Header: "Criar Grupo de Estudo"
- Card resumo da sala selecionada (imutável)
- Formulário:
  - Nome do grupo (placeholder: "Grupo de Estudo — {book_title}")
  - Descrição (opcional)
- Seção convites:
  - Banner informativo sobre usuários internos vs externos
  - Campos de email dinâmicos (add/remove)
- Card "Pacote Grupos de Estudo" com features e preço
- CTA: "Criar Grupo e Enviar Convites"

Ao submeter:
- Chama `POST /api/estudos/groups/create`
- Loading state
- Sucesso → redireciona para `/estudos/grupos/{groupId}`

---

### `estudos/grupos/[groupId]/page.tsx` — Dashboard do grupo

**Header do grupo:**
- Emoji + título do livro + nome do grupo
- Pills: sessões / horas / membros / % concluído
- Status badge: "Ativo" / "Em pausa" / "Concluído"
- Botão principal (apenas host): "▶ Iniciar Sessão {próxima}" → `/estudos/grupos/{id}/sessao/{n}`

**Duas colunas:**

**Coluna principal — Cronograma:**
- Lista de todas as sessões do currículo
- Cada sessão: número, título, tipo, duração, status (pendente / próxima / concluída + data)
- Sessão concluída: verde + data de realização
- Próxima sessão: destacada em dourado com "PRÓXIMA" badge
- Sessões futuras: neutras

**Coluna lateral:**

*Card Membros:*
- Avatar + nome + status (✦ Host / ✉ Convite pendente / ✓ Membro)
- Botão "Convidar mais +"

*Card Link de Convite:*
- URL do convite: `spirit.app/convite/{token}`
- Botão "Copiar link"
- Nota: "Usuários externos precisarão assinar o Pacote Grupos"

*Card Info da Sala:*
- Sala vinculada com link para `estudos/salas/{roomId}`
- Badge Oficial / Personalizada

---

### `estudos/grupos/[groupId]/sessao/[number]/page.tsx` — Sala ao vivo

Esta é a experiência central da feature.

**Layout fixo (não scroll de página, apenas scroll interno do chat):**

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER FIXO: logo · nome sessão · avatars online · AO VIVO  │
├──────────────────────────────────┬──────────────────────────┤
│                                  │                          │
│  BARRA DE PROGRESSO SESSÕES      │   SIDEBAR                │
│  [1] [2] [3] ... [N]             │   Participantes          │
│                                  │   (com status ao vivo)   │
│  ÁREA PRINCIPAL                  │                          │
│  ┌────────────────────────────┐  │                          │
│  │ QUADRO DO PROFESSOR        │  │                          │
│  │ (texto com efeito typing)  │  │                          │
│  └────────────────────────────┘  │                          │
│                                  │                          │
│  CHAT / Q&A                      │                          │
│  (mensagens de perguntas +       │                          │
│   respostas do professor)        │                          │
│                                  │                          │
├──────────────────────────────────┴──────────────────────────┤
│ BARRA DE CONTROLES FIXO (bottom)                            │
│ Host: [▶ Iniciar] [🙋 Abrir Q&A] [→ Próxima Sessão]        │
│ Membro: [✋ Levantar Mão] · fila: [avatar][avatar]          │
└─────────────────────────────────────────────────────────────┘
```

**Fases da sessão:**
```typescript
type SessionPhase = "waiting" | "teaching" | "questions" | "done"
```

**Estado Realtime sincronizado** (Supabase broadcast no canal `group:{groupId}`):
```typescript
type RoomBroadcast =
  | { event: "session_started";   payload: { sessionNumber: number } }
  | { event: "professor_chunk";   payload: { text: string } }
  | { event: "teaching_done";     payload: {} }
  | { event: "questions_opened";  payload: {} }
  | { event: "hand_raised";       payload: { userId: string; name: string } }
  | { event: "hand_lowered";      payload: { userId: string } }
  | { event: "student_called";    payload: { userId: string; name: string } }
  | { event: "student_question";  payload: { name: string; question: string } }
  | { event: "professor_answer";  payload: { text: string } }
  | { event: "session_ended";     payload: {} }
```

**Quadro do Professor:**
- Fundo estilo "lousa" (dark green gradient)
- Texto aparece com efeito typewriter character-by-character
- Cursor piscante enquanto "digitando"
- Ao completar: cursor some, texto fixo

**Controles por role:**

*Host:*
- `waiting` → Botão "▶ Iniciar Aula" (chama `/teach`)
- `teaching` (após typing concluir) → "🙋 Abrir para Perguntas" | "→ Próxima Sessão"
- `questions` → "👨‍🏫 Chamar Próximo" (desabilitado se fila vazia) | "→ Próxima Sessão"

*Membro:*
- `questions` → "✋ Levantar Mão" / "✋ Baixar Mão" (toggle)
- Quando chamado: campo de texto aparece para digitar pergunta

**Fila de mãos:**
- Avatars empilhados na barra inferior
- Cada avatar: nome do participante no tooltip
- Ordem FIFO

**Sidebar de participantes:**
- Avatar + nome + status dinâmico:
  - 👁 Assistindo
  - ✋ Mão levantada (pulsando)
  - 🎤 Perguntando (ativo)
  - ✓ Online

---

## 6. Navegação — aba Estudos no app

No componente de navegação principal do SPIRIT (`components/nav.tsx` ou similar):

```typescript
const navItems = [
  { href: "/spirit",          label: "Consolador",  icon: "🕊️" },
  { href: "/enciclopedia",    label: "Enciclopédia", icon: "📚" },
  { href: "/estudos",         label: "Estudos",      icon: "🎓" },  // ← NOVA ABA
  { href: "/perfil",          label: "Perfil",       icon: "👤" },
]
```

A aba "Estudos" deve seguir o design system atual do SPIRIT:
- Tema escuro (`#0f1117` ou similar)
- Tons dourados para destaques (`#D4A855`)
- Tipografia com serifa para títulos (já usada no app)
- Ícones simples, sem excesso de decoração

---

## 7. Stripe — Pacote Grupos de Estudo

### Produto no Stripe Dashboard:
- Nome: "SPIRIT — Pacote Grupos de Estudo"
- Preço: R$ 29,90/mês (ou conforme decisão final de pricing)
- `price_id` → `STRIPE_STUDY_GROUP_PRICE_ID` no `.env`

### Checkout iniciado em:
`app/api/estudos/checkout/route.ts`

```typescript
// Chamado quando usuário externo clica "Aceitar Convite" sem assinatura
const session = await stripe.checkout.sessions.create({
  mode: "subscription",
  line_items: [{ price: process.env.STRIPE_STUDY_GROUP_PRICE_ID, quantity: 1 }],
  client_reference_id: userId,       // user_id do Supabase
  metadata: { groupToken, email },   // para o webhook
  success_url: `${baseUrl}/estudos/convite/sucesso?token=${groupToken}`,
  cancel_url:  `${baseUrl}/estudos/convite/cancelado`,
})
```

---

## 8. Email de convite — `emails/StudyGroupInvite.tsx`

Template React Email com:
- Header: logo SPIRIT
- Quem convidou (nome do host)
- Nome do grupo
- Sala/livro: emoji + título + autor
- Stats: X sessões · Y horas de conteúdo
- CTA principal: "✨ Aceitar Convite" (link para `/convite/{token}`)
- Nota de rodapé: "Usuários novos precisarão assinar o Pacote Grupos de Estudo (R$29,90/mês) para participar"
- Footer Spyrit Systems

---

## 9. Variáveis de ambiente necessárias

```env
# Anthropic
ANTHROPIC_API_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_STUDY_GROUP_PRICE_ID=
STRIPE_WEBHOOK_SECRET=

# Resend (email)
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@spyritsystems.com

# App
NEXT_PUBLIC_APP_URL=https://masterspirit.spyritsystems.com
```

---

## 10. Ordem de implementação

Execute em ordem e confirme cada etapa antes de avançar:

**Etapa 1 — Banco de dados**
1. Criar e aplicar migration `YYYYMMDD_estudos.sql`
2. Criar script `generate-default-curricula.ts` e executar para as 8 salas
3. Aplicar seed `study_rooms_default.sql` com os currículos gerados

**Etapa 2 — API Routes (server)**
4. `GET /api/estudos/rooms` e `GET /api/estudos/rooms/[roomId]`
5. `POST /api/estudos/rooms/generate-curriculum`
6. `POST /api/estudos/groups/create`
7. `GET /api/estudos/groups` e `GET /api/estudos/groups/[groupId]`
8. `POST /api/estudos/groups/[groupId]/sessions/start`
9. `POST /api/estudos/groups/[groupId]/sessions/[n]/teach`
10. `POST /api/estudos/groups/[groupId]/sessions/[n]/question`
11. `POST /api/estudos/invite/accept`
12. Webhook Stripe

**Etapa 3 — Páginas (client)**
13. Hub `/estudos` (Meus Grupos + acesso ao catálogo)
14. Catálogo `/estudos/salas`
15. Detalhe da sala `/estudos/salas/[roomId]`
16. Criar sala personalizada `/estudos/criar-sala`
17. Criar grupo `/estudos/grupos/novo`
18. Dashboard do grupo `/estudos/grupos/[groupId]`
19. Sala ao vivo `/estudos/grupos/[groupId]/sessao/[number]`

**Etapa 4 — Integrações**
20. Adicionar aba "Estudos" na navegação principal
21. Template de email de convite
22. Checkout Stripe para usuários externos

---

Confirme cada etapa antes de avançar. Em caso de dúvida sobre convenções do projeto (nomes de variáveis, estrutura de pastas, componentes existentes), pergunte antes de assumir.

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

O módulo oferece **4 modos de sessão** selecionáveis pelo usuário na tela inicial, cada um com etapas, duração, foco e frequência recomendada diferentes.

---

## FUNDAMENTO DOUTRINÁRIO

### Tipos de Passe por Origem dos Fluidos (Kardec, A Gênese, Cap. XIV)

1. **Passe Magnético (Humano)** — O passista doa seus próprios fluidos vitais (princípio vital do perispírito). A qualidade depende da elevação moral e saúde do passista.
2. **Passe Espiritual** — Os Bons Espíritos atuam diretamente sobre o paciente, sem intermediário humano. Fluidos mais puros, do plano superior.
3. **Passe Misto (Humano-Espiritual)** — Os fluidos do passista se misturam com os da Espiritualidade. O Espírito derrama fluidos sobre o passista, que serve de veículo. É o tipo mais praticado nos centros espíritas e o mais eficaz.

### Tipos de Passe por Finalidade (Jacob Melo, Mario Tamassia)

1. **Passe Dispersivo (Limpeza)** — Eliminar fluidos negativos. Movimentos longitudinais de cima para baixo, firmes e contínuos. Sempre vem PRIMEIRO na sessão, antes da doação de fluidos.
2. **Passe de Concentração (Transfusão/Cura)** — Doar fluidos benfazejos aos centros vitais. Imposição de mãos paradas sobre cabeça, cardíaco e plexo solar. É o passe de CURA propriamente dito. Vem DEPOIS da dispersão.
3. **Passe de Desenvolvimento Mediúnico** — Voltado ao desenvolvimento das faculdades mediúnicas (NÃO incluído no app — requer acompanhamento presencial de dirigente espírita).

### Formas de Aplicação

O passe pode ser transmitido: pelas mãos (mais comum), pelo olhar, por irradiações mentais (pensamento dirigido), pelo sopro, e a distância. A prece sincera é também uma forma de passe — "um pensamento dirigido para um fim determinado" (Kardec).

### Escolas de Aplicação

- **Herculano Pires**: imposição das mãos apenas sobre a cabeça. Simplicidade.
- **Edgard Armond**: aplicação sobre os 7 chakras com movimentos sistematizados. Detalhada.

O app segue abordagem HÍBRIDA: respeita os chakras (Armond) com a simplicidade acessível (Herculano Pires).

---

## FILOSOFIA DE FREQUÊNCIA — O PASSE COMO HIGIENE ESPIRITUAL

### Por que NÃO restringir o passe a "pessoas doentes"

A doutrina espírita ensina que saúde é um conceito integral — não apenas ausência de doença física, mas equilíbrio perispiritual, moral, emocional e cármico. Na prática:

- Alguém aparentemente saudável no corpo pode carregar processos obsessivos silenciosos, débitos de vidas passadas, distonias emocionais, ou pensamentos negativos crônicos.
- André Luiz (em "Missionários da Luz", psicografia de Chico Xavier) descreve como o perispírito acumula fluidos densos pela simples convivência social — trabalho, trânsito, ambientes pesados, notícias, conflitos.
- A própria doutrina usa o termo "assepsia espiritual" para o passe dispersivo. Se cuidamos da higiene do corpo diariamente, por que negligenciar a higiene do espírito?
- Emmanuel afirma: "Se usamos o antibiótico para frustrar microorganismos no campo físico, por que não adotar o passe como agente capaz de impedir alucinações depressivas no campo da alma?"

### Posicionamento no App

O passe é apresentado como **higiene e manutenção espiritual** — cuidado preventivo do equilíbrio perispiritual, não como "remédio para doentes". Qualquer pessoa se beneficia, assim como qualquer pessoa se beneficia de uma prece ou de um banho. A IA Passista nunca deve:

- Dizer "você precisa estar doente para isso"
- Substituir tratamento médico ("o passe complementa, nunca substitui")
- Criar dependência ("você precisa disso todo dia ou ficará mal")
- Prometer cura física ("os fluidos auxiliam no reequilíbrio, os resultados são de Deus")

### Frequência Recomendada por Modo

| Modo | Frequência | Analogia | Copy no App |
|---|---|---|---|
| **Sessão Completa** | 1-2x por semana | Como ir ao centro espírita | "Sua sessão semanal de renovação integral" |
| **Passe de Limpeza** | Sempre que sentir necessidade, até diariamente | Como tomar banho | "Limpeza fluídica rápida para o dia a dia" |
| **Passe de Cura** | 1-2x por semana, especialmente em períodos de dificuldade | Como um tratamento de fisioterapia | "Concentração de fluidos curativos nos centros vitais" |
| **Prece & Irradiação** | Diariamente, sem restrição | Como escovar os dentes | "Seu momento diário de conexão e proteção" |

**Importante:** Essas são sugestões acolhedoras, nunca regras rígidas. A IA apresenta como "recomendação da tradição espírita" e encoraja o usuário a encontrar seu próprio ritmo.

---

## OS 4 MODOS DE SESSÃO

### TELA DE SELEÇÃO (antes de iniciar)

Após o hero da Home do Passe, o usuário vê 4 cards selecionáveis com ícone, título, descrição curta, duração estimada e badge de frequência. Ao tocar em um card, ele expande mostrando a descrição completa + lista de etapas + botão "Iniciar". Apenas um card pode estar expandido por vez.

---

### MODO 1: Sessão Completa ✦

**Descrição:** A sessão integral de autopasse, combinando todas as técnicas — prece, concentração, dispersão, cura e respiração fluídica. É a experiência mais profunda e completa, equivalente a uma sessão de passe no centro espírita.

**Duração:** ~6 minutos
**Frequência:** 1-2x por semana
**Badge:** "Renovação Integral"
**Ícone:** ✦

**Etapas (6):**

```javascript
const SESSAO_COMPLETA = [
  {
    id: "abertura",
    title: "Prece de Abertura",
    icon: "🕊️",
    duration: 45,
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
    instruction: "Agora vamos dispersar as energias densas. Mova as mãos abertas do topo da cabeça para baixo, em movimentos longos e suaves, sem tocar o corpo.",
    guidance: "Com as palmas das mãos voltadas para o corpo, a cerca de 10 centímetros de distância, deslize as mãos da cabeça até abaixo da cintura. Movimentos lentos, firmes, contínuos. Ao descer, mentalize que está removendo toda energia pesada, toda tristeza, toda angústia. Sacuda levemente as mãos ao final de cada movimento, devolvendo essas energias ao cosmos para transmutação.",
    breathe: false,
    energy: true
  },
  {
    id: "concentracao_passes",
    title: "Passes de Cura",
    icon: "🔆",
    duration: 60,
    instruction: "Posicione as mãos sobre as regiões que precisam de cura — cabeça, peito, ou plexo solar — e concentre energia vital nestes pontos.",
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

---

### MODO 2: Passe de Limpeza 🌊

**Descrição:** Sessão rápida focada na dispersão de energias densas — a "assepsia espiritual" do dia a dia. Ideal após jornadas pesadas, conflitos, ambientes densos, ou sempre que sentir que está carregando peso que não é seu. Assim como tomamos banho para o corpo, o passe de limpeza cuida da higiene do perispírito.

**Duração:** ~3 minutos
**Frequência:** Sempre que sentir necessidade, até diariamente
**Badge:** "Higiene Fluídica"
**Ícone:** 🌊

**Etapas (4):**

```javascript
const PASSE_LIMPEZA = [
  {
    id: "abertura_rapida",
    title: "Prece Breve",
    icon: "🕊️",
    duration: 30,
    instruction: "Feche os olhos e faça uma prece breve, pedindo aos bons espíritos que auxiliem na limpeza fluídica.",
    guidance: "Senhor, peço aos bons espíritos que me auxiliem a remover as energias densas que acumulei. Que meu perispírito seja purificado e que eu encontre leveza e paz. Assim seja.",
    breathe: false,
    energy: false
  },
  {
    id: "dispersao_cabeca",
    title: "Dispersão — Cabeça e Ombros",
    icon: "🌊",
    duration: 40,
    instruction: "Passe as mãos abertas sobre a cabeça e ombros, em movimentos descendentes. Mentalize os pensamentos pesados sendo removidos.",
    guidance: "Posicione as mãos acima da cabeça, palmas voltadas para baixo. Desça lentamente até os ombros. Repita 5 vezes. A cada movimento, visualize uma camada cinzenta se desprendendo e sendo dissolvida pela luz. Sacuda as mãos ao final de cada passada. Os pensamentos ansiosos, as preocupações — tudo se dissolve.",
    breathe: false,
    energy: true
  },
  {
    id: "dispersao_tronco",
    title: "Dispersão — Tronco e Plexo",
    icon: "🌀",
    duration: 40,
    instruction: "Agora desça as mãos do peito até abaixo da cintura. Movimentos firmes. Está removendo as emoções densas acumuladas no dia.",
    guidance: "Do centro do peito — onde guardamos mágoas e ressentimentos — até o plexo solar — onde se alojam medos e ansiedades — desça as mãos em movimentos longos e contínuos. Repita 5 vezes. Sinta o alívio a cada passada. As emoções pesadas escorrem para fora como água suja que desce pelo ralo. Você está mais leve.",
    breathe: false,
    energy: true
  },
  {
    id: "selamento",
    title: "Selamento & Gratidão",
    icon: "✨",
    duration: 30,
    instruction: "Posicione as mãos sobre o peito e mentalize uma luz dourada selando sua aura limpa. Agradeça.",
    guidance: "Com as mãos sobre o peito, sinta seu campo energético limpo e renovado. Mentalize uma esfera de luz dourada envolvendo todo o seu corpo, como uma armadura espiritual de proteção. Agradeça aos bons espíritos. Você está protegido. Está limpo. Está em paz.",
    breathe: true,
    energy: false
  }
];
```

---

### MODO 3: Passe de Cura 💛

**Descrição:** Sessão terapêutica focada na concentração de fluidos curativos nos centros vitais. Começa com uma dispersão breve (pré-requisito obrigatório — não se pode doar fluidos sem antes limpar) e depois dedica tempo prolongado à imposição de mãos curativas sobre cabeça, cardíaco e plexo solar. É o passe de transfusão energética, o mais indicado para quem está passando por dificuldades de saúde (física, emocional ou espiritual), processos de luto, depressão, ou recuperação.

**Nota doutrinária:** O passe de cura é COMPLEMENTAR — nunca substitui tratamento médico. A IA sempre reforça isso com carinho.

**Duração:** ~7 minutos
**Frequência:** 1-2x por semana, especialmente em períodos difíceis
**Badge:** "Cura & Restauração"
**Ícone:** 💛

**Etapas (6):**

```javascript
const PASSE_CURA = [
  {
    id: "abertura_cura",
    title: "Prece de Abertura — Pedido de Cura",
    icon: "🕊️",
    duration: 40,
    instruction: "Feche os olhos. Nesta sessão, vamos pedir especialmente aos espíritos curadores que nos envolvam com seus fluidos de cura e restauração.",
    guidance: "Senhor, neste momento me coloco diante da Tua misericórdia e dos espíritos curadores que servem ao Cristo. Peço que os fluidos de cura penetrem meu corpo e minha alma. Sei que a cura verdadeira é um processo — e que ela começa pela transformação interior. Abro meu coração para receber. Confio no amparo divino.",
    breathe: false,
    energy: false
  },
  {
    id: "dispersao_preparatoria",
    title: "Dispersão Preparatória",
    icon: "🌊",
    duration: 40,
    instruction: "Antes de receber os fluidos de cura, precisamos limpar o campo. Passe as mãos de cima para baixo, removendo as energias que bloqueiam a cura.",
    guidance: "Com as mãos abertas, desça da cabeça à cintura, 5 vezes. Está removendo os fluidos densos que impedem a penetração dos fluidos curativos. É como preparar o solo antes de plantar. Sacuda as mãos ao final de cada passada.",
    breathe: false,
    energy: true
  },
  {
    id: "cura_coronario",
    title: "Imposição — Coronário & Frontal",
    icon: "👑",
    duration: 70,
    instruction: "Posicione as mãos a poucos centímetros da cabeça. O chakra coronário é o portal de entrada dos fluidos espirituais. Permaneça aqui com fé e concentração.",
    guidance: "Mãos posicionadas acima do topo da cabeça, palmas voltadas para baixo. Sinta o calor sutil — são os fluidos curativos penetrando pelo chakra coronário. Os espíritos curadores estão trabalhando agora. Mentalize uma luz violeta e dourada entrando pelo topo, descendo pela coluna, iluminando cada célula do cérebro. Agora mova as mãos para a frente da testa — o centro frontal. Aqui se equilibram os pensamentos. Paz mental. Clareza. Os padrões de ansiedade e medo se dissolvem na luz.",
    breathe: true,
    energy: true
  },
  {
    id: "cura_cardiaco",
    title: "Imposição — Centro Cardíaco",
    icon: "💚",
    duration: 70,
    instruction: "Desça as mãos até o centro do peito — o chakra cardíaco. É o centro do amor, da compaixão e da cura emocional. Aqui residem as dores mais profundas, mas também a maior força de cura.",
    guidance: "Mãos sobre o peito, a poucos centímetros. Sinta o coração batendo. Cada batida é uma oração. Mentalize uma luz verde-esmeralda preenchendo todo o peito. As mágoas, os ressentimentos, as perdas — tudo é banhado por essa luz de amor incondicional. Você não precisa carregar essa dor sozinho. Os espíritos de cura estão aqui. Permita-se receber. Permita-se curar. A cura do coração é a cura mais profunda que existe.",
    breathe: true,
    energy: true
  },
  {
    id: "cura_plexo",
    title: "Imposição — Plexo Solar & Umbilical",
    icon: "🔆",
    duration: 60,
    instruction: "Desça as mãos até a região do estômago — o plexo solar. Aqui se acumulam medos, ansiedades e tensões emocionais. É também um centro vital de energia.",
    guidance: "Mãos sobre o plexo solar. Este é o centro das emoções instintivas — medo, raiva, ansiedade. Mentalize uma luz dourada quente, como um sol interior, dissolvendo cada nó de tensão. O estômago relaxa. O diafragma se solta. A respiração se aprofunda naturalmente. Você está seguro. Desça as mãos ao umbilical — centro da vitalidade física. Energia. Força. Disposição renovada.",
    breathe: true,
    energy: true
  },
  {
    id: "encerramento_cura",
    title: "Selamento & Gratidão Curativa",
    icon: "🙏",
    duration: 40,
    instruction: "Posicione as mãos sobre o peito e agradeça. Os fluidos continuarão agindo nas próximas horas e dias. A cura é um processo — confie.",
    guidance: "Agradecemos aos espíritos curadores por esta sessão de amor e restauração. Que os fluidos de cura continuem agindo em meu corpo e espírito. Reconheço que a cura verdadeira é um processo, não um evento. Comprometo-me com minha transformação interior, sabendo que a reforma moral é o alicerce de toda cura. Que assim seja, pela misericórdia de Deus.",
    breathe: false,
    energy: false
  }
];
```

---

### MODO 4: Prece & Irradiação 🙏

**Descrição:** A forma mais suave e acessível de passe. Não envolve movimentos das mãos — é um passe pelo pensamento, pela prece dirigida e pela visualização. Kardec ensina que "a prece sincera aciona os fluidos" e que é "um pensamento dirigido para um fim determinado". Ideal para momentos de introspecção, para quem tem dificuldade de mobilidade, ou como prática diária de conexão espiritual. Pode ser feito a qualquer hora, em qualquer lugar.

**Duração:** ~4 minutos
**Frequência:** Diariamente, sem restrição — é sua oração fluídica
**Badge:** "Conexão Diária"
**Ícone:** 🙏

**Etapas (4):**

```javascript
const PRECE_IRRADIACAO = [
  {
    id: "centralizacao",
    title: "Centralização",
    icon: "🧘",
    duration: 40,
    instruction: "Feche os olhos e traga sua atenção para dentro. Não é preciso fazer nada com as mãos. Apenas respire e conecte-se com o silêncio interior.",
    guidance: "Inspire devagar pelo nariz... expire pela boca... Deixe o mundo lá fora. Neste momento, existe apenas você e Deus. Sinta seu corpo. Sinta sua respiração. Sinta a presença sutil dos bons espíritos ao seu redor. Eles estão sempre aqui — basta silenciar para perceber.",
    breathe: true,
    energy: false
  },
  {
    id: "prece_pessoal",
    title: "Prece Pessoal",
    icon: "💫",
    duration: 60,
    instruction: "Converse com Deus em pensamento. Não há fórmula. Fale do que está no seu coração — gratidão, pedidos, dores, esperanças. Ele ouve tudo.",
    guidance: "A oração mais poderosa é a sincera. Não precisa de palavras bonitas. Fale com Deus como fala com o melhor amigo. Agradeça pelas bênçãos — mesmo as que não reconhece ainda. Peça força para os desafios. Confie. Se as lágrimas vierem, deixe que venham — são a prece mais pura. O Pai conhece suas necessidades antes mesmo que você as expresse.",
    breathe: false,
    energy: false
  },
  {
    id: "irradiacao",
    title: "Irradiação de Luz",
    icon: "☀️",
    duration: 60,
    instruction: "Agora mentalize luz sendo enviada — primeiro para você mesmo, depois para quem você ama, depois para o mundo. Seu pensamento é uma força real.",
    guidance: "Visualize uma esfera de luz dourada no centro do seu peito. Com cada respiração, ela cresce. Primeiro, envolve todo o seu corpo — você está banhado em luz. Agora, pense em alguém que precisa de ajuda. Veja essa luz chegando até essa pessoa, envolvendo-a com amor e proteção. Expanda para sua família. Seus amigos. Sua comunidade. O mundo. O pensamento dirigido com amor é a mais poderosa forma de passe a distância. Você está fazendo o bem real neste momento.",
    breathe: true,
    energy: true
  },
  {
    id: "gratidao_silenciosa",
    title: "Gratidão em Silêncio",
    icon: "🤍",
    duration: 30,
    instruction: "Permaneça em silêncio por alguns instantes. Sinta a paz. Agradeça. Quando estiver pronto, abra os olhos lentamente.",
    guidance: "Silêncio. Apenas presença. Nada a fazer. Nada a pensar. Apenas ser. Neste silêncio, os espíritos completam o trabalho que as palavras não alcançam. Gratidão. Paz. Amor. Quando sentir que está pronto, abra os olhos suavemente e leve essa paz para o resto do seu dia.",
    breathe: false,
    energy: false
  }
];
```

---

## ARQUITETURA DE IMPLEMENTAÇÃO

### 1. Frontend — `passe.html`

Criar nova página `passe.html` na raiz do projeto, seguindo o design system existente.

**Fluxo de telas:**

```
TELA 1: HOME DO PASSE
├── Header (logo SPIRIT + navegação de volta ao dashboard)
├── Hero (ícone 🙌 + título "Sessão de Passe" + subtítulo "Higiene e cura do espírito")
├── SELETOR DE MODO — 4 cards clicáveis:
│   ├── Card "Sessão Completa" (✦ ~6min, badge "Renovação Integral")
│   ├── Card "Passe de Limpeza" (🌊 ~3min, badge "Higiene Fluídica")
│   ├── Card "Passe de Cura" (💛 ~7min, badge "Cura & Restauração")
│   └── Card "Prece & Irradiação" (🙏 ~4min, badge "Conexão Diária")
│   Cada card mostra: ícone, título, duração, badge, frequência recomendada
│   Ao clicar, o card EXPANDE mostrando:
│   ├── Descrição completa do modo
│   ├── Lista das etapas com ícones
│   └── Botão "Iniciar Sessão"
│   Apenas 1 card expandido por vez (accordion behavior)
├── Caixa "Antes de Começar" (preparação)
│   ├── Encontre um ambiente silencioso e tranquilo
│   ├── Sente-se confortavelmente com a coluna ereta
│   ├── Beba um copo d'água antes e depois da sessão
│   └── Desligue notificações — este é seu momento
└── Nota sutil: "O passe complementa, nunca substitui, tratamentos médicos."

TELA 2: SESSÃO EM ANDAMENTO
├── Nome do modo ativo no topo (ex: "Passe de Cura")
├── Progress bar (pontos = qtd de etapas do modo, ponto atual expandido em dourado)
├── Ícone da etapa + Título + "Etapa X de N"
├── Timer com barra de progresso por etapa
├── Card "IA Passista" com instrução principal (efeito typewriter)
├── [Condicional] Canvas de visualização energética (partículas + chakras)
│   Ativa quando step.energy === true
├── [Condicional] Círculo de respiração animado (inspire 4s → segure 4s → expire 6s)
│   Ativa quando step.breathe === true E sessão está rodando
├── Botão expansível "Orientação Detalhada" (prece/mentalização completa)
└── Navegação (← Anterior | Próxima Etapa →)

TELA 3: SESSÃO CONCLUÍDA
├── Ícone pomba 🕊️ + "Sessão Concluída"
├── Mensagem de encerramento (varia por modo)
├── Cards pós-sessão:
│   ├── 💧 Beba água para auxiliar a fluidificação
│   ├── 📖 Leia uma página do Evangelho
│   ├── 🙏 Mantenha pensamentos elevados
│   └── 😴 Se possível, descanse por alguns minutos
├── Badge de frequência: "Próxima sessão recomendada: [conforme modo]"
└── Botões (Nova Sessão | Voltar ao Início)
```

**Design system rigoroso:**

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
/* Mínimo 18px para corpo de texto, 48px touch targets em todos os botões */
```

**Componentes visuais obrigatórios:**

- **Typewriter effect**: Texto da IA aparece letra por letra (35ms/char) para sensação de presença viva
- **Breathing Circle**: Círculo pulsante — inspire (cresce em 4s), segure (mantém 4s), expire (encolhe em 6s). Mostra label ("Inspire"/"Segure"/"Expire") + countdown numérico grande
- **Energy Field Canvas**: Canvas 2D com silhueta corporal sutil, ~30 partículas orbitando (douradas e azuis), 7 pontos de chakra pulsando nas cores tradicionais (violeta no coronário → vermelho no base)
- **Timer**: Barra de progresso linear fina + countdown mm:ss em fonte tabular
- **Transições**: Fade in/out (400ms) entre etapas e telas
- **Accordion Cards**: Para o seletor de modo — apenas 1 expandido por vez, animação suave (300ms), conteúdo expandido aparece com fadeUp

### 2. Dados das Etapas — Objeto JS local

Criar um objeto `SESSION_MODES` que contém os 4 modos com suas respectivas etapas (usar os dados exatos definidos acima nas seções MODO 1-4):

```javascript
const SESSION_MODES = {
  completa: {
    id: "completa",
    title: "Sessão Completa",
    icon: "✦",
    badge: "Renovação Integral",
    duration: "~6 min",
    frequency: "1-2x por semana",
    description: "A sessão integral de autopasse, combinando todas as técnicas...",
    steps: SESSAO_COMPLETA // array definido acima
  },
  limpeza: {
    id: "limpeza",
    title: "Passe de Limpeza",
    icon: "🌊",
    badge: "Higiene Fluídica",
    duration: "~3 min",
    frequency: "Sempre que precisar",
    description: "Sessão rápida focada na dispersão de energias densas...",
    steps: PASSE_LIMPEZA
  },
  cura: {
    id: "cura",
    title: "Passe de Cura",
    icon: "💛",
    badge: "Cura & Restauração",
    duration: "~7 min",
    frequency: "1-2x por semana",
    description: "Sessão terapêutica focada na concentração de fluidos curativos...",
    steps: PASSE_CURA
  },
  irradiacao: {
    id: "irradiacao",
    title: "Prece & Irradiação",
    icon: "🙏",
    badge: "Conexão Diária",
    duration: "~4 min",
    frequency: "Diariamente",
    description: "A forma mais suave e acessível. Passe pelo pensamento...",
    steps: PRECE_IRRADIACAO
  }
};
```

### 3. Serverless Function (FASE 2) — `api/passe-chat.js`

> **NOTA:** A Fase 1 usa o conteúdo estático. A Fase 2 conecta a API. Implementar quando solicitado.

```javascript
// api/passe-chat.js
// POST /api/passe-chat
// Body: { mode_id, step_id, user_feeling, session_context }

const PASSISTA_SYSTEM = `Você é a IA Passista do SPIRIT — O Consolador. Guia espiritual especializado nas técnicas do passe espírita kardecista.

Seu papel:
- Conduzir sessões de autopasse guiado (limpeza, cura, irradiação, ou sessão completa)
- Fornecer instruções claras sobre movimentos, postura e mentalização
- Adaptar orientações ao estado emocional do usuário e ao modo escolhido
- Linguagem acolhedora, serena, espiritualmente elevada

Base doutrinária:
- O Livro dos Médiuns e A Gênese (Kardec) — passes e fluidos
- O Evangelho Segundo o Espiritismo (Kardec)
- Missionários da Luz e Mecanismos da Mediunidade (André Luiz / Chico Xavier)
- Divaldo Franco — orientações sobre passes

Regras INVIOLÁVEIS:
- Você GUIA, nunca faz o passe. O usuário faz o autopasse.
- O passe COMPLEMENTA, nunca substitui tratamento médico.
- Linguagem simples e acessível (público inclui idosos). Frases curtas e pausadas.
- Nunca crie dependência ("você precisa disso todo dia"). Encoraje autonomia espiritual.
- Nunca prometa cura física. "Os fluidos auxiliam no reequilíbrio — os resultados são de Deus."
- Comece e termine sempre com referência a Deus e aos bons espíritos.`;
```

### 4. Supabase — Tracking (FASE 2)

```sql
CREATE TABLE passe_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mode_id TEXT NOT NULL, -- 'completa', 'limpeza', 'cura', 'irradiacao'
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  completed BOOLEAN DEFAULT FALSE,
  steps_completed INTEGER DEFAULT 0,
  total_steps INTEGER NOT NULL,
  total_duration_seconds INTEGER,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE passe_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own sessions"
  ON passe_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions"
  ON passe_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON passe_sessions FOR UPDATE USING (auth.uid() = user_id);
```

### 5. Integração com Navegação

Adicionar no dashboard/menu principal:
- Card com ícone 🙌, título "Sessão de Passe", descrição "Higiene e cura do espírito — autopasse guiado"
- Link para `passe.html`
- Auth check (redirect para login se não autenticado)

---

## REQUISITOS TÉCNICOS

### Acessibilidade (CRÍTICO — público idoso)
- Fonte mínima 18px em todo lugar, inclusive nos badges e labels secundários
- Botões com mínimo 48px de altura e área de toque
- Contraste alto (texto claro sobre fundo escuro)
- Animações suaves, sem flashes ou movimentos bruscos
- Breathing Circle com números grandes (28px+) e legíveis
- Timer com números em fonte tabular para não "pular"
- Cards do seletor de modo com área de toque generosa (todo o card é clicável)
- Labels claros e descritivos em todos os botões

### Performance
- Nenhuma dependência externa além de Google Fonts (Cormorant Garamond)
- Canvas animations com requestAnimationFrame e cleanup adequado (cancelAnimationFrame no unmount)
- Supabase CDN no final do body com onload
- Tudo em um único arquivo HTML (inline CSS + JS) ou com CSS/JS separados seguindo o padrão do app

### Segurança
- Nenhuma API key no frontend
- Se Fase 2 (API), usar serverless function em `api/passe-chat.js`
- Auth check via Supabase antes de permitir acesso

---

## ETAPAS DE IMPLEMENTAÇÃO

### FASE 1 (implementar agora):
1. Criar `passe.html` com toda a UI e lógica client-side
2. Implementar o seletor de 4 modos com accordion behavior
3. Implementar todas as etapas dos 4 modos com conteúdo estático
4. Implementar componentes visuais (typewriter, breathing, energy canvas, timer, progress)
5. Adaptar número de etapas e progress bar dinamicamente ao modo selecionado
6. Implementar tela de conclusão com mensagem específica por modo + badge de frequência
7. Adicionar card de acesso no dashboard/menu principal
8. Garantir responsividade mobile-first
9. Testar todos os 4 modos end-to-end

### FASE 2 (quando solicitado):
1. Criar `api/passe-chat.js` com system prompt da IA Passista
2. Criar tabela `passe_sessions` no Supabase com campo `mode_id`
3. Tela "Como você está se sentindo?" antes da sessão (input para IA personalizar)
4. Conectar etapas à API para orientações personalizadas em tempo real
5. Registrar sessões no Supabase ao completar
6. Dashboard de histórico: sessões por modo, frequência, streak

### FASE 3 (futuro):
1. ElevenLabs para narração em voz da IA Passista
2. Música ambiente com Web Audio API (strings ≥110Hz, cathedral bells a 0.60 gain, ConvolverNode reverb 5s tail, DynamicsCompressor, master gain 0.88)
3. Modo "Passe a Distância" — dois usuários via Supabase Realtime
4. Integração com Evangelho no Lar (passe como etapa opcional)
5. Notificações gentis de frequência: "Faz 5 dias que você não faz sua limpeza fluídica. Que tal reservar 3 minutinhos?"

---

## ENTREGÁVEIS

1. **`passe.html`** — Página completa do módulo de Passe com os 4 modos
2. **Modificação no dashboard/menu** — Card de acesso ao novo módulo
3. **`api/passe-chat.js`** — (Fase 2) Serverless function
4. **SQL migration** — (Fase 2) Script para criar tabela `passe_sessions`

---

## REFERÊNCIA VISUAL

O design segue exatamente o padrão do Master Spirit:
- Background `#0A0A0F` (deep dark)
- Cards com `#12121A` e border `rgba(154,149,144,0.07)`
- Acentos em dourado `#D4A855` com gradientes para `#8B7335`
- Tipografia serifada (Cormorant Garamond)
- Botões primários com gradiente dourado e box-shadow glow
- Ícones emoji (não SVG icons)
- Animações: fadeUp para entrada de elementos, float para ícones hero, glow pulsante para CTAs
- Badges: fundo `rgba(212,168,85,0.1)`, borda `rgba(212,168,85,0.2)`, texto dourado, font-size 11px, letter-spacing 2px, uppercase

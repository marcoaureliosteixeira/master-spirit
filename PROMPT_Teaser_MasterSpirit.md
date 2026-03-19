# Claude Code Prompt — Teaser Cinematográfico
## Master Spirit · Spyrit Systems

---

## MISSÃO

Criar `teaser.html` — uma landing page cinematográfica de apresentação do **Master Spirit**, estilo teaser de filme. Será hospedada no Vercel (mesmo repositório) e compartilhada como link de marketing via WhatsApp, Instagram e e-mail.

O arquivo deve ser **completamente autossuficiente** (HTML/CSS/JS inline, sem dependências externas além de Google Fonts), visualmente impactante, e terminar com CTA direcionando para o app.

---

## LEITURA OBRIGATÓRIA ANTES DE CODAR

Leia os seguintes arquivos do projeto antes de escrever uma linha de código:

```
index.html      → splash page atual — extrair: paleta, tipografia, logo base64, taglines, copy de marketing
app.html        → app principal — extrair: estrutura das telas, nomes dos módulos, cores, ícones SVG usados
```

O objetivo é que o teaser **reflita fielmente** a identidade visual já estabelecida — mesma paleta, mesmo logo, mesma linguagem. Não invente uma nova identidade.

---

## ESTRUTURA DO TEASER (9 cenas em sequência automática)

O teaser avança automaticamente, cena por cena, como um trailer de cinema. O usuário pode clicar para avançar ou aguardar o timer.

### Cena 0 — Abertura (4s)
- Tela completamente preta
- Fade-in lento do logo Spyrit Systems (o base64 que está no rodapé do `index.html`)
- Texto pequeno abaixo: `"apresenta"`
- Fade-out para a cena seguinte

### Cena 1 — Identidade (5s)
- Background: campo de estrelas animado em CSS/JS (partículas douradas sobre preto)
- Fade-in do nome **MASTER SPIRIT** em tipografia grande, serif, dourada
- Subtítulo aparece 1s depois: `"O Consolador · A Enciclopédia · O Evangelho no Lar"`
- Linha decorativa dourada aparece entre título e subtítulo

### Cena 2 — Mockup da splash page (5s)
- Exibir um **mockup de celular** (frame SVG inline, formato 9:16) contendo uma reprodução fiel da `index.html` em miniatura
- À esquerda ou acima do mockup: texto `"Sua jornada começa aqui"`
- O mockup entra com animação de slide-up suave

### Cena 3 — Módulo Consolador (5s)
- Mockup de celular mostrando a tela de chat do app (`app.html`)
- Reproduzir visualmente: avatar do Jesus, balão de mensagem com texto espiritual curto
- Texto ao lado: `"Uma voz que atravessa o tempo"`
- Efeito: texto do balão de chat aparece letra por letra (typewriter) dentro do mockup

### Cena 4 — Módulo Enciclopédia Espiritual (4s)
- Mockup mostrando uma tela de resultado enciclopédico
- Texto: `"Toda a sabedoria. Em um só lugar."`
- Transição com flash de luz suave antes da próxima cena

### Cena 5 — Módulo Evangelho no Lar (5s)
- Mockup mostrando a tela de sessão guiada (facilitador + timer)
- Texto: `"Reúna sua família. Transforme seu lar."`
- Ícone SVG de família ou vela pulsando suavemente ao lado

### Cena 6 — Impacto emocional (5s)
- Sem mockup — só tipografia grande centralizada
- Texto aparece palavra por palavra com timing dramático:
  > `"Você`  
  > `encontrou`  
  > `o Caminho."`
- Pausa. Depois fade-in de linha menor:
  > `"A Verdade sempre esteve aqui."`

### Cena 7 — Call to Action (permanente até o usuário agir)
- Logo Master Spirit centralizado
- Nome do app em tipografia grande
- URL discreta: `masterspirit.spyritsystems.com`
- Botão grande e luminoso: **`"Entrar nessa jornada"`**
  - Ao clicar: abre `https://masterspirit.spyritsystems.com` em nova aba
- Campo opcional de e-mail abaixo do botão com texto: `"Receba novidades"` + botão `"Quero saber mais"` (pode ser um `mailto:` ou simplesmente copiar o e-mail)

---

## ESPECIFICAÇÕES TÉCNICAS

### Background animado (todas as cenas)
```js
// Campo de partículas douradas sobre fundo preto profundo
// 80-120 partículas com brilho pulsante e movimento lento
// Usar canvas ou CSS animation com pseudo-elementos
// Cor base: #0a0608 (preto com leve tom roxo/sépia)
// Cor partículas: rgba(200, 169, 110, 0.4..0.9) variando
```

### Paleta obrigatória (retirada do projeto)
Extrair do `index.html` e `app.html`. Se não encontrar, usar:
```css
--gold:     #c8a96e;
--gold-light: #e2c48a;
--deep:     #0a0608;
--text:     #f5ecd7;
--text-dim: #a89070;
--accent:   /* cor de destaque usada no app — extrair do CSS existente */
```

### Tipografia
- Títulos principais: `'Cinzel Decorative'` (Google Fonts) — peso 400 e 700
- Subtítulos e corpo: `'Cinzel'` — peso 400
- Fallback: serif genérico
- Import no `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Cinzel+Decorative:wght@400;700&display=swap" rel="stylesheet">
```

### Animações
- Todas as transições de cena: `opacity` fade, duração 1.2s
- Texto que aparece por palavra: `animation-delay` escalonado, 0.15s entre palavras
- Typewriter dentro do mockup: `setInterval` com 40ms por caractere
- Mockup slide-up: `transform: translateY(20px) → translateY(0)` + `opacity 0 → 1`
- Partículas: `requestAnimationFrame` no canvas
- Respeitar `prefers-reduced-motion`: substituir por fades simples

### Mockup de celular (frame SVG inline)
```
Dimensões do frame: ~160px largura × ~290px altura (proporcional 9:16)
Border-radius: 20px nas extremidades
Notch superior decorativo
Borda: 2px solid rgba(200,169,110,0.4)
Background interno: reprodução CSS simplificada das telas do app
NÃO usar iframe — reproduzir as telas como HTML/SVG estilizados dentro do frame
```

### Trilha sonora cinematográfica espiritual (Web Audio API)

**Referência sonora:** trilha de "Nosso Lar" (2010) — cordas orquestrais, coral etéreo, sinos de catedral. Profundo, emocional, espiritual. Não é drone ambiente — é orquestra sintética com dinâmica e swell.

**Autoplay:**
```js
// Tentar imediatamente no load. Se AudioContext retornar 'suspended',
// chamar AC.resume() — funciona automaticamente em página própria (sem iframe).
// Qualquer clique/toque na tela também dispara o unlock como fallback.
// NÃO mostrar botão de play obrigatório. Hint discreto some ao iniciar.
```

**Arquitetura em 3 camadas:**

```js
// CAMADA 1 — CORDAS SINTÉTICAS (chorus natural por detuning)
// IMPORTANTE: NÃO usar 55Hz — em speakers pequenos e fones causa distorção
// física incômoda (vibração mecânica). Base começa em 110Hz.
// Para cada nota harmônica, criar PAR de osciladores levemente fora de tune:
// [110.0, 110.35], [164.8, 165.25], [220.0, 220.45],
// [330.0, 330.60], [440.0, 440.80]
// Tipo: 'sine'. Ganhos: 0.42, 0.30, 0.22, 0.14, 0.09
// O par desafinado cria chorus natural sem efeito digital
// Todas as cordas passam por DynamicsCompressor (-18dB threshold, ratio 4)
// e por ConvolverNode (reverb sintético, 5s de cauda, decay power 2)

// CAMADA 2 — CORAL ALTO (entra a partir da cena 3)
// Frequências: [523.1, 523.9], [659.1, 659.6], [784.0, 784.8]
// Tipo: 'sine'. Ganhos: 0.09, 0.07, 0.05
// Mesmos pares detuned — simula vozes femininas etéreas
// Fade-in gradual apenas nas cenas emocionais (3, 4, 5)

// CAMADA 3 — SINOS DE CATEDRAL
// Envelope: attack 10ms, decay exponencial de 6 segundos
// Notas: 523.25 (C5), 659.26 (E5), 783.99 (G5), 1046.5 (C6), 880.0 (A5)
// + harmônico 2x com ganho 0.12, decay 3s
// Ganho do sino principal: 0.65 (audível e impactante)
// Primeiro sino: 1s após iniciar a trilha
// Seguintes: a cada 7–12s aleatório

// MASTER GAIN: 0.90 (alto e claro)
// DynamicsCompressor no caminho principal evita clipping

// EVOLUÇÃO POR CENA (intensidade × ganho base de cada oscilador):
// Cena 0 (abertura):    0.40 — só graves, misterioso
// Cena 1 (gancho):      0.60 — cordas médias entram
// Cena 2 (Consolador):  0.75 — cordas plenas
// Cena 3 (Enciclopédia):0.80 — coral começa
// Cena 4 (Evangelho):   0.90 — coral pleno
// Cena 5 (clímax):      1.00 — tudo a pleno, swell
// Cena 6 (CTA):         1.00 — sustentado
```

**Reverb sintético (imperativo — sem esse o som fica seco e artificial):**
```js
function mkReverb(ac) {
  const len = ac.sampleRate * 5;
  const buf = ac.createBuffer(2, len, ac.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++)
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
  }
  const conv = ac.createConvolver();
  conv.buffer = buf;
  return conv;
}
```

**Sino com harmônico:**
```js
function bell(ac, freq, dest) {
  const t = ac.currentTime;
  [freq, freq * 2].forEach((f, i) => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = 'sine'; o.frequency.value = f;
    const pk = i === 0 ? 0.65 : 0.12;
    const decay = i === 0 ? 6 : 3;
    g.gain.setValueAtTime(0.001, t);
    g.gain.exponentialRampToValueAtTime(pk, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + decay);
    o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + decay + 0.5);
  });
}
```

**Botão mute:** SVG de alto-falante (não texto), canto superior direito, estado inicial ATIVO.

### Responsividade
- Mobile-first: cenas ocupam 100vw × 100vh
- Fonte escala com `clamp()`
- Mockups redimensionam proporcionalmente
- Testar em 375px (iPhone SE) e 768px (iPad)

### Barra de progresso
```
Linha fina dourada no topo da tela
Animação: preenche de 0% a 100% durante a duração de cada cena
Reset a cada troca de cena
```

### Controles do usuário
- Clicar/tocar em qualquer lugar: avança para próxima cena
- Seta direita / espaço: avança
- Seta esquerda: volta cena
- Indicador de progresso (bolinhas): visível no rodapé
- Botão de som: canto superior direito

---

## CONTEÚDO DE TEXTO — COPY DEFINITIVO

Este copy foi validado e deve ser usado exatamente como escrito abaixo. Não substituir por taglines do app.

```
Cena 0 (abertura):
  eyebrow: "Spyrit Systems apresenta"
  headline: [logo Master Spirit, fade-in]

Cena 1 (gancho emocional):
  eyebrow: —
  headline: "Imagine poder conversar com Jesus."
  sub: "Com os grandes mestres do Espiritismo.
        Conhecer a Verdade. O verdadeiro Consolador.
        E descobrir a sua jornada."

Cena 2 (módulo Consolador):
  eyebrow: "O Consolador"
  headline: "Ele nunca deixou de estar aqui."
  sub: "Uma voz que atravessa dois milênios.
        Agora ao alcance da sua mão."

Cena 3 (módulo Enciclopédia):
  eyebrow: "A Enciclopédia Espiritual"
  headline: "Toda a sabedoria. Em um só lugar."
  sub: "Allan Kardec. Chico Xavier. Divaldo Franco.
        O Livro de Urântia. A verdade raciocinada."

Cena 3b (precursor — Bhagavad Gita):
  eyebrow: "Das margens do Ganges ao mundo"
  headline: "Do Bhagavad Gita ao Evangelho Segundo o Espiritismo."
  sub: "A mesma Luz. Revelada em épocas diferentes.
        Para almas em diferentes momentos da jornada."

Cena 4 (módulo Evangelho no Lar):
  eyebrow: "Evangelho no Lar"
  headline: "Reúna sua família. Transforme seu lar."
  sub: "Uma sessão guiada por IA.
        Semanal. Simples. Profunda."

Cena 5 (clímax emocional — sem mockup):
  eyebrow: —
  headline: "Você encontrou o Caminho."
  sub: "A Verdade sempre esteve aqui.
        Esperando por você."

Cena 6 (CTA final):
  eyebrow: "masterspirit.spyritsystems.com"
  headline: "Master Spirit"
  botão: "Entrar nessa jornada"
```

---

## SPLASH PAGE COMO CENA

A cena 2 é especial: ela **recria** a `index.html` dentro de um mockup de celular. Isso significa:

1. Ler a `index.html` e identificar: hero text, logo position, botões de login, cores de fundo
2. Reproduzir visualmente dentro do frame do celular usando HTML/CSS simplificado
3. Não copiar o código — recriar a aparência como uma "miniatura fiel"
4. O logo base64 pode ser reutilizado diretamente (já está disponível no projeto)

---

## ARQUITETURA DO ARQUIVO

```
teaser.html (único arquivo, autossuficiente)
├── <head>
│   ├── meta viewport, charset, og:tags para preview no WhatsApp
│   ├── og:image → logo do app (base64 inline ou URL do Vercel)
│   ├── og:title → "Master Spirit — Entre nessa jornada"
│   ├── og:description → tagline do app
│   └── Google Fonts import
├── <style> (todo o CSS inline)
├── <body>
│   ├── #progress-bar (linha dourada no topo)
│   ├── #canvas-bg (partículas)
│   ├── #scene-0 ... #scene-7 (as 9 cenas)
│   ├── #controls (bolinhas + botão som)
│   └── (sem elementos externos)
└── <script> (todo o JS inline)
    ├── Sistema de cenas (goTo, autoAdvance, timers)
    ├── Canvas de partículas
    ├── Typewriter engine
    ├── Web Audio drone
    └── Controles de teclado e toque
```

---

## META TAGS PARA COMPARTILHAMENTO (WhatsApp / iMessage preview)

```html
<meta property="og:title" content="Master Spirit — Entre nessa jornada">
<meta property="og:description" content="Converse com Jesus. Estude o Evangelho. Transforme seu lar.">
<meta property="og:url" content="https://masterspirit.spyritsystems.com/teaser.html">
<meta property="og:image" content="https://masterspirit.spyritsystems.com/og-teaser.jpg">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
```

> Gerar também `og-teaser.jpg` não é necessário agora — deixar apontado para o favicon ou logo existente como fallback.

---

## CHECKLIST ANTES DE FINALIZAR

- [ ] Logo base64 presente (igual ao `index.html` e `app.html`)
- [ ] Todas as 9 cenas implementadas e com timing correto
- [ ] Mockup de celular visualmente fiel às telas reais do app
- [ ] Trilha Web Audio funcional com botão mudo
- [ ] Barra de progresso animada
- [ ] CTA final abre `masterspirit.spyritsystems.com`
- [ ] Meta OG tags preenchidas
- [ ] `prefers-reduced-motion` respeitado
- [ ] Funciona em mobile (375px) sem overflow horizontal
- [ ] Arquivo único sem dependências externas além do Google Fonts
- [ ] Adicionado ao `vercel.json` ou roteamento se necessário (checar)

---

## ENTREGÁVEL

Um único arquivo: **`teaser.html`** na raiz do projeto.

Após gerado, testar abrindo localmente no Chrome e no Safari mobile antes de fazer push para o Vercel.

---

*Prompt para Claude Code — Master Spirit · Spyrit Systems*  
*Versão: 1.0 · Março 2026*

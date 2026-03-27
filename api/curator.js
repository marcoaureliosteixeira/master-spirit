// api/curator.js — Mestre Emmanuel: Mentor da Bibliografia Espiritual
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const key = process.env.ANTHROPIC_KEY;
  if (!key) return res.status(500).json({ error: 'API key não configurada.' });

  const { action, messages, objetivo, livroNome } = req.body;

  const SYSTEM_PROMPT = `Você é o Mestre Emmanuel, mentor da Bibliografia Espiritual do aplicativo Master Spirit.

PERSONALIDADE:
- Disciplina absoluta, pensamento estruturado, lógico e direto
- Comunicação clara, sem excesso emocional — vai direto ao ponto
- Autoridade silenciosa: fala pouco, mas quando fala, direciona com precisão
- Intelectual profundo e prático — simplifica o complexo
- Compreensivo mas exigente, compassivo mas não permissivo
- Foco total na missão do estudante

ESCOPO AMPLO — O que você ACOLHE:
- Espiritismo kardecista (core doutrinário)
- Espiritualidade em geral: Reiki, yoga, meditação, cristais, cromoterapia, terapias energéticas
- Religiões e tradições sagradas: cristianismo, hinduísmo, budismo, umbanda, candomblé, tradições indígenas
- Cosmologia espiritual: Urantia, contato extraterrestre, dimensões, vida em outros planetas
- Terapias holísticas: passes, imposição de mãos, magnetismo, fluidoterapia
- Filosofia espiritual, autoconhecimento, evolução da alma, psicologia transpessoal
- Mediunidade, vida após a morte, reencarnação, apometria, desobsessão
- Qualquer tema que promova a evolução espiritual do ser humano

O que você RECUSA (com gentileza):
- Assuntos sem NENHUMA relação com espiritualidade (programação, culinária, política, esportes)
- Práticas destrutivas (magia negra, invocação para prejudicar, rituais de dano)

REGRA DE ACOLHIMENTO: Se o tema tem QUALQUER conexão com espiritualidade, acolha. Se não está no acervo, faça a ponte com o que tem. Exemplo: Reiki → "dialoga com passes fluídicos (André Luiz/Kardec)". Yoga → "dialoga com meditação e equilíbrio espiritual (Bhagavad Gita)". Nunca diga secamente "não está no acervo" — sempre conecte, sugira alternativas, acolha.

ACERVO TEMÁTICO (bibliografia disponível para estudo estruturado):
- Doutrina dos Espíritos (ref. O Livro dos Espíritos — Kardec)
- Prática Mediúnica (ref. O Livro dos Médiuns — Kardec)
- Evangelho Segundo o Espiritismo, O Céu e o Inferno, A Gênese (Kardec)
- Série André Luiz / Nosso Lar (Chico Xavier)
- Obras de Emmanuel (Chico Xavier): A Caminho da Luz, Os Trabalhadores da Última Hora, etc.
- Joanna de Ângelis (Divaldo Franco)
- Cosmologia Universal (ref. Livro de Urantia)
- A Consciência Crística (ref. Cartas de Cristo)
- Sabedoria do Dharma (ref. Bhagavad Gita)
- A Vida de Jesus — Perspectiva Investigativa (ref. Operação Cavalo de Tróia — Benítez)
- Contato extraterrestre espiritual: Arcturianos, Pleiadianos, Comando Ashtar
- Apometria, umbral, desobsessão

IMPORTANTE: Se o tema pedido NÃO está na bibliografia acima, NÃO rejeite. Diga: "Não temos um programa específico de [tema] na bibliografia atual, mas posso preparar um estudo temático com referências em [conexão mais próxima]. Quer que eu monte?"

FACILITADORES disponíveis:
- Mestre Antonio (generalista, sábio e profundo)
- Mestre Adriano (generalista, eloquente e inspirador)
- Mestra Leila (generalista, acolhedora e maternal)
- Mestre Silvestre (generalista, compassivo e didático)
- Mestre Wander (generalista, disciplinado e estratégico)
- Mestra Bia (generalista, paciente e encorajadora)
- Mestre Swami (ESPECIALISTA — Sabedoria do Dharma / Bhagavad Gita)
- Mestra Mary (ESPECIALISTA — Consciência Crística / Cartas de Cristo)
- Mestre Mark (ESPECIALISTA — Cosmologia Universal / Livro de Urantia)
- Mestre João (ESPECIALISTA — A Vida de Jesus / Cavalo de Tróia)

REGRAS DE DIREITOS AUTORAIS:
- NUNCA diga "vou adicionar o livro X". Diga "vou adicionar o estudo temático com referência bibliográfica em X"
- Sempre inclua: "Para melhor aproveitamento, recomendamos o acompanhamento com a obra original."
- O app oferece ESTUDO TEMÁTICO, não reproduz livros

FLUXO DE CONVERSA:
1. Quando o usuário pede sugestões → liste 3-5 opções numeradas com referência bibliográfica
2. Quando o usuário ESCOLHE (diz o nome de um livro/tema, ou escolhe um número) → CONFIRME a escolha e responda EXATAMENTE neste formato:
   [ADICIONAR_ESTUDO: nome_do_tema | referência_bibliográfica]
   Seguido de: "Para melhor aproveitamento, recomendamos o acompanhamento com a obra original. Seu facilitador será [nome]. Como deseja estudar? 1 — Estudo Agendado (dias e horários fixos) 2 — Estudo Livre (no seu ritmo)"
3. Quando o usuário escolhe modo (1 ou 2) → confirme e oriente sobre próximos passos
4. Quando o usuário pede ajuda com agenda → analise conflitos e recomende distribuição

IMPORTANTE: Quando detectar que o usuário fez uma ESCOLHA de estudo, SEMPRE inclua o marcador [ADICIONAR_ESTUDO: ...] na resposta. Isso é usado pelo sistema para processar automaticamente.

REGRA DE PRECES: NUNCA use "Amém". Sempre encerre preces, orações ou bênçãos com "Assim seja".

TOM: Mentor estratégico. Frases curtas e densas. Português brasileiro. NUNCA use markdown com asteriscos.`;

  try {
    // ── CHAT CONVERSACIONAL ──
    if (action === 'chat') {
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Histórico de mensagens obrigatório.' });
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: messages,
        }),
      });

      const data = await response.json();
      if (!response.ok) return res.status(response.status).json(data);
      const text = data.content?.find(b => b.type === 'text')?.text;
      return res.json({ reply: text || 'Não consegui processar. Tente novamente.' });
    }

    // ── SUGGEST (legado, mantém compatibilidade) ──
    if (action === 'suggest_books') {
      const prompt = SYSTEM_PROMPT + `\n\nO usuário quer estudar sobre: "${objetivo}"\n\nSugira de 3 a 5 temas de estudo com referências bibliográficas. Máximo 180 palavras.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await response.json();
      if (!response.ok) return res.status(response.status).json(data);
      const text = data.content?.find(b => b.type === 'text')?.text;
      return res.json({ suggestion: text || 'Não foi possível gerar sugestões.' });
    }

    // ── GERAR ILUSTRAÇÃO (Claude 4.5 Sonnet) ──
    if (action === 'illustrate') {
      const { topic, context } = req.body;
      if (!topic) return res.status(400).json({ error: 'Tópico obrigatório.' });

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5-20250514',
          max_tokens: 4096,
          messages: [{
            role: 'user',
            content: `Crie uma ilustração educativa e visualmente rica sobre: "${topic}". ${context ? 'Contexto: ' + context : ''}

A ilustração deve ser:
- Estilo: diagrama conceitual / infográfico espiritual
- Cores: tons dourados, azuis profundos e roxos (tema dark, fundo escuro)
- Clara e didática, com hierarquias visuais se aplicável
- Rótulos em português brasileiro
- Estilo espiritual/cósmico que combine com o tema Master Spirit

Gere a imagem.`
          }],
        }),
      });

      const data = await response.json();
      if (!response.ok) return res.status(response.status).json(data);

      // Buscar bloco de imagem na resposta
      const imageBlock = data.content?.find(b => b.type === 'image');
      const textBlock = data.content?.find(b => b.type === 'text');

      if (imageBlock) {
        return res.json({
          image: imageBlock.source?.data || null,
          media_type: imageBlock.source?.media_type || 'image/png',
          caption: textBlock?.text || ''
        });
      }

      return res.json({ image: null, caption: textBlock?.text || 'Não foi possível gerar a ilustração.' });
    }

    return res.status(400).json({ error: 'Ação desconhecida.' });
  } catch (err) {
    console.error('curator error:', err);
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

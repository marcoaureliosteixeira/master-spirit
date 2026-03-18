// api/study-curriculum.js — Gera currículo completo + sessão ao vivo com professor IA
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const key = process.env.ANTHROPIC_KEY;
  if (!key) return res.status(500).json({ error: 'API key não configurada.' });

  const { action } = req.body;

  try {
    // ── GERAR CURRÍCULO ──
    if (action === 'generate_curriculum') {
      const { bookTitle, bookAuthor, bookYear, totalChapters } = req.body;
      if (!bookTitle) return res.status(400).json({ error: 'Título do livro obrigatório.' });

      const prompt = `Você é um especialista em educação espiritual. Crie um plano de estudos COMPLETO para o livro "${bookTitle}" de ${bookAuthor || 'autor desconhecido'}${bookYear ? ' (' + bookYear + ')' : ''}.

REGRA FUNDAMENTAL: O currículo DEVE cobrir 100% dos capítulos/partes do livro, sem pular NENHUM. Cada sessão deve corresponder a um capítulo ou grupo de capítulos curtos relacionados.

${totalChapters ? 'O livro tem ' + totalChapters + ' capítulos/seções.' : ''}

Retorne SOMENTE JSON válido, sem markdown, sem explicação:
{
  "overview": "objetivo do curso em 2 frases",
  "totalSessions": N,
  "estimatedHours": N,
  "sessions": [
    {
      "number": 1,
      "title": "título descritivo da sessão",
      "chapters": "Cap. 1-3",
      "topics": ["tópico 1", "tópico 2", "tópico 3"],
      "durationMinutes": 60,
      "type": "lecture"
    }
  ]
}

Tipos: lecture (aula expositiva), discussion (debate sobre o tema), practice (exercícios de reflexão), review (revisão e síntese).
Duração por sessão: 45-90 minutos.
Escreva em português brasileiro.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await response.json();
      if (!response.ok) return res.status(response.status).json(data);

      const text = data.content?.find(b => b.type === 'text')?.text;
      if (!text) return res.status(500).json({ error: 'Resposta vazia da IA.' });

      try {
        const curriculum = JSON.parse(text);
        return res.json({ curriculum });
      } catch (e) {
        // Tentar extrair JSON do texto
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          const curriculum = JSON.parse(match[0]);
          return res.json({ curriculum });
        }
        return res.status(500).json({ error: 'IA não retornou JSON válido.', raw: text });
      }
    }

    // ── PROFESSOR IA — AULA AO VIVO ──
    if (action === 'teach') {
      const { bookTitle, bookAuthor, sessionTitle, sessionChapters, sessionTopics, sessionNumber, totalSessions } = req.body;
      if (!bookTitle || !sessionTitle) return res.status(400).json({ error: 'Dados da sessão obrigatórios.' });

      const systemPrompt = `Você é um professor espiritual sábio, didático e inspirador ministrando uma aula sobre "${bookTitle}" de ${bookAuthor || ''}.

IDENTIDADE: Fale em primeira pessoa como professor. Seja envolvente, use exemplos e analogias acessíveis. Você domina profundamente esta obra.

ESTRUTURA DA AULA:
1. Abertura acolhedora (2-3 frases)
2. Contextualização do que será estudado (${sessionChapters || 'esta seção'})
3. Exposição dos tópicos principais com explicações claras
4. Para cada conceito importante: explique, dê um exemplo prático do cotidiano e relacione com o todo da obra
5. Síntese final (o que aprendemos hoje)
6. Encerramento convidando perguntas

TOM: Acolhedor, didático, profundo mas acessível. Como um professor que ama o que ensina.
CONCISÃO: Máximo 400 palavras. Seja denso mas claro.
FORMATO: Português brasileiro. NUNCA use markdown com asteriscos. Texto fluido e natural.`;

      const userPrompt = `Sessão ${sessionNumber} de ${totalSessions}: "${sessionTitle}"
Capítulos/seções: ${sessionChapters || 'ver tópicos'}
Tópicos a cobrir: ${Array.isArray(sessionTopics) ? sessionTopics.join(', ') : sessionTopics || 'conteúdo da sessão'}

Apresente a aula completa. Seja didático e inspirador.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2048,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });

      const data = await response.json();
      if (!response.ok) return res.status(response.status).json(data);

      const text = data.content?.find(b => b.type === 'text')?.text;
      return res.json({ lesson: text || 'Aula não gerada. Tente novamente.' });
    }

    // ── PROFESSOR IA — RESPONDER PERGUNTA ──
    if (action === 'answer_question') {
      const { bookTitle, bookAuthor, sessionTitle, question, studentName, lessonContext } = req.body;
      if (!question) return res.status(400).json({ error: 'Pergunta obrigatória.' });

      const systemPrompt = `Você é um professor espiritual respondendo uma pergunta de um aluno durante a aula sobre "${bookTitle}" de ${bookAuthor || ''}.
Sessão atual: "${sessionTitle}"
Responda com clareza, afeto e sabedoria. Máximo 150 palavras. NUNCA use markdown com asteriscos. Português brasileiro.`;

      const messages = [];
      if (lessonContext) {
        messages.push({ role: 'assistant', content: lessonContext });
      }
      messages.push({ role: 'user', content: `${studentName || 'Aluno'} pergunta: "${question}"` });

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
          system: systemPrompt,
          messages,
        }),
      });

      const data = await response.json();
      if (!response.ok) return res.status(response.status).json(data);

      const text = data.content?.find(b => b.type === 'text')?.text;
      return res.json({ answer: text || 'Não consegui formular a resposta. Tente reformular a pergunta.' });
    }

    return res.status(400).json({ error: 'Ação desconhecida.' });
  } catch (err) {
    console.error('study-curriculum error:', err);
    return res.status(500).json({ error: 'Erro interno. Tente novamente.' });
  }
}

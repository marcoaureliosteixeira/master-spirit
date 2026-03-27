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

      // Estrutura completa dos livros de domínio público
      const BOOK_STRUCTURES = {
        'O Livro dos Espíritos': `ESTRUTURA COMPLETA (Allan Kardec, 1857 — DOMÍNIO PÚBLICO):
Parte I — Das Causas Primárias: Cap.1 Deus (Q.1-13), Cap.2 Elementos gerais do universo (Q.14-34), Cap.3 Criação (Q.35-59), Cap.4 Princípio vital (Q.60-75)
Parte II — Do Mundo Espírita: Cap.1 Dos espíritos (Q.76-113), Cap.2 Encarnação dos espíritos (Q.114-131), Cap.3 Retorno da vida corpórea à vida espiritual (Q.132-165), Cap.4 Pluralidade das existências (Q.166-222), Cap.5 Considerações sobre a pluralidade das existências (sem perguntas), Cap.6 Vida espírita (Q.223-329), Cap.7 Retorno à vida corporal (Q.330-382), Cap.8 Emancipação da alma (Q.383-455), Cap.9 Intervenção dos espíritos no mundo corporal (Q.456-572), Cap.10 Ocupações e missões dos espíritos (Q.573-588), Cap.11 Os três reinos da natureza (Q.589-613)
Parte III — Das Leis Morais: Cap.1 Lei divina ou natural (Q.614-648), Cap.2 Lei de adoração (Q.649-673), Cap.3 Lei do trabalho (Q.674-685), Cap.4 Lei de reprodução (Q.686-700), Cap.5 Lei de conservação (Q.701-727), Cap.6 Lei de destruição (Q.728-765), Cap.7 Lei de sociedade (Q.766-775), Cap.8 Lei do progresso (Q.776-802), Cap.9 Lei de igualdade (Q.803-824), Cap.10 Lei de liberdade (Q.825-872), Cap.11 Lei de justiça, amor e caridade (Q.873-906), Cap.12 Perfeição moral (Q.907-919)
Parte IV — Das Esperanças e Consolações: Cap.1 Penas e gozos terrestres (Q.920-957), Cap.2 Penas e gozos futuros (Q.958-1019)
TOTAL: 1.019 perguntas em 4 partes. O currículo DEVE cobrir TODAS as partes e capítulos.`,

        'O Livro dos Médiuns': `ESTRUTURA COMPLETA (Allan Kardec, 1861 — DOMÍNIO PÚBLICO):
Parte I — Noções Preliminares: Cap.1 Existem espíritos?, Cap.2 O maravilhoso e o sobrenatural, Cap.3 Método, Cap.4 Sistemas
Parte II — Das Manifestações Espíritas: Cap.1 Ação dos espíritos sobre a matéria, Cap.2 Manifestações físicas — mesas girantes, Cap.3 Manifestações inteligentes, Cap.4 Teoria das manifestações físicas, Cap.5 Manifestações físicas espontâneas, Cap.6 Manifestações visuais, Cap.7 Bicorporeidade e transfiguração, Cap.8 Laboratório do mundo invisível, Cap.9 Locais assombrados, Cap.10 Natureza das comunicações, Cap.11 Sematologia e tiptologia, Cap.12 Pneumatografia ou escrita direta, Cap.13 Pneumatofonia, Cap.14 Dos médiuns, Cap.15 Médiuns escreventes ou psicógrafos, Cap.16 Médiuns especiais, Cap.17 Formação dos médiuns, Cap.18 Inconvenientes e perigos da mediunidade, Cap.19 Papel do médium nas comunicações, Cap.20 Influência moral do médium, Cap.21 Influência do meio, Cap.22 Da mediunidade nos animais, Cap.23 Da obsessão, Cap.24 Identidade dos espíritos, Cap.25 Evocações, Cap.26 Perguntas que se podem fazer aos espíritos, Cap.27 Contradições e mistificações, Cap.28 Charlatanismo e prestidigitação, Cap.29 Reuniões e sociedades espíritas, Cap.30 Regulamento da Sociedade Parisiense de Estudos Espíritas, Cap.31 Dissertações espíritas, Cap.32 Vocabulário espírita
TOTAL: 32 capítulos em 2 partes. O currículo DEVE cobrir TODOS.`,

        'Bhagavad Gita': `ESTRUTURA COMPLETA (Texto sagrado hindu — DOMÍNIO PÚBLICO):
Cap.1 O Desânimo de Arjuna (Arjuna Vishada Yoga), Cap.2 O Yoga do Conhecimento (Sankhya Yoga), Cap.3 O Yoga da Ação (Karma Yoga), Cap.4 O Yoga do Conhecimento e da Renúncia à Ação (Jnana Karma Sannyasa Yoga), Cap.5 O Yoga da Renúncia (Karma Sannyasa Yoga), Cap.6 O Yoga da Meditação (Dhyana Yoga), Cap.7 O Yoga do Conhecimento e da Sabedoria (Jnana Vijnana Yoga), Cap.8 O Yoga do Brahman Imperecível (Akshara Brahma Yoga), Cap.9 O Yoga do Conhecimento Real e do Mistério Real (Raja Vidya Raja Guhya Yoga), Cap.10 O Yoga das Manifestações Divinas (Vibhuti Yoga), Cap.11 A Visão da Forma Universal (Vishvarupa Darshana Yoga), Cap.12 O Yoga da Devoção (Bhakti Yoga), Cap.13 O Yoga da Distinção entre Campo e Conhecedor (Kshetra Kshetrajna Vibhaga Yoga), Cap.14 O Yoga da Distinção das Três Qualidades (Gunatraya Vibhaga Yoga), Cap.15 O Yoga da Pessoa Suprema (Purushottama Yoga), Cap.16 O Yoga da Distinção entre Qualidades Divinas e Demoníacas (Daivasura Sampad Vibhaga Yoga), Cap.17 O Yoga da Distinção da Tríplice Fé (Shraddhatraya Vibhaga Yoga), Cap.18 O Yoga da Libertação pela Renúncia (Moksha Sannyasa Yoga)
TOTAL: 18 capítulos, 700 versos. O currículo DEVE cobrir TODOS os 18 capítulos.`,

        'O Evangelho Segundo o Espiritismo': `ESTRUTURA COMPLETA (Allan Kardec, 1864 — DOMÍNIO PÚBLICO):
Cap.1 Não vim destruir a lei, Cap.2 Meu reino não é deste mundo, Cap.3 Há muitas moradas na casa de meu Pai, Cap.4 Ninguém poderá ver o reino de Deus se não nascer de novo, Cap.5 Bem-aventurados os aflitos, Cap.6 O Cristo Consolador, Cap.7 Bem-aventurados os pobres de espírito, Cap.8 Bem-aventurados os que têm puro o coração, Cap.9 Bem-aventurados os que são brandos e pacíficos, Cap.10 Bem-aventurados os que são misericordiosos, Cap.11 Amar o próximo como a si mesmo, Cap.12 Amai os vossos inimigos, Cap.13 Que a mão esquerda não saiba o que faz a direita, Cap.14 Honrai vosso pai e vossa mãe, Cap.15 Fora da caridade não há salvação, Cap.16 Não se pode servir a Deus e a Mamon, Cap.17 Sede perfeitos, Cap.18 Muitos os chamados poucos os escolhidos, Cap.19 A fé transporta montanhas, Cap.20 Os trabalhadores da última hora, Cap.21 Haverá falsos cristos e falsos profetas, Cap.22 Não separeis o que Deus juntou, Cap.23 Estranha moral, Cap.24 Não ponhais a candeia debaixo do alqueire, Cap.25 Buscai e achareis, Cap.26 Dai gratuitamente o que gratuitamente recebestes, Cap.27 Pedi e obtereis, Cap.28 Coletânea de preces espíritas
TOTAL: 28 capítulos. O currículo DEVE cobrir TODOS.`,

        'O Céu e o Inferno': `ESTRUTURA COMPLETA (Allan Kardec, 1865 — DOMÍNIO PÚBLICO):
Parte I — Doutrina: Cap.1 O porvir e o nada, Cap.2 Temor da morte, Cap.3 O céu, Cap.4 O inferno, Cap.5 O purgatório, Cap.6 Doutrina das penas eternas, Cap.7 As penas futuras segundo o Espiritismo, Cap.8 Os anjos, Cap.9 Os demônios, Cap.10 Intervenção dos demônios, Cap.11 Da proibição de evocar os mortos
Parte II — Exemplos: Cap.1 A passagem, Cap.2 Espíritos felizes, Cap.3 Espíritos em condições medianas, Cap.4 Espíritos sofredores, Cap.5 Suicidas, Cap.6 Espíritos arrependidos, Cap.7 Espíritos endurecidos, Cap.8 Expiações terrestres
TOTAL: 19 capítulos em 2 partes.`,

        'A Gênese': `ESTRUTURA COMPLETA (Allan Kardec, 1868 — DOMÍNIO PÚBLICO):
Cap.1 Caráter da revelação espírita, Cap.2 Deus, Cap.3 O bem e o mal, Cap.4 Papel da ciência na Gênese, Cap.5 Antigos e modernos sistemas do mundo, Cap.6 Uranografia geral, Cap.7 Esboço geológico da Terra, Cap.8 Teorias sobre a Terra, Cap.9 Revoluções do globo, Cap.10 Gênese orgânica, Cap.11 Gênese espiritual, Cap.12 Gênese mosaica, Cap.13 Os milagres segundo o Espiritismo, Cap.14 Os fluidos, Cap.15 Os milagres do Evangelho, Cap.16 Teoria da presciência, Cap.17 Predições do Evangelho, Cap.18 Os tempos são chegados
TOTAL: 18 capítulos.`
      };

      // Verificar se temos estrutura pré-definida para este livro
      let bookStructure = '';
      for (const [title, structure] of Object.entries(BOOK_STRUCTURES)) {
        if (bookTitle.toLowerCase().includes(title.toLowerCase()) || title.toLowerCase().includes(bookTitle.toLowerCase())) {
          bookStructure = structure;
          break;
        }
      }

      const prompt = `Você é um especialista em educação espiritual. Crie um plano de estudos COMPLETO para o livro "${bookTitle}" de ${bookAuthor || 'autor desconhecido'}${bookYear ? ' (' + bookYear + ')' : ''}.

REGRA FUNDAMENTAL: O currículo DEVE cobrir 100% dos capítulos/partes do livro, sem pular NENHUM. Cada sessão deve corresponder a um capítulo ou grupo de capítulos curtos relacionados.

${bookStructure ? bookStructure : (totalChapters ? 'O livro tem ' + totalChapters + ' capítulos/seções.' : '')}

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

      // Detectar se é livro de domínio público
      const isDomPublico = ['Livro dos Espíritos','Livro dos Médiuns','Evangelho Segundo','Bhagavad Gita','Céu e o Inferno','Gênese','Urantia'].some(t => (bookTitle||'').includes(t));

      const systemPrompt = `Você é um professor espiritual sábio, didático e inspirador ministrando uma aula sobre "${bookTitle}" de ${bookAuthor || ''}.

IDENTIDADE: Fale em primeira pessoa como professor. Seja envolvente, use exemplos e analogias acessíveis. Você domina profundamente esta obra.

${isDomPublico ? 'OBRA DE DOMÍNIO PÚBLICO: Esta obra é de domínio público. Você pode e DEVE citar trechos, perguntas e respostas originais do livro fielmente. Reproduza o conteúdo original quando relevante, intercalando com suas explicações didáticas.' : 'OBRA COM DIREITOS AUTORAIS: NÃO reproduza trechos literais. Faça estudo temático com referências bibliográficas. Sempre recomende a aquisição do livro original.'}

ESTRUTURA DA AULA:
1. Abertura acolhedora (2-3 frases)
2. Contextualização do que será estudado (${sessionChapters || 'esta seção'})
3. Exposição dos tópicos principais com explicações claras
4. Para cada conceito importante: explique, dê um exemplo prático do cotidiano e relacione com o todo da obra
5. Síntese final (o que aprendemos hoje)
6. Encerramento convidando perguntas

TOM: Acolhedor, didático, profundo mas acessível. Como um professor que ama o que ensina.
CONCISÃO: Máximo 400 palavras. Seja denso mas claro.
FORMATO: Português brasileiro. NUNCA use markdown com asteriscos. Texto fluido e natural.
NUNCA use "Amém" — sempre use "Assim seja" para encerrar preces ou bênçãos.`;

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

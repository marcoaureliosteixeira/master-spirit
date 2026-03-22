// api/curator.js — Mestre Emmanuel: Curador da Biblioteca Espiritual
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const key = process.env.ANTHROPIC_KEY;
  if (!key) return res.status(500).json({ error: 'API key não configurada.' });

  const { action, objetivo, livroNome } = req.body;

  try {
    if (action === 'suggest_books') {
      const prompt = `Você é o Mestre Emmanuel, curador da Biblioteca Espiritual do Master Spirit.

PERSONALIDADE:
- Disciplina absoluta, pensamento estruturado, lógico e direto
- Comunicação clara, sem excesso emocional — vai direto ao ponto
- Autoridade silenciosa: fala pouco, mas quando fala, direciona com precisão
- Intelectual profundo e prático — simplifica o complexo, não é acadêmico vaidoso
- Compreensivo mas exigente, compassivo mas não permissivo
- Firme nas recomendações — corrige com firmeza quando necessário
- Sem vaidade, sem busca de validação — foco total na missão do estudante

TOM: Mentor estratégico de alto nível. Frases curtas e densas. Cada palavra tem peso.

Seu acervo inclui:
- Codificação Kardecista (O Livro dos Espíritos, Livro dos Médiuns, Evangelho Segundo o Espiritismo, O Céu e o Inferno, A Gênese)
- Obras psicografadas: Chico Xavier (série André Luiz, Emmanuel, Humberto de Campos), Divaldo Franco (Joanna de Ângelis), Yvonne Pereira
- Cosmologia espiritual: Livro de Urantia, Cartas de Cristo
- Espiritualidade Oriental: Bhagavad Gita, Vedas, Dhammapada
- Operação Cavalo de Tróia (J.J. Benítez, 11 volumes)
- Contato extraterrestre e vida em outros planetas: Arcturianos, Pleiadianos, Comando Ashtar
- Apometria, umbral, desobsessão
- Os Trabalhadores da Última Hora, A Caminho da Luz (Emmanuel/Chico Xavier)

O usuário criou uma sala de estudo com o seguinte objetivo:
"${objetivo}"

Sugira de 3 a 5 livros que melhor atendam esse objetivo. Para cada livro:
- Nome completo
- Autor
- 1 frase direta explicando POR QUE este livro é relevante

Responda como Emmanuel — direto, preciso, sem rodeios. Faça conexões estratégicas entre as obras.
Formato: texto natural, não lista técnica. Máximo 180 palavras.
Português brasileiro. NUNCA use markdown com asteriscos.`;

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

    if (action === 'validate_book') {
      const prompt = `Você é uma pesquisadora especialista em literatura espiritual. O usuário quer adicionar o livro "${livroNome}" à sua biblioteca de estudos espirituais.

Avalie:
1. Este livro existe? É uma obra real?
2. Está dentro do escopo espiritual/espiritualista? (Espiritismo, espiritualidade, religião, filosofia espiritual, contato extraterrestre espiritual, cosmologia, vida após a morte, reencarnação, mediunidade, tradições sagradas)
3. Quem é o autor?

Responda em JSON:
{"valid": true/false, "name": "nome correto do livro", "author": "autor", "reason": "1 frase justificando"}

Se não conhecer o livro mas o tema parecer relevante, retorne valid:true com author:"A confirmar".
Retorne SOMENTE o JSON, sem markdown.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 512,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await response.json();
      if (!response.ok) return res.status(response.status).json(data);
      const text = data.content?.find(b => b.type === 'text')?.text;
      try {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) return res.json(JSON.parse(match[0]));
      } catch (e) {}
      return res.json({ valid: true, name: livroNome, author: 'A confirmar', reason: 'Validação automática' });
    }

    return res.status(400).json({ error: 'Ação desconhecida.' });
  } catch (err) {
    console.error('curator error:', err);
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

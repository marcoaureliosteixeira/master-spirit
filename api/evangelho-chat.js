// api/evangelho-chat.js — Facilitador IA do Evangelho no Lar
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const key = process.env.ANTHROPIC_KEY;
  if (!key) return res.status(500).json({ error: 'API key não configurada.' });

  const { action, facilitador, etapa, trecho, capitulo, item, participantes, contexto } = req.body;

  const baseSystem = `Você é ${facilitador?.nome || 'um facilitador espiritual'}, ${facilitador?.descricao || 'educador amoroso e acolhedor'}.
Seu estilo é ${facilitador?.estilo || 'acolhedor'}.

Você facilita o Evangelho no Lar baseado em "O Evangelho Segundo o Espiritismo" de Allan Kardec.
Esta é uma prática espírita familiar simples, sem rituais, baseada no estudo racional da moral de Jesus.

Diretrizes:
- Fale em primeira pessoa como ${facilitador?.nome || 'facilitador'}
- Seja acolhedor, inclusivo e amoroso — nunca dogmático ou impositivo
- Adapte a linguagem para que crianças e idosos entendam
- Nas reflexões, conecte o trecho de Kardec com situações do cotidiano
- Nunca mencione outras religiões de forma negativa
- Número de participantes: ${participantes || '1'}
${contexto ? '- Contexto familiar: ' + contexto : ''}
- Português brasileiro. NUNCA use markdown com asteriscos.`;

  try {
    let userPrompt = '';

    if (action === 'prece_inicial') {
      userPrompt = `Gere uma prece de abertura para o Evangelho no Lar. Deve ser espontânea, amorosa e breve (máximo 100 palavras). Peça proteção espiritual, agradeça pela oportunidade de estudo e peça luz para a compreensão. Não use fórmulas prontas — seja original e sentido.`;
    }

    else if (action === 'comentarios') {
      userPrompt = `O grupo acabou de ler o seguinte trecho do Evangelho Segundo o Espiritismo:

Capítulo ${capitulo || '?'}, Item ${item || '?'}:
"${trecho || ''}"

Faça:
1. Uma reflexão inicial sobre este trecho (3-4 frases, conectando com o cotidiano)
2. Proponha 2 perguntas para o grupo refletir e discutir

Seja profundo mas acessível. Máximo 200 palavras.`;
    }

    else if (action === 'responder_reflexao') {
      const { pergunta, reflexao_usuario } = req.body;
      userPrompt = `Durante a discussão sobre o trecho do Evangelho (Cap. ${capitulo}, Item ${item}):
"${trecho || ''}"

${reflexao_usuario ? 'O participante compartilhou: "' + reflexao_usuario + '"' : 'O participante fez a pergunta: "' + (pergunta || '') + '"'}

Responda como facilitador — com acolhimento, sabedoria e afeto. Máximo 100 palavras.`;
    }

    else if (action === 'prece_final') {
      userPrompt = `Gere uma prece de encerramento para o Evangelho no Lar. O grupo estudou o Capítulo ${capitulo || '?'}, Item ${item || '?'} do Evangelho Segundo o Espiritismo. Agradeça pelos aprendizados, peça que os bons espíritos continuem nos guiando e encerre com palavras de paz. Breve e sentida (máximo 80 palavras). NÃO inclua o Pai Nosso — ele será exibido separadamente.`;
    }

    else {
      return res.status(400).json({ error: 'Ação desconhecida.' });
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
        system: baseSystem,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);

    const text = data.content?.find(b => b.type === 'text')?.text;
    return res.json({ text: text || 'Não foi possível gerar o conteúdo.' });
  } catch (err) {
    console.error('evangelho-chat error:', err);
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

// api/tts.js — Vercel Serverless Function
// Text-to-Speech via ElevenLabs (chave segura no servidor)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.ELEVENLABS_KEY;
  const defaultVoice = process.env.ELEVENLABS_VOICE || 'XNKrDiLvCkrRbQpjHoYo';

  if (!key) {
    return res.status(500).json({ error: 'ElevenLabs not configured' });
  }

  try {
    const { text, voice_id } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Limitar texto a 5000 caracteres
    const trimmedText = text.substring(0, 5000);
    const voiceId = voice_id || defaultVoice;

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': key,
      },
      body: JSON.stringify({
        text: trimmedText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 1.0,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('ElevenLabs error:', errorData);
      return res.status(response.status).json({ error: errorData.detail || 'TTS failed' });
    }

    // Stream the audio back
    const audioBuffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // cache 24h
    return res.status(200).send(Buffer.from(audioBuffer));
  } catch (err) {
    console.error('TTS error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}

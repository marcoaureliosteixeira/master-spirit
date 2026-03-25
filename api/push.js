// api/push.js — Registrar device + Enviar push notifications
import webpush from 'web-push';

// VAPID keys — gerar uma vez com: npx web-push generate-vapid-keys
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || '';

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails('mailto:contato@spyritsystems.com', VAPID_PUBLIC, VAPID_PRIVATE);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { createClient } = await import('@supabase/supabase-js');
  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  const { action } = req.body;

  try {
    // ── REGISTRAR SUBSCRIPTION ──
    if (action === 'subscribe') {
      const { user_id, subscription } = req.body;
      if (!user_id || !subscription) return res.status(400).json({ error: 'Dados obrigatórios.' });

      await sb.from('push_subscriptions').upsert({
        user_id,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        subscription: subscription,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

      return res.json({ ok: true });
    }

    // ── ENVIAR PUSH PARA UM USUÁRIO ──
    if (action === 'send') {
      const { user_id, title, body, url } = req.body;
      const { data } = await sb.from('push_subscriptions').select('subscription').eq('user_id', user_id).maybeSingle();
      if (!data || !data.subscription) return res.json({ ok: false, reason: 'No subscription' });

      await webpush.sendNotification(data.subscription, JSON.stringify({
        title: title || 'Master Spirit',
        body: body || '',
        icon: 'logo.png',
        url: url || '/'
      }));

      return res.json({ ok: true });
    }

    // ── CRON: VERIFICAR SESSÕES AGENDADAS E ENVIAR LEMBRETES ──
    if (action === 'check_reminders') {
      const now = new Date();
      const dayMap = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
      const currentDay = dayMap[now.getDay()];
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();

      // Buscar todos os usuários com push registrado
      const { data: subs } = await sb.from('push_subscriptions').select('user_id, subscription');
      if (!subs || subs.length === 0) return res.json({ sent: 0 });

      var sent = 0;

      for (const sub of subs) {
        // Verificar config do evangelho no banco (futuro) ou enviar para todos que têm subscription
        // Por enquanto: enviar lembrete se é o dia/hora certo
        try {
          await webpush.sendNotification(sub.subscription, JSON.stringify({
            title: '🕯️ Evangelho no Lar',
            body: 'Sua sessão começa em 5 minutos. Reúna a família!',
            icon: 'logo.png',
            url: '/evangelho.html'
          }));
          sent++;
        } catch (e) {
          // Subscription expirada — remover
          if (e.statusCode === 410) {
            await sb.from('push_subscriptions').delete().eq('user_id', sub.user_id);
          }
        }
      }

      return res.json({ sent });
    }

    return res.status(400).json({ error: 'Ação desconhecida.' });
  } catch (err) {
    console.error('push error:', err);
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

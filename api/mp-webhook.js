// api/mp-webhook.js — Webhook Mercado Pago → atualiza plano no Supabase
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const accessToken = process.env.MP_ACCESS_TOKEN;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  const { type, data } = req.body;

  try {
    if (type === 'subscription_preapproval') {
      const r = await fetch(`https://api.mercadopago.com/preapproval/${data.id}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      const preapproval = await r.json();

      if (preapproval.status === 'authorized') {
        const userId = preapproval.external_reference;
        const plan = preapproval.auto_recurring.transaction_amount <= 20 ? 'basic' : 'premium';

        await fetch(`${supabaseUrl}/rest/v1/user_usage`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates',
          },
          body: JSON.stringify({ id: userId, plan, chats_used: 0 }),
        });
      }

      if (preapproval.status === 'cancelled') {
        const userId = preapproval.external_reference;
        await fetch(`${supabaseUrl}/rest/v1/user_usage?id=eq.${userId}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ plan: 'free' }),
        });
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: err.message });
  }
}

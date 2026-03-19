// api/checkout.js — Cria assinatura Mercado Pago
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { plan, user_id, user_email } = req.body;
  const accessToken = process.env.MP_ACCESS_TOKEN;

  if (!accessToken) return res.status(500).json({ error: 'MP não configurado' });

  const prices = { essencial: 19.90, basic: 19.90, premium: 39.90, sala: 9.90 };
  const names  = { essencial: 'Master Spirit Essencial', basic: 'Master Spirit Essencial', premium: 'Master Spirit Premium', sala: 'Master Spirit Sala de Estudo' };

  if (!prices[plan]) return res.status(400).json({ error: 'Plano inválido' });

  try {
    const response = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason: names[plan],
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: prices[plan],
          currency_id: 'BRL',
        },
        back_url: 'https://masterspirit.com.br/app.html',
        payer_email: user_email,
        external_reference: user_id,
        status: 'pending',
      }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);

    return res.status(200).json({ init_point: data.init_point });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

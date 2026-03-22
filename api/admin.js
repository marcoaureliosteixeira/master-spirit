const { createClient } = require('@supabase/supabase-js');

const ADMIN_EMAIL = 'marcoaureliosteixeira@gmail.com';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { action, token } = req.body || {};
  if (!token) return res.status(401).json({ error: 'no_token' });

  const sb = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  // Verifica se o token pertence ao admin
  const { data: { user }, error: authErr } = await sb.auth.getUser(token);
  if (authErr || !user || user.email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'forbidden' });
  }

  try {
    if (action === 'stats') {
      // Total de usuários por plano
      const { data: usage } = await sb.from('user_usage').select('plan, chats_used');
      const plans = { free: 0, basic: 0, premium: 0 };
      let totalChats = 0;
      (usage || []).forEach(u => {
        plans[u.plan] = (plans[u.plan] || 0) + 1;
        totalChats += u.chats_used || 0;
      });

      // MRR estimado
      const mrr = (plans.basic * 19.90) + (plans.premium * 39.90);

      // Total de usuários cadastrados
      const { data: allUsers } = await sb.auth.admin.listUsers();
      const totalUsers = allUsers?.users?.length || 0;

      return res.json({ plans, mrr, totalChats, totalUsers });
    }

    if (action === 'users') {
      const { data: allUsers } = await sb.auth.admin.listUsers();
      const { data: usage } = await sb.from('user_usage').select('*');
      const usageMap = {};
      (usage || []).forEach(u => { usageMap[u.id] = u; });

      const users = (allUsers?.users || []).map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in: u.last_sign_in_at,
        plan: usageMap[u.id]?.plan || 'free',
        chats_used: usageMap[u.id]?.chats_used || 0,
      }));

      return res.json({ users });
    }

    if (action === 'set_plan') {
      const { user_id, plan } = req.body;
      await sb.from('user_usage').upsert({ id: user_id, plan, chats_used: 0 }, { onConflict: 'id' });
      return res.json({ ok: true });
    }

    return res.status(400).json({ error: 'unknown_action' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

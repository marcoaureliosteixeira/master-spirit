// api/study-groups.js — CRUD de Grupos de Estudo
const { createClient } = require('@supabase/supabase-js');

const MAX_MEMBERS = 10;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const sb = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { action, token } = req.body || {};
  if (!token) return res.status(401).json({ error: 'Token obrigatório' });

  // Verificar usuário
  const { data: { user }, error: authErr } = await sb.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Não autenticado' });

  // Verificar plano premium
  const { data: usage } = await sb.from('user_usage').select('plan').eq('id', user.id).single();
  const userPlan = usage?.plan || 'free';

  try {
    // ── CRIAR GRUPO ──
    if (action === 'create_group') {
      if (userPlan !== 'premium') {
        return res.status(403).json({ error: 'Apenas plano Premium pode criar grupos de estudo.' });
      }
      const { name, description, room_id } = req.body;
      if (!name || !room_id) return res.status(400).json({ error: 'Nome e sala são obrigatórios.' });

      const { data: group, error } = await sb.from('study_groups').insert({
        name, description: description || '', room_id, coordinator_id: user.id
      }).select().single();
      if (error) return res.status(500).json({ error: error.message });

      // Adicionar coordenador como membro
      await sb.from('study_group_members').insert({
        group_id: group.id, user_id: user.id, role: 'coordinator'
      });

      return res.json({ group });
    }

    // ── LISTAR MEUS GRUPOS ──
    if (action === 'my_groups') {
      // Grupos que coordeno
      const { data: coordinated } = await sb.from('study_groups')
        .select('*, study_group_members(count)')
        .eq('coordinator_id', user.id)
        .eq('is_active', true);

      // Grupos que participo
      const { data: memberships } = await sb.from('study_group_members')
        .select('group_id')
        .eq('user_id', user.id)
        .neq('role', 'coordinator');

      const memberGroupIds = (memberships || []).map(m => m.group_id);
      let memberGroups = [];
      if (memberGroupIds.length > 0) {
        const { data } = await sb.from('study_groups')
          .select('*, study_group_members(count)')
          .in('id', memberGroupIds)
          .eq('is_active', true);
        memberGroups = data || [];
      }

      return res.json({ coordinated: coordinated || [], member_of: memberGroups });
    }

    // ── DETALHES DO GRUPO ──
    if (action === 'group_details') {
      const { group_id } = req.body;
      if (!group_id) return res.status(400).json({ error: 'group_id obrigatório' });

      const { data: group } = await sb.from('study_groups').select('*').eq('id', group_id).single();
      if (!group) return res.status(404).json({ error: 'Grupo não encontrado' });

      const { data: members } = await sb.from('study_group_members')
        .select('user_id, role, joined_at')
        .eq('group_id', group_id);

      // Buscar emails dos membros
      const memberDetails = [];
      for (const m of (members || [])) {
        const { data: { user: u } } = await sb.auth.admin.getUserById(m.user_id);
        memberDetails.push({ ...m, email: u?.email || 'desconhecido' });
      }

      const { data: invites } = await sb.from('study_group_invites')
        .select('*')
        .eq('group_id', group_id)
        .eq('status', 'pending');

      return res.json({ group, members: memberDetails, pending_invites: invites || [] });
    }

    // ── CONVIDAR POR EMAIL ──
    if (action === 'invite') {
      const { group_id, email } = req.body;
      if (!group_id || !email) return res.status(400).json({ error: 'group_id e email obrigatórios' });

      // Verificar se é coordenador
      const { data: group } = await sb.from('study_groups').select('*').eq('id', group_id).single();
      if (!group || group.coordinator_id !== user.id) {
        return res.status(403).json({ error: 'Apenas o coordenador pode convidar.' });
      }

      // Verificar limite de membros
      const { count } = await sb.from('study_group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', group_id);
      if (count >= MAX_MEMBERS) {
        return res.status(400).json({ error: `Limite de ${MAX_MEMBERS} membros atingido.` });
      }

      // Verificar se já é membro
      const { data: allUsers } = await sb.auth.admin.listUsers();
      const invitedUser = allUsers?.users?.find(u => u.email === email.toLowerCase());

      if (invitedUser) {
        const { data: existing } = await sb.from('study_group_members')
          .select('id').eq('group_id', group_id).eq('user_id', invitedUser.id).single();
        if (existing) return res.status(400).json({ error: 'Essa pessoa já é membro do grupo.' });
      }

      // Verificar se já tem convite pendente
      const { data: existingInvite } = await sb.from('study_group_invites')
        .select('id').eq('group_id', group_id).eq('email', email.toLowerCase()).eq('status', 'pending').single();
      if (existingInvite) return res.status(400).json({ error: 'Já existe um convite pendente para este email.' });

      // Criar convite
      const { data: invite, error } = await sb.from('study_group_invites').insert({
        group_id, email: email.toLowerCase(), invited_by: user.id
      }).select().single();
      if (error) return res.status(500).json({ error: error.message });

      const registered = !!invitedUser;
      let needsPlan = false;
      if (invitedUser) {
        const { data: invUsage } = await sb.from('user_usage').select('plan').eq('id', invitedUser.id).single();
        const invPlan = invUsage?.plan || 'free';
        needsPlan = (invPlan === 'free');
      }

      return res.json({
        invite,
        user_registered: registered,
        needs_plan: needsPlan,
        message: registered
          ? (needsPlan ? 'Convite enviado. O usuário precisará do plano Sala de Estudo (R$ 9,90/mês) para acessar.' : 'Convite enviado com sucesso!')
          : 'Usuário não cadastrado. Receberá um convite para se registrar no app.'
      });
    }

    // ── MEUS CONVITES PENDENTES ──
    if (action === 'my_invites') {
      const { data: invites } = await sb.from('study_group_invites')
        .select('*, study_groups(name, room_id)')
        .eq('email', user.email)
        .eq('status', 'pending');

      return res.json({ invites: invites || [] });
    }

    // ── ACEITAR CONVITE ──
    if (action === 'accept_invite') {
      const { invite_id } = req.body;
      if (!invite_id) return res.status(400).json({ error: 'invite_id obrigatório' });

      const { data: invite } = await sb.from('study_group_invites')
        .select('*').eq('id', invite_id).single();
      if (!invite || invite.email !== user.email) {
        return res.status(403).json({ error: 'Convite não encontrado ou não pertence a você.' });
      }

      // Verificar se tem acesso (plano premium/essencial ou acesso avulso)
      const hasAccess = userPlan === 'premium' || userPlan === 'essencial' || userPlan === 'basic';
      if (!hasAccess) {
        // Verificar acesso avulso à sala
        const { data: roomAcc } = await sb.from('room_access')
          .select('id').eq('user_id', user.id).eq('room_id', invite.room_id || '').single();
        if (!roomAcc) {
          return res.status(402).json({
            error: 'needs_room_plan',
            room_id: invite.room_id,
            message: 'Você precisa do plano Sala de Estudo (R$ 9,90/mês) para acessar este grupo.'
          });
        }
      }

      // Verificar limite de membros
      const { count } = await sb.from('study_group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', invite.group_id);
      if (count >= MAX_MEMBERS) {
        return res.status(400).json({ error: 'Grupo cheio. Limite de 10 membros.' });
      }

      // Aceitar
      await sb.from('study_group_invites').update({ status: 'accepted' }).eq('id', invite_id);
      await sb.from('study_group_members').insert({
        group_id: invite.group_id, user_id: user.id, role: 'member'
      });

      return res.json({ ok: true, message: 'Você agora faz parte do grupo!' });
    }

    // ── REJEITAR CONVITE ──
    if (action === 'reject_invite') {
      const { invite_id } = req.body;
      await sb.from('study_group_invites').update({ status: 'rejected' }).eq('id', invite_id);
      return res.json({ ok: true });
    }

    // ── REMOVER MEMBRO ──
    if (action === 'remove_member') {
      const { group_id, member_user_id } = req.body;
      const { data: group } = await sb.from('study_groups').select('coordinator_id').eq('id', group_id).single();
      if (!group || group.coordinator_id !== user.id) {
        return res.status(403).json({ error: 'Apenas o coordenador pode remover membros.' });
      }
      await sb.from('study_group_members').delete().eq('group_id', group_id).eq('user_id', member_user_id);
      return res.json({ ok: true });
    }

    // ── DESATIVAR GRUPO ──
    if (action === 'delete_group') {
      const { group_id } = req.body;
      const { data: group } = await sb.from('study_groups').select('coordinator_id').eq('id', group_id).single();
      if (!group || group.coordinator_id !== user.id) {
        return res.status(403).json({ error: 'Apenas o coordenador pode desativar o grupo.' });
      }
      await sb.from('study_groups').update({ is_active: false }).eq('id', group_id);
      return res.json({ ok: true });
    }

    return res.status(400).json({ error: 'Ação desconhecida' });
  } catch (e) {
    console.error('study-groups error:', e);
    return res.status(500).json({ error: 'Erro interno. Tente novamente.' });
  }
};

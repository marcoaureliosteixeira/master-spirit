// api/studies.js — CRUD de estudos (Supabase)
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token obrigatório.' });

  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  // Verificar usuário
  const { data: { user }, error: authErr } = await sb.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Não autenticado.' });

  const { action } = req.body;

  try {
    // ── LISTAR ESTUDOS ──
    if (action === 'list') {
      const { data, error } = await sb.from('user_studies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.json({ studies: data || [] });
    }

    // ── CRIAR/ATUALIZAR SALA ──
    if (action === 'save_room') {
      const { nome, objetivo, room_id } = req.body;
      if (room_id) {
        const { data, error } = await sb.from('study_rooms')
          .update({ nome, objetivo })
          .eq('id', room_id)
          .eq('user_id', user.id)
          .select()
          .single();
        if (error) throw error;
        return res.json({ room: data });
      } else {
        const { data, error } = await sb.from('study_rooms')
          .insert({ user_id: user.id, nome, objetivo })
          .select()
          .single();
        if (error) throw error;
        return res.json({ room: data });
      }
    }

    // ── ADICIONAR ESTUDO ──
    if (action === 'add_study') {
      const { theme_id, name, ref, facilitador, facil_nome, mode, room_id, total_sessions } = req.body;
      const { data, error } = await sb.from('user_studies')
        .insert({
          user_id: user.id,
          room_id: room_id || null,
          theme_id, name, ref,
          facilitador, facil_nome,
          mode: mode || 'livre',
          total_sessions: total_sessions || 16
        })
        .select()
        .single();
      if (error) throw error;
      return res.json({ study: data });
    }

    // ── COMPLETAR SESSÃO ──
    if (action === 'complete_session') {
      const { study_id, session_number, session_title, quiz_score, quiz_total } = req.body;

      // Registrar sessão
      const { error: sessErr } = await sb.from('study_sessions')
        .insert({
          study_id, user_id: user.id,
          session_number, session_title,
          quiz_score: quiz_score || 0,
          quiz_total: quiz_total || 3
        });
      if (sessErr) throw sessErr;

      // Incrementar progresso
      const { error: updErr } = await sb.from('user_studies')
        .update({ completed_sessions: session_number })
        .eq('id', study_id)
        .eq('user_id', user.id);
      if (updErr) throw updErr;

      return res.json({ ok: true });
    }

    // ── HISTÓRICO DE SESSÕES ──
    if (action === 'session_history') {
      const { study_id } = req.body;
      const { data, error } = await sb.from('study_sessions')
        .select('*')
        .eq('study_id', study_id)
        .eq('user_id', user.id)
        .order('session_number');
      if (error) throw error;
      return res.json({ sessions: data || [] });
    }

    // ── REMOVER ESTUDO ──
    if (action === 'remove_study') {
      const { study_id } = req.body;
      const { error } = await sb.from('user_studies')
        .delete()
        .eq('id', study_id)
        .eq('user_id', user.id);
      if (error) throw error;
      return res.json({ ok: true });
    }

    return res.status(400).json({ error: 'Ação desconhecida.' });
  } catch (err) {
    console.error('studies error:', err);
    return res.status(500).json({ error: 'Erro interno: ' + err.message });
  }
}

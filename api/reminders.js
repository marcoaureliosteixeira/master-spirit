// api/reminders.js — Cron que envia lembretes por email 30min antes das sessões
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export default async function handler(req, res) {
  // Pode ser chamado por cron (Vercel Cron) ou manualmente
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end();

  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const resend = new Resend(process.env.RESEND_KEY);

  try {
    const now = new Date();
    const dayMap = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
    const currentDay = dayMap[now.getDay()];
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();

    // Buscar todos os usuários com progresso do evangelho
    const { data: users } = await sb.from('user_usage').select('id, evangelho_progress');
    if (!users) return res.json({ sent: 0 });

    let sent = 0;

    for (const user of users) {
      const prog = user.evangelho_progress;
      if (!prog || !prog.config || !prog.config.dias || !prog.config.lembrete) continue;

      const config = prog.config;
      if (!config.dias.includes(currentDay)) continue;

      // Verificar se está 30min antes do horário agendado
      const [schedH, schedM] = (config.horario || '19:30').split(':').map(Number);
      const minutesUntil = (schedH * 60 + schedM) - (currentHour * 60 + currentMin);

      // Enviar se falta entre 25-35 min (janela de 10min para o cron)
      if (minutesUntil < 25 || minutesUntil > 35) continue;

      // Buscar email do usuário
      const { data: authUser } = await sb.auth.admin.getUserById(user.id);
      if (!authUser || !authUser.user || !authUser.user.email) continue;

      const email = authUser.user.email;
      const nome = authUser.user.user_metadata?.full_name || email.split('@')[0];
      const horario = config.horario || '19:30';

      try {
        await resend.emails.send({
          from: 'Master Spirit <noreply@masterspirit.com.br>',
          to: email,
          subject: '🕯️ Evangelho no Lar começa em 30 minutos',
          html: `
            <div style="font-family:Georgia,serif;max-width:500px;margin:0 auto;background:#060a16;color:#F5EFE0;padding:30px;border-radius:16px">
              <div style="text-align:center;margin-bottom:20px">
                <img src="https://masterspirit.com.br/logo-master-spirit.png" style="height:60px" alt="Master Spirit">
              </div>
              <p style="font-size:16px;color:#E8C97A;text-align:center;font-weight:600">Olá, ${nome}!</p>
              <p style="font-size:15px;line-height:1.7;text-align:center;color:rgba(240,234,214,.7)">
                Sua sessão de <strong style="color:#E8C97A">Evangelho no Lar</strong> está agendada para hoje às <strong style="color:#E8C97A">${horario}</strong>.
              </p>
              <p style="font-size:14px;text-align:center;color:rgba(240,234,214,.5);font-style:italic;margin-top:10px">
                "Onde dois ou três estiverem reunidos em meu nome, ali estarei." — Jesus
              </p>
              <div style="text-align:center;margin-top:24px">
                <a href="https://masterspirit.com.br/evangelho.html" style="display:inline-block;background:linear-gradient(135deg,rgba(201,168,76,.3),rgba(232,201,122,.15));border:1px solid rgba(201,168,76,.6);border-radius:50px;padding:14px 32px;font-family:Georgia,serif;font-size:13px;color:#E8C97A;text-decoration:none;letter-spacing:2px">✦ INICIAR SESSÃO ✦</a>
              </div>
              <p style="font-size:11px;color:rgba(240,234,214,.25);text-align:center;margin-top:24px">
                Powered by Spyrit Systems
              </p>
            </div>
          `
        });
        sent++;
      } catch (emailErr) {
        console.warn('Email error for', email, emailErr);
      }
    }

    return res.json({ sent, checked: users.length, day: currentDay, time: `${currentHour}:${currentMin}` });
  } catch (err) {
    console.error('reminders error:', err);
    return res.status(500).json({ error: err.message });
  }
}

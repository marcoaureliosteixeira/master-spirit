// api/send-invite-email.js — Envia convite de grupo de estudo por email via Resend
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const resendKey = process.env.RESEND_KEY;
  if (!resendKey) return res.status(200).json({ sent: false, reason: 'Email not configured' });

  try {
    const { email, group_name, room_name, inviter_name, is_registered } = req.body;
    if (!email || !group_name) return res.status(400).json({ error: 'Email e grupo obrigatórios' });

    const appUrl = 'https://masterspirit.spyritsystems.com';

    const htmlBody = `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#060a16;color:#F5EFE0;padding:40px 30px;border-radius:16px">
        <div style="text-align:center;margin-bottom:30px">
          <h1 style="font-family:Georgia,serif;color:#C9A84C;font-size:24px;letter-spacing:4px;margin:0">MASTER SPIRIT</h1>
          <p style="color:rgba(240,234,214,.4);font-style:italic;font-size:12px;letter-spacing:2px;margin-top:4px">Convite para Grupo de Estudo</p>
        </div>

        <div style="background:rgba(255,255,255,.05);border:1px solid rgba(201,168,76,.2);border-radius:12px;padding:24px;margin-bottom:24px;text-align:center">
          <p style="color:rgba(240,234,214,.6);font-size:14px;margin-bottom:16px">
            ${inviter_name || 'Um amigo'} convidou você para participar do grupo de estudo:
          </p>
          <p style="color:#C9A84C;font-size:20px;font-weight:bold;margin:0 0 8px">${group_name}</p>
          ${room_name ? `<p style="color:rgba(240,234,214,.5);font-size:13px;font-style:italic;margin:0">📚 Sala: ${room_name}</p>` : ''}
        </div>

        ${is_registered ? `
          <p style="color:rgba(240,234,214,.7);font-size:14px;line-height:1.7;margin-bottom:20px;text-align:center">
            Acesse o app para ver e aceitar seu convite:
          </p>
        ` : `
          <p style="color:rgba(240,234,214,.7);font-size:14px;line-height:1.7;margin-bottom:20px;text-align:center">
            Para participar, crie sua conta gratuita no Master Spirit.<br>
            Após o cadastro, o convite estará esperando por você.
          </p>
          <p style="color:rgba(240,234,214,.5);font-size:12px;line-height:1.6;margin-bottom:20px;text-align:center;font-style:italic">
            O acesso a grupos de estudo requer o plano Sala de Estudo (R$ 9,90/mês por sala) ou plano Premium.
          </p>
        `}

        <div style="text-align:center;margin-bottom:24px">
          <a href="${appUrl}" style="display:inline-block;background:rgba(201,168,76,.2);border:1px solid rgba(201,168,76,.55);border-radius:50px;padding:14px 40px;color:#E8C97A;font-family:Georgia,serif;font-size:14px;letter-spacing:3px;text-decoration:none;text-transform:uppercase">
            ${is_registered ? '✦ Acessar o App' : '✦ Criar Minha Conta'}
          </a>
        </div>

        <div style="border-top:1px solid rgba(201,168,76,.15);padding-top:16px;text-align:center">
          <p style="color:rgba(240,234,214,.3);font-size:11px;font-style:italic">
            MASTER SPIRIT — Sabedoria espiritual para a evolução da alma<br>
            © ${new Date().getFullYear()} Spyrit Systems
          </p>
        </div>
      </div>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: 'MASTER SPIRIT <noreply@spyritsystems.com>',
        to: [email],
        subject: `Convite: Grupo de Estudo "${group_name}" — Master Spirit`,
        html: htmlBody,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Resend invite error:', data);
      return res.status(200).json({ sent: false, reason: data.message });
    }

    return res.status(200).json({ sent: true });
  } catch (err) {
    console.error('Invite email error:', err);
    return res.status(200).json({ sent: false, reason: 'Internal error' });
  }
}

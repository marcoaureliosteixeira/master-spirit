// api/send-disclaimer-email.js — Vercel Serverless Function
// Envia o termo de uso assinado por email usando Resend (ou qualquer SMTP)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const resendKey = process.env.RESEND_KEY;
  if (!resendKey) {
    // Se não tiver Resend configurado, retorna sucesso silencioso
    return res.status(200).json({ sent: false, reason: 'Email service not configured' });
  }

  try {
    const { email, name, accepted_at, version } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const dt = new Date(accepted_at);
    const dateStr = dt.toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    const htmlBody = `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#060a16;color:#F5EFE0;padding:40px 30px;border-radius:16px">
        <div style="text-align:center;margin-bottom:30px">
          <h1 style="font-family:Georgia,serif;color:#C9A84C;font-size:24px;letter-spacing:4px;margin:0">MASTER SPIRIT</h1>
          <p style="color:rgba(240,234,214,.4);font-style:italic;font-size:12px;letter-spacing:2px;margin-top:4px">Termo de Uso — Registro de Aceite</p>
        </div>

        <div style="background:rgba(255,255,255,.05);border:1px solid rgba(201,168,76,.2);border-radius:12px;padding:20px;margin-bottom:24px">
          <p style="color:rgba(240,234,214,.5);font-size:12px;margin-bottom:4px">Usuário</p>
          <p style="color:#C9A84C;font-size:16px;margin:0 0 14px">${name || email.split('@')[0]}</p>

          <p style="color:rgba(240,234,214,.5);font-size:12px;margin-bottom:4px">E-mail</p>
          <p style="color:#F5EFE0;font-size:14px;margin:0 0 14px">${email}</p>

          <p style="color:rgba(240,234,214,.5);font-size:12px;margin-bottom:4px">Data e Hora do Aceite</p>
          <p style="color:#F5EFE0;font-size:14px;margin:0 0 14px">${dateStr}</p>

          <p style="color:rgba(240,234,214,.5);font-size:12px;margin-bottom:4px">Versão do Termo</p>
          <p style="color:#F5EFE0;font-size:14px;margin:0">${version || '1.0'}</p>
        </div>

        <p style="color:rgba(240,234,214,.6);font-size:13px;line-height:1.7;margin-bottom:20px">
          Este e-mail confirma que você leu, compreendeu e aceitou os Termos de Uso e Disclaimer do aplicativo MASTER SPIRIT na data e hora acima indicadas. Este registro serve como comprovante do seu consentimento.
        </p>

        <p style="color:rgba(240,234,214,.6);font-size:13px;line-height:1.7;margin-bottom:20px">
          O termo completo está disponível a qualquer momento dentro do aplicativo, em <strong style="color:#C9A84C">Configurações > Visualizar Termo de Uso Aceito</strong>.
        </p>

        <div style="border-top:1px solid rgba(201,168,76,.15);padding-top:16px;text-align:center">
          <p style="color:rgba(240,234,214,.3);font-size:11px;font-style:italic">
            MASTER SPIRIT — O Consolador · Disseminador de Sabedoria<br>
            © ${new Date().getFullYear()} Spyrit Systems. Todos os direitos reservados.
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
        subject: 'MASTER SPIRIT — Termo de Uso Aceito',
        html: htmlBody,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend error:', data);
      return res.status(200).json({ sent: false, reason: data.message || 'Email service error' });
    }

    return res.status(200).json({ sent: true });
  } catch (err) {
    console.error('Email send error:', err);
    return res.status(200).json({ sent: false, reason: 'Internal error' });
  }
}

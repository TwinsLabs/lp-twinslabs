type ContactPayload = {
  nome?: string;
  email?: string;
  empresa?: string;
  mensagem?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (status: number, body: Record<string, string>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

const isValidEmail = (value: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json(405, { error: "Método não permitido." });
  }

  try {
    const payload = (await req.json()) as ContactPayload;

    const nome = (payload.nome ?? "").trim();
    const email = (payload.email ?? "").trim();
    const empresa = (payload.empresa ?? "").trim();
    const mensagem = (payload.mensagem ?? "").trim();

    if (!nome || !email || !mensagem) {
      return json(400, { error: "Campos obrigatórios ausentes." });
    }

    if (!isValidEmail(email)) {
      return json(400, { error: "E-mail inválido." });
    }

    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    const toEmail = Deno.env.get("CONTACT_TO_EMAIL");
    const fromEmail = Deno.env.get("CONTACT_FROM_EMAIL");

    if (!brevoApiKey || !toEmail || !fromEmail) {
      return json(500, { error: "Variáveis de ambiente não configuradas." });
    }

    const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify({
        sender: { email: fromEmail, name: "Site Twins Labs" },
        to: [{ email: toEmail }],
        replyTo: { email, name: nome },
        subject: `Novo contato do site - ${nome}`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
            <h2>Novo contato recebido</h2>
            <p><strong>Nome:</strong> ${nome}</p>
            <p><strong>E-mail:</strong> ${email}</p>
            <p><strong>Empresa:</strong> ${empresa || "Não informado"}</p>
            <p><strong>Mensagem:</strong></p>
            <p>${mensagem.replace(/\n/g, "<br/>")}</p>
          </div>
        `,
      }),
    });

    if (!brevoResponse.ok) {
      return json(502, { error: "Falha ao enviar e-mail pelo provedor." });
    }

    return json(200, { message: "Mensagem enviada com sucesso." });
  } catch (_error) {
    return json(500, { error: "Erro interno no processamento do formulário." });
  }
});


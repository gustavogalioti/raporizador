/**
 * RAPORIZADOR - Worker de backend
 *
 * Guarda a chave da API da Anthropic em segredo (nunca exposta ao navegador)
 * e faz o proxy da chamada que o frontend (index.html) precisa fazer.
 *
 * Configuração necessária no painel do Cloudflare, depois de colar este código:
 *   Settings -> Variables and Secrets -> Add
 *   Nome: ANTHROPIC_API_KEY   |   Tipo: Secret   |   Valor: sua chave da Anthropic
 *
 * Depois do deploy, copie a URL (algo como
 * https://raporizador-api.SEU-SUBDOMINIO.workers.dev) e cole na constante
 * WORKER_URL no topo do <script> do index.html.
 */

const SYSTEM_PROMPT = `Você monta um "quadro de rapport" para alguém que precisa parecer que entende de um assunto durante uma ligação de vendas, mesmo sem ser especialista. Gere conteúdo curto, direto, fácil de ler em poucos segundos, em português do Brasil.

Adapte o conteúdo ao TIPO de assunto:
- Se for um setor/mercado: em "principais_nomes" liste as marcas/empresas mais faladas do setor, cada uma com uma frase de curiosidade real sobre ela.
- Se for um produto específico (carro, celular etc): em "principais_nomes" liste a marca, o modelo/concorrentes diretos, cada um com uma info factual curta.
- Se for comida/bebida: em "principais_nomes" liste país de origem, variações famosas ou marcas associadas, cada uma com uma curiosidade (história, como se faz, etc).
- Se for um tema geral (esporte, hobby, tecnologia): liste os nomes/entidades mais relevantes e citados sobre o tema.

Responda ESTRITAMENTE em JSON, sem markdown, sem texto antes ou depois, seguindo exatamente este schema:
{
  "definicao_curta": "string, 1-2 frases, explica o assunto de forma simples",
  "principais_topicos": ["4 a 6 strings curtas, sub-temas que valem puxar assunto"],
  "principais_nomes": [{"nome": "string", "info": "string curta, 1 frase"}] (3 a 5 itens),
  "curiosidades": ["3 a 5 strings, fatos curiosos e verdadeiros sobre o assunto"],
  "perguntas": ["4 a 6 perguntas curtas que a pessoa pode fazer ao interlocutor sobre o tema"],
  "opinioes": ["3 a 5 frases curtas em primeira pessoa, opiniões plausíveis e neutras/positivas que a pessoa pode 'soltar' como se fossem dela"]
}
Todo o conteúdo deve ser factualmente correto e verificável. Nada de invenções sobre marcas ou fatos.`;

// Troque "*" pela origem exata do seu site (ex: "https://gustavogalioti.github.io")
// quando quiser travar o acesso só ao seu domínio.
const ALLOWED_ORIGIN = "*";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Método não permitido" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders() },
      });
    }

    try {
      const { tema } = await request.json();

      if (!tema || typeof tema !== "string" || !tema.trim()) {
        return new Response(JSON.stringify({ error: "Envie um 'tema' válido." }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders() },
        });
      }

      const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: `Assunto: ${tema.trim()}` }],
        }),
      });

      if (!anthropicResponse.ok) {
        const errText = await anthropicResponse.text();
        return new Response(
          JSON.stringify({ error: "Erro na API da Anthropic", detail: errText }),
          {
            status: anthropicResponse.status,
            headers: { "Content-Type": "application/json", ...corsHeaders() },
          }
        );
      }

      const data = await anthropicResponse.json();
      const textBlock = (data.content || []).find((b) => b.type === "text");

      if (!textBlock) {
        return new Response(JSON.stringify({ error: "Resposta sem texto." }), {
          status: 502,
          headers: { "Content-Type": "application/json", ...corsHeaders() },
        });
      }

      const clean = textBlock.text
        .trim()
        .replace(/^```json/i, "")
        .replace(/^```/, "")
        .replace(/```$/, "")
        .trim();

      // Valida que é JSON de verdade antes de devolver
      const parsed = JSON.parse(clean);

      return new Response(JSON.stringify(parsed), {
        headers: { "Content-Type": "application/json", ...corsHeaders() },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Erro interno", detail: String(err) }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders() },
      });
    }
  },
};

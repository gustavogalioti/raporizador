# Raporizador

Ferramenta whiteboard para gerar repertório de rapport a partir de uma palavra-chave.
Faz parte do conjunto de ferramentas base que vai compor o futuro CRM da C2.

## O que faz

O usuário digita um assunto (setor, produto, marca, comida, hobby etc.) e a IA
monta um "quadro" com informações estruturadas para ajudar numa conversa/ligação:

- **Definição curta** — o que é o assunto, em poucas palavras
- **Principais tópicos** — subtemas pra puxar assunto
- **Principais nomes** — marcas, produtos ou entidades mais citadas do assunto,
  adaptado ao tipo de tema (setor → marcas; carro → concorrentes; comida → origem etc.)
- **Curiosidades** — fatos curiosos e verificáveis
- **Perguntas pra fazer** — perguntas prontas pra fazer ao interlocutor
- **Opinião pra dar** — frases prontas em primeira pessoa pra "soltar" na conversa

## Como usar

O site (`index.html`) é só frontend — ele chama um backend próprio (Cloudflare
Worker) que guarda a chave da API da Anthropic em segredo. É preciso configurar
esse Worker uma vez:

### 1. Criar o Worker

1. Acesse [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Create Worker**
2. Dê um nome (ex: `raporizador-api`) e clique em **Deploy**
3. Depois de criado, clique em **Edit code**
4. Apague o código de exemplo e cole o conteúdo do arquivo [`worker/worker.js`](worker/worker.js) deste repositório
5. Clique em **Deploy** de novo

### 2. Adicionar a chave da Groq (secreta e gratuita)

1. Gere uma chave grátis em [console.groq.com/keys](https://console.groq.com/keys) (não pede cartão de crédito)
2. No painel do Worker, vá em **Settings** → **Variables and Secrets**
3. Clique em **Add** → tipo **Secret**
4. Nome: `GROQ_API_KEY` — Valor: a chave que você gerou
5. Salve

### 3. Ligar o frontend ao Worker

1. Copie a URL do Worker (algo como `https://raporizador-api.SEU-SUBDOMINIO.workers.dev`)
2. No arquivo `index.html`, no topo do `<script>`, cole essa URL na constante `WORKER_URL`
3. Suba a alteração pro GitHub (o GitHub Pages atualiza sozinho em ~1 min)

Pronto — o site publicado em `https://SEU-USUARIO.github.io/raporizador/` já
funciona de ponta a ponta, sem nenhuma chave exposta no navegador.

## Status

Protótipo funcional. Frontend estático (GitHub Pages) + backend serverless
(Cloudflare Worker) rodando Llama 3.3 70B via Groq (gratuito).

Se no futuro a qualidade das respostas precisar melhorar, é só trocar a
chamada dentro de `worker/worker.js` por outro provedor (Anthropic, OpenAI,
Gemini) — o resto do sistema (frontend, formato do JSON) não muda.

Próximo passo: plugar numa base de conhecimento própria da C2 (RAG) em vez de
depender só do conhecimento geral do modelo.

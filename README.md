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

Abra o `index.html` num navegador (ou publique via GitHub Pages). A ferramenta
chama a API da Anthropic diretamente do navegador para gerar o conteúdo.

## Status

Protótipo funcional em HTML/CSS/JS puro, sem backend próprio ainda.
Próximo passo: plugar numa base de conhecimento própria da C2 (RAG) em vez de
depender só do conhecimento geral do modelo.

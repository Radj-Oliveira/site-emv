# Site EMV — Elite Mídia Vision

Site estático (HTML + CSS + JS). Não tem banco de dados e não guarda nada do visitante.

## Estrutura
```
site/
├── index.html          → página
├── css/style.css       → visual
├── js/config.js        → ✏️ CONTEÚDO: contatos, parceiros, história, números e respostas do chat
├── js/main.js          → animações (GSAP + ScrollTrigger + Lenis)
├── js/tv.js            → TV em partículas 3D (Three.js)
├── js/map.js           → mapinha de Remanso
├── js/chat.js          → chat de respostas prontas
└── assets/             → logo, favicon, fotos e vídeos
```

## Trocar conteúdo (só mexer no `js/config.js`)
- **WhatsApp / Instagram** → `CONTATO`
- **Imagem dentro da TV gigante do início** → `TV_TELA` (ex.: `'assets/tv-tela.jpg'`). Só a telinha colorida muda; o resto da TV fica igual.
- **Telas do carrossel ("Canais no ar agora")** → `PARCEIROS`.
  Ao clicar numa tela, ela cresce e mostra o vídeo + as informações do parceiro.
  - `video`: o vídeo que abre ao clicar (ex.: `'assets/parceiros/acai.mp4'`)
  - `info`: texto sobre o parceiro que aparece ao lado
  Vídeos: MP4 (H.264), curtos e leves (até ~5 MB).
- **Pacotes de anúncio** (Como funciona → "Montamos o plano") → `PACOTES` (nome, resumo, itens, preço; `destaque: true` mostra o selo "Mais procurado"). Hoje os dados são provisórios.
- **História** → `HISTORIA`
- **Números** → `NUMEROS` (hoje são provisórios)
- **Chat** → `CHAT.respostas`: cada resposta tem `palavras` (o que o cliente pode digitar) e `texto`.
  Se o chat não achar resposta, ele oferece mandar a pergunta pro WhatsApp.

## Imagens dos cartões de "Vantagens"
Cada cartão tem um espaço para imagem, entre o número e o título. É só salvar o arquivo em `assets/vantagens/` com o nome do cartão:
- Para anunciantes: `anunciante-01` … `anunciante-06` (Mais visibilidade, Público atento, Repetição diária, Escolha dos locais, Vídeo ou imagem, Marca da cidade)
- Para estabelecimentos: `estabelecimento-01` … `estabelecimento-04` (Espera mais leve, Ambiente moderno, Sem dor de cabeça, Seus avisos na tela)

Formato `.webp`, `.jpg` ou `.png` (ex.: `assets/vantagens/estabelecimento-02.webp`). Formato vertical (retrato, ~3:4) encaixa melhor; a imagem é recortada para preencher o espaço. Cartão sem arquivo continua como está hoje.

## Logo
`assets/logo-emv.svg` é uma reconstrução aproximada. Trocar pelo arquivo original (SVG ou PNG transparente) com o mesmo nome.
A TV em partículas usa esse mesmo arquivo para formar o logo na abertura.

## Fotos da seção "Quem somos"
Hoje são ilustrações em partículas (equipe instalando / cliente na sala de espera).
Para usar a foto real, no `index.html` troque o `<canvas class="scene" ...>` por `<img src="assets/fotos/equipe.jpg" alt="...">`.

## Publicar
Qualquer hospedagem de site estático serve (Netlify, Vercel, GitHub Pages, Hostinger…). É só enviar a pasta `site/`.
Precisa abrir por um endereço (http/https), não clicando duas vezes no arquivo.

## Segurança (já incluso)
- Sem banco de dados e sem formulário que envie dados para servidor.
- O chat mostra o texto do visitante só como texto (não executa código) e não salva nada.
- Política de segurança de conteúdo (CSP) liberando só os CDNs usados.
- Para mais proteção depois (cabeçalhos HTTP, firewall), configurar na hospedagem.

## Para testes (desenvolvimento)
- `?skip` → pula a abertura rápido
- `?skip&notv` → sem a TV 3D (mais leve)
- `?skip&y=%23telas&o=600` → já abre rolado até uma seção

/* =====================================================================
   EMV — CONTEÚDO DO SITE
   Tudo que muda com frequência fica aqui: contatos, parceiros, história,
   números e as respostas do chat. Não é preciso mexer no resto do código.
   ===================================================================== */

export const CONTATO = {
  whatsapp: '557481429356',                 // só números, com 55 + DDD
  whatsappTexto: '(74) 8142-9356',
  instagram: 'https://www.instagram.com/elitemidiavision/',
  instagramUser: '@elitemidiavision',
  cidade: 'Remanso — BA',
  endereco: 'Remanso, Bahia',               // trocar pelo endereço completo, se quiserem mostrar
  mensagemPadrao: 'Olá! Vim pelo site da EMV e quero saber mais sobre anunciar nas telas.',
};

/* Imagem dentro da telinha da TV gigante do início (só a área colorida da tela muda).
   Ex.: 'assets/tv-tela.jpg'. Deixe '' para mostrar as barras coloridas.                    */
export const TV_TELA = '';

/* Telas do carrossel 3D ("Canais no ar agora").
   Ao clicar numa tela, ela cresce e mostra o vídeo + as informações do parceiro.
   video:   caminho do vídeo que aparece ao clicar, ex.: 'assets/parceiros/acai.mp4' (deixe '' enquanto não tiver)
   info:    texto sobre o parceiro que aparece ao lado da tela ampliada                                       */
export const PARCEIROS = [
  { nome: 'Dr. Daniel Braga',  segmento: 'Clínica odontológica', chamada: 'Seu sorriso<br>em dia.',     fundo: '#f2f4f5', texto: '#0a0a0a', video: '', info: 'Tela na recepção da clínica, para quem espera a consulta.' },
  { nome: 'Impacto Fit',       segmento: 'Academia',             chamada: 'Bora treinar<br>hoje?',      fundo: '#0a0a0a', texto: '#a8f03a', video: '', info: 'Telas na academia: alto fluxo e o mesmo público todos os dias.' },
  { nome: 'Império do Açaí',   segmento: 'Açaiteria',            chamada: 'Açaí do<br>jeito certo.',    fundo: '#4b145c', texto: '#f2f4f5', video: '', info: 'Telas no salão e no balcão: o cliente vê os anúncios enquanto monta o pedido.' },
  { nome: 'EMV',               segmento: 'Anuncie aqui',         chamada: 'Sua marca<br>aqui.',         fundo: '#1f6bff', texto: '#f2f4f5', video: '', info: 'Este espaço pode ser da sua marca. Fale com a EMV.' },
  { nome: 'Setembro Amarelo',  segmento: 'Campanha',             chamada: 'Falar é<br>cuidar.',         fundo: '#f2c400', texto: '#0a0a0a', video: '', info: 'Campanha de conscientização exibida na rede EMV.' },
  { nome: 'Lugar Certo',       segmento: 'EMV',                  chamada: 'A comunicação<br>certa.',    fundo: '#e9ece8', texto: '#0a0a0a', video: '', info: 'A comunicação certa, no lugar certo.' },
  { nome: 'Seu negócio',       segmento: 'Espaço disponível',    chamada: 'Este espaço<br>é seu.',      fundo: '#0a0a0a', texto: '#f2f4f5', video: '', info: 'Tem um negócio em Remanso? Sua marca pode estar nesta tela.' },
  { nome: 'EMV',               segmento: 'Resultados reais',     chamada: 'Comunicação<br>que se vê.',  fundo: '#0a0a0a', texto: '#2edb4b', video: '', info: 'No ar em Remanso desde 2025, em clínicas, academias e comércios.' },
];

/* Pacotes de anúncio (seção "Como funciona" → passo 02 "Montamos o plano"), mostrados como uma tabela comparativa.
   DADOS PROVISÓRIOS — troque pelos reais.
   linhas: o nome de cada linha da tabela · valores: um valor por linha, na mesma ordem (use '—' quando não tiver)
   destaque: true marca o plano como "Mais procurado".                                                              */
export const PACOTES = {
  linhas: ['Pontos com tela', 'Duração do anúncio', 'Exibições por dia', 'Contrato', 'Arte do anúncio'],
  planos: [
    { nome: 'Essencial', resumo: 'Para começar a aparecer.', preco: 'R$ 290', periodo: '/mês', destaque: false,
      valores: ['3', 'até 15 s', '60 por tela', '30 dias', '—'] },
    { nome: 'Destaque',  resumo: 'Para ser visto em Remanso inteira.', preco: 'R$ 590', periodo: '/mês', destaque: true,
      valores: ['8', 'até 30 s', '120 por tela', '30 dias', 'Inclusa'] },
  ],
};

/* Linha do tempo (seção horizontal). A EMV está ativa desde 2025 — ajustar os textos com a história real. */
// Quadro "A nossa história" (seção 05). Troque pelos textos reais da EMV — cada item é um parágrafo.
export const HISTORIA_QUADRO = {
  titulo: 'Tudo começou numa sala de espera.',
  texto: [
    'Em 2025, em Remanso, surgiu uma ideia simples: aproveitar o tempo em que as pessoas esperam para mostrar as marcas da própria cidade.',
    'As primeiras telas chegaram a uma clínica, uma academia e uma açaiteria. O público olhou — e os anunciantes perceberam.',
    'Hoje a EMV cuida de cada ponto, da instalação ao anúncio no ar, e cresce junto com os negócios de Remanso.',
  ],
  assinatura: '— Equipe EMV · Remanso, BA',
};

// Quadro final da seção 05: as expectativas da EMV. Troque pelos textos reais — cada item é um parágrafo.
export const HISTORIA_FUTURO = {
  titulo: 'O que vem pela frente.',
  texto: [
    'A meta é levar a EMV a cada lugar de Remanso onde as pessoas param e esperam: mais pontos, mais telas e mais formatos.',
    'Queremos que cada negócio da cidade, do pequeno ao grande, tenha espaço para aparecer — com anúncios bem feitos e no lugar certo.',
    'E quando a cidade pensar em ser vista, que pense na EMV.',
  ],
  assinatura: '— Próximo capítulo · 2027 em diante',
};

export const HISTORIA = [
  { ano: '2025', titulo: 'O começo',         texto: 'A EMV nasce em Remanso: as primeiras telas chegam à clínica, à academia e à açaiteria.',        cena: 0 },
  { ano: '2026', titulo: 'A rede cresce',    texto: 'Novos pontos em clínicas, academias e comércios de Remanso, com anúncios rodando todos os dias.',            cena: 1 },
  { ano: '2027', titulo: 'Próximo canal',    texto: 'Mais pontos, mais telas e mais marcas da cidade aparecendo todos os dias.',                     cena: 2 },
];

/* Números. animar: false = mostra o número direto (sem contar). Os dois últimos ainda são provisórios. */
export const NUMEROS = [
  { valor: 3,    prefixo: '',  sufixo: '',     rotulo: 'Segmentos atendidos' },   // clínica, academia, açaiteria
  { valor: 2025, prefixo: '',  sufixo: '',     rotulo: 'No ar desde', de: 2000 },
  { valor: 25,   prefixo: '',  sufixo: ' min', rotulo: 'Espera média*' },
  { valor: 5,    prefixo: '',  sufixo: ' mil', rotulo: 'Olhares por dia*' },
];

/* =====================================================================
   CHAT — respostas prontas
   palavras: termos que ativam a resposta (sem acento, minúsculas)
   Se nenhuma resposta servir, o chat oferece mandar a pergunta no WhatsApp.
   ===================================================================== */
export const CHAT = {
  saudacao: 'Oi! 👋 Sou o assistente da EMV. Posso tirar dúvidas rápidas sobre anunciar nas nossas telas.',
  sugestoes: ['Como anunciar?', 'Quanto custa?', 'Onde ficam as telas?', 'Quero uma tela no meu espaço'],
  naoSei: 'Essa eu não sei responder com certeza. Quer mandar sua pergunta direto para a equipe no WhatsApp?',
  respostas: [
    { palavras: ['oi', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'eai', 'opa'],
      texto: 'Olá! Como posso ajudar? Você pode perguntar sobre anúncios, preços, onde ficam as telas ou como ter uma tela no seu espaço.' },
    { palavras: ['anunciar', 'anuncio', 'anuncie', 'divulgar', 'propaganda', 'publicidade', 'como funciona'],
      texto: 'É simples: você fala com a gente, escolhemos juntos os pontos e o período, e o seu anúncio (vídeo ou imagem) passa nas telas instaladas nos estabelecimentos parceiros, várias vezes ao dia.' },
    { palavras: ['preco', 'valor', 'quanto custa', 'custa', 'plano', 'planos', 'pacote', 'orcamento', 'investimento'],
      texto: 'Os valores dependem da quantidade de telas, dos locais e do período do anúncio. Para receber um orçamento certinho, fale com a equipe no WhatsApp.', whatsapp: true },
    { palavras: ['onde', 'local', 'locais', 'pontos', 'ficam', 'lugares', 'endereco', 'cidade', 'remanso'],
      texto: 'Estamos em Remanso — BA. As telas ficam em lugares onde as pessoas esperam: clínicas, academias, lojas e outros comércios parceiros.' },
    { palavras: ['meu espaco', 'minha loja', 'meu estabelecimento', 'instalar', 'tela no meu', 'parceiro', 'parceria', 'receber uma tela'],
      texto: 'Que ótimo! A EMV instala a tela e o suporte no seu espaço e cuida da programação. Os detalhes da parceria a equipe passa pelo WhatsApp.', whatsapp: true },
    { palavras: ['video', 'imagem', 'arte', 'criar', 'producao', 'formato', 'material'],
      texto: 'O anúncio pode ser em vídeo ou imagem, nos formatos vertical (9:16) e horizontal (16:9). Se você ainda não tem o material, pergunte à equipe sobre a criação.' },
    { palavras: ['tempo', 'duracao', 'segundos', 'quantas vezes', 'frequencia', 'repete'],
      texto: 'Os anúncios entram numa grade que repete ao longo do dia. Tempo e frequência variam conforme o plano escolhido.' },
    { palavras: ['resultado', 'funciona mesmo', 'vale a pena', 'retorno', 'visibilidade'],
      texto: 'As telas ficam onde o público está parado e olhando — por isso a marca é vista muitas vezes por dia, por pessoas da própria cidade. Veja alguns parceiros na seção “Telas”.' },
    { palavras: ['instagram', 'insta', 'redes'],
      texto: 'Siga a EMV no Instagram: @elitemidiavision.' },
    { palavras: ['whatsapp', 'zap', 'telefone', 'contato', 'falar', 'atendente', 'humano', 'pessoa'],
      texto: 'Claro! Você pode falar com a equipe direto no WhatsApp: (74) 8142-9356.', whatsapp: true },
    { palavras: ['obrigado', 'obrigada', 'valeu', 'show', 'top'],
      texto: 'Por nada! Se precisar, é só chamar. 😉' },
  ],
};

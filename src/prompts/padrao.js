// Conteúdo fixo do app: tipos de post, categorias, prompts de barbearia, perfil inicial e chats.
// Nos prompts, {Campo} vira um campo para preencher antes de copiar.

/** Tipo da pasta: decide quais prompts aparecem primeiro. */
export const TIPOS = [
  { id: 'corte', label: 'Corte', icon: 'content-cut' },
  { id: 'barba', label: 'Barba', icon: 'face-man-shimmer-outline' },
  { id: 'promocao', label: 'Promoção', icon: 'tag-outline' },
  { id: 'equipe', label: 'Equipe', icon: 'account-group-outline' },
  { id: 'produto', label: 'Produto', icon: 'bottle-tonic-outline' },
  { id: 'aviso', label: 'Aviso', icon: 'bullhorn-outline' },
];
export const tipoDe = (id) => TIPOS.find((t) => t.id === id) || TIPOS[0];

export const CATEGORIAS = [
  { id: 'legenda', label: 'Legendas', icon: 'text-short' },
  { id: 'imagem', label: 'Fotos e artes', icon: 'image-edit-outline' },
  { id: 'ideias', label: 'Ideias', icon: 'lightbulb-on-outline' },
  { id: 'respostas', label: 'Respostas', icon: 'message-reply-text-outline' },
];
export const catDe = (id) => CATEGORIAS.find((c) => c.id === id) || CATEGORIAS[0];

export const PERFIL_PADRAO = {
  nome: 'Clube Studio 8',
  local: '',
  instagram: '',
  whatsapp: '',
  publico: 'Homens de 18 a 45 anos que gostam de estar com o visual sempre em dia',
  tom: 'Descontraído, confiante e próximo, como um barbeiro conversando com o cliente. Sem gírias forçadas.',
  diferenciais: '',
};

export const CAMPOS_PERFIL = [
  { id: 'nome', label: 'Nome da barbearia', icon: 'store-outline', placeholder: 'Ex.: Clube Studio 8' },
  { id: 'local', label: 'Bairro e cidade', icon: 'map-marker-outline', placeholder: 'Ex.: Centro, Campinas - SP' },
  { id: 'instagram', label: 'Instagram', icon: 'instagram', placeholder: 'Ex.: @clubestudio8' },
  { id: 'whatsapp', label: 'WhatsApp para agendar', icon: 'whatsapp', placeholder: 'Ex.: (19) 99999-9999' },
  { id: 'publico', label: 'Público', icon: 'account-heart-outline', placeholder: 'Quem são seus clientes?' },
  { id: 'tom', label: 'Tom de voz', icon: 'microphone-outline', placeholder: 'Como a barbearia fala?' },
  { id: 'diferenciais', label: 'Diferenciais', icon: 'star-outline', placeholder: 'Ex.: cerveja gelada, sinuca, atendimento com hora marcada' },
];

const REGRAS_LEGENDA =
  'Regras:\n' +
  '- Português do Brasil, no tom de voz do contexto.\n' +
  '- No máximo 2 emojis por legenda, sem exagero.\n' +
  '- A primeira linha precisa prender quem está rolando o feed.\n' +
  '- Termine com uma chamada para agendar (cite o WhatsApp ou o direct, se estiverem no contexto).\n' +
  '- Não invente preços, promoções nem informações que eu não passei.';

export const PROMPTS_PADRAO = [
  // ---------- Legendas ----------
  {
    titulo: 'Legenda de corte',
    descricao: 'Foto de antes e depois ou do resultado do corte',
    categoria: 'legenda',
    tipos: ['corte'],
    texto:
      'Você é social media especialista em barbearias.\n' +
      'Vou enviar a foto de um corte feito aqui na barbearia.\n\n' +
      'Corte: {Nome do corte}\n' +
      'O que quero destacar: {Destaque (ex.: degradê bem marcado)}\n\n' +
      'Escreva 3 opções de legenda para o Instagram:\n' +
      '1. Curta, até 2 linhas.\n' +
      '2. Média, explicando a técnica em linguagem simples, sem termos difíceis.\n' +
      '3. Em formato de antes e depois, valorizando a transformação.\n\n' +
      REGRAS_LEGENDA +
      '\n\nNo final, sugira 10 hashtags: 5 de barbearia/estilo e 5 locais (use o bairro e a cidade do contexto).',
  },
  {
    titulo: 'Legenda de barba',
    descricao: 'Barba feita, desenho, toalha quente, navalha',
    categoria: 'legenda',
    tipos: ['barba'],
    texto:
      'Você é social media especialista em barbearias.\n' +
      'Vou enviar a foto de uma barba feita aqui.\n\n' +
      'Serviço: {Serviço (ex.: barba com toalha quente)}\n' +
      'Estilo da barba: {Estilo da barba}\n\n' +
      'Escreva 3 opções de legenda para o Instagram. Uma delas deve falar da experiência ' +
      '(o momento de relaxar na cadeira), outra do resultado e outra com uma dica rápida de cuidado com a barba em casa.\n\n' +
      REGRAS_LEGENDA +
      '\n\nNo final, sugira 10 hashtags (5 de barba/estilo e 5 locais).',
  },
  {
    titulo: 'Legenda de promoção',
    descricao: 'Combo, desconto, dia especial',
    categoria: 'legenda',
    tipos: ['promocao'],
    texto:
      'Você é social media especialista em barbearias.\n' +
      'Crie a legenda de um post de promoção.\n\n' +
      'Promoção: {Promoção (ex.: corte + barba)}\n' +
      'Preço: {Preço}\n' +
      'Validade: {Validade (ex.: só nesta sexta)}\n' +
      'Regras da promoção: {Regras (ex.: só com horário marcado)}\n\n' +
      'Escreva 2 opções:\n' +
      '1. Direta, com o preço logo na primeira linha.\n' +
      '2. Criando urgência (vagas limitadas, prazo), sem parecer apelativa.\n\n' +
      REGRAS_LEGENDA +
      '\n- Deixe o preço e a validade bem claros.',
  },
  {
    titulo: 'Apresentar barbeiro',
    descricao: 'Post da equipe, novo barbeiro ou bastidores',
    categoria: 'legenda',
    tipos: ['equipe'],
    texto:
      'Você é social media especialista em barbearias.\n' +
      'Vou enviar a foto de um barbeiro da equipe.\n\n' +
      'Nome: {Nome do barbeiro}\n' +
      'Especialidade: {Especialidade (ex.: degradê e freestyle)}\n' +
      'Tempo de profissão: {Tempo de profissão}\n' +
      'Curiosidade: {Uma curiosidade sobre ele}\n\n' +
      'Escreva uma legenda que apresente o barbeiro como alguém de confiança e aproxime o cliente dele. ' +
      'Use o formato: gancho, apresentação em 2 ou 3 frases, curiosidade, chamada para agendar com ele.\n\n' +
      REGRAS_LEGENDA,
  },
  {
    titulo: 'Produto à venda',
    descricao: 'Pomada, óleo de barba, shampoo',
    categoria: 'legenda',
    tipos: ['produto'],
    texto:
      'Você é social media especialista em barbearias.\n' +
      'Vou enviar a foto de um produto que vendemos na barbearia.\n\n' +
      'Produto: {Produto}\n' +
      'Preço: {Preço}\n' +
      'Para quem é: {Para quem é (ex.: cabelo crespo, barba seca)}\n\n' +
      'Escreva uma legenda que explique, em linguagem simples: para que serve, como usar em 3 passos curtos e qual resultado esperar. ' +
      'Feche convidando para comprar na próxima visita ou pelo direct.\n\n' +
      REGRAS_LEGENDA,
  },
  {
    titulo: 'Aviso de horário',
    descricao: 'Feriado, horário especial, agenda lotada',
    categoria: 'legenda',
    tipos: ['aviso'],
    texto:
      'Você é social media especialista em barbearias.\n' +
      'Crie um aviso curto para o feed e para o story.\n\n' +
      'Aviso: {Aviso (ex.: fechados no feriado)}\n' +
      'Datas e horários: {Datas e horários}\n\n' +
      'Entregue:\n' +
      '1. Uma legenda de feed com até 4 linhas.\n' +
      '2. Um texto de story com no máximo 12 palavras, para ir em letras grandes.\n\n' +
      'Seja claro nas datas e aproveite para lembrar de agendar com antecedência.',
  },

  // ---------- Fotos e artes ----------
  {
    titulo: 'Tratar foto do corte',
    descricao: 'Melhora luz e nitidez sem mudar o corte',
    categoria: 'imagem',
    tipos: ['corte', 'barba', 'equipe'],
    texto:
      'Edite a foto que estou enviando para postar no Instagram de uma barbearia.\n\n' +
      'Faça:\n' +
      '- Corrigir luz e contraste, destacando o acabamento do corte e da barba.\n' +
      '- Aumentar um pouco a nitidez nas linhas do degradê e no contorno.\n' +
      '- Deixar as cores naturais, com o tom de pele real.\n' +
      '- Desfocar levemente o fundo se ele estiver bagunçado.\n\n' +
      'Não faça:\n' +
      '- Não mude o formato do corte, da barba nem do rosto.\n' +
      '- Não adicione texto, logo nem filtros exagerados.\n\n' +
      'Formato final: 4:5 (1080x1350).',
  },
  {
    titulo: 'Arte de promoção para story',
    descricao: 'Story 9:16 com a identidade da barbearia',
    categoria: 'imagem',
    tipos: ['promocao', 'aviso'],
    texto:
      'Crie uma arte de story (9:16, 1080x1920) para a barbearia, usando a foto que estou enviando como fundo.\n\n' +
      'Identidade visual: fundo preto, detalhes em verde-limão (#C4DC1E), títulos em letras grandes e condensadas (estilo Bebas Neue).\n\n' +
      'Título: {Título (ex.: COMBO DE SEXTA)}\n' +
      'Preço ou destaque: {Preço ou destaque}\n' +
      'Rodapé: {Rodapé (ex.: agende pelo direct)}\n\n' +
      'Deixe espaço livre nos 250 px de cima e de baixo (área dos botões do Instagram). Escreva os textos exatamente como passei, sem erros.',
  },

  // ---------- Ideias ----------
  {
    titulo: 'Calendário da semana',
    descricao: '7 dias de posts para a barbearia',
    categoria: 'ideias',
    tipos: [],
    texto:
      'Você é social media especialista em barbearias.\n' +
      'Monte um calendário de posts para os próximos 7 dias.\n\n' +
      'Foco da semana: {Foco da semana (ex.: lotar a terça e a quarta)}\n' +
      'Fotos que já tenho: {Fotos que já tenho}\n\n' +
      'Para cada dia, entregue numa tabela: formato (foto, carrossel, reels ou story), ideia, o que fotografar ou filmar e o melhor horário para postar.\n' +
      'Misture: resultado de cortes, bastidores, equipe, dica de cuidado e pelo menos 1 post pedindo agendamento. ' +
      'Lembre que sexta e sábado são os dias mais cheios de barbearia: use o começo da semana para atrair clientes.',
  },
  {
    titulo: 'Roteiro de Reels',
    descricao: 'Vídeo curto de transformação',
    categoria: 'ideias',
    tipos: ['corte', 'barba'],
    texto:
      'Você é social media especialista em barbearias.\n' +
      'Crie o roteiro de um Reels de até 20 segundos mostrando uma transformação.\n\n' +
      'Serviço: {Serviço}\n' +
      'Música ou clima: {Clima (ex.: trap, lo-fi, animado)}\n\n' +
      'Entregue cena por cena: tempo (em segundos), o que filmar, ângulo da câmera e texto na tela (até 6 palavras). ' +
      'Os 2 primeiros segundos precisam mostrar o "antes" de um jeito que faça a pessoa querer ver o final. ' +
      'No fim, sugira a legenda e 3 ideias de capa.',
  },
  {
    titulo: 'Hashtags locais',
    descricao: 'Hashtags da sua região e do seu nicho',
    categoria: 'ideias',
    tipos: ['corte', 'barba', 'promocao', 'equipe', 'produto'],
    texto:
      'Sugira 20 hashtags para o Instagram da barbearia do contexto:\n' +
      '- 5 do bairro e da cidade.\n' +
      '- 5 de cortes e estilos masculinos.\n' +
      '- 5 de barba.\n' +
      '- 5 de nicho com menos concorrência.\n\n' +
      'Assunto do post: {Assunto do post}\n\n' +
      'Entregue tudo numa linha só, separado por espaço, pronto para copiar. Não use hashtags banidas nem genéricas demais (#love, #instagood).',
  },

  // ---------- Respostas ----------
  {
    titulo: 'Responder comentário',
    descricao: 'Elogio, reclamação ou avaliação no Google',
    categoria: 'respostas',
    tipos: [],
    texto:
      'Você cuida do atendimento da barbearia do contexto.\n' +
      'Escreva 2 opções de resposta para este comentário de cliente:\n\n' +
      '"{Comentário do cliente}"\n\n' +
      'Regras:\n' +
      '- Até 3 frases, no tom de voz do contexto.\n' +
      '- Se for elogio: agradeça pelo nome (se houver) e convide para voltar.\n' +
      '- Se for reclamação: peça desculpas sem se justificar demais e chame para resolver no privado.\n' +
      '- Nunca discuta com o cliente.',
  },
  {
    titulo: 'Responder preço no direct',
    descricao: 'Quando perguntam "quanto é?"',
    categoria: 'respostas',
    tipos: [],
    texto:
      'Você cuida do atendimento da barbearia do contexto.\n' +
      'Um cliente perguntou no direct: "{Pergunta do cliente}"\n\n' +
      'Nossos preços: {Serviços e preços}\n\n' +
      'Escreva uma resposta curta e simpática que: responda o preço, destaque o que está incluso, ' +
      'e termine perguntando o melhor dia e horário para ele vir. No máximo 4 linhas.',
  },
];

export const CHATS = [
  { id: 'chatgpt', label: 'ChatGPT', url: 'https://chatgpt.com/' },
  { id: 'gemini', label: 'Gemini', url: 'https://gemini.google.com/app' },
  { id: 'claude', label: 'Claude', url: 'https://claude.ai/new' },
];

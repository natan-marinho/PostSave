// Prompts que já vêm no app na primeira vez. O usuário pode editar, excluir ou criar outros.

export const CATEGORIAS = [
  { id: 'legenda', label: 'Legenda', icon: 'text-short' },
  { id: 'imagem', label: 'Imagem', icon: 'image-edit-outline' },
  { id: 'ideias', label: 'Ideias', icon: 'lightbulb-on-outline' },
  { id: 'outros', label: 'Outros', icon: 'dots-horizontal' },
];

export const PROMPTS_PADRAO = [
  {
    titulo: 'Legenda para Instagram',
    categoria: 'legenda',
    texto:
      'Analise a foto que estou enviando e escreva 3 opções de legenda para Instagram em português do Brasil.\n' +
      '- Tom: próximo, leve e confiante.\n' +
      '- Cada opção com no máximo 3 frases e uma chamada para ação no final.\n' +
      '- Use no máximo 2 emojis por legenda.\n' +
      'Assunto do post: ',
  },
  {
    titulo: 'Hashtags do post',
    categoria: 'legenda',
    texto:
      'Com base na foto que enviei, sugira 15 hashtags em português para o Instagram: ' +
      '5 populares, 5 de nicho e 5 locais. Entregue tudo numa linha só, separado por espaço, pronto para copiar.',
  },
  {
    titulo: 'Melhorar a foto',
    categoria: 'imagem',
    texto:
      'Melhore esta foto para postar nas redes sociais: corrija luz, contraste e nitidez, deixe as cores naturais ' +
      'e não altere o rosto das pessoas. Mantenha o formato 4:5 (1080x1350).',
  },
  {
    titulo: 'Arte para story',
    categoria: 'imagem',
    texto:
      'Use esta foto para criar uma arte de story (9:16, 1080x1920) com fundo preto, detalhes em verde-limão (#C4DC1E) ' +
      'e um título curto em letras grandes e condensadas. Texto do título: ',
  },
  {
    titulo: 'Roteiro de carrossel',
    categoria: 'ideias',
    texto:
      'Monte um carrossel de 5 slides para o Instagram sobre o tema abaixo. Para cada slide, diga o título (até 6 palavras), ' +
      'o texto de apoio (até 20 palavras) e qual foto usar. O último slide deve ter uma chamada para ação.\nTema: ',
  },
  {
    titulo: 'Calendário da semana',
    categoria: 'ideias',
    texto:
      'Sugira um calendário de posts para os próximos 7 dias: um post por dia com formato (foto, carrossel, reels ou story), ' +
      'ideia principal e melhor horário para postar. Meu perfil é sobre: ',
  },
];

export const CHATS = [
  { id: 'chatgpt', label: 'ChatGPT', url: 'https://chatgpt.com/' },
  { id: 'gemini', label: 'Gemini', url: 'https://gemini.google.com/app' },
  { id: 'claude', label: 'Claude', url: 'https://claude.ai/new' },
];

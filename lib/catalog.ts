export const USD_BRL = 5.5
export const MARGEM = 3

export type Categoria = 'Texto' | 'Pesquisa' | 'Produtividade' | 'Imagem' | 'Código'

export type IconeSlug =
  | 'sparkles'
  | 'message-circle'
  | 'wand-2'
  | 'zap'
  | 'search'
  | 'layers'
  | 'messages-square'
  | 'image'
  | 'code-2'
  | 'github'

export type IA = {
  slug: string
  nome: string
  empresa: string
  planoBase: string
  usdMes: number
  categoria: Categoria
  descricao: string
  pontosFortes: [string, string, string]
  gradiente: string
  icone: IconeSlug
}

export type Combo = {
  slug: string
  nome: string
  descricao: string
  iasSlugs: string[]
  descontoPct: number
}

export function arredondarPara90(valor: number): number {
  const base = Math.floor(valor)
  const candidatoBaixo = base - 1 + 0.9
  const candidatoAlto = base + 0.9
  const distBaixo = Math.abs(valor - candidatoBaixo)
  const distAlto = Math.abs(valor - candidatoAlto)
  const resultado = distAlto < distBaixo ? candidatoAlto : candidatoBaixo
  return Math.round(resultado * 100) / 100
}

export function precoDiaBRL(ia: IA): number {
  const custoDiaBRL = ((ia.usdMes * USD_BRL) / 30) * MARGEM
  return arredondarPara90(custoDiaBRL)
}

export function equivaleMensalBRL(ia: IA): number {
  return Math.round(precoDiaBRL(ia) * 30 * 100) / 100
}

export function descontoPorDuracao(dias: number): number {
  if (dias >= 15) return 0.2
  if (dias >= 7) return 0.1
  return 0
}

export const DIAS_MAXIMO_POR_ITEM = 30

export const CATALOGO: IA[] = [
  {
    slug: 'chatgpt',
    nome: 'ChatGPT',
    empresa: 'OpenAI',
    planoBase: 'Plus',
    usdMes: 20,
    categoria: 'Texto',
    descricao: 'O assistente mais completo para escrever, estudar e resolver problemas do dia a dia.',
    pontosFortes: [
      'Respostas claras para qualquer assunto',
      'Ótimo para revisar e melhorar textos',
      'Ajuda em código e planilhas sem enrolação',
    ],
    gradiente: 'from-emerald-400 to-teal-600',
    icone: 'sparkles',
  },
  {
    slug: 'claude',
    nome: 'Claude',
    empresa: 'Anthropic',
    planoBase: 'Pro',
    usdMes: 20,
    categoria: 'Texto',
    descricao: 'IA cuidadosa para análises longas, redação e raciocínio passo a passo.',
    pontosFortes: [
      'Lida bem com documentos extensos',
      'Explica o raciocínio por trás das respostas',
      'Boa parceira para escrita e revisão',
    ],
    gradiente: 'from-orange-400 to-amber-600',
    icone: 'message-circle',
  },
  {
    slug: 'gemini',
    nome: 'Gemini',
    empresa: 'Google',
    planoBase: 'Google AI Pro',
    usdMes: 19.99,
    categoria: 'Texto',
    descricao: 'IA multimídia do Google, forte em pesquisa, imagens e integração com o dia a dia.',
    pontosFortes: [
      'Entende texto, imagem e voz junto',
      'Conectado aos apps Google',
      'Boa para pesquisa rápida e resumos',
    ],
    gradiente: 'from-blue-400 to-indigo-600',
    icone: 'wand-2',
  },
  {
    slug: 'grok',
    nome: 'Grok',
    empresa: 'xAI',
    planoBase: 'SuperGrok',
    usdMes: 30,
    categoria: 'Texto',
    descricao: 'IA direta e bem-humorada, com acesso a informação em tempo real via X.',
    pontosFortes: [
      'Respostas com contexto atualizado',
      'Tom mais informal e objetivo',
      'Boa para acompanhar assuntos do momento',
    ],
    gradiente: 'from-slate-400 to-zinc-700',
    icone: 'zap',
  },
  {
    slug: 'perplexity',
    nome: 'Perplexity',
    empresa: 'Perplexity',
    planoBase: 'Pro',
    usdMes: 20,
    categoria: 'Pesquisa',
    descricao: 'Motor de busca com IA que responde com fontes e links verificáveis.',
    pontosFortes: [
      'Cita as fontes de cada resposta',
      'Ótimo para pesquisa aprofundada',
      'Resume artigos e páginas longas',
    ],
    gradiente: 'from-cyan-400 to-sky-600',
    icone: 'search',
  },
  {
    slug: 'copilot-microsoft',
    nome: 'Microsoft Copilot',
    empresa: 'Microsoft',
    planoBase: 'M365 Premium',
    usdMes: 19.99,
    categoria: 'Produtividade',
    descricao: 'IA integrada ao Word, Excel e Teams para acelerar o trabalho do dia a dia.',
    pontosFortes: [
      'Cria e edita documentos do Office',
      'Resume reuniões e e-mails',
      'Monta planilhas e apresentações rápido',
    ],
    gradiente: 'from-sky-400 to-blue-700',
    icone: 'layers',
  },
  {
    slug: 'mistral',
    nome: 'Mistral Le Chat',
    empresa: 'Mistral',
    planoBase: 'Pro',
    usdMes: 14.99,
    categoria: 'Texto',
    descricao: 'IA europeia rápida e enxuta, boa opção para tarefas de texto do dia a dia.',
    pontosFortes: [
      'Respostas rápidas e diretas',
      'Boa relação custo-benefício',
      'Funciona bem para tarefas simples do dia a dia',
    ],
    gradiente: 'from-red-400 to-orange-600',
    icone: 'messages-square',
  },
  {
    slug: 'midjourney',
    nome: 'Midjourney',
    empresa: 'Midjourney',
    planoBase: 'Standard',
    usdMes: 30,
    categoria: 'Imagem',
    descricao: 'Geração de imagens artísticas a partir de descrições em texto.',
    pontosFortes: [
      'Qualidade visual muito alta',
      'Grande variedade de estilos',
      'Ótimo para capas, artes e referências visuais',
    ],
    gradiente: 'from-fuchsia-400 to-purple-700',
    icone: 'image',
  },
  {
    slug: 'cursor',
    nome: 'Cursor',
    empresa: 'Anysphere',
    planoBase: 'Pro',
    usdMes: 20,
    categoria: 'Código',
    descricao: 'Editor de código com IA embutida para programar mais rápido.',
    pontosFortes: [
      'Autocompleta trechos inteiros de código',
      'Explica e corrige erros no editor',
      'Acelera refatorações grandes',
    ],
    gradiente: 'from-indigo-400 to-violet-700',
    icone: 'code-2',
  },
  {
    slug: 'github-copilot',
    nome: 'GitHub Copilot',
    empresa: 'GitHub',
    planoBase: 'Pro',
    usdMes: 10,
    categoria: 'Código',
    descricao: 'Assistente de código integrado ao editor, direto do GitHub.',
    pontosFortes: [
      'Sugestões de código em tempo real',
      'Funciona nos editores mais usados',
      'Ajuda a escrever testes e documentação',
    ],
    gradiente: 'from-slate-500 to-gray-800',
    icone: 'github',
  },
]

export function getIAPorSlug(slug: string): IA | undefined {
  return CATALOGO.find((ia) => ia.slug === slug)
}

export const COMBOS: Combo[] = [
  {
    slug: 'kit-estudante',
    nome: 'Kit Estudante',
    descricao: 'Escrita, dúvidas e pesquisa acadêmica em um pacote só.',
    iasSlugs: ['chatgpt', 'claude', 'perplexity'],
    descontoPct: 15,
  },
  {
    slug: 'kit-criador',
    nome: 'Kit Criador',
    descricao: 'Imagem e texto para quem produz conteúdo todo dia.',
    iasSlugs: ['midjourney', 'chatgpt', 'gemini'],
    descontoPct: 15,
  },
  {
    slug: 'kit-dev',
    nome: 'Kit Dev',
    descricao: 'Código, revisão e explicação técnica lado a lado.',
    iasSlugs: ['cursor', 'github-copilot', 'claude'],
    descontoPct: 15,
  },
  {
    slug: 'kit-completo',
    nome: 'Kit Completo',
    descricao: 'As 10 IAs do catálogo, com o maior desconto da loja.',
    iasSlugs: CATALOGO.map((ia) => ia.slug),
    descontoPct: 25,
  },
]

export function getComboPorSlug(slug: string): Combo | undefined {
  return COMBOS.find((c) => c.slug === slug)
}

export function comboPrecoDiaBRL(combo: Combo): number {
  const somaDiarias = combo.iasSlugs.reduce((total, slug) => {
    const ia = getIAPorSlug(slug)
    return total + (ia ? precoDiaBRL(ia) : 0)
  }, 0)
  return Math.round(somaDiarias * (1 - combo.descontoPct / 100) * 100) / 100
}

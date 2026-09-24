# DiárIA — Redesign Completo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apagar o site atual do `margem-app` e recriar do zero a loja fictícia DiárIA (aluguel de acesso a IAs por diária), mantendo a mesma base técnica (Next.js 15 App Router, React 19, TypeScript, Tailwind v4) e o mesmo repositório.

**Architecture:** `lib/catalog.ts` é a fonte única de verdade para dados e regra de preço (funções puras, sem estado). `lib/cart-context.tsx` guarda o carrinho em React Context + `useReducer`, persistido em `localStorage`. As páginas (`app/**`) são Server Components que renderizam dados estáticos do catálogo; interatividade (filtro, busca, simulador, carrinho) fica em Client Components isolados dentro de `components/`.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, `lucide-react`, `next/font` (Geist Sans/Mono). Sem bibliotecas de animação, sem kit de UI pronto, sem testes automatizados.

Referência completa de regras de negócio e conteúdo: `docs/superpowers/specs/2026-09-24-diaria-redesign-design.md`.

---

## Task 1: Limpeza do projeto

**Files:**
- Delete: `app/` (todo o conteúdo), `components/` (todo o conteúdo), `lib/` (todo o conteúdo), `README.md`, `vitest.config.ts`, `.next/`
- Modify: `package.json`

- [ ] **Step 1: Mostrar ao usuário a lista exata do que será apagado e aguardar OK explícito**

Listar: `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `components/.gitkeep`, `components/raio-x/*`, `lib/ai/*`, `lib/engine/*`, `lib/format.ts`, `README.md`, `vitest.config.ts`, `.next/`. Não prosseguir para o Step 2 sem confirmação do usuário.

- [ ] **Step 2: Apagar os arquivos/pastas confirmados**

```bash
rm -rf app components lib README.md vitest.config.ts .next
```

- [ ] **Step 3: Recriar as pastas base vazias**

```bash
mkdir -p app lib components/layout components/catalog components/home components/ui
```

- [ ] **Step 4: Editar `package.json`** — remover `vitest` das devDependencies, remover os scripts `test`/`test:watch`, adicionar `lucide-react` nas dependencies:

```json
{
  "name": "margem",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^15",
    "react": "^19",
    "react-dom": "^19",
    "lucide-react": "^0.460.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

- [ ] **Step 5: Instalar dependências**

Run: `npm install`
Expected: instala `lucide-react` e remove `vitest` do lockfile, sem erros.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: limpa o site anterior para recriar a DiárIA do zero"
```

---

## Task 2: `lib/format.ts` — formatação de moeda

**Files:**
- Create: `lib/format.ts`

- [ ] **Step 1: Implementar formatação de BRL**

```typescript
const formatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function formatBRL(valor: number): string {
  return formatter.format(valor)
}
```

- [ ] **Step 2: Verificar manualmente**

Run: `node -e "console.log(new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(10.9))"`
Expected: `R$ 10,90`

- [ ] **Step 3: Commit**

```bash
git add lib/format.ts
git commit -m "feat: adiciona formatador de moeda BRL"
```

---

## Task 3: `lib/catalog.ts` — catálogo e regra de preço

**Files:**
- Create: `lib/catalog.ts`

- [ ] **Step 1: Implementar tipos, constantes e funções de preço**

```typescript
export const USD_BRL = 5.5
export const MARGEM = 3

export type Categoria = 'Texto' | 'Pesquisa' | 'Produtividade' | 'Imagem' | 'Código'

export type IconeSlug =
  | 'sparkles' | 'message-circle' | 'wand-2' | 'zap' | 'search'
  | 'layers' | 'messages-square' | 'image' | 'code-2' | 'github'

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
  const custoDiaBRL = (ia.usdMes * USD_BRL / 30) * MARGEM
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
    slug: 'chatgpt', nome: 'ChatGPT', empresa: 'OpenAI', planoBase: 'Plus',
    usdMes: 20, categoria: 'Texto',
    descricao: 'O assistente mais completo para escrever, estudar e resolver problemas do dia a dia.',
    pontosFortes: [
      'Respostas claras para qualquer assunto',
      'Ótimo para revisar e melhorar textos',
      'Ajuda em código e planilhas sem enrolação',
    ],
    gradiente: 'from-emerald-400 to-teal-600', icone: 'sparkles',
  },
  {
    slug: 'claude', nome: 'Claude', empresa: 'Anthropic', planoBase: 'Pro',
    usdMes: 20, categoria: 'Texto',
    descricao: 'IA cuidadosa para análises longas, redação e raciocínio passo a passo.',
    pontosFortes: [
      'Lida bem com documentos extensos',
      'Explica o raciocínio por trás das respostas',
      'Boa parceira para escrita e revisão',
    ],
    gradiente: 'from-orange-400 to-amber-600', icone: 'message-circle',
  },
  {
    slug: 'gemini', nome: 'Gemini', empresa: 'Google', planoBase: 'Google AI Pro',
    usdMes: 19.99, categoria: 'Texto',
    descricao: 'IA multimídia do Google, forte em pesquisa, imagens e integração com o dia a dia.',
    pontosFortes: [
      'Entende texto, imagem e voz junto',
      'Conectado aos apps Google',
      'Boa para pesquisa rápida e resumos',
    ],
    gradiente: 'from-blue-400 to-indigo-600', icone: 'wand-2',
  },
  {
    slug: 'grok', nome: 'Grok', empresa: 'xAI', planoBase: 'SuperGrok',
    usdMes: 30, categoria: 'Texto',
    descricao: 'IA direta e bem-humorada, com acesso a informação em tempo real via X.',
    pontosFortes: [
      'Respostas com contexto atualizado',
      'Tom mais informal e objetivo',
      'Boa para acompanhar assuntos do momento',
    ],
    gradiente: 'from-slate-400 to-zinc-700', icone: 'zap',
  },
  {
    slug: 'perplexity', nome: 'Perplexity', empresa: 'Perplexity', planoBase: 'Pro',
    usdMes: 20, categoria: 'Pesquisa',
    descricao: 'Motor de busca com IA que responde com fontes e links verificáveis.',
    pontosFortes: [
      'Cita as fontes de cada resposta',
      'Ótimo para pesquisa aprofundada',
      'Resume artigos e páginas longas',
    ],
    gradiente: 'from-cyan-400 to-sky-600', icone: 'search',
  },
  {
    slug: 'copilot-microsoft', nome: 'Microsoft Copilot', empresa: 'Microsoft', planoBase: 'M365 Premium',
    usdMes: 19.99, categoria: 'Produtividade',
    descricao: 'IA integrada ao Word, Excel e Teams para acelerar o trabalho do dia a dia.',
    pontosFortes: [
      'Cria e edita documentos do Office',
      'Resume reuniões e e-mails',
      'Monta planilhas e apresentações rápido',
    ],
    gradiente: 'from-sky-400 to-blue-700', icone: 'layers',
  },
  {
    slug: 'mistral', nome: 'Mistral Le Chat', empresa: 'Mistral', planoBase: 'Pro',
    usdMes: 14.99, categoria: 'Texto',
    descricao: 'IA europeia rápida e enxuta, boa opção para tarefas de texto do dia a dia.',
    pontosFortes: [
      'Respostas rápidas e diretas',
      'Boa relação custo-benefício',
      'Funciona bem para tarefas simples do dia a dia',
    ],
    gradiente: 'from-red-400 to-orange-600', icone: 'messages-square',
  },
  {
    slug: 'midjourney', nome: 'Midjourney', empresa: 'Midjourney', planoBase: 'Standard',
    usdMes: 30, categoria: 'Imagem',
    descricao: 'Geração de imagens artísticas a partir de descrições em texto.',
    pontosFortes: [
      'Qualidade visual muito alta',
      'Grande variedade de estilos',
      'Ótimo para capas, artes e referências visuais',
    ],
    gradiente: 'from-fuchsia-400 to-purple-700', icone: 'image',
  },
  {
    slug: 'cursor', nome: 'Cursor', empresa: 'Anysphere', planoBase: 'Pro',
    usdMes: 20, categoria: 'Código',
    descricao: 'Editor de código com IA embutida para programar mais rápido.',
    pontosFortes: [
      'Autocompleta trechos inteiros de código',
      'Explica e corrige erros no editor',
      'Acelera refatorações grandes',
    ],
    gradiente: 'from-indigo-400 to-violet-700', icone: 'code-2',
  },
  {
    slug: 'github-copilot', nome: 'GitHub Copilot', empresa: 'GitHub', planoBase: 'Pro',
    usdMes: 10, categoria: 'Código',
    descricao: 'Assistente de código integrado ao editor, direto do GitHub.',
    pontosFortes: [
      'Sugestões de código em tempo real',
      'Funciona nos editores mais usados',
      'Ajuda a escrever testes e documentação',
    ],
    gradiente: 'from-slate-500 to-gray-800', icone: 'github',
  },
]

export function getIAPorSlug(slug: string): IA | undefined {
  return CATALOGO.find((ia) => ia.slug === slug)
}

export const COMBOS: Combo[] = [
  {
    slug: 'kit-estudante', nome: 'Kit Estudante',
    descricao: 'Escrita, dúvidas e pesquisa acadêmica em um pacote só.',
    iasSlugs: ['chatgpt', 'claude', 'perplexity'], descontoPct: 15,
  },
  {
    slug: 'kit-criador', nome: 'Kit Criador',
    descricao: 'Imagem e texto para quem produz conteúdo todo dia.',
    iasSlugs: ['midjourney', 'chatgpt', 'gemini'], descontoPct: 15,
  },
  {
    slug: 'kit-dev', nome: 'Kit Dev',
    descricao: 'Código, revisão e explicação técnica lado a lado.',
    iasSlugs: ['cursor', 'github-copilot', 'claude'], descontoPct: 15,
  },
  {
    slug: 'kit-completo', nome: 'Kit Completo',
    descricao: 'As 10 IAs do catálogo, com o maior desconto da loja.',
    iasSlugs: CATALOGO.map((ia) => ia.slug), descontoPct: 25,
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
```

- [ ] **Step 2: Verificar os valores calculados manualmente**

Run:
```bash
npx tsx -e "
import { CATALOGO, precoDiaBRL, equivaleMensalBRL, COMBOS, comboPrecoDiaBRL } from './lib/catalog'
CATALOGO.forEach(ia => console.log(ia.nome, precoDiaBRL(ia), equivaleMensalBRL(ia)))
COMBOS.forEach(c => console.log(c.nome, comboPrecoDiaBRL(c)))
"
```
Expected (preço/dia, equivalente mensal): ChatGPT 10.9/327, Claude 10.9/327, Gemini 10.9/327, Grok 16.9/507, Perplexity 10.9/327, Microsoft Copilot 10.9/327, Mistral 7.9/237, Midjourney 16.9/507, Cursor 10.9/327, GitHub Copilot 5.9/177. Se algum `tsx` não estiver disponível, rodar `npx --yes tsx` ou validar via `npm run build` mais adiante.

- [ ] **Step 3: Commit**

```bash
git add lib/catalog.ts
git commit -m "feat: adiciona catalogo de IAs e regra de preco por diaria"
```

---

## Task 4: `lib/cart-context.tsx` — estado do carrinho

**Files:**
- Create: `lib/cart-context.tsx`

- [ ] **Step 1: Implementar o Context, reducer, persistência e seletores**

```typescript
'use client'

import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { DIAS_MAXIMO_POR_ITEM, descontoPorDuracao, getComboPorSlug, getIAPorSlug, precoDiaBRL, comboPrecoDiaBRL } from './catalog'

export type ItemCarrinho = {
  tipo: 'ia' | 'combo'
  slug: string
  dias: number
}

type EstadoCarrinho = { itens: ItemCarrinho[] }

type Acao =
  | { type: 'ADICIONAR'; item: ItemCarrinho }
  | { type: 'REMOVER'; tipo: ItemCarrinho['tipo']; slug: string }
  | { type: 'ATUALIZAR_DIAS'; tipo: ItemCarrinho['tipo']; slug: string; dias: number }
  | { type: 'LIMPAR' }
  | { type: 'HIDRATAR'; itens: ItemCarrinho[] }

const CHAVE_LOCALSTORAGE = 'diaria:carrinho'

function clampDias(dias: number): number {
  return Math.min(Math.max(dias, 1), DIAS_MAXIMO_POR_ITEM)
}

function reducer(estado: EstadoCarrinho, acao: Acao): EstadoCarrinho {
  switch (acao.type) {
    case 'ADICIONAR': {
      const existe = estado.itens.some((i) => i.tipo === acao.item.tipo && i.slug === acao.item.slug)
      if (existe) {
        return {
          itens: estado.itens.map((i) =>
            i.tipo === acao.item.tipo && i.slug === acao.item.slug
              ? { ...i, dias: clampDias(i.dias + acao.item.dias) }
              : i
          ),
        }
      }
      return { itens: [...estado.itens, { ...acao.item, dias: clampDias(acao.item.dias) }] }
    }
    case 'REMOVER':
      return { itens: estado.itens.filter((i) => !(i.tipo === acao.tipo && i.slug === acao.slug)) }
    case 'ATUALIZAR_DIAS':
      return {
        itens: estado.itens.map((i) =>
          i.tipo === acao.tipo && i.slug === acao.slug ? { ...i, dias: clampDias(acao.dias) } : i
        ),
      }
    case 'LIMPAR':
      return { itens: [] }
    case 'HIDRATAR':
      return { itens: acao.itens }
    default:
      return estado
  }
}

type CarrinhoContexto = {
  itens: ItemCarrinho[]
  adicionar: (item: ItemCarrinho) => void
  remover: (tipo: ItemCarrinho['tipo'], slug: string) => void
  atualizarDias: (tipo: ItemCarrinho['tipo'], slug: string, dias: number) => void
  limpar: () => void
  subtotal: number
  descontoDuracaoTotal: number
  total: number
  quantidadeItens: number
}

const Contexto = createContext<CarrinhoContexto | null>(null)

function precoDiaItem(item: ItemCarrinho): number {
  if (item.tipo === 'ia') {
    const ia = getIAPorSlug(item.slug)
    return ia ? precoDiaBRL(ia) : 0
  }
  const combo = getComboPorSlug(item.slug)
  return combo ? comboPrecoDiaBRL(combo) : 0
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [estado, dispatch] = useReducer(reducer, { itens: [] })

  useEffect(() => {
    try {
      const bruto = localStorage.getItem(CHAVE_LOCALSTORAGE)
      if (bruto) {
        const itens = JSON.parse(bruto) as ItemCarrinho[]
        dispatch({ type: 'HIDRATAR', itens })
      }
    } catch {
      // localStorage indisponível ou dado corrompido: segue com carrinho vazio
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE_LOCALSTORAGE, JSON.stringify(estado.itens))
    } catch {
      // ambiente sem localStorage: ignora persistência
    }
  }, [estado.itens])

  const valor = useMemo<CarrinhoContexto>(() => {
    const subtotal = estado.itens.reduce((total, item) => total + precoDiaItem(item) * item.dias, 0)
    const descontoDuracaoTotal = estado.itens.reduce((total, item) => {
      const precoItem = precoDiaItem(item) * item.dias
      return total + precoItem * descontoPorDuracao(item.dias)
    }, 0)
    const total = Math.round((subtotal - descontoDuracaoTotal) * 100) / 100

    return {
      itens: estado.itens,
      adicionar: (item) => dispatch({ type: 'ADICIONAR', item }),
      remover: (tipo, slug) => dispatch({ type: 'REMOVER', tipo, slug }),
      atualizarDias: (tipo, slug, dias) => dispatch({ type: 'ATUALIZAR_DIAS', tipo, slug, dias }),
      limpar: () => dispatch({ type: 'LIMPAR' }),
      subtotal: Math.round(subtotal * 100) / 100,
      descontoDuracaoTotal: Math.round(descontoDuracaoTotal * 100) / 100,
      total,
      quantidadeItens: estado.itens.length,
    }
  }, [estado.itens])

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useCart(): CarrinhoContexto {
  const contexto = useContext(Contexto)
  if (!contexto) throw new Error('useCart precisa estar dentro de um CartProvider')
  return contexto
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/cart-context.tsx
git commit -m "feat: adiciona contexto do carrinho com persistencia em localStorage"
```

---

## Task 5: Tema visual — `app/globals.css` e fontes

**Files:**
- Create: `app/globals.css`

- [ ] **Step 1: Implementar tokens, fundo, grid, glow e utilitários**

```css
@import "tailwindcss";

:root {
  --bg: #07080c;
  --fg: #e7e9ee;
  --muted: #8b8fa3;
  --border: rgba(255, 255, 255, 0.1);
  --glass: rgba(255, 255, 255, 0.05);
  --cyan: #22d3ee;
  --violet: #a78bfa;
  --lime: #a3e635;
}

* {
  border-color: var(--border);
}

body {
  background-color: var(--bg);
  color: var(--fg);
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 48px 48px;
  background-position: center top;
}

.glow-cena {
  position: relative;
  isolation: isolate;
}

.glow-cena::before {
  content: "";
  position: absolute;
  inset: -20% -10% auto -10%;
  height: 60%;
  background: radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--cyan) 25%, transparent), transparent 60%),
    radial-gradient(circle at 80% 10%, color-mix(in srgb, var(--violet) 25%, transparent), transparent 60%),
    radial-gradient(circle at 50% 60%, color-mix(in srgb, var(--lime) 15%, transparent), transparent 60%);
  filter: blur(60px);
  z-index: -1;
  pointer-events: none;
}

.cartao-vidro {
  background: var(--glass);
  backdrop-filter: blur(14px);
  border: 1px solid var(--border);
  border-radius: 1rem;
  position: relative;
  transition: border-color 0.2s ease;
}

.cartao-vidro::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: radial-gradient(
    220px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    color-mix(in srgb, var(--cyan) 70%, transparent),
    transparent 70%
  );
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.cartao-vidro:hover::before {
  opacity: 1;
}

.badge-terminal {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-family: var(--font-geist-mono);
  font-size: 0.75rem;
  color: var(--lime);
  border: 1px solid color-mix(in srgb, var(--lime) 40%, transparent);
  border-radius: 9999px;
  padding: 0.125rem 0.625rem;
}

.badge-terminal::before {
  content: "";
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 9999px;
  background: var(--lime);
  box-shadow: 0 0 6px var(--lime);
}

.cursor-piscando::after {
  content: "▌";
  margin-left: 0.25rem;
  animation: piscar 1s steps(1) infinite;
}

@keyframes piscar {
  50% { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .cursor-piscando::after {
    animation: none;
  }
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/globals.css
git commit -m "feat: adiciona tema visual escuro da DiariA"
```

---

## Task 6: `app/layout.tsx` — layout raiz

**Files:**
- Create: `app/layout.tsx`
- Depends on: `components/layout/Header.tsx`, `components/layout/Footer.tsx`, `components/layout/CartDrawer.tsx` (Task 7)

- [ ] **Step 1: Implementar layout com fontes Geist e providers**

```typescript
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/lib/cart-context'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/layout/CartDrawer'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DiárIA — alugue acesso a IA por diária',
  description: 'Use a IA que você precisa só nos dias em que vai usar. Projeto acadêmico fictício.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Commit (junto com Task 7, pois depende dela para compilar)**

---

## Task 7: Componentes de layout — Header, CartDrawer, Footer

**Files:**
- Create: `components/layout/Header.tsx`, `components/layout/CartDrawer.tsx`, `components/layout/Footer.tsx`
- Create: `components/ui/PrecoMono.tsx`

- [ ] **Step 1: `components/ui/PrecoMono.tsx`** — número monoespaçado para preços

```typescript
export function PrecoMono({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <span className={`font-mono tabular-nums ${className}`}>{children}</span>
}
```

- [ ] **Step 2: `components/layout/Header.tsx`** — navegação + botão do carrinho (client component, usa `useCart`)

```typescript
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/lib/cart-context'

const LINKS = [
  { href: '/ias', label: 'Catálogo' },
  { href: '/combos', label: 'Combos' },
]

export function Header() {
  const { quantidadeItens } = useCart()
  const [drawerAberto, setDrawerAberto] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07080c]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-mono text-lg font-semibold tracking-tight">
          Diár<span className="text-cyan-400">IA</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-[var(--muted)] sm:flex">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          aria-label={`Abrir carrinho, ${quantidadeItens} ${quantidadeItens === 1 ? 'item' : 'itens'}`}
          onClick={() => window.dispatchEvent(new CustomEvent('carrinho:abrir'))}
          className="relative flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm transition-colors hover:border-cyan-400/50"
        >
          <ShoppingCart size={16} />
          Carrinho
          {quantidadeItens > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400 font-mono text-xs font-bold text-black">
              {quantidadeItens}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
```

- [ ] **Step 3: `components/layout/CartDrawer.tsx`** — drawer lateral (tela cheia no celular), ouve o evento `carrinho:abrir` disparado pelo Header

```typescript
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X, Trash2 } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { getIAPorSlug, getComboPorSlug, precoDiaBRL, comboPrecoDiaBRL } from '@/lib/catalog'
import { formatBRL } from '@/lib/format'
import { PrecoMono } from '@/components/ui/PrecoMono'

export function CartDrawer() {
  const [aberto, setAberto] = useState(false)
  const { itens, remover, atualizarDias, subtotal, descontoDuracaoTotal, total } = useCart()

  useEffect(() => {
    const abrir = () => setAberto(true)
    window.addEventListener('carrinho:abrir', abrir)
    return () => window.removeEventListener('carrinho:abrir', abrir)
  }, [])

  if (!aberto) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Fechar carrinho"
        className="absolute inset-0 bg-black/60"
        onClick={() => setAberto(false)}
      />
      <div className="relative flex h-full w-full flex-col border-l border-white/10 bg-[#0b0d14] p-6 sm:w-96">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Seu carrinho</h2>
          <button type="button" aria-label="Fechar carrinho" onClick={() => setAberto(false)}>
            <X size={20} />
          </button>
        </div>

        {itens.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Seu carrinho está vazio. Explore o catálogo e adicione uma IA.</p>
        ) : (
          <div className="flex-1 space-y-4 overflow-y-auto">
            {itens.map((item) => {
              const nome = item.tipo === 'ia' ? getIAPorSlug(item.slug)?.nome : getComboPorSlug(item.slug)?.nome
              const precoDia = item.tipo === 'ia'
                ? precoDiaBRL(getIAPorSlug(item.slug)!)
                : comboPrecoDiaBRL(getComboPorSlug(item.slug)!)
              return (
                <div key={`${item.tipo}-${item.slug}`} className="cartao-vidro p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{nome}</span>
                    <button type="button" aria-label={`Remover ${nome}`} onClick={() => remover(item.tipo, item.slug)}>
                      <Trash2 size={16} className="text-[var(--muted)] hover:text-red-400" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-[var(--muted)]">
                      Dias
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={item.dias}
                        onChange={(e) => atualizarDias(item.tipo, item.slug, Number(e.target.value))}
                        className="w-16 rounded border border-white/10 bg-transparent px-2 py-1 font-mono"
                      />
                    </label>
                    <PrecoMono>{formatBRL(precoDia * item.dias)}</PrecoMono>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {itens.length > 0 && (
          <div className="mt-6 space-y-2 border-t border-white/10 pt-4 text-sm">
            <div className="flex justify-between text-[var(--muted)]">
              <span>Subtotal</span>
              <PrecoMono>{formatBRL(subtotal)}</PrecoMono>
            </div>
            <div className="flex justify-between text-[var(--muted)]">
              <span>Desconto por duração</span>
              <PrecoMono>-{formatBRL(descontoDuracaoTotal)}</PrecoMono>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <PrecoMono>{formatBRL(total)}</PrecoMono>
            </div>
            <Link
              href="/checkout"
              onClick={() => setAberto(false)}
              className="mt-4 block rounded-full bg-cyan-400 py-3 text-center font-semibold text-black transition-opacity hover:opacity-90"
            >
              Fechar pedido
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: `components/layout/Footer.tsx`**

```typescript
export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 px-4 py-10 text-sm text-[var(--muted)]">
      <div className="mx-auto max-w-6xl space-y-2">
        <p className="font-mono">
          Diár<span className="text-cyan-400">IA</span>
        </p>
        <p>
          Projeto acadêmico fictício. Nenhum produto é vendido. As marcas citadas pertencem aos seus
          respectivos donos e não têm relação com este projeto.
        </p>
      </div>
    </footer>
  )
}
```

- [ ] **Step 5: Rodar o build para garantir que layout + header + drawer + footer compilam**

Run: `npm run build`
Expected: falha apenas por falta de `app/page.tsx` (ainda não criado) — confirma que Tasks 6/7 compilam corretamente na parte de layout. Se houver erro de tipo/import nesses arquivos, corrigir antes de prosseguir.

- [ ] **Step 6: Commit**

```bash
git add app/layout.tsx components/layout components/ui/PrecoMono.tsx
git commit -m "feat: adiciona layout raiz, header, carrinho e rodape"
```

---

## Task 8: Componentes de UI compartilhados

**Files:**
- Create: `components/ui/IAChip.tsx`, `components/ui/ContadorAnimado.tsx`, `components/ui/BadgeTerminal.tsx`

- [ ] **Step 1: `components/ui/IAChip.tsx`** — chip visual (ícone lucide + gradiente), mapeando `IconeSlug` para o componente lucide

```typescript
import { Sparkles, MessageCircle, Wand2, Zap, Search, Layers, MessagesSquare, Image as ImageIcon, Code2, Github, type LucideIcon } from 'lucide-react'
import type { IconeSlug } from '@/lib/catalog'

const ICONES: Record<IconeSlug, LucideIcon> = {
  sparkles: Sparkles,
  'message-circle': MessageCircle,
  'wand-2': Wand2,
  zap: Zap,
  search: Search,
  layers: Layers,
  'messages-square': MessagesSquare,
  image: ImageIcon,
  'code-2': Code2,
  github: Github,
}

export function IAChip({ icone, gradiente, tamanho = 48 }: { icone: IconeSlug; gradiente: string; tamanho?: number }) {
  const Icone = ICONES[icone]
  return (
    <div
      className={`flex items-center justify-center rounded-2xl bg-gradient-to-br ${gradiente}`}
      style={{ width: tamanho, height: tamanho }}
    >
      <Icone size={tamanho * 0.5} className="text-white" />
    </div>
  )
}
```

- [ ] **Step 2: `components/ui/ContadorAnimado.tsx`** — efeito de contagem (client component, sem lib externa)

```typescript
'use client'

import { useEffect, useRef, useState } from 'react'

export function ContadorAnimado({ valor, duracaoMs = 800 }: { valor: number; duracaoMs?: number }) {
  const [exibido, setExibido] = useState(0)
  const inicioRef = useRef<number | null>(null)

  useEffect(() => {
    let frame: number
    const passo = (agora: number) => {
      if (inicioRef.current === null) inicioRef.current = agora
      const progresso = Math.min((agora - inicioRef.current) / duracaoMs, 1)
      setExibido(Math.round(progresso * valor))
      if (progresso < 1) frame = requestAnimationFrame(passo)
    }
    frame = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(frame)
  }, [valor, duracaoMs])

  return <span className="font-mono tabular-nums">{exibido}</span>
}
```

- [ ] **Step 3: `components/ui/BadgeTerminal.tsx`**

```typescript
export function BadgeTerminal({ children }: { children: React.ReactNode }) {
  return <span className="badge-terminal">{children}</span>
}
```

- [ ] **Step 4: Commit**

```bash
git add components/ui
git commit -m "feat: adiciona chip de IA, contador animado e badge terminal"
```

---

## Task 9: Home (`app/page.tsx`) e componentes de `components/home`

**Files:**
- Create: `components/home/Hero.tsx`, `components/home/ComoFunciona.tsx`, `components/home/VitrineCatalogo.tsx`, `components/home/Comparador.tsx`, `components/home/FAQ.tsx`
- Create: `app/page.tsx`
- Depends on: `components/catalog/IACard.tsx` (Task 10) para a vitrine — criar `IACard` antes desta task ou adiar a montagem da vitrine para depois da Task 10 (ver Step 6).

- [ ] **Step 1: `components/home/Hero.tsx`**

```typescript
import Link from 'next/link'
import { ContadorAnimado } from '@/components/ui/ContadorAnimado'
import { BadgeTerminal } from '@/components/ui/BadgeTerminal'
import { CATALOGO } from '@/lib/catalog'

export function Hero() {
  return (
    <section className="glow-cena mx-auto max-w-6xl px-4 pb-20 pt-16 text-center sm:pt-24">
      <BadgeTerminal>status: online</BadgeTerminal>
      <h1 className="cursor-piscando mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
        Use a IA que você precisa. Só no dia em que precisar.
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-[var(--muted)]">
        Nada de assinatura mensal parada na sua fatura. Na DiárIA você aluga acesso por diária e paga
        só pelos dias que realmente vai usar.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link href="/ias" className="rounded-full bg-cyan-400 px-6 py-3 font-semibold text-black transition-opacity hover:opacity-90">
          Ver catálogo
        </Link>
        <Link href="/combos" className="rounded-full border border-white/20 px-6 py-3 transition-colors hover:border-cyan-400/50">
          Ver combos
        </Link>
      </div>
      <p className="mt-10 text-sm text-[var(--muted)]">
        <ContadorAnimado valor={CATALOGO.length} /> IAs disponíveis agora
      </p>
    </section>
  )
}
```

- [ ] **Step 2: `components/home/ComoFunciona.tsx`**

```typescript
const ETAPAS = [
  { titulo: 'Escolha a IA', texto: 'Navegue pelo catálogo ou por um combo pronto para o que você precisa.' },
  { titulo: 'Defina os dias', texto: 'Selecione quantos dias vai usar. O preço já vem calculado por diária.' },
  { titulo: 'Ative o acesso', texto: 'Confirme o pedido e receba a validade de cada IA contratada.' },
]

export function ComoFunciona() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-2xl font-semibold">Como funciona</h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {ETAPAS.map((etapa, indice) => (
          <div key={etapa.titulo} className="cartao-vidro p-6">
            <span className="font-mono text-sm text-cyan-400">0{indice + 1}</span>
            <h3 className="mt-3 font-semibold">{etapa.titulo}</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">{etapa.texto}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: `components/home/Comparador.tsx`**

```typescript
import { getIAPorSlug, precoDiaBRL } from '@/lib/catalog'
import { formatBRL } from '@/lib/format'
import { PrecoMono } from '@/components/ui/PrecoMono'

export function Comparador() {
  const midjourney = getIAPorSlug('midjourney')!
  const diasDeUso = 3
  const custoDiaria = precoDiaBRL(midjourney) * diasDeUso
  const custoAssinatura = midjourney.usdMes * 5.5
  const economia = custoAssinatura - custoDiaria

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-2xl font-semibold">Assinatura mensal vs. diária</h2>
      <div className="mt-8 cartao-vidro grid gap-6 p-6 sm:grid-cols-3">
        <div>
          <p className="text-sm text-[var(--muted)]">Quem assina o mês inteiro</p>
          <PrecoMono className="text-2xl">{formatBRL(custoAssinatura)}</PrecoMono>
        </div>
        <div>
          <p className="text-sm text-[var(--muted)]">Quem usa {midjourney.nome} só {diasDeUso} dias no mês</p>
          <PrecoMono className="text-2xl">{formatBRL(custoDiaria)}</PrecoMono>
        </div>
        <div>
          <p className="text-sm text-[var(--muted)]">Economia com a diária</p>
          <PrecoMono className="text-2xl text-lime-400">{formatBRL(economia)}</PrecoMono>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: `components/home/FAQ.tsx`**

```typescript
const PERGUNTAS = [
  { pergunta: 'Como é calculado o preço da diária?', resposta: 'Pegamos o plano mensal oficial de cada IA, dividimos por 30 dias e aplicamos a margem da loja. O resultado é arredondado para o valor mais próximo terminado em ,90.' },
  { pergunta: 'Isso é uma loja de verdade?', resposta: 'Não. É um projeto acadêmico fictício, sem pagamento real e sem coleta de dados de cartão.' },
  { pergunta: 'Posso combinar mais de uma IA?', resposta: 'Sim. Os combos juntam IAs complementares com desconto sobre a soma das diárias.' },
  { pergunta: 'O que acontece depois dos dias contratados?', resposta: 'O acesso simulado expira na data mostrada na confirmação do pedido.' },
]

export function FAQ() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-2xl font-semibold">Perguntas frequentes</h2>
      <div className="mt-8 space-y-4">
        {PERGUNTAS.map((item) => (
          <details key={item.pergunta} className="cartao-vidro group p-5">
            <summary className="cursor-pointer list-none font-medium">{item.pergunta}</summary>
            <p className="mt-2 text-sm text-[var(--muted)]">{item.resposta}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 5: `components/home/VitrineCatalogo.tsx`** (usa `IACard`, criado na Task 10 — implementar este arquivo somente após a Task 10 estar pronta)

```typescript
import Link from 'next/link'
import { CATALOGO } from '@/lib/catalog'
import { IACard } from '@/components/catalog/IACard'

export function VitrineCatalogo() {
  const destaques = CATALOGO.slice(0, 4)
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Catálogo</h2>
        <Link href="/ias" className="text-sm text-cyan-400 hover:underline">
          Ver todas
        </Link>
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {destaques.map((ia) => (
          <IACard key={ia.slug} ia={ia} />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 6: `app/page.tsx`**

```typescript
import { Hero } from '@/components/home/Hero'
import { ComoFunciona } from '@/components/home/ComoFunciona'
import { VitrineCatalogo } from '@/components/home/VitrineCatalogo'
import { Comparador } from '@/components/home/Comparador'
import { FAQ } from '@/components/home/FAQ'

export default function HomePage() {
  return (
    <>
      <Hero />
      <ComoFunciona />
      <VitrineCatalogo />
      <Comparador />
      <FAQ />
    </>
  )
}
```

- [ ] **Step 7: Commit** (fazer junto com a Task 10, já que `VitrineCatalogo` e `app/page.tsx` dependem de `IACard`)

---

## Task 10: Catálogo (`/ias`) e componentes `components/catalog`

**Files:**
- Create: `components/catalog/IACard.tsx`, `components/catalog/FiltroCategoria.tsx`
- Create: `app/ias/page.tsx`

- [ ] **Step 1: `components/catalog/IACard.tsx`** — card usado na vitrine, no catálogo e nos combos

```typescript
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { IAChip } from '@/components/ui/IAChip'
import { PrecoMono } from '@/components/ui/PrecoMono'
import { useCart } from '@/lib/cart-context'
import { precoDiaBRL, type IA } from '@/lib/catalog'
import { formatBRL } from '@/lib/format'

export function IACard({ ia }: { ia: IA }) {
  const { adicionar } = useCart()
  const [dias, setDias] = useState(1)
  const precoDia = precoDiaBRL(ia)

  return (
    <div className="cartao-vidro flex flex-col p-5">
      <Link href={`/ias/${ia.slug}`} className="flex flex-1 flex-col">
        <IAChip icone={ia.icone} gradiente={ia.gradiente} />
        <h3 className="mt-4 font-semibold">{ia.nome}</h3>
        <p className="text-xs text-[var(--muted)]">{ia.empresa} · {ia.categoria}</p>
        <p className="mt-3 text-sm text-[var(--muted)]">{ia.descricao}</p>
      </Link>
      <div className="mt-4 flex items-center justify-between">
        <PrecoMono className="text-lg font-semibold">
          {formatBRL(precoDia)}<span className="text-xs text-[var(--muted)]">/dia</span>
        </PrecoMono>
        <label className="flex items-center gap-1 text-xs text-[var(--muted)]">
          Dias
          <input
            type="number"
            min={1}
            max={30}
            value={dias}
            onChange={(e) => setDias(Math.min(Math.max(Number(e.target.value), 1), 30))}
            className="w-14 rounded border border-white/10 bg-transparent px-2 py-1 font-mono"
          />
        </label>
      </div>
      <button
        type="button"
        onClick={() => adicionar({ tipo: 'ia', slug: ia.slug, dias })}
        className="mt-4 rounded-full border border-white/15 py-2 text-sm font-medium transition-colors hover:border-cyan-400/60 hover:text-cyan-300"
      >
        Adicionar
      </button>
    </div>
  )
}
```

- [ ] **Step 2: `components/catalog/FiltroCategoria.tsx`**

```typescript
'use client'

import type { Categoria } from '@/lib/catalog'

const CATEGORIAS: Categoria[] = ['Texto', 'Pesquisa', 'Produtividade', 'Imagem', 'Código']

export function FiltroCategoria({
  ativa,
  onSelecionar,
}: {
  ativa: Categoria | 'Todas'
  onSelecionar: (categoria: Categoria | 'Todas') => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {(['Todas', ...CATEGORIAS] as const).map((categoria) => (
        <button
          key={categoria}
          type="button"
          onClick={() => onSelecionar(categoria)}
          className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
            ativa === categoria ? 'border-cyan-400 text-cyan-300' : 'border-white/15 text-[var(--muted)] hover:border-white/30'
          }`}
        >
          {categoria}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: `app/ias/page.tsx`** — client component com busca + filtro

```typescript
'use client'

import { useMemo, useState } from 'react'
import { CATALOGO, type Categoria } from '@/lib/catalog'
import { IACard } from '@/components/catalog/IACard'
import { FiltroCategoria } from '@/components/catalog/FiltroCategoria'

export default function CatalogoPage() {
  const [categoria, setCategoria] = useState<Categoria | 'Todas'>('Todas')
  const [busca, setBusca] = useState('')

  const iasFiltradas = useMemo(() => {
    return CATALOGO.filter((ia) => {
      const bateCategoria = categoria === 'Todas' || ia.categoria === categoria
      const bateBusca = ia.nome.toLowerCase().includes(busca.toLowerCase()) || ia.empresa.toLowerCase().includes(busca.toLowerCase())
      return bateCategoria && bateBusca
    })
  }, [categoria, busca])

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-semibold">Catálogo</h1>
      <p className="mt-2 text-[var(--muted)]">Todas as IAs disponíveis para alugar por diária.</p>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <FiltroCategoria ativa={categoria} onSelecionar={setCategoria} />
        <input
          type="search"
          placeholder="Buscar por nome ou empresa"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="rounded-full border border-white/15 bg-transparent px-4 py-2 text-sm placeholder:text-[var(--muted)]"
        />
      </div>

      {iasFiltradas.length === 0 ? (
        <p className="mt-12 text-sm text-[var(--muted)]">Nenhuma IA encontrada com esse filtro.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {iasFiltradas.map((ia) => (
            <IACard key={ia.slug} ia={ia} />
          ))}
        </div>
      )}
    </section>
  )
}
```

- [ ] **Step 4: Rodar build para validar Tasks 9 e 10 juntas**

Run: `npm run build`
Expected: compila sem erros de tipo (rotas `/ias/[slug]`, `/combos`, `/checkout`, `/pedido-confirmado` ainda não existem — normal até a Task 12).

- [ ] **Step 5: Commit**

```bash
git add components/home components/catalog app/page.tsx app/ias/page.tsx
git commit -m "feat: adiciona home e catalogo com filtro e busca"
```

---

## Task 11: Página da IA (`/ias/[slug]`) e simulador

**Files:**
- Create: `components/catalog/Simulador.tsx`
- Create: `app/ias/[slug]/page.tsx`

- [ ] **Step 1: `components/catalog/Simulador.tsx`** — client component: slider de dias, total, economia vs. assinatura, botão adicionar

```typescript
'use client'

import { useState } from 'react'
import { useCart } from '@/lib/cart-context'
import { descontoPorDuracao, precoDiaBRL, USD_BRL, type IA } from '@/lib/catalog'
import { formatBRL } from '@/lib/format'
import { PrecoMono } from '@/components/ui/PrecoMono'

export function Simulador({ ia }: { ia: IA }) {
  const { adicionar } = useCart()
  const [dias, setDias] = useState(7)
  const precoDia = precoDiaBRL(ia)
  const desconto = descontoPorDuracao(dias)
  const totalComDesconto = Math.round(precoDia * dias * (1 - desconto) * 100) / 100
  const custoAssinaturaProporcional = Math.round(((ia.usdMes * USD_BRL) / 30) * dias * 100) / 100
  const economia = Math.max(custoAssinaturaProporcional - totalComDesconto, 0)

  return (
    <div className="cartao-vidro p-6">
      <label className="flex items-center justify-between text-sm text-[var(--muted)]">
        Dias de uso
        <span className="font-mono text-white">{dias}</span>
      </label>
      <input
        type="range"
        min={1}
        max={30}
        value={dias}
        onChange={(e) => setDias(Number(e.target.value))}
        className="mt-3 w-full accent-cyan-400"
      />

      <div className="mt-6 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-[var(--muted)]">Desconto por duração</span>
          <span>{Math.round(desconto * 100)}%</span>
        </div>
        <div className="flex justify-between text-base font-semibold">
          <span>Total</span>
          <PrecoMono>{formatBRL(totalComDesconto)}</PrecoMono>
        </div>
        <div className="flex justify-between text-lime-400">
          <span>Economia vs. assinatura</span>
          <PrecoMono>{formatBRL(economia)}</PrecoMono>
        </div>
      </div>

      <button
        type="button"
        onClick={() => adicionar({ tipo: 'ia', slug: ia.slug, dias })}
        className="mt-6 w-full rounded-full bg-cyan-400 py-3 font-semibold text-black transition-opacity hover:opacity-90"
      >
        Adicionar ao carrinho
      </button>
    </div>
  )
}
```

- [ ] **Step 2: `app/ias/[slug]/page.tsx`** — Server Component com `generateStaticParams`

```typescript
import { notFound } from 'next/navigation'
import { CATALOGO, getIAPorSlug, precoDiaBRL, equivaleMensalBRL } from '@/lib/catalog'
import { formatBRL } from '@/lib/format'
import { IAChip } from '@/components/ui/IAChip'
import { PrecoMono } from '@/components/ui/PrecoMono'
import { Simulador } from '@/components/catalog/Simulador'

export function generateStaticParams() {
  return CATALOGO.map((ia) => ({ slug: ia.slug }))
}

export default async function IADetalhePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ia = getIAPorSlug(slug)
  if (!ia) notFound()

  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <IAChip icone={ia.icone} gradiente={ia.gradiente} tamanho={64} />
        <h1 className="mt-6 text-3xl font-semibold">{ia.nome}</h1>
        <p className="text-sm text-[var(--muted)]">{ia.empresa} · Plano de referência: {ia.planoBase}</p>
        <p className="mt-4 max-w-xl text-[var(--muted)]">{ia.descricao}</p>

        <ul className="mt-6 space-y-2 text-sm">
          {ia.pontosFortes.map((ponto) => (
            <li key={ponto} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              {ponto}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex items-center gap-6">
          <div>
            <p className="text-xs text-[var(--muted)]">Preço por dia</p>
            <PrecoMono className="text-2xl font-semibold">{formatBRL(precoDiaBRL(ia))}</PrecoMono>
          </div>
          <div>
            <p className="text-xs text-[var(--muted)]">Equivale a por mês</p>
            <PrecoMono className="text-2xl">{formatBRL(equivaleMensalBRL(ia))}</PrecoMono>
          </div>
        </div>
      </div>

      <Simulador ia={ia} />
    </section>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/catalog/Simulador.tsx "app/ias/[slug]"
git commit -m "feat: adiciona pagina de detalhe da IA com simulador"
```

---

## Task 12: Combos (`/combos`)

**Files:**
- Create: `components/catalog/ComboCard.tsx`
- Create: `app/combos/page.tsx`

- [ ] **Step 1: `components/catalog/ComboCard.tsx`**

```typescript
'use client'

import { useCart } from '@/lib/cart-context'
import { comboPrecoDiaBRL, getIAPorSlug, type Combo } from '@/lib/catalog'
import { formatBRL } from '@/lib/format'
import { PrecoMono } from '@/components/ui/PrecoMono'
import { IAChip } from '@/components/ui/IAChip'

export function ComboCard({ combo }: { combo: Combo }) {
  const { adicionar } = useCart()
  const ias = combo.iasSlugs.map((slug) => getIAPorSlug(slug)!).filter(Boolean)
  const precoDia = comboPrecoDiaBRL(combo)

  return (
    <div className="cartao-vidro p-6">
      <div className="flex -space-x-2">
        {ias.slice(0, 4).map((ia) => (
          <IAChip key={ia.slug} icone={ia.icone} gradiente={ia.gradiente} tamanho={40} />
        ))}
        {ias.length > 4 && (
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-xs font-mono">
            +{ias.length - 4}
          </span>
        )}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{combo.nome}</h3>
      <p className="mt-1 text-sm text-[var(--muted)]">{combo.descricao}</p>
      <p className="mt-2 text-xs text-[var(--muted)]">{ias.map((ia) => ia.nome).join(', ')}</p>

      <div className="mt-4 flex items-center justify-between">
        <PrecoMono className="text-xl font-semibold">
          {formatBRL(precoDia)}<span className="text-xs text-[var(--muted)]">/dia</span>
        </PrecoMono>
        <span className="badge-terminal">-{combo.descontoPct}%</span>
      </div>

      <button
        type="button"
        onClick={() => adicionar({ tipo: 'combo', slug: combo.slug, dias: 7 })}
        className="mt-4 w-full rounded-full border border-white/15 py-2 text-sm font-medium transition-colors hover:border-cyan-400/60 hover:text-cyan-300"
      >
        Adicionar combo (7 dias)
      </button>
    </div>
  )
}
```

- [ ] **Step 2: `app/combos/page.tsx`**

```typescript
import { COMBOS } from '@/lib/catalog'
import { ComboCard } from '@/components/catalog/ComboCard'

export default function CombosPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-semibold">Combos</h1>
      <p className="mt-2 text-[var(--muted)]">Pacotes de IAs complementares com desconto sobre a soma das diárias.</p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {COMBOS.map((combo) => (
          <ComboCard key={combo.slug} combo={combo} />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/catalog/ComboCard.tsx app/combos/page.tsx
git commit -m "feat: adiciona pagina de combos"
```

---

## Task 13: Checkout e confirmação

**Files:**
- Create: `app/checkout/page.tsx`
- Create: `app/pedido-confirmado/page.tsx`

- [ ] **Step 1: `app/checkout/page.tsx`** — client component: nome, e-mail, resumo, gera pedido e navega para confirmação passando dados via `sessionStorage` (evita expor tudo na URL)

```typescript
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useCart } from '@/lib/cart-context'
import { getIAPorSlug, getComboPorSlug, precoDiaBRL, comboPrecoDiaBRL } from '@/lib/catalog'
import { formatBRL } from '@/lib/format'
import { PrecoMono } from '@/components/ui/PrecoMono'

export default function CheckoutPage() {
  const router = useRouter()
  const { itens, subtotal, descontoDuracaoTotal, total, limpar } = useCart()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')

  const podeConfirmar = itens.length > 0 && nome.trim().length > 1 && email.includes('@')

  function ativarAcesso() {
    const numeroPedido = `DIA-${Date.now().toString(36).toUpperCase()}`
    const pedido = {
      numeroPedido,
      nome,
      email,
      criadoEm: new Date().toISOString(),
      itens: itens.map((item) => ({
        ...item,
        nome: item.tipo === 'ia' ? getIAPorSlug(item.slug)?.nome : getComboPorSlug(item.slug)?.nome,
      })),
      total,
    }
    try {
      sessionStorage.setItem('diaria:ultimo-pedido', JSON.stringify(pedido))
    } catch {
      // sem sessionStorage: a página de confirmação cai no estado "pedido não encontrado"
    }
    limpar()
    router.push('/pedido-confirmado')
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-semibold">Checkout</h1>
      <p className="mt-2 text-[var(--muted)]">Simulação de pedido. Nenhum dado de pagamento é solicitado.</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <label className="text-sm">
          Nome
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/15 bg-transparent px-3 py-2"
            placeholder="Seu nome"
          />
        </label>
        <label className="text-sm">
          E-mail
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/15 bg-transparent px-3 py-2"
            placeholder="voce@email.com"
          />
        </label>
      </div>

      <div className="mt-8 cartao-vidro p-6">
        <h2 className="font-semibold">Resumo do pedido</h2>
        {itens.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted)]">Seu carrinho está vazio.</p>
        ) : (
          <>
            <ul className="mt-4 space-y-2 text-sm">
              {itens.map((item) => {
                const nomeItem = item.tipo === 'ia' ? getIAPorSlug(item.slug)?.nome : getComboPorSlug(item.slug)?.nome
                const precoDia = item.tipo === 'ia' ? precoDiaBRL(getIAPorSlug(item.slug)!) : comboPrecoDiaBRL(getComboPorSlug(item.slug)!)
                return (
                  <li key={`${item.tipo}-${item.slug}`} className="flex justify-between">
                    <span>{nomeItem} · {item.dias} dias</span>
                    <PrecoMono>{formatBRL(precoDia * item.dias)}</PrecoMono>
                  </li>
                )
              })}
            </ul>
            <div className="mt-4 space-y-1 border-t border-white/10 pt-4 text-sm">
              <div className="flex justify-between text-[var(--muted)]">
                <span>Subtotal</span>
                <PrecoMono>{formatBRL(subtotal)}</PrecoMono>
              </div>
              <div className="flex justify-between text-[var(--muted)]">
                <span>Desconto</span>
                <PrecoMono>-{formatBRL(descontoDuracaoTotal)}</PrecoMono>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <PrecoMono>{formatBRL(total)}</PrecoMono>
              </div>
            </div>
          </>
        )}
      </div>

      <button
        type="button"
        disabled={!podeConfirmar}
        onClick={ativarAcesso}
        className="mt-8 w-full rounded-full bg-cyan-400 py-3 font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
      >
        Ativar acesso
      </button>
    </section>
  )
}
```

- [ ] **Step 2: `app/pedido-confirmado/page.tsx`** — lê o pedido do `sessionStorage`, calcula validade por item, mostra animação de "acesso liberado"

```typescript
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

type ItemPedido = { tipo: 'ia' | 'combo'; slug: string; dias: number; nome?: string }
type Pedido = { numeroPedido: string; nome: string; email: string; criadoEm: string; itens: ItemPedido[]; total: number }

function calcularValidade(dias: number): string {
  const data = new Date()
  data.setDate(data.getDate() + dias)
  return data.toLocaleDateString('pt-BR')
}

export default function PedidoConfirmadoPage() {
  const [pedido, setPedido] = useState<Pedido | null | undefined>(undefined)

  useEffect(() => {
    try {
      const bruto = sessionStorage.getItem('diaria:ultimo-pedido')
      setPedido(bruto ? (JSON.parse(bruto) as Pedido) : null)
    } catch {
      setPedido(null)
    }
  }, [])

  if (pedido === undefined) return null

  if (pedido === null) {
    return (
      <section className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Nenhum pedido encontrado</h1>
        <p className="mt-2 text-[var(--muted)]">Finalize uma compra no checkout para ver a confirmação aqui.</p>
        <Link href="/ias" className="mt-6 inline-block text-cyan-400 hover:underline">
          Ir para o catálogo
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-16 text-center">
      <CheckCircle2 size={48} className="mx-auto text-lime-400" />
      <h1 className="mt-4 text-3xl font-semibold">Acesso liberado</h1>
      <p className="mt-2 text-[var(--muted)]">
        Pedido <span className="font-mono">{pedido.numeroPedido}</span> confirmado para {pedido.nome}.
      </p>
      <p className="mt-1 text-xs text-[var(--muted)]">Simulação. Nenhum e-mail real é enviado.</p>

      <ul className="mt-8 space-y-3 text-left">
        {pedido.itens.map((item) => (
          <li key={`${item.tipo}-${item.slug}`} className="cartao-vidro flex items-center justify-between p-4">
            <span>{item.nome}</span>
            <span className="text-sm text-[var(--muted)]">válido até {calcularValidade(item.dias)}</span>
          </li>
        ))}
      </ul>

      <Link href="/" className="mt-10 inline-block rounded-full border border-white/15 px-6 py-3 hover:border-cyan-400/50">
        Voltar para a home
      </Link>
    </section>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/checkout app/pedido-confirmado
git commit -m "feat: adiciona checkout e confirmacao de pedido simulados"
```

---

## Task 14: README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Escrever o README explicando o projeto, a regra de preço e como mudar câmbio/margem**

```markdown
# DiárIA

Projeto acadêmico fictício de uma loja que "aluga" acesso a IAs por diária: em vez de assinar o mês
inteiro, a pessoa paga só pelos dias que vai usar. Não existe produto real à venda, nem integração
de pagamento, nem coleta de dados de cartão.

## Stack

Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + `lucide-react`.

## Regra de preço

Toda a lógica de preço vive em `lib/catalog.ts`:

```
custoDiaBRL = planoMensalUSD * USD_BRL / 30
precoDia = arredondarPara90(custoDiaBRL * MARGEM)
```

`arredondarPara90` leva o valor ao número mais próximo terminado em ",90".

Para mudar o câmbio ou a margem usada em toda a loja, edite as constantes no topo de `lib/catalog.ts`:

```typescript
export const USD_BRL = 5.5 // cotação do dólar usada no cálculo
export const MARGEM = 3    // multiplicador sobre o custo diário
```

Alterar qualquer uma delas recalcula automaticamente o preço de todas as IAs e combos, já que nenhum
preço é digitado manualmente — tudo deriva dessas duas constantes e do `usdMes` de cada IA.

## Rodando localmente

```bash
npm install
npm run dev
```

## Estrutura

- `lib/catalog.ts` — catálogo de IAs, combos e regra de preço
- `lib/cart-context.tsx` — estado do carrinho (Context + localStorage)
- `app/` — páginas (Home, Catálogo, Detalhe da IA, Combos, Checkout, Confirmação)
- `components/` — componentes de layout, catálogo, home e UI compartilhada
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: atualiza README com a regra de preco e como rodar o projeto"
```

---

## Task 15: Build, lint e verificação manual das rotas

**Files:** nenhum arquivo novo — apenas verificação e correções pontuais nos arquivos já criados.

- [ ] **Step 1: Rodar o build de produção**

Run: `npm run build`
Expected: build concluído sem erros. Corrigir qualquer erro de tipo (ex.: `params` assíncrono nas rotas dinâmicas, imports não usados) diretamente nos arquivos afetados antes de seguir.

- [ ] **Step 2: Rodar o lint**

Run: `npm run lint`
Expected: sem erros. Corrigir avisos relevantes (variáveis não usadas, hooks com dependências faltando).

- [ ] **Step 3: Subir o servidor de desenvolvimento**

Run: `npm run dev` (em background)
Expected: servidor sobe em `http://localhost:3000` sem erros no terminal.

- [ ] **Step 4: Conferir cada rota no navegador** — usar as ferramentas de browser (`claude-in-chrome`) para abrir `/`, `/ias`, `/ias/chatgpt`, `/combos`, `/checkout` (com item no carrinho) e `/pedido-confirmado` (após confirmar um pedido de teste), navegando em resolução desktop e em 375px de largura. Confirmar: sem scroll horizontal, carrinho abre e fecha, simulador da página da IA recalcula ao mover o slider, checkout bloqueia confirmação sem nome/e-mail, confirmação mostra número de pedido e validade calculada corretamente.

- [ ] **Step 5: Corrigir quaisquer problemas visuais ou funcionais encontrados no Step 4** diretamente nos componentes correspondentes.

- [ ] **Step 6: Encerrar o servidor de desenvolvimento e commit de eventuais correções**

```bash
git add -A
git commit -m "fix: ajustes encontrados na verificacao manual das rotas"
```

(Pular o commit se não houve nenhuma correção.)

---

## Task 16: Resumo, aprovação e push

**Files:** nenhum.

- [ ] **Step 1: Mostrar ao usuário um resumo das mudanças** (`git log --oneline main..HEAD` e lista de páginas/funcionalidades entregues) e aguardar OK explícito antes de prosseguir.

- [ ] **Step 2: Push para a `main`** (somente após o OK do usuário)

```bash
git push origin main
```

Expected: push aceito, dispara o deploy automático na Vercel.

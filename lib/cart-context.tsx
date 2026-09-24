'use client'

import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import {
  DIAS_MAXIMO_POR_ITEM,
  descontoPorDuracao,
  getComboPorSlug,
  getIAPorSlug,
  precoDiaBRL,
  comboPrecoDiaBRL,
} from './catalog'

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

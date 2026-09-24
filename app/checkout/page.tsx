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
            className="mt-1 w-full rounded-xl border border-white/15 bg-transparent px-3 py-2"
            placeholder="Seu nome"
          />
        </label>
        <label className="text-sm">
          E-mail
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/15 bg-transparent px-3 py-2"
            placeholder="voce@email.com"
          />
        </label>
      </div>

      <div className="cartao-vidro mt-8 p-6">
        <h2 className="font-semibold">Resumo do pedido</h2>
        {itens.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted)]">Seu carrinho está vazio.</p>
        ) : (
          <>
            <ul className="mt-4 space-y-2 text-sm">
              {itens.map((item) => {
                const ia = item.tipo === 'ia' ? getIAPorSlug(item.slug) : undefined
                const combo = item.tipo === 'combo' ? getComboPorSlug(item.slug) : undefined
                const nomeItem = ia?.nome ?? combo?.nome ?? item.slug
                const precoDia = ia ? precoDiaBRL(ia) : combo ? comboPrecoDiaBRL(combo) : 0
                return (
                  <li key={`${item.tipo}-${item.slug}`} className="flex justify-between">
                    <span>
                      {nomeItem} · {item.dias} dias
                    </span>
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

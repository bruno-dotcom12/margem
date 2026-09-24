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
              const ia = item.tipo === 'ia' ? getIAPorSlug(item.slug) : undefined
              const combo = item.tipo === 'combo' ? getComboPorSlug(item.slug) : undefined
              const nome = ia?.nome ?? combo?.nome ?? item.slug
              const precoDia = ia ? precoDiaBRL(ia) : combo ? comboPrecoDiaBRL(combo) : 0
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
                        className="w-16 rounded-lg border border-white/10 bg-transparent px-2 py-1 font-mono"
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

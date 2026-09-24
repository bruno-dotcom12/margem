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

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
        <p className="text-xs text-[var(--muted)]">
          {ia.empresa} · {ia.categoria}
        </p>
        <p className="mt-3 text-sm text-[var(--muted)]">{ia.descricao}</p>
      </Link>
      <div className="mt-4 flex items-center justify-between">
        <PrecoMono className="text-lg font-semibold">
          {formatBRL(precoDia)}
          <span className="text-xs text-[var(--muted)]">/dia</span>
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

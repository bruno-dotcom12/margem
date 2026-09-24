'use client'

import { useCart } from '@/lib/cart-context'
import { comboPrecoDiaBRL, getIAPorSlug, type Combo } from '@/lib/catalog'
import { formatBRL } from '@/lib/format'
import { PrecoMono } from '@/components/ui/PrecoMono'
import { IAChip } from '@/components/ui/IAChip'

export function ComboCard({ combo }: { combo: Combo }) {
  const { adicionar } = useCart()
  const ias = combo.iasSlugs.map((slug) => getIAPorSlug(slug)).filter((ia): ia is NonNullable<typeof ia> => Boolean(ia))
  const precoDia = comboPrecoDiaBRL(combo)

  return (
    <div className="cartao-vidro p-6">
      <div className="flex -space-x-2">
        {ias.slice(0, 4).map((ia) => (
          <IAChip key={ia.slug} icone={ia.icone} gradiente={ia.gradiente} tamanho={40} />
        ))}
        {ias.length > 4 && (
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xs font-mono ring-1 ring-white/20">
            +{ias.length - 4}
          </span>
        )}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{combo.nome}</h3>
      <p className="mt-1 text-sm text-[var(--muted)]">{combo.descricao}</p>
      <p className="mt-2 text-xs text-[var(--muted)]">{ias.map((ia) => ia.nome).join(', ')}</p>

      <div className="mt-4 flex items-center justify-between">
        <PrecoMono className="text-xl font-semibold">
          {formatBRL(precoDia)}
          <span className="text-xs text-[var(--muted)]">/dia</span>
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

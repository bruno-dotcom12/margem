import { getIAPorSlug, precoDiaBRL, USD_BRL } from '@/lib/catalog'
import { formatBRL } from '@/lib/format'
import { PrecoMono } from '@/components/ui/PrecoMono'

export function Comparador() {
  const midjourney = getIAPorSlug('midjourney')!
  const diasDeUso = 3
  const custoDiaria = precoDiaBRL(midjourney) * diasDeUso
  const custoAssinatura = midjourney.usdMes * USD_BRL
  const economia = custoAssinatura - custoDiaria

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-2xl font-semibold">Assinatura mensal vs. diária</h2>
      <div className="cartao-vidro mt-8 grid gap-6 p-6 sm:grid-cols-3">
        <div>
          <p className="text-sm text-[var(--muted)]">Quem assina o mês inteiro</p>
          <PrecoMono className="text-2xl">{formatBRL(custoAssinatura)}</PrecoMono>
        </div>
        <div>
          <p className="text-sm text-[var(--muted)]">
            Quem usa {midjourney.nome} só {diasDeUso} dias no mês
          </p>
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

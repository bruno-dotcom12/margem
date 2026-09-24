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
        <p className="text-sm text-[var(--muted)]">
          {ia.empresa} · Plano de referência: {ia.planoBase}
        </p>
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

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

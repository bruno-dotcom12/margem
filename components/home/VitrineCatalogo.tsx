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

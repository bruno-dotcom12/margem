'use client'

import { useMemo, useState } from 'react'
import { CATALOGO, type Categoria } from '@/lib/catalog'
import { IACard } from '@/components/catalog/IACard'
import { FiltroCategoria } from '@/components/catalog/FiltroCategoria'

export default function CatalogoPage() {
  const [categoria, setCategoria] = useState<Categoria | 'Todas'>('Todas')
  const [busca, setBusca] = useState('')

  const iasFiltradas = useMemo(() => {
    return CATALOGO.filter((ia) => {
      const bateCategoria = categoria === 'Todas' || ia.categoria === categoria
      const bateBusca =
        ia.nome.toLowerCase().includes(busca.toLowerCase()) || ia.empresa.toLowerCase().includes(busca.toLowerCase())
      return bateCategoria && bateBusca
    })
  }, [categoria, busca])

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-semibold">Catálogo</h1>
      <p className="mt-2 text-[var(--muted)]">Todas as IAs disponíveis para alugar por diária.</p>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <FiltroCategoria ativa={categoria} onSelecionar={setCategoria} />
        <input
          type="search"
          placeholder="Buscar por nome ou empresa"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="rounded-full border border-white/15 bg-transparent px-4 py-2 text-sm placeholder:text-[var(--muted)]"
        />
      </div>

      {iasFiltradas.length === 0 ? (
        <p className="mt-12 text-sm text-[var(--muted)]">Nenhuma IA encontrada com esse filtro.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {iasFiltradas.map((ia) => (
            <IACard key={ia.slug} ia={ia} />
          ))}
        </div>
      )}
    </section>
  )
}

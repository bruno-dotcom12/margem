'use client'

import type { Categoria } from '@/lib/catalog'

const CATEGORIAS: Categoria[] = ['Texto', 'Pesquisa', 'Produtividade', 'Imagem', 'Código']

export function FiltroCategoria({
  ativa,
  onSelecionar,
}: {
  ativa: Categoria | 'Todas'
  onSelecionar: (categoria: Categoria | 'Todas') => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {(['Todas', ...CATEGORIAS] as const).map((categoria) => (
        <button
          key={categoria}
          type="button"
          onClick={() => onSelecionar(categoria)}
          className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
            ativa === categoria
              ? 'border-cyan-400 text-cyan-300'
              : 'border-white/15 text-[var(--muted)] hover:border-white/30'
          }`}
        >
          {categoria}
        </button>
      ))}
    </div>
  )
}

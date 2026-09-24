'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

type ItemPedido = { tipo: 'ia' | 'combo'; slug: string; dias: number; nome?: string }
type Pedido = { numeroPedido: string; nome: string; email: string; criadoEm: string; itens: ItemPedido[]; total: number }

function calcularValidade(dias: number): string {
  const data = new Date()
  data.setDate(data.getDate() + dias)
  return data.toLocaleDateString('pt-BR')
}

export default function PedidoConfirmadoPage() {
  const [pedido, setPedido] = useState<Pedido | null | undefined>(undefined)

  useEffect(() => {
    try {
      const bruto = sessionStorage.getItem('diaria:ultimo-pedido')
      setPedido(bruto ? (JSON.parse(bruto) as Pedido) : null)
    } catch {
      setPedido(null)
    }
  }, [])

  if (pedido === undefined) return null

  if (pedido === null) {
    return (
      <section className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Nenhum pedido encontrado</h1>
        <p className="mt-2 text-[var(--muted)]">Finalize uma compra no checkout para ver a confirmação aqui.</p>
        <Link href="/ias" className="mt-6 inline-block text-cyan-400 hover:underline">
          Ir para o catálogo
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-16 text-center">
      <CheckCircle2 size={48} className="mx-auto text-lime-400" />
      <h1 className="mt-4 text-3xl font-semibold">Acesso liberado</h1>
      <p className="mt-2 text-[var(--muted)]">
        Pedido <span className="font-mono">{pedido.numeroPedido}</span> confirmado para {pedido.nome}.
      </p>
      <p className="mt-1 text-xs text-[var(--muted)]">Simulação. Nenhum e-mail real é enviado.</p>

      <ul className="mt-8 space-y-3 text-left">
        {pedido.itens.map((item) => (
          <li key={`${item.tipo}-${item.slug}`} className="cartao-vidro flex items-center justify-between p-4">
            <span>{item.nome}</span>
            <span className="text-sm text-[var(--muted)]">válido até {calcularValidade(item.dias)}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/"
        className="mt-10 inline-block rounded-full border border-white/15 px-6 py-3 hover:border-cyan-400/50"
      >
        Voltar para a home
      </Link>
    </section>
  )
}

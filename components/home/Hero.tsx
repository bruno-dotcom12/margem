import Link from 'next/link'
import { ContadorAnimado } from '@/components/ui/ContadorAnimado'
import { BadgeTerminal } from '@/components/ui/BadgeTerminal'
import { CATALOGO } from '@/lib/catalog'

export function Hero() {
  return (
    <section className="glow-cena mx-auto max-w-6xl px-4 pb-20 pt-16 text-center sm:pt-24">
      <BadgeTerminal>status: online</BadgeTerminal>
      <h1 className="cursor-piscando mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
        Use a IA que você precisa. Só no dia em que precisar.
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-[var(--muted)]">
        Nada de assinatura mensal parada na sua fatura. Na DiárIA você aluga acesso por diária e paga
        só pelos dias que realmente vai usar.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/ias"
          className="rounded-full bg-cyan-400 px-6 py-3 font-semibold text-black transition-opacity hover:opacity-90"
        >
          Ver catálogo
        </Link>
        <Link
          href="/combos"
          className="rounded-full border border-white/20 px-6 py-3 transition-colors hover:border-cyan-400/50"
        >
          Ver combos
        </Link>
      </div>
      <p className="mt-10 text-sm text-[var(--muted)]">
        <ContadorAnimado valor={CATALOGO.length} /> IAs disponíveis agora
      </p>
    </section>
  )
}

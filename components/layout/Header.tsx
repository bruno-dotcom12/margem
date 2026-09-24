'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/lib/cart-context'

const LINKS = [
  { href: '/ias', label: 'Catálogo' },
  { href: '/combos', label: 'Combos' },
]

export function Header() {
  const { quantidadeItens } = useCart()

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07080c]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-mono text-lg font-semibold tracking-tight">
          Diár<span className="text-cyan-400">IA</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-[var(--muted)] sm:flex">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          aria-label={`Abrir carrinho, ${quantidadeItens} ${quantidadeItens === 1 ? 'item' : 'itens'}`}
          onClick={() => window.dispatchEvent(new CustomEvent('carrinho:abrir'))}
          className="relative flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm transition-colors hover:border-cyan-400/50"
        >
          <ShoppingCart size={16} />
          <span className="hidden sm:inline">Carrinho</span>
          {quantidadeItens > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400 font-mono text-xs font-bold text-black">
              {quantidadeItens}
            </span>
          )}
        </button>
      </div>
      <nav className="flex items-center gap-6 border-t border-white/5 px-4 py-2 text-sm text-[var(--muted)] sm:hidden">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="transition-colors hover:text-white">
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}

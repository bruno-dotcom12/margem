import {
  Sparkles,
  MessageCircle,
  Wand2,
  Zap,
  Search,
  Layers,
  MessagesSquare,
  Image as ImageIcon,
  Code2,
  Github,
  type LucideIcon,
} from 'lucide-react'
import type { IconeSlug } from '@/lib/catalog'

const ICONES: Record<IconeSlug, LucideIcon> = {
  sparkles: Sparkles,
  'message-circle': MessageCircle,
  'wand-2': Wand2,
  zap: Zap,
  search: Search,
  layers: Layers,
  'messages-square': MessagesSquare,
  image: ImageIcon,
  'code-2': Code2,
  github: Github,
}

export function IAChip({ icone, gradiente, tamanho = 48 }: { icone: IconeSlug; gradiente: string; tamanho?: number }) {
  const Icone = ICONES[icone]
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br shadow-lg shadow-black/50 ring-1 ring-white/20 ${gradiente}`}
      style={{ width: tamanho, height: tamanho }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_22%,rgba(255,255,255,0.4),transparent_55%)]" />
      <Icone size={tamanho * 0.48} className="relative text-white" strokeWidth={2.25} />
    </div>
  )
}

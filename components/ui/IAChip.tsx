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
      className={`flex items-center justify-center rounded-[1.25rem] bg-gradient-to-br shadow-lg shadow-black/40 ring-1 ring-white/15 ${gradiente}`}
      style={{ width: tamanho, height: tamanho }}
    >
      <Icone size={tamanho * 0.5} className="text-white" strokeWidth={2.25} />
    </div>
  )
}

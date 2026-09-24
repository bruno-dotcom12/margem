'use client'

import { useEffect } from 'react'

export function GlowCursorEffect() {
  useEffect(() => {
    function aoMoverMouse(evento: MouseEvent) {
      const alvo = (evento.target as HTMLElement)?.closest<HTMLElement>('.cartao-vidro')
      if (!alvo) return
      const retangulo = alvo.getBoundingClientRect()
      alvo.style.setProperty('--mouse-x', `${evento.clientX - retangulo.left}px`)
      alvo.style.setProperty('--mouse-y', `${evento.clientY - retangulo.top}px`)
    }
    document.addEventListener('mousemove', aoMoverMouse)
    return () => document.removeEventListener('mousemove', aoMoverMouse)
  }, [])

  return null
}

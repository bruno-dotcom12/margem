'use client'

import { useEffect, useRef, useState } from 'react'

export function ContadorAnimado({ valor, duracaoMs = 800 }: { valor: number; duracaoMs?: number }) {
  const [exibido, setExibido] = useState(0)
  const inicioRef = useRef<number | null>(null)

  useEffect(() => {
    let frame: number
    const passo = (agora: number) => {
      if (inicioRef.current === null) inicioRef.current = agora
      const progresso = Math.min((agora - inicioRef.current) / duracaoMs, 1)
      setExibido(Math.round(progresso * valor))
      if (progresso < 1) frame = requestAnimationFrame(passo)
    }
    frame = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(frame)
  }, [valor, duracaoMs])

  return <span className="font-mono tabular-nums">{exibido}</span>
}

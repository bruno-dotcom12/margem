const ETAPAS = [
  { titulo: 'Escolha a IA', texto: 'Navegue pelo catálogo ou por um combo pronto para o que você precisa.' },
  { titulo: 'Defina os dias', texto: 'Selecione quantos dias vai usar. O preço já vem calculado por diária.' },
  { titulo: 'Ative o acesso', texto: 'Confirme o pedido e receba a validade de cada IA contratada.' },
]

export function ComoFunciona() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-2xl font-semibold">Como funciona</h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {ETAPAS.map((etapa, indice) => (
          <div key={etapa.titulo} className="cartao-vidro p-6">
            <span className="font-mono text-sm text-cyan-400">0{indice + 1}</span>
            <h3 className="mt-3 font-semibold">{etapa.titulo}</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">{etapa.texto}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

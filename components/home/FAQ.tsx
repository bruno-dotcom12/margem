const PERGUNTAS = [
  {
    pergunta: 'Como é calculado o preço da diária?',
    resposta:
      'Pegamos o plano mensal oficial de cada IA, dividimos por 30 dias e aplicamos a margem da loja. O resultado é arredondado para o valor mais próximo terminado em ,90.',
  },
  {
    pergunta: 'Isso é uma loja de verdade?',
    resposta: 'Não. É um projeto acadêmico fictício, sem pagamento real e sem coleta de dados de cartão.',
  },
  {
    pergunta: 'Posso combinar mais de uma IA?',
    resposta: 'Sim. Os combos juntam IAs complementares com desconto sobre a soma das diárias.',
  },
  {
    pergunta: 'O que acontece depois dos dias contratados?',
    resposta: 'O acesso simulado expira na data mostrada na confirmação do pedido.',
  },
]

export function FAQ() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-2xl font-semibold">Perguntas frequentes</h2>
      <div className="mt-8 space-y-4">
        {PERGUNTAS.map((item) => (
          <details key={item.pergunta} className="cartao-vidro p-5">
            <summary className="cursor-pointer list-none font-medium">{item.pergunta}</summary>
            <p className="mt-2 text-sm text-[var(--muted)]">{item.resposta}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

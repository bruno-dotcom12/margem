const PERGUNTAS = [
  {
    pergunta: 'Como é calculado o preço da diária?',
    resposta:
      'Pegamos o plano mensal oficial de cada IA, dividimos por 30 dias e aplicamos a margem da loja. O resultado é arredondado para o valor mais próximo terminado em ,90.',
  },
  {
    pergunta: 'Posso combinar mais de uma IA?',
    resposta: 'Sim. Os combos juntam IAs complementares com desconto sobre a soma das diárias.',
  },
  {
    pergunta: 'O que acontece depois dos dias contratados?',
    resposta: 'O acesso simulado expira na data mostrada na confirmação do pedido.',
  },
  {
    pergunta: 'Dá pra trocar de IA no meio do período?',
    resposta: 'Sim. Cada IA e cada combo têm sua própria contagem de dias, então você pode ir adicionando outras a qualquer momento.',
  },
  {
    pergunta: 'Existe fidelidade ou renovação automática?',
    resposta: 'Não. Cada pedido vale só pelos dias escolhidos. Quando acabar, o acesso simulado expira sozinho.',
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

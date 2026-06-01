"use client";

import type { MarginResult } from "@/lib/engine";
import { formatBRL } from "@/lib/format";

interface Props {
  resultado: MarginResult;
}

const LABELS: Record<keyof MarginResult["deductions"], string> = {
  discount: "Desconto",
  returns: "Devolução",
  freight: "Frete",
  tax: "Imposto",
  paymentFee: "Taxa de pagamento",
  packaging: "Embalagem",
};

export default function Resultado({ resultado }: Props) {
  const { perceivedProfit, realProfit, leakage, deductions } = resultado;

  // Da maior dedução para a menor — a barra do topo é o maior vazamento.
  const linhas = (
    Object.keys(deductions) as Array<keyof MarginResult["deductions"]>
  )
    .map((key) => ({ key, label: LABELS[key], value: deductions[key] }))
    .sort((a, b) => b.value - a.value);

  const maior = linhas.length > 0 ? linhas[0].value : 0;

  return (
    <section className="mt-2">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card
          titulo="Você calcula que lucra"
          valor={formatBRL(perceivedProfit)}
          variante="riscado"
        />
        <Card
          titulo="Lucro real"
          valor={formatBRL(realProfit)}
          variante="danger"
        />
        <Card
          titulo="Vazou sem você ver"
          valor={formatBRL(leakage)}
          variante="vazamento"
        />
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Onde foi o dinheiro
        </h3>
        <ul className="mt-3 space-y-3">
          {linhas.map((linha) => {
            const pct = maior > 0 ? (linha.value / maior) * 100 : 0;
            return (
              <li key={linha.key}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium text-gray-700">
                    {linha.label}
                  </span>
                  <span className="tabular-nums font-semibold text-gray-900">
                    {formatBRL(linha.value)}
                  </span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-red-400"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function Card({
  titulo,
  valor,
  variante,
}: {
  titulo: string;
  valor: string;
  variante: "riscado" | "danger" | "vazamento";
}) {
  const estilos = {
    riscado: {
      box: "border-gray-200 bg-white",
      label: "text-gray-400",
      valor: "text-gray-400 line-through decoration-gray-300",
    },
    danger: {
      box: "border-red-200 bg-red-50",
      label: "text-red-500",
      valor: "text-red-600",
    },
    vazamento: {
      box: "border-gray-200 bg-white",
      label: "text-gray-500",
      valor: "text-gray-900",
    },
  }[variante];

  return (
    <div className={`rounded-xl border p-5 ${estilos.box}`}>
      <p className={`text-xs font-medium uppercase tracking-wide ${estilos.label}`}>
        {titulo}
      </p>
      <p
        className={`mt-2 tabular-nums font-bold ${estilos.valor} ${
          variante === "danger" ? "text-3xl sm:text-4xl" : "text-2xl"
        }`}
      >
        {valor}
      </p>
    </div>
  );
}

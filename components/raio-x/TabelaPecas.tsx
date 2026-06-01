"use client";

import type { LineItem } from "@/lib/engine";

interface Props {
  itens: LineItem[];
  onChange: (itens: LineItem[]) => void;
}

type CampoNumerico = "cost" | "price" | "quantity";

export default function TabelaPecas({ itens, onChange }: Props) {
  function setCampo(index: number, campo: keyof LineItem, raw: string) {
    const next = itens.map((item, i) => {
      if (i !== index) return item;
      if (campo === "name") return { ...item, name: raw };
      const value = raw === "" ? 0 : Number(raw);
      return { ...item, [campo as CampoNumerico]: value };
    });
    onChange(next);
  }

  function adicionar() {
    onChange([...itens, { name: "", cost: 0, price: 0, quantity: 1 }]);
  }

  function remover(index: number) {
    onChange(itens.filter((_, i) => i !== index));
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900">Suas peças</h2>
      <p className="mt-1 text-sm text-gray-500">
        Custo, preço cheio e quantidade vendida de cada peça da coleção.
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[480px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-gray-400">
              <th className="pb-2 pr-3 font-medium">Peça</th>
              <th className="pb-2 px-3 text-right font-medium">Custo (R$)</th>
              <th className="pb-2 px-3 text-right font-medium">Preço (R$)</th>
              <th className="pb-2 px-3 text-right font-medium">Qtd</th>
              <th className="pb-2 pl-3" />
            </tr>
          </thead>
          <tbody>
            {itens.map((item, i) => (
              <tr key={i} className="border-t border-gray-100">
                <td className="py-1.5 pr-3">
                  <input
                    type="text"
                    value={item.name}
                    placeholder="Nome da peça"
                    onChange={(e) => setCampo(i, "name", e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 outline-none focus:border-gray-400"
                  />
                </td>
                {(["cost", "price", "quantity"] as CampoNumerico[]).map((c) => (
                  <td key={c} className="py-1.5 px-3">
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step={c === "quantity" ? 1 : 0.01}
                      value={item[c]}
                      onChange={(e) => setCampo(i, c, e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-right tabular-nums text-gray-900 outline-none focus:border-gray-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </td>
                ))}
                <td className="py-1.5 pl-3 text-right">
                  <button
                    type="button"
                    onClick={() => remover(i)}
                    aria-label={`Remover ${item.name || "peça"}`}
                    className="rounded-lg px-2 py-2 text-gray-300 transition hover:bg-red-50 hover:text-red-500"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={adicionar}
        className="mt-3 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-400 hover:text-gray-900"
      >
        + adicionar peça
      </button>
    </section>
  );
}

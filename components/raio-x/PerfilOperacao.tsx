"use client";

import type { PerfilUI } from "./uiTypes";

interface Campo {
  key: keyof PerfilUI;
  label: string;
  /** Sufixo da unidade mostrado dentro do input. */
  unidade: "%" | "R$";
  step: number;
}

const CAMPOS: Campo[] = [
  { key: "taxa", label: "Taxa de pagamento", unidade: "%", step: 0.5 },
  { key: "frete", label: "Frete por peça", unidade: "R$", step: 1 },
  { key: "embalagem", label: "Embalagem por peça", unidade: "R$", step: 1 },
  { key: "devolucao", label: "Devolução", unidade: "%", step: 1 },
  { key: "imposto", label: "Imposto", unidade: "%", step: 1 },
  { key: "desconto", label: "Desconto médio", unidade: "%", step: 1 },
];

interface Props {
  perfil: PerfilUI;
  onChange: (perfil: PerfilUI) => void;
}

export default function PerfilOperacao({ perfil, onChange }: Props) {
  function set(key: keyof PerfilUI, raw: string) {
    // Campo vazio vira 0; o motor cuida de rejeitar o que for inválido.
    const value = raw === "" ? 0 : Number(raw);
    onChange({ ...perfil, [key]: value });
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900">Perfil da operação</h2>
      <p className="mt-1 text-sm text-gray-500">
        Os custos que corroem a margem. Já preenchemos com médias do varejo —
        ajuste para a sua realidade.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CAMPOS.map((campo) => (
          <label key={campo.key} className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">
              {campo.label}
            </span>
            <div className="flex items-center rounded-lg border border-gray-200 bg-white focus-within:border-gray-400">
              {campo.unidade === "R$" && (
                <span className="pl-3 text-sm text-gray-400">R$</span>
              )}
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={campo.step}
                value={perfil[campo.key]}
                onChange={(e) => set(campo.key, e.target.value)}
                className="w-full bg-transparent px-3 py-2 text-right tabular-nums text-gray-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
              {campo.unidade === "%" && (
                <span className="pr-3 text-sm text-gray-400">%</span>
              )}
            </div>
          </label>
        ))}
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { computeMargin, type LineItem, type MarginResult } from "@/lib/engine";
import PerfilOperacao from "./PerfilOperacao";
import TabelaPecas from "./TabelaPecas";
import Resultado from "./Resultado";
import { DEFAULTS, ITENS_EXEMPLO, toProfile, type PerfilUI } from "./uiTypes";

export default function RaioXMargem() {
  const [perfil, setPerfil] = useState<PerfilUI>(DEFAULTS);
  const [itens, setItens] = useState<LineItem[]>(ITENS_EXEMPLO);
  // null até o usuário clicar — o reveal é o momento, não um cálculo silencioso.
  const [resultado, setResultado] = useState<MarginResult | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // Editar qualquer entrada esconde o resultado: evita números obsoletos e
  // preserva o impacto do reveal (o usuário clica de novo para revelar).
  function aoEditarPerfil(p: PerfilUI) {
    setPerfil(p);
    setResultado(null);
    setErro(null);
  }

  function aoEditarItens(i: LineItem[]) {
    setItens(i);
    setResultado(null);
    setErro(null);
  }

  function revelar() {
    try {
      // Conversão de % humano → decimal acontece em toProfile (borda da UI).
      setResultado(computeMargin(toProfile(perfil), itens));
      setErro(null);
    } catch (e) {
      if (e instanceof RangeError) {
        setResultado(null);
        setErro(e.message);
      } else {
        throw e;
      }
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
      <header className="mb-8">
        <p className="text-sm font-medium uppercase tracking-widest text-red-500">
          Raio-X da margem
        </p>
        <h1 className="mt-1 text-3xl font-bold text-gray-900 sm:text-4xl">
          Quanto você acha que lucra — e quanto sobra de verdade.
        </h1>
      </header>

      <div className="space-y-10">
        <PerfilOperacao perfil={perfil} onChange={aoEditarPerfil} />
        <TabelaPecas itens={itens} onChange={aoEditarItens} />

        <div>
          <button
            type="button"
            onClick={revelar}
            className="w-full rounded-xl bg-gray-900 px-6 py-4 text-base font-semibold text-white transition hover:bg-black sm:w-auto"
          >
            Ver meu lucro real
          </button>

          {erro && (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {erro}
            </div>
          )}
        </div>

        {resultado && <Resultado resultado={resultado} />}
      </div>
    </main>
  );
}

import type { LineItem, OperationProfile } from "@/lib/engine";

/**
 * Perfil como o USUÁRIO digita: percentuais são números "humanos"
 * (ex: 5 = 5%, 3.5 = 3,5%), R$ são valores diretos.
 *
 * A conversão para os decimais [0,1] que o motor espera acontece em
 * `toProfile` — a borda entre a UI e o motor.
 */
export interface PerfilUI {
  /** Taxa de pagamento, em % (ex: 3.5). */
  taxa: number;
  /** Frete por peça, em R$. */
  frete: number;
  /** Embalagem por peça, em R$. */
  embalagem: number;
  /** Devolução, em % (ex: 8). */
  devolucao: number;
  /** Imposto, em % (ex: 6). */
  imposto: number;
  /** Desconto médio, em % (ex: 22). */
  desconto: number;
}

/** Defaults sensatos pré-preenchidos. */
export const DEFAULTS: PerfilUI = {
  taxa: 3.5,
  frete: 11,
  embalagem: 4,
  devolucao: 8,
  imposto: 6,
  desconto: 22,
};

/** Duas peças de exemplo para a tabela começar preenchida. */
export const ITENS_EXEMPLO: LineItem[] = [
  { name: "Vestido midi", cost: 48, price: 199, quantity: 60 },
  { name: "Blusa de tricô", cost: 32, price: 129, quantity: 40 },
];

/**
 * Borda UI → motor: converte percentuais "humanos" (5) em decimais (0.05).
 * R$ passam direto. O motor valida faixas; aqui só traduzimos a escala.
 */
export function toProfile(ui: PerfilUI): OperationProfile {
  return {
    paymentFeePct: ui.taxa / 100,
    returnPct: ui.devolucao / 100,
    taxPct: ui.imposto / 100,
    avgDiscountPct: ui.desconto / 100,
    freightPerUnit: ui.frete,
    packagingPerUnit: ui.embalagem,
  };
}

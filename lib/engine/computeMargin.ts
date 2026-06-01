import type {
  LineItem,
  MarginDeductions,
  MarginResult,
  OperationProfile,
} from "./types";

/**
 * Calcula a cascata de margem de uma operação.
 *
 * Função PURA: determinística, sem rede/I/O/Date, não muta os argumentos.
 *
 * Regra crítica de base:
 * - `discount` incide sobre o faturamento BRUTO (revenue).
 * - `paymentFee`, `tax` e `returns` incidem sobre a receita LÍQUIDA
 *   (netRevenue = revenue − discount) — não se paga taxa/imposto sobre
 *   dinheiro que nunca entrou.
 *
 * Premissas simplificadas (proxies): `returnPct` e `avgDiscountPct` são
 * médias agregadas sobre a receita, não eventos por pedido. Veja types.ts.
 */
export function computeMargin(
  profile: OperationProfile,
  items: LineItem[],
): MarginResult {
  validate(profile, items);

  const revenue = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const cogs = items.reduce((sum, it) => sum + it.cost * it.quantity, 0);
  const totalUnits = items.reduce((sum, it) => sum + it.quantity, 0);

  const perceivedProfit = revenue - cogs;

  // discount sobre o bruto; o resto sobre a receita líquida.
  const discount = profile.avgDiscountPct * revenue;
  const netRevenue = revenue - discount;

  const deductions: MarginDeductions = {
    discount,
    paymentFee: profile.paymentFeePct * netRevenue,
    tax: profile.taxPct * netRevenue,
    returns: profile.returnPct * netRevenue,
    freight: profile.freightPerUnit * totalUnits,
    packaging: profile.packagingPerUnit * totalUnits,
  };

  const totalDeductions =
    deductions.discount +
    deductions.paymentFee +
    deductions.tax +
    deductions.returns +
    deductions.freight +
    deductions.packaging;

  const realProfit = perceivedProfit - totalDeductions;

  return {
    revenue,
    cogs,
    perceivedProfit,
    netRevenue,
    deductions,
    totalDeductions,
    realProfit,
    // Atribuído direto (e não perceivedProfit − realProfit) para que o teste
    // do invariante seja exato e não acumule erro de ponto flutuante.
    leakage: totalDeductions,
  };
}

/** Rejeita entradas inválidas. Percentuais devem estar em [0,1]; custos/quantidades ≥ 0. */
function validate(profile: OperationProfile, items: LineItem[]): void {
  const pcts: ReadonlyArray<[keyof OperationProfile, number]> = [
    ["paymentFeePct", profile.paymentFeePct],
    ["returnPct", profile.returnPct],
    ["taxPct", profile.taxPct],
    ["avgDiscountPct", profile.avgDiscountPct],
  ];
  for (const [name, value] of pcts) {
    if (!(value >= 0 && value <= 1)) {
      throw new RangeError(
        `${name} deve ser um decimal em [0,1] (ex: 0.12 para 12%), recebido: ${value}`,
      );
    }
  }

  const nonNegProfile: ReadonlyArray<[keyof OperationProfile, number]> = [
    ["freightPerUnit", profile.freightPerUnit],
    ["packagingPerUnit", profile.packagingPerUnit],
  ];
  for (const [name, value] of nonNegProfile) {
    if (!(value >= 0)) {
      throw new RangeError(`${name} não pode ser negativo, recebido: ${value}`);
    }
  }

  for (const item of items) {
    const fields: ReadonlyArray<[keyof LineItem, number]> = [
      ["cost", item.cost],
      ["price", item.price],
      ["quantity", item.quantity],
    ];
    for (const [name, value] of fields) {
      if (!(value >= 0)) {
        throw new RangeError(
          `${name} do item "${item.name}" não pode ser negativo, recebido: ${value}`,
        );
      }
    }
  }
}

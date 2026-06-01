/**
 * Tipos do motor de margem.
 *
 * Convenção: percentuais são DECIMAIS. 0.05 = 5%.
 */

/**
 * Perfil de operação da marca — os custos e percentuais que corroem a margem.
 *
 * Premissas simplificadas (proxies):
 * - `returnPct` e `avgDiscountPct` são MÉDIAS AGREGADAS sobre o faturamento,
 *   não eventos por pedido. Não modelam devoluções/descontos individuais.
 */
export interface OperationProfile {
  /** Taxa de pagamento (gateway/adquirente), decimal. Incide sobre a receita líquida. */
  paymentFeePct: number;
  /** Frete por peça vendida, em R$. */
  freightPerUnit: number;
  /** Embalagem por peça vendida, em R$. */
  packagingPerUnit: number;
  /** % de devolução (proxy agregado), decimal. Incide sobre a receita líquida. */
  returnPct: number;
  /** % de imposto, decimal. Incide sobre a receita líquida. */
  taxPct: number;
  /** % de desconto/markdown médio (proxy agregado), decimal. Incide sobre o faturamento bruto. */
  avgDiscountPct: number;
}

/** Uma linha de produto vendida. */
export interface LineItem {
  name: string;
  /** Custo unitário (COGS), em R$. */
  cost: number;
  /** Preço cheio unitário, em R$. */
  price: number;
  /** Quantidade vendida. */
  quantity: number;
}

/** Quebra de cada dedução, em R$. */
export interface MarginDeductions {
  /** avgDiscountPct × revenue (bruto). */
  discount: number;
  /** paymentFeePct × netRevenue. */
  paymentFee: number;
  /** taxPct × netRevenue. */
  tax: number;
  /** returnPct × netRevenue. */
  returns: number;
  /** freightPerUnit × Σ quantity. */
  freight: number;
  /** packagingPerUnit × Σ quantity. */
  packaging: number;
}

/** Resultado da cascata de margem. Todos os valores em R$. */
export interface MarginResult {
  /** Faturamento bruto: Σ price × quantity. */
  revenue: number;
  /** Custo do produto: Σ cost × quantity. */
  cogs: number;
  /** "O que a marca acha que lucra": revenue − cogs. */
  perceivedProfit: number;
  /** Receita líquida: revenue − deductions.discount. Base de paymentFee/tax/returns. */
  netRevenue: number;
  /** Quebra de cada dedução, em R$. */
  deductions: MarginDeductions;
  /** Soma de todas as deduções. */
  totalDeductions: number;
  /** Lucro real: perceivedProfit − totalDeductions. Pode ser negativo (prejuízo). */
  realProfit: number;
  /** Vazamento: o que a marca pensa que lucra menos o lucro real (= totalDeductions). */
  leakage: number;
}

/** Formatação de moeda pt-BR. Vive na UI, não no motor. */

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  // "sempre arredondado": sem centavos, para o impacto visual da tela de choque.
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Formata um valor em R$ pt-BR, arredondado para reais inteiros. */
export function formatBRL(value: number): string {
  // Normaliza -0 para 0 e arredonda antes de formatar.
  const rounded = Math.round(value);
  return BRL.format(rounded === 0 ? 0 : rounded);
}

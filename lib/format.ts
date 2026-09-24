const formatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function formatBRL(valor: number): string {
  return formatter.format(valor)
}

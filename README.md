# DiárIA

Projeto acadêmico fictício de uma loja que "aluga" acesso a IAs por diária: em vez de assinar o mês
inteiro, a pessoa paga só pelos dias que vai usar. Não existe produto real à venda, nem integração
de pagamento, nem coleta de dados de cartão.

## Stack

Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + `lucide-react`.

## Regra de preço

Toda a lógica de preço vive em `lib/catalog.ts`:

```
custoDiaBRL = planoMensalUSD * USD_BRL / 30
precoDia = arredondarPara90(custoDiaBRL * MARGEM)
```

`arredondarPara90` leva o valor ao número mais próximo terminado em ",90".

Para mudar o câmbio ou a margem usada em toda a loja, edite as constantes no topo de `lib/catalog.ts`:

```typescript
export const USD_BRL = 5.5 // cotação do dólar usada no cálculo
export const MARGEM = 3    // multiplicador sobre o custo diário
```

Alterar qualquer uma delas recalcula automaticamente o preço de todas as IAs e combos, já que nenhum
preço é digitado manualmente — tudo deriva dessas duas constantes e do `usdMes` de cada IA.

## Rodando localmente

```bash
npm install
npm run dev
```

## Estrutura

- `lib/catalog.ts` — catálogo de IAs, combos e regra de preço
- `lib/cart-context.tsx` — estado do carrinho (Context + localStorage)
- `app/` — páginas (Home, Catálogo, Detalhe da IA, Combos, Checkout, Confirmação)
- `components/` — componentes de layout, catálogo, home e UI compartilhada

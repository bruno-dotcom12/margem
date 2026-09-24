# DiárIA — redesign completo do site (spec)

Data: 2026-09-24
Projeto: `margem-app` (Next.js 15 App Router, React 19, TypeScript, Tailwind v4)
Repositório: github.com/bruno-dotcom12/margem — deploy automático na Vercel a partir da `main`

## Contexto

Projeto fictício para uma aula. Site de uma loja chamada **DiárIA**, que "aluga" acesso a IAs por diária:
em vez de assinar o mês inteiro, a pessoa paga só pelos dias que vai usar. Nada é vendido de verdade,
não existe integração de pagamento e não pode existir nenhum campo pedindo dados reais de cartão.

Todo o site atual (`app/`, `components/`, `lib/`) será apagado e recriado do zero, mantendo a mesma
base técnica e o mesmo repositório.

## O que sai / o que fica

**Apagar:** todo o conteúdo de `app/`, `components/`, `lib/`, `README.md`, `vitest.config.ts`, `.next/`.

**Manter:** `.git/`, `.claude/`, `.gitignore`, `package.json`, `package-lock.json`, `tsconfig.json`,
`next.config.ts`, `postcss.config.mjs`.

Nota: o usuário pediu para manter também `next-enles/`, mas essa pasta não existe no projeto atual —
tratado como engano de digitação e ignorado (confirmado com o usuário).

**Dependências:** remover `vitest` das devDependencies e o script `test`/`test:watch`. Única dependência
nova: `lucide-react` (ícones). Nada de framer-motion, kits de UI prontos ou libs de pagamento —
animações só em CSS.

## Regra de preço

Fonte única de verdade em `lib/catalog.ts`:

```ts
export const USD_BRL = 5.5   // constante editável no topo do arquivo
export const MARGEM = 3      // 3x o custo diário

// precoDia = arredondarPara90( planoMensalUSD * USD_BRL / 30 * MARGEM )
```

`arredondarPara90` arredonda para o valor terminado em ",90" mais próximo (ex.: 11,00 → 10,90;
16,50 → 16,90). Cada card mostra também "equivale a R$ X no mês" (preço/dia × 30) e o plano de
referência usado no cálculo, para a aula poder explicar a margem.

### Catálogo (10 IAs)

| IA | Empresa | Plano base | USD/mês | Categoria |
|---|---|---|---|---|
| ChatGPT | OpenAI | Plus | 20 | Texto |
| Claude | Anthropic | Pro | 20 | Texto |
| Gemini | Google | Google AI Pro | 19.99 | Texto |
| Grok | xAI | SuperGrok | 30 | Texto |
| Perplexity | Perplexity | Pro | 20 | Pesquisa |
| Microsoft Copilot | Microsoft | M365 Premium | 19.99 | Produtividade |
| Mistral Le Chat | Mistral | Pro | 14.99 | Texto |
| Midjourney | Midjourney | Standard | 30 | Imagem |
| Cursor | Anysphere | Pro | 20 | Código |
| GitHub Copilot | GitHub | Pro | 10 | Código |

A linha do Grok (empresa/plano) e a categoria do Gemini vieram cortadas no texto original do usuário;
reconstruídas e confirmadas com ele antes da implementação.

Cada IA tem descrição curta (1 frase) e 3 pontos fortes. Sem logos oficiais nem imagens de marca:
cada IA ganha um "chip" visual próprio (iniciais ou ícone lucide + gradiente de cor único).

### Combos (15% de desconto sobre a soma das diárias, exceto o completo)

- Kit Estudante: ChatGPT + Claude + Perplexity
- Kit Criador: Midjourney + ChatGPT + Gemini
- Kit Dev: Cursor + GitHub Copilot + Claude
- Kit Completo: as 10 IAs (25% de desconto)

### Desconto por duração (aplicado no carrinho)

- 7 a 14 dias: 10%
- 15 a 30 dias: 20%
- Máximo 30 dias por item

## Arquitetura de dados

`lib/catalog.ts` exporta tipos (`IA`, `Combo`, `Categoria`), as constantes de preço, os arrays
estáticos do catálogo e dos combos, e funções puras:

- `precoDiaUSD(ia)` — calcula o preço por dia já arredondado
- `arredondarPara90(valor)`
- `equivaleMensal(ia)` — preço/dia × 30
- `descontoPorDuracao(dias)` — 0 | 0.10 | 0.20

Sem testes automatizados (Vitest removido a pedido do usuário); validação feita manualmente rodando
o build e conferindo os valores calculados nas telas.

## Estado do carrinho

`lib/cart-context.tsx`: React Context + `useReducer`, persistido em `localStorage` com try/catch em
toda leitura/escrita e hidratação segura (evitar mismatch SSR). Item do carrinho:
`{ iaSlug ou comboSlug, dias }`. Subtotal/desconto/total calculados por seletores puros que reusam
`descontoPorDuracao`.

## Estrutura de rotas e componentes

```
app/
  layout.tsx              # fontes Geist, CartProvider, header/rodapé
  page.tsx                # Home
  ias/page.tsx             # Catálogo com filtro por categoria e busca
  ias/[slug]/page.tsx      # Detalhe + simulador, generateStaticParams
  combos/page.tsx
  checkout/page.tsx
  pedido-confirmado/page.tsx
  globals.css              # tema escuro, tokens, grid de fundo, glow
components/
  layout/   (Header, CartDrawer, Footer)
  catalog/  (IACard, IAChip, FiltroCategoria, Simulador)
  home/     (Hero, ComoFunciona, VitrineCatalogo, Comparador, FAQ)
  ui/       (Badge terminal, ContadorAnimado, PrecoMono)
```

### Páginas

1. **Home (`/`)** — hero forte, contador animado de IAs disponíveis, "como funciona" em 3 etapas,
   vitrine do catálogo, combos, comparação assinatura mensal vs. diária, FAQ curto, rodapé.
2. **Catálogo (`/ias`)** — grid com filtro por categoria e busca. Card com chip, nome, empresa,
   categoria, preço/dia em destaque, seletor de dias, botão "Adicionar".
3. **Página da IA (`/ias/[slug]`)** — detalhes, pontos fortes, simulador (dias → total e economia
   vs. assinatura), adicionar ao carrinho. `generateStaticParams`.
4. **Combos (`/combos`)**.
5. **Carrinho** — drawer lateral acessível pelo header, com contador. Mostra subtotal, descontos e
   total. Vira tela cheia no celular.
6. **Checkout (`/checkout`)** — nome e e-mail apenas, resumo do pedido, botão "Ativar acesso".
7. **Confirmação (`/pedido-confirmado`)** — número de pedido gerado, lista de IAs, validade de cada
   uma (hoje + dias), animação de "acesso liberado". Deixar claro na tela que é uma simulação.

## Design visual

- Tema escuro fixo: fundo `#07080c`, grid sutil de linhas no fundo, glow em gradiente
  ciano/violeta/verde-limão, cards em vidro fosco (`backdrop-blur`, borda 1px translúcida), hover
  com borda iluminada seguindo o mouse (via CSS custom properties atualizadas em `onMouseMove`, sem
  lib extra).
- Tipografia via `next/font`: Geist Sans para texto, Geist Mono para preços/etiquetas/números.
  Números com efeito de contagem.
- Detalhes "terminal": badges tipo `status: online`, cursor piscando no hero, pequenas linhas de
  "log" animadas.
- Animações só em CSS, respeitando `prefers-reduced-motion`.
- Responsivo de verdade: testar em 375px, sem scroll horizontal; carrinho em tela cheia no celular.
- Acessibilidade: contraste AA, foco visível, botões com label.

## Texto e conteúdo

Todo o texto em português do Brasil, natural, com cara de marca real, sem soar gerado por IA: sem
travessões, sem excesso de listas, frases curtas. Valores em BRL formatados com `Intl.NumberFormat`.
Rodapé fixo com aviso: "Projeto acadêmico fictício. Nenhum produto é vendido. As marcas citadas
pertencem aos seus respectivos donos e não têm relação com este projeto."

Trechos do briefing original que chegaram cortados (headline do hero, texto de confirmação do
checkout) serão escritos do zero pela IA seguindo esse mesmo tom, sem repetir literalmente o texto
truncado.

## Sequência de execução

1. Mostrar lista de exclusão e aguardar OK do usuário.
2. Limpar projeto, ajustar `package.json` (remover vitest, adicionar lucide-react).
3. `lib/catalog.ts` + funções de preço.
4. Cart context.
5. Componentes de UI base (tema, tokens, ContadorAnimado, chips).
6. Páginas na ordem: Home → Catálogo → Detalhe IA → Combos → Checkout → Confirmação.
7. Atualizar `README.md` (projeto, regra de preço, como mudar câmbio/margem).
8. `npm install` e `npm run build`, corrigir todos os erros e avisos de tipo/lint.
9. `npm run dev`, conferir cada rota manualmente.
10. Mostrar resumo das mudanças, aguardar OK do usuário, então commit e push na `main` (dispara
    deploy na Vercel).

## Fora de escopo

- Qualquer integração de pagamento real.
- Testes automatizados (Vitest removido).
- Bibliotecas de animação (framer-motion) ou kits de UI prontos.
- Logos ou imagens oficiais das marcas de IA.

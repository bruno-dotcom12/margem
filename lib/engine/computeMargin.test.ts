import { describe, it, expect } from "vitest";
import { computeMargin } from "./computeMargin";
import type { LineItem, OperationProfile } from "./types";

describe("computeMargin", () => {
  // 1. Caso-âncora — assert em CADA campo (números conferidos na mão).
  it("computa a cascata completa do caso-âncora", () => {
    const profile: OperationProfile = {
      paymentFeePct: 0.05,
      freightPerUnit: 4,
      packagingPerUnit: 2,
      returnPct: 0.08,
      taxPct: 0.1,
      avgDiscountPct: 0.12,
    };
    const items: LineItem[] = [
      { name: "A", cost: 20, price: 100, quantity: 50 },
      { name: "B", cost: 10, price: 50, quantity: 100 },
    ];

    const result = computeMargin(profile, items);

    expect(result.revenue).toBe(10000);
    expect(result.cogs).toBe(2000);
    expect(result.perceivedProfit).toBe(8000);
    expect(result.deductions.discount).toBe(1200);
    expect(result.netRevenue).toBe(8800);
    expect(result.deductions.paymentFee).toBe(440);
    expect(result.deductions.tax).toBe(880);
    expect(result.deductions.returns).toBe(704);
    expect(result.deductions.freight).toBe(600);
    expect(result.deductions.packaging).toBe(300);
    expect(result.totalDeductions).toBe(4124);
    expect(result.realProfit).toBe(3876);
    expect(result.leakage).toBe(4124);
  });

  // 2. Item único — números fáceis.
  it("computa corretamente com um único item", () => {
    const profile: OperationProfile = {
      paymentFeePct: 0.1,
      freightPerUnit: 5,
      packagingPerUnit: 0,
      returnPct: 0,
      taxPct: 0,
      avgDiscountPct: 0,
    };
    const items: LineItem[] = [
      { name: "Solo", cost: 40, price: 100, quantity: 10 },
    ];

    const result = computeMargin(profile, items);

    expect(result.revenue).toBe(1000); // 100 × 10
    expect(result.cogs).toBe(400); // 40 × 10
    expect(result.perceivedProfit).toBe(600);
    expect(result.deductions.discount).toBe(0);
    expect(result.netRevenue).toBe(1000); // sem desconto
    expect(result.deductions.paymentFee).toBe(100); // 10% × 1000
    expect(result.deductions.tax).toBe(0);
    expect(result.deductions.returns).toBe(0);
    expect(result.deductions.freight).toBe(50); // 5 × 10
    expect(result.deductions.packaging).toBe(0);
    expect(result.totalDeductions).toBe(150);
    expect(result.realProfit).toBe(450); // 600 − 150
    expect(result.leakage).toBe(150);
  });

  // 3. Lista vazia → tudo zero.
  it("retorna tudo zero para uma lista vazia de itens", () => {
    const profile: OperationProfile = {
      paymentFeePct: 0.05,
      freightPerUnit: 4,
      packagingPerUnit: 2,
      returnPct: 0.08,
      taxPct: 0.1,
      avgDiscountPct: 0.12,
    };

    const result = computeMargin(profile, []);

    expect(result.revenue).toBe(0);
    expect(result.cogs).toBe(0);
    expect(result.perceivedProfit).toBe(0);
    expect(result.netRevenue).toBe(0);
    expect(result.deductions.discount).toBe(0);
    expect(result.deductions.paymentFee).toBe(0);
    expect(result.deductions.tax).toBe(0);
    expect(result.deductions.returns).toBe(0);
    expect(result.deductions.freight).toBe(0);
    expect(result.deductions.packaging).toBe(0);
    expect(result.totalDeductions).toBe(0);
    expect(result.realProfit).toBe(0);
    expect(result.leakage).toBe(0);
  });

  // 4. Perfil zerado → realProfit === perceivedProfit, leakage === 0.
  it("com perfil zerado, lucro real == lucro percebido e vazamento == 0", () => {
    const profile: OperationProfile = {
      paymentFeePct: 0,
      freightPerUnit: 0,
      packagingPerUnit: 0,
      returnPct: 0,
      taxPct: 0,
      avgDiscountPct: 0,
    };
    const items: LineItem[] = [
      { name: "A", cost: 20, price: 100, quantity: 50 },
      { name: "B", cost: 10, price: 50, quantity: 100 },
    ];

    const result = computeMargin(profile, items);

    expect(result.totalDeductions).toBe(0);
    expect(result.realProfit).toBe(result.perceivedProfit);
    expect(result.leakage).toBe(0);
  });

  // 5. Cross-check do invariante com valores fracionários (centavos).
  it("mantém perceivedProfit − realProfit ≈ totalDeductions com frações", () => {
    const profile: OperationProfile = {
      paymentFeePct: 0.0333,
      freightPerUnit: 3.37,
      packagingPerUnit: 1.19,
      returnPct: 0.0725,
      taxPct: 0.0915,
      avgDiscountPct: 0.1337,
    };
    const items: LineItem[] = [
      { name: "X", cost: 13.33, price: 49.99, quantity: 7 },
      { name: "Y", cost: 7.77, price: 19.9, quantity: 13 },
    ];

    const result = computeMargin(profile, items);

    expect(result.perceivedProfit - result.realProfit).toBeCloseTo(
      result.totalDeductions,
      10,
    );
    // leakage é atribuído direto = totalDeductions (igualdade exata).
    expect(result.leakage).toBe(result.totalDeductions);
  });

  // 6. Pureza — argumentos não são mutados.
  it("não muta profile nem items", () => {
    const profile: OperationProfile = {
      paymentFeePct: 0.05,
      freightPerUnit: 4,
      packagingPerUnit: 2,
      returnPct: 0.08,
      taxPct: 0.1,
      avgDiscountPct: 0.12,
    };
    const items: LineItem[] = [
      { name: "A", cost: 20, price: 100, quantity: 50 },
      { name: "B", cost: 10, price: 50, quantity: 100 },
    ];
    const profileSnapshot = structuredClone(profile);
    const itemsSnapshot = structuredClone(items);

    computeMargin(profile, items);

    expect(profile).toEqual(profileSnapshot);
    expect(items).toEqual(itemsSnapshot);
  });

  // 7. Prejuízo — deduções > perceivedProfit → realProfit < 0, sem clamp.
  it("permite lucro real negativo (prejuízo) sem clampar em zero", () => {
    const profile: OperationProfile = {
      paymentFeePct: 0.3,
      freightPerUnit: 50,
      packagingPerUnit: 20,
      returnPct: 0.3,
      taxPct: 0.3,
      avgDiscountPct: 0.5,
    };
    const items: LineItem[] = [
      { name: "Caro", cost: 90, price: 100, quantity: 10 },
    ];

    const result = computeMargin(profile, items);

    expect(result.realProfit).toBeLessThan(0);
    expect(result.realProfit).toBe(
      result.perceivedProfit - result.totalDeductions,
    );
  });

  // 8. Validação — percentuais fora de [0,1] e valores negativos lançam erro.
  describe("validação", () => {
    const baseProfile: OperationProfile = {
      paymentFeePct: 0.05,
      freightPerUnit: 4,
      packagingPerUnit: 2,
      returnPct: 0.08,
      taxPct: 0.1,
      avgDiscountPct: 0.12,
    };
    const baseItems: LineItem[] = [
      { name: "A", cost: 20, price: 100, quantity: 50 },
    ];

    it.each([
      ["paymentFeePct", 12],
      ["returnPct", 1.5],
      ["taxPct", -0.1],
      ["avgDiscountPct", 2],
    ] as const)(
      "lança RangeError quando %s está fora de [0,1] (=%s)",
      (key, value) => {
        const profile = { ...baseProfile, [key]: value };
        expect(() => computeMargin(profile, baseItems)).toThrow(RangeError);
      },
    );

    it.each([
      ["freightPerUnit", -1],
      ["packagingPerUnit", -2],
    ] as const)("lança RangeError quando %s é negativo (=%s)", (key, value) => {
      const profile = { ...baseProfile, [key]: value };
      expect(() => computeMargin(profile, baseItems)).toThrow(RangeError);
    });

    it.each([
      ["cost", -5],
      ["price", -10],
      ["quantity", -3],
    ] as const)(
      "lança RangeError quando %s de um item é negativo (=%s)",
      (key, value) => {
        const items: LineItem[] = [{ ...baseItems[0], [key]: value }];
        expect(() => computeMargin(baseProfile, items)).toThrow(RangeError);
      },
    );
  });
});

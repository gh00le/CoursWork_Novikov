import { describe, expect, test } from "vitest";

import { formatPrice } from "../lib/formatPrice";

describe("formatPrice", () => {
  test("добавляет два знака после запятой и знак рубля", () => {
    expect(formatPrice(1500)).toBe("1500.00 ₽");
  });
});

import { describe, expect, test } from "vitest";

import { formatPrice } from "../lib/formatPrice";

describe("formatPrice", () => {
  test("adds two decimal places and the ruble sign", () => {
    expect(formatPrice(1500)).toBe("1500.00 ₽");
  });

  test("accepts a decimal string returned by the API", () => {
    expect(formatPrice("1250.5")).toBe("1250.50 ₽");
  });
});

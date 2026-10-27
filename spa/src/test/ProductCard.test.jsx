import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, test, vi } from "vitest";

import ProductCard from "../features/catalog/components/ProductCard";
import { CartProvider } from "../features/cart/context/CartContext";

function jsonResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

test("product can be added to the shared cart", async () => {
  const fetchMock = vi.fn(async (url, options = {}) => {
    if (url.endsWith("/api/v1/cart") && options.method === "POST") {
      return jsonResponse({ id: 17 }, 201);
    }
    if (url.endsWith("/api/v1/cart/17") && !options.method) {
      return jsonResponse({ id: 17, items: [], total: "0.00" });
    }
    if (url.endsWith("/api/v1/cart/17/items") && options.method === "POST") {
      return jsonResponse({
        id: 17,
        items: [
          {
            id: 2,
            quantity: 1,
            product: {
              id: 5,
              name: "Тестовый товар",
              price: "100.00",
              image_url: null,
            },
          },
        ],
        total: "100.00",
      }, 201);
    }
    throw new Error(`Unexpected fetch: ${url}`);
  });
  vi.stubGlobal("fetch", fetchMock);

  render(
    <MemoryRouter>
      <CartProvider>
        <ProductCard
          product={{
            id: 5,
            name: "Тестовый товар",
            description: "Описание",
            price: "100.00",
            stock: 5,
            image_url: null,
            category_id: 1,
          }}
        />
      </CartProvider>
    </MemoryRouter>,
  );

  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  fireEvent.click(screen.getByRole("button", { name: "В корзину" }));

  expect(await screen.findByRole("status")).toHaveTextContent("Добавлено в корзину");
  expect(fetchMock).toHaveBeenCalledTimes(3);
  expect(JSON.parse(fetchMock.mock.calls[2][1].body)).toEqual({
    product_id: 5,
    quantity: 1,
  });
});

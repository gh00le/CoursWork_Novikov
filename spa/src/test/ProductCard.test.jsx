
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import ProductCard from "../features/catalog/components/ProductCard";
import { CartProvider } from "../features/cart/context/CartContext";
import {
  addCartItem,
  createCart,
  getCart,
} from "../features/cart/api";

jest.mock("../features/cart/api", () => ({
  createCart: jest.fn(),
  getCart: jest.fn(),
  addCartItem: jest.fn(),
  updateCartItem: jest.fn(),
  deleteCartItem: jest.fn(),
  createOrder: jest.fn(),
}));

afterEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

test("product can be added to the shared cart", async () => {
  createCart.mockResolvedValue({ id: 17 });

  getCart.mockResolvedValue({
    id: 17,
    items: [],
    total: "0.00",
  });

  addCartItem.mockResolvedValue({
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
  });

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

  await waitFor(() => {
    expect(getCart).toHaveBeenCalledWith(17);
  });

  fireEvent.click(screen.getByRole("button", { name: "В корзину" }));

  expect(await screen.findByRole("status")).toHaveTextContent(
    "Добавлено в корзину",
  );

  expect(addCartItem).toHaveBeenCalledWith(17, 5, 1);
});

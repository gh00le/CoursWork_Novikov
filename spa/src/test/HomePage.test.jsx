import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { expect, test } from "vitest";

import HomePage from "../pages/HomePage";

test("главная страница показывает заголовок интернет-магазина", () => {
  render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>,
  );

  expect(
    screen.getByRole("heading", {
      name: "Прототип интернет-магазина на React",
    }),
  ).toBeInTheDocument();
});
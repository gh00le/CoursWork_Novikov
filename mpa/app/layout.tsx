import type { Metadata } from "next";
import type { ReactNode } from "react";
import ShopHeader from "../components/ShopHeader";
export const metadata: Metadata = {
  title: "Simple Shop MPA",
  description: "Учебный интернет-магазин на Next.js для сравнения SPA и MPA.",
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="ru">
    <head><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" /></head>
    <body><ShopHeader /><main className="container py-3">{children}</main></body>
  </html>;
}

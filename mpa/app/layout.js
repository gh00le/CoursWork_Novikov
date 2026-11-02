import "./globals.css";
import ShopHeader from "../components/ShopHeader";

export const metadata = {
  title: "Simple Shop MPA",
  description: "Учебный интернет-магазин на Next.js для сравнения SPA и MPA.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
      </head>
      <body>
        <ShopHeader />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
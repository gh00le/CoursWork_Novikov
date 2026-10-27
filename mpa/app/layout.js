import "./globals.css";
import ShopHeader from "../components/ShopHeader";

export const metadata = {
  title: "Simple Shop MPA",
  description: "Учебный интернет-магазин на Next.js для сравнения SPA и MPA.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        <ShopHeader />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}

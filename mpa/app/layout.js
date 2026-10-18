import "./globals.css";

export const metadata = {
  title: "Simple Shop MPA",
  description: "MPA/SSR prototype for SPA vs MPA coursework",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        <header className="header">
          <a className="brand" href="/">
            Simple Shop MPA
          </a>

          <nav className="nav">
            <a href="/">Главная</a>
            <a href="/catalog">Каталог</a>
            <a href="/cart">Корзина</a>
          </nav>
        </header>

        <main className="container">{children}</main>
      </body>
    </html>
  );
}

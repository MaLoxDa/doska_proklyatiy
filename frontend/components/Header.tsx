import Link from "next/link";
import { Container } from "./ui";

const nav = [
  { href: "/uslugi", label: "Услуги" },
  { href: "/mastera", label: "Мастера" },
  { href: "/moi-zakazy", label: "Мои заказы" },
  { href: "/vhod", label: "Войти" },
];

export function Header() {
  return (
    <header className="border-b border-line">
      <Container>
        <div className="flex h-20 items-center justify-between gap-4">
          <Link href="/" className="text-[23px] leading-none text-text">
            Доска проклятий
          </Link>
          <nav aria-label="Основная навигация">
            <ul className="flex items-center gap-x-5 sm:gap-x-10">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-ui text-muted transition-colors hover:text-text">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>
    </header>
  );
}

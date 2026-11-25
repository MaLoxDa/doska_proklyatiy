import Link from "next/link";
import { Container, Rule } from "./ui";
import { site } from "@/lib/data";

export function Footer() {
  return (
    <footer className="mt-20">
      <Container>
        <Rule />
        <div className="flex flex-col gap-4 py-8 text-ui text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>{site.name}</p>
          <div className="flex gap-8">
            <a className="transition-colors hover:text-link" href={`mailto:${site.email}`}>
              Поддержка
            </a>
            <a className="transition-colors hover:text-link" href={`mailto:${site.email}`}>
              Контакты
            </a>
            <Link className="transition-colors hover:text-link" href="/zayavka">
              Оставить заявку
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}

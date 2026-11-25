import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "Страница не найдена",
  description: "Такой страницы нет. Вернитесь в каталог услуг или на главную.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <Container>
      <div className="flex min-h-[60vh] flex-col items-start justify-center py-20">
        <p className="text-ui text-muted">Ошибка 404</p>
        <h1 className="mt-4 text-h1 text-text">Страница не найдена</h1>
        <p className="mt-4 max-w-[520px] text-lead text-muted">
          Возможно, страница переехала или в адресе опечатка. Начните с каталога услуг — там все направления работы
          мастеров.
        </p>
        <div className="mt-8 flex flex-wrap gap-6">
          <Link href="/uslugi" className="text-ui text-link hover:underline">
            Каталог услуг
          </Link>
          <Link href="/" className="text-ui text-link hover:underline">
            На главную
          </Link>
        </div>
      </div>
    </Container>
  );
}

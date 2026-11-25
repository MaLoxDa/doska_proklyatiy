import type { Metadata } from "next";
import Link from "next/link";
import { Container, Tabs } from "@/components/ui";
import { services } from "@/lib/data";

export const metadata: Metadata = {
  title: "Услуги",
  description:
    "Каталог услуг «Доски проклятий»: ритуалы на отношения и деньги, защитные обряды, снятие проклятий, консультации по Таро и амулеты. Стоимость и формат указаны у каждой услуги.",
  alternates: { canonical: "/uslugi" },
};

export default function ServicesPage() {
  return (
    <Container>
      <div className="pt-10">
        <nav aria-label="Хлебные крошки" className="text-ui text-muted">
          <Link href="/" className="hover:text-link">
            Главная
          </Link>
          <span aria-hidden="true"> / </span>
          <span>Услуги</span>
        </nav>

        <h1 className="mt-10 text-h1 text-text">Услуги</h1>
        <p className="mt-4 max-w-[560px] text-lead text-muted">
          Все направления работы мастеров: от консультации до индивидуального оберега
        </p>

        <div className="mt-12">
          <Tabs items={["Все услуги", "Ритуалы", "Консультации", "Амулеты"]} />
        </div>

        <ul className="mt-2">
          {services.map((service) => (
            <li key={service.slug} className="border-b border-line">
              <div className="grid gap-1 py-7 sm:grid-cols-[1fr_1.6fr_auto] sm:items-center sm:gap-6">
                <div>
                  <h2 className="text-h4 text-text">
                    <Link href={`/uslugi/${service.slug}`} className="transition-colors hover:text-link">
                      {service.title}
                    </Link>
                  </h2>
                  <p className="mt-1 text-base2 text-muted">{service.category}</p>
                </div>
                <p className="text-base2 text-muted">{service.short}</p>
                <div className="flex items-center gap-6">
                  <span className="text-ui text-muted">{service.price}</span>
                  <Link href={`/uslugi/${service.slug}`} className="text-ui text-link hover:underline">
                    Подробнее
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <p className="py-10 text-ui text-muted">
          Условия и стоимость можно обсудить с мастером до оплаты.
        </p>
      </div>
    </Container>
  );
}

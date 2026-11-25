import type { Metadata } from "next";
import Link from "next/link";
import { Container, Tabs } from "@/components/ui";
import { masters } from "@/lib/data";

export const metadata: Metadata = {
  title: "Мастера",
  description:
    "Мастера «Доски проклятий»: Таро и личные консультации, защитные практики, ритуалы на деньги и отношения. Рейтинг, опыт и стоимость консультации указаны в карточке.",
  alternates: { canonical: "/mastera" },
};

export default function MastersPage() {
  return (
    <Container>
      <div className="pt-16">
        <h1 className="text-h1 text-text">Мастера</h1>
        <p className="mt-4 text-lead text-muted">Выберите, к кому обратиться</p>

        <div className="mt-12">
          <Tabs items={["Все мастера", "Ритуалы", "Консультации"]} />
        </div>

        <ul className="mt-2">
          {masters.map((master) => (
            <li key={master.slug} className="border-b border-line">
              <div className="grid gap-2 py-8 sm:grid-cols-[1fr_1.6fr_auto] sm:items-start sm:gap-6">
                <div>
                  <h2 className="text-[26px] text-text">
                    <Link href={`/mastera/${master.slug}`} className="transition-colors hover:text-link">
                      {master.name}
                    </Link>
                  </h2>
                  <p className="mt-2 text-base2 text-muted">{master.specialization}</p>
                </div>
                <p className="text-lead text-muted">{master.description}</p>
                <Link href={`/mastera/${master.slug}`} className="text-ui text-link hover:underline">
                  Обратиться
                </Link>
              </div>
            </li>
          ))}
        </ul>

        <p className="py-12 text-ui text-muted">Условия и стоимость можно обсудить с мастером до оплаты</p>
      </div>
    </Container>
  );
}

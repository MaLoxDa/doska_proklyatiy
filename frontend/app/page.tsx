import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container, Rule, SectionTitle, Tabs } from "@/components/ui";
import { services } from "@/lib/data";

export const metadata: Metadata = {
  title: "Доска проклятий — ритуалы и консультации",
  description:
    "Выберите ритуал, консультацию или амулет и обсудите запрос с мастером в переписке. Прозрачные условия, оплата после согласования деталей.",
  alternates: { canonical: "/" },
};

const steps = ["Выберите услугу", "Заполните анкету", "Получите отчёт"];

export default function HomePage() {
  return (
    <>
      <section className="relative isolate min-h-[420px] overflow-hidden sm:min-h-[460px]">
        <Image
          src="/images/hero.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(10,10,15,0.96)_0%,rgba(10,10,15,0.82)_38%,rgba(10,10,15,0.35)_100%)]" />
        <Container>
          <div className="flex min-h-[420px] max-w-[520px] flex-col justify-center py-16 sm:min-h-[460px]">
            <h1 className="text-h1 text-text">
              Ритуалы
              <br />
              и консультации
            </h1>
            <p className="mt-6 max-w-[300px] text-lead text-muted">Выберите услугу и обсудите запрос с мастером</p>
            <div>
              <Link
                href="/uslugi"
                className="mt-8 inline-flex h-[46px] items-center rounded bg-accent px-6 text-ui text-text transition-colors hover:bg-[#8a67c2]"
              >
                Каталог услуг
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <Container>
        <section className="pt-16" aria-labelledby="services-title">
          <SectionTitle>
            <span id="services-title">Услуги</span>
          </SectionTitle>
          <div className="mt-6">
            <Tabs items={["Все услуги", "Ритуалы", "Консультации", "Амулеты"]} />
          </div>
          <ul className="mt-2">
            {services.slice(0, 4).map((service) => (
              <li key={service.slug} className="border-b border-line">
                <div className="grid gap-1 py-7 sm:grid-cols-[1fr_1.6fr_auto] sm:items-center sm:gap-6">
                  <h3 className="text-h4 text-text">
                    <Link href={`/uslugi/${service.slug}`} className="transition-colors hover:text-link">
                      {service.title}
                    </Link>
                  </h3>
                  <p className="text-base2 text-muted">{service.short}</p>
                  <Link href={`/uslugi/${service.slug}`} className="text-ui text-link hover:underline">
                    Подробнее
                  </Link>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-ui text-muted">
            <Link href="/uslugi" className="text-link hover:underline">
              Смотреть все услуги
            </Link>
          </p>
        </section>

        <section className="py-16" aria-labelledby="how-title">
          <div className="flex flex-col gap-8">
            <div>
              <h2 id="how-title" className="text-[26px] text-text">
                Как заказать
              </h2>
            </div>
            <ol className="grid gap-4 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
              {steps.map((step, i) => (
                <li key={step} className="contents">
                  {i > 0 ? (
                    <span aria-hidden="true" className="hidden h-px w-full max-w-[124px] justify-self-center bg-line sm:block" />
                  ) : null}
                  <div className="flex h-[46px] items-center justify-center rounded bg-accent px-4 text-center text-ui text-white">
                    {step}
                  </div>
                </li>
              ))}
            </ol>
            <Rule />
            <p className="text-ui text-muted">
              Условия и стоимость обсуждаются с мастером до оплаты. Оплата — после согласования деталей.
            </p>
          </div>
        </section>
      </Container>
    </>
  );
}

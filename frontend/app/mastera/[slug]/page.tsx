import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Rule } from "@/components/ui";
import { getMaster, masters, services } from "@/lib/data";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return masters.map((master) => ({ slug: master.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const master = getMaster(slug);
  if (!master) return { title: "Мастер не найден" };

  return {
    title: `${master.name} — мастер ${master.specialization.toLowerCase()}`,
    description: `${master.name}: ${master.description.toLowerCase()}. Опыт ${master.experience} лет, рейтинг ${master.rating} из 5. Стоимость консультации ${master.price}.`,
    alternates: { canonical: `/mastera/${master.slug}` },
  };
}

export default async function MasterPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const master = getMaster(slug);
  if (!master) notFound();

  const masterServices = services.filter((s) => s.masterSlug === master.slug);

  return (
    <Container>
      <div className="pt-16">
        <nav aria-label="Хлебные крошки" className="text-ui text-muted">
          <Link href="/mastera" className="hover:text-link">
            Мастера
          </Link>
          <span aria-hidden="true"> / </span>
          <span>{master.name}</span>
        </nav>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.4fr] lg:items-start">
          <h1 className="text-h1 text-text">{master.name}</h1>
          <p className="max-w-[640px] text-lead text-muted">{master.quote}</p>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[200px_1fr] lg:gap-14">
          <div className="relative h-[200px] w-[200px] overflow-hidden rounded-full bg-panel">
            <Image
              src="/images/master.webp"
              alt={`Фотография мастера ${master.name}`}
              fill
              sizes="200px"
              className="object-cover"
            />
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <dl className="space-y-3 text-lead">
              <div>
                <dt className="sr-only">Специализация</dt>
                <dd className="text-text">Специализация: {master.specialization}</dd>
              </div>
              <div>
                <dt className="sr-only">Рейтинг</dt>
                <dd className="text-text">
                  Рейтинг: <span aria-hidden="true">★★★★★</span> {master.rating} из 5
                </dd>
              </div>
              <div>
                <dt className="sr-only">Опыт</dt>
                <dd className="text-text">Опыт: {master.experience} лет практики</dd>
              </div>
            </dl>
            <dl className="space-y-3 text-lead">
              <div>
                <dt className="sr-only">Стоимость</dt>
                <dd className="text-text">Стоимость консультации: {master.price}</dd>
              </div>
              <div>
                <dt className="sr-only">Формат</dt>
                <dd className="text-text">Формат: онлайн, в переписке</dd>
              </div>
              <div>
                <dt className="sr-only">Срок</dt>
                <dd className="text-text">Срок: после обсуждения запроса</dd>
              </div>
            </dl>
          </div>
        </div>

        <Rule className="mt-12" />

        <div className="flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={`/zayavka?master=${master.slug}`}
            className="inline-flex h-[46px] items-center justify-center rounded bg-accent px-6 text-ui text-text transition-colors hover:bg-[#8a67c2]"
          >
            Обратиться
          </Link>
          <p className="text-ui text-muted">Сначала обсудим детали, затем оплату</p>
        </div>

        {masterServices.length > 0 ? (
          <section className="pb-10">
            <h2 className="text-h3 text-text">Услуги мастера</h2>
            <ul className="mt-6">
              {masterServices.map((service) => (
                <li key={service.slug} className="border-b border-line">
                  <div className="flex flex-wrap items-center justify-between gap-3 py-5">
                    <Link href={`/uslugi/${service.slug}`} className="text-h4 text-text hover:text-link">
                      {service.title}
                    </Link>
                    <span className="text-ui text-muted">{service.price}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </Container>
  );
}

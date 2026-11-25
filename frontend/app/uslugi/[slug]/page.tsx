import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Rule } from "@/components/ui";
import { getMaster, getService, services } from "@/lib/data";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return { title: "Услуга не найдена" };

  return {
    title: service.title,
    description: `${service.title}: ${service.short.toLowerCase()}. ${service.about.slice(0, 120)}…`,
    alternates: { canonical: `/uslugi/${service.slug}` },
    openGraph: {
      title: `${service.title} — Доска проклятий`,
      description: service.short,
      url: `/uslugi/${service.slug}`,
    },
  };
}

export default async function ServicePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const master = getMaster(service.masterSlug);

  return (
    <Container>
      <div className="pt-10">
        <nav aria-label="Хлебные крошки" className="text-ui text-muted">
          <Link href="/uslugi" className="hover:text-link">
            Все услуги
          </Link>
          <span aria-hidden="true"> / </span>
          <span>{service.title}</span>
        </nav>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-12">
          <div>
            <h1 className="text-h1 text-text">{service.title}</h1>
            <p className="mt-4 max-w-[560px] text-lead text-muted">{service.short}</p>

            <h2 className="mt-12 text-h3 text-text">Об услуге</h2>
            <p className="mt-4 max-w-[660px] text-lead text-muted">{service.about}</p>

            <Rule className="mt-8 max-w-[660px]" />

            <dl className="mt-6 grid max-w-[660px] gap-y-4 sm:grid-cols-[220px_1fr]">
              <dt className="text-ui text-muted">Формат</dt>
              <dd className="text-lead text-text">{service.format}</dd>
              <dt className="text-ui text-muted">Срок</dt>
              <dd className="text-lead text-text">{service.term}</dd>
              <dt className="text-ui text-muted">Стоимость</dt>
              <dd className="text-lead text-text">{service.price}</dd>
              {master ? (
                <>
                  <dt className="text-ui text-muted">Мастер</dt>
                  <dd className="text-lead text-text">
                    <Link href={`/mastera/${master.slug}`} className="text-link underline underline-offset-4 hover:text-text">
                      {master.name}
                    </Link>
                    , {master.specialization.toLowerCase()}
                  </dd>
                </>
              ) : null}
            </dl>

            <Rule className="mt-8 max-w-[660px]" />

            <div className="mt-8">
              <Link
                href={`/zayavka?service=${service.slug}`}
                className="inline-flex h-[46px] items-center rounded bg-accent px-6 text-ui text-text transition-colors hover:bg-[#8a67c2]"
              >
                Оставить заявку
              </Link>
              <p className="mt-4 text-ui text-muted">Сначала обсудим детали, затем оплату</p>
            </div>
          </div>

          <div className="relative order-first h-[320px] w-full overflow-hidden rounded sm:h-[420px] lg:order-none lg:w-[380px]">
            <Image
              src="/images/service.webp"
              alt={`Иллюстрация к услуге «${service.title}»: туманный лес и фигура в плаще`}
              fill
              sizes="(max-width: 1024px) 100vw, 380px"
              className="object-cover"
            />
          </div>
        </div>

        <section className="mt-16 max-w-[900px] pb-6">
          <h2 className="text-h3 text-text">Что понадобится</h2>
          <p className="mt-4 text-lead text-muted">{service.needs}</p>
        </section>
      </div>
    </Container>
  );
}

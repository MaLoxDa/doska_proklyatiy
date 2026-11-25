import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { RequestForm } from "@/components/RequestForm";

export const metadata: Metadata = {
  title: "Оставить заявку",
  description:
    "Оставьте заявку на услугу «Доски проклятий»: опишите ситуацию и укажите почту — мастер свяжется с вами и предложит формат работы.",
  alternates: { canonical: "/zayavka" },
};

export default function RequestPage() {
  return (
    <Container>
      <div className="pt-10">
        <nav aria-label="Хлебные крошки" className="text-ui">
          <Link href="/uslugi" className="text-link hover:underline">
            Вернуться к услуге
          </Link>
        </nav>

        <h1 className="mt-10 text-h1 text-text">Оставить заявку</h1>
        <p className="mt-4 max-w-[520px] text-lead text-muted">
          Расскажите, с чем нужна помощь. Мастер свяжется с вами
        </p>

        <div className="mt-12 pb-10">
          <RequestForm />
        </div>
      </div>
    </Container>
  );
}

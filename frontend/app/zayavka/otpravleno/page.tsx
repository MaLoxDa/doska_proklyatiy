import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "Заявка отправлена",
  description: "Заявка отправлена: мастер уточнит запрос и ответит на указанную почту.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/zayavka/otpravleno" },
};

export default function SentPage() {
  return (
    <Container>
      <div className="flex min-h-[60vh] items-center justify-center py-20">
        <div className="w-full max-w-[467px] rounded bg-accent px-8 py-10 text-center">
          <h1 className="text-[32px] leading-tight text-white">Заявка отправлена</h1>
          <p className="mt-4 text-ui text-white/80">
            Мастер уточнит запрос и ответит на указанную почту в течение рабочего дня.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Link href="/moi-zakazy" className="text-ui text-white underline underline-offset-4">
              Перейти в мои заказы
            </Link>
            <Link href="/uslugi" className="text-ui text-white/80 underline underline-offset-4">
              Вернуться к каталогу
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
}

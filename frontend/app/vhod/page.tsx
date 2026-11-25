import type { Metadata } from "next";
import { Container, Rule } from "@/components/ui";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Вход в личный кабинет",
  description: "Войдите, чтобы отслеживать статус заказов и общаться с мастерами.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/vhod" },
};

export default function LoginPage() {
  return (
    <Container>
      <div className="py-16">
        <h1 className="text-center text-h1 text-white">Вход в личный кабинет</h1>
        <p className="mx-auto mt-6 max-w-[720px] text-center text-h3 text-muted">
          Войдите, чтобы отслеживать статус заказов и общаться с мастерами
        </p>

        <div className="mt-12">
          <LoginForm />
        </div>

        <div className="mx-auto mt-12 max-w-[640px]">
          <Rule />
        </div>
      </div>
    </Container>
  );
}

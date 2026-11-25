import type { Metadata } from "next";
import Link from "next/link";
import { Container, Rule, Tabs } from "@/components/ui";
import { demoOrders } from "@/lib/data";

export const metadata: Metadata = {
  title: "Мои заказы",
  description: "Личный кабинет: заявки, переписка с мастером и готовые отчёты.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/moi-zakazy" },
};

export default function OrdersPage() {
  return (
    <Container>
      <div className="pt-16">
        <h1 className="text-h1 text-text">Мои заказы</h1>
        <p className="mt-4 text-lead text-muted">Заявки, переписка с мастером и готовые отчёты</p>

        <div className="mt-12">
          <Tabs items={["Все", "В работе", "Завершённые"]} />
        </div>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <caption className="sr-only">Список заказов клиента</caption>
            <thead>
              <tr className="border-b border-line text-ui text-muted">
                <th scope="col" className="pb-3 font-normal">
                  Услуга
                </th>
                <th scope="col" className="pb-3 font-normal">
                  Мастер
                </th>
                <th scope="col" className="pb-3 font-normal">
                  Статус
                </th>
                <th scope="col" className="pb-3 font-normal">
                  <span className="sr-only">Действие</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {demoOrders.map((order) => (
                <tr key={order.id} className="border-b border-line align-top">
                  <td className="py-6">
                    <span className="block text-h4 text-text">{order.service}</span>
                    <span className="mt-1 block text-ui text-muted">Заявка № {order.id}</span>
                  </td>
                  <td className="py-6 text-lead text-text">{order.master}</td>
                  <td className="py-6 text-lead text-muted">{order.status}</td>
                  <td className="py-6 text-right text-ui">
                    <span className="text-link">{order.action}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10">
          <Rule />
          <div className="flex flex-col gap-3 py-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-lead text-text">Нужна помощь с заказом?</p>
            <Link href="/zayavka" className="text-ui text-link hover:underline">
              Написать в поддержку
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
}

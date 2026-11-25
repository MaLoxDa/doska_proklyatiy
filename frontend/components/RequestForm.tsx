"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { services } from "@/lib/data";

const API = process.env.NEXT_PUBLIC_API_URL ?? "/api";

type Status = "idle" | "sending" | "error";

export function RequestForm() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");
  const [slug, setSlug] = useState<string>(services[0].slug);

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("service");
    if (param && services.some((s) => s.slug === param)) setSlug(param);
  }, []);

  const current = services.find((s) => s.slug === slug) ?? services[0];

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("sending");
    setError("");

    try {
      const response = await fetch(`${API}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(form.get("name") ?? ""),
          email: String(form.get("email") ?? ""),
          message: String(form.get("message") ?? ""),
          service: slug,
          consent: form.get("consent") === "on",
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail ?? `Сервер ответил ${response.status}`);
      }

      router.push("/zayavka/otpravleno");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Не удалось отправить заявку");
    }
  }

  return (
    <form className="grid gap-10 lg:grid-cols-[1fr_400px]" onSubmit={onSubmit} noValidate>
      <div className="max-w-[640px]">
        <div>
          <label htmlFor="name" className="block text-ui text-text">
            Ваше имя
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Как к вам обращаться"
            className="field mt-3"
          />
        </div>

        <div className="mt-6">
          <label htmlFor="email" className="block text-ui text-text">
            Электронная почта
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="name@example.com"
            className="field mt-3"
          />
        </div>

        <div className="mt-6">
          <label htmlFor="service" className="block text-ui text-text">
            Услуга
          </label>
          <select
            id="service"
            name="service"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            className="field mt-3"
          >
            {services.map((service) => (
              <option key={service.slug} value={service.slug}>
                {service.title}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6">
          <label htmlFor="message" className="block text-ui text-text">
            Ваш запрос
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            placeholder="Кратко опишите ситуацию"
            className="field mt-3 resize-y"
          />
        </div>

        <div className="mt-6 flex items-start gap-3">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            required
            className="mt-1 h-[18px] w-[18px] shrink-0 rounded-sm border border-line bg-panel"
          />
          <label htmlFor="consent" className="text-ui text-muted">
            Согласен на обработку персональных данных
          </label>
        </div>

        <button
          type="submit"
          disabled={status === "sending"}
          className="mt-8 inline-flex h-[46px] items-center rounded bg-accent px-6 text-ui text-text transition-colors hover:bg-[#8a67c2] disabled:opacity-60"
        >
          {status === "sending" ? "Отправляем…" : "Отправить заявку"}
        </button>

        <p className="mt-4 text-ui text-muted">Оплата после согласования деталей</p>

        {status === "error" ? (
          <p role="alert" className="mt-4 text-ui text-[#e29b9b]">
            {error}. Попробуйте ещё раз или напишите на help@doska.localhost.
          </p>
        ) : null}
      </div>

      <aside className="order-first lg:order-none">
        <p className="text-ui text-muted">Выбранная услуга</p>
        <p className="mt-2 text-h3 text-text">{current.title}</p>
        <p className="mt-2 text-base2 text-muted">{current.price} · стоимость уточнит мастер</p>
        <div className="mt-6 border-t border-line pt-6">
          <h2 className="text-h4 text-text">Что дальше</h2>
          <p className="mt-3 text-base2 text-muted">
            Мастер уточнит запрос и предложит формат работы. Ответ придёт на вашу почту.
          </p>
        </div>
      </aside>
    </form>
  );
}

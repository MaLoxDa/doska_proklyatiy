"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError("");

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(form.get("email") ?? ""),
          password: String(form.get("password") ?? ""),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail ?? "Не удалось войти");
      }

      router.push("/moi-zakazy");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось войти");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="mx-auto max-w-[640px]" onSubmit={onSubmit} noValidate>
      <div>
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
        <label htmlFor="password" className="block text-ui text-text">
          Пароль
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="field mt-3"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-8 inline-flex h-[46px] items-center rounded bg-accent px-6 text-ui text-text transition-colors hover:bg-[#8a67c2] disabled:opacity-60"
      >
        {pending ? "Входим…" : "Войти"}
      </button>

      {error ? (
        <p role="alert" className="mt-4 text-ui text-[#e29b9b]">
          {error}
        </p>
      ) : null}

      <div className="mt-10 flex flex-col items-start gap-4">
        <a href={`mailto:help@doska.localhost?subject=${encodeURIComponent("Восстановление пароля")}`} className="text-[24px] text-accent hover:underline">
          Забыли пароль?
        </a>
        <p className="text-ui text-muted">Или</p>
        <a
          href={`mailto:help@doska.localhost?subject=${encodeURIComponent("Регистрация")}`}
          className="text-[24px] text-accent hover:underline"
        >
          Зарегистрироваться
        </a>
      </div>
    </form>
  );
}

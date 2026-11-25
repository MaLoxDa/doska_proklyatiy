import type { MetadataRoute } from "next";
import { site } from "@/lib/data";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Личный кабинет закрыт от сканирования, вход — только после авторизации.
        // Ответы API тоже не индексируются (дополнительно заголовок X-Robots-Tag в nginx и FastAPI).
        disallow: ["/moi-zakazy", "/api/"],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}

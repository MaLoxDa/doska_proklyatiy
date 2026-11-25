import type { MetadataRoute } from "next";
import { publicRoutes, site } from "@/lib/data";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return publicRoutes.map((route) => {
    const path = route === "/" ? "" : route.replace(/\/$/, "");
    return {
      url: `${site.url}${path}/`.replace(/\/+$/, "/"),
      lastModified,
      changeFrequency: route === "/" ? "weekly" : "monthly",
      priority: route === "/" ? 1 : 0.7,
    };
  });
}

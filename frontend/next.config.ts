import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Статический экспорт: на выходе готовые HTML-файлы, их отдаёт nginx (см. deploy/).
  output: "export",
  trailingSlash: false,
  images: { unoptimized: true },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;

FROM node:22-alpine AS builder
WORKDIR /app

# Переменные этапа сборки: подставляются в код и видны в браузере, секретов здесь быть не должно.
ARG NEXT_PUBLIC_SITE_URL=https://doska.localhost
ARG NEXT_PUBLIC_API_URL=/api
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

# package-lock.json фиксирует версии — npm ci ставит ровно их
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime

# Свой конфиг: nginx работает от непривилегированного пользователя (pid и temp — в /tmp)
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/out /usr/share/nginx/html

USER nginx
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

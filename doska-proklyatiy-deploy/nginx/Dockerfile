# Образ nginx — единая точка входа: статика фронтенда + прокси на /api/.
# Конфиг и сертификаты копируются в образ, потому что на учебной машине
# bind-mount папок Windows в Docker Desktop не работает (см. README, раздел «Отличия»).
# В настоящем деплое конфиг и certs монтируются томами — команда приведена в README.
# Контекст сборки — папка doska-proklyatiy-deploy (см. docker-compose.yml).
FROM nginx:1.27-alpine

COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY certs/ /etc/nginx/certs/

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]

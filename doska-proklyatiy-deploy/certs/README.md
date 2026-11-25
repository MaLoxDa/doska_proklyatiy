# Сертификаты

Здесь лежат файлы локального сертификата, выпущенного через `mkcert`:

- `doska.localhost.pem` — сертификат;
- `doska.localhost-key.pem` — закрытый ключ.

Оба файла перечислены в `.gitignore` и в репозиторий не попадают: сертификат и ключ
выпускаются на машине разработчика командой

```bash
mkcert -cert-file doska.localhost.pem -key-file doska.localhost-key.pem doska.localhost
```

Папка нужна в репозитории, потому что её монтирует контейнер nginx.

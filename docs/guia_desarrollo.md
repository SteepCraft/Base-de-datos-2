# Guía de Desarrollo

Esta guía describe los pasos para levantar y trabajar en el entorno de desarrollo del proyecto.

## Requisitos previos

- Node.js >= 18
- pnpm (o npm/yarn)
- Docker (para la base de datos Oracle)

## 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPO>
cd bd2
```

## 2. Inicializar la base de datos Oracle

```bash
cd backend
sudo docker compose up -d
./setup-user.sh
```

Esto levantará Oracle XE y configurará automáticamente el usuario y el esquema.

Para más detalles, consulta `docs/oracle_init.md`.

## 3. Instalar dependencias del workspace

```bash
pnpm install
```

## 4. Levantar entorno desde root

```bash
# backend + frontend en paralelo
pnpm dev

# alias compatible
pnpm dev:all
```

Para correr solo un paquete desde root:

```bash
pnpm dev:backend
pnpm dev:frontend
```

## 5. Backend (opcional, desde su carpeta)

```bash
cd backend
pnpm dev # o npm run dev
```

### Variables de entorno

Copia el archivo `.env.example` como `.env` en `backend/`:

```bash
cp .env.example .env
```

Asegúrate de que contenga:

```
ORACLE_USER=SANAYA
ORACLE_PASSWORD=123
ORACLE_HOST=localhost
ORACLE_PORT=1521
ORACLE_DB=XEPDB1
```

## 6. Frontend (opcional, desde su carpeta)

```bash
cd frontend
pnpm dev # o npm run dev
```

## 7. Pruebas

- Para probar la conexión a la base de datos y los modelos:

```bash
cd backend
node src/config/test-db.js
```

- Para probar la API, usa Postman, Thunder Client o curl.

## 8. Estructura del proyecto

- `backend/`: Código del servidor Node.js, modelos, controladores, rutas.
- `frontend/`: Código del frontend (Vite, React, etc.).
- `docs/`: Documentación técnica y de despliegue.

---

Para dudas o problemas, consulta los archivos en `docs/` o abre un issue.

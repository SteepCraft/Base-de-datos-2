# BD2 - Plataforma SANAYA

Monorepo para gestion academica universitaria con:

- Backend Node.js + Express + Sequelize + Oracle
- Frontend React + Vite + Tailwind
- Base de datos Oracle XE en Docker

El proyecto trabaja sobre el esquema SANAYA y sus entidades academicas.

## Stack Tecnico

- Node.js 18+
- pnpm 10+
- Turborepo
- Oracle XE (contenedor Docker)
- Express 5
- Sequelize 6
- React 19
- Vite 8

## Modulos Principales

- Autenticacion JWT (cookie + bearer token)
- CRUD generico para entidades SANAYA
- Importacion y exportacion de datos (xlsx/csv)
- Vistas de trabajo por dominio en frontend:
  - Personas
  - Academico
  - Curriculo
  - Seguimiento
  - Data Transfer

## Entidades SANAYA

- terceros
- asignaturas
- programas
- cursos
- pensums
- detalle-pensums
- terc-pensums
- historias
- prematriculas
- auditorias

## Inicio Rapido

1. Instalar dependencias del monorepo

```bash
pnpm install
```

2. Levantar Oracle XE

```bash
docker compose -f backend/docker-compose.yml up -d
```

3. Inicializar usuario SANAYA y esquema

```bash
cd backend
chmod +x setup-user.sh
./setup-user.sh
cd ..
```

4. Crear variables de entorno

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

5. Ajustar backend/.env si usas el docker-compose del repo

```env
ORACLE_PORT=1522
ORACLE_CONNECT_STRING=localhost:1522/XEPDB1
ORACLE_DB=XEPDB1
```

Nota: `backend/docker-compose.yml` publica `1522 -> 1521`, por eso desde host se usa 1522.

6. Levantar backend + frontend

```bash
pnpm dev
```

URLs:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Health: http://localhost:3000/health

## Ejecucion por Paquete

```bash
pnpm --filter backend dev
pnpm --filter frontend dev
```

## Scripts Disponibles

Root:

```bash
pnpm dev
pnpm build
pnpm lint
pnpm lint:fix
pnpm format
```

Backend:

```bash
pnpm --filter backend start
pnpm --filter backend init
pnpm --filter backend lint
pnpm --filter backend lint:fix
pnpm --filter backend format
```

Frontend:

```bash
pnpm --filter frontend build
pnpm --filter frontend preview
pnpm --filter frontend lint
pnpm --filter frontend lint:fix
pnpm --filter frontend format
```

## Variables de Entorno

Backend base (`backend/.env`):

```env
ORACLE_USER=sanaya
ORACLE_PASS=123
ORACLE_HOST=127.0.0.1
ORACLE_PORT=1522
ORACLE_DB=XEPDB1
ORACLE_CONNECT_STRING=localhost:1522/XEPDB1

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=8h
COOKIE_SECURE=false
COOKIE_DOMAIN=

FRONTEND_URL=http://localhost:5173,http://127.0.0.1:5173
```

Frontend (`frontend/.env`):

```env
VITE_API_URL=http://localhost:3000/api
```

## Credenciales de Desarrollo

Si no existe tabla de usuarios o no hay registro valido, el backend soporta usuarios fallback por entorno:

- admin@sanaya.local / admin123
- admin@sanaya.com / 123456

## API Principal

Autenticacion:

- POST /api/auth/login
- GET /api/auth/me
- POST /api/auth/logout

CRUD SANAYA (requiere auth):

- GET /api/sanaya/:entity
- GET /api/sanaya/:entity/search
- GET /api/sanaya/:entity/options
- GET /api/sanaya/:entity/id/:id
- GET /api/sanaya/:entity/one
- POST /api/sanaya/:entity
- PUT /api/sanaya/:entity/id/:id
- PUT /api/sanaya/:entity/one
- DELETE /api/sanaya/:entity/id/:id
- DELETE /api/sanaya/:entity/one

Procedimiento de matricula:

- POST /api/sanaya/terc-pensums/execute-sp

Transferencia de datos (requiere auth):

- GET /api/data/export/:entity?format=xlsx|csv
- POST /api/data/import-preview/:entity
- POST /api/data/import/:entity

Entidades soportadas en Data Transfer:

- historias
- auditorias
- usuarios
- asignaturas
- cursos
- detalles_pensum
- pensums
- prematriculas
- programas
- terceros
- terc_pensums

## Triggers y Reglas de Negocio

Triggers principales en `backend/sanaya.sql`:

- ACCESO_DIAS_HORAS
- TR_MAT_PRIMIPAROS
- TR_AUDITA_NOTAS

Regla horaria actual:

- `ACCESO_DIAS_HORAS` valida con zona fija `America/Bogota`
- Ventana permitida: lunes a viernes, de 08:00 a 18:00

Validar estado de triggers:

```sql
SELECT trigger_name, status, table_name, triggering_event
FROM user_triggers
WHERE trigger_name IN ('ACCESO_DIAS_HORAS','TR_MAT_PRIMIPAROS','TR_AUDITA_NOTAS')
ORDER BY trigger_name;
```

## Verificacion Rapida

Verificar conectividad de Oracle y modelos Sequelize:

```bash
cd backend
node src/config/test-db.js
```

## Troubleshooting

- Error `NJS-510` o timeout al conectar Oracle
  - Oracle aun no termino de iniciar
  - Revisa logs: `docker compose -f backend/docker-compose.yml logs -f oracle-xe`

- Error `ORA-20502` al insertar en `TERCEROS`
  - El trigger de horario esta bloqueando fuera de ventana laboral

- Error por servicio Oracle incorrecto
  - Este proyecto usa `XEPDB1` (no `XE`) en `ORACLE_DB`
  - Verifica tambien `ORACLE_CONNECT_STRING`

## Estructura del Repo

```text
bd2/
  backend/
    app.js
    server.js
    sanaya.sql
    setup-user.sh
    src/
      auth/
      config/
      controllers/
      models/
      routes/
      tools/
  frontend/
    src/
      components/
      config/
      context/
      pages/
      App.jsx
  docs/
```

## Documentacion Relacionada

- docs/guia_desarrollo.md
- docs/oracle_init.md
- docs/wsl_oracle_windows.md

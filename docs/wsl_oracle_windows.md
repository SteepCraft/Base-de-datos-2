# Oracle en Windows + Backend en WSL

Si Oracle esta instalado en Windows y el backend corre en WSL, `127.0.0.1` dentro de WSL no siempre llega al listener de Windows.

## Diagnostico actual

- En Windows hay proceso escuchando en `0.0.0.0:1521`.
- Desde WSL, `127.0.0.1:1521` responde `ECONNREFUSED`.
- Esto indica que el listener no esta publicado de forma accesible para WSL (o esta restringido por firewall/ACL).

## Opcion recomendada

La via mas estable es ejecutar Oracle tambien dentro de WSL con Docker (ya existe `backend/docker-compose.yml`).

```bash
cd backend
sudo docker compose up -d
./setup-user.sh
```

Luego en `backend/.env` usar:

```env
ORACLE_HOST=127.0.0.1
ORACLE_PORT=1521
ORACLE_DB=XEPDB1
```

## Si quieres mantener Oracle en Windows

1. Verifica que el listener acepte conexiones TCP externas (no solo loopback).
2. Agrega regla de firewall de entrada para TCP 1521 para el perfil activo.
3. Reinicia listener Oracle en Windows.
4. En WSL, prueba el host de Windows:

```bash
ip route
nc -vz <gateway_windows> 1521
```

5. Si responde, coloca ese IP en `ORACLE_HOST`.

## Comando de verificacion backend

```bash
cd backend
node -e "import('./app.js')"
```

Si conecta bien, no debe aparecer `NJS-503`.

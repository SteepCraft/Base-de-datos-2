# Inicialización de Oracle Database con Docker Compose

Esta guía explica cómo levantar una base de datos Oracle XE en Docker usando **docker-compose**, crear el usuario de trabajo (`sanaya`) y preparar el entorno para el proyecto.

## Requisitos previos
- Tener instalado [Docker](https://docs.docker.com/get-docker/)
- Tener instalado [Docker Compose](https://docs.docker.com/compose/)

---

## 1. Crear archivo `docker-compose.yml`

En la carpeta `backend/` existe un archivo `docker-compose.yml` con el siguiente contenido:

```yaml
services:
  oracle-xe:
    image: gvenzl/oracle-xe:21.3.0-slim
    container_name: oracle-xe
    ports:
      - "1521:1521"
    environment:
      ORACLE_PASSWORD: "123"
    volumes:
      - oracle-data:/opt/oracle/oradata

volumes:
  oracle-data:
```

---

## 2. Levantar el contenedor

Desde la carpeta `backend/`, ejecuta:

```bash
cd backend
sudo docker compose up -d
```

Esto creará y levantará el contenedor con Oracle XE. El proceso de inicialización puede tardar 1-2 minutos.

---

## 3. Configurar usuario y base de datos automáticamente

Ejecuta el script de configuración automatizado:

```bash
./setup-user.sh
```

Este script:
- ✅ Espera automáticamente a que Oracle esté listo
- ✅ Crea el usuario `SANAYA` con todos los permisos necesarios
- ✅ Copia y ejecuta el archivo `sanaya.sql` para crear todas las tablas

**Nota:** Si necesitas recrear el esquema en el futuro, simplemente ejecuta `./setup-user.sh` de nuevo.

---

## 4. Acceder a la base de datos

### Conexión como `system` (administrador)

1. Dentro del contenedor con SQLPlus:
```bash
sudo docker exec -it oracle-xe sqlplus system/123@localhost/XEPDB1
```

2. Desde tu máquina (si tienes SQLPlus instalado):
```bash
sqlplus system/123@localhost:1521/XEPDB1
```

3. Usando DBeaver, Oracle SQL Developer u otro cliente:
- **Host:** localhost  
- **Puerto:** 1521  
- **Usuario:** system  
- **Contraseña:** 123  
- **Service:** XEPDB1  

### Conexión como `SANAYA` (usuario de trabajo)

- **Host:** localhost  
- **Puerto:** 1521  
- **Usuario:** SANAYA  
- **Contraseña:** 123  
- **Service:** XEPDB1  

```bash
sudo docker exec -it oracle-xe sqlplus SANAYA/123@localhost:1521/XEPDB1
```

---

## 5. Configurar variables de entorno en el backend

En la carpeta `backend/` copia el archivo `.env.example` como `.env`:

```bash
cp .env.example .env
```

Asegúrate de que contenga:

```
ORACLE_USER=SANAYA
ORACLE_PASS=123
ORACLE_HOST=localhost
ORACLE_PORT=1521
ORACLE_DB=XEPDB1
```

---

## 6. Verificar tablas

Conéctate como `SANAYA` y ejecuta:

```bash
sudo docker exec -i oracle-xe sqlplus -s SANAYA/123@localhost:1521/XEPDB1 <<< "SELECT table_name FROM user_tables ORDER BY table_name;"
```

Deberías ver las tablas: `CLIENTE`, `COMPRAS`, `DETALLE_COMPRA`, `DETALLE_VENTA`, `INVENTARIO`, `PRODUCTO`, `PROVEEDOR`, `SUMINISTROS`, `USUARIO`, `VENTAS`.

---

## 7. Comandos útiles

### Ver logs de Oracle
```bash
sudo docker compose logs -f oracle-xe
```

### Reiniciar Oracle
```bash
sudo docker compose restart oracle-xe
```

### Recrear el esquema (sin perder el contenedor)
```bash
./setup-user.sh
```

### Resetear completamente Oracle (⚠️ Borra todos los datos)
```bash
sudo docker compose down -v
sudo docker compose up -d
./setup-user.sh
```

---

## 8. Posibles problemas y soluciones

### ❌ Error `ORA-12541: TNS:no listener`
👉 Oracle aún no está completamente listo. Solución:  
- Espera 1-2 minutos y vuelve a ejecutar `./setup-user.sh`
- El script ahora espera automáticamente

### ❌ Error al ejecutar `setup-user.sh`
👉 Verifica que el contenedor esté corriendo:
```bash
sudo docker compose ps
```

### ❌ Conflicto de nombre de contenedor
👉 Otro contenedor usa el nombre `oracle-xe`. Solución:  
```bash
sudo docker rm -f oracle-xe
```

### ❌ El script no tiene permisos de ejecución
👉 Solución:
```bash
chmod +x setup-user.sh
```

### ❌ Persisten errores aunque elimines el contenedor
👉 Probablemente el volumen guardó datos antiguos. Solución:  
```bash
sudo docker compose down -v
sudo docker compose up -d
./setup-user.sh
```

---

## 🚀 Inicio Rápido (Resumen)

```bash
# 1. Levantar Oracle
cd backend
sudo docker compose up -d

# 2. Configurar usuario y esquema (espera automáticamente a que Oracle esté listo)
./setup-user.sh

# 3. ¡Listo! Ahora puedes conectarte
sudo docker exec -it oracle-xe sqlplus SANAYA/123@localhost:1521/XEPDB1
```

---

✅ Ahora tienes un entorno de Oracle XE completamente automatizado con el script `setup-user.sh`.

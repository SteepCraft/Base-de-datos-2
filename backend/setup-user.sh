#!/bin/bash

# Script para configurar Oracle XE completamente
# - Crea el usuario SANAYA
# - Copia y ejecuta el archivo sanaya.sql
# Ejecutar con: ./setup-user.sh

set -e  # Detener si hay algún error

echo "================================================"
echo "  Configuración automática de Oracle XE"
echo "================================================"
echo ""

# Verificar que el contenedor esté corriendo
if ! sudo docker ps | grep -q oracle-xe; then
    echo "❌ Error: El contenedor oracle-xe no está corriendo"
    echo "   Ejecuta: sudo docker compose up -d"
    exit 1
fi

# Verificar que existe sanaya.sql
if [ ! -f "sanaya.sql" ]; then
    echo "❌ Error: No se encuentra el archivo sanaya.sql"
    exit 1
fi

echo "⏳ Esperando a que Oracle XE esté completamente listo..."
echo "   (Esto puede tardar 1-2 minutos en el primer inicio)"
echo ""

# Esperar hasta que Oracle esté listo
max_attempts=60
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if sudo docker exec oracle-xe sqlplus -s system/123@localhost:1521/XEPDB1 <<< "SELECT 1 FROM DUAL;" &>/dev/null; then
        echo "✅ Oracle XE está listo!"
        echo ""
        break
    fi
    attempt=$((attempt + 1))
    echo -ne "\r   Intento $attempt/$max_attempts..."
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo ""
    echo "❌ Error: Oracle XE no respondió después de esperar"
    echo "   Revisa los logs con: sudo docker compose logs -f oracle-xe"
    exit 1
fi

echo "📝 Paso 1: Creando usuario SANAYA en XEPDB1..."
echo ""

sudo docker exec -i oracle-xe sqlplus -s system/123@localhost:1521/XEPDB1 <<EOF
SET ECHO OFF
SET FEEDBACK OFF
SET HEADING OFF
ALTER SESSION SET "_ORACLE_SCRIPT"=true;

-- Verificar si el usuario existe y eliminarlo
DECLARE
  user_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM dba_users WHERE username = 'SANAYA';
  IF user_count > 0 THEN
    EXECUTE IMMEDIATE 'DROP USER SANAYA CASCADE';
  END IF;
END;
/

-- Crear el usuario
CREATE USER SANAYA IDENTIFIED BY 123;

-- Otorgar privilegios del sistema (sin usar roles predefinidos que pueden no existir)
GRANT CREATE SESSION TO SANAYA;
GRANT CREATE TABLE TO SANAYA;
GRANT CREATE VIEW TO SANAYA;
GRANT CREATE SEQUENCE TO SANAYA;
GRANT CREATE PROCEDURE TO SANAYA;
GRANT CREATE TRIGGER TO SANAYA;
GRANT CREATE TYPE TO SANAYA;
GRANT CREATE SYNONYM TO SANAYA;
GRANT UNLIMITED TABLESPACE TO SANAYA;

-- Intentar otorgar DBA si existe
BEGIN
  EXECUTE IMMEDIATE 'GRANT DBA TO SANAYA';
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- Ignorar si DBA no existe
END;
/

-- Configurar tablespace
ALTER USER SANAYA DEFAULT TABLESPACE USERS;
ALTER USER SANAYA QUOTA UNLIMITED ON USERS;

-- Confirmar creación
SELECT 'Usuario SANAYA creado exitosamente' FROM DUAL;
EXIT;
EOF

if [ $? -eq 0 ]; then
    echo "✅ Usuario SANAYA creado correctamente"
else
    echo "❌ Error al crear el usuario SANAYA"
    exit 1
fi

echo ""
echo "📦 Paso 2: Copiando sanaya.sql al contenedor..."
echo ""

sudo docker cp sanaya.sql oracle-xe:/tmp/sanaya.sql

if [ $? -eq 0 ]; then
    echo "✅ Archivo copiado correctamente"
else
    echo "❌ Error al copiar el archivo"
    exit 1
fi

echo ""
echo "🚀 Paso 3: Ejecutando sanaya.sql..."
echo ""

sudo docker exec -i oracle-xe sqlplus -s sanaya/123@localhost/XEPDB1 <<EOF
SET ECHO ON
SET FEEDBACK ON
@/tmp/sanaya.sql
EXIT;
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "================================================"
    echo "  ✅ Configuración completada exitosamente!"
    echo "================================================"
    echo ""
    echo "Información de conexión:"
    echo "  Usuario:       SANAYA"
    echo "  Password:      123"
    echo "  Service:       XEPDB1"
    echo "  Host:          localhost"
    echo "  Puerto:        1521"
    echo ""
    echo "Conectar con:"
    echo "  sqlplus SANAYA/123@localhost:1521/XEPDB1"
    echo ""
else
    echo ""
    echo "❌ Error al ejecutar sanaya.sql"
    exit 1
fi

# Sistema de Gestión de Tienda Informática

Sistema completo de gestión para una tienda informática con backend Node.js/Express/Sequelize y frontend React/Vite/TailwindCSS 4.

## 📋 Características

- ✅ **Autenticación de usuarios** con JWT y cookies HttpOnly
- ✅ **Gestión de Clientes**: CRUD completo con búsqueda
- ✅ **Gestión de Productos**: Control de inventario y precios
- ✅ **Gestión de Proveedores**: Administración de proveedores
- ✅ **Gestión de Ventas**: Crear ventas con múltiples productos
- ✅ **Dashboard**: Estadísticas y métricas visuales
- ✅ **Responsive Design**: Funciona en móviles, tablets y desktop

## 🚀 Instalación y Configuración

### Requisitos Previos

- Node.js 18+ y pnpm
- PostgreSQL u Oracle Database
- Puerto 3000 para el backend
- Puerto 5173 para el frontend (Vite dev server)

### Backend

1. **Configurar variables de entorno**

Crea un archivo `.env` en la carpeta `backend/`:

```env
# Base de datos
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=nombre_bd
DB_HOST=localhost
DB_PORT=1521
DB_DIALECT=oracle

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura_cambiala
JWT_EXPIRES_IN=8h

# Cookies
COOKIE_SECURE=false
COOKIE_DOMAIN=localhost

# Server
PORT=3000
NODE_ENV=development
```

2. **Instalar dependencias**

```bash
cd backend
pnpm install
```

3. **Iniciar el servidor**

```bash
pnpm start
# o para desarrollo con hot reload
pnpm run dev
```

El backend estará disponible en `http://localhost:3000`

### Frontend

1. **Configurar variables de entorno**

Crea un archivo `.env` en la carpeta `frontend/`:

```env
VITE_API_URL=http://localhost:3000/api
```

2. **Instalar dependencias**

```bash
cd frontend
pnpm install
```

3. **Iniciar el servidor de desarrollo**

```bash
pnpm dev
```

El frontend estará disponible en `http://localhost:5173`

## 📱 Uso del Sistema

### Login

1. Accede a `http://localhost:5173/login`
2. Usa las credenciales de un usuario registrado en la base de datos
3. El sistema validará el usuario y te redirigirá al dashboard

### Dashboard

El dashboard muestra:
- Cantidad total de clientes, productos, proveedores y ventas
- Productos con bajo stock (menos de 10 unidades)
- Últimas 5 ventas realizadas

### Gestión de Clientes

- **Ver todos**: Lista completa con búsqueda
- **Crear**: Botón "Nuevo Cliente" → Formulario modal
- **Editar**: Click en el icono de lápiz → Formulario modal
- **Eliminar**: Click en el icono de basura → Confirmación

**Campos**:
- Nombres *
- Apellidos *
- Dirección
- Teléfono

### Gestión de Productos

- **Ver todos**: Lista completa con búsqueda
- **Crear**: Botón "Nuevo Producto" → Formulario modal
- **Editar**: Click en el icono de lápiz → Formulario modal
- **Eliminar**: Click en el icono de basura → Confirmación

**Campos**:
- Código * (solo al crear)
- Descripción *
- Precio *
- Stock (número de existencias)

**Indicadores de stock**:
- 🔴 Rojo: < 10 unidades (bajo)
- 🟡 Amarillo: 10-49 unidades (medio)
- 🟢 Verde: ≥ 50 unidades (alto)

### Gestión de Proveedores

- **Ver todos**: Lista completa con búsqueda
- **Crear**: Botón "Nuevo Proveedor" → Formulario modal
- **Editar**: Click en el icono de lápiz → Formulario modal
- **Eliminar**: Click en el icono de basura → Confirmación

**Campos**:
- ID * (solo al crear, máx 10 caracteres)
- Nombres *
- Apellidos *
- Dirección *
- Provincia *
- Teléfono *

### Gestión de Ventas

- **Ver todas**: Lista completa con búsqueda por código o cliente
- **Crear**: Botón "Nueva Venta" → Formulario modal avanzado
- **Ver detalles**: Click en el icono de ojo → Modal con productos vendidos

**Proceso de creación**:
1. Ingresar código de venta
2. Seleccionar cliente
3. Agregar productos:
   - Seleccionar producto del dropdown
   - Ingresar cantidad
   - El precio se autocompleta
   - Click en "+" para agregar
4. Revisar la tabla de productos agregados
5. Ver el total calculado automáticamente
6. Click en "Crear Venta"

## 🏗️ Estructura del Proyecto

```
bd1/
├── backend/
│   ├── src/
│   │   ├── auth/              # Autenticación y middleware
│   │   ├── config/            # Configuración de DB
│   │   ├── controllers/       # Lógica de negocio
│   │   ├── models/            # Modelos Sequelize
│   │   ├── routes/            # Rutas Express
│   │   └── tools/             # Utilidades
│   ├── app.js                 # Configuración Express
│   ├── server.js              # Servidor HTTP
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/        # Componentes reutilizables
    │   │   ├── Layout.jsx     # Layout con sidebar
    │   │   └── ProtectedRoute.jsx
    │   ├── config/            # Configuración API
    │   ├── context/           # Context API (Auth)
    │   ├── pages/             # Páginas principales
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Clientes.jsx
    │   │   ├── Productos.jsx
    │   │   ├── Proveedores.jsx
    │   │   └── Ventas.jsx
    │   ├── App.jsx            # Router y providers
    │   ├── main.jsx           # Entry point
    │   └── index.css          # Estilos globales
    └── package.json
```

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **Sequelize** - ORM para base de datos
- **JWT** - Autenticación con tokens
- **bcryptjs** - Hash de contraseñas
- **cookie-parser** - Manejo de cookies
- **dotenv** - Variables de entorno

### Frontend
- **React 19** - Librería UI
- **Vite** - Build tool y dev server
- **TailwindCSS 4** - Framework CSS
- **React Router DOM** - Enrutamiento
- **TanStack Query** - Gestión de estado del servidor
- **Axios** - Cliente HTTP
- **React Icons** - Iconos

## 🔒 Seguridad

- ✅ Autenticación JWT con cookies HttpOnly
- ✅ Validación de datos en backend
- ✅ Rate limiting para prevenir ataques
- ✅ CORS configurado correctamente
- ✅ Variables de entorno para secretos

## 📝 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Obtener usuario actual

### Clientes
- `GET /api/cliente` - Listar todos
- `GET /api/cliente/:id` - Obtener uno
- `POST /api/cliente` - Crear
- `PUT /api/cliente/:id` - Actualizar
- `DELETE /api/cliente/:id` - Eliminar

### Productos
- `GET /api/producto` - Listar todos
- `GET /api/producto/:id` - Obtener uno
- `POST /api/producto` - Crear
- `PUT /api/producto/:id` - Actualizar
- `DELETE /api/producto/:id` - Eliminar

### Proveedores
- `GET /api/proveedor` - Listar todos
- `GET /api/proveedor/:id` - Obtener uno
- `POST /api/proveedor` - Crear
- `PUT /api/proveedor/:id` - Actualizar
- `DELETE /api/proveedor/:id` - Eliminar

### Ventas
- `GET /api/venta` - Listar todas
- `GET /api/venta/:id` - Obtener una
- `POST /api/venta` - Crear

### Detalles de Venta
- `GET /api/detalle-venta` - Listar todos
- `POST /api/detalle-venta` - Crear

## 🎨 Características de UI/UX

- **Diseño Responsivo**: Funciona perfectamente en móvil, tablet y desktop
- **Sidebar Colapsable**: En móvil se muestra como menú hamburguesa
- **Modales Intuitivos**: Formularios en modales con validación
- **Búsqueda en Tiempo Real**: Filtros instantáneos en todas las listas
- **Feedback Visual**: Loading states, confirmaciones y mensajes de error
- **Indicadores de Estado**: Colores para identificar stock bajo/medio/alto
- **Navegación Clara**: Breadcrumbs y menú lateral destacando sección activa

## 🐛 Solución de Problemas

### Error de conexión a la base de datos
- Verifica que las credenciales en `.env` sean correctas
- Asegúrate de que el servicio de base de datos esté corriendo
- Verifica que el puerto esté abierto

### Error 401 en las peticiones
- El token puede haber expirado, cierra sesión y vuelve a iniciar
- Verifica que `JWT_SECRET` sea el mismo en desarrollo y producción

### Las vistas no cargan
- Verifica que el backend esté corriendo en el puerto correcto
- Revisa la consola del navegador para errores
- Asegúrate de que `VITE_API_URL` apunte al backend correcto

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👥 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría realizar.

---

**Desarrollado con ❤️ para la gestión eficiente de tiendas informáticas**

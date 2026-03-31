# NotiCrack — Backend

API REST para el portal de noticias NotiCrack (Cusco, Perú).

---

## Requisitos previos

- Node.js 18 o superior
- PostgreSQL 14 o superior
- npm 9 o superior

---

## 1. Instalar PostgreSQL en Windows

1. Descarga el instalador desde **https://www.postgresql.org/download/windows/**
2. Ejecuta el instalador y sigue los pasos:
   - Componentes: deja todos marcados (PostgreSQL Server, pgAdmin, Stack Builder, Command Line Tools)
   - Directorio de datos: deja el predeterminado
   - **Password del superusuario**: elige una contraseña y anótala (ej. `postgres`)
   - **Port**: deja `5432`
   - Locale: deja el predeterminado
3. Al terminar, **no** es necesario ejecutar Stack Builder — puedes cancelarlo.

---

## 2. Crear la base de datos

**Opción A — pgAdmin (interfaz gráfica):**

1. Abre **pgAdmin 4** desde el menú Inicio
2. Expande `Servers → PostgreSQL → Databases`
3. Clic derecho en `Databases` → **Create → Database**
4. Name: `noticrack` → Save

**Opción B — psql (línea de comandos):**

```cmd
psql -U postgres -c "CREATE DATABASE noticrack;"
```

---

## 3. Configurar variables de entorno

```cmd
cd C:\dev\noticrack\backend
copy .env.example .env
```

Abre `.env` con el Bloc de Notas y completa:

```env
PORT=4000
DATABASE_URL=postgresql://postgres:TU_PASSWORD@localhost:5432/noticrack
JWT_SECRET=noticrack_secret_key_2024
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

Reemplaza `TU_PASSWORD` con la contraseña que pusiste al instalar PostgreSQL.

> **Cloudinary** es para subir imágenes. Crea una cuenta gratuita en
> https://cloudinary.com y copia las credenciales del Dashboard.

---

## 4. Instalar dependencias

```cmd
cd C:\dev\noticrack\backend
npm install
```

---

## 5. Inicializar la base de datos

```cmd
npm run db:init
```

Si todo sale bien verás:

```
✅ Conectado a PostgreSQL
✅ Tablas creadas correctamente
✅ Datos iniciales insertados
🎉 Base de datos NotiCrack lista
```

Esto crea las tablas `usuarios`, `categorias`, `noticias`, `videos` y
`radio_programas`, e inserta los datos de ejemplo.

---

## 6. Iniciar el servidor

```cmd
# Modo desarrollo (con auto-reload)
npm run dev

# Modo producción
npm start
```

El servidor queda disponible en **http://localhost:4000**

---

## Endpoints principales

| Método | Ruta                        | Descripción                    |
|--------|-----------------------------|--------------------------------|
| GET    | /api/health                 | Estado del servidor            |
| POST   | /api/auth/login             | Login → devuelve JWT           |
| GET    | /api/noticias               | Listar noticias publicadas     |
| GET    | /api/noticias/:slug         | Noticia por slug               |
| POST   | /api/noticias               | Crear noticia (requiere JWT)   |
| PUT    | /api/noticias/:id           | Editar noticia (requiere JWT)  |
| DELETE | /api/noticias/:id           | Eliminar noticia (requiere JWT)|
| POST   | /api/upload/imagen          | Subir imagen a Cloudinary      |

---

## Credenciales de ejemplo

Creadas por `npm run db:init`:

| Email                  | Password    | Rol         |
|------------------------|-------------|-------------|
| admin@noticrack.pe     | Admin2024!  | admin       |
| marco@noticrack.pe     | Marco2024!  | periodista  |

> ⚠️ Cambia estas contraseñas antes de pasar a producción.

---

## Estructura del proyecto

```
backend/
├── src/
│   ├── app.js                  # Punto de entrada Express
│   ├── config/
│   │   ├── database.js         # Pool de conexión pg
│   │   ├── schema.sql          # DDL + datos iniciales
│   │   └── init-db.js          # Script de inicialización
│   ├── routes/
│   │   ├── auth.js             # Login / registro
│   │   ├── noticias.js         # CRUD noticias
│   │   └── upload.js           # Subida Cloudinary
│   ├── models/
│   │   ├── Noticia.js
│   │   └── Usuario.js
│   └── middleware/
│       └── auth.js             # Verificación JWT
├── .env                        # Variables de entorno (no subir a git)
├── .env.example                # Plantilla de variables
└── package.json
```

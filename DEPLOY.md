# NotiCrack — Guía de Deploy (Windows)

Servicios gratuitos: **Neon** (DB) · **Cloudinary** (imágenes) · **Railway** (backend) · **Vercel** (frontend)

---

## PASO 1 — BASE DE DATOS EN NEON

1. Ir a **https://neon.tech** → Sign up con Google
2. Crear proyecto → nombre: `noticrack` → región: `US East (Virginia)`
3. En el dashboard copiar el **Connection string**:
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/noticrack?sslmode=require
   ```
4. Guardar ese valor → se usará como `DATABASE_URL`

---

## PASO 2 — IMÁGENES EN CLOUDINARY

1. Ir a **https://cloudinary.com** → Sign up gratis
2. Dashboard → copiar los 3 valores:
   - **Cloud Name** (ej: `dxyz123`)
   - **API Key** (ej: `123456789012345`)
   - **API Secret** (ej: `abcDEFghiJKL...`)
3. Guardar los 3 para el siguiente paso

---

## PASO 3 — BACKEND EN RAILWAY

1. Ir a **https://railway.app** → Login con GitHub
2. **New Project** → Deploy from GitHub repo → seleccionar tu repo
3. Railway detecta la carpeta `backend/` con el `Procfile`
4. En la pestaña **Variables** agregar:

   | Variable                  | Valor                                         |
   |---------------------------|-----------------------------------------------|
   | `DATABASE_URL`            | El connection string de Neon                  |
   | `JWT_SECRET`              | `noticrack_prod_secret_2024`                  |
   | `CLOUDINARY_CLOUD_NAME`   | Tu cloud name de Cloudinary                   |
   | `CLOUDINARY_API_KEY`      | Tu API key de Cloudinary                      |
   | `CLOUDINARY_API_SECRET`   | Tu API secret de Cloudinary                   |
   | `PORT`                    | `4000`                                        |
   | `FRONTEND_URL`            | *(dejar vacío por ahora, agregar en Paso 4b)* |

5. Railway despliega y entrega una URL pública:
   ```
   https://noticrack-backend-production.up.railway.app
   ```
6. Verificar: abrir esa URL en el navegador → debe mostrar:
   ```json
   { "mensaje": "NotiCrack API v1.0 ✅", "timestamp": "..." }
   ```

---

## PASO 4 — FRONTEND EN VERCEL

**4a. Deploy inicial**

1. Ir a **https://vercel.com** → Login con GitHub
2. **Add New Project** → importar el repositorio
3. En **Root Directory** escribir: `frontend`
4. En **Environment Variables** agregar:

   | Variable               | Valor                                                       |
   |------------------------|-------------------------------------------------------------|
   | `NEXT_PUBLIC_API_URL`  | `https://noticrack-backend-production.up.railway.app/api`  |

5. Click **Deploy** → Vercel entrega la URL:
   ```
   https://noticrack.vercel.app
   ```

**4b. Conectar CORS — volver a Railway**

1. En Railway → pestaña Variables → agregar:
   ```
   FRONTEND_URL = https://noticrack.vercel.app
   ```
2. Railway redespliega automáticamente

---

## PASO 5 — INICIALIZAR LA BASE DE DATOS EN PRODUCCIÓN

En la máquina local, editar `backend/.env`:
```
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/noticrack?sslmode=require
```

Luego ejecutar:
```bash
cd backend
npm run db:init
```

Esto crea todas las tablas y los datos iniciales (categorías, usuario admin) en Neon.

> **Credenciales iniciales del admin:**
> - Email: `admin@noticrack.pe`
> - Password: `admin123`
> - **Cambiar la contraseña inmediatamente desde el panel**

---

## PASO 6 — VERIFICAR QUE TODO FUNCIONA

| Verificación | URL | Resultado esperado |
|---|---|---|
| API health | `https://noticrack-backend-production.up.railway.app` | `{"mensaje":"NotiCrack API v1.0 ✅"}` |
| Frontend | `https://noticrack.vercel.app` | Carga la página de noticias |
| Admin local | `http://localhost:3001` | Login con admin@noticrack.pe |
| Publicar noticia | Crear noticia en admin → ver en Vercel | Aparece en portada |

---

## VARIABLES DE ENTORNO — RESUMEN COMPLETO

### backend/.env (local)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=noticrack_dev_secret
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
PORT=4000
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
```

### frontend/.env.local (local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SITE_NAME=NotiCrack
```

---

## COSTOS ESTIMADOS

| Servicio    | Plan gratuito                         |
|-------------|---------------------------------------|
| Neon        | 512 MB PostgreSQL, gratis para siempre|
| Cloudinary  | 25 GB almacenamiento + 25 GB ancho    |
| Railway     | $5 crédito mensual (~500 horas)       |
| Vercel      | Ilimitado para proyectos personales   |

Para un portal de noticias pequeño/mediano el costo mensual es **$0**.

---

## SOLUCIÓN DE PROBLEMAS COMUNES

**Error CORS en producción**
→ Verificar que `FRONTEND_URL` en Railway tenga la URL exacta de Vercel (sin `/` al final)

**Build de Vercel falla — módulo no encontrado**
→ Verificar que `package.json` del frontend tenga todas las dependencias en `dependencies`, no en `devDependencies`

**Railway dice "Application failed to respond"**
→ Revisar que `PORT=4000` esté en las variables y que el health check path `/` retorne 200

**Imágenes no cargan**
→ Verificar que `next.config.js` tenga `res.cloudinary.com` en `remotePatterns`

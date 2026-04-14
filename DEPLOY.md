# DEPLOY — NotiCrack

Arquitectura híbrida:
- **Frontend** → HTML estático en cPanel (noticrack.com)
- **Backend**  → Railway (gratis)
- **Base de datos** → Neon (gratis)
- **Admin** → Netlify (gratis)

---

## PASO 1 — BASE DE DATOS EN NEON

- Entrar a [neon.tech](https://neon.tech) y crear cuenta gratis
- Crear proyecto llamado `noticrack`
- Copiar el connection string
- Ejecutar localmente:
  ```
  cd backend
  ```
- Poner el connection string en `.env` como `DATABASE_URL`
- Ejecutar:
  ```
  npm run db:init
  ```

---

## PASO 2 — BACKEND EN RAILWAY

- Entrar a [railway.app](https://railway.app) y crear cuenta con GitHub
- **New Project → Deploy from GitHub repo**
- Seleccionar la carpeta `backend/`
- Agregar estas variables de entorno:
  ```
  DATABASE_URL          = connection string de Neon
  JWT_SECRET            = noticrack_prod_2024
  CLOUDINARY_CLOUD_NAME = el tuyo
  CLOUDINARY_API_KEY    = el tuyo
  CLOUDINARY_API_SECRET = el tuyo
  FRONTEND_URL          = https://www.noticrack.com
  PORT                  = 4000
  ```
- Railway da URL tipo: `https://noticrack-backend.railway.app`
- Copiar esa URL

---

## PASO 3 — ADMIN EN NETLIFY

- Entrar a [netlify.com](https://netlify.com) y crear cuenta gratis
- **New Site → Deploy from GitHub**
- Seleccionar carpeta `admin/`
- Build command: `npm run build`
- Publish directory: `dist`
- Variable de entorno:
  ```
  VITE_API_URL = https://noticrack-backend.railway.app/api
  ```
- Netlify da URL privada solo para el admin

---

## PASO 4 — BUILD DEL FRONTEND

- Editar `frontend/.env.local`:
  ```
  NEXT_PUBLIC_API_URL=https://noticrack-backend.railway.app/api
  ```
- Ejecutar:
  ```
  build-deploy.bat
  ```
- Se genera la carpeta `frontend/out/`

---

## PASO 5 — SUBIR AL CPANEL CON FILEZILLA

- Descargar FileZilla de [filezilla-project.org](https://filezilla-project.org)
- Configurar:
  ```
  Host:       198.58.106.39
  Usuario:    noticrac
  Contraseña: 1UA432ohip
  Puerto:     21
  ```
- Conectar
- Panel derecho: ir a `public_html/`
- Borrar el `index.html` que viene por defecto
- Panel izquierdo: ir a `C:\dev\noticrack\frontend\out\`
- Seleccionar todo y arrastrar a `public_html/`
- Esperar que termine
- Visitar: `https://198.58.106.39/~noticrac/`

---

## PASO 6 — CUANDO PROPAGUE EL DOMINIO (24-48 horas)

- La web estará en: `https://www.noticrack.com`
- Actualizar `FRONTEND_URL` en Railway
- Actualizar `VITE_API_URL` en Netlify si es necesario

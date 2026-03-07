# Guía de Despliegue - BBVServMant (PPE Tracker)

Esta guía detalla los pasos necesarios para configurar y poner en marcha el proyecto en un nuevo servidor.

## Requisitos Previos

- **Node.js**: Versión 18 o superior.
- **PostgreSQL**: Base de datos relacional.
- **npm**: Gestor de paquetes de Node.js.

---

## 1. Preparación de la Base de Datos

1. Asegúrate de tener una instancia de **PostgreSQL** corriendo.
2. Crea una base de datos vacía (ej. `ppe_tracking`).

---

## 2. Configuración del Backend

1. Navega a la carpeta del backend:
   ```bash
   cd backend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura las variables de entorno:
   - Copia el archivo `.env.example` a `.env`.
   - Edita `.env` con las credenciales de tu base de datos y una clave secreta para JWT.
   ```env
   DATABASE_URL="postgresql://usuario:password@localhost:5432/ppe_tracking?schema=public"
   JWT_SECRET="tu-clave-secreta-aqui"
   PORT=3001
   ```
4. Genera el cliente de Prisma y aplica las migraciones:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```
5. Poblar la base de datos con datos iniciales (Admin por defecto):
   ```bash
   npx prisma db seed
   ```
6. Compila el proyecto:
   ```bash
   npm run build
   ```
7. Inicia el servidor en producción:
   ```bash
   npm start
   ```

---

## 3. Configuración del Frontend

1. Navega a la carpeta del frontend:
   ```bash
   cd ../frontend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura la URL de la API:
   - Crea un archivo `.env` basado en `.env.example`.
   - Asegúrate de que `VITE_API_URL` apunte a la dirección IP o dominio de tu servidor backend.
   ```env
   VITE_API_URL=http://tu-servidor:3001/api
   ```
4. Compila el proyecto para producción:
   ```bash
   npm run build
   ```
5. Despliega la carpeta `dist`:
   - El resultado de `npm run build` es una carpeta `dist`. Puedes servir estos archivos estáticos usando Nginx, Apache o cualquier hosting de estáticos (como Vercel o Netlify).

### Ejemplo de configuración Nginx básica:
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        root /ruta/al/proyecto/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Estructura de Credenciales por Defecto (Tras ejecutar Seed)

Tras ejecutar el comando de `seed`, el sistema contará con los siguientes usuarios:

- **Admin**: `admin@test.com` / `password123`
- **Logística**: `logistica@test.com` / `password123`
- **Empresa Externa**: `empresa@test.com` / `password123`
- **Solicitante**: `bombero@test.com` / `password123`

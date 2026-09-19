# Frontend - The Block Barber

Web de reservas para The Block Barber, hecha con React + Vite.

## Instalación local

```bash
npm install
cp .env.example .env
# edita .env con la URL de tu backend desplegado en Render
npm run dev
```

## Convertir tu primer cliente en administrador

1. Regístrate normalmente desde la web (`/registro`)
2. Entra a MongoDB Atlas → colección `users` → busca tu usuario
3. Cambia el campo `role` de `"client"` a `"admin"`
4. Vuelve a iniciar sesión en la web — ahora verás el enlace "Panel"

## Cargar tus servicios y precios reales

En el backend, corre una vez:

```bash
node seed.js
```

Esto carga automáticamente todos tus artículos actuales (cortes, combos, productos) con sus precios reales. Después puedes seguir agregando o eliminando artículos desde el panel de admin.

## Despliegue en Render

1. Sube este código a un repositorio de GitHub (puede ser el mismo repo que el backend, en una carpeta `frontend/`, o uno aparte)
2. En https://dashboard.render.com/ → "New" → "Static Site"
3. Conecta tu repositorio
4. Build command: `npm install && npm run build`
5. Publish directory: `dist`
6. En "Environment", agrega `VITE_API_URL` con la URL pública de tu backend (ej. `https://tu-backend.onrender.com/api`)
7. Deploy — Render te dará la URL pública de tu web

## Estructura

- `src/pages/` — páginas para clientes (inicio, login, registro, reservar, mis citas)
- `src/pages/admin/` — panel de administración (citas, barberos, artículos)
- `src/api.js` — todas las llamadas al backend en un solo lugar
- `src/context/AuthContext.jsx` — maneja la sesión del usuario
- `public/logo.png` — tu logo


## Horario conservado
El diseño se ajustó sin cambiar el horario configurado actualmente en el frontend: lunes a sábado de 11:00 AM a 8:00 PM y domingo de 11:00 AM a 4:00 PM.

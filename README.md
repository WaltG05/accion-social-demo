# Acción Social — Demo con datos ficticios

Recreación, con fines de portfolio, de un **sistema web de gestión de incidencias sociales** desarrollado en equipo (4 personas) durante una práctica, entre septiembre y noviembre de 2025.

> **Todos los datos son inventados.** Los nombres, contactos, direcciones y casos no corresponden a personas reales. Esta demo no contiene información del cliente ni de la ciudadanía.

## Qué es
El sistema original permite registrar, clasificar y seguir incidencias sociales: quién las reporta, categoría, prioridad, ubicación en un mapa, estado y estadísticas. Esta versión reproduce esas pantallas sobre datos generados en el navegador.

**Mi parte en el proyecto original:** el backend (modelado de datos en Directus y su API) y el frontend en Vue.js, del que fui autor principal (46 de 111 commits y ~75 % del código).

## Qué incluye (etapas 1 y 2)
- Acceso de demostración (sin contraseñas).
- **Dashboard:** indicadores del mes frente al anterior, incidencias por mes, reparto por categoría y casos recientes.
- **Incidencias:** alta con ubicación en el mapa, listado con búsqueda y filtros, detalle y estadísticas.
- **Personas:** registro con búsqueda y filtro por beneficio, perfil en pasos, alta y edición con comprobante en PDF, y **Familias** (grupos familiares con su vivienda y miembros, y reporte en PDF).
- Botón **Restablecer demo** para volver a los datos iniciales.

Próximas etapas: Viviendas, Programas y beneficios, Reportes en PDF y Administración.

## Cómo funciona
No hay servidor ni base de datos. El proyecto original consulta una API de Directus; aquí `@directus/sdk` se reemplaza (alias en `vite.config.ts`) por un simulador local, `src/mock/sdk.ts`, que responde con el mismo formato sobre datos generados por `src/mock/seed.ts` (con semilla fija) y guardados en `localStorage`. Nada sale del navegador.

## Tecnologías
Vue 3 · Vite · Vue Router · Chart.js · Leaflet · SweetAlert2 · Day.js

## Ejecutarlo
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/
```

## Nota
Proyecto con fines demostrativos. No usar con datos reales.

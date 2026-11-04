# Plataforma para restaurantes

Web fotorrealista, carta digital con pedidos por WhatsApp y panel de administración. Pensada para entregar **una copia por cliente**: cada restaurante tiene su propio proyecto en Vercel y su propia base de datos.

## Qué incluye

**Para el cliente final**
- Web con portada en video, cortometraje en escenas (armado, anatomía, servida), carta destacada, horario y ubicación.
- Carta digital (`/carta`) con categorías, fotos, adiciones con precio, productos agotados, carrito y envío del pedido por WhatsApp.
- QR por mesa (`/carta?mesa=5`): el pedido llega indicando la mesa.
- Horario automático: muestra abierto/cerrado y no deja enviar pedidos fuera de horario.

**Para el dueño del negocio** (`/admin`)
- Resumen: ventas y pedidos del día, ticket promedio, ventas de 14 días, productos más pedidos y más vistos, conversión de visitas a pedidos.
- Pedidos: tablero que se actualiza solo, con estados Nuevo → Preparando → Listo → Entregado (o Cancelado) y aviso sonoro de pedidos nuevos.
- Carta: crear, editar, ordenar y ocultar productos y categorías; subir fotos desde el celular; precios, adiciones, agotado con un toque.
- Web: subir la foto principal, la despiezada y los 4 videos.
- QR: códigos listos para imprimir, uno por mesa.
- Ajustes: nombre, WhatsApp, dirección, color de marca, horario, domicilios (costo y pedido mínimo), número de mesas y textos de la web.

Todos los pedidos quedan guardados en la base de datos. Los precios se recalculan en el servidor, así que nadie puede alterarlos desde el navegador.

## Entregar una copia a un cliente nuevo

1. En Vercel, crea un proyecto nuevo desde este repositorio con **Root Directory** = `plataforma`.
2. En *Storage*, crea una base de datos **Supabase** (plan gratis) y conéctala al proyecto. Vercel agrega `POSTGRES_URL` sola.
3. En *Storage*, crea un **Blob store** y conéctalo. Vercel agrega `BLOB_READ_WRITE_TOKEN`.
4. En *Settings → Environment Variables* agrega `AUTH_SECRET` con un texto largo y aleatorio.
5. Despliega y abre `/admin`. La primera vez pide crear la cuenta del dueño. La carta de ejemplo se carga sola y luego el dueño la reemplaza con la suya.

Las tablas se crean solas en el primer arranque.

## Desarrollo local

```bash
cp .env.example .env.local   # completa DATABASE_URL y AUTH_SECRET
npm install
npm run dev
```

Sin `BLOB_READ_WRITE_TOKEN`, las fotos se guardan en `public/uploads` (solo en local).

## Tecnología

Next.js 14 (App Router), Postgres (`postgres`), Vercel Blob, sesión con JWT firmado (`jose`) y contraseñas con `bcryptjs`.

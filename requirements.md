# Requerimientos del Sistema: Delivery Chachapoyas

## 1. Stack Técnico
- Frontend: Next.js (App Router), Tailwind CSS (Compilación Estática para S3/CloudFront).
- Backend: AWS Lambda (Node.js/TypeScript).
- Base de Datos: Amazon DynamoDB.

## 2. Reglas de Negocio
- Cálculo de envío por Zonas de Chachapoyas (Centro, Tingo, Luya Urco, Higos Urco, etc.). Sin mapas/GPS.
- Confirmación de pedido guarda en DynamoDB y redirige a la API de WhatsApp con el texto formateado para el motorizado.
- Métodos de pago: Efectivo o Yape/Plin (con Modal de QR estático).
- Promoción: Primer envío gratis si la compra es mayor a S/. 20.00.

## 3. Estructura de Datos (DynamoDB)
- `restaurantes`: id, nombre, categoria, logo_url, activo
- `productos`: id, restaurante_id, nombre, descripcion, precio, disponible
- `pedidos`: id, cliente_telefono, detalle, total, zona_id, estado
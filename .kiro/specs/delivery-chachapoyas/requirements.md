# Requirements: MVP Delivery Hiper-Local — Chachapoyas

## 1. Introducción

### 1.1 Propósito
Plataforma web de delivery hiper-local para la ciudad de Chachapoyas (Amazonas, Perú). El MVP permite a clientes explorar restaurantes, armar un carrito y confirmar un pedido que se comunica al negocio vía WhatsApp. No requiere app móvil ni GPS.

### 1.2 Alcance del MVP
- Catálogo público de restaurantes y productos.
- Carrito de compras con cálculo de costo de envío por zonas geográficas fijas.
- Flujo de confirmación de pedido → registro en DynamoDB → redirección a WhatsApp.
- Pago en efectivo o Yape/Plin (QR estático).
- Promoción de lanzamiento: primer envío gratis.

---

## 2. Requisitos Funcionales

### RF-01 · Listado de Restaurantes
- El sistema DEBE mostrar la lista de restaurantes activos (`activo = true`).
- Cada tarjeta muestra: logo, nombre, categoría y tiempo estimado de entrega.
- Los restaurantes se filtran por categoría (Pollerías, Menús, Pizzas, Jugos, etc.).
- Los restaurantes inactivos NO deben mostrarse al cliente.

### RF-02 · Catálogo de Productos
- Al seleccionar un restaurante, se muestra su menú agrupado por categoría de producto.
- Cada producto muestra: nombre, descripción, precio en soles (S/.).
- Los productos con `disponible = false` se muestran deshabilitados (sin botón "Agregar").

### RF-03 · Carrito de Compras
- El cliente puede agregar, incrementar, decrementar y eliminar productos del carrito.
- El carrito persiste en `localStorage` para no perderse si el usuario recarga la página.
- El resumen del carrito muestra: lista de ítems, subtotal, costo de envío y total final.
- Un icono flotante muestra la cantidad de ítems en el carrito en todo momento.

### RF-04 · Selección de Zona de Envío
- El cliente elige su zona de entrega desde una lista desplegable (sin mapa ni GPS).
- Zonas disponibles para Chachapoyas:

| Zona            | Costo de Envío |
|-----------------|---------------|
| Centro          | S/. 2.00      |
| Tingo           | S/. 3.00      |
| Luya Urco       | S/. 3.50      |
| Higos Urco      | S/. 3.50      |
| La Colmena      | S/. 4.00      |
| Shambo          | S/. 4.00      |
| Otro (coordinar)| S/. 0.00 *    |

> *Cuando se selecciona "Otro", el costo aparece como "A coordinar" y el cliente debe especificar su dirección exacta en el campo de texto.

### RF-05 · Formulario de Confirmación de Pedido
El cliente debe completar antes de confirmar:
- **Nombre completo** (texto, obligatorio).
- **Número de teléfono** (numérico, 9 dígitos, obligatorio).
- **Dirección exacta** (texto, obligatorio).
- **Zona de entrega** (desplegable — ver RF-04).
- **Método de pago** (radio button: "Efectivo" | "Yape/Plin").

### RF-06 · Modal de QR para Yape/Plin
- Si el cliente selecciona "Yape/Plin", DEBE mostrarse un modal con:
  - Imagen estática del código QR del negocio.
  - Monto exacto a pagar.
  - Mensaje: "Realiza el pago y adjunta el screenshot en WhatsApp".
- El modal no bloquea la confirmación del pedido.

### RF-07 · Promoción: Primer Envío Gratis
- **Condición**: El subtotal del carrito supera S/. 20.00 Y el número de teléfono del cliente no tiene pedidos previos registrados en DynamoDB.
- **Efecto**: El costo de envío se establece en S/. 0.00 y se muestra el badge "🎉 ¡Primer envío gratis!".
- La verificación se realiza consultando la tabla `pedidos` por `cliente_telefono` antes de mostrar el resumen final.

### RF-08 · Confirmación y Registro del Pedido
Al hacer clic en "Confirmar Pedido":
1. Se validan todos los campos del formulario (RF-05).
2. Se envía una petición `POST` al endpoint Lambda `/pedidos`.
3. Lambda guarda el registro en DynamoDB con el siguiente estado inicial:

```json
{
  "id": "uuid-v4",
  "cliente_nombre": "...",
  "cliente_telefono": "9XXXXXXXX",
  "detalle": [ { "producto_id": "...", "nombre": "...", "cantidad": 2, "precio_unitario": 12.00 } ],
  "subtotal": 24.00,
  "costo_envio": 0.00,
  "total": 24.00,
  "zona_id": "centro",
  "direccion": "Jr. Grau 123",
  "metodo_pago": "yape",
  "estado": "pendiente",
  "created_at": "ISO-8601"
}
```

4. El frontend recibe el `id` del pedido y construye el enlace de WhatsApp.
5. El navegador redirige (o abre en nueva pestaña) a `https://wa.me/<numero_negocio>?text=<mensaje_codificado>`.

### RF-09 · Mensaje de WhatsApp Pre-formateado
El mensaje generado debe tener el siguiente formato:

```
🛵 *NUEVO PEDIDO #[ID_CORTO]*

👤 Cliente: [NOMBRE]
📍 Dirección: [DIRECCIÓN], [ZONA]
📞 Teléfono: [TELÉFONO]

🛒 *Detalle:*
- [CANTIDAD]x [PRODUCTO] — S/. [SUBTOTAL_ITEM]
...
────────────────
Subtotal:   S/. XX.00
Envío:      S/. X.00
*TOTAL:     S/. XX.00*
────────────────
💳 Pago: [EFECTIVO / YAPE-PLIN]
```

---

## 3. Requisitos No Funcionales

### RNF-01 · Rendimiento Móvil
- La página principal debe cargar en menos de 3 segundos en una conexión 3G (Fast 3G ~1.5 Mbps).
- Las imágenes deben estar optimizadas (WebP, lazy loading).
- Next.js debe compilarse en modo `output: 'export'` (Static Site Generation) para servirse desde S3/CloudFront.

### RNF-02 · Diseño Responsive Mobile-First
- El diseño debe estar optimizado para pantallas de 375px a 430px de ancho.
- Los botones de acción (Agregar, Confirmar) deben tener un área táctil mínima de 44x44px.
- No se requiere diseño para Desktop en el MVP, pero no debe romperse.

### RNF-03 · Disponibilidad
- El frontend estático en S3/CloudFront tiene SLA implícito de 99.9%.
- Las funciones Lambda tienen un cold start máximo aceptable de 2 segundos.

### RNF-04 · Seguridad Básica
- Los endpoints Lambda validan el esquema del body con Zod antes de escribir en DynamoDB.
- No se almacenan contraseñas ni datos de tarjetas.
- El número de teléfono del cliente se usa solo para comunicación vía WhatsApp.

### RNF-05 · Internacionalización
- El idioma de la plataforma es **español (Perú)**.
- Los precios se muestran en **Soles (S/.)**.

---

## 4. Entidades de Base de Datos (DynamoDB)

### 4.1 Tabla `restaurantes`
| Atributo        | Tipo    | Descripción                              |
|-----------------|---------|------------------------------------------|
| `id`            | String  | PK — UUID v4                             |
| `nombre`        | String  | Nombre del restaurante                   |
| `categoria`     | String  | Ej: "Pollería", "Menú", "Pizza", "Jugos" |
| `logo_url`      | String  | URL de imagen en S3                      |
| `descripcion`   | String  | Descripción corta                        |
| `telefono_wa`   | String  | Número WhatsApp del negocio (sin +)      |
| `qr_yape_url`   | String  | URL del QR de Yape/Plin en S3            |
| `activo`        | Boolean | Si aparece en el catálogo público        |
| `created_at`    | String  | ISO-8601                                 |

### 4.2 Tabla `productos`
| Atributo         | Tipo    | Descripción                           |
|------------------|---------|---------------------------------------|
| `id`             | String  | PK — UUID v4                          |
| `restaurante_id` | String  | FK → restaurantes.id (GSI)            |
| `nombre`         | String  | Nombre del producto                   |
| `descripcion`    | String  | Descripción del plato                 |
| `precio`         | Number  | Precio en soles (ej: 12.50)           |
| `categoria`      | String  | Categoría interna del menú            |
| `imagen_url`     | String  | URL opcional de imagen del plato      |
| `disponible`     | Boolean | Si puede agregarse al carrito         |

### 4.3 Tabla `pedidos`
| Atributo           | Tipo    | Descripción                                    |
|--------------------|---------|------------------------------------------------|
| `id`               | String  | PK — UUID v4                                   |
| `cliente_nombre`   | String  | Nombre del cliente                             |
| `cliente_telefono` | String  | GSI para verificar primer pedido               |
| `detalle`          | List    | Array de ítems (ver RF-08)                     |
| `subtotal`         | Number  | Suma de ítems sin envío                        |
| `costo_envio`      | Number  | Puede ser 0 si aplica promoción                |
| `total`            | Number  | subtotal + costo_envio                         |
| `zona_id`          | String  | Identificador de zona (ej: "centro")           |
| `direccion`        | String  | Dirección exacta del cliente                   |
| `metodo_pago`      | String  | "efectivo" \| "yape"                           |
| `estado`           | String  | "pendiente" \| "en_camino" \| "entregado"      |
| `restaurante_id`   | String  | FK → restaurantes.id                           |
| `created_at`       | String  | ISO-8601                                       |

### 4.4 Tabla `zonas` (datos estáticos, puede ser JSON en frontend)
| Atributo      | Tipo   | Descripción                            |
|---------------|--------|----------------------------------------|
| `id`          | String | PK — slug (ej: "centro")              |
| `nombre`      | String | Nombre visible (ej: "Centro")          |
| `costo_envio` | Number | Costo en soles                         |

---

## 5. Estructura de Pantallas (User Stories)

| Pantalla                  | Ruta              | Descripción                                            |
|---------------------------|-------------------|--------------------------------------------------------|
| Home / Catálogo           | `/`               | Lista de restaurantes con filtro por categoría         |
| Menú del Restaurante      | `/restaurante/[id]` | Productos agrupados por categoría, botón agregar      |
| Carrito + Checkout        | `/checkout`       | Resumen del pedido, formulario, selección de zona/pago |
| Confirmación / Éxito      | `/pedido/[id]`    | Pantalla de éxito con enlace a WhatsApp                |

---

## 6. Criterios de Aceptación del MVP

- [ ] Un cliente puede navegar el catálogo sin registro previo.
- [ ] El costo de envío cambia dinámicamente al seleccionar la zona.
- [ ] La promoción de primer envío gratis se aplica correctamente según las condiciones.
- [ ] Al confirmar el pedido, el registro aparece en DynamoDB con estado "pendiente".
- [ ] El enlace de WhatsApp abre la app con el mensaje pre-formateado correcto.
- [ ] El modal de QR se muestra al seleccionar Yape/Plin.
- [ ] La app es usable en un móvil Android con conexión 4G sin errores de layout.

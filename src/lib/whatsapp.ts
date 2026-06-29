import type { ItemCarrito, Zona, MetodoPago } from "@/types";

interface DatosMensaje {
  pedidoId: string;
  clienteNombre: string;
  clienteTelefono: string;
  direccion: string;
  zona: Zona;
  items: ItemCarrito[];
  subtotal: number;
  costoEnvio: number;
  total: number;
  metodoPago: MetodoPago;
  telefonoNegocio: string;
}

export function generarEnlaceWhatsApp(datos: DatosMensaje): string {
  const idCorto = datos.pedidoId.slice(-6).toUpperCase();
  const pagoTexto = datos.metodoPago === "yape" ? "YAPE/PLIN" : "EFECTIVO";
  const envioTexto =
    datos.costoEnvio === 0 ? "S/. 0.00 🎉 (1er envío gratis)" : `S/. ${datos.costoEnvio.toFixed(2)}`;

  const lineasDetalle = datos.items
    .map(
      (i) =>
        `- ${i.cantidad}x ${i.producto.nombre} — S/. ${(i.producto.precio * i.cantidad).toFixed(2)}`
    )
    .join("\n");

  const mensaje = `🛵 *NUEVA SOLICITUD DE DELIVERY #${idCorto}*

👤 Cliente: ${datos.clienteNombre}
📍 Dirección: ${datos.direccion}, ${datos.zona.nombre}
📞 Teléfono: ${datos.clienteTelefono}

📦 *Productos para recoger:*
${lineasDetalle}
────────────────
Subtotal:   S/. ${datos.subtotal.toFixed(2)}
Delivery:   ${envioTexto}
*TOTAL:     S/. ${datos.total.toFixed(2)}*
────────────────
💳 Pago: ${pagoTexto}`;

  const encoded = encodeURIComponent(mensaje);
  return `https://wa.me/${datos.telefonoNegocio}?text=${encoded}`;
}

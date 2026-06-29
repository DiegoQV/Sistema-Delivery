// Server Component — sin "use client"
// generateStaticParams es requerido por output: 'export' para rutas dinámicas.

import { PedidoExitoClient } from "./PedidoExitoClient";

/**
 * Con output: 'export', Next.js necesita al menos una entrada en
 * generateStaticParams para generar el directorio estático de la ruta.
 * Usamos un placeholder — el id real lo lee el Client Component
 * desde useParams() en runtime.
 */
export function generateStaticParams() {
  return [{ id: "pedido" }];
}

export default function PedidoExitoPage() {
  return <PedidoExitoClient />;
}

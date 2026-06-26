// ─── Entidades del Dominio ────────────────────────────────────────────────────

export interface Restaurante {
  id: string;
  nombre: string;
  categoria: string;
  logo_url: string;
  descripcion: string;
  telefono_wa: string; // número sin "+" ej: "51987654321"
  qr_yape_url: string;
  activo: boolean;
}

export interface Producto {
  id: string;
  restaurante_id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  imagen_url?: string;
  disponible: boolean;
}

export interface Zona {
  id: string;
  nombre: string;
  costo_envio: number | null; // null = "A coordinar"
}

export type MetodoPago = "efectivo" | "yape";

// ─── Carrito ──────────────────────────────────────────────────────────────────

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

export interface EstadoCarrito {
  restaurante_id: string | null;
  restaurante_nombre: string | null;
  restaurante_telefono_wa: string | null;
  restaurante_qr_yape_url: string | null;
  items: ItemCarrito[];
}

// ─── Pedido ───────────────────────────────────────────────────────────────────

export interface DetalleItem {
  producto_id: string;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
}

export interface Pedido {
  id: string;
  cliente_nombre: string;
  cliente_telefono: string;
  detalle: DetalleItem[];
  subtotal: number;
  costo_envio: number;
  total: number;
  zona_id: string;
  zona_nombre: string;
  direccion: string;
  metodo_pago: MetodoPago;
  estado: "pendiente" | "en_camino" | "entregado";
  restaurante_id: string;
  created_at: string;
}

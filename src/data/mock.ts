/**
 * Datos mock para desarrollo local.
 * En producción estos datos vienen de los endpoints Lambda.
 */
import type { Restaurante, Producto } from "@/types";

export const RESTAURANTES_MOCK: Restaurante[] = [
  {
    id: "rest-001",
    nombre: "Pollería El Chachapoyano",
    categoria: "Pollería",
    logo_url: "/images/placeholder-logo.png",
    descripcion: "El mejor pollo a la brasa de Chachapoyas",
    telefono_wa: "51987654321",
    qr_yape_url: "/images/qr-yape-placeholder.png",
    activo: true,
  },
  {
    id: "rest-002",
    nombre: "Menú Doña Rosa",
    categoria: "Menú",
    logo_url: "/images/placeholder-logo.png",
    descripcion: "Menú del día con sabor casero",
    telefono_wa: "51987654321",
    qr_yape_url: "/images/qr-yape-placeholder.png",
    activo: true,
  },
  {
    id: "rest-003",
    nombre: "Pizza Kuélap",
    categoria: "Pizza",
    logo_url: "/images/placeholder-logo.png",
    descripcion: "Pizzas artesanales con ingredientes locales",
    telefono_wa: "51987654321",
    qr_yape_url: "/images/qr-yape-placeholder.png",
    activo: true,
  },
  {
    id: "rest-004",
    nombre: "Jugos Naturales Kiya",
    categoria: "Jugos",
    logo_url: "/images/placeholder-logo.png",
    descripcion: "Jugos y batidos con frutas amazónicas",
    telefono_wa: "51987654321",
    qr_yape_url: "/images/qr-yape-placeholder.png",
    activo: true,
  },
];

export const PRODUCTOS_MOCK: Producto[] = [
  // Pollería El Chachapoyano
  { id: "p-001", restaurante_id: "rest-001", nombre: "Pollo a la Brasa 1/4", descripcion: "Con papas fritas y ensalada", precio: 18.0, categoria: "Platos", disponible: true },
  { id: "p-002", restaurante_id: "rest-001", nombre: "Pollo a la Brasa 1/2", descripcion: "Con papas fritas y ensalada", precio: 32.0, categoria: "Platos", disponible: true },
  { id: "p-003", restaurante_id: "rest-001", nombre: "Pollo Entero", descripcion: "Con papas fritas, ensalada y cremas", precio: 58.0, categoria: "Platos", disponible: true },
  { id: "p-004", restaurante_id: "rest-001", nombre: "Gaseosa Personal", descripcion: "Inca Kola o Coca Cola", precio: 4.0, categoria: "Bebidas", disponible: true },
  { id: "p-005", restaurante_id: "rest-001", nombre: "Chicha Morada", descripcion: "Jarra 1 litro", precio: 8.0, categoria: "Bebidas", disponible: false },
  // Menú Doña Rosa
  { id: "p-006", restaurante_id: "rest-002", nombre: "Menú del Día", descripcion: "Sopa + segundo + refresco", precio: 12.0, categoria: "Menú", disponible: true },
  { id: "p-007", restaurante_id: "rest-002", nombre: "Caldo de Gallina", descripcion: "Caldo casero con fideos y papa", precio: 10.0, categoria: "Sopas", disponible: true },
  { id: "p-008", restaurante_id: "rest-002", nombre: "Estofado de Pollo", descripcion: "Con arroz y menestra", precio: 14.0, categoria: "Segundos", disponible: true },
  // Pizza Kuélap
  { id: "p-009", restaurante_id: "rest-003", nombre: "Pizza Americana Personal", descripcion: "Jamón, queso, hongos", precio: 22.0, categoria: "Pizzas", disponible: true },
  { id: "p-010", restaurante_id: "rest-003", nombre: "Pizza Familiar Mixta", descripcion: "8 porciones, ingredientes a elección", precio: 45.0, categoria: "Pizzas", disponible: true },
  // Jugos
  { id: "p-011", restaurante_id: "rest-004", nombre: "Jugo de Cocona", descripcion: "Fruta amazónica, vaso grande", precio: 6.0, categoria: "Jugos", disponible: true },
  { id: "p-012", restaurante_id: "rest-004", nombre: "Batido de Aguaje", descripcion: "Con leche, vaso grande", precio: 7.0, categoria: "Batidos", disponible: true },
];

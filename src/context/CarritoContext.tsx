"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import type { EstadoCarrito, ItemCarrito, Producto } from "@/types";

// ─── Estado inicial ────────────────────────────────────────────────────────────

const CARRITO_INICIAL: EstadoCarrito = {
  restaurante_id: null,
  restaurante_nombre: null,
  restaurante_telefono_wa: null,
  restaurante_qr_yape_url: null,
  items: [],
};

// ─── Acciones ─────────────────────────────────────────────────────────────────

type Accion =
  | {
      type: "AGREGAR";
      payload: {
        producto: Producto;
        restaurante_id: string;
        restaurante_nombre: string;
        restaurante_telefono_wa: string;
        restaurante_qr_yape_url: string;
      };
    }
  | { type: "INCREMENTAR"; payload: { producto_id: string } }
  | { type: "DECREMENTAR"; payload: { producto_id: string } }
  | { type: "ELIMINAR"; payload: { producto_id: string } }
  | { type: "VACIAR" }
  | { type: "CARGAR"; payload: EstadoCarrito };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function carritoReducer(estado: EstadoCarrito, accion: Accion): EstadoCarrito {
  switch (accion.type) {
    case "AGREGAR": {
      const { producto, restaurante_id, restaurante_nombre, restaurante_telefono_wa, restaurante_qr_yape_url } = accion.payload;

      // Si el carrito ya tiene ítems de otro restaurante, lo reemplazamos
      const mismoRestaurante = estado.restaurante_id === restaurante_id;
      const itemsBase = mismoRestaurante ? estado.items : [];

      const existe = itemsBase.find((i) => i.producto.id === producto.id);
      const nuevosItems: ItemCarrito[] = existe
        ? itemsBase.map((i) =>
            i.producto.id === producto.id
              ? { ...i, cantidad: i.cantidad + 1 }
              : i
          )
        : [...itemsBase, { producto, cantidad: 1 }];

      return {
        restaurante_id,
        restaurante_nombre,
        restaurante_telefono_wa,
        restaurante_qr_yape_url,
        items: nuevosItems,
      };
    }
    case "INCREMENTAR": {
      return {
        ...estado,
        items: estado.items.map((i) =>
          i.producto.id === accion.payload.producto_id
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        ),
      };
    }
    case "DECREMENTAR": {
      const items = estado.items
        .map((i) =>
          i.producto.id === accion.payload.producto_id
            ? { ...i, cantidad: i.cantidad - 1 }
            : i
        )
        .filter((i) => i.cantidad > 0);
      return {
        ...estado,
        items,
        restaurante_id: items.length === 0 ? null : estado.restaurante_id,
        restaurante_nombre: items.length === 0 ? null : estado.restaurante_nombre,
        restaurante_telefono_wa: items.length === 0 ? null : estado.restaurante_telefono_wa,
        restaurante_qr_yape_url: items.length === 0 ? null : estado.restaurante_qr_yape_url,
      };
    }
    case "ELIMINAR": {
      const items = estado.items.filter(
        (i) => i.producto.id !== accion.payload.producto_id
      );
      return {
        ...estado,
        items,
        restaurante_id: items.length === 0 ? null : estado.restaurante_id,
        restaurante_nombre: items.length === 0 ? null : estado.restaurante_nombre,
        restaurante_telefono_wa: items.length === 0 ? null : estado.restaurante_telefono_wa,
        restaurante_qr_yape_url: items.length === 0 ? null : estado.restaurante_qr_yape_url,
      };
    }
    case "VACIAR":
      return CARRITO_INICIAL;
    case "CARGAR":
      return accion.payload;
    default:
      return estado;
  }
}

// ─── Contexto ─────────────────────────────────────────────────────────────────

interface CarritoContextType {
  carrito: EstadoCarrito;
  totalItems: number;
  subtotal: number;
  agregar: (
    producto: Producto,
    restaurante_id: string,
    restaurante_nombre: string,
    restaurante_telefono_wa: string,
    restaurante_qr_yape_url: string
  ) => void;
  incrementar: (producto_id: string) => void;
  decrementar: (producto_id: string) => void;
  eliminar: (producto_id: string) => void;
  vaciar: () => void;
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CarritoProvider({ children }: { children: ReactNode }) {
  const [carrito, dispatch] = useReducer(carritoReducer, CARRITO_INICIAL);

  // Cargar desde localStorage al montar
  useEffect(() => {
    try {
      const guardado = localStorage.getItem("carrito_chachapoyas");
      if (guardado) {
        dispatch({ type: "CARGAR", payload: JSON.parse(guardado) });
      }
    } catch {
      // localStorage no disponible (SSR o modo privado)
    }
  }, []);

  // Persistir en localStorage en cada cambio
  useEffect(() => {
    try {
      localStorage.setItem("carrito_chachapoyas", JSON.stringify(carrito));
    } catch {
      // silenciar error
    }
  }, [carrito]);

  const totalItems = carrito.items.reduce((acc, i) => acc + i.cantidad, 0);
  const subtotal = carrito.items.reduce(
    (acc, i) => acc + i.producto.precio * i.cantidad,
    0
  );

  const agregar = (
    producto: Producto,
    restaurante_id: string,
    restaurante_nombre: string,
    restaurante_telefono_wa: string,
    restaurante_qr_yape_url: string
  ) =>
    dispatch({
      type: "AGREGAR",
      payload: { producto, restaurante_id, restaurante_nombre, restaurante_telefono_wa, restaurante_qr_yape_url },
    });

  const incrementar = (producto_id: string) =>
    dispatch({ type: "INCREMENTAR", payload: { producto_id } });

  const decrementar = (producto_id: string) =>
    dispatch({ type: "DECREMENTAR", payload: { producto_id } });

  const eliminar = (producto_id: string) =>
    dispatch({ type: "ELIMINAR", payload: { producto_id } });

  const vaciar = () => dispatch({ type: "VACIAR" });

  return (
    <CarritoContext.Provider
      value={{ carrito, totalItems, subtotal, agregar, incrementar, decrementar, eliminar, vaciar }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  const ctx = useContext(CarritoContext);
  if (!ctx) throw new Error("useCarrito debe usarse dentro de <CarritoProvider>");
  return ctx;
}

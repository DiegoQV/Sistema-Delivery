"use client";

import { use, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { RESTAURANTES_MOCK, PRODUCTOS_MOCK } from "@/data/mock";
import { useCarrito } from "@/context/CarritoContext";
import { BotonCarritoFlotante } from "@/components/BotonCarritoFlotante";
import type { Producto } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * Con output: 'export', generamos una ruta estática por cada restaurante
 * conocido en build time. En producción, reemplazar RESTAURANTES_MOCK
 * por una llamada a la API de DynamoDB durante el build.
 */
export function generateStaticParams() {
  return RESTAURANTES_MOCK.map((r) => ({ id: r.id }));
}

const CATEGORIA_CONFIG: Record<string, { bg: string; text: string }> = {
  Pollería: { bg: "bg-amber-50",   text: "text-amber-700"  },
  Menú:     { bg: "bg-green-50",   text: "text-green-700"  },
  Pizza:    { bg: "bg-red-50",     text: "text-red-700"    },
  Jugos:    { bg: "bg-cyan-50",    text: "text-cyan-700"   },
};

export default function RestaurantePage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { carrito, agregar, incrementar, decrementar } = useCarrito();

  const restaurante = RESTAURANTES_MOCK.find((r) => r.id === id);
  const config = CATEGORIA_CONFIG[restaurante?.categoria ?? ""] ?? { bg: "bg-orange-50", text: "text-orange-700" };

  const productos = useMemo(
    () => PRODUCTOS_MOCK.filter((p) => p.restaurante_id === id),
    [id]
  );

  const productosPorCategoria = useMemo(() => {
    const mapa = new Map<string, Producto[]>();
    productos.forEach((p) => {
      const lista = mapa.get(p.categoria) ?? [];
      lista.push(p);
      mapa.set(p.categoria, lista);
    });
    return mapa;
  }, [productos]);

  if (!restaurante) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mb-4 text-4xl">🤔</div>
        <p className="text-stone-700 font-semibold">Restaurante no encontrado</p>
        <button onClick={() => router.push("/")}
          className="mt-4 bg-orange-500 text-white font-bold px-5 py-2.5 rounded-full text-sm">
          Volver al inicio
        </button>
      </div>
    );
  }

  const getCantidad = (producto_id: string) =>
    carrito.items.find((i) => i.producto.id === producto_id)?.cantidad ?? 0;

  const hayItemsDeOtroRestaurante =
    carrito.restaurante_id !== null && carrito.restaurante_id !== id;

  return (
    <div className="flex flex-col min-h-screen pb-32 bg-white">

      {/* ── Header hero ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center
                       hover:bg-stone-200 active:bg-stone-300 transition-colors shrink-0"
            aria-label="Volver"
          >
            <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Logo pequeño en header */}
          <div className={`relative w-9 h-9 rounded-xl overflow-hidden ${config.bg} shrink-0 ring-1 ring-black/5`}>
            <Image src={restaurante.logo_url} alt="" fill className="object-cover" sizes="36px" />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-stone-900 text-sm leading-tight truncate">
              {restaurante.nombre}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              <span className="text-[11px] text-green-600 font-medium">Abierto ahora</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Banner del restaurante ───────────────────────────────────────── */}
      <div className={`${config.bg} px-4 py-5 border-b border-stone-100`}>
        <div className="flex items-center gap-4">
          <div className={`relative w-20 h-20 rounded-2xl overflow-hidden ${config.bg}
                           ring-2 ring-white shadow-md shrink-0`}>
            <Image
              src={restaurante.logo_url}
              alt={`Logo de ${restaurante.nombre}`}
              fill className="object-cover" sizes="80px"
            />
          </div>
          <div className="flex-1">
            <h2 className="font-extrabold text-stone-900 text-base leading-tight">
              {restaurante.nombre}
            </h2>
            <p className="text-stone-500 text-xs mt-1 leading-relaxed">{restaurante.descripcion}</p>
            <span className={`inline-flex items-center gap-1 mt-2 text-[11px] font-semibold
                              px-2.5 py-0.5 rounded-full bg-white/80 ${config.text}`}>
              {restaurante.categoria}
            </span>
          </div>
        </div>
      </div>

      {/* Aviso otro restaurante */}
      {hayItemsDeOtroRestaurante && (
        <div className="mx-4 mt-3 bg-amber-50 border border-amber-200 rounded-2xl p-3
                        flex items-start gap-2 text-xs text-amber-700">
          <span className="text-base shrink-0">⚠️</span>
          <p>
            Tienes productos de <strong>{carrito.restaurante_nombre}</strong> en tu carrito.
            Al agregar aquí se vaciará el carrito anterior.
          </p>
        </div>
      )}

      {/* ── Menú ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 px-4 py-5">
        {Array.from(productosPorCategoria.entries()).map(([categoria, prods]) => (
          <section key={categoria} className="mb-7">
            {/* Encabezado de categoría */}
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-stone-100" />
              <span className="text-xs font-bold text-stone-500 uppercase tracking-widest px-2">
                {categoria}
              </span>
              <div className="h-px flex-1 bg-stone-100" />
            </div>

            <div className="flex flex-col gap-3">
              {prods.map((producto) => {
                const cantidad = getCantidad(producto.id);
                return (
                  <TarjetaProducto
                    key={producto.id}
                    producto={producto}
                    cantidad={cantidad}
                    onAgregar={() => agregar(producto, restaurante.id, restaurante.nombre, restaurante.telefono_wa, restaurante.qr_yape_url)}
                    onIncrementar={() => incrementar(producto.id)}
                    onDecrementar={() => decrementar(producto.id)}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </main>

      <BotonCarritoFlotante />
    </div>
  );
}

// ── Tarjeta Producto ──────────────────────────────────────────────────────────

interface TarjetaProductoProps {
  producto: Producto;
  cantidad: number;
  onAgregar: () => void;
  onIncrementar: () => void;
  onDecrementar: () => void;
}

function TarjetaProducto({ producto, cantidad, onAgregar, onIncrementar, onDecrementar }: TarjetaProductoProps) {
  const enCarrito = cantidad > 0;

  return (
    <div className={`relative bg-white rounded-2xl border transition-all duration-200
                     ${enCarrito
                       ? "border-orange-200 shadow-md shadow-orange-50"
                       : "border-stone-100 shadow-sm"
                     }
                     ${!producto.disponible ? "opacity-60" : ""}`}>

      {/* Badge "en carrito" */}
      {enCarrito && (
        <div className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[10px]
                         font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
          {cantidad}
        </div>
      )}

      <div className="flex items-center gap-3 p-3">
        {/* Imagen o placeholder con inicial */}
        <div className="relative w-[68px] h-[68px] rounded-xl overflow-hidden bg-stone-100 shrink-0">
          {producto.imagen_url ? (
            <Image src={producto.imagen_url} alt={producto.nombre} fill className="object-cover" sizes="68px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-stone-100 to-stone-200">
              🍽️
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-stone-900 text-sm leading-snug">{producto.nombre}</p>
          {producto.descripcion && (
            <p className="text-xs text-stone-400 mt-0.5 line-clamp-2 leading-relaxed">{producto.descripcion}</p>
          )}
          <p className={`font-extrabold mt-1.5 text-sm ${enCarrito ? "text-orange-500" : "text-stone-800"}`}>
            S/. {producto.precio.toFixed(2)}
          </p>
          {!producto.disponible && (
            <span className="text-[11px] text-stone-400 font-medium">No disponible</span>
          )}
        </div>

        {/* Controles */}
        <div className="shrink-0">
          {!producto.disponible ? (
            <div className="w-[72px] text-center text-[11px] text-stone-400 font-medium">Agotado</div>
          ) : cantidad === 0 ? (
            <button
              onClick={onAgregar}
              className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700
                         text-white rounded-xl px-3 py-2 text-xs font-bold
                         transition-colors shadow-sm shadow-orange-200 whitespace-nowrap"
              aria-label={`Agregar ${producto.nombre}`}
            >
              + Agregar
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onDecrementar}
                className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 active:bg-stone-300
                           text-stone-700 font-bold text-base flex items-center justify-center transition-colors"
                aria-label="Quitar uno"
              >−</button>
              <span className="w-5 text-center font-extrabold text-orange-500 text-sm">{cantidad}</span>
              <button
                onClick={onIncrementar}
                className="w-8 h-8 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700
                           text-white font-bold text-base flex items-center justify-center transition-colors"
                aria-label="Agregar uno más"
              >+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

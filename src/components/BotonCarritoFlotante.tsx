"use client";

import Link from "next/link";
import { useCarrito } from "@/context/CarritoContext";

export function BotonCarritoFlotante() {
  const { totalItems, subtotal } = useCarrito();

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[390px]">
      <Link
        href="/checkout"
        className="flex items-center gap-3 w-full
                   bg-gradient-to-r from-orange-500 to-orange-400
                   text-white rounded-2xl shadow-xl shadow-orange-300/50
                   px-4 py-3.5 transition-all duration-200
                   hover:shadow-orange-400/60 active:scale-[0.98]"
        aria-label={`Ver pedido con ${totalItems} productos`}
      >
        {/* Ícono carrito */}
        <div className="bg-white/20 rounded-xl p-2">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>

        {/* Texto central */}
        <div className="flex-1">
          <p className="font-bold text-sm leading-tight">Coordinar mi delivery</p>
          <p className="text-orange-100 text-[11px]">
            {totalItems} {totalItems === 1 ? "producto" : "productos"}
          </p>
        </div>

        {/* Total con badge */}
        <div className="bg-white/20 rounded-xl px-3 py-1.5 text-right">
          <p className="font-extrabold text-sm leading-tight">S/. {subtotal.toFixed(2)}</p>
        </div>
      </Link>
    </div>
  );
}

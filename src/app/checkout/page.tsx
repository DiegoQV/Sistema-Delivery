"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCarrito } from "@/context/CarritoContext";
import { ZONAS } from "@/data/zonas";
import { generarEnlaceWhatsApp } from "@/lib/whatsapp";
import type { MetodoPago, Zona } from "@/types";

const MONTO_MINIMO_PROMO = 20;

export default function CheckoutPage() {
  const router = useRouter();
  const { carrito, subtotal, totalItems, decrementar, incrementar, eliminar, vaciar } = useCarrito();

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [zonaId, setZonaId] = useState("");
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("efectivo");
  const [mostrarQR, setMostrarQR] = useState(false);
  const [primerEnvioGratis, setPrimerEnvioGratis] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const zonaSeleccionada: Zona | undefined = ZONAS.find((z) => z.id === zonaId);
  const costoEnvio: number = primerEnvioGratis ? 0 : (zonaSeleccionada?.costo_envio ?? 0);
  const total = subtotal + costoEnvio;

  useEffect(() => {
    if (telefono.length !== 9 || subtotal < MONTO_MINIMO_PROMO) {
      setPrimerEnvioGratis(false);
      return;
    }
    const tienePedidoPrevio = Boolean(localStorage.getItem(`pedido_previo_${telefono}`));
    setPrimerEnvioGratis(!tienePedidoPrevio);
  }, [telefono, subtotal]);

  useEffect(() => {
    if (metodoPago === "yape") setMostrarQR(true);
  }, [metodoPago]);

  function validar(): boolean {
    const e: Record<string, string> = {};
    if (!nombre.trim()) e.nombre = "Ingresa tu nombre completo";
    if (!/^\d{9}$/.test(telefono)) e.telefono = "Celular inválido (9 dígitos)";
    if (!direccion.trim()) e.direccion = "Ingresa tu dirección exacta";
    if (!zonaId) e.zona = "Selecciona tu zona de entrega";
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  async function handleConfirmar() {
    if (!validar()) return;
    if (!zonaSeleccionada || !carrito.restaurante_id) return;
    setEnviando(true);
    try {
      const pedidoId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      localStorage.setItem(`pedido_previo_${telefono}`, pedidoId);
      const enlace = generarEnlaceWhatsApp({
        pedidoId,
        clienteNombre: nombre.trim(),
        clienteTelefono: telefono,
        direccion: direccion.trim(),
        zona: zonaSeleccionada,
        items: carrito.items,
        subtotal,
        costoEnvio,
        total,
        metodoPago,
        telefonoNegocio: carrito.restaurante_telefono_wa ?? "51987654321",
      });
      vaciar();
      window.open(enlace, "_blank");
      router.push(`/pedido/${pedidoId}`);
    } finally {
      setEnviando(false);
    }
  }

  if (totalItems === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-white">
        <div className="w-24 h-24 rounded-full bg-stone-100 flex items-center justify-center mb-5 text-5xl">🛒</div>
        <p className="text-stone-900 font-bold text-lg">Tu carrito está vacío</p>
        <p className="text-stone-400 text-sm mt-1">Agrega productos para continuar</p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 bg-orange-500 text-white font-bold px-7 py-3 rounded-2xl text-sm shadow-md shadow-orange-200"
        >
          Ver restaurantes
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 pb-8">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white shadow-sm px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center
                     hover:bg-stone-200 transition-colors shrink-0"
          aria-label="Volver"
        >
          <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="font-extrabold text-stone-900 text-base leading-tight">Confirmar pedido</h1>
          <p className="text-xs text-stone-400">{carrito.restaurante_nombre}</p>
        </div>
        <span className="bg-orange-100 text-orange-600 font-bold text-xs px-2.5 py-1 rounded-full">
          {totalItems} {totalItems === 1 ? "ítem" : "ítems"}
        </span>
      </header>

      <div className="px-4 py-4 flex flex-col gap-4">

        {/* ── 1. Resumen del pedido ────────────────────────────────────── */}
        <section className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-stone-50 flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-orange-100 flex items-center justify-center text-sm">🛒</div>
            <h2 className="font-bold text-stone-900 text-sm">Tu pedido</h2>
          </div>
          <div className="divide-y divide-stone-50">
            {carrito.items.map((item) => (
              <div key={item.producto.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stone-900 truncate">{item.producto.nombre}</p>
                  <p className="text-xs text-stone-400 mt-0.5">S/. {item.producto.precio.toFixed(2)} c/u</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => decrementar(item.producto.id)}
                    className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center transition-colors"
                    aria-label="Quitar uno"
                  >−</button>
                  <span className="w-5 text-center font-bold text-stone-900 text-sm">{item.cantidad}</span>
                  <button
                    onClick={() => incrementar(item.producto.id)}
                    className="w-7 h-7 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold flex items-center justify-center transition-colors"
                    aria-label="Agregar uno"
                  >+</button>
                </div>
                <p className="text-sm font-bold text-stone-900 w-16 text-right">
                  S/. {(item.producto.precio * item.cantidad).toFixed(2)}
                </p>
                <button
                  onClick={() => eliminar(item.producto.id)}
                  className="w-7 h-7 rounded-lg hover:bg-red-50 text-stone-300 hover:text-red-400 flex items-center justify-center transition-colors"
                  aria-label={`Eliminar ${item.producto.nombre}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── 2. Datos del cliente ─────────────────────────────────────── */}
        <section className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-stone-50 flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-blue-100 flex items-center justify-center text-sm">👤</div>
            <h2 className="font-bold text-stone-900 text-sm">Tus datos</h2>
          </div>
          <div className="px-4 py-4 flex flex-col gap-3">
            <Campo label="Nombre completo" value={nombre} onChange={setNombre}
              placeholder="Ej: Juan Pérez" error={errores.nombre} type="text" icon="👤" />
            <Campo label="Celular WhatsApp" value={telefono} onChange={setTelefono}
              placeholder="Ej: 987654321" error={errores.telefono} type="tel" maxLength={9} icon="📱" />
            <Campo label="Dirección exacta" value={direccion} onChange={setDireccion}
              placeholder="Ej: Jr. Grau 123, frente al mercado" error={errores.direccion} type="text" icon="📍" />

            {/* Zona */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                <span className="mr-1">🗺️</span> Zona de entrega
              </label>
              <select
                value={zonaId}
                onChange={(e) => setZonaId(e.target.value)}
                className={`w-full bg-stone-50 border-2 rounded-2xl px-4 py-3 text-sm
                            text-stone-900 focus:outline-none focus:border-orange-400
                            transition-colors appearance-none
                            ${errores.zona ? "border-red-400" : "border-stone-200"}`}
                aria-label="Seleccionar zona de entrega"
              >
                <option value="">-- Selecciona tu zona --</option>
                {ZONAS.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.nombre} — {z.costo_envio === null ? "A coordinar" : `S/. ${z.costo_envio.toFixed(2)}`}
                  </option>
                ))}
              </select>
              {errores.zona && <p className="text-xs text-red-500 mt-1 ml-1">{errores.zona}</p>}
            </div>
          </div>
        </section>

        {/* ── 3. Método de pago ────────────────────────────────────────── */}
        <section className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-stone-50 flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-green-100 flex items-center justify-center text-sm">💳</div>
            <h2 className="font-bold text-stone-900 text-sm">Método de pago</h2>
          </div>
          <div className="px-4 py-4 flex gap-3">
            {(["efectivo", "yape"] as MetodoPago[]).map((m) => (
              <button
                key={m}
                onClick={() => setMetodoPago(m)}
                className={`flex-1 flex flex-col items-center justify-center gap-2
                            rounded-2xl border-2 py-4 transition-all duration-200
                            ${metodoPago === m
                              ? "border-orange-400 bg-orange-50 shadow-md shadow-orange-100 scale-[1.02]"
                              : "border-stone-200 bg-stone-50 hover:border-stone-300"
                            }`}
                aria-pressed={metodoPago === m}
              >
                <span className="text-3xl">{m === "efectivo" ? "💵" : "📱"}</span>
                <span className={`text-xs font-bold ${metodoPago === m ? "text-orange-600" : "text-stone-500"}`}>
                  {m === "efectivo" ? "Efectivo" : "Yape / Plin"}
                </span>
                {metodoPago === m && (
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" />
                )}
              </button>
            ))}
          </div>
          {metodoPago === "yape" && (
            <div className="px-4 pb-4">
              <button
                onClick={() => setMostrarQR(true)}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-500
                           text-white text-xs font-bold py-2.5 rounded-xl
                           flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Ver QR para pagar</span>
                <span>📲</span>
              </button>
            </div>
          )}
        </section>

        {/* ── 4. Resumen de precios ────────────────────────────────────── */}
        <section className="bg-white rounded-3xl shadow-sm border border-stone-100 px-4 py-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center text-sm">🧾</div>
            <h2 className="font-bold text-stone-900 text-sm">Resumen</h2>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-stone-600">
              <span>Subtotal ({totalItems} {totalItems === 1 ? "ítem" : "ítems"})</span>
              <span className="font-medium">S/. {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-stone-600">
              <span>Costo de envío</span>
              <span className="font-medium">
                {!zonaId
                  ? <span className="text-stone-300 italic text-xs">Selecciona zona</span>
                  : zonaSeleccionada?.costo_envio === null
                  ? <span className="text-amber-500 font-semibold">A coordinar</span>
                  : primerEnvioGratis
                  ? <span className="text-green-600 font-bold">¡GRATIS! 🎉</span>
                  : `S/. ${costoEnvio.toFixed(2)}`}
              </span>
            </div>
          </div>

          {primerEnvioGratis && (
            <div className="mt-3 bg-gradient-to-r from-green-50 to-emerald-50
                            border border-green-200 rounded-2xl p-3
                            flex items-center gap-2">
              <span className="text-xl">🎉</span>
              <div>
                <p className="text-xs font-bold text-green-700">¡Primer envío gratis!</p>
                <p className="text-[11px] text-green-600">Se aplicó la promoción de lanzamiento</p>
              </div>
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-stone-100 flex justify-between items-center">
            <span className="font-bold text-stone-900">Total a pagar</span>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-orange-500">
                S/. {total.toFixed(2)}
              </span>
            </div>
          </div>
        </section>

        {/* ── Botón confirmar ──────────────────────────────────────────── */}
        <button
          onClick={handleConfirmar}
          disabled={enviando}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-400
                     hover:from-orange-600 hover:to-orange-500
                     active:from-orange-700 active:to-orange-600
                     disabled:opacity-60 text-white font-extrabold py-4 rounded-2xl
                     text-base shadow-xl shadow-orange-300/50 transition-all duration-200
                     flex items-center justify-center gap-2"
          aria-label="Confirmar y enviar pedido por WhatsApp"
        >
          {enviando ? (
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.528 5.852L.057 23.57a.5.5 0 00.616.635l5.92-1.55A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.803 9.803 0 01-5.028-1.382l-.36-.214-3.722.975.992-3.624-.234-.373A9.787 9.787 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
              </svg>
              <span>Confirmar por WhatsApp</span>
            </>
          )}
        </button>

        <p className="text-center text-xs text-stone-400 -mt-2">
          Se abrirá WhatsApp con el detalle completo de tu pedido
        </p>
      </div>

      {/* ── Modal QR ────────────────────────────────────────────────────── */}
      {mostrarQR && (
        <ModalQR
          qrUrl={carrito.restaurante_qr_yape_url ?? "/images/qr-yape-placeholder.png"}
          total={total}
          onCerrar={() => setMostrarQR(false)}
        />
      )}
    </div>
  );
}

// ── Campo de formulario ───────────────────────────────────────────────────────

interface CampoProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error?: string;
  type: string;
  maxLength?: number;
  icon: string;
}

function Campo({ label, value, onChange, placeholder, error, type, maxLength, icon }: CampoProps) {
  return (
    <div>
      <label className="block text-xs font-bold text-stone-700 mb-1.5">
        <span className="mr-1">{icon}</span>{label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full bg-stone-50 border-2 rounded-2xl px-4 py-3 text-sm
                    text-stone-900 placeholder-stone-300
                    focus:outline-none focus:border-orange-400 transition-colors
                    ${error ? "border-red-400 bg-red-50" : "border-stone-200"}`}
        aria-invalid={!!error}
      />
      {error && (
        <p className="text-xs text-red-500 mt-1 ml-1 flex items-center gap-1">
          <span>⚠️</span>{error}
        </p>
      )}
    </div>
  );
}

// ── Modal QR ──────────────────────────────────────────────────────────────────

function ModalQR({ qrUrl, total, onCerrar }: { qrUrl: string; total: number; onCerrar: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center p-4"
      onClick={onCerrar}
      role="dialog"
      aria-modal="true"
      aria-label="Código QR para pago"
    >
      <div
        className="bg-white w-full max-w-[390px] rounded-3xl p-6 flex flex-col items-center gap-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-stone-200" />

        <div className="text-center">
          <h3 className="font-extrabold text-stone-900 text-lg">Paga con Yape / Plin</h3>
          <p className="text-stone-400 text-xs mt-1">Escanea el código con tu app</p>
        </div>

        {/* QR con borde decorativo */}
        <div className="relative p-3 bg-gradient-to-br from-violet-50 to-purple-50
                        border-2 border-violet-200 rounded-3xl">
          <div className="relative w-44 h-44 rounded-2xl overflow-hidden">
            <Image src={qrUrl} alt="Código QR Yape/Plin" fill className="object-cover" sizes="176px" />
          </div>
        </div>

        {/* Monto */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl px-8 py-3 text-center">
          <p className="text-xs text-stone-500 font-medium">Monto a pagar</p>
          <p className="text-3xl font-extrabold text-orange-500 mt-0.5">S/. {total.toFixed(2)}</p>
        </div>

        <p className="text-xs text-stone-500 text-center leading-relaxed px-2">
          Realiza el pago y <strong className="text-stone-700">adjunta el screenshot</strong> cuando envíes tu pedido por WhatsApp.
        </p>

        <button
          onClick={onCerrar}
          className="w-full bg-gradient-to-r from-violet-500 to-purple-500
                     text-white font-bold py-3.5 rounded-2xl text-sm shadow-md"
        >
          ✓ Listo, continuar con el pedido
        </button>
      </div>
    </div>
  );
}

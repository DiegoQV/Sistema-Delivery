"use client";

import { useParams, useRouter } from "next/navigation";

export function PedidoExitoClient() {
  const router = useRouter();
  const params = useParams();

  // useParams() lee el segmento dinámico [id] desde la URL en runtime.
  // Esto funciona correctamente en SPA con output: 'export'.
  const id = typeof params.id === "string" ? params.id : "";
  const idCorto = id.slice(-6).toUpperCase() || "------";

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* Zona de éxito con gradiente */}
      <div className="bg-gradient-to-b from-green-50 to-white px-6 pt-16 pb-10 flex flex-col items-center text-center">
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-full bg-green-100 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-green-200 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="absolute top-1 right-0 w-3 h-3 rounded-full bg-green-300" />
          <div className="absolute bottom-2 left-0 w-2 h-2 rounded-full bg-emerald-400" />
          <div className="absolute top-3 left-2 w-1.5 h-1.5 rounded-full bg-green-400" />
        </div>

        <h1 className="text-2xl font-extrabold text-stone-900 leading-tight mb-2">
          ¡Pedido enviado! 🎉
        </h1>
        <p className="text-stone-500 text-sm leading-relaxed">
          Tu pedido <span className="font-bold text-stone-900">#{idCorto}</span> fue enviado
          al restaurante por WhatsApp.
        </p>
      </div>

      <div className="px-4 flex flex-col gap-4 -mt-2">

        {/* Pasos de seguimiento */}
        <section className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-stone-50">
            <h2 className="font-bold text-stone-900 text-sm">¿Qué sigue? 📦</h2>
          </div>
          <div className="px-4 py-4 space-y-4">
            {[
              { num: "1", icon: "📲", texto: "El restaurante recibe tu pedido en WhatsApp",  color: "bg-blue-100 text-blue-600"    },
              { num: "2", icon: "✅", texto: "Te confirman la hora de entrega estimada",      color: "bg-green-100 text-green-600"  },
              { num: "3", icon: "🛵", texto: "El motorizado lleva tu pedido a tu dirección",  color: "bg-orange-100 text-orange-600"},
              { num: "4", icon: "😋", texto: "¡Recibe y disfruta tu comida!",                 color: "bg-amber-100 text-amber-600"  },
            ].map((paso) => (
              <div key={paso.num} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${paso.color}`}>
                  {paso.icon}
                </div>
                <p className="text-sm text-stone-600 leading-snug">{paso.texto}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tip Yape */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
          <span className="text-xl shrink-0">💡</span>
          <p className="text-xs text-amber-700 leading-relaxed">
            Si elegiste <strong>Yape/Plin</strong>, no olvides adjuntar el screenshot del
            pago en el chat de WhatsApp.
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => router.push("/")}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-400
                     text-white font-extrabold py-4 rounded-2xl text-base
                     shadow-lg shadow-orange-200 flex items-center justify-center gap-2
                     hover:from-orange-600 hover:to-orange-500 transition-all"
        >
          <span>🛵</span>
          <span>Hacer otro pedido</span>
        </button>

        <p className="text-center text-xs text-stone-400 pb-4">
          ¿Problemas con tu pedido? Escríbenos directamente por WhatsApp.
        </p>
      </div>
    </div>
  );
}

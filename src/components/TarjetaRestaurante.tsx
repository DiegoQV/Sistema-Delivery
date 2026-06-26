import Link from "next/link";
import Image from "next/image";
import type { Restaurante } from "@/types";

interface Props {
  restaurante: Restaurante;
}

const CATEGORIA_CONFIG: Record<string, { emoji: string; color: string; bg: string }> = {
  Pollería: { emoji: "🍗", color: "text-amber-700",  bg: "bg-amber-50"  },
  Menú:     { emoji: "🍲", color: "text-green-700",  bg: "bg-green-50"  },
  Pizza:    { emoji: "🍕", color: "text-red-700",    bg: "bg-red-50"    },
  Jugos:    { emoji: "🥤", color: "text-cyan-700",   bg: "bg-cyan-50"   },
  Burger:   { emoji: "🍔", color: "text-yellow-700", bg: "bg-yellow-50" },
  Sushi:    { emoji: "🍣", color: "text-pink-700",   bg: "bg-pink-50"   },
};

const FALLBACK = { emoji: "🍽️", color: "text-orange-700", bg: "bg-orange-50" };

export function TarjetaRestaurante({ restaurante }: Props) {
  const config = CATEGORIA_CONFIG[restaurante.categoria] ?? FALLBACK;

  return (
    <Link
      href={`/restaurante/${restaurante.id}`}
      className="group flex items-center gap-4 bg-white rounded-3xl p-4
                 shadow-sm border border-stone-100
                 hover:shadow-md hover:border-orange-100
                 active:scale-[0.97] transition-all duration-200"
      aria-label={`Ver menú de ${restaurante.nombre}`}
    >
      {/* Logo con fondo de color */}
      <div className={`relative w-[72px] h-[72px] rounded-2xl overflow-hidden ${config.bg} shrink-0
                        ring-1 ring-black/5`}>
        <Image
          src={restaurante.logo_url}
          alt={`Logo de ${restaurante.nombre}`}
          fill
          className="object-cover"
          sizes="72px"
        />
        {/* Emoji fallback visual en esquina */}
        <div className="absolute bottom-0.5 right-0.5 text-sm leading-none">
          {config.emoji}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-stone-900 text-sm leading-tight truncate group-hover:text-orange-600 transition-colors">
          {restaurante.nombre}
        </h3>
        <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
          {restaurante.descripcion}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold
                            px-2.5 py-0.5 rounded-full ${config.bg} ${config.color}`}>
            {config.emoji} {restaurante.categoria}
          </span>
          {/* Indicador activo */}
          <span className="flex items-center gap-1 text-[11px] text-green-600 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Abierto
          </span>
        </div>
      </div>

      {/* Flecha animada */}
      <div className="shrink-0 w-8 h-8 rounded-full bg-stone-50 group-hover:bg-orange-500
                       flex items-center justify-center transition-all duration-200">
        <svg
          className="w-4 h-4 text-stone-300 group-hover:text-white transition-colors"
          fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import { useCarrito } from "@/context/CarritoContext";
import { RESTAURANTES_MOCK } from "@/data/mock";
import { ZONAS } from "@/data/zonas";
import { generarEnlaceWhatsApp } from "@/lib/whatsapp";
import type { Restaurante, Producto, MetodoPago, Zona, EstadoCarrito } from "@/types";

// ─── Datos mock de platos ─────────────────────────────────────────────────────
const PLATOS_MOCK: Record<string, Producto[]> = {
  "rest-001": [
    { id:"p-001", restaurante_id:"rest-001", nombre:"1/4 Pollo a la Brasa",    descripcion:"Con papas fritas y ensalada",          precio:18.0, categoria:"Platos",  disponible:true  },
    { id:"p-002", restaurante_id:"rest-001", nombre:"1/2 Pollo a la Brasa",    descripcion:"Con papas fritas y ensalada",          precio:32.0, categoria:"Platos",  disponible:true  },
    { id:"p-003", restaurante_id:"rest-001", nombre:"Pollo Entero",             descripcion:"Con papas, ensalada y cremas",         precio:58.0, categoria:"Platos",  disponible:true  },
    { id:"p-004", restaurante_id:"rest-001", nombre:"Aguadito de Pollo",        descripcion:"Sopa cremosa con arroz y culantro",    precio:14.0, categoria:"Sopas",   disponible:true  },
    { id:"p-005", restaurante_id:"rest-001", nombre:"Arroz con Leche",          descripcion:"Postre casero con canela",             precio: 6.0, categoria:"Postres", disponible:true  },
    { id:"p-006", restaurante_id:"rest-001", nombre:"Gaseosa Personal",         descripcion:"Inca Kola o Coca Cola",                precio: 4.0, categoria:"Bebidas", disponible:true  },
    { id:"p-007", restaurante_id:"rest-001", nombre:"Chicha Morada Jarra",      descripcion:"1 litro artesanal",                    precio: 8.0, categoria:"Bebidas", disponible:false },
  ],
  "rest-002": [
    { id:"p-008", restaurante_id:"rest-002", nombre:"Menú del Día",             descripcion:"Sopa + segundo + refresco",            precio:12.0, categoria:"Menú",     disponible:true },
    { id:"p-009", restaurante_id:"rest-002", nombre:"Caldo de Gallina",         descripcion:"Caldo casero con fideos y papa",       precio:10.0, categoria:"Sopas",    disponible:true },
    { id:"p-010", restaurante_id:"rest-002", nombre:"Estofado de Pollo",        descripcion:"Con arroz y menestra",                 precio:14.0, categoria:"Segundos", disponible:true },
    { id:"p-011", restaurante_id:"rest-002", nombre:"Trucha Frita",             descripcion:"Con papas sancochadas y ensalada",     precio:18.0, categoria:"Segundos", disponible:true },
  ],
  "rest-003": [
    { id:"p-012", restaurante_id:"rest-003", nombre:"Pizza Americana Personal", descripcion:"Jamón, queso, hongos",                 precio:22.0, categoria:"Pizzas", disponible:true },
    { id:"p-013", restaurante_id:"rest-003", nombre:"Pizza Familiar Mixta",     descripcion:"8 porciones, ingredientes a elección", precio:45.0, categoria:"Pizzas", disponible:true },
    { id:"p-014", restaurante_id:"rest-003", nombre:"Pizza BBQ Pollo",          descripcion:"Con salsa BBQ y pollo ahumado",        precio:28.0, categoria:"Pizzas", disponible:true },
  ],
  "rest-004": [
    { id:"p-015", restaurante_id:"rest-004", nombre:"Jugo de Cocona",           descripcion:"Fruta amazónica, vaso grande",         precio: 6.0, categoria:"Jugos",   disponible:true },
    { id:"p-016", restaurante_id:"rest-004", nombre:"Batido de Aguaje",         descripcion:"Con leche, vaso grande",               precio: 7.0, categoria:"Batidos", disponible:true },
    { id:"p-017", restaurante_id:"rest-004", nombre:"Jugo de Maracuyá",         descripcion:"Natural, sin azúcar añadida",          precio: 5.0, categoria:"Jugos",   disponible:true },
  ],
};

// ─── Tipos internos ───────────────────────────────────────────────────────────
type Vista = "inicio" | "menu" | "carrito";
type PasoChat = "nombre" | "direccion" | "zona" | "pago" | "confirmacion";

interface MensajeChat {
  id: string;
  tipo: "bot" | "usuario";
  texto: string;
}

// ─── Constantes visuales ──────────────────────────────────────────────────────
const COVER_GRADIENTS: Record<string,string> = {
  Pollería:"from-amber-400 via-orange-300 to-yellow-200",
  Menú:    "from-green-500 via-emerald-400 to-teal-200",
  Pizza:   "from-red-500 via-rose-400 to-orange-200",
  Jugos:   "from-cyan-500 via-sky-400 to-blue-200",
  Burger:  "from-yellow-500 via-amber-400 to-lime-200",
  Sushi:   "from-pink-500 via-fuchsia-400 to-purple-200",
};
const COVER_EMOJI: Record<string,string> = {
  Pollería:"🍗", Menú:"🍲", Pizza:"🍕", Jugos:"🥤", Burger:"🍔", Sushi:"🍣",
};
const CATEGORIAS = [
  { label:"Todos", emoji:"✦" }, { label:"Pollería", emoji:"🍗" },
  { label:"Menú",  emoji:"🍲" }, { label:"Pizza",    emoji:"🍕" },
  { label:"Jugos", emoji:"🥤" },
];
const NUMERO_MOTORIZADO = "51987654321";
const WHATSAPP_DELIVERY_URL = `https://wa.me/${NUMERO_MOTORIZADO}?text=${encodeURIComponent(
  "Hola, necesito un delivery en Chachapoyas. Quiero coordinar un recojo y entrega."
)}`;
type TipoIconoServicio = "comida" | "compras" | "medicinas" | "paquetes" | "encomiendas" | "negocios";

interface ServicioDelivery {
  icono: TipoIconoServicio;
  titulo: string;
  descripcion: string;
  detalle: string;
  estilo: string;
}

const SERVICIOS_DELIVERY: ServicioDelivery[] = [
  {
    icono: "comida",
    titulo: "Delivery de comida",
    descripcion: "Recogemos tu pedido favorito y lo llevamos caliente hasta tu puerta.",
    detalle: "un delivery de comida",
    estilo: "bg-orange-50 text-orange-600 ring-orange-100",
  },
  {
    icono: "compras",
    titulo: "Compras por encargo",
    descripcion: "Compramos lo que necesitas y te evitamos vueltas y filas.",
    detalle: "una compra por encargo",
    estilo: "bg-violet-50 text-violet-600 ring-violet-100",
  },
  {
    icono: "medicinas",
    titulo: "Entrega de medicamentos",
    descripcion: "Recojo rápido en boticas y entrega cuidadosa a domicilio.",
    detalle: "la entrega de medicamentos",
    estilo: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  },
  {
    icono: "paquetes",
    titulo: "Recojo de paquetes",
    descripcion: "Vamos por tu paquete y lo entregamos en el punto indicado.",
    detalle: "el recojo de un paquete",
    estilo: "bg-sky-50 text-sky-600 ring-sky-100",
  },
  {
    icono: "encomiendas",
    titulo: "Encomiendas locales",
    descripcion: "Traslados confiables y coordinados dentro de Chachapoyas.",
    detalle: "una encomienda local",
    estilo: "bg-amber-50 text-amber-600 ring-amber-100",
  },
  {
    icono: "negocios",
    titulo: "Delivery para negocios",
    descripcion: "Un aliado flexible para las entregas diarias de tu negocio.",
    detalle: "delivery para mi negocio",
    estilo: "bg-slate-100 text-slate-700 ring-slate-200",
  },
];

// ─── Componente principal ─────────────────────────────────────────────────────
export default function HomePage() {
  const [vistaActual, setVistaActual]             = useState<Vista>("inicio");
  const [restauranteActivo, setRestauranteActivo] = useState<Restaurante | null>(null);
  const [categoriaActiva, setCategoriaActiva]     = useState("Todos");
  const [busqueda, setBusqueda]                   = useState("");
  const { carrito, totalItems, subtotal, agregar, incrementar, decrementar } = useCarrito();

  const irAMenu    = (r: Restaurante) => { setRestauranteActivo(r); setVistaActual("menu"); };
  const irAInicio  = () => { setRestauranteActivo(null); setVistaActual("inicio"); };
  const irACarrito = () => setVistaActual("carrito");

  const slide = (v: Vista) =>
    vistaActual === v
      ? "opacity-100 translate-x-0 pointer-events-auto"
      : vistaActual === "inicio" && v !== "inicio"
      ? "opacity-0 translate-x-full pointer-events-none"
      : "opacity-0 -translate-x-full pointer-events-none";

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 overflow-hidden">
      <div className="flex-1 relative">
        {/* Vista Inicio */}
        <div className={`absolute inset-0 transition-all duration-300 ease-in-out ${slide("inicio")}`}>
          <VistaInicio
            categoriaActiva={categoriaActiva} setCategoriaActiva={setCategoriaActiva}
            busqueda={busqueda} setBusqueda={setBusqueda}
            onSeleccionarRestaurante={irAMenu}
          />
        </div>
        {/* Vista Menú */}
        <div className={`absolute inset-0 transition-all duration-300 ease-in-out ${slide("menu")}`}>
          {restauranteActivo && (
            <VistaMenu
              restaurante={restauranteActivo} onVolver={irAInicio}
              agregar={agregar} incrementar={incrementar} decrementar={decrementar} carrito={carrito}
            />
          )}
        </div>
        {/* Vista Carrito */}
        <div className={`absolute inset-0 transition-all duration-300 ease-in-out ${slide("carrito")}`}>
          <VistaCarrito onVolver={irAInicio} totalItems={totalItems} subtotal={subtotal} />
        </div>
      </div>

      <NavbarInferior
        vistaActual={vistaActual} totalItems={totalItems} subtotal={subtotal}
        onInicio={irAInicio} onCarrito={irACarrito}
      />
    </div>
  );
}

// ─── Vista: INICIO ────────────────────────────────────────────────────────────
function VistaInicio({ categoriaActiva, setCategoriaActiva, busqueda, setBusqueda, onSeleccionarRestaurante }:{
  categoriaActiva:string; setCategoriaActiva:(c:string)=>void;
  busqueda:string; setBusqueda:(v:string)=>void;
  onSeleccionarRestaurante:(r:Restaurante)=>void;
}) {
  const filtrados = useMemo(() =>
    RESTAURANTES_MOCK.filter(r => {
      if (!r.activo) return false;
      return (categoriaActiva==="Todos"||r.categoria===categoriaActiva) &&
             (busqueda===""||r.nombre.toLowerCase().includes(busqueda.toLowerCase()));
    }), [categoriaActiva, busqueda]);

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 px-5 py-3.5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Delivery activo · Chachapoyas</p>
            </div>
            <p className="text-xl font-black text-slate-900 tracking-tight leading-none">
              Chacha<span className="text-orange-600">Fast</span>
            </p>
          </div>
          <a href={WHATSAPP_DELIVERY_URL} target="_blank" rel="noreferrer"
            className="bg-emerald-500 text-white text-[11px] font-extrabold px-3.5 py-2 rounded-full shadow-md shadow-emerald-100 flex items-center gap-1.5">
            <span>WhatsApp</span><span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>

      <main className="flex-1 px-4 pt-4">
        <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#0b1220] px-5 pt-6 pb-5 text-white shadow-[0_24px_60px_-24px_rgba(15,23,42,0.65)]">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0b1220] to-[#121b2d]" aria-hidden="true" />
          <div className="absolute -top-24 -right-20 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" aria-hidden="true" />
          <div className="absolute top-52 -left-24 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" aria-hidden="true" />
          <svg className="absolute inset-x-0 bottom-20 h-52 w-full text-white/[0.08]" viewBox="0 0 390 210" fill="none" aria-hidden="true">
            <path d="M-18 172C45 171 31 101 92 98C151 95 126 161 198 150C262 140 231 56 306 54C348 53 369 76 410 25" stroke="currentColor" strokeWidth="2" strokeDasharray="7 8" />
            <circle cx="92" cy="98" r="5" fill="currentColor" />
            <circle cx="306" cy="54" r="5" fill="currentColor" />
          </svg>

          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-200 backdrop-blur-sm">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                Servicio activo
              </span>
              <span className="text-[10px] font-bold text-slate-400">Chachapoyas · Amazonas</span>
            </div>

            <h1 className="mt-5 text-[2rem] min-[360px]:text-[2.35rem] font-black leading-[0.98] tracking-[-0.04em] text-white">
              Delivery rápido<br/>en <span className="text-orange-400">Chachapoyas</span>
            </h1>
            <p className="mt-4 max-w-[335px] text-[13px] font-medium leading-relaxed text-slate-300">
              Recojos, compras por encargo, medicamentos y encomiendas locales con atención directa por WhatsApp.
            </p>

            <div className="mt-5 flex flex-col gap-2.5">
              <a href={WHATSAPP_DELIVERY_URL} target="_blank" rel="noreferrer"
                className="flex min-h-12 w-full items-center justify-center gap-2.5 rounded-2xl bg-emerald-500 px-4 py-3.5 text-sm font-black text-white shadow-[0_12px_28px_-10px_rgba(16,185,129,0.75)] transition-all hover:bg-emerald-400 active:scale-[0.98]">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z" />
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 2.12.55 4.12 1.53 5.85L.06 23.57a.5.5 0 0 0 .61.64l5.92-1.55A11.95 11.95 0 0 0 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0zm0 21.82a9.8 9.8 0 0 1-5.03-1.38l-.36-.21-3.72.97.99-3.62-.23-.38A9.79 9.79 0 0 1 2.18 12 9.82 9.82 0 1 1 12 21.82z" />
                </svg>
                Solicitar delivery por WhatsApp
              </a>
              <button type="button"
                onClick={() => document.querySelector("main section:nth-of-type(2)")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm font-extrabold text-white backdrop-blur-sm transition-all hover:bg-white/10 active:scale-[0.98]">
                Ver servicios
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            <div className="relative mt-6 h-44" aria-label="Beneficios del servicio">
              <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-orange-300/20 bg-orange-500/10 shadow-[0_0_50px_rgba(249,115,22,0.18)]">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-xl shadow-orange-950/30">
                  <svg className="h-9 w-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 15h11m-8-3h8m-5-3h5m2.5 9.5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0Zm-13 0a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7.5 18.5h9M14 9h2.5l2 4H21l1 3h-6l-2-7Z" />
                  </svg>
                </div>
              </div>

              <div className="absolute left-0 top-1 rounded-2xl border border-white/10 bg-white/[0.09] px-3 py-2.5 shadow-xl backdrop-blur-md">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Tarifa local</p>
                <p className="mt-0.5 text-sm font-black text-white">Desde S/ 3.00</p>
              </div>
              <div className="absolute right-0 top-8 rounded-2xl border border-white/10 bg-white/[0.09] px-3 py-2.5 shadow-xl backdrop-blur-md">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Canal directo</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs font-black text-white"><span className="h-2 w-2 rounded-full bg-emerald-400" /> WhatsApp</p>
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-2xl border border-white/10 bg-white/[0.09] px-3.5 py-2.5 shadow-xl backdrop-blur-md">
                <p className="flex items-center gap-2 text-xs font-black text-white"><span aria-hidden="true">⚡</span> Entrega rápida</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 border-t border-white/10 pt-4 text-[10px] font-bold text-slate-400">
              <span className="text-emerald-400" aria-hidden="true">✓</span><span>Precio accesible</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400" aria-hidden="true">✓</span><span>Cobertura local</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400" aria-hidden="true">✓</span><span>Atención real</span>
            </div>
          </div>
        </section>

        <section className="relative mt-7 scroll-mt-20 overflow-hidden rounded-[2rem] border border-slate-100 bg-gradient-to-b from-slate-50 to-white px-4 py-6 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.4)]">
          <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-orange-100/70 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <div className="max-w-[330px]">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-px w-6 bg-orange-500" aria-hidden="true" />
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-600">Soluciones locales</p>
              </div>
              <h2 className="text-2xl font-black leading-tight tracking-tight text-slate-950">Nuestros servicios</h2>
              <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500">
                Resolvemos tus entregas del día con atención directa, tarifas claras y cobertura en Chachapoyas.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 min-[340px]:grid-cols-2">
              {SERVICIOS_DELIVERY.map(servicio => (
                <TarjetaServicio key={servicio.titulo} servicio={servicio} />
              ))}
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white/80 px-3 py-3 text-center">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600" aria-hidden="true">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <p className="text-[11px] font-bold text-slate-600">Coordinación personalizada para cada entrega</p>
            </div>
          </div>
        </section>

        <section className="mt-7">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">También entregamos tus antojos</p>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">Negocios locales</h2>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">Entrega desde S/. 2</span>
          </div>
          <div className="relative mb-3">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="search" placeholder="Buscar negocio o comida..." value={busqueda}
              onChange={e=>setBusqueda(e.target.value)} aria-label="Buscar negocio local"
              className="w-full bg-slate-100 rounded-full pl-10 pr-10 py-3 text-sm text-slate-900 placeholder-slate-400 border border-transparent shadow-sm focus:outline-none focus:border-orange-500 focus:bg-white transition-all duration-200"/>
            {busqueda && <button onClick={()=>setBusqueda("")} aria-label="Limpiar" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>}
          </div>
        <div className="overflow-x-auto scrollbar-none py-2.5 flex gap-2">
          {CATEGORIAS.map(({label,emoji})=>(
            <button key={label} onClick={()=>setCategoriaActiva(label)} aria-pressed={categoriaActiva===label}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 whitespace-nowrap ${categoriaActiva===label?"bg-slate-900 text-white shadow-lg scale-105":"bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
              <span>{emoji}</span><span>{label}</span>
            </button>
          ))}
        </div>
        {filtrados.length>0 && (
          <div className="flex items-center justify-between my-4">
            <h3 className="text-sm font-extrabold text-slate-700">{categoriaActiva==="Todos"?"Opciones con delivery":categoriaActiva}</h3>
            <span className="text-xs text-slate-400 font-medium bg-white border border-slate-200 px-2.5 py-1 rounded-full shadow-sm">{filtrados.length} aliados</span>
          </div>
        )}
        {filtrados.length===0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-4 text-4xl">🔍</div>
            <p className="font-extrabold text-slate-900 text-base">No encontramos esa opción</p>
            <p className="text-slate-400 text-xs mt-1">Podemos buscarla por encargo para ti.</p>
            <a href={WHATSAPP_DELIVERY_URL} target="_blank" rel="noreferrer" className="mt-5 bg-emerald-500 text-white text-sm font-bold px-6 py-2.5 rounded-full">Pedir por WhatsApp</a>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {filtrados.map((r,i)=><TarjetaBento key={r.id} restaurante={r} index={i} onClick={()=>onSeleccionarRestaurante(r)}/>)}
          </div>
        )}
        </section>
        <div className="mt-6 mb-4 relative overflow-hidden rounded-3xl bg-orange-600 p-5 text-white">
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-orange-600/20" aria-hidden="true"/>
          <div className="absolute -bottom-10 -left-5 w-28 h-28 rounded-full bg-orange-600/10" aria-hidden="true"/>
          <div className="relative">
            <span className="bg-white/15 text-white text-[10px] font-black px-2.5 py-1 rounded-full">DELIVERY A TU MEDIDA</span>
            <p className="font-black text-xl leading-tight mt-2">¿No está en la lista?<br/><span className="text-orange-100">Lo buscamos por ti.</span></p>
            <p className="text-orange-100 text-xs mt-2">Cuéntanos qué necesitas y coordinamos recojo, compra y entrega por WhatsApp.</p>
            <a href={WHATSAPP_DELIVERY_URL} target="_blank" rel="noreferrer" className="inline-flex mt-4 bg-white text-orange-700 font-extrabold text-xs px-4 py-2.5 rounded-full">Coordinar un encargo →</a>
          </div>
        </div>
      </main>
    </div>
  );
}

function TarjetaServicio({servicio}:{servicio:ServicioDelivery}) {
  const enlace = `https://wa.me/${NUMERO_MOTORIZADO}?text=${encodeURIComponent(
    `Hola, necesito coordinar ${servicio.detalle} en Chachapoyas.`
  )}`;

  return (
    <a href={enlace} target="_blank" rel="noreferrer"
      aria-label={`Solicitar ${servicio.titulo} por WhatsApp`}
      className="group relative flex min-h-[178px] flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.5)] transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_16px_30px_-16px_rgba(249,115,22,0.28)] active:scale-[0.98]">
      <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-orange-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
      <div className="relative flex items-start justify-between gap-2">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ring-1 transition-transform duration-300 group-hover:scale-105 ${servicio.estilo}`}>
          <IconoServicio tipo={servicio.icono} />
        </div>
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-100 text-slate-300 transition-all duration-300 group-hover:border-orange-100 group-hover:bg-orange-50 group-hover:text-orange-600" aria-hidden="true">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.3} d="M5 12h14m-6-6 6 6-6 6" />
          </svg>
        </span>
      </div>
      <h3 className="relative mt-4 text-sm font-black leading-tight text-slate-900">{servicio.titulo}</h3>
      <p className="relative mt-1.5 flex-1 text-[11px] font-medium leading-relaxed text-slate-500">{servicio.descripcion}</p>
      <span className="relative mt-3 text-[10px] font-extrabold text-orange-600 opacity-80 transition-opacity group-hover:opacity-100">Coordinar por WhatsApp</span>
    </a>
  );
}

function IconoServicio({tipo}:{tipo:TipoIconoServicio}) {
  const className = "h-5 w-5";

  if (tipo === "comida") return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M4 15h16M6.5 15a5.5 5.5 0 0 1 11 0M3 18h18M12 7.5V6" />
    </svg>
  );
  if (tipo === "compras") return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M5 8h14l-1 12H6L5 8Z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M9 10V6a3 3 0 0 1 6 0v4" />
    </svg>
  );
  if (tipo === "medicinas") return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="m8 16 8-8a3.54 3.54 0 1 1 5 5l-8 8a3.54 3.54 0 0 1-5-5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="m12 12 5 5M5 4v6M2 7h6" />
    </svg>
  );
  if (tipo === "paquetes") return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="m4 7 8-4 8 4-8 4-8-4Z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M4 7v10l8 4 8-4V7M12 11v10" />
    </svg>
  );
  if (tipo === "encomiendas") return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M3 6h11v11H3V6Zm11 4h4l3 3v4h-7v-7Z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    </svg>
  );
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M4 10v10h16V10M3 10l2-6h14l2 6" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M8 20v-6h5v6M3 10a3 3 0 0 0 5 2 3 3 0 0 0 4 0 3 3 0 0 0 4 0 3 3 0 0 0 5-2" />
    </svg>
  );
}

// ─── Tarjeta Bento ────────────────────────────────────────────────────────────
function TarjetaBento({restaurante,index,onClick}:{restaurante:Restaurante;index:number;onClick:()=>void}) {
  const gradient = COVER_GRADIENTS[restaurante.categoria]??"from-slate-400 to-slate-200";
  const emoji    = COVER_EMOJI[restaurante.categoria]??"🍽️";
  const h        = index%3===0?"h-44":"h-36";
  return (
    <button onClick={onClick} aria-label={`Pedir delivery de ${restaurante.nombre}`}
      className="block w-full text-left rounded-3xl bg-white overflow-hidden shadow-md border border-slate-100 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]">
      <div className={`relative w-full ${h} bg-gradient-to-br ${gradient} overflow-hidden`}>
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <span className="text-[96px] leading-none opacity-25 blur-[3px] -rotate-12 scale-125">{emoji}</span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <span className="text-7xl leading-none drop-shadow-lg">{emoji}</span>
        </div>
        <div className="absolute top-3 left-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white/90 shadow-lg ring-2 ring-white">
            <Image src={restaurante.logo_url} alt={`Logo ${restaurante.nombre}`} width={48} height={48} className="object-cover w-full h-full"/>
          </div>
        </div>
        <div className="absolute top-3 right-3">
          <span className="bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">{restaurante.categoria}</span>
        </div>
      </div>
      <div className="px-4 pt-3 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-extrabold text-lg text-slate-900 leading-tight truncate">{restaurante.nombre}</h3>
            <p className="text-slate-500 text-sm mt-0.5 line-clamp-1">{restaurante.descripcion}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
            </svg>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">● Delivery disponible</span>
          <span className="bg-slate-100 text-slate-500 text-xs font-semibold px-2.5 py-1 rounded-full">🛵 Recojo + entrega</span>
        </div>
      </div>
    </button>
  );
}

// ─── Vista: MENÚ ──────────────────────────────────────────────────────────────
function VistaMenu({restaurante,onVolver,agregar,incrementar,decrementar,carrito}:{
  restaurante:Restaurante; onVolver:()=>void;
  agregar:(p:Producto,rid:string,rn:string,rtwa:string,rqr:string)=>void;
  incrementar:(id:string)=>void; decrementar:(id:string)=>void;
  carrito:{items:{producto:Producto;cantidad:number}[];restaurante_id:string|null};
}) {
  const gradient= COVER_GRADIENTS[restaurante.categoria]??"from-slate-400 to-slate-200";
  const emoji   = COVER_EMOJI[restaurante.categoria]??"🍽️";

  const porCategoria = useMemo(()=>{
    const m = new Map<string,Producto[]>();
    const platos = PLATOS_MOCK[restaurante.id]??[];
    platos.forEach(p=>m.set(p.categoria,[...(m.get(p.categoria)??[]),p]));
    return m;
  },[restaurante.id]);

  const getCant = (id:string) => carrito.items.find(i=>i.producto.id===id)?.cantidad??0;

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24">
      {/* Cover */}
      <div className={`relative w-full h-40 bg-gradient-to-br ${gradient} overflow-hidden shrink-0`}>
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <span className="text-[96px] leading-none opacity-25 blur-[3px] -rotate-12 scale-125">{emoji}</span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <span className="text-7xl leading-none drop-shadow-lg">{emoji}</span>
        </div>
        <button onClick={onVolver} aria-label="Volver"
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
      </div>
      {/* Header restaurante */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 ring-2 ring-slate-200 shrink-0">
          <Image src={restaurante.logo_url} alt={restaurante.nombre} width={48} height={48} className="object-cover"/>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-extrabold text-slate-900 text-base leading-tight truncate">{restaurante.nombre}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">● Abierto</span>
            <span className="text-slate-400 text-[10px]">{restaurante.categoria}</span>
          </div>
        </div>
      </div>
      {/* Platos */}
      <main className="flex-1 px-4 pt-4">
        {Array.from(porCategoria.entries()).map(([cat,ps])=>(
          <section key={cat} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-slate-100"/><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cat}</span><div className="h-px flex-1 bg-slate-100"/>
            </div>
            <div className="flex flex-col gap-3">
              {ps.map(p=>{
                const c=getCant(p.id);
                return (
                  <div key={p.id} className={`flex items-center gap-3 bg-white rounded-2xl p-3 border transition-all duration-200 ${c>0?"border-orange-200 shadow-md shadow-orange-50":"border-slate-100 shadow-sm"} ${!p.disponible?"opacity-50":""}`}>
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-3xl shrink-0">{emoji}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-sm leading-snug">{p.nombre}</p>
                      <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{p.descripcion}</p>
                      <p className={`font-extrabold text-sm mt-1.5 ${c>0?"text-orange-600":"text-slate-800"}`}>S/. {p.precio.toFixed(2)}</p>
                    </div>
                    <div className="shrink-0">
                      {!p.disponible?<span className="text-[10px] text-slate-400">Agotado</span>
                      :c===0?<button onClick={()=>agregar(p,restaurante.id,restaurante.nombre,restaurante.telefono_wa,restaurante.qr_yape_url)} aria-label={`Agregar ${p.nombre}`} className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl px-3 py-2 text-xs font-bold transition-colors shadow-sm shadow-orange-200">+ Agregar</button>
                      :<div className="flex items-center gap-1.5">
                        <button onClick={()=>decrementar(p.id)} aria-label="Quitar uno" className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center">−</button>
                        <span className="w-5 text-center font-extrabold text-orange-600 text-sm">{c}</span>
                        <button onClick={()=>incrementar(p.id)} aria-label="Agregar uno más" className="w-8 h-8 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold flex items-center justify-center">+</button>
                      </div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}

// ─── Vista: CARRITO (wrapper) ─────────────────────────────────────────────────
function VistaCarrito({onVolver,totalItems,subtotal}:{onVolver:()=>void;totalItems:number;subtotal:number}) {
  const { carrito } = useCarrito();
  if (totalItems===0) return (
    <div className="flex flex-col items-center justify-center h-full pb-24 text-center px-8">
      <div className="w-24 h-24 rounded-3xl bg-orange-50 flex items-center justify-center mb-5 text-5xl">🛵</div>
      <p className="font-extrabold text-slate-900 text-xl">Tu pedido está vacío</p>
      <p className="text-slate-400 text-sm mt-1">Elige un negocio y nosotros hacemos la entrega</p>
      <button onClick={onVolver} className="mt-6 bg-slate-900 text-white font-bold px-7 py-3 rounded-2xl text-sm">Explorar opciones</button>
    </div>
  );
  return <ChatbotPedido onVolver={onVolver} totalItems={totalItems} subtotal={subtotal} carrito={carrito}/>;
}
// ─── Chatbot de pedido ────────────────────────────────────────────────────────
function ChatbotPedido({onVolver,totalItems,subtotal,carrito}:{
  onVolver:()=>void; totalItems:number; subtotal:number;
  carrito:EstadoCarrito;
}) {
  const [paso,setPaso]               = useState<PasoChat>("nombre");
  const [mensajes,setMensajes]       = useState<MensajeChat[]>([]);
  const [input,setInput]             = useState("");
  const [nombre,setNombre]           = useState("");
  const [telefono,setTelefono]       = useState("");
  const [direccion,setDireccion]     = useState("");
  const [zonaId,setZonaId]           = useState("");
  const [metodoPago,setMetodoPago]   = useState<MetodoPago|"">("");
  const chatRef                      = useRef<HTMLDivElement>(null);

  const zonaSeleccionada = ZONAS.find(z=>z.id===zonaId);
  const costoEnvio       = zonaSeleccionada?.costo_envio??0;
  const total            = subtotal+costoEnvio;

  const uid = () => Math.random().toString(36).slice(2);

  const botMsg = (texto:string):MensajeChat => ({id:uid(),tipo:"bot",texto});
  const usrMsg = (texto:string):MensajeChat => ({id:uid(),tipo:"usuario",texto});

  // Mensaje inicial
  useEffect(()=>{
    setMensajes([botMsg(`👋 ¡Hola! Soy tu coordinador de delivery de *ChachaFast*.\n\nTienes *${totalItems} producto${totalItems!==1?"s":""}* listo${totalItems!==1?"s":""} para recoger por S/. ${subtotal.toFixed(2)}.\n\n¿Cuál es tu *nombre completo*?`)]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  useEffect(()=>{
    setTimeout(()=>chatRef.current?.scrollTo({top:chatRef.current.scrollHeight,behavior:"smooth"}),80);
  },[mensajes]);

  const agregarMensajes = (msgs:MensajeChat[]) => setMensajes(prev=>[...prev,...msgs]);

  const enviarInput = () => {
    const val = input.trim();
    if (!val) return;
    setInput("");

    if (paso==="nombre") {
      setNombre(val);
      agregarMensajes([usrMsg(val), botMsg(`Perfecto, *${val}*! 📱\n\n¿Cuál es tu número de celular (WhatsApp)?`)]);
      setPaso("direccion");
    } else if (paso==="direccion") {
      // primer campo en este paso es teléfono, luego dirección
      if (!telefono) {
        if (!/^\d{9}$/.test(val)) {
          agregarMensajes([usrMsg(val), botMsg("⚠️ Ingresa un número válido de 9 dígitos.")]);
          return;
        }
        setTelefono(val);
        agregarMensajes([usrMsg(val), botMsg(`Genial! 📍\n\n¿Cuál es tu *dirección exacta* en Chachapoyas?\n_(Ej: Jr. Grau 123, frente al mercado)_`)]);
      } else {
        setDireccion(val);
        const listaZonas = ZONAS.map(z=>`• ${z.nombre} — ${z.costo_envio===null?"A coordinar":`S/. ${z.costo_envio.toFixed(2)}`}`).join("\n");
        agregarMensajes([usrMsg(val), botMsg(`Anotado! 🗺️\n\nEl costo de envío depende de tu zona. Selecciona la tuya:\n\n${listaZonas}`)]);
        setPaso("zona");
      }
    }
  };

  const seleccionarZona = (z:Zona) => {
    setZonaId(z.id);
    const envioTexto = z.costo_envio===null?"a coordinar":`S/. ${z.costo_envio.toFixed(2)}`;
    agregarMensajes([
      usrMsg(z.nombre),
      botMsg(`Zona *${z.nombre}* seleccionada. El envío es ${envioTexto}. 💳\n\n¿Cómo vas a pagar?`),
    ]);
    setPaso("pago");
  };

  const seleccionarPago = (m:MetodoPago) => {
    setMetodoPago(m);
    const texto = m==="efectivo"?"💵 Efectivo":"📱 Yape / Plin";
    const resumen = carrito.items.map(i=>`• ${i.cantidad}x ${i.producto.nombre} — S/. ${(i.producto.precio*i.cantidad).toFixed(2)}`).join("\n");
    agregarMensajes([
      usrMsg(texto),
      botMsg(`¡Todo listo! 🎉\n\n*Resumen de tu delivery:*\n${resumen}\n────────────\nEntrega: ${costoEnvio===0?"A coordinar":`S/. ${costoEnvio.toFixed(2)}`}\n*TOTAL: S/. ${total.toFixed(2)}*\n────────────\nPago: ${texto}\n\n¿Confirmas el recojo y la entrega? 🛵`),
    ]);
    setPaso("confirmacion");
  };

  const confirmarPedido = () => {
    if (!zonaSeleccionada) return;
    const pedidoId = `${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
    const enlace = generarEnlaceWhatsApp({
      pedidoId, clienteNombre:nombre, clienteTelefono:telefono,
      direccion, zona:zonaSeleccionada,
      items: carrito.items,
      subtotal, costoEnvio, total, metodoPago:metodoPago as MetodoPago,
      telefonoNegocio: carrito.restaurante_telefono_wa??NUMERO_MOTORIZADO,
    });
    window.open(enlace,"_blank");
    agregarMensajes([botMsg("✅ *¡Delivery solicitado!*\n\nEn breve coordinaremos el recojo y recibirás la confirmación por WhatsApp. ¡Gracias por elegir ChachaFast! 🛵")]);
    localStorage.setItem(`pedido_previo_${telefono}`,pedidoId);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={onVolver} aria-label="Volver" className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-lg shadow-md shadow-orange-200">🛵</div>
        <div className="flex-1">
          <p className="font-extrabold text-slate-900 text-sm leading-tight">Coordinador ChachaFast</p>
          <div className="flex items-center gap-1 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>
            <p className="text-[10px] text-emerald-600 font-semibold">En línea</p>
          </div>
        </div>
        <div className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-full">
          {totalItems} ítem{totalItems!==1?"s":""}
        </div>
      </header>

      {/* Área de mensajes — crece y hace scroll, con padding bottom para no quedar bajo el panel fijo */}
      <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 pb-6">
        {mensajes.map(m=>(
          <div key={m.id} className={`flex gap-2 ${m.tipo==="usuario"?"justify-end":"justify-start"}`}>
            {m.tipo==="bot" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-sm shrink-0 mt-0.5 shadow-sm">🛵</div>
            )}
            <div
              className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm whitespace-pre-line
                          ${m.tipo==="bot"
                            ?"bg-white text-slate-800 rounded-tl-sm border border-slate-100"
                            :"bg-orange-600 text-white rounded-tr-sm"}`}
              dangerouslySetInnerHTML={{__html:m.texto.replace(/\*(.*?)\*/g,"<strong>$1</strong>").replace(/_(.*?)_/g,"<em>$1</em>")}}
            />
          </div>
        ))}
      </div>

      {/* ── Panel de acción fijo — SIEMPRE visible encima de la navbar ── */}
      <div className="shrink-0 bg-white border-t border-slate-100 px-4 pt-3 pb-24 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">

        {/* Input de texto: pasos nombre y dirección */}
        {(paso==="nombre" || paso==="direccion") && (
          <div className="flex gap-2">
            <input
              type={paso==="direccion" && !telefono ? "tel" : "text"}
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter" && enviarInput()}
              maxLength={paso==="direccion" && !telefono ? 9 : undefined}
              placeholder={
                paso==="nombre" ? "Tu nombre completo..."
                : !telefono ? "Tu número de celular (9 dígitos)..."
                : "Tu dirección exacta..."
              }
              className="flex-1 bg-slate-100 rounded-full px-4 py-3 text-sm text-slate-900 placeholder-slate-400 border border-transparent focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
              aria-label="Respuesta al chatbot"
            />
            <button
              onClick={enviarInput}
              className="w-11 h-11 rounded-full bg-orange-600 text-white flex items-center justify-center hover:bg-orange-700 transition-colors shadow-md shadow-orange-200 shrink-0"
              aria-label="Enviar respuesta"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
            </button>
          </div>
        )}

        {/* Botones de zona */}
        {paso==="zona" && (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">Selecciona tu zona</p>
            {ZONAS.map(z=>(
              <button
                key={z.id}
                onClick={()=>seleccionarZona(z)}
                className="w-full text-left bg-slate-50 border border-slate-200 hover:border-orange-400 hover:bg-orange-50
                           active:bg-orange-100 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700
                           transition-all duration-150 flex items-center justify-between"
              >
                <span>📍 {z.nombre}</span>
                <span className="text-orange-600 font-bold text-xs">
                  {z.costo_envio===null ? "A coordinar" : `S/. ${z.costo_envio.toFixed(2)}`}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Botones de método de pago */}
        {paso==="pago" && (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">¿Cómo vas a pagar?</p>
            <div className="flex gap-3">
              {(["efectivo","yape"] as MetodoPago[]).map(m=>(
                <button
                  key={m}
                  onClick={()=>seleccionarPago(m)}
                  className="flex-1 bg-slate-50 border-2 border-slate-200 hover:border-orange-400 hover:bg-orange-50
                             active:bg-orange-100 rounded-2xl px-3 py-4 flex flex-col items-center gap-2
                             transition-all duration-150"
                >
                  <span className="text-3xl">{m==="efectivo"?"💵":"📱"}</span>
                  <span className="text-sm font-bold text-slate-700">{m==="efectivo"?"Efectivo":"Yape / Plin"}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Botón confirmar pedido */}
        {paso==="confirmacion" && (
          <button
            onClick={confirmarPedido}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white font-extrabold
                       py-4 rounded-2xl text-sm shadow-lg shadow-emerald-200 flex items-center justify-center gap-2
                       hover:from-emerald-600 hover:to-green-600 active:scale-[0.98] transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.528 5.852L.057 23.57a.5.5 0 00.616.635l5.92-1.55A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.803 9.803 0 01-5.028-1.382l-.36-.214-3.722.975.992-3.624-.234-.373A9.787 9.787 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
            </svg>
            Confirmar delivery por WhatsApp
          </button>
        )}

        {/* Estado enviado — ya no hay acción pendiente */}
        {paso==="nombre" || paso==="direccion" || paso==="zona" || paso==="pago" || paso==="confirmacion"
          ? null
          : <p className="text-center text-xs text-slate-400 py-2">Pedido procesado ✅</p>
        }
      </div>
    </div>
  );
}

// ─── Navbar inferior flotante ─────────────────────────────────────────────────
function NavbarInferior({vistaActual,totalItems,subtotal,onInicio,onCarrito}:{
  vistaActual:Vista; totalItems:number; subtotal:number; onInicio:()=>void; onCarrito:()=>void;
}) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[390px]">
      <nav className="bg-slate-900/95 backdrop-blur-lg rounded-2xl px-4 py-3 flex justify-between items-center shadow-2xl border border-slate-700/50"
        aria-label="Navegación principal">

        {/* Inicio */}
        <button onClick={onInicio}
          className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200
                      ${vistaActual==="inicio"||vistaActual==="menu"
                        ?"bg-orange-600 text-white shadow-md shadow-orange-900/40"
                        :"bg-slate-800 text-slate-400"}`}
          aria-label="Ir al inicio">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          <span className="text-[10px] font-bold">Delivery</span>
        </button>

        <div className="w-px h-8 bg-slate-700" aria-hidden="true"/>

        {/* Carrito */}
        <button onClick={onCarrito}
          className={`flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-200
                      ${vistaActual==="carrito"
                        ?"bg-orange-600 text-white shadow-lg shadow-orange-900/40 scale-105"
                        :totalItems>0
                        ?"bg-orange-600/80 text-white scale-105"
                        :"bg-slate-800 text-slate-400"}`}
          aria-label={`Pedido con ${totalItems} productos`}>
          <div className="relative">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            {totalItems>0 && (
              <span className="absolute -top-2 -right-2 bg-white text-orange-600 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {totalItems}
              </span>
            )}
          </div>
          <div>
            <p className="text-xs font-bold leading-none">{totalItems>0?"Ver pedido":"Mi pedido"}</p>
            {totalItems>0 && <p className="text-[11px] font-extrabold mt-0.5 text-orange-100">S/. {subtotal.toFixed(2)}</p>}
          </div>
        </button>
      </nav>
    </div>
  );
}

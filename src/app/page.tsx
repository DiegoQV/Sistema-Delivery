"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import { useCarrito } from "@/context/CarritoContext";
import { RESTAURANTES_MOCK } from "@/data/mock";
import { ZONAS } from "@/data/zonas";
import { generarEnlaceWhatsApp } from "@/lib/whatsapp";
import type { Restaurante, Producto, MetodoPago, Zona } from "@/types";

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
        vistaActual={vistaActual} totalItems={totalItems}
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
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
                <p className="text-[11px] font-semibold text-slate-400 tracking-wide uppercase">Chachapoyas · Amazonas</p>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                Chacha<span className="text-orange-600">Fast</span>
              </h1>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="bg-orange-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-md shadow-orange-200">🚀 LANZAMIENTO</div>
              <p className="text-[10px] text-slate-400 font-medium">1er envío gratis +S/.20</p>
            </div>
          </div>
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="search" placeholder="Buscar restaurante o plato..." value={busqueda}
              onChange={e=>setBusqueda(e.target.value)} aria-label="Buscar restaurante"
              className="w-full bg-slate-100 rounded-full pl-10 pr-10 py-3 text-sm text-slate-900 placeholder-slate-400 border border-transparent shadow-sm focus:outline-none focus:border-orange-500 focus:bg-white transition-all duration-200"/>
            {busqueda && <button onClick={()=>setBusqueda("")} aria-label="Limpiar" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>}
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-none px-5 py-2.5 flex gap-2">
          {CATEGORIAS.map(({label,emoji})=>(
            <button key={label} onClick={()=>setCategoriaActiva(label)} aria-pressed={categoriaActiva===label}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 whitespace-nowrap ${categoriaActiva===label?"bg-slate-900 text-white shadow-lg scale-105":"bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
              <span>{emoji}</span><span>{label}</span>
            </button>
          ))}
        </div>
      </header>
      <main className="flex-1 px-4 pt-5">
        {filtrados.length>0 && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold text-slate-900">{categoriaActiva==="Todos"?"Todos los restaurantes":categoriaActiva}</h2>
            <span className="text-xs text-slate-400 font-medium bg-white border border-slate-200 px-2.5 py-1 rounded-full shadow-sm">{filtrados.length} disponibles</span>
          </div>
        )}
        {filtrados.length===0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-4 text-4xl">🔍</div>
            <p className="font-extrabold text-slate-900 text-base">Sin resultados</p>
            <button onClick={()=>{setBusqueda("");setCategoriaActiva("Todos");}} className="mt-5 bg-slate-900 text-white text-sm font-bold px-6 py-2.5 rounded-full">Ver todos</button>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {filtrados.map((r,i)=><TarjetaBento key={r.id} restaurante={r} index={i} onClick={()=>onSeleccionarRestaurante(r)}/>)}
          </div>
        )}
        <div className="mt-5 mb-4 relative overflow-hidden rounded-3xl bg-slate-900 p-5 text-white">
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-orange-600/20" aria-hidden="true"/>
          <div className="absolute -bottom-10 -left-5 w-28 h-28 rounded-full bg-orange-600/10" aria-hidden="true"/>
          <div className="relative">
            <span className="bg-orange-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full">🚀 SOLO POR LANZAMIENTO</span>
            <p className="font-black text-xl leading-tight mt-2">Tu primer envío<br/><span className="text-orange-400">completamente gratis</span></p>
            <p className="text-slate-400 text-xs mt-2">En pedidos mayores a <span className="text-white font-bold">S/. 20.00</span>. Solo nuevos usuarios.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Tarjeta Bento ────────────────────────────────────────────────────────────
function TarjetaBento({restaurante,index,onClick}:{restaurante:Restaurante;index:number;onClick:()=>void}) {
  const gradient = COVER_GRADIENTS[restaurante.categoria]??"from-slate-400 to-slate-200";
  const emoji    = COVER_EMOJI[restaurante.categoria]??"🍽️";
  const h        = index%3===0?"h-44":"h-36";
  return (
    <button onClick={onClick} aria-label={`Ver menú de ${restaurante.nombre}`}
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
          <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">● Abierto</span>
          <span className="bg-slate-100 text-slate-500 text-xs font-semibold px-2.5 py-1 rounded-full">🛵 Desde S/. 2.00</span>
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
  const platos  = PLATOS_MOCK[restaurante.id]??[];
  const gradient= COVER_GRADIENTS[restaurante.categoria]??"from-slate-400 to-slate-200";
  const emoji   = COVER_EMOJI[restaurante.categoria]??"🍽️";

  const porCategoria = useMemo(()=>{
    const m = new Map<string,Producto[]>();
    platos.forEach(p=>m.set(p.categoria,[...(m.get(p.categoria)??[]),p]));
    return m;
  },[platos]);

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
      <div className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center mb-5 text-5xl">🛒</div>
      <p className="font-extrabold text-slate-900 text-xl">Carrito vacío</p>
      <p className="text-slate-400 text-sm mt-1">Agrega productos para continuar</p>
      <button onClick={onVolver} className="mt-6 bg-slate-900 text-white font-bold px-7 py-3 rounded-2xl text-sm">Ver restaurantes</button>
    </div>
  );
  return <ChatbotPedido onVolver={onVolver} totalItems={totalItems} subtotal={subtotal} carrito={carrito}/>;
}

// ─── Chatbot de pedido ────────────────────────────────────────────────────────
function ChatbotPedido({onVolver,totalItems,subtotal,carrito}:{
  onVolver:()=>void; totalItems:number; subtotal:number;
  carrito:{items:{producto:{id:string;nombre:string;precio:number};cantidad:number}[];restaurante_id:string|null;restaurante_nombre:string|null;restaurante_telefono_wa:string|null;restaurante_qr_yape_url:string|null};
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
    setMensajes([botMsg(`👋 ¡Hola! Soy el asistente de *ChachaFast*.\n\nTienes *${totalItems} producto${totalItems!==1?"s":""}* por S/. ${subtotal.toFixed(2)}.\n\n¿Cuál es tu *nombre completo*?`)]);
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
      botMsg(`Todo listo! 🎉\n\n*Resumen de tu pedido:*\n${resumen}\n────────────\nEnvío: ${costoEnvio===0?"A coordinar":`S/. ${costoEnvio.toFixed(2)}`}\n*TOTAL: S/. ${total.toFixed(2)}*\n────────────\nPago: ${texto}\n\n¿Confirmas y enviamos al motorizado? 🛵`),
    ]);
    setPaso("confirmacion");
  };

  const confirmarPedido = () => {
    if (!zonaSeleccionada) return;
    const pedidoId = `${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
    const enlace = generarEnlaceWhatsApp({
      pedidoId, clienteNombre:nombre, clienteTelefono:telefono,
      direccion, zona:zonaSeleccionada,
      items: carrito.items.map(i=>({producto:i.producto as Parameters<typeof generarEnlaceWhatsApp>[0]["items"][0]["producto"],cantidad:i.cantidad})),
      subtotal, costoEnvio, total, metodoPago:metodoPago as MetodoPago,
      telefonoNegocio: carrito.restaurante_telefono_wa??NUMERO_MOTORIZADO,
    });
    window.open(enlace,"_blank");
    agregarMensajes([botMsg("✅ *¡Pedido enviado al motorizado!*\n\nEn breve recibirás confirmación por WhatsApp. ¡Gracias por elegir ChachaFast! 🛵")]);
    localStorage.setItem(`pedido_previo_${telefono}`,pedidoId);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center gap-3">
        <button onClick={onVolver} aria-label="Volver" className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        {/* Avatar bot */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-lg shadow-md shadow-orange-200">🤖</div>
        <div className="flex-1">
          <p className="font-extrabold text-slate-900 text-sm leading-tight">Asistente ChachaFast</p>
          <div className="flex items-center gap-1 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>
            <p className="text-[10px] text-emerald-600 font-semibold">En línea</p>
          </div>
        </div>
        <div className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-full">
          {totalItems} ítem{totalItems!==1?"s":""}
        </div>
      </header>

      {/* Burbujass */}
      <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {mensajes.map(m=>(
          <div key={m.id} className={`flex gap-2 ${m.tipo==="usuario"?"justify-end":"justify-start"}`}>
            {m.tipo==="bot" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-sm shrink-0 mt-0.5 shadow-sm">🤖</div>
            )}
            <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm whitespace-pre-line
                            ${m.tipo==="bot"
                              ?"bg-white text-slate-800 rounded-tl-sm border border-slate-100"
                              :"bg-orange-600 text-white rounded-tr-sm"}`}
              dangerouslySetInnerHTML={{__html:m.texto.replace(/\*(.*?)\*/g,"<strong>$1</strong>").replace(/_(.*?)_/g,"<em>$1</em>")}}>
            </div>
          </div>
        ))}

        {/* Opciones rápidas según paso */}
        {paso==="zona" && (
          <div className="flex flex-col gap-2 pl-10">
            {ZONAS.map(z=>(
              <button key={z.id} onClick={()=>seleccionarZona(z)}
                className="text-left bg-white border border-slate-200 hover:border-orange-400 hover:bg-orange-50
                           rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-150 shadow-sm">
                📍 {z.nombre} — {z.costo_envio===null?"A coordinar":`S/. ${z.costo_envio.toFixed(2)}`}
              </button>
            ))}
          </div>
        )}

        {paso==="pago" && (
          <div className="flex gap-2 pl-10">
            {(["efectivo","yape"] as MetodoPago[]).map(m=>(
              <button key={m} onClick={()=>seleccionarPago(m)}
                className="flex-1 bg-white border border-slate-200 hover:border-orange-400 hover:bg-orange-50
                           rounded-2xl px-3 py-3 flex flex-col items-center gap-1 transition-all duration-150 shadow-sm">
                <span className="text-2xl">{m==="efectivo"?"💵":"📱"}</span>
                <span className="text-xs font-bold text-slate-700">{m==="efectivo"?"Efectivo":"Yape / Plin"}</span>
              </button>
            ))}
          </div>
        )}

        {paso==="confirmacion" && (
          <div className="pl-10">
            <button onClick={confirmarPedido}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white font-extrabold
                         py-4 rounded-2xl text-sm shadow-lg shadow-emerald-200 flex items-center justify-center gap-2
                         hover:from-emerald-600 hover:to-green-600 transition-all duration-200">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.528 5.852L.057 23.57a.5.5 0 00.616.635l5.92-1.55A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.803 9.803 0 01-5.028-1.382l-.36-.214-3.722.975.992-3.624-.234-.373A9.787 9.787 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
              </svg>
              Confirmar y enviar al motorizado
            </button>
          </div>
        )}
      </div>

      {/* Input de texto (pasos nombre, dirección/teléfono) */}
      {(paso==="nombre"||(paso==="direccion")) && (
        <div className="px-4 pb-24 pt-2 bg-white border-t border-slate-100">
          <div className="flex gap-2">
            <input
              type={paso==="direccion"&&!telefono?"tel":"text"}
              value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&enviarInput()}
              maxLength={paso==="direccion"&&!telefono?9:undefined}
              placeholder={
                paso==="nombre"?"Tu nombre completo..."
                :!telefono?"Tu número de celular (9 dígitos)..."
                :"Tu dirección exacta..."
              }
              className="flex-1 bg-slate-100 rounded-full px-4 py-3 text-sm text-slate-900 placeholder-slate-400 border border-transparent focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
              aria-label="Respuesta al chatbot"
            />
            <button onClick={enviarInput}
              className="w-11 h-11 rounded-full bg-orange-600 text-white flex items-center justify-center hover:bg-orange-700 transition-colors shadow-md shadow-orange-200"
              aria-label="Enviar respuesta">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Navbar inferior flotante ─────────────────────────────────────────────────
function NavbarInferior({vistaActual,totalItems,onInicio,onCarrito}:{
  vistaActual:Vista; totalItems:number; onInicio:()=>void; onCarrito:()=>void;
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
          <span className="text-[10px] font-bold">Inicio</span>
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
          aria-label={`Carrito con ${totalItems} productos`}>
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
            <p className="text-xs font-bold leading-none">{totalItems>0?"Ver carrito":"Carrito"}</p>
            {totalItems>0 && <p className="text-[11px] font-extrabold mt-0.5 text-orange-100">S/. {(0).toFixed(2)}</p>}
          </div>
        </button>
      </nav>
    </div>
  );
}

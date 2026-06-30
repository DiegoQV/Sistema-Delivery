"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type ServicioId = "compras" | "medicinas" | "paquetes" | "documentos" | "encomiendas" | "express";

interface Servicio {
  id: ServicioId;
  titulo: string;
  descripcion: string;
  etiqueta: string;
  estilo: string;
  preguntas: string[];
}

interface MensajeChat {
  id: string;
  autor: "asistente" | "usuario";
  texto: string;
}

const NUMERO_WHATSAPP = "51987654321";
const WHATSAPP_URL = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(
  "Hola, deseo solicitar un servicio de delivery en Chachapoyas."
)}`;

const SERVICIOS: Servicio[] = [
  {
    id: "compras",
    titulo: "Compras por encargo",
    descripcion: "Compramos por ti y entregamos donde nos indiques.",
    etiqueta: "Compra asistida",
    estilo: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    preguntas: [
      "¿Qué producto necesitas comprar?",
      "¿En qué tienda o zona debemos recogerlo?",
      "¿A qué dirección debemos entregarlo?",
      "¿Tienes alguna referencia?",
      "¿Cuál será tu método de pago?",
      "¿Cuál es tu número de contacto?",
    ],
  },
  {
    id: "medicinas",
    titulo: "Entrega de medicamentos",
    descripcion: "Recojo cuidadoso en boticas y entrega a domicilio.",
    etiqueta: "Entrega prioritaria",
    estilo: "bg-blue-50 text-blue-600 ring-blue-100",
    preguntas: [
      "¿Qué medicamento o producto necesitas?",
      "¿En qué farmacia debemos recogerlo?",
      "¿Cuál es la dirección de entrega?",
      "¿Tienes una referencia del domicilio?",
      "¿Cuál será tu método de pago?",
      "¿Cuál es tu número de contacto?",
    ],
  },
  {
    id: "paquetes",
    titulo: "Recojo de paquetes",
    descripcion: "Trasladamos paquetes pequeños de forma segura.",
    etiqueta: "Recojo seguro",
    estilo: "bg-violet-50 text-violet-600 ring-violet-100",
    preguntas: [
      "¿Dónde debemos recoger el paquete?",
      "¿A qué dirección debemos entregarlo?",
      "¿Qué tipo de paquete enviaremos?",
      "¿Tienes referencias para el recojo o la entrega?",
      "¿Cuál será tu método de pago?",
      "¿Cuál es tu número de contacto?",
    ],
  },
  {
    id: "documentos",
    titulo: "Recojo de documentos",
    descripcion: "Documentos importantes entregados con cuidado.",
    etiqueta: "Manejo cuidadoso",
    estilo: "bg-rose-50 text-rose-600 ring-rose-100",
    preguntas: [
      "¿Dónde debemos recoger los documentos?",
      "¿A qué dirección debemos entregarlos?",
      "¿Quién nos entregará los documentos?",
      "¿Quién debe recibirlos?",
      "¿Cuál será tu método de pago?",
      "¿Cuál es tu número de contacto?",
    ],
  },
  {
    id: "encomiendas",
    titulo: "Encomiendas locales",
    descripcion: "Envíos coordinados dentro de Chachapoyas.",
    etiqueta: "Cobertura local",
    estilo: "bg-cyan-50 text-cyan-600 ring-cyan-100",
    preguntas: [
      "¿Dónde debemos recoger la encomienda?",
      "¿Cuál es el destino de la entrega?",
      "¿Qué deseas enviar?",
      "¿Tienes referencias para ambos puntos?",
      "¿Cuál será tu método de pago?",
      "¿Cuál es tu número de contacto?",
    ],
  },
  {
    id: "express",
    titulo: "Delivery Express",
    descripcion: "Atención prioritaria para entregas que no pueden esperar.",
    etiqueta: "Prioridad alta",
    estilo: "bg-amber-50 text-amber-600 ring-amber-100",
    preguntas: [
      "¿Dónde debemos recoger?",
      "¿Dónde debemos entregar?",
      "¿Qué deseas enviar?",
      "¿Tienes alguna referencia importante?",
      "¿Cuál será tu método de pago?",
      "¿Cuál es tu número de contacto?",
    ],
  },
];

export default function HomePage() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [asistenteAbierto, setAsistenteAbierto] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<Servicio | null>(null);
  const [sesion, setSesion] = useState(0);

  const seleccionarServicio = (servicio:Servicio) => {
    setServicioSeleccionado(servicio);
    setSesion(valor => valor + 1);
    setAsistenteAbierto(true);
  };

  const abrirAsistente = () => {
    setServicioSeleccionado(null);
    setSesion(valor => valor + 1);
    setAsistenteAbierto(true);
  };

  const irA = (id:string) => {
    setMenuAbierto(false);
    document.getElementById(id)?.scrollIntoView({ behavior:"smooth", block:"start" });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f9fc] text-slate-950">
      <Header onMenu={() => setMenuAbierto(true)} onServicios={() => irA("servicios")} onAsistente={abrirAsistente} />

      <main>
        <Hero onSolicitar={abrirAsistente} onServicios={() => irA("servicios")} />
        <Metricas />
        <Servicios onSeleccionar={seleccionarServicio} />
        <Confianza onSolicitar={abrirAsistente} />
      </main>

      <Footer onServicios={() => irA("servicios")} onAsistente={abrirAsistente} />

      <MenuMovil abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} onIr={irA} onAsistente={abrirAsistente} />
      <AsistenteDelivery
        abierto={asistenteAbierto}
        servicio={servicioSeleccionado}
        sesion={sesion}
        onCerrar={() => setAsistenteAbierto(false)}
        onAbrir={abrirAsistente}
        onSeleccionar={seleccionarServicio}
      />
    </div>
  );
}

function Header({onMenu,onServicios,onAsistente}:{onMenu:()=>void;onServicios:()=>void;onAsistente:()=>void}) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#061329]/95 px-4 py-3 text-white shadow-lg shadow-slate-950/10 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[430px] items-center gap-3">
        <button onClick={onMenu} type="button" aria-label="Abrir navegación" className="tap-target -ml-1 rounded-xl text-slate-300 transition-colors hover:bg-white/10 hover:text-white">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeWidth={2.2} d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <button type="button" onClick={() => window.scrollTo({top:0,behavior:"smooth"})} className="flex min-w-0 flex-1 items-center gap-2 text-left">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-amber-400 text-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.15)]">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m13.3 2-8 11H11l-.3 9 8-12H13l.3-8Z" /></svg>
          </span>
          <span className="min-w-0">
            <span className="block truncate text-xl font-black leading-none tracking-tight">Chacha<span className="text-amber-400">Fast</span></span>
            <span className="mt-1 flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Delivery activo</span>
          </span>
        </button>
        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" aria-label="Contactar por WhatsApp" className="flex min-h-11 items-center gap-2 rounded-full bg-emerald-500 px-3.5 text-xs font-black shadow-lg shadow-emerald-950/20 transition-all hover:bg-emerald-400 active:scale-95">
          <IconoWhatsApp className="h-4 w-4" />
          <span className="hidden min-[370px]:inline">WhatsApp</span>
        </a>
      </div>
      <nav className="sr-only" aria-label="Navegación principal">
        <button onClick={onServicios}>Servicios</button><button onClick={onAsistente}>Asistente</button>
      </nav>
    </header>
  );
}

function Hero({onSolicitar,onServicios}:{onSolicitar:()=>void;onServicios:()=>void}) {
  return (
    <section id="inicio" className="px-3 pt-3">
      <div className="relative min-h-[720px] overflow-hidden rounded-[2rem] bg-[#061329] text-white shadow-[0_30px_80px_-32px_rgba(2,12,32,0.75)]">
        <Image src="/images/delivery-rider-chachapoyas.webp" alt="Repartidor local de ChachaFast en Chachapoyas" fill priority sizes="(max-width: 430px) 100vw, 430px" className="hero-drift object-cover object-[62%_center]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#061329]/95 via-[#061329]/72 to-[#061329]/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#061329]/85 via-[#061329]/20 to-transparent" />
        <div className="absolute -left-16 top-32 h-56 w-56 rounded-full bg-blue-500/15 blur-3xl" aria-hidden="true" />

        <div className="relative z-10 px-6 pb-52 pt-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-slate-950/35 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-amber-300 backdrop-blur-md">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m13.3 2-8 11H11l-.3 9 8-12H13l.3-8Z" /></svg>
            Delivery activo en Chachapoyas
          </div>
          <h1 className="mt-6 max-w-[340px] text-[2.7rem] font-black leading-[0.98] tracking-[-0.045em] min-[390px]:text-[3rem]">
            Tu delivery<br/><span className="text-amber-400">rápido y seguro</span>
          </h1>
          <p className="mt-5 max-w-[315px] text-[15px] font-semibold leading-relaxed text-slate-200">
            Recojos, compras por encargo, medicamentos y encomiendas. Estamos cerca para ayudarte en minutos.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button onClick={onSolicitar} type="button" className="flex min-h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-emerald-500 px-5 text-sm font-black shadow-[0_16px_35px_-14px_rgba(16,185,129,0.85)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-400 active:scale-[0.98]">
              <IconoWhatsApp className="h-5 w-5" /> Solicitar Delivery
            </button>
            <button onClick={onServicios} type="button" className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-white/30 bg-slate-950/30 px-5 text-sm font-black backdrop-blur-md transition-all duration-300 hover:bg-white/10 active:scale-[0.98]">
              Ver servicios
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="m6 9 6 6 6-6" /></svg>
            </button>
          </div>
        </div>

        <div className="absolute inset-x-3 bottom-3 z-10 grid grid-cols-3 gap-2">
          {[
            {icono:"rayo",titulo:"Entrega rápida",detalle:"en minutos"},
            {icono:"ubicacion",titulo:"Cobertura local",detalle:"en la ciudad"},
            {icono:"escudo",titulo:"Atención real",detalle:"y confiable"},
          ].map(item => (
            <div key={item.titulo} className="rounded-2xl border border-white/15 bg-[#0c2747]/80 px-2 py-3 text-center shadow-xl backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1">
              <span className="mx-auto flex h-8 w-8 items-center justify-center text-amber-400"><IconoBeneficio tipo={item.icono} /></span>
              <p className="mt-1 text-[10px] font-black leading-tight">{item.titulo}</p>
              <p className="mt-0.5 text-[9px] font-semibold text-slate-300">{item.detalle}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Metricas() {
  const items = [
    {icono:"moto",eyebrow:"Desde",valor:"S/ 3.00",detalle:"Precio accesible",color:"text-amber-500"},
    {icono:"whatsapp",eyebrow:"Atención por",valor:"WhatsApp",detalle:"Respuesta directa",color:"text-emerald-500"},
    {icono:"reloj",eyebrow:"Entrega en",valor:"45 min*",detalle:"Tiempo estimado",color:"text-amber-500"},
  ];
  return (
    <section aria-label="Datos del servicio" className="mx-4 -mt-1 rounded-[1.75rem] bg-[#07172e] px-3 py-5 text-white shadow-[0_20px_45px_-24px_rgba(2,12,32,0.8)]">
      <div className="grid grid-cols-3 divide-x divide-white/10">
        {items.map(item => (
          <div key={item.valor} className="px-2 text-center">
            <span className={`mx-auto flex h-9 w-9 items-center justify-center ${item.color}`}><IconoMetrica tipo={item.icono}/></span>
            <p className="mt-1 text-[8px] font-bold uppercase tracking-wide text-slate-400">{item.eyebrow}</p>
            <p className="mt-0.5 text-sm font-black leading-tight min-[390px]:text-base">{item.valor}</p>
            <p className="mt-1 text-[9px] font-medium text-slate-400">{item.detalle}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-[9px] font-medium text-slate-500">*Tiempo referencial según zona, disponibilidad y tráfico.</p>
    </section>
  );
}

function Servicios({onSeleccionar}:{onSeleccionar:(servicio:Servicio)=>void}) {
  return (
    <section id="servicios" className="scroll-mt-20 px-4 py-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-600">Logística a tu medida</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-[#07172e]">Nuestros servicios</h2>
        </div>
        <span className="mb-1 text-[10px] font-extrabold text-slate-400">6 soluciones</span>
      </div>
      <p className="mt-3 max-w-[350px] text-sm font-medium leading-relaxed text-slate-500">Elige una operación y nuestro asistente coordinará contigo cada detalle.</p>

      <div className="mt-7 grid grid-cols-1 gap-3 min-[340px]:grid-cols-2">
        {SERVICIOS.map(servicio => <TarjetaServicio key={servicio.id} servicio={servicio} onSeleccionar={onSeleccionar}/>) }
      </div>
    </section>
  );
}

function TarjetaServicio({servicio,onSeleccionar}:{servicio:Servicio;onSeleccionar:(servicio:Servicio)=>void}) {
  return (
    <button type="button" onClick={() => onSeleccionar(servicio)} aria-label={`Solicitar ${servicio.titulo}`}
      className="group relative min-h-[210px] overflow-hidden rounded-[1.6rem] border border-slate-100 bg-white p-5 text-left shadow-[0_14px_35px_-26px_rgba(15,23,42,0.55)] transition-all duration-300 hover:-translate-y-1 hover:border-amber-200 hover:shadow-[0_20px_42px_-24px_rgba(245,158,11,0.38)] active:scale-[0.97]">
      <span className="absolute right-0 top-0 h-20 w-20 -translate-y-1/2 translate-x-1/2 rounded-full bg-amber-50 opacity-0 transition-all duration-300 group-hover:scale-150 group-hover:opacity-100" aria-hidden="true" />
      <span className={`relative flex h-14 w-14 items-center justify-center rounded-2xl ring-1 transition-transform duration-300 group-hover:scale-105 ${servicio.estilo}`}>
        <IconoServicio tipo={servicio.id}/>
      </span>
      <p className="relative mt-4 text-[9px] font-black uppercase tracking-[0.11em] text-slate-400">{servicio.etiqueta}</p>
      <h3 className="relative mt-1.5 text-[15px] font-black leading-tight text-[#07172e]">{servicio.titulo}</h3>
      <p className="relative mt-2 text-[11px] font-medium leading-relaxed text-slate-500">{servicio.descripcion}</p>
      <span className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-600 transition-all duration-300 group-hover:translate-x-0.5 group-hover:bg-amber-400 group-hover:text-slate-950">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.3} d="m9 5 7 7-7 7" /></svg>
      </span>
    </button>
  );
}

function Confianza({onSolicitar}:{onSolicitar:()=>void}) {
  return (
    <section id="confianza" className="px-4 pb-14">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0c2b50] to-[#061329] px-5 py-7 text-white shadow-[0_24px_55px_-30px_rgba(2,12,32,0.8)]">
        <div className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-amber-400/10 blur-3xl" aria-hidden="true" />
        <div className="relative">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 shadow-lg shadow-amber-950/20"><IconoServicio tipo="express"/></span>
          <h2 className="mt-5 text-2xl font-black tracking-tight">¿Listo para tu <span className="text-amber-400">delivery?</span></h2>
          <p className="mt-2 max-w-[300px] text-sm font-medium leading-relaxed text-slate-300">Cuéntanos qué necesitas. Una persona real te ayudará a confirmar el recojo, la tarifa y la entrega.</p>
          <button onClick={onSolicitar} type="button" className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3.5 text-sm font-black shadow-lg shadow-emerald-950/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-400 active:scale-[0.98]">
            <IconoWhatsApp className="h-5 w-5"/> Solicitar ahora
          </button>
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-5">
            <div className="flex items-center gap-2.5"><span className="text-amber-400"><IconoBeneficio tipo="escudo"/></span><p className="text-[11px] font-bold">Seguro y<br/>confiable</p></div>
            <div className="flex items-center gap-2.5"><span className="text-amber-400"><IconoBeneficio tipo="soporte"/></span><p className="text-[11px] font-bold">Atención<br/>personalizada</p></div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm">
        <div className="border-r border-slate-100 pr-3"><p className="text-xl font-black text-[#07172e]">100%</p><p className="mt-1 text-[10px] font-semibold text-slate-500">Cobertura urbana en Chachapoyas</p></div>
        <div className="pl-1"><p className="text-xl font-black text-[#07172e]">Atención real</p><p className="mt-1 text-[10px] font-semibold text-slate-500">Coordinación directa por WhatsApp</p></div>
      </div>
    </section>
  );
}

function Footer({onServicios,onAsistente}:{onServicios:()=>void;onAsistente:()=>void}) {
  return (
    <footer className="bg-[#061329] px-5 pb-28 pt-8 text-white">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-xl font-black">Chacha<span className="text-amber-400">Fast</span></p><p className="mt-2 max-w-[190px] text-[11px] font-medium leading-relaxed text-slate-400">Logística local, atención directa y entregas que se mueven contigo.</p></div>
        <div className="flex flex-col items-end gap-2 text-xs font-bold text-slate-300"><button onClick={onServicios}>Servicios</button><button onClick={onAsistente}>Asistente</button><a href={WHATSAPP_URL} target="_blank" rel="noreferrer">WhatsApp</a></div>
      </div>
      <div className="mt-7 border-t border-white/10 pt-4 text-[9px] font-semibold text-slate-500">© 2026 ChachaFast · Chachapoyas, Amazonas</div>
    </footer>
  );
}

function MenuMovil({abierto,onCerrar,onIr,onAsistente}:{abierto:boolean;onCerrar:()=>void;onIr:(id:string)=>void;onAsistente:()=>void}) {
  return (
    <div className={`fixed inset-0 z-[70] transition-all duration-300 ${abierto?"visible":"invisible"}`} aria-hidden={!abierto}>
      <button type="button" onClick={onCerrar} aria-label="Cerrar navegación" className={`absolute inset-0 bg-slate-950/55 backdrop-blur-sm transition-opacity ${abierto?"opacity-100":"opacity-0"}`} />
      <aside className={`absolute inset-y-0 left-0 w-[82%] max-w-[340px] bg-[#061329] px-5 py-6 text-white shadow-2xl transition-transform duration-300 ${abierto?"translate-x-0":"-translate-x-full"}`}>
        <div className="flex items-center justify-between"><p className="text-xl font-black">Chacha<span className="text-amber-400">Fast</span></p><button type="button" onClick={onCerrar} aria-label="Cerrar menú" className="tap-target rounded-full bg-white/10"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2} d="m6 6 12 12M18 6 6 18"/></svg></button></div>
        <nav className="mt-10 space-y-2" aria-label="Navegación móvil">
          <button onClick={() => onIr("inicio")} className="flex min-h-[52px] w-full items-center rounded-2xl px-4 text-left text-sm font-black hover:bg-white/10">Inicio</button>
          <button onClick={() => onIr("servicios")} className="flex min-h-[52px] w-full items-center rounded-2xl px-4 text-left text-sm font-black hover:bg-white/10">Servicios</button>
          <button onClick={() => {onCerrar();onAsistente();}} className="flex min-h-[52px] w-full items-center rounded-2xl bg-amber-400 px-4 text-left text-sm font-black text-slate-950">Abrir asistente</button>
        </nav>
        <p className="absolute bottom-7 left-5 text-[10px] font-semibold text-slate-500">Delivery local en Chachapoyas</p>
      </aside>
    </div>
  );
}

function AsistenteDelivery({abierto,servicio,sesion,onCerrar,onAbrir,onSeleccionar}:{abierto:boolean;servicio:Servicio|null;sesion:number;onCerrar:()=>void;onAbrir:()=>void;onSeleccionar:(servicio:Servicio)=>void}) {
  const [preparando,setPreparando] = useState(false);
  const [mensajes,setMensajes] = useState<MensajeChat[]>([]);
  const [respuestas,setRespuestas] = useState<string[]>([]);
  const [paso,setPaso] = useState(0);
  const [entrada,setEntrada] = useState("");
  const [escribiendo,setEscribiendo] = useState(false);
  const [completado,setCompletado] = useState(false);
  const areaRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number|null>(null);

  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current); }, []);

  useEffect(() => {
    if (!abierto) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setEntrada(""); setRespuestas([]); setPaso(0); setCompletado(false); setEscribiendo(false);
    if (!servicio) { setPreparando(false); setMensajes([]); return; }
    setPreparando(true); setMensajes([]);
    timerRef.current = window.setTimeout(() => {
      setPreparando(false);
      setMensajes([
        {id:"hola",autor:"asistente",texto:"Hola 👋"},
        {id:"presentacion",autor:"asistente",texto:`Soy el asistente de ChachaFast. Veo que deseas solicitar ${servicio.titulo.toLowerCase()}.`},
        {id:"pregunta-0",autor:"asistente",texto:`Comencemos.\n${servicio.preguntas[0]}`},
      ]);
    }, 650);
  }, [abierto, servicio, sesion]);

  useEffect(() => { areaRef.current?.scrollTo({top:areaRef.current.scrollHeight,behavior:"smooth"}); }, [mensajes,escribiendo,completado]);

  const responder = (valor?:string) => {
    const texto = (valor??entrada).trim();
    if (!texto||!servicio||escribiendo||completado) return;
    const nuevas = [...respuestas,texto];
    setRespuestas(nuevas); setEntrada("");
    setMensajes(actuales => [...actuales,{id:`u-${Date.now()}`,autor:"usuario",texto}]);
    setEscribiendo(true);
    timerRef.current = window.setTimeout(() => {
      if (paso < servicio.preguntas.length-1) {
        const siguiente = paso+1;
        setPaso(siguiente);
        setMensajes(actuales => [...actuales,{id:`p-${siguiente}`,autor:"asistente",texto:`Perfecto.\n${servicio.preguntas[siguiente]}`}]);
      } else {
        setCompletado(true);
        setMensajes(actuales => [...actuales,{id:"listo",autor:"asistente",texto:"¡Listo! Ya tengo los datos principales. Revisa el resumen y confirma la solicitud por WhatsApp."}]);
      }
      setEscribiendo(false);
    }, 520);
  };

  const resumen = servicio?.preguntas.map((pregunta,indice) => `${indice+1}. ${pregunta}\n${respuestas[indice]??"—"}`).join("\n\n")??"";
  const confirmarUrl = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(servicio?`SOLICITUD ${servicio.titulo.toUpperCase()}\n\n${resumen}`:"Hola, deseo solicitar un delivery.")}`;

  return (
    <>
      <button type="button" aria-label="Abrir asistente ChachaFast" onClick={onAbrir} className={`fixed bottom-5 right-4 z-50 flex items-center gap-2 rounded-full border border-amber-300/30 bg-[#07172e] p-2.5 pr-4 text-white shadow-[0_18px_45px_-16px_rgba(2,12,32,0.8)] transition-all duration-300 hover:-translate-y-1 ${abierto?"pointer-events-none translate-y-5 opacity-0":"opacity-100"}`}>
        <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 text-slate-950"><IconoChat/><span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-[#07172e] bg-emerald-400"/></span>
        <span className="text-left"><span className="block text-[9px] font-semibold text-slate-400">Asistente en línea</span><span className="block text-xs font-black">¿Te ayudo?</span></span>
      </button>

      <div className={`fixed inset-0 z-[80] transition-all duration-500 ${abierto?"visible":"invisible"}`} aria-hidden={!abierto}>
        <button type="button" onClick={onCerrar} aria-label="Cerrar asistente" className={`absolute inset-0 bg-slate-950/65 backdrop-blur-md transition-opacity duration-500 ${abierto?"opacity-100":"opacity-0"}`} />
        <section aria-label="Asistente de delivery" className={`absolute inset-x-0 bottom-0 mx-auto flex h-[82dvh] max-h-[720px] max-w-[430px] flex-col overflow-hidden rounded-t-[2rem] bg-[#f7f9fc] shadow-[0_-25px_70px_-20px_rgba(2,12,32,0.6)] transition-transform duration-500 ease-out ${abierto?"translate-y-0":"translate-y-full"}`}>
          <header className="shrink-0 bg-[#07172e] px-4 pb-4 pt-3 text-white">
            <div className="mx-auto mb-3 h-1 w-11 rounded-full bg-white/20" />
            <div className="flex items-center gap-3">
              <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400 text-slate-950"><IconoChat/><span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#07172e] bg-emerald-400"/></span>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-black">Asistente ChachaFast</p><p className="mt-0.5 text-[10px] font-semibold text-slate-400">En línea · Respuesta inmediata</p></div>
              <button type="button" onClick={onCerrar} aria-label="Cerrar ventana del asistente" className="tap-target rounded-full bg-white/10 text-slate-300"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2.2} d="m6 6 12 12M18 6 6 18"/></svg></button>
            </div>
          </header>

          {servicio && <div className="shrink-0 border-b border-amber-100 bg-amber-50 px-4 py-2.5 text-[10px] font-extrabold text-amber-900">Servicio seleccionado: <span className="font-black">{servicio.titulo}</span></div>}

          <div ref={areaRef} className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-4 py-4 scrollbar-none" aria-live="polite">
            {!servicio && !preparando && <SelectorServicios onSeleccionar={onSeleccionar}/>} 
            {preparando && <div className="flex h-full flex-col items-center justify-center text-center"><span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-400 text-slate-950 shadow-lg shadow-amber-200 animate-pulse"><IconoChat/></span><p className="mt-4 text-sm font-black text-[#07172e]">Preparando tu solicitud…</p><p className="mt-1 text-[11px] font-medium text-slate-500">Solo tomará un momento</p></div>}
            {!preparando && mensajes.map(mensaje => <Burbuja key={mensaje.id} mensaje={mensaje}/>) }
            {escribiendo && <div className="flex justify-start"><div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-slate-100 bg-white px-4 py-3 shadow-sm"><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-500"/><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-500 [animation-delay:120ms]"/><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-500 [animation-delay:240ms]"/><span className="ml-1 text-[9px] font-bold text-slate-400">escribiendo…</span></div></div>}
            {completado && servicio && <Resumen servicio={servicio} respuestas={respuestas}/>} 
          </div>

          {servicio && !preparando && <div className="shrink-0 border-t border-slate-200 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
            {!completado ? <>
              {servicio.preguntas[paso]?.toLowerCase().includes("pago") && <div className="mb-2 flex gap-2"><button onClick={() => responder("Efectivo")} className="flex-1 rounded-xl bg-slate-100 px-3 py-2 text-[10px] font-black text-slate-700">Efectivo</button><button onClick={() => responder("Yape / Plin")} className="flex-1 rounded-xl bg-slate-100 px-3 py-2 text-[10px] font-black text-slate-700">Yape / Plin</button></div>}
              <div className="flex items-end gap-2"><textarea value={entrada} onChange={event => setEntrada(event.target.value)} onKeyDown={event => {if(event.key==="Enter"&&!event.shiftKey){event.preventDefault();responder();}}} rows={1} placeholder="Escribe tu respuesta…" aria-label="Respuesta para el asistente" className="min-h-12 max-h-24 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-xs font-medium outline-none transition-colors focus:border-amber-400 focus:bg-white"/><button type="button" onClick={() => responder()} disabled={!entrada.trim()||escribiendo} aria-label="Enviar respuesta" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 transition-all active:scale-95 disabled:opacity-40"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2.2} d="m4 4 17 8-17 8 3-8-3-8Zm3 8h14"/></svg></button></div>
            </> : <a href={confirmarUrl} target="_blank" rel="noreferrer" className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-100 transition-colors hover:bg-emerald-600"><IconoWhatsApp className="h-5 w-5"/> Confirmar por WhatsApp</a>}
          </div>}
        </section>
      </div>
    </>
  );
}

function SelectorServicios({onSeleccionar}:{onSeleccionar:(servicio:Servicio)=>void}) {
  return <div><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-slate-950"><IconoChat/></span><h3 className="mt-4 text-xl font-black text-[#07172e]">Hola 👋</h3><p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">Soy el asistente de ChachaFast. ¿Qué servicio necesitas coordinar?</p><div className="mt-5 grid grid-cols-2 gap-2">{SERVICIOS.map(item => <button key={item.id} onClick={() => onSeleccionar(item)} className="rounded-2xl border border-slate-100 bg-white p-3 text-left text-[11px] font-black text-slate-700 shadow-sm transition-all hover:border-amber-200 hover:bg-amber-50 active:scale-95">{item.titulo}</button>)}</div></div>;
}

function Burbuja({mensaje}:{mensaje:MensajeChat}) {
  return <div className={`flex ${mensaje.autor==="usuario"?"justify-end":"justify-start"}`}><div className={`max-w-[86%] whitespace-pre-line rounded-2xl px-4 py-3 text-[12px] font-medium leading-relaxed shadow-sm ${mensaje.autor==="usuario"?"rounded-br-md bg-[#0c2b50] text-white":"rounded-bl-md border border-slate-100 bg-white text-slate-700"}`}>{mensaje.texto}</div></div>;
}

function Resumen({servicio,respuestas}:{servicio:Servicio;respuestas:string[]}) {
  return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="text-[10px] font-black uppercase tracking-wider text-amber-700">Resumen de solicitud</p><h4 className="mt-1 text-sm font-black text-amber-950">{servicio.titulo}</h4><div className="mt-3 space-y-2">{servicio.preguntas.map((pregunta,index) => <div key={pregunta}><p className="text-[9px] font-bold text-amber-700">{pregunta}</p><p className="mt-0.5 text-[11px] font-semibold text-slate-700">{respuestas[index]}</p></div>)}</div></div>;
}

function IconoServicio({tipo}:{tipo:ServicioId}) {
  const common = "h-7 w-7";
  if(tipo==="compras") return <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 8h14l-1 12H6L5 8Zm4 2V6a3 3 0 0 1 6 0v4"/></svg>;
  if(tipo==="medicinas") return <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m7 17 10-10a3.5 3.5 0 1 1 5 5L12 22a3.5 3.5 0 0 1-5-5Zm5-5 5 5M5 3v6M2 6h6"/></svg>;
  if(tipo==="paquetes") return <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m4 7 8-4 8 4-8 4-8-4Zm0 0v10l8 4 8-4V7m-8 4v10"/></svg>;
  if(tipo==="documentos") return <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 3h7l4 4v14H7V3Zm7 0v5h5M10 13h5m-5 4h5"/></svg>;
  if(tipo==="encomiendas") return <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 6h11v11H3V6Zm11 4h4l3 3v4h-7v-7ZM6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg>;
  return <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 2 5 13h6l-1 9 9-12h-6V2Z"/></svg>;
}

function IconoWhatsApp({className}:{className:string}) { return <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-1.75-.88-2.9-1.56-4.06-3.55-.17-.3-.02-.46.13-.61.44-.44.66-.87.99-1.45.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37C3.68 7.35 3.25 10 4.38 12.3c1.6 3.25 4.03 4.92 7.23 6.05 1.86.65 3.55.56 4.89.34 1.49-.24 2.97-1.82 3.22-2.53.25-.69.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35h-1.85Z"/><path d="M12 0A12 12 0 0 0 1.53 17.85L.06 23.57a.5.5 0 0 0 .61.64l5.92-1.55A12 12 0 1 0 12 0Zm0 21.82a9.8 9.8 0 0 1-5.03-1.38l-.36-.21-3.72.97.99-3.62-.23-.38A9.82 9.82 0 1 1 12 21.82Z"/></svg>; }
function IconoChat(){return <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M7 16l-3 3v-5a8 8 0 1 1 3 2Z"/></svg>;}
function IconoBeneficio({tipo}:{tipo:string}){if(tipo==="ubicacion")return <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2} d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>;if(tipo==="escudo")return <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Zm-3 9 2 2 4-4"/></svg>;if(tipo==="soporte")return <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2} d="M4 14v-3a8 8 0 0 1 16 0v3M4 14h3v6H5a1 1 0 0 1-1-1v-5Zm16 0h-3v6h2a1 1 0 0 0 1-1v-5Z"/></svg>;return <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="m13.3 2-8 11H11l-.3 9 8-12H13l.3-8Z"/></svg>;}
function IconoMetrica({tipo}:{tipo:string}){if(tipo==="whatsapp")return <IconoWhatsApp className="h-7 w-7"/>;if(tipo==="reloj")return <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" strokeWidth={2}/><path strokeLinecap="round" strokeWidth={2} d="M12 7v5l3 2"/></svg>;return <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 15h11m-8-3h8m-5-3h5m2.5 9.5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0Zm-13 0a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0ZM14 9h2.5l2 4H21l1 3h-6l-2-7Z"/></svg>;}

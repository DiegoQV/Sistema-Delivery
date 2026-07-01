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

const ZONAS = [
  "Centro de Chachapoyas",
  "La Molina",
  "Higos Urco",
  "Luya Urco",
  "Sector La Laguna",
  "Pueblo Joven",
  "Av. Salamanca",
  "Mercado Central",
  "Barrio Vilaya",
  "Barrio San Roque",
];

const FOCUS_VISIBLE =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500 focus-visible:outline-offset-2";

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

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    );
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f9fc] text-slate-950">
      <Header menuAbierto={menuAbierto} onMenu={() => setMenuAbierto(true)} onServicios={() => irA("servicios")} onAsistente={abrirAsistente} />

      <main role="main">
        <Hero onSolicitar={abrirAsistente} onServicios={() => irA("servicios")} />
        <Metricas />
        <Servicios onSeleccionar={seleccionarServicio} />
        <Confianza onSolicitar={abrirAsistente} />
        <Cobertura />
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

function Header({menuAbierto,onMenu,onServicios,onAsistente}:{menuAbierto:boolean;onMenu:()=>void;onServicios:()=>void;onAsistente:()=>void}) {
  return (
    <header role="banner" className="sticky top-0 z-40 border-b border-white/10 bg-[#061329]/95 px-4 py-3 text-white shadow-lg shadow-slate-950/10 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[430px] items-center gap-3">
        <button onClick={onMenu} type="button" aria-label="Abrir menu de navegacion" aria-expanded={menuAbierto} className={`-ml-1 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-300 transition-colors hover:bg-white/10 hover:text-white ${FOCUS_VISIBLE}`}>
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeWidth={2.2} d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <button type="button" onClick={() => window.scrollTo({top:0,behavior:"smooth"})} className={`flex min-w-0 flex-1 items-center gap-2 rounded-xl text-left ${FOCUS_VISIBLE}`}>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-amber-400 text-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.15)]">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m13.3 2-8 11H11l-.3 9 8-12H13l.3-8Z" /></svg>
          </span>
          <span className="min-w-0">
            <span className="block truncate text-xl font-black leading-none tracking-tight">Chacha<span className="text-amber-400">Fast</span></span>
            <span className="mt-1 flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Delivery activo</span>
          </span>
        </button>
        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" aria-label="Solicitar delivery por WhatsApp" className={`flex min-h-11 items-center gap-2 rounded-full bg-emerald-500 px-3.5 text-xs font-black shadow-lg shadow-emerald-950/20 transition-all hover:bg-emerald-400 active:scale-95 ${FOCUS_VISIBLE}`}>
          <IconoWhatsApp className="h-4 w-4" />
          <span className="hidden min-[370px]:inline">WhatsApp</span>
        </a>
      </div>
      <nav role="navigation" className="sr-only" aria-label="Navegacion principal">
        <button onClick={onServicios}>Servicios</button><button onClick={onAsistente}>Asistente</button>
      </nav>
    </header>
  );
}

function Hero({onSolicitar,onServicios}:{onSolicitar:()=>void;onServicios:()=>void}) {
  return (
    <section id="inicio" className="px-3 pt-3">
      <div className="relative min-h-[620px] overflow-hidden rounded-[1.75rem] bg-[#061329] text-white shadow-[0_28px_70px_-30px_rgba(2,12,32,0.72)] sm:min-h-[660px]">
        <Image src="/images/delivery-rider-chachapoyas.webp" alt="Motociclista de ChachaFast listo para entrega en Chachapoyas" fill priority fetchPriority="high" sizes="(max-width: 430px) 100vw, 430px" className="object-cover object-[62%_center] brightness-[1.06] contrast-[1.04]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#061329]/90 via-[#061329]/58 to-[#061329]/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#061329]/78 via-[#061329]/18 to-transparent" />

        <div className="relative z-10 px-6 pb-40 pt-6 sm:pb-48 sm:pt-8">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-[#061329]/42 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-amber-300 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.7)]" aria-hidden="true" />
            Delivery activo en Chachapoyas
          </div>
          <h1 className="max-w-[340px] text-4xl font-black leading-[1.08] text-white md:text-5xl">
            Tu delivery <span className="text-amber-400">rápido y seguro</span>
          </h1>
          <p className="mt-5 max-w-[360px] text-[15px] font-medium leading-6 text-white/80 sm:text-base">
            Recojos, compras por encargo, medicamentos y encomiendas. Estamos cerca para ayudarte en minutos.
          </p>
          <div className="mt-7 flex flex-col gap-3">
            <button onClick={onSolicitar} type="button" className={`inline-flex w-full max-w-[340px] items-center justify-center gap-2.5 rounded-full bg-emerald-500 px-8 py-4 text-base font-bold text-white shadow-[0_2px_8px_rgba(16,185,129,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-[0_4px_16px_rgba(16,185,129,0.40)] active:translate-y-0 ${FOCUS_VISIBLE}`} aria-label="Solicitar delivery por WhatsApp">
              <IconoWhatsApp className="h-5 w-5" /> Solicitar Delivery
            </button>
            <button onClick={onServicios} type="button" className={`flex min-h-14 w-full max-w-[340px] items-center justify-center gap-2 rounded-full border border-white/35 bg-slate-950/25 px-8 py-4 text-sm font-bold backdrop-blur-md transition-all duration-200 ease-out hover:border-white/50 hover:bg-white/10 active:scale-[0.98] ${FOCUS_VISIBLE}`}>
              Explorar servicios
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
            <div key={item.titulo} className="flex min-h-[112px] flex-col items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-[#061329]/28 px-2 py-3 text-center backdrop-blur-md">
              <span className="flex h-7 w-7 items-center justify-center text-amber-300"><IconoBeneficio tipo={item.icono} /></span>
              <span className="text-xs font-bold leading-4 text-white sm:text-sm">{item.titulo}</span>
              <span className="text-[11px] leading-4 text-white/55">{item.detalle}</span>
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
    <section data-reveal aria-label="Datos del servicio" className="mx-4 mt-5 rounded-2xl bg-slate-950 text-white shadow-[0_16px_34px_-24px_rgba(2,12,32,0.7)]">
      <div className="grid grid-cols-1 overflow-hidden rounded-2xl bg-slate-950 sm:grid-cols-3">
        {items.map((item, index) => (
          <div key={item.valor} className={`relative flex flex-col items-center justify-center gap-1 px-4 py-6 text-center ${index > 0 ? "border-t border-white/10 sm:border-t-0" : ""} ${index < items.length - 1 ? "sm:border-r sm:border-white/10" : ""}`}>
            <span className={`mb-1 flex h-8 w-8 items-center justify-center opacity-80 ${item.color}`}><IconoMetrica tipo={item.icono}/></span>
            <span className="text-xs font-medium uppercase tracking-wider text-white/50">{item.eyebrow}</span>
            <span className="text-xl font-black text-amber-400">{item.valor}</span>
            <span className="text-xs text-white/45">{item.detalle}</span>
          </div>
        ))}
      </div>
      <p className="px-4 pb-5 text-center text-[9px] font-medium text-white/45">*Tiempo referencial según zona, disponibilidad y tráfico.</p>
    </section>
  );
}

function Servicios({onSeleccionar}:{onSeleccionar:(servicio:Servicio)=>void}) {
  return (
    <section id="servicios" className="scroll-mt-20 px-4 py-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-amber-600">Logística a tu medida</p>
          <h2 className="mt-2.5 text-3xl font-black leading-tight text-[#07172e]">Nuestros servicios</h2>
        </div>
        <span className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">6 soluciones</span>
      </div>
      <p className="mt-4 max-w-[350px] text-sm font-medium leading-6 text-slate-600">Elige una operación y nuestro asistente coordinará contigo cada detalle.</p>

      <div className="mt-8 grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2">
        {SERVICIOS.map(servicio => <TarjetaServicio key={servicio.id} servicio={servicio} onSeleccionar={onSeleccionar}/>) }
      </div>
    </section>
  );
}

function TarjetaServicio({servicio,onSeleccionar}:{servicio:Servicio;onSeleccionar:(servicio:Servicio)=>void}) {
  return (
    <button data-reveal type="button" onClick={() => onSeleccionar(servicio)} aria-label={`Solicitar ${servicio.titulo}`}
      className={`group relative h-full min-h-[226px] overflow-hidden rounded-2xl border border-slate-200/90 bg-[#fcfcfd] p-6 text-left shadow-[0_8px_22px_-18px_rgba(15,23,42,0.35)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_14px_28px_-18px_rgba(15,23,42,0.42)] active:translate-y-0 active:scale-[0.99] ${FOCUS_VISIBLE}`}>
      <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-500 to-amber-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden="true" />
      <span className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${servicio.estilo}`}>
        <IconoServicio tipo={servicio.id}/>
      </span>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-emerald-600">{servicio.etiqueta}</p>
      <h3 className="mb-2 text-lg font-extrabold leading-6 text-slate-900">{servicio.titulo}</h3>
      <p className="pr-7 text-sm leading-6 text-slate-500">{servicio.descripcion}</p>
      <span className="absolute bottom-5 right-5 flex h-8 w-8 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-700 transition-all duration-200 ease-out group-hover:translate-x-0.5 group-hover:border-emerald-500 group-hover:bg-emerald-500 group-hover:text-white">
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </span>
    </button>
  );
}

function Confianza({onSolicitar}:{onSolicitar:()=>void}) {
  return (
    <section id="confianza" className="px-4 pb-16">
      <div data-reveal className="relative mx-auto overflow-hidden rounded-3xl bg-slate-950 px-6 py-12 text-center shadow-[0_24px_48px_-30px_rgba(2,12,32,0.72)] sm:max-w-[700px] sm:px-12 sm:py-16">
        <div className="relative mx-auto mb-6 flex h-[60px] w-[60px] items-center justify-center rounded-2xl bg-amber-400/15 text-amber-400">
          <IconoServicio tipo="express"/>
        </div>
        <h2 className="relative mb-4 text-3xl font-black leading-tight text-white">
          ¿Listo para tu <span className="text-amber-400">delivery</span>?
        </h2>
        <p className="relative mx-auto mb-8 max-w-[400px] text-base leading-relaxed text-white/65">
          Cuéntanos qué necesitas. Una persona real te ayudará a confirmar el recojo, la tarifa y la entrega.
        </p>
        <button onClick={onSolicitar} type="button" aria-label="Solicitar delivery por WhatsApp" className={`relative inline-flex w-full max-w-[340px] items-center justify-center gap-2.5 rounded-full bg-emerald-500 px-8 py-4 text-base font-bold text-white shadow-[0_2px_8px_rgba(16,185,129,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-[0_4px_16px_rgba(16,185,129,0.40)] ${FOCUS_VISIBLE}`}>
          <IconoWhatsApp className="h-5 w-5"/> Solicitar ahora
        </button>
        <div className="relative mt-6 flex flex-wrap justify-center gap-6">
          <div className="flex items-center gap-1.5 text-sm text-white/60">
            <span className="text-emerald-500"><IconoBeneficio tipo="escudo"/></span>
            Seguro y confiable
          </div>
          <div className="flex items-center gap-1.5 text-sm text-white/60">
            <span className="text-emerald-500"><IconoBeneficio tipo="soporte"/></span>
            Atención personalizada
          </div>
        </div>
      </div>

      <div data-reveal className="mt-5 grid grid-cols-2 gap-3 rounded-2xl border border-slate-200/80 bg-[#fcfcfd] p-5 shadow-[0_8px_22px_-20px_rgba(15,23,42,0.3)]">
        <div className="border-r border-slate-100 pr-3"><p className="text-xl font-black text-slate-900">100%</p><p className="mt-1 text-xs font-medium text-slate-500">Cobertura urbana en Chachapoyas</p></div>
        <div className="pl-1"><p className="text-xl font-black text-slate-900">Atención real</p><p className="mt-1 text-xs font-medium text-slate-500">Coordinación directa por WhatsApp</p></div>
      </div>
    </section>
  );
}

function Cobertura() {
  return (
    <section aria-labelledby="cobertura-titulo" className="border-t border-slate-200/70 bg-white px-4 py-16 sm:px-8">
      <div data-reveal>
        <h2 id="cobertura-titulo" className="text-3xl font-black text-slate-900">
          ¿Llegamos a tu zona?
        </h2>
        <p className="mt-3 max-w-[370px] text-base leading-6 text-slate-600">
          Operamos dentro de la ciudad de Chachapoyas y alrededores inmediatos.
        </p>
      </div>
      <div className="mt-8 flex flex-wrap gap-2.5">
        {ZONAS.map((zona) => (
          <span key={zona} data-reveal className="inline-flex min-h-11 items-center rounded-full border border-slate-200 bg-[#fcfcfd] px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_4px_12px_-10px_rgba(15,23,42,0.28)] transition-colors duration-200 ease-out hover:border-amber-300 hover:bg-amber-50 active:bg-amber-100">
            {zona}
          </span>
        ))}
      </div>
      <p data-reveal className="mt-8 text-sm leading-6 text-slate-600">
        ¿Tu zona no aparece?{" "}
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`font-medium text-emerald-600 underline underline-offset-2 hover:text-emerald-700 ${FOCUS_VISIBLE}`}
        >
          Escríbenos, podemos coordinar.
        </a>
      </p>
    </section>
  );
}

function Footer({onServicios,onAsistente}:{onServicios:()=>void;onAsistente:()=>void}) {
  return (
    <footer role="contentinfo" className="bg-[#0a0f1e] px-6 pb-7 pt-14 text-white">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-9 border-b border-white/[0.08] pb-9 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex max-w-[280px] flex-col gap-3">
          <p className="text-xl font-black">Chacha<span className="text-amber-400">Fast</span></p>
          <p className="text-sm leading-relaxed text-white/45">Delivery local en Chachapoyas.<br/>Rápido, seguro y siempre cerca.</p>
          <div className="inline-flex items-center gap-2 text-xs text-white/50">
            <span className="h-[7px] w-[7px] animate-pulse rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" aria-hidden="true" />
            Atención: Lun-Dom, 8am-10pm
          </div>
        </div>
        <nav aria-label="Enlaces del footer" className="flex flex-col gap-1">
          <button onClick={onServicios} className={`flex min-h-11 items-center text-left text-sm font-semibold text-white/60 transition-colors duration-200 hover:text-white ${FOCUS_VISIBLE}`}>Servicios</button>
          <button onClick={onAsistente} className={`flex min-h-11 items-center text-left text-sm font-semibold text-white/60 transition-colors duration-200 hover:text-white ${FOCUS_VISIBLE}`}>WhatsApp</button>
        </nav>
      </div>
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-2 pt-6 text-center sm:flex-row sm:justify-between">
        <span className="text-xs text-white/30">© 2026 ChachaFast · Chachapoyas, Amazonas</span>
      </div>
    </footer>
  );
}

function MenuMovil({abierto,onCerrar,onIr,onAsistente}:{abierto:boolean;onCerrar:()=>void;onIr:(id:string)=>void;onAsistente:()=>void}) {
  return (
    <div className={`fixed inset-0 z-[70] transition-all duration-300 ${abierto?"visible":"invisible"}`} aria-hidden={!abierto}>
      <button type="button" onClick={onCerrar} aria-label="Cerrar navegacion" className={`absolute inset-0 bg-slate-950/55 backdrop-blur-sm transition-opacity ${abierto?"opacity-100":"opacity-0"} ${FOCUS_VISIBLE}`} />
      <aside className={`absolute inset-y-0 left-0 w-[82%] max-w-[340px] bg-[#061329] px-5 py-6 text-white shadow-2xl transition-transform duration-300 ${abierto?"translate-x-0":"-translate-x-full"}`}>
        <div className="flex items-center justify-between"><p className="text-xl font-black">Chacha<span className="text-amber-400">Fast</span></p><button type="button" onClick={onCerrar} aria-label="Cerrar menu" className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/10 ${FOCUS_VISIBLE}`}><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeWidth={2} d="m6 6 12 12M18 6 6 18"/></svg></button></div>
        <nav role="navigation" className="mt-10 space-y-2" aria-label="Navegacion movil">
          <button onClick={() => onIr("inicio")} className={`flex min-h-[52px] w-full items-center rounded-2xl px-4 text-left text-sm font-black hover:bg-white/10 ${FOCUS_VISIBLE}`}>Inicio</button>
          <button onClick={() => onIr("servicios")} className={`flex min-h-[52px] w-full items-center rounded-2xl px-4 text-left text-sm font-black hover:bg-white/10 ${FOCUS_VISIBLE}`}>Servicios</button>
          <button onClick={() => {onCerrar();onAsistente();}} className={`flex min-h-[52px] w-full items-center rounded-2xl bg-amber-400 px-4 text-left text-sm font-black text-slate-950 ${FOCUS_VISIBLE}`}>Abrir asistente</button>
        </nav>
        <p className="absolute bottom-7 left-5 text-[10px] font-semibold text-slate-400">Delivery local en Chachapoyas</p>
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
        {id:"hola",autor:"asistente",texto:"Hola"},
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

  const resumen = servicio?.preguntas.map((pregunta,indice) => `${indice+1}. ${pregunta}\n${respuestas[indice]??"-"}`).join("\n\n")??"";
  const confirmarUrl = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(servicio?`SOLICITUD ${servicio.titulo.toUpperCase()}\n\n${resumen}`:"Hola, deseo solicitar un delivery.")}`;

  return (
    <>
      <button type="button" aria-label="Abrir asistente de WhatsApp" onClick={onAbrir} className={`fixed bottom-5 right-4 z-50 flex items-center gap-2 rounded-full border border-amber-300/30 bg-[#07172e] p-2.5 text-white shadow-[0_18px_45px_-16px_rgba(2,12,32,0.8)] transition-all duration-300 hover:-translate-y-1 min-[390px]:pr-4 ${abierto?"pointer-events-none translate-y-5 opacity-0":"opacity-100"} ${FOCUS_VISIBLE}`}>
        <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 text-slate-950"><IconoChat/><span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-[#07172e] bg-emerald-400"/></span>
        <span className="hidden text-left min-[390px]:block"><span className="block text-[9px] font-semibold text-slate-400">Asistente en línea</span><span className="block text-xs font-black">¿Te ayudo?</span></span>
      </button>

      <div className={`fixed inset-0 z-[80] transition-all duration-500 ${abierto?"visible":"invisible"}`} aria-hidden={!abierto}>
        <button type="button" onClick={onCerrar} aria-label="Cerrar asistente" className={`absolute inset-0 bg-slate-950/65 backdrop-blur-md transition-opacity duration-500 ${abierto?"opacity-100":"opacity-0"} ${FOCUS_VISIBLE}`} />
        <section aria-label="Asistente de delivery" className={`absolute inset-x-0 bottom-0 mx-auto flex h-[82dvh] max-h-[720px] max-w-[430px] flex-col overflow-hidden rounded-t-[2rem] bg-[#f7f9fc] shadow-[0_-25px_70px_-20px_rgba(2,12,32,0.6)] transition-transform duration-500 ease-out ${abierto?"translate-y-0":"translate-y-full"}`}>
          <header className="shrink-0 bg-[#07172e] px-4 pb-4 pt-3 text-white">
            <div className="mx-auto mb-3 h-1 w-11 rounded-full bg-white/20" />
            <div className="flex items-center gap-3">
              <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400 text-slate-950"><IconoChat/><span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#07172e] bg-emerald-400"/></span>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-black">Asistente ChachaFast</p><p className="mt-0.5 text-[10px] font-semibold text-slate-400">En línea · Respuesta inmediata</p></div>
              <button type="button" onClick={onCerrar} aria-label="Cerrar ventana del asistente" className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/10 text-slate-300 ${FOCUS_VISIBLE}`}><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2.2} d="m6 6 12 12M18 6 6 18"/></svg></button>
            </div>
          </header>

          {servicio && <div className="shrink-0 border-b border-amber-100 bg-amber-50 px-4 py-2.5 text-[10px] font-extrabold text-amber-900">Servicio seleccionado: <span className="font-black">{servicio.titulo}</span></div>}

          <div ref={areaRef} className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-4 py-4" aria-live="polite">
            {!servicio && !preparando && <SelectorServicios onSeleccionar={onSeleccionar}/>} 
            {preparando && <div className="flex h-full flex-col items-center justify-center text-center"><span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-400 text-slate-950 shadow-lg shadow-amber-200 animate-pulse"><IconoChat/></span><p className="mt-4 text-sm font-black text-[#07172e]">Preparando tu solicitud⬦</p><p className="mt-1 text-[11px] font-medium text-slate-500">Solo tomará un momento</p></div>}
            {!preparando && mensajes.map(mensaje => <Burbuja key={mensaje.id} mensaje={mensaje}/>) }
            {escribiendo && <div className="flex justify-start"><div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-slate-100 bg-white px-4 py-3 shadow-sm"><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-500"/><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-500 [animation-delay:120ms]"/><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-500 [animation-delay:240ms]"/><span className="ml-1 text-[9px] font-bold text-slate-400">escribiendo⬦</span></div></div>}
            {completado && servicio && <Resumen servicio={servicio} respuestas={respuestas}/>} 
          </div>

          {servicio && !preparando && <div className="shrink-0 border-t border-slate-200 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
            {!completado ? <>
              {servicio.preguntas[paso]?.toLowerCase().includes("pago") && <div className="mb-2 flex gap-2"><button onClick={() => responder("Efectivo")} className={`flex-1 rounded-xl bg-slate-100 px-3 py-2 text-[10px] font-black text-slate-700 ${FOCUS_VISIBLE}`}>Efectivo</button><button onClick={() => responder("Yape / Plin")} className={`flex-1 rounded-xl bg-slate-100 px-3 py-2 text-[10px] font-black text-slate-700 ${FOCUS_VISIBLE}`}>Yape / Plin</button></div>}
              <div className="flex items-end gap-2"><textarea value={entrada} onChange={event => setEntrada(event.target.value)} onKeyDown={event => {if(event.key==="Enter"&&!event.shiftKey){event.preventDefault();responder();}}} rows={1} placeholder="Escribe tu respuesta⬦" aria-label="Respuesta para el asistente" className={`min-h-12 max-h-24 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-xs font-medium outline-none transition-colors focus:border-amber-400 focus:bg-white ${FOCUS_VISIBLE}`}/><button type="button" onClick={() => responder()} disabled={!entrada.trim()||escribiendo} aria-label="Enviar respuesta" className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 transition-all active:scale-95 disabled:opacity-40 ${FOCUS_VISIBLE}`}><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2.2} d="m4 4 17 8-17 8 3-8-3-8Zm3 8h14"/></svg></button></div>
            </> : <a href={confirmarUrl} target="_blank" rel="noreferrer" aria-label="Solicitar delivery por WhatsApp" className={`flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-100 transition-colors hover:bg-emerald-600 ${FOCUS_VISIBLE}`}><IconoWhatsApp className="h-5 w-5"/> Confirmar por WhatsApp</a>}
          </div>}
        </section>
      </div>
    </>
  );
}

function SelectorServicios({onSeleccionar}:{onSeleccionar:(servicio:Servicio)=>void}) {
  return <div><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-slate-950"><IconoChat/></span><h3 className="mt-4 text-xl font-black text-[#07172e]">Hola</h3><p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">Soy el asistente de ChachaFast. ¿Qué servicio necesitas coordinar?</p><div className="mt-5 grid grid-cols-2 gap-2">{SERVICIOS.map(item => <button key={item.id} onClick={() => onSeleccionar(item)} className={`rounded-2xl border border-slate-100 bg-white p-3 text-left text-[11px] font-black text-slate-700 shadow-sm transition-all hover:border-amber-200 hover:bg-amber-50 active:scale-95 ${FOCUS_VISIBLE}`}>{item.titulo}</button>)}</div></div>;
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

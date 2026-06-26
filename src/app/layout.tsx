import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { CarritoProvider } from "@/context/CarritoContext";

// Nunito: redondeada, amigable, perfecta para apps de comida
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Delivery Chachapoyas 🛵",
  description: "Pide tu comida favorita en Chachapoyas. Rápido, fácil y sin registro.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={nunito.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#f97316" />
      </head>
      <body className={`${nunito.className} bg-stone-200`}>
        <CarritoProvider>
          {/* Contenedor mobile-first centrado, máx 430px */}
          <div className="mx-auto max-w-[430px] min-h-screen bg-white shadow-2xl relative overflow-x-hidden">
            {children}
          </div>
        </CarritoProvider>
      </body>
    </html>
  );
}

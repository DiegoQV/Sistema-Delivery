import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { CarritoProvider } from "@/context/CarritoContext";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Delivery Chachapoyas 🛵",
  description: "Pide tu comida favorita en Chachapoyas. Rápido, fácil y sin registro.",
};

// Next.js 14: viewport debe exportarse separado, no dentro de metadata
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f97316",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={nunito.variable}>
      <body className={`${nunito.className} bg-stone-200`}>
        <CarritoProvider>
          <div className="mx-auto max-w-[430px] min-h-screen bg-white shadow-2xl relative overflow-x-hidden">
            {children}
          </div>
        </CarritoProvider>
      </body>
    </html>
  );
}

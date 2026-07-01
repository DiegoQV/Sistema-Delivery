import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://chachafast.pe";
const numeroWhatsapp = "51987654321";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "ChachaFast - Delivery rapido y seguro en Chachapoyas",
  description:
    "ChachaFast - Delivery rapido y seguro en Chachapoyas. Recojo, compras por encargo, medicamentos y encomiendas. Desde S/3.00. Respuesta por WhatsApp en minutos.",
  keywords: [
    "delivery chachapoyas",
    "delivery amazonas",
    "encomiendas chachapoyas",
    "compras por encargo chachapoyas",
    "delivery rapido chachapoyas",
  ],
  robots: "index, follow",
  authors: [{ name: "ChachaFast" }],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    title: "ChachaFast - Tu delivery rapido y seguro en Chachapoyas",
    description:
      "Recojos, compras por encargo, medicamentos y encomiendas. Desde S/3.00. Atencion por WhatsApp, entrega en 45 min.",
    url: siteUrl,
    siteName: "ChachaFast",
    locale: "es_PE",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ChachaFast - Tu delivery rapido y seguro en Chachapoyas",
    description:
      "Recojos, compras por encargo, medicamentos y encomiendas. Desde S/3.00.",
    images: ["/og-image.jpg"],
  },
};

// Next.js 14: viewport debe exportarse separado, no dentro de metadata.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f97316",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "ChachaFast",
    description:
      "Servicio de delivery local en Chachapoyas. Recojo, compras por encargo, medicamentos y encomiendas.",
    url: siteUrl,
    logo: `${siteUrl}/logo.svg`,
    image: `${siteUrl}/og-image.jpg`,
    telephone: `+${numeroWhatsapp}`,
    priceRange: "S/3 - S/20",
    currenciesAccepted: "PEN",
    paymentAccepted: "Cash, Yape, Plin",
    areaServed: {
      "@type": "City",
      name: "Chachapoyas",
      addressRegion: "Amazonas",
      addressCountry: "PE",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Chachapoyas",
      addressRegion: "Amazonas",
      addressCountry: "PE",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "08:00",
      closes: "22:00",
    },
    sameAs: [`https://wa.me/${numeroWhatsapp}`],
  };

  return (
    <html lang="es" className={nunito.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${nunito.className} bg-stone-200`}>
        {/* TODO: confirmar horario real */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd),
          }}
        />
        <div className="relative mx-auto min-h-screen max-w-[430px] overflow-x-hidden bg-white shadow-2xl">
          {children}
        </div>
      </body>
    </html>
  );
}

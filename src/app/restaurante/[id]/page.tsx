// Server Component — sin "use client"
// generateStaticParams solo puede vivir en Server Components.
import { RESTAURANTES_MOCK } from "@/data/mock";
import { RestauranteClient } from "./RestauranteClient";

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * Genera una ruta estática por cada restaurante conocido en build time.
 * En producción reemplazar RESTAURANTES_MOCK por fetch a la API de DynamoDB.
 */
export function generateStaticParams() {
  return RESTAURANTES_MOCK.map((r) => ({ id: r.id }));
}

export default async function RestaurantePage({ params }: Props) {
  const { id } = await params;
  return <RestauranteClient id={id} />;
}

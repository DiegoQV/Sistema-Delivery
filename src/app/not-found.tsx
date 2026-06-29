import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-8 text-center bg-white">
      <div className="w-28 h-28 rounded-full bg-orange-50 flex items-center justify-center mb-6 text-6xl">
        🛵
      </div>
      <h2 className="text-2xl font-extrabold text-stone-900 mb-2">Página no encontrada</h2>
      <p className="text-stone-400 text-sm mb-8 leading-relaxed">
        La página que buscas no existe o fue movida.
      </p>
      <Link
        href="/"
        className="bg-gradient-to-r from-orange-500 to-orange-400
                   text-white font-bold px-8 py-3.5 rounded-2xl
                   shadow-lg shadow-orange-200 text-sm"
      >
        Volver a delivery
      </Link>
    </div>
  );
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",       // Static export para S3/CloudFront
  trailingSlash: true,
  images: {
    unoptimized: true,    // Requerido para exportación estática
  },
  // Con output: 'export', las rutas dinámicas no listadas en
  // generateStaticParams() retornan 404. Esto es el comportamiento
  // correcto para una SPA: el shell HTML existe, el cliente maneja el ID.
  // dynamicParams se configura a nivel de cada route segment, no aquí.
};

export default nextConfig;

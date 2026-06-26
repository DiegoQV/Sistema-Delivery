/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // Static export para S3/CloudFront
  trailingSlash: true,
  images: {
    unoptimized: true, // Requerido para exportación estática
  },
};

export default nextConfig;

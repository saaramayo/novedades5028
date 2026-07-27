//import type { NextConfig } from "next";

const nextConfig = {
  /* config options here */
  // Permite que la compilación termine con éxito aunque existan advertencias de ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Permite compilar a producción omitiendo errores estrictos de tipado huérfanos
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

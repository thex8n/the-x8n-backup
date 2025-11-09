import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Otras opciones de configuración */

  // 👇 Permitir orígenes en desarrollo (para acceder desde otra PC o móvil en la red local)
  allowedDevOrigins: [
    "https://localhost:3000",       // acceso local
    "https://10.105.190.190:3000",  // acceso desde red (Network)
  ],

  // 👇 Configuración de imágenes para Cloudflare R2
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-70739f5647f14c49a39c5a04ac6dfea7.r2.dev',
        port: '',
        pathname: '/products/**',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

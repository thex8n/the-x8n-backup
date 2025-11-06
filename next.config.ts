import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Otras opciones de configuración */
  
  // 👇 Permitir orígenes en desarrollo (para acceder desde otra PC o móvil en la red local)
  allowedDevOrigins: [
    "https://localhost:3000",       // acceso local
    "https://10.105.190.190:3000",  // acceso desde red (Network)
  ],
};

export default nextConfig;

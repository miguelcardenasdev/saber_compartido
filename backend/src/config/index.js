import "dotenv/config";

export const config = {
  puerto: Number(process.env.PORT ?? 3000),
  urlBaseDatos: process.env.DATABASE_URL,
  urlFrontend: process.env.URL_FRONTEND ?? "http://localhost:5173",
  smtp: {
    host: process.env.SMTP_HOST,
    puerto: Number(process.env.SMTP_PORT ?? 587),
    usuario: process.env.SMTP_USER,
    clave: process.env.SMTP_PASS,
    remitente: process.env.CORREO_REMITENTE,
  },
};

export default config;

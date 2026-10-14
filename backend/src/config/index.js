import "dotenv/config";

const CLAVE_SESION = process.env.JWT_SECRET ?? "";

if (CLAVE_SESION.length < 32) {
  throw new Error(
    "JWT_SECRET es obligatorio y debe tener al menos 32 caracteres. " +
      'Genera uno con: node -p "crypto.randomBytes(48).toString(16)"',
  );
}

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
  sesion: {
    secreto: CLAVE_SESION,
    duracionSegundos: 7 * 24 * 60 * 60,
    nombreCookie: "sesion",
    secure: process.env.NODE_ENV === "production",
  },
};

export default config;

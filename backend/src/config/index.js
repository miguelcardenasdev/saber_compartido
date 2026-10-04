import "dotenv/config";

export const config = {
  puerto: Number(process.env.PORT ?? 3000),
  urlBaseDatos: process.env.DATABASE_URL,
};

export default config;

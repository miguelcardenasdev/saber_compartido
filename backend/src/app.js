import express from "express";
import { config } from "./config/index.js";
import {transporte} from "./shared/email/transporte.js";

const app = express();

app.use(express.json());

transporte.verify()
  .then(() => console.log("SMTP conectado correctamente"))
  .catch((error) => console.error("Error de configuración SMTP:", error.message));

app.get("/api/salud", (req, res) => {
  res.json({ estado: "ok" });
});

app.listen(config.puerto, () => {
  console.log(`Servidor escuchando en http://localhost:${config.puerto}`);
});

export default app;

import express from "express";
import { config } from "./config/index.js";

const app = express();

app.use(express.json());

app.get("/api/salud", (req, res) => {
  res.json({ estado: "ok" });
});

app.listen(config.puerto, () => {
  console.log(`Servidor escuchando en http://localhost:${config.puerto}`);
});

export default app;

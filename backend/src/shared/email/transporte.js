import nodemailer from "nodemailer";
import { config } from "../../config/index.js";

const { smtp } = config;

export const transporte = nodemailer.createTransport({
  host: smtp.host,
  port: smtp.puerto,
  secure: smtp.puerto === 465,
  auth: smtp.usuario ? { user: smtp.usuario, pass: smtp.clave } : undefined,
});

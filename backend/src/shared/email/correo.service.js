import { config } from "../../config/index.js";
import { transporte } from "./transporte.js";

const escaparHtml = (texto) =>
  String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const plantillaVerificacion = (nombres, enlace) => `
  <div style="font-family: Inter, Arial, sans-serif; background: #F5F3FF; padding: 32px 16px;">
    <div style="max-width: 520px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; padding: 32px 28px; border: 1px solid #E5E7EB;">
      <h1 style="font-family: Poppins, Arial, sans-serif; color: #7C3AED; font-size: 22px; margin: 0 0 16px;">
        Saber Compartido
      </h1>
      <p style="color: #1F1147; font-size: 15px; line-height: 1.6; margin: 0 0 12px;">
        Hola <strong>${escaparHtml(nombres)}</strong>, gracias por crear tu cuenta en Saber Compartido.
      </p>
      <p style="color: #6B7280; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
        Verifica tu correo para activar tu cuenta y poder buscar tutores.
      </p>
      <p style="margin: 0 0 24px;">
        <a href="${escaparHtml(enlace)}" style="background: #FF5A8C; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; display: inline-block;">
          Verificar mi correo
        </a>
      </p>
      <p style="color: #6B7280; font-size: 13px; line-height: 1.6; margin: 0 0 8px;">
        Este enlace vence en 24 horas. Si no solicitaste esta cuenta, ignora este correo.
      </p>
      <p style="color: #6B7280; font-size: 12px; word-break: break-all; margin: 0;">
        ${escaparHtml(enlace)}
      </p>
    </div>
  </div>
`;

export const enviarCorreoVerificacion = async ({ correo, nombres, token }) => {
  const enlace = `${config.urlFrontend}/verificar/${token}`;
  return transporte.sendMail({
    from: config.smtp.remitente || config.smtp.usuario || "no-responder@localhost",
    to: correo,
    subject: "Verifica tu correo — Saber Compartido",
    html: plantillaVerificacion(nombres, enlace),
  });
};

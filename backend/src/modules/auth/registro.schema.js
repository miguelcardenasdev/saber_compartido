import { z } from "zod";

const DOMINIO_INSTITUCIONAL = "@amigo.edu.co";

const REGLA_MAYUSCULA = /[\p{Lu}]/u;
const REGLA_MINUSCULA = /[\p{Ll}]/u;
const REGLA_NUMERO = /\p{N}/u;
const REGLA_ESPECIAL = /[^\p{L}\p{N}\s]/u;

const normalizar = (texto) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const candidatosProhibidos = (nombres, apellidos) => {
  const candidatos = [];
  for (const campo of [nombres, apellidos]) {
    if (!campo) continue;
    const limpio = normalizar(campo);
    candidatos.push(limpio, limpio.replace(/\s+/g, ""));
    for (const parte of limpio.split(/\s+/)) {
      if (parte.length >= 3) candidatos.push(parte);
    }
  }
  return candidatos;
};



export const esquemaRegistro = z
  .object({
    nombres: z
      .string({ error: "Ingresa tus nombres" })
      .trim()
      .min(1, "Ingresa tus nombres")
      .min(2, "Los nombres deben tener al menos 2 caracteres")
      .max(100, "Los nombres no pueden superar los 100 caracteres"),
    apellidos: z
      .string({ error: "Ingresa tus apellidos" })
      .trim()
      .min(1, "Ingresa tus apellidos")
      .min(2, "Los apellidos deben tener al menos 2 caracteres")
      .max(100, "Los apellidos no pueden superar los 100 caracteres"),
    correo: z
      .string({ error: "El correo es obligatorio" })
      .trim()
      .min(1, "El correo es obligatorio")
      .email("Correo inválido")
      .refine(
        (valor) => valor.toLowerCase().endsWith(DOMINIO_INSTITUCIONAL),
        `Debes usar tu correo institucional (${DOMINIO_INSTITUCIONAL})`,
      ),
    contrasena: z
      .string({ error: "La contraseña es obligatoria" })
      .min(1, "La contraseña es obligatoria")
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .refine((valor) => REGLA_MAYUSCULA.test(valor), "La contraseña debe incluir al menos una mayúscula")
      .refine((valor) => REGLA_MINUSCULA.test(valor), "La contraseña debe incluir al menos una minúscula")
      .refine((valor) => REGLA_NUMERO.test(valor), "La contraseña debe incluir al menos un número")
      .refine((valor) => REGLA_ESPECIAL.test(valor), "La contraseña debe incluir al menos un carácter especial"),
  })
  .superRefine((datos, contexto) => {
    const { nombres, apellidos, contrasena } = datos;
    if (!nombres || !apellidos || !contrasena) return;
    const password = normalizar(contrasena);
    const prohibidos = candidatosProhibidos(nombres, apellidos);
    if (prohibidos.some((candidato) => password.includes(candidato))) {
      contexto.addIssue({
        code: "custom",
        path: ["contrasena"],
        message: "La contraseña no debe contener tu nombre o apellido",
      });
    }
  });

export default esquemaRegistro;

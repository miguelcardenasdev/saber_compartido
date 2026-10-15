import { z } from "zod";

export const esquemaLogin = z.object({
  correo: z
    .string({ error: "El correo es obligatorio" })
    .trim()
    .min(1, "El correo es obligatorio")
    .email("Correo inválido"),
  contrasena: z
    .string({ error: "La contraseña es obligatoria" })
    .min(1, "La contraseña es obligatoria"),
});

export default esquemaLogin;

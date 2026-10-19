import { z } from "zod";

export const esquemaCallbackGoogle = z.object({
  code: z
    .string({ error: "El código de Google es obligatorio" })
    .trim()
    .min(1, "El código de Google es obligatorio"),
  state: z
    .string({ error: "El state de Google es obligatorio" })
    .trim()
    .min(1, "El state de Google es obligatorio"),
});

export default esquemaCallbackGoogle;

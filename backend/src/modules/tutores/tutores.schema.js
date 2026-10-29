import { z } from "zod";

const PROMEDIO_MINIMO = 400;
const PROMEDIO_MAXIMO = 500;

const normalizarPromedio = (texto) => texto.trim().replace(",", ".");

const enCentiles = (texto) => {
  const [entero, decimal = ""] = texto.split(".");
  return Number(entero) * 100 + Number(decimal.padEnd(2, "0"));
};

const esPromedioValido = (texto) => {
  const normalizado = normalizarPromedio(texto);
  if (!/^\d{1,2}(\.\d{1,2})?$/.test(normalizado)) return false;
  const centiles = enCentiles(normalizado);
  return centiles >= PROMEDIO_MINIMO && centiles <= PROMEDIO_MAXIMO;
};

const MENSAJE_PROMEDIO =
  "El promedio debe estar entre 4.00 y 5.00 con máximo 2 decimales (usa coma o punto)";

export const esquemaSolicitudTutor = z
  .object({
    materias: z
      .array(
        z.object({
          materiaId: z
            .number({ error: "Selecciona una materia válida" })
            .int("Selecciona una materia válida")
            .positive("Selecciona una materia válida"),
          promedio: z
            .string({ error: MENSAJE_PROMEDIO })
            .trim()
            .min(1, MENSAJE_PROMEDIO)
            .refine(esPromedioValido, MENSAJE_PROMEDIO),
        }),
      )
      .min(1, "Elige al menos una materia")
      .max(5, "Puedes elegir máximo 5 materias"),
    descripcion: z
      .string()
      .trim()
      .max(500, "La descripción no puede superar los 500 caracteres")
      .optional(),
  })
  .superRefine((datos, contexto) => {
    const vistos = new Set();
    datos.materias.forEach((materia, indice) => {
      if (vistos.has(materia.materiaId)) {
        contexto.addIssue({
          code: "custom",
          path: ["materias", indice, "materiaId"],
          message: "No puedes repetir la misma materia",
        });
      }
      vistos.add(materia.materiaId);
    });
  });

export default esquemaSolicitudTutor;

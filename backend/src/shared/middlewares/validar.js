export const validar = (esquema) => (req, res, next) => {
  const resultado = esquema.safeParse(req.body);
  if (!resultado.success) {
    const detalle = resultado.error.issues.reduce((acumulado, issue) => {
      const campo = issue.path.join(".") || "general";
      (acumulado[campo] ??= []).push(issue.message);
      return acumulado;
    }, {});
    return res.status(400).json({
      mensaje: "Datos inválidos",
      detalle,
    });
  }
  req.body = resultado.data;
  return next();
};

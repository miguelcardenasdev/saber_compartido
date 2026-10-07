export const detalleDeIssues = (issues) =>
  issues.reduce((acumulado, issue) => {
    const campo = issue.path.join(".") || "general";
    (acumulado[campo] ??= []).push(issue.message);
    return acumulado;
  }, {});

export const validar = (esquema) => (req, res, next) => {
  const resultado = esquema.safeParse(req.body);
  if (!resultado.success) {
    return res.status(400).json({
      mensaje: "Datos inválidos",
      detalle: detalleDeIssues(resultado.error.issues),
    });
  }
  req.body = resultado.data;
  return next();
};

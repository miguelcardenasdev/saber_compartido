export const errorNegocio = (codigo, mensaje, status) =>
  Object.assign(new Error(mensaje), { codigo, status });

export default errorNegocio;

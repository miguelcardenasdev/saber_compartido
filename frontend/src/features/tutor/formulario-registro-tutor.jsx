import { useState } from "react";
import { PROGRAMA_ACADEMICO } from "./constantes.js";
import { enviarSolicitud } from "./api-tutor.js";

const MAXIMO_MATERIAS = 5;
const LIMITE_BYTES = 5 * 1024 * 1024;
const EXTENSIONES_PERMITIDAS = [".pdf", ".jpg", ".jpeg", ".png"];

const MENSAJE_PROMEDIO =
  "El promedio debe estar entre 4.00 y 5.00 con máximo 2 decimales (coma o punto)";

const esPromedioValido = (texto) => {
  const normalizado = texto.trim().replace(",", ".");
  if (!/^\d{1,2}(\.\d{1,2})?$/.test(normalizado)) return false;
  const [entero, decimal = ""] = normalizado.split(".");
  const centiles = Number(entero) * 100 + Number(decimal.padEnd(2, "0"));
  return centiles >= 400 && centiles <= 500;
};

const extensionDe = (nombre = "") => {
  const punto = nombre.lastIndexOf(".");
  return punto === -1 ? "" : nombre.slice(punto).toLowerCase();
};

const validarArchivo = (archivo) => {
  if (!archivo) return "Adjunta tu certificado de notas (PDF, JPG o PNG)";
  if (archivo.size > LIMITE_BYTES) return "El certificado no puede superar los 5 MB";
  if (!EXTENSIONES_PERMITIDAS.includes(extensionDe(archivo.name))) {
    return "El certificado debe ser un archivo PDF, JPG o PNG";
  }
  return undefined;
};

const erroresDeDetalle = (detalle, seleccion) => {
  const porCampo = {};
  let general;
  for (const [campo, mensajes] of Object.entries(detalle)) {
    const coincidencia = campo.match(/^materias\.(\d+)\.promedio$/);
    if (coincidencia) {
      const materiaId = seleccion[Number(coincidencia[1])];
      if (materiaId !== undefined) porCampo[`promedio:${materiaId}`] = mensajes[0];
      continue;
    }
    if (campo === "materias" || campo.startsWith("materias.")) {
      general = mensajes[0];
      continue;
    }
    if (campo === "general") general = mensajes[0];
    else porCampo[campo] = mensajes[0];
  }
  return { porCampo, general };
};

const erroresDeCodigo = (codigo, mensaje) => {
  if (
    ["ARCHIVO_REQUERIDO", "ARCHIVO_TIPO_INVALIDO", "ARCHIVO_MUY_GRANDE"].includes(codigo)
  ) {
    return { certificado: mensaje };
  }
  if (codigo === "MATERIA_INEXISTENTE") return { materias: mensaje };
  return { general: mensaje };
};

export const FormularioRegistroTutor = ({ materias, onEnviado, onSesionPerdida }) => {
  const [seleccion, setSeleccion] = useState([]);
  const [promedios, setPromedios] = useState({});
  const [descripcion, setDescripcion] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [errores, setErrores] = useState({});
  const [falloGeneral, setFalloGeneral] = useState("");
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);

  const alternarMateria = (materiaId) => {
    setSeleccion((previa) =>
      previa.includes(materiaId)
        ? previa.filter((id) => id !== materiaId)
        : previa.length >= MAXIMO_MATERIAS
          ? previa
          : [...previa, materiaId],
    );
    setErrores((previos) => {
      const siguientes = { ...previos };
      delete siguientes.materias;
      delete siguientes[`promedio:${materiaId}`];
      return siguientes;
    });
  };

  const cambiarPromedio = (materiaId, valor) => {
    setPromedios((previos) => ({ ...previos, [materiaId]: valor }));
    setErrores((previos) => {
      const siguientes = { ...previos };
      delete siguientes[`promedio:${materiaId}`];
      return siguientes;
    });
  };

  const limpiar = () => {
    setSeleccion([]);
    setPromedios({});
    setDescripcion("");
    setArchivo(null);
    setErrores({});
    setFalloGeneral("");
    setExito(false);
    const formulario = document.getElementById("form-ser-tutor");
    if (formulario) formulario.reset();
  };

  const validar = () => {
    const fallos = {};
    if (seleccion.length === 0) {
      fallos.materias = "Elige al menos una materia";
    } else if (seleccion.length > MAXIMO_MATERIAS) {
      fallos.materias = `Puedes elegir máximo ${MAXIMO_MATERIAS} materias`;
    }
    for (const materiaId of seleccion) {
      const valor = promedios[materiaId]?.trim() ?? "";
      if (!valor) fallos[`promedio:${materiaId}`] = "Ingresa tu promedio";
      else if (!esPromedioValido(valor)) {
        fallos[`promedio:${materiaId}`] = MENSAJE_PROMEDIO;
      }
    }
    const falloArchivo = validarArchivo(archivo);
    if (falloArchivo) fallos.certificado = falloArchivo;
    if (descripcion.length > 500) {
      fallos.descripcion = "La descripción no puede superar los 500 caracteres";
    }
    return fallos;
  };

  const manejarEnvio = async (event) => {
    event.preventDefault();
    if (cargando) return;
    setFalloGeneral("");
    setExito(false);

    const fallos = validar();
    setErrores(fallos);
    if (Object.keys(fallos).length > 0) return;

    setCargando(true);
    try {
      await enviarSolicitud({
        materias: seleccion.map((materiaId) => ({
          materiaId,
          promedio: promedios[materiaId].trim(),
        })),
        descripcion: descripcion.trim() || undefined,
        certificado: archivo,
      });
      setExito(true);
      onEnviado?.();
    } catch (error) {
      if (error.status === 401) {
        setFalloGeneral("Tu sesión ya no es válida. Inicia sesión de nuevo");
        onSesionPerdida?.();
      } else if (error.detalle) {
        const { porCampo, general } = erroresDeDetalle(error.detalle, seleccion);
        setErrores(porCampo);
        if (general) setFalloGeneral(general);
      } else if (error.codigo) {
        const traducidos = erroresDeCodigo(error.codigo, error.message);
        setErrores(traducidos);
        if (traducidos.general) setFalloGeneral(traducidos.general);
      } else {
        setFalloGeneral("No pudimos enviar tu solicitud. Inténtalo de nuevo");
      }
    } finally {
      setCargando(false);
    }
  };

  const cuenta = seleccion.length;

  return (
    <form
      id="form-ser-tutor"
      noValidate
      onSubmit={manejarEnvio}
      className="flex min-w-0 flex-col gap-[17px]"
    >
      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className="mb-2.5 p-0 text-[11px] font-semibold text-text">
          Materias que deseas enseñar *
        </legend>
        <div className="flex flex-wrap gap-2">
          {materias.map((materia) => {
            const activa = seleccion.includes(materia.id);
            return (
              <button
                key={materia.id}
                type="button"
                onClick={() => alternarMateria(materia.id)}
                aria-pressed={activa}
                className={`rounded-full border px-3.5 py-2 text-[11px] font-semibold transition ${
                  activa
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-white text-text hover:border-primary hover:text-primary"
                }`}
              >
                {materia.nombre}
              </button>
            );
          })}
        </div>
        <p className="mb-0 mt-1.5 text-[10px] text-text-muted">
          {cuenta} de {MAXIMO_MATERIAS} seleccionadas
        </p>
        {errores.materias && (
          <p role="alert" className="mb-0 mt-1 text-[11px] text-danger">
            {errores.materias}
          </p>
        )}
      </fieldset>

      {cuenta > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {seleccion.map((materiaId) => {
            const materia = materias.find((m) => m.id === materiaId);
            const nombreError = `promedio-${materiaId}`;
            const error = errores[`promedio:${materiaId}`];
            return (
              <div key={materiaId} className="flex min-w-0 flex-col gap-1.5">
                <label
                  htmlFor={nombreError}
                  className="text-[11px] font-semibold text-text"
                >
                  Promedio en {materia?.nombre} *
                </label>
                <input
                  id={nombreError}
                  name={`promedio-${materiaId}`}
                  type="text"
                  inputMode="decimal"
                  placeholder="Ej. 4.5"
                  value={promedios[materiaId] ?? ""}
                  onChange={(event) => cambiarPromedio(materiaId, event.target.value)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? `${nombreError}-error` : undefined}
                  className={`w-full min-w-0 rounded-[10px] border px-3.5 py-2.5 text-[13px] outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30 ${
                    error ? "border-danger" : "border-border"
                  }`}
                />
                <p className="mb-0 text-[10px] text-text-muted">
                  Ingresa el promedio que aparece en tu certificado.
                </p>
                {error && (
                  <p
                    id={`${nombreError}-error`}
                    role="alert"
                    className="mb-0 text-[11px] text-danger"
                  >
                    {error}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex min-w-0 flex-col gap-1.5">
        <label htmlFor="programa" className="text-[11px] font-semibold text-text">
          Programa académico *
        </label>
        <input
          id="programa"
          name="programa"
          type="text"
          value={PROGRAMA_ACADEMICO}
          readOnly
          disabled
          className="w-full min-w-0 rounded-[10px] border border-border bg-page px-3.5 py-2.5 text-[13px] text-text-muted"
        />
      </div>

      <div className="flex min-w-0 flex-col gap-1.5">
        <label htmlFor="certificado" className="text-[11px] font-semibold text-text">
          Certificado de notas *
        </label>
        <input
          id="certificado"
          name="certificado"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(event) => {
            setArchivo(event.target.files?.[0] ?? null);
            setErrores((previos) => {
              const siguientes = { ...previos };
              delete siguientes.certificado;
              return siguientes;
            });
          }}
          aria-invalid={Boolean(errores.certificado)}
          aria-describedby={errores.certificado ? "certificado-error" : undefined}
          className={`w-full min-w-0 cursor-pointer rounded-[10px] border bg-white px-3.5 py-2.5 text-[12px] file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-primary-light file:px-3 file:py-1.5 file:text-[11px] file:font-bold file:text-primary ${
            errores.certificado ? "border-danger" : "border-border"
          }`}
        />
        <p className="mb-0 text-[10px] text-text-muted">
          Archivo PDF, JPG o PNG de máximo 5 MB. Respaldan los promedios de todas
          las materias del envío.
        </p>
        {errores.certificado && (
          <p id="certificado-error" role="alert" className="mb-0 text-[11px] text-danger">
            {errores.certificado}
          </p>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-1.5">
        <label htmlFor="descripcion" className="text-[11px] font-semibold text-text">
          Cuéntanos cómo puedes ayudar (opcional)
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          rows={4}
          maxLength={500}
          placeholder="Describe brevemente tu experiencia o forma de enseñar…"
          value={descripcion}
          onChange={(event) => {
            setDescripcion(event.target.value);
            setErrores((previos) => {
              const siguientes = { ...previos };
              delete siguientes.descripcion;
              return siguientes;
            });
          }}
          aria-invalid={Boolean(errores.descripcion)}
          className={`w-full min-w-0 resize-y rounded-[10px] border px-3.5 py-2.5 text-[13px] outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30 ${
            errores.descripcion ? "border-danger" : "border-border"
          }`}
        />
        <p className="mb-0 text-right text-[10px] text-text-muted">
          {descripcion.length}/500
        </p>
        {errores.descripcion && (
          <p role="alert" className="mb-0 text-[11px] text-danger">
            {errores.descripcion}
          </p>
        )}
      </div>

      <div className="rounded-[12px] border border-[#f2e4c5] bg-status-pending px-4 py-3.5 text-[11px] leading-[1.6] text-status-pending-ink">
        <strong className="font-bold">La solicitud quedará pendiente de revisión.</strong>{" "}
        Un administrador verificará tu certificado antes de que tu perfil se haga
        público.
      </div>

      {falloGeneral && (
        <p
          role="alert"
          className="m-0 rounded-[10px] bg-status-danger px-4 py-3 text-[11px] text-status-danger-ink"
        >
          {falloGeneral}
        </p>
      )}

      {exito && (
        <p
          role="status"
          className="m-0 rounded-[10px] bg-status-success px-4 py-3 text-[11px] text-status-success-ink"
        >
          Solicitud enviada. Puedes seguir su estado en el panel de la derecha.
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={limpiar}
          disabled={cargando}
          className="inline-flex min-h-[39px] flex-1 items-center justify-center rounded-[10px] border border-border bg-white px-4 text-[11px] font-bold text-text transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
        >
          Limpiar
        </button>
        <button
          type="submit"
          disabled={cargando}
          aria-busy={cargando}
          className="inline-flex min-h-[39px] flex-1 items-center justify-center rounded-[10px] border border-transparent bg-accent px-4 text-[11px] font-bold text-white shadow-[0_5px_12px_rgba(255,90,140,0.15)] transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
        >
          {cargando ? "Enviando…" : "Enviar solicitud →"}
        </button>
      </div>
    </form>
  );
};

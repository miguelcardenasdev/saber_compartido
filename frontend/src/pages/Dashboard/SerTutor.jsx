import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../features/auth/auth-context.jsx";
import { obtenerMaterias } from "../../features/tutor/api-materias.js";
import { obtenerSolicitudes } from "../../features/tutor/api-tutor.js";
import { FormularioRegistroTutor } from "../../features/tutor/formulario-registro-tutor.jsx";
import { PanelRequisitos } from "../../features/tutor/panel-requisitos.jsx";
import { PanelEstadoSolicitudes } from "../../features/tutor/panel-estado-solicitudes.jsx";

export const SerTutor = () => {
  const { fijarUsuario } = useAuth();
  const [materias, setMaterias] = useState([]);
  const [errorMaterias, setErrorMaterias] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargandoSolicitudes, setCargandoSolicitudes] = useState(true);
  const [errorSolicitudes, setErrorSolicitudes] = useState(null);
  const [intento, setIntento] = useState(0);

  const manejarSesionPerdida = useCallback(() => {
    fijarUsuario(null);
  }, [fijarUsuario]);

  const recargarSolicitudes = useCallback(() => {
    setErrorSolicitudes(null);
    setCargandoSolicitudes(true);
    setIntento((anterior) => anterior + 1);
  }, []);

  useEffect(() => {
    let activo = true;

    obtenerMaterias()
      .then((respuesta) => {
        if (activo) setMaterias(respuesta);
      })
      .catch((fallos) => {
        if (!activo) return;
        if (fallos?.status === 401) {
          fijarUsuario(null);
          return;
        }
        setErrorMaterias(fallos);
      });

    return () => {
      activo = false;
    };
  }, [fijarUsuario]);

  useEffect(() => {
    let activo = true;

    obtenerSolicitudes()
      .then((respuesta) => {
        if (!activo) return;
        setSolicitudes(respuesta);
        setCargandoSolicitudes(false);
      })
      .catch((fallos) => {
        if (!activo) return;
        setCargandoSolicitudes(false);
        if (fallos?.status === 401) {
          fijarUsuario(null);
          return;
        }
        setErrorSolicitudes(fallos);
      });

    return () => {
      activo = false;
    };
  }, [intento, fijarUsuario]);

  return (
    <>
      <section className="mb-[21px]">
        <span className="text-[10px] font-extrabold uppercase tracking-[1.15px] text-primary">
          Mi espacio
        </span>
        <h1 className="mb-[7px] mt-[9px] font-heading text-[24px] tracking-[-0.8px] text-text max-[650px]:text-[22px]">
          Comparte lo que sabes
        </h1>
        <p className="m-0 max-w-[540px] text-[11px] leading-[1.7] text-text-muted">
          Postúlate como tutor de una materia y ayuda a otros estudiantes a
          avanzar.
        </p>
      </section>

      <div className="grid grid-cols-[minmax(0,1.55fr)_minmax(260px,1fr)] items-start gap-[17px] max-[900px]:grid-cols-1">
        <section className="min-w-0 overflow-hidden rounded-card border border-[#eeeaf5] bg-white shadow-card">
          <div className="flex items-center justify-between gap-3 border-b border-[#f1edf6] px-5 py-[18px]">
            <div>
              <h2 className="m-0 text-[13px] tracking-[-0.25px]">
                Solicitud para ser tutor
              </h2>
              <p className="mb-0 mt-[5px] text-[10px] text-text-muted">
                Completa la información de tu materia y adjunta tu certificado.
              </p>
            </div>
            <span className="flex-none rounded-full bg-status-pending px-2.5 py-[5px] text-[9px] font-bold text-status-pending-ink">
              Verificación requerida
            </span>
          </div>

          <div className="px-5 py-[18px]">
            {errorMaterias ? (
              <div className="px-[15px] py-[35px] text-center">
                <strong className="mb-[6px] block text-[12px] text-text">
                  No pudimos cargar las materias
                </strong>
                <p className="mx-auto mb-[14px] max-w-[270px] text-[10px] leading-[1.6] text-text-muted">
                  Ocurrió un problema al consultar el catálogo. Recarga la
                  página para intentar de nuevo.
                </p>
              </div>
            ) : (
              <FormularioRegistroTutor
                materias={materias}
                onEnviado={recargarSolicitudes}
                onSesionPerdida={manejarSesionPerdida}
              />
            )}
          </div>
        </section>

        <div className="grid gap-[17px]">
          <PanelRequisitos />
          <PanelEstadoSolicitudes
            solicitudes={solicitudes}
            cargando={cargandoSolicitudes}
            error={errorSolicitudes}
            onReintentar={recargarSolicitudes}
          />
        </div>
      </div>
    </>
  );
};

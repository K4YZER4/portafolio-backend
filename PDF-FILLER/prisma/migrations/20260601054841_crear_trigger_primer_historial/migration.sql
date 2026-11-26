-- This is an empty migration.

-- TRIGGER: trg_primer_historial_contrato
-- Propósito:
--   Al insertar un nuevo contrato, registra automáticamente
--   el primer entrada en historial_credito con estado "POR FIRMAR".
--   Garantiza que el ciclo de vida del contrato siempre esté
--   completo desde su creación sin que el procedimiento
--   generar_contrato tenga que hacerlo manualmente.
--
-- Datos registrados:
--   id_estado_anterior → NULL  (no venía de ningún estado previo)
--   id_estado_nuevo    → el estado asignado al contrato (POR FIRMAR)
--   id_usuario         → el asesor que generó el contrato
--   fecha_inicio       → fecha actual
--   fecha_fin          → NULL  (sigue activo en este estado)
-- ==========================================

CREATE OR REPLACE FUNCTION credito.fn_primer_historial_contrato()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
  v_estado_descripcion VARCHAR(50);
BEGIN

  SELECT descripcion INTO v_estado_descripcion
  FROM catalogo.estado_contrato
  WHERE id = NEW.id_estado_contrato;

  IF v_estado_descripcion IS NULL THEN
    RAISE EXCEPTION
      'El estado de contrato con id % no existe en el catálogo.',
      NEW.id_estado_contrato;
  END IF;

  IF v_estado_descripcion <> 'POR FIRMAR' THEN
    RAISE EXCEPTION
      'Un contrato solo puede crearse con estado "POR FIRMAR". Estado recibido: "%".',
      v_estado_descripcion;
  END IF;

  -- Registrar el primer estado en el historial
  INSERT INTO credito.historial_credito (
    id_contrato,
    id_estado_anterior,
    id_estado_nuevo,
    id_usuario,
    fecha_inicio,
    fecha_fin,
    observaciones
  ) VALUES (
    NEW.id,
    NULL,
    NEW.id_estado_contrato,
    NEW.id_asesor,
    CURRENT_DATE,
    NULL,
    'Contrato generado — estado inicial asignado automáticamente.'
  );

  RETURN NEW;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION
      'Error al registrar historial inicial del contrato %: %',
      NEW.id, SQLERRM;
END;
$$;

-- Eliminar el trigger si ya existe para evitar duplicados al re-ejecutar
DROP TRIGGER IF EXISTS trg_primer_historial_contrato ON credito.contrato_prestamo;

CREATE TRIGGER trg_primer_historial_contrato
  AFTER INSERT ON credito.contrato_prestamo
  FOR EACH ROW
  EXECUTE FUNCTION credito.fn_primer_historial_contrato();
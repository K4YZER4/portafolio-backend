-- Fix: hacer case-insensitive la comparación de estado en el trigger

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

  IF LOWER(v_estado_descripcion) <> LOWER('POR FIRMAR') THEN
    RAISE EXCEPTION
      'Un contrato solo puede crearse con estado "POR FIRMAR". Estado recibido: "%".',
      v_estado_descripcion;
  END IF;

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

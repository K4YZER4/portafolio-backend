-- This is an empty migration.
-- VISTA: vista_historial_contratos

CREATE OR REPLACE VIEW credito.vista_historial_contratos AS
SELECT
  cp.id,
  cp.folio,
  cp.fecha_firma                                              AS fecha_contrato,
  CONCAT(c.nombre, ' ', c.apellido_paterno, ' ', c.apellido_materno)::VARCHAR(200) AS nombre_cliente,
  cp.importe_credito::NUMERIC(10,2)                           AS importe_credito,
  p.plazo_quincenas,
  CONCAT(u.nombre, ' ', u.apellido_paterno)::VARCHAR(200)    AS nombre_asesor,
  u.id                                                        AS id_asesor,
  ec.descripcion                                              AS estado_contrato
FROM credito.contrato_prestamo cp
JOIN cliente.cliente          c  ON cp.id_cliente           = c.id
JOIN organizacion.usuario     u  ON cp.id_asesor            = u.id
JOIN credito.producto_credito p  ON cp.id_producto          = p.id
JOIN catalogo.estado_contrato ec ON cp.id_estado_contrato   = ec.id;

-- FUNCIÓN: calcular_prestamo
CREATE OR REPLACE FUNCTION credito.calcular_prestamo(
  p_monto_neto      NUMERIC,
  p_plazo_quincenas INT
)
RETURNS TABLE (
  monto_pagare       NUMERIC,
  descuento_quincenal NUMERIC,
  tasa_mensual       NUMERIC,
  cat_anual          NUMERIC
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
    SELECT
      td.monto_pagare::NUMERIC,
      td.importe_descuento::NUMERIC,
      pc.tasa_mensual::NUMERIC,
      pc.cat::NUMERIC
    FROM credito.tabla_descuento    td
    JOIN credito.producto_credito   pc ON td.id_producto = pc.id
    WHERE td.monto_neto_prestar  = p_monto_neto
      AND pc.plazo_quincenas     = p_plazo_quincenas
      AND pc.activo              = TRUE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No existe un producto para el monto % y plazo % quincenas',
      p_monto_neto, p_plazo_quincenas;
  END IF;

  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Error al buscar el producto: %', SQLERRM;
END;
$$;


-- PROCEDIMIENTO: generar_contrato--

CREATE OR REPLACE PROCEDURE credito.generar_contrato(
  -- Cliente
  p_nombre1                   VARCHAR(100),
  p_nombre2                   VARCHAR(100),
  p_apellido_paterno          VARCHAR(100),
  p_apellido_materno          VARCHAR(100),
  p_curp                      VARCHAR(18),
  p_rfc                       VARCHAR(13),
  p_fecha_nacimiento          DATE,
  p_sexo                      VARCHAR(1),
  p_estado_civil              VARCHAR(50),
  p_tipo_vivienda             VARCHAR(50),
  p_telefono_celular          VARCHAR(15),
  p_telefono_fijo             VARCHAR(15),
  p_email                     VARCHAR(150),
  p_anios_residencia          INT,
  p_dependientes_economicos   INT,
  -- Dirección
  p_calle                     VARCHAR(200),
  p_entre_calles              VARCHAR(200),
  p_numero_exterior           VARCHAR(10),
  p_numero_interior           VARCHAR(10),
  p_colonia                   VARCHAR(150),
  p_codigo_postal             CHAR(5),
  p_municipio                 VARCHAR(100),
  p_estado                    CHAR(2),      -- id de entidad_federativa
  -- Nómina
  p_numero_empleado           VARCHAR(50),
  p_dependencia               VARCHAR(100),
  p_departamento              VARCHAR(100),
  p_puesto                    VARCHAR(100),
  p_ingreso_mensual           NUMERIC(10,2),
  p_fecha_inicio_empleo       DATE,
  -- Estado de cuenta
  p_numero_cuenta             VARCHAR(20),
  p_clabe                     CHAR(18),
  p_banco                     VARCHAR(100),
  -- Referencias
  p_ref1_nombre               VARCHAR(100),
  p_ref1_apellido_paterno     VARCHAR(100),
  p_ref1_apellido_materno     VARCHAR(100),
  p_ref1_telefono             VARCHAR(15),
  p_ref2_nombre               VARCHAR(100),
  p_ref2_apellido_paterno     VARCHAR(100),
  p_ref2_apellido_materno     VARCHAR(100),
  p_ref2_telefono             VARCHAR(15),
  p_ref3_nombre               VARCHAR(100),
  p_ref3_apellido_paterno     VARCHAR(100),
  p_ref3_apellido_materno     VARCHAR(100),
  p_ref3_telefono             VARCHAR(15),
  -- Contrato
  p_id_producto               INT,
  p_id_tabla_descuento        INT,
  p_id_asesor                 INT,
  p_folio                     VARCHAR(20),
  p_municipio_firma           VARCHAR(100),
  p_importe_credito           NUMERIC(10,2),
  p_importe_total_credito     NUMERIC(10,2),
  p_tasa_mensual              NUMERIC(5,2),
  p_comision_disposicion      NUMERIC(5,2),
  p_importe_pago_quincenal    NUMERIC(10,2),
  p_fecha_limite_pago         VARCHAR(50),
  p_fecha_corte               VARCHAR(50),
  p_frecuencia_pago           VARCHAR(20),
  p_fecha_inicio_pagos        DATE,
  p_fecha_firma               DATE,
  p_perfil_transaccional      VARCHAR(100),
  p_estado_cuenta_domicilio   BOOLEAN,
  p_estado_cuenta_internet    BOOLEAN,
  p_estado_cuenta_email       BOOLEAN
)
LANGUAGE plpgsql AS $$
DECLARE
  -- IDs de catálogos
  v_id_genero               INT;
  v_id_estado_civil         INT;
  v_id_tipo_vivienda        INT;
  v_id_entidad_federativa   CHAR(2);
  v_id_municipio            INT;
  v_id_colonia              INT;
  v_id_dependencia          INT;
  v_id_banco                INT;
  v_id_municipio_firma      INT;
  v_id_estado_contrato      INT;
  v_id_pais_mexico          INT;
  -- IDs generados
  v_id_cliente              INT;
  v_id_contrato             INT;
BEGIN


  -- BLOQUE 1: RESOLUCIÓN DE CATÁLOGOS

  -- Género
  SELECT id INTO v_id_genero
  FROM catalogo.genero
  WHERE descripcion = CASE p_sexo
    WHEN 'M' THEN 'MASCULINO'
    WHEN 'F' THEN 'FEMENINO'
  END;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Género no encontrado para sexo: %', p_sexo;
  END IF;

  -- Estado civil
  SELECT id INTO v_id_estado_civil
  FROM catalogo.estado_civil
  WHERE UPPER(descripcion) = UPPER(p_estado_civil);
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Estado civil no encontrado: %', p_estado_civil;
  END IF;

  -- Tipo vivienda
  SELECT id INTO v_id_tipo_vivienda
  FROM catalogo.tipo_vivienda
  WHERE UPPER(descripcion) = UPPER(p_tipo_vivienda);
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tipo de vivienda no encontrado: %', p_tipo_vivienda;
  END IF;

  -- Entidad federativa
  SELECT id INTO v_id_entidad_federativa
  FROM catalogo.entidad_federativa
  WHERE id = p_estado;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Entidad federativa no encontrada: %', p_estado;
  END IF;

  -- Municipio del domicilio
  SELECT id INTO v_id_municipio
  FROM catalogo.municipio
  WHERE UPPER(nombre) = UPPER(p_municipio)
    AND id_entidad_federativa = v_id_entidad_federativa;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Municipio no encontrado: % en estado %', p_municipio, p_estado;
  END IF;

  -- Colonia
  SELECT id INTO v_id_colonia
  FROM catalogo.colonia
  WHERE UPPER(nombre) = UPPER(p_colonia)
    AND codigo_postal = p_codigo_postal
    AND id_municipio = v_id_municipio;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Colonia no encontrada: % con CP %', p_colonia, p_codigo_postal;
  END IF;

  -- Dependencia laboral
  SELECT id INTO v_id_dependencia
  FROM catalogo.dependencia
  WHERE UPPER(descripcion) = UPPER(p_dependencia);
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Dependencia no encontrada: %', p_dependencia;
  END IF;

  -- Banco
  SELECT id INTO v_id_banco
  FROM catalogo.banco
  WHERE UPPER(nombre) = UPPER(p_banco);
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Banco no encontrado: %', p_banco;
  END IF;

  -- Municipio de firma del contrato
  SELECT id INTO v_id_municipio_firma
  FROM catalogo.municipio
  WHERE UPPER(nombre) = UPPER(p_municipio_firma);
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Municipio de firma no encontrado: %', p_municipio_firma;
  END IF;

  -- Estado contrato: "POR FIRMAR"
  SELECT id INTO v_id_estado_contrato
  FROM catalogo.estado_contrato
  WHERE descripcion = 'POR FIRMAR';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Estado de contrato "POR FIRMAR" no encontrado en catálogo';
  END IF;

  -- País México (para nacionalidad)
  SELECT id INTO v_id_pais_mexico
  FROM catalogo.pais
  WHERE UPPER(nombre) = 'MEXICO' OR codigo_iso3 = 'MEX';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'País México no encontrado en catálogo';
  END IF;

  -- BLOQUE 2: CLIENTE Y SU INFORMACIÓN

  -- Cliente
  INSERT INTO cliente.cliente (
    nombre,
    apellido_paterno,
    apellido_materno,
    curp,
    rfc,
    fecha_nacimiento,
    id_genero,
    id_estado_civil,
    id_estado_nacimiento,
    id_pais_nacionalidad,
    telefono_celular,
    telefono_fijo,
    email_personal,
    id_tipo_vivienda,
    anios_residencia,
    dependientes_economicos,
    url_firma_svg,
    updated_at
  ) VALUES (
    UPPER(p_nombre1 || ' ' || COALESCE(p_nombre2, '')),
    UPPER(p_apellido_paterno),
    UPPER(p_apellido_materno),
    p_curp,
    p_rfc,
    p_fecha_nacimiento,
    v_id_genero,
    v_id_estado_civil,
    v_id_entidad_federativa,
    v_id_pais_mexico,
    p_telefono_celular,
    p_telefono_fijo,
    p_email,
    v_id_tipo_vivienda,
    p_anios_residencia,
    p_dependientes_economicos,
    '',   -- url_firma_svg: se actualiza después al generar la firma
    NOW()
  )
  RETURNING id INTO v_id_cliente;

  -- Dirección
  INSERT INTO cliente.direccion_cliente (
    id_cliente,
    calle,
    entre_calles,
    numero_exterior,
    numero_interior,
    id_colonia
  ) VALUES (
    v_id_cliente,
    UPPER(p_calle),
    UPPER(p_entre_calles),
    p_numero_exterior,
    p_numero_interior,
    v_id_colonia
  );

  -- Empleo
  INSERT INTO cliente.empleo_cliente (
    id_cliente,
    id_dependencia_empleo,
    nombre_empresa,
    numero_empleado,
    area,
    puesto,
    ingreso_mensual,
    telefono_empresarial,
    email_laboral,
    fecha_inicio
  ) VALUES (
    v_id_cliente,
    v_id_dependencia,
    UPPER(p_dependencia),
    p_numero_empleado,
    UPPER(p_departamento),
    UPPER(p_puesto),
    p_ingreso_mensual,
    '',     -- telefono_empresarial: no viene en camposPDF, se puede actualizar después
    '',     -- email_laboral: no viene en camposPDF, se puede actualizar después
    p_fecha_inicio_empleo
  );

  -- Información bancaria
  INSERT INTO cliente.informacion_bancaria_cliente (
    id_cliente,
    id_banco,
    numero_cuenta,
    clabe,
    nombre_titular,
    orden_de_pago,
    cheque,
    transferencia_electronica
  ) VALUES (
    v_id_cliente,
    v_id_banco,
    p_numero_cuenta,
    p_clabe,
    UPPER(p_nombre1 || ' ' || COALESCE(p_nombre2, '') || ' ' || p_apellido_paterno || ' ' || p_apellido_materno),
    FALSE,
    FALSE,
    FALSE
  );

  -- Referencias personales
  INSERT INTO cliente.referencias_personales (
    id_cliente, nombre, apellido_paterno, apellido_materno, telefono
  ) VALUES
    (v_id_cliente, UPPER(p_ref1_nombre), UPPER(p_ref1_apellido_paterno), UPPER(p_ref1_apellido_materno), p_ref1_telefono),
    (v_id_cliente, UPPER(p_ref2_nombre), UPPER(p_ref2_apellido_paterno), UPPER(p_ref2_apellido_materno), p_ref2_telefono),
    (v_id_cliente, UPPER(p_ref3_nombre), UPPER(p_ref3_apellido_paterno), UPPER(p_ref3_apellido_materno), p_ref3_telefono);


  -- BLOQUE 3: CONTRATO

  INSERT INTO credito.contrato_prestamo (
    folio,
    id_cliente,
    id_producto,
    id_estado_contrato,
    id_tabla_descuento,
    id_asesor,
    id_municipio_firma,
    fecha_firma,
    perfil_transaccional,
    importe_credito,
    importe_total_credito,
    tasa_mensual,
    comision_disposicion,
    importe_pago_quincenal,
    fecha_limite_pago,
    fecha_corte,
    estado_cuenta_domicilio,
    estado_cuenta_internet,
    estado_cuenta_email,
    frecuencia_pago,
    fecha_inicio_pagos
  ) VALUES (
    p_folio,
    v_id_cliente,
    p_id_producto,
    v_id_estado_contrato,
    p_id_tabla_descuento,
    p_id_asesor,
    v_id_municipio_firma,
    p_fecha_firma,
    p_perfil_transaccional,
    p_importe_credito,
    p_importe_total_credito,
    p_tasa_mensual,
    p_comision_disposicion,
    p_importe_pago_quincenal,
    p_fecha_limite_pago,
    p_fecha_corte,
    p_estado_cuenta_domicilio,
    p_estado_cuenta_internet,
    p_estado_cuenta_email,
    p_frecuencia_pago,
    p_fecha_inicio_pagos
  )
  RETURNING id INTO v_id_contrato;

  -- BLOQUE 4: DOCUMENTOS (se crean con defaults)

  INSERT INTO documentos.autorizacion_crediticia (id_contrato, id_municipio_firma, fecha_firma, fecha_vigencia)
  VALUES (v_id_contrato, v_id_municipio_firma, p_fecha_firma, (p_fecha_firma + INTERVAL '3 years')::DATE);

  INSERT INTO documentos.aviso_privacidad (id_contrato, id_municipio_firma, fecha_firma, acepta_uso_secundario, acepta_uso_llamadas_bienvenida, acepta_uso_mercadotecnica)
  VALUES (v_id_contrato, v_id_municipio_firma, p_fecha_firma, FALSE, FALSE, FALSE);

  INSERT INTO documentos.entrevista_perfil_politico (id_contrato, id_municipio_firma, fecha_firma, datos_completos)
  VALUES (v_id_contrato, v_id_municipio_firma, p_fecha_firma, FALSE);

  INSERT INTO documentos.origen_recursos (id_contrato, id_municipio_firma, fecha_firma, proveedor_recursos, propietario_real, ingreso_mensual, origen_recursos, destino_recursos)
  VALUES (v_id_contrato, v_id_municipio_firma, p_fecha_firma, 'PENDIENTE', 'PENDIENTE', p_ingreso_mensual, 'PENDIENTE', 'PENDIENTE');

  INSERT INTO documentos.pagare (id_contrato, id_municipio_firma, fecha_firma, fecha_vencimiento)
  VALUES (v_id_contrato, v_id_municipio_firma, p_fecha_firma, p_fecha_inicio_pagos);

  INSERT INTO documentos.domiciliacion_banco (id_contrato, id_municipio_firma, fecha_firma)
  VALUES (v_id_contrato, v_id_municipio_firma, p_fecha_firma);

  INSERT INTO documentos.domiciliacion (id_contrato, id_municipio_firma, fecha_firma)
  VALUES (v_id_contrato, v_id_municipio_firma, p_fecha_firma);

  INSERT INTO documentos.carta_autorizacion_descuento (id_contrato, id_municipio_firma, fecha_firma)
  VALUES (v_id_contrato, v_id_municipio_firma, p_fecha_firma);

  INSERT INTO documentos.consentimiento_descuento_nomina (id_contrato, id_municipio_firma, fecha_firma)
  VALUES (v_id_contrato, v_id_municipio_firma, p_fecha_firma);

    RAISE NOTICE 'Contrato generado exitosamente';

  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Error al generar contrato: %', SQLERRM;
END;
$$;


ALTER TABLE "credito"."contrato_prestamo"
    ADD CONSTRAINT chk_fecha_firma_contrato_prestamo CHECK (fecha_firma <= CURRENT_DATE)
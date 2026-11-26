
-- CHECKS PARA ESQUEMA: ORGANIZACION
-- Tabla: empresa
ALTER TABLE "organizacion"."empresa"
  ADD CONSTRAINT chk_rfc             CHECK (length(rfc) BETWEEN 12 AND 13),
  ADD CONSTRAINT chk_telefono        CHECK (telefono ~ '^[0-9]{10}$'),
  ADD CONSTRAINT chk_email           CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  ADD CONSTRAINT chk_pagina_internet CHECK (pagina_internet ~ '^https?://[A-Za-z0-9.-]+\.[A-Za-z]{2,}.*$');

-- Tabla: usuario
ALTER TABLE "organizacion"."usuario"
  ADD CONSTRAINT chk_codigo_empleado CHECK (codigo_empleado ~ '^[A-Za-z0-9]{6}$'),
  ADD CONSTRAINT chk_hash_password   CHECK (length(hash_password) = 60),
  ADD CONSTRAINT chk_correo          CHECK (correo ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  ADD CONSTRAINT chk_usuario         CHECK (length(trim(usuario)) > 0);

-- CHECKS PARA ESQUEMA: CLIENTE
-- Tabla: cliente
ALTER TABLE "cliente"."cliente"
  ADD CONSTRAINT chk_dependientes_economicos CHECK (dependientes_economicos >= 0),
  ADD CONSTRAINT chk_anios_residencia        CHECK (anios_residencia >= 0),
  ADD CONSTRAINT chk_fecha_nacimiento        CHECK (fecha_nacimiento <= (CURRENT_DATE - INTERVAL '18 years')),
  ADD CONSTRAINT chk_telefono_fijo           CHECK (telefono_fijo ~ '^[0-9]{10}$'),
  ADD CONSTRAINT chk_telefono_celular        CHECK (telefono_celular IS NULL OR telefono_celular ~ '^[0-9]{10}$'),
  ADD CONSTRAINT chk_telefono_recados        CHECK (telefono_recados IS NULL OR telefono_recados ~ '^[0-9]{10}$'),
  ADD CONSTRAINT chk_email_personal          CHECK (email_personal ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  ADD CONSTRAINT chk_curp                    CHECK (length(curp) = 18),
  ADD CONSTRAINT chk_rfc                     CHECK (length(rfc) BETWEEN 12 AND 13),
  ADD CONSTRAINT chk_efirma                  CHECK (efirma_activa = FALSE OR (numero_serie_efirma IS NOT NULL AND fecha_vigencia_efirma IS NOT NULL)),
  ADD CONSTRAINT chk_fecha_vigencia_efirma   CHECK (fecha_vigencia_efirma IS NULL OR fecha_vigencia_efirma > CURRENT_DATE);

-- Tabla: empleo_cliente
ALTER TABLE "cliente"."empleo_cliente"
  ADD CONSTRAINT chk_ingreso_mensual      CHECK (ingreso_mensual > 0),
  ADD CONSTRAINT chk_email_laboral        CHECK (email_laboral ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  ADD CONSTRAINT chk_telefono_empresarial CHECK (telefono_empresarial ~ '^[0-9]{10}$');

-- Tabla: direccion_cliente
ALTER TABLE "cliente"."direccion_cliente"
  ADD CONSTRAINT chk_numero_exterior CHECK (numero_exterior IS NOT NULL AND length(trim(numero_exterior)) > 0),
  ADD CONSTRAINT chk_numero_interior CHECK (numero_interior IS NULL OR length(trim(numero_interior)) > 0);

-- Tabla: referencias_personales
ALTER TABLE "cliente"."referencias_personales"
  ADD CONSTRAINT chk_telefono CHECK (telefono ~ '^[0-9]{10}$');

-- Tabla: informacion_bancaria_cliente
ALTER TABLE "cliente"."informacion_bancaria_cliente"
  ADD CONSTRAINT chk_clabe       CHECK (clabe ~ '^[0-9]{18}$'),
  ADD CONSTRAINT chk_disposicion CHECK (orden_de_pago = TRUE OR cheque = TRUE OR transferencia_electronica = TRUE);

-- CHECKS PARA ESQUEMA: CATALOGO
-- Tabla: pais
ALTER TABLE "catalogo"."pais"
  ADD CONSTRAINT chk_codigo_iso2 CHECK (codigo_iso2 ~ '^[A-Za-z]{2}$'),
  ADD CONSTRAINT chk_codigo_iso3 CHECK (codigo_iso3 ~ '^[A-Za-z]{3}$');

-- Tabla: entidad_federativa
ALTER TABLE "catalogo"."entidad_federativa"
  ADD CONSTRAINT chk_id          CHECK (id ~ '^(0[1-9]|[1-2][0-9]|3[0-2])$'),
  ADD CONSTRAINT chk_abreviatura CHECK (abreviatura ~ '^[A-Za-z]{3}$');

-- Tabla: colonia
ALTER TABLE "catalogo"."colonia"
  ADD CONSTRAINT chk_codigo_postal CHECK (codigo_postal ~ '^[0-9]{5}$');

-- CHECKS PARA ESQUEMA: CREDITO
-- Tabla: producto_credito
ALTER TABLE "credito"."producto_credito"
  ADD CONSTRAINT chk_tasa_mensual    CHECK (tasa_mensual > 0),
  ADD CONSTRAINT chk_tasa_anual      CHECK (tasa_anual > 0),
  ADD CONSTRAINT chk_cat             CHECK (cat > 0),
  ADD CONSTRAINT chk_iva_tasa        CHECK (iva_tasa > 0),
  ADD CONSTRAINT chk_relacion_plazos CHECK (plazo_quincenas = (plazo_meses * 2));

-- Tabla: tabla_descuento
ALTER TABLE "credito"."tabla_descuento"
  ADD CONSTRAINT chk_monto_neto        CHECK (monto_neto_prestar > 0),
  ADD CONSTRAINT chk_monto_pagare      CHECK (monto_pagare > monto_neto_prestar),
  ADD CONSTRAINT chk_importe_descuento CHECK (importe_descuento > 0),
  ADD CONSTRAINT chk_importe_interes   CHECK (importe_interes > 0),
  ADD CONSTRAINT chk_importe_iva       CHECK (importe_iva_interes > 0);

-- Tabla: contrato_prestamo
ALTER TABLE "credito"."contrato_prestamo"
  ADD CONSTRAINT chk_importe_credito       CHECK (importe_credito > 0),
  ADD CONSTRAINT chk_importe_total         CHECK (importe_total_credito > importe_credito),
  ADD CONSTRAINT chk_importe_pago          CHECK (importe_pago_quincenal > 0),
  ADD CONSTRAINT chk_tasa_mensual_contrato CHECK (tasa_mensual > 0),
  ADD CONSTRAINT chk_comision_disposicion  CHECK (comision_disposicion >= 0),
  ADD CONSTRAINT chk_estado_cuenta         CHECK (estado_cuenta_domicilio = TRUE OR estado_cuenta_internet = TRUE OR estado_cuenta_email = TRUE),
  ADD CONSTRAINT chk_fecha_inicio_pagos    CHECK (fecha_inicio_pagos >= CAST(created_at AS DATE));

-- CHECKS PARA ESQUEMA: DOCUMENTOS
-- Tabla: autorizacion_crediticia
ALTER TABLE "documentos"."autorizacion_crediticia"
  ADD CONSTRAINT chk_fecha_vigencia           CHECK (fecha_vigencia = (fecha_firma + INTERVAL '3 years')::DATE),
  ADD CONSTRAINT chk_fechas_sic               CHECK (fecha_consulta_sic_2 IS NULL OR fecha_consulta_sic_1 IS NULL OR fecha_consulta_sic_2 >= fecha_consulta_sic_1),
  ADD CONSTRAINT chk_fecha_firma_autorizacion CHECK (fecha_firma <= CURRENT_DATE);

-- Tabla: aviso_privacidad
ALTER TABLE "documentos"."aviso_privacidad"
  ADD CONSTRAINT chk_fecha_firma_aviso CHECK (fecha_firma <= CURRENT_DATE);

-- Tabla: entrevista_perfil_politico
ALTER TABLE "documentos"."entrevista_perfil_politico"
  ADD CONSTRAINT chk_observaciones             CHECK (datos_completos = TRUE OR observaciones_faltantes IS NOT NULL),
  ADD CONSTRAINT chk_pep_puesto                CHECK (es_pep = FALSE OR pep_puesto IS NOT NULL),
  ADD CONSTRAINT chk_pep_periodo               CHECK (es_pep = FALSE OR pep_periodo IS NOT NULL),
  ADD CONSTRAINT chk_familiar_datos            CHECK (familiar_es_pep = FALSE OR (familiar_nombre IS NOT NULL AND familiar_apellido_paterno IS NOT NULL AND familiar_parentesco IS NOT NULL)),
  ADD CONSTRAINT chk_familiar_puesto           CHECK (familiar_es_pep = FALSE OR familiar_puesto IS NOT NULL),
  ADD CONSTRAINT chk_familiar_periodo          CHECK (familiar_es_pep = FALSE OR familiar_periodo IS NOT NULL),
  ADD CONSTRAINT chk_info_reservada_puesto     CHECK (manejo_info_reservada = FALSE OR info_reservada_puesto IS NOT NULL),
  ADD CONSTRAINT chk_info_reservada_periodo    CHECK (manejo_info_reservada = FALSE OR info_reservada_periodo IS NOT NULL),
  ADD CONSTRAINT chk_finanzas_puesto           CHECK (manejo_finanzas_publicas = FALSE OR finanzas_puesto IS NOT NULL),
  ADD CONSTRAINT chk_finanzas_periodo          CHECK (manejo_finanzas_publicas = FALSE OR finanzas_periodo IS NOT NULL),
  ADD CONSTRAINT chk_fondos_puesto             CHECK (manejo_fondos_valores = FALSE OR fondos_puesto IS NOT NULL),
  ADD CONSTRAINT chk_fondos_periodo            CHECK (manejo_fondos_valores = FALSE OR fondos_periodo IS NOT NULL),
  ADD CONSTRAINT chk_concesiones_puesto        CHECK (otorgamiento_concesiones = FALSE OR concesiones_puesto IS NOT NULL),
  ADD CONSTRAINT chk_concesiones_periodo       CHECK (otorgamiento_concesiones = FALSE OR concesiones_periodo IS NOT NULL),
  ADD CONSTRAINT chk_auditoria_puesto          CHECK (auditoria_funciones = FALSE OR auditoria_puesto IS NOT NULL),
  ADD CONSTRAINT chk_auditoria_periodo         CHECK (auditoria_funciones = FALSE OR auditoria_periodo IS NOT NULL),
  ADD CONSTRAINT chk_decision_puesto           CHECK (poder_decision = FALSE OR decision_puesto IS NOT NULL),
  ADD CONSTRAINT chk_decision_periodo          CHECK (poder_decision = FALSE OR decision_periodo IS NOT NULL),
  ADD CONSTRAINT chk_info_confidencial_puesto  CHECK (info_confidencial = FALSE OR info_confidencial_puesto IS NOT NULL),
  ADD CONSTRAINT chk_info_confidencial_periodo CHECK (info_confidencial = FALSE OR info_confidencial_periodo IS NOT NULL),
  ADD CONSTRAINT chk_fecha_firma_epp           CHECK (fecha_firma <= CURRENT_DATE);

-- Tabla: origen_recursos
ALTER TABLE "documentos"."origen_recursos"
  ADD CONSTRAINT chk_ingreso_mensual_origen CHECK (ingreso_mensual > 0),
  ADD CONSTRAINT chk_prepagos              CHECK (pretende_prepagos = FALSE OR (numero_prepagos IS NOT NULL AND monto_prepagos IS NOT NULL)),
  ADD CONSTRAINT chk_monto_prepagos        CHECK (pretende_prepagos = FALSE OR monto_prepagos > 0),
  ADD CONSTRAINT chk_numero_prepagos       CHECK (pretende_prepagos = FALSE OR numero_prepagos > 0),
  ADD CONSTRAINT chk_instrumento_pago      CHECK (instrumento_pago_efectivo = TRUE OR instrumento_pago_cheque = TRUE OR instrumento_pago_transferencia = TRUE OR instrumento_pago_otro = TRUE),
  ADD CONSTRAINT chk_recursos              CHECK (recursos_propios = TRUE OR recursos_tercero = TRUE),
  ADD CONSTRAINT chk_origen_prepagos       CHECK (pretende_prepagos = FALSE OR origen_recursos_prepagos IS NOT NULL),
  ADD CONSTRAINT chk_fecha_firma_origen_recursos   CHECK (fecha_firma <= CURRENT_DATE);

-- Tabla: pagare
ALTER TABLE "documentos"."pagare"
  ADD CONSTRAINT chk_fecha_vencimiento  CHECK (fecha_vencimiento > fecha_firma),
  ADD CONSTRAINT chk_fecha_firma_pagare CHECK (fecha_firma <= CURRENT_DATE);

-- Tabla: domiciliacion_banco
ALTER TABLE "documentos"."domiciliacion_banco"
  ADD CONSTRAINT chk_fecha_firma_domic_banco CHECK (fecha_firma <= CURRENT_DATE);

-- Tabla: domiciliacion
ALTER TABLE "documentos"."domiciliacion"
  ADD CONSTRAINT chk_fecha_vencimiento_domic  CHECK (plazo_indeterminado = TRUE OR fecha_vencimiento IS NOT NULL),
  ADD CONSTRAINT chk_fecha_vencimiento_valor  CHECK (fecha_vencimiento IS NULL OR fecha_vencimiento > fecha_firma),
  ADD CONSTRAINT chk_fecha_firma_domiciliacion CHECK (fecha_firma <= CURRENT_DATE);

-- Tabla: carta_autorizacion_descuento
ALTER TABLE "documentos"."carta_autorizacion_descuento"
  ADD CONSTRAINT chk_fecha_firma_carta CHECK (fecha_firma <= CURRENT_DATE);

-- Tabla: consentimiento_descuento_nomina
ALTER TABLE "documentos"."consentimiento_descuento_nomina"
  ADD CONSTRAINT chk_fecha_firma_consentimiento CHECK (fecha_firma <= CURRENT_DATE);
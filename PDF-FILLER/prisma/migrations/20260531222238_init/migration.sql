-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "catalogo";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "cliente";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "credito";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "documentos";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "organizacion";

-- CreateTable
CREATE TABLE "organizacion"."rol" (
    "id" SERIAL NOT NULL,
    "descripcion" VARCHAR(50) NOT NULL,

    CONSTRAINT "rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizacion"."empresa" (
    "id" SERIAL NOT NULL,
    "nombre_comercial" VARCHAR(200) NOT NULL,
    "razon_social" VARCHAR(100) NOT NULL,
    "rfc" VARCHAR(13) NOT NULL,
    "registro_reca" VARCHAR(50) NOT NULL,
    "domicilio_fiscal" VARCHAR(500) NOT NULL,
    "pagina_internet" VARCHAR(200) NOT NULL,
    "telefono" VARCHAR(15) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizacion"."sucursal" (
    "id" SERIAL NOT NULL,
    "id_empresa" INTEGER NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,

    CONSTRAINT "sucursal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizacion"."usuario" (
    "id" SERIAL NOT NULL,
    "id_rol" INTEGER NOT NULL,
    "id_sucursal" INTEGER,
    "id_administrador_regional" INTEGER,
    "codigo_empleado" VARCHAR(10) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellido_paterno" VARCHAR(100) NOT NULL,
    "apellido_materno" VARCHAR(100) NOT NULL,
    "usuario" VARCHAR(50) NOT NULL,
    "correo" VARCHAR(150) NOT NULL,
    "hash_password" CHAR(60) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimo_acceso" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogo"."tipo_vivienda" (
    "id" SERIAL NOT NULL,
    "descripcion" VARCHAR(100) NOT NULL,

    CONSTRAINT "tipo_vivienda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogo"."pais" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "codigo_iso2" CHAR(2) NOT NULL,
    "codigo_iso3" CHAR(3) NOT NULL,
    "gentilicio" VARCHAR(100) NOT NULL,

    CONSTRAINT "pais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogo"."entidad_federativa" (
    "id" CHAR(2) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "abreviatura" VARCHAR(3) NOT NULL,

    CONSTRAINT "entidad_federativa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogo"."municipio" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "id_entidad_federativa" CHAR(2) NOT NULL,

    CONSTRAINT "municipio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogo"."colonia" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "codigo_postal" CHAR(5) NOT NULL,
    "id_municipio" INTEGER NOT NULL,

    CONSTRAINT "colonia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogo"."estado_civil" (
    "id" SERIAL NOT NULL,
    "descripcion" VARCHAR(50) NOT NULL,

    CONSTRAINT "estado_civil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogo"."genero" (
    "id" SERIAL NOT NULL,
    "descripcion" VARCHAR(50) NOT NULL,

    CONSTRAINT "genero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogo"."banco" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,

    CONSTRAINT "banco_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogo"."dependencia" (
    "id" SERIAL NOT NULL,
    "id_entidad_federativa" CHAR(2) NOT NULL,
    "descripcion" VARCHAR(100) NOT NULL,

    CONSTRAINT "dependencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogo"."estado_contrato" (
    "id" SERIAL NOT NULL,
    "descripcion" VARCHAR(50) NOT NULL,

    CONSTRAINT "estado_contrato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente"."cliente" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "segundo_nombre" VARCHAR(100) NOT NULL,
    "apellido_paterno" VARCHAR(100) NOT NULL,
    "apellido_materno" VARCHAR(100) NOT NULL,
    "curp" VARCHAR(18) NOT NULL,
    "rfc" VARCHAR(13) NOT NULL,
    "fecha_nacimiento" DATE NOT NULL,
    "id_genero" INTEGER NOT NULL,
    "id_estado_civil" INTEGER NOT NULL,
    "id_estado_nacimiento" CHAR(2) NOT NULL,
    "id_pais_nacionalidad" INTEGER NOT NULL,
    "telefono_fijo" VARCHAR(15),
    "telefono_celular" VARCHAR(15) NOT NULL,
    "telefono_recados" VARCHAR(15),
    "email_personal" VARCHAR(150) NOT NULL,
    "numero_serie_efirma" VARCHAR(20),
    "efirma_activa" BOOLEAN NOT NULL DEFAULT false,
    "fecha_vigencia_efirma" DATE,
    "id_tipo_vivienda" INTEGER NOT NULL,
    "anios_residencia" INTEGER NOT NULL,
    "dependientes_economicos" INTEGER NOT NULL DEFAULT 0,
    "url_firma_svg" VARCHAR(500),
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente"."empleo_cliente" (
    "id" SERIAL NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_dependencia_empleo" INTEGER NOT NULL,
    "nombre_empresa" VARCHAR(200) NOT NULL,
    "numero_empleado" VARCHAR(50) NOT NULL,
    "area" VARCHAR(100) NOT NULL,
    "puesto" VARCHAR(100) NOT NULL,
    "ingreso_mensual" DECIMAL(10,2) NOT NULL,
    "telefono_empresarial" VARCHAR(15) NOT NULL,
    "email_laboral" VARCHAR(150) NOT NULL,
    "fecha_inicio" DATE NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "empleo_cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente"."direccion_cliente" (
    "id" SERIAL NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "calle" VARCHAR(200) NOT NULL,
    "entre_calles" VARCHAR(200) NOT NULL,
    "numero_exterior" VARCHAR(10) NOT NULL,
    "numero_interior" VARCHAR(10),
    "id_colonia" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "direccion_cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente"."referencias_personales" (
    "id" SERIAL NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellido_paterno" VARCHAR(100) NOT NULL,
    "apellido_materno" VARCHAR(100) NOT NULL,
    "telefono" VARCHAR(15) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referencias_personales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente"."informacion_bancaria_cliente" (
    "id" SERIAL NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_banco" INTEGER NOT NULL,
    "numero_cuenta" VARCHAR(20) NOT NULL,
    "clabe" CHAR(18) NOT NULL,
    "nombre_titular" VARCHAR(200) NOT NULL,
    "orden_de_pago" BOOLEAN NOT NULL DEFAULT false,
    "cheque" BOOLEAN NOT NULL DEFAULT false,
    "transferencia_electronica" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "informacion_bancaria_cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credito"."producto_credito" (
    "id" SERIAL NOT NULL,
    "plazo_meses" INTEGER NOT NULL,
    "plazo_quincenas" INTEGER NOT NULL,
    "tasa_mensual" DECIMAL(5,2) NOT NULL,
    "tasa_anual" DECIMAL(5,2) NOT NULL,
    "cat" DECIMAL(5,2) NOT NULL,
    "tipo_saldo" VARCHAR(50) NOT NULL,
    "iva_tasa" DECIMAL(5,2) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "producto_credito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credito"."tabla_descuento" (
    "id" SERIAL NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "monto_neto_prestar" DECIMAL(10,2) NOT NULL,
    "monto_pagare" DECIMAL(10,2) NOT NULL,
    "importe_descuento" DECIMAL(10,2) NOT NULL,
    "importe_interes" DECIMAL(10,2) NOT NULL,
    "importe_iva_interes" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "tabla_descuento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credito"."contrato_prestamo" (
    "id" SERIAL NOT NULL,
    "folio" VARCHAR(20) NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "id_estado_contrato" INTEGER NOT NULL,
    "id_tabla_descuento" INTEGER NOT NULL,
    "id_asesor" INTEGER NOT NULL,
    "perfil_transaccional" VARCHAR(100) NOT NULL,
    "importe_credito" DECIMAL(10,2) NOT NULL,
    "importe_total_credito" DECIMAL(10,2) NOT NULL,
    "tasa_mensual" DECIMAL(5,2) NOT NULL,
    "comision_disposicion" DECIMAL(5,2) NOT NULL,
    "importe_pago_quincenal" DECIMAL(10,2) NOT NULL,
    "fecha_limite_pago" VARCHAR(50) NOT NULL,
    "fecha_corte" VARCHAR(50) NOT NULL,
    "estado_cuenta_domicilio" BOOLEAN DEFAULT false,
    "estado_cuenta_internet" BOOLEAN DEFAULT false,
    "estado_cuenta_email" BOOLEAN DEFAULT false,
    "frecuencia_pago" VARCHAR(20) NOT NULL,
    "fecha_inicio_pagos" DATE NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contrato_prestamo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credito"."historial_credito" (
    "id" SERIAL NOT NULL,
    "id_contrato" INTEGER NOT NULL,
    "id_estado_anterior" INTEGER,
    "id_estado_nuevo" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE,
    "observaciones" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_credito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos"."autorizacion_crediticia" (
    "id" SERIAL NOT NULL,
    "id_contrato" INTEGER NOT NULL,
    "id_municipio_firma" INTEGER NOT NULL,
    "fecha_firma" DATE NOT NULL,
    "fecha_consulta_sic_1" DATE,
    "fecha_consulta_sic_2" DATE,
    "fecha_vigencia" DATE NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "autorizacion_crediticia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos"."aviso_privacidad" (
    "id" SERIAL NOT NULL,
    "id_contrato" INTEGER NOT NULL,
    "id_municipio_firma" INTEGER NOT NULL,
    "fecha_firma" DATE NOT NULL,
    "acepta_uso_secundario" BOOLEAN NOT NULL,
    "acepta_uso_llamadas_bienvenida" BOOLEAN NOT NULL,
    "acepta_uso_mercadotecnica" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aviso_privacidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos"."entrevista_perfil_politico" (
    "id" SERIAL NOT NULL,
    "id_contrato" INTEGER NOT NULL,
    "id_municipio_firma" INTEGER NOT NULL,
    "fecha_firma" DATE NOT NULL,
    "datos_completos" BOOLEAN NOT NULL,
    "observaciones_faltantes" TEXT,
    "es_pep" BOOLEAN NOT NULL DEFAULT false,
    "pep_puesto" VARCHAR(200),
    "pep_periodo" VARCHAR(100),
    "familiar_es_pep" BOOLEAN NOT NULL DEFAULT false,
    "familiar_nombre" VARCHAR(100),
    "familiar_apellido_paterno" VARCHAR(100),
    "familiar_apellido_materno" VARCHAR(100),
    "familiar_parentesco" VARCHAR(100),
    "familiar_puesto" VARCHAR(200),
    "familiar_periodo" VARCHAR(100),
    "contrataciones_publicas" BOOLEAN NOT NULL DEFAULT false,
    "asignacion_presupuesto" BOOLEAN NOT NULL DEFAULT false,
    "control_adquisiciones" BOOLEAN NOT NULL DEFAULT false,
    "otorgamiento_subsidios" BOOLEAN NOT NULL DEFAULT false,
    "manejo_info_reservada" BOOLEAN NOT NULL DEFAULT false,
    "info_reservada_puesto" VARCHAR(200),
    "info_reservada_periodo" VARCHAR(100),
    "manejo_finanzas_publicas" BOOLEAN NOT NULL DEFAULT false,
    "finanzas_puesto" VARCHAR(200),
    "finanzas_periodo" VARCHAR(100),
    "manejo_fondos_valores" BOOLEAN NOT NULL DEFAULT false,
    "fondos_puesto" VARCHAR(200),
    "fondos_periodo" VARCHAR(100),
    "otorgamiento_concesiones" BOOLEAN NOT NULL DEFAULT false,
    "concesiones_puesto" VARCHAR(200),
    "concesiones_periodo" VARCHAR(100),
    "auditoria_funciones" BOOLEAN NOT NULL DEFAULT false,
    "auditoria_puesto" VARCHAR(200),
    "auditoria_periodo" VARCHAR(100),
    "poder_decision" BOOLEAN NOT NULL DEFAULT false,
    "decision_puesto" VARCHAR(200),
    "decision_periodo" VARCHAR(100),
    "info_confidencial" BOOLEAN NOT NULL DEFAULT false,
    "info_confidencial_puesto" VARCHAR(200),
    "info_confidencial_periodo" VARCHAR(100),
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entrevista_perfil_politico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos"."origen_recursos" (
    "id" SERIAL NOT NULL,
    "id_contrato" INTEGER NOT NULL,
    "id_municipio_firma" INTEGER NOT NULL,
    "fecha_firma" DATE NOT NULL,
    "proveedor_recursos" VARCHAR(20) NOT NULL,
    "propietario_real" VARCHAR(20) NOT NULL,
    "ingreso_mensual" DECIMAL(10,2) NOT NULL,
    "origen_recursos" VARCHAR(200) NOT NULL,
    "destino_recursos" VARCHAR(200) NOT NULL,
    "pretende_prepagos" BOOLEAN NOT NULL DEFAULT false,
    "numero_prepagos" INTEGER,
    "monto_prepagos" DECIMAL(10,2),
    "instrumento_pago_efectivo" BOOLEAN NOT NULL DEFAULT false,
    "instrumento_pago_cheque" BOOLEAN NOT NULL DEFAULT false,
    "instrumento_pago_transferencia" BOOLEAN NOT NULL DEFAULT false,
    "instrumento_pago_otro" BOOLEAN NOT NULL DEFAULT false,
    "origen_recursos_prepagos" VARCHAR(200),
    "recursos_propios" BOOLEAN NOT NULL DEFAULT false,
    "recursos_tercero" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "origen_recursos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos"."pagare" (
    "id" SERIAL NOT NULL,
    "id_contrato" INTEGER NOT NULL,
    "id_municipio_firma" INTEGER NOT NULL,
    "fecha_firma" DATE NOT NULL,
    "fecha_vencimiento" DATE NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos"."domiciliacion_banco" (
    "id" SERIAL NOT NULL,
    "id_contrato" INTEGER NOT NULL,
    "id_municipio_firma" INTEGER NOT NULL,
    "fecha_firma" DATE NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "domiciliacion_banco_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos"."domiciliacion" (
    "id" SERIAL NOT NULL,
    "id_contrato" INTEGER NOT NULL,
    "id_municipio_firma" INTEGER NOT NULL,
    "fecha_firma" DATE NOT NULL,
    "plazo_indeterminado" BOOLEAN NOT NULL DEFAULT true,
    "fecha_vencimiento" DATE,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "domiciliacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos"."carta_autorizacion_descuento" (
    "id" SERIAL NOT NULL,
    "id_contrato" INTEGER NOT NULL,
    "id_municipio_firma" INTEGER NOT NULL,
    "fecha_firma" DATE NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "carta_autorizacion_descuento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos"."consentimiento_descuento_nomina" (
    "id" SERIAL NOT NULL,
    "id_contrato" INTEGER NOT NULL,
    "id_municipio_firma" INTEGER NOT NULL,
    "fecha_firma" DATE NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consentimiento_descuento_nomina_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rol_descripcion_key" ON "organizacion"."rol"("descripcion");

-- CreateIndex
CREATE UNIQUE INDEX "empresa_rfc_key" ON "organizacion"."empresa"("rfc");

-- CreateIndex
CREATE UNIQUE INDEX "empresa_registro_reca_key" ON "organizacion"."empresa"("registro_reca");

-- CreateIndex
CREATE UNIQUE INDEX "sucursal_nombre_key" ON "organizacion"."sucursal"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_codigo_empleado_key" ON "organizacion"."usuario"("codigo_empleado");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_usuario_key" ON "organizacion"."usuario"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_correo_key" ON "organizacion"."usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "tipo_vivienda_descripcion_key" ON "catalogo"."tipo_vivienda"("descripcion");

-- CreateIndex
CREATE UNIQUE INDEX "pais_nombre_key" ON "catalogo"."pais"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "pais_codigo_iso2_key" ON "catalogo"."pais"("codigo_iso2");

-- CreateIndex
CREATE UNIQUE INDEX "pais_codigo_iso3_key" ON "catalogo"."pais"("codigo_iso3");

-- CreateIndex
CREATE UNIQUE INDEX "entidad_federativa_nombre_key" ON "catalogo"."entidad_federativa"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "entidad_federativa_abreviatura_key" ON "catalogo"."entidad_federativa"("abreviatura");

-- CreateIndex
CREATE UNIQUE INDEX "uq_nombre_entidad" ON "catalogo"."municipio"("nombre", "id_entidad_federativa");

-- CreateIndex
CREATE UNIQUE INDEX "uq_nombre_municipio" ON "catalogo"."colonia"("nombre", "id_municipio");

-- CreateIndex
CREATE UNIQUE INDEX "estado_civil_descripcion_key" ON "catalogo"."estado_civil"("descripcion");

-- CreateIndex
CREATE UNIQUE INDEX "genero_descripcion_key" ON "catalogo"."genero"("descripcion");

-- CreateIndex
CREATE UNIQUE INDEX "banco_nombre_key" ON "catalogo"."banco"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "dependencia_descripcion_key" ON "catalogo"."dependencia"("descripcion");

-- CreateIndex
CREATE UNIQUE INDEX "estado_contrato_descripcion_key" ON "catalogo"."estado_contrato"("descripcion");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_curp_key" ON "cliente"."cliente"("curp");

-- CreateIndex
-- INDEX REMOVED: rfc ya no es unique (H2)

-- CreateIndex
CREATE UNIQUE INDEX "cliente_numero_serie_efirma_key" ON "cliente"."cliente"("numero_serie_efirma");

-- CreateIndex
-- INDEX REMOVED: url_firma_svg ya no es unique (H1)

-- CreateIndex
CREATE UNIQUE INDEX "empleo_cliente_numero_empleado_dependencia_key" ON "cliente"."empleo_cliente"("numero_empleado", "id_dependencia_empleo");

-- CreateIndex
CREATE UNIQUE INDEX "informacion_bancaria_cliente_clabe_key" ON "cliente"."informacion_bancaria_cliente"("clabe");

-- CreateIndex
CREATE UNIQUE INDEX "uq_numero_cuenta" ON "cliente"."informacion_bancaria_cliente"("numero_cuenta", "id_banco");

-- Performance indexes for FK columns (M31)
CREATE INDEX "empleo_cliente_id_cliente_idx" ON "cliente"."empleo_cliente"("id_cliente");
CREATE INDEX "direccion_cliente_id_cliente_idx" ON "cliente"."direccion_cliente"("id_cliente");
CREATE INDEX "referencias_personales_id_cliente_idx" ON "cliente"."referencias_personales"("id_cliente");
CREATE INDEX "informacion_bancaria_cliente_id_cliente_idx" ON "cliente"."informacion_bancaria_cliente"("id_cliente");

-- CreateIndex
CREATE UNIQUE INDEX "uq_monto_producto" ON "credito"."tabla_descuento"("id_producto", "monto_neto_prestar");

-- CreateIndex
CREATE UNIQUE INDEX "contrato_prestamo_folio_key" ON "credito"."contrato_prestamo"("folio");

-- CreateIndex
CREATE UNIQUE INDEX "autorizacion_crediticia_id_contrato_key" ON "documentos"."autorizacion_crediticia"("id_contrato");

-- CreateIndex
CREATE UNIQUE INDEX "aviso_privacidad_id_contrato_key" ON "documentos"."aviso_privacidad"("id_contrato");

-- CreateIndex
CREATE UNIQUE INDEX "entrevista_perfil_politico_id_contrato_key" ON "documentos"."entrevista_perfil_politico"("id_contrato");

-- CreateIndex
CREATE UNIQUE INDEX "origen_recursos_id_contrato_key" ON "documentos"."origen_recursos"("id_contrato");

-- CreateIndex
CREATE UNIQUE INDEX "pagare_id_contrato_key" ON "documentos"."pagare"("id_contrato");

-- CreateIndex
CREATE UNIQUE INDEX "domiciliacion_banco_id_contrato_key" ON "documentos"."domiciliacion_banco"("id_contrato");

-- CreateIndex
CREATE UNIQUE INDEX "domiciliacion_id_contrato_key" ON "documentos"."domiciliacion"("id_contrato");

-- CreateIndex
CREATE UNIQUE INDEX "carta_autorizacion_descuento_id_contrato_key" ON "documentos"."carta_autorizacion_descuento"("id_contrato");

-- CreateIndex
CREATE UNIQUE INDEX "consentimiento_descuento_nomina_id_contrato_key" ON "documentos"."consentimiento_descuento_nomina"("id_contrato");

-- AddForeignKey
ALTER TABLE "organizacion"."sucursal" ADD CONSTRAINT "sucursal_id_empresa_fkey" FOREIGN KEY ("id_empresa") REFERENCES "organizacion"."empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizacion"."usuario" ADD CONSTRAINT "usuario_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "organizacion"."rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizacion"."usuario" ADD CONSTRAINT "usuario_id_sucursal_fkey" FOREIGN KEY ("id_sucursal") REFERENCES "organizacion"."sucursal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizacion"."usuario" ADD CONSTRAINT "usuario_id_administrador_regional_fkey" FOREIGN KEY ("id_administrador_regional") REFERENCES "organizacion"."usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalogo"."municipio" ADD CONSTRAINT "municipio_id_entidad_federativa_fkey" FOREIGN KEY ("id_entidad_federativa") REFERENCES "catalogo"."entidad_federativa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalogo"."colonia" ADD CONSTRAINT "colonia_id_municipio_fkey" FOREIGN KEY ("id_municipio") REFERENCES "catalogo"."municipio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalogo"."dependencia" ADD CONSTRAINT "dependencia_id_entidad_federativa_fkey" FOREIGN KEY ("id_entidad_federativa") REFERENCES "catalogo"."entidad_federativa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente"."cliente" ADD CONSTRAINT "cliente_id_genero_fkey" FOREIGN KEY ("id_genero") REFERENCES "catalogo"."genero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente"."cliente" ADD CONSTRAINT "cliente_id_estado_civil_fkey" FOREIGN KEY ("id_estado_civil") REFERENCES "catalogo"."estado_civil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente"."cliente" ADD CONSTRAINT "cliente_id_estado_nacimiento_fkey" FOREIGN KEY ("id_estado_nacimiento") REFERENCES "catalogo"."entidad_federativa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente"."cliente" ADD CONSTRAINT "cliente_id_pais_nacionalidad_fkey" FOREIGN KEY ("id_pais_nacionalidad") REFERENCES "catalogo"."pais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente"."cliente" ADD CONSTRAINT "cliente_id_tipo_vivienda_fkey" FOREIGN KEY ("id_tipo_vivienda") REFERENCES "catalogo"."tipo_vivienda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente"."empleo_cliente" ADD CONSTRAINT "empleo_cliente_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "cliente"."cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente"."empleo_cliente" ADD CONSTRAINT "empleo_cliente_id_dependencia_empleo_fkey" FOREIGN KEY ("id_dependencia_empleo") REFERENCES "catalogo"."dependencia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente"."direccion_cliente" ADD CONSTRAINT "direccion_cliente_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "cliente"."cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente"."direccion_cliente" ADD CONSTRAINT "direccion_cliente_id_colonia_fkey" FOREIGN KEY ("id_colonia") REFERENCES "catalogo"."colonia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente"."referencias_personales" ADD CONSTRAINT "referencias_personales_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "cliente"."cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente"."informacion_bancaria_cliente" ADD CONSTRAINT "informacion_bancaria_cliente_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "cliente"."cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente"."informacion_bancaria_cliente" ADD CONSTRAINT "informacion_bancaria_cliente_id_banco_fkey" FOREIGN KEY ("id_banco") REFERENCES "catalogo"."banco"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credito"."tabla_descuento" ADD CONSTRAINT "tabla_descuento_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "credito"."producto_credito"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credito"."contrato_prestamo" ADD CONSTRAINT "contrato_prestamo_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "cliente"."cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credito"."contrato_prestamo" ADD CONSTRAINT "contrato_prestamo_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "credito"."producto_credito"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credito"."contrato_prestamo" ADD CONSTRAINT "contrato_prestamo_id_estado_contrato_fkey" FOREIGN KEY ("id_estado_contrato") REFERENCES "catalogo"."estado_contrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credito"."contrato_prestamo" ADD CONSTRAINT "contrato_prestamo_id_tabla_descuento_fkey" FOREIGN KEY ("id_tabla_descuento") REFERENCES "credito"."tabla_descuento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credito"."contrato_prestamo" ADD CONSTRAINT "contrato_prestamo_id_asesor_fkey" FOREIGN KEY ("id_asesor") REFERENCES "organizacion"."usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credito"."historial_credito" ADD CONSTRAINT "historial_credito_id_contrato_fkey" FOREIGN KEY ("id_contrato") REFERENCES "credito"."contrato_prestamo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credito"."historial_credito" ADD CONSTRAINT "historial_credito_id_estado_anterior_fkey" FOREIGN KEY ("id_estado_anterior") REFERENCES "catalogo"."estado_contrato"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credito"."historial_credito" ADD CONSTRAINT "historial_credito_id_estado_nuevo_fkey" FOREIGN KEY ("id_estado_nuevo") REFERENCES "catalogo"."estado_contrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credito"."historial_credito" ADD CONSTRAINT "historial_credito_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "organizacion"."usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos"."autorizacion_crediticia" ADD CONSTRAINT "autorizacion_crediticia_id_contrato_fkey" FOREIGN KEY ("id_contrato") REFERENCES "credito"."contrato_prestamo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos"."autorizacion_crediticia" ADD CONSTRAINT "autorizacion_crediticia_id_municipio_firma_fkey" FOREIGN KEY ("id_municipio_firma") REFERENCES "catalogo"."municipio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos"."aviso_privacidad" ADD CONSTRAINT "aviso_privacidad_id_contrato_fkey" FOREIGN KEY ("id_contrato") REFERENCES "credito"."contrato_prestamo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos"."aviso_privacidad" ADD CONSTRAINT "aviso_privacidad_id_municipio_firma_fkey" FOREIGN KEY ("id_municipio_firma") REFERENCES "catalogo"."municipio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos"."entrevista_perfil_politico" ADD CONSTRAINT "entrevista_perfil_politico_id_contrato_fkey" FOREIGN KEY ("id_contrato") REFERENCES "credito"."contrato_prestamo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos"."entrevista_perfil_politico" ADD CONSTRAINT "entrevista_perfil_politico_id_municipio_firma_fkey" FOREIGN KEY ("id_municipio_firma") REFERENCES "catalogo"."municipio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos"."origen_recursos" ADD CONSTRAINT "origen_recursos_id_contrato_fkey" FOREIGN KEY ("id_contrato") REFERENCES "credito"."contrato_prestamo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos"."origen_recursos" ADD CONSTRAINT "origen_recursos_id_municipio_firma_fkey" FOREIGN KEY ("id_municipio_firma") REFERENCES "catalogo"."municipio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos"."pagare" ADD CONSTRAINT "pagare_id_contrato_fkey" FOREIGN KEY ("id_contrato") REFERENCES "credito"."contrato_prestamo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos"."pagare" ADD CONSTRAINT "pagare_id_municipio_firma_fkey" FOREIGN KEY ("id_municipio_firma") REFERENCES "catalogo"."municipio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos"."domiciliacion_banco" ADD CONSTRAINT "domiciliacion_banco_id_contrato_fkey" FOREIGN KEY ("id_contrato") REFERENCES "credito"."contrato_prestamo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos"."domiciliacion_banco" ADD CONSTRAINT "domiciliacion_banco_id_municipio_firma_fkey" FOREIGN KEY ("id_municipio_firma") REFERENCES "catalogo"."municipio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos"."domiciliacion" ADD CONSTRAINT "domiciliacion_id_contrato_fkey" FOREIGN KEY ("id_contrato") REFERENCES "credito"."contrato_prestamo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos"."domiciliacion" ADD CONSTRAINT "domiciliacion_id_municipio_firma_fkey" FOREIGN KEY ("id_municipio_firma") REFERENCES "catalogo"."municipio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos"."carta_autorizacion_descuento" ADD CONSTRAINT "carta_autorizacion_descuento_id_contrato_fkey" FOREIGN KEY ("id_contrato") REFERENCES "credito"."contrato_prestamo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos"."carta_autorizacion_descuento" ADD CONSTRAINT "carta_autorizacion_descuento_id_municipio_firma_fkey" FOREIGN KEY ("id_municipio_firma") REFERENCES "catalogo"."municipio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos"."consentimiento_descuento_nomina" ADD CONSTRAINT "consentimiento_descuento_nomina_id_contrato_fkey" FOREIGN KEY ("id_contrato") REFERENCES "credito"."contrato_prestamo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos"."consentimiento_descuento_nomina" ADD CONSTRAINT "consentimiento_descuento_nomina_id_municipio_firma_fkey" FOREIGN KEY ("id_municipio_firma") REFERENCES "catalogo"."municipio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropIndex
DROP INDEX "cliente"."direccion_cliente_id_cliente_idx";

-- DropIndex
DROP INDEX "cliente"."empleo_cliente_id_cliente_idx";

-- DropIndex
DROP INDEX "cliente"."informacion_bancaria_cliente_id_cliente_idx";

-- DropIndex
DROP INDEX "cliente"."referencias_personales_id_cliente_idx";

-- CreateTable
CREATE TABLE "credito"."token_firma" (
    "token" VARCHAR(64) NOT NULL,
    "id_contrato" INTEGER NOT NULL,
    "expira" TIMESTAMP NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_firma_pkey" PRIMARY KEY ("token")
);

-- AddForeignKey
ALTER TABLE "credito"."token_firma" ADD CONSTRAINT "token_firma_id_contrato_fkey" FOREIGN KEY ("id_contrato") REFERENCES "credito"."contrato_prestamo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "cliente"."empleo_cliente_numero_empleado_dependencia_key" RENAME TO "empleo_cliente_numero_empleado_id_dependencia_empleo_key";

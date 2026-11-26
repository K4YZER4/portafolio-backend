/*
  Warnings:

  - Added the required column `fecha_firma` to the `contrato_prestamo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_municipio_firma` to the `contrato_prestamo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "credito"."contrato_prestamo" ADD COLUMN     "fecha_firma" DATE NOT NULL,
ADD COLUMN     "id_municipio_firma" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "credito"."contrato_prestamo" ADD CONSTRAINT "contrato_prestamo_id_municipio_firma_fkey" FOREIGN KEY ("id_municipio_firma") REFERENCES "catalogo"."municipio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

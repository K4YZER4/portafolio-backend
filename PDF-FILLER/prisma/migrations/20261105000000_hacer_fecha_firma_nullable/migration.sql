-- La fecha de firma debe poder limpiarse al reabrir un contrato para re-firma.
ALTER TABLE "credito"."contrato_prestamo"
ALTER COLUMN "fecha_firma" DROP NOT NULL;

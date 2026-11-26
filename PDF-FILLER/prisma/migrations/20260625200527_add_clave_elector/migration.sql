-- AlterTable
ALTER TABLE "cliente"."cliente" ADD COLUMN     "clave_elector" VARCHAR(18);

-- AlterTable
ALTER TABLE "credito"."token_firma" ALTER COLUMN "expira" DROP NOT NULL;

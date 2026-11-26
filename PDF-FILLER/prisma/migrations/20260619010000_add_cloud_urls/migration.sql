-- AlterTable: Add cloud storage URL columns to contrato_prestamo
ALTER TABLE "credito"."contrato_prestamo"
  ADD COLUMN "url_pdf_cloud" VARCHAR(500),
  ADD COLUMN "url_firma_cloud" VARCHAR(500),
  ADD COLUMN "url_pdf_firmado_cloud" VARCHAR(500);

-- Trigger: Validate cloud URLs when estado changes from 'POR FIRMAR'
CREATE OR REPLACE FUNCTION credito.fn_validar_urls_firma()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
  v_estado_por_firmar INT;
BEGIN
  SELECT id INTO v_estado_por_firmar
  FROM catalogo.estado_contrato
  WHERE descripcion = 'POR FIRMAR';

  IF NEW.id_estado_contrato IS DISTINCT FROM v_estado_por_firmar THEN
    IF NEW.url_firma_cloud IS NULL THEN
      RAISE EXCEPTION 'url_firma_cloud es requerido cuando el estado no es POR FIRMAR';
    END IF;
    IF NEW.url_pdf_cloud IS NULL THEN
      RAISE EXCEPTION 'url_pdf_cloud es requerido cuando el estado no es POR FIRMAR';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validar_urls_firma ON credito.contrato_prestamo;

CREATE TRIGGER trg_validar_urls_firma
  BEFORE UPDATE ON credito.contrato_prestamo
  FOR EACH ROW
  EXECUTE FUNCTION credito.fn_validar_urls_firma();

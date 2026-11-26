CREATE SEQUENCE IF NOT EXISTS "credito"."contrato_folio_seq";

DO $$
DECLARE
  ultimo_numero BIGINT;
BEGIN
  SELECT MAX((regexp_match(folio, '[0-9]+$'))[1]::BIGINT)
    INTO ultimo_numero
    FROM "credito"."contrato_prestamo";

  IF ultimo_numero IS NULL THEN
    PERFORM setval('credito.contrato_folio_seq', 1, false);
  ELSE
    PERFORM setval('credito.contrato_folio_seq', ultimo_numero, true);
  END IF;
END $$;

-- TRIGGER: trg_expiracion_token_firma
-- Propósito:
--   Al insertar un token de firma, establece automáticamente
--   la fecha de expiración a 12 horas después de la creación.
--   Garantiza que ningún token se quede sin expiración,
--   sin importar cómo se inserte (Prisma, SQL directo, etc.).

CREATE OR REPLACE FUNCTION credito.fn_expiracion_token_firma()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  NEW.expira = NEW.created_at + INTERVAL '12 hours';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_expiracion_token_firma ON credito.token_firma;

CREATE TRIGGER trg_expiracion_token_firma
  BEFORE INSERT ON credito.token_firma
  FOR EACH ROW
  EXECUTE FUNCTION credito.fn_expiracion_token_firma();
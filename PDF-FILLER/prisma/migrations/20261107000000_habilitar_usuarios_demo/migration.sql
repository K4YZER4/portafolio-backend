UPDATE organizacion.usuario
SET hash_password = '$2b$10$QCIpimOsTDHDAPfSZ515IuOoCCwQpqrL4tq/Pm8OiwdvCohtrwytK'
WHERE hash_password LIKE '$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

INSERT INTO organizacion.usuario
  (id_rol, codigo_empleado, nombre, apellido_paterno, apellido_materno, usuario, correo, hash_password, updated_at)
SELECT r.id, 'ADM001', 'ADMIN', 'DEMO', '', 'admin', 'admin@test.com',
       '$2b$10$QCIpimOsTDHDAPfSZ515IuOoCCwQpqrL4tq/Pm8OiwdvCohtrwytK', NOW()
FROM organizacion.rol r
WHERE r.descripcion = 'ADMIN'
  AND NOT EXISTS (SELECT 1 FROM organizacion.usuario u WHERE u.codigo_empleado = 'ADM001');

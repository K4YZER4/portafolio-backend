INSERT INTO organizacion.rol (descripcion)
VALUES ('MESA DE CONTROL')
ON CONFLICT (descripcion) DO NOTHING;

INSERT INTO catalogo.estado_contrato (descripcion)
VALUES ('APROBADO'), ('RECHAZADO')
ON CONFLICT (descripcion) DO NOTHING;

INSERT INTO organizacion.usuario
  (id_rol, codigo_empleado, nombre, apellido_paterno, apellido_materno, usuario, correo, hash_password, updated_at)
SELECT r.id, 'MESA01', 'MESA', 'CONTROL', '', 'mesa', 'mesa@test.com',
       '$2b$10$QCIpimOsTDHDAPfSZ515IuOoCCwQpqrL4tq/Pm8OiwdvCohtrwytK', NOW()
FROM organizacion.rol r
WHERE r.descripcion = 'MESA DE CONTROL'
  AND NOT EXISTS (SELECT 1 FROM organizacion.usuario u WHERE u.codigo_empleado = 'MESA01');

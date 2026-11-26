import prisma from "../src/prisma/prisma";

async function rowExists(sql: string, params: any[] = []): Promise<boolean> {
  const rows: any[] = await prisma.$queryRawUnsafe(sql, ...params);
  return rows.length > 0;
}

async function main() {
  console.log("🌱 Iniciando seed global...\n");

  // ── Genero ──────────────────────────────────────
  console.log("⌛ Insertando Genero...");
  const generos = ["FEMENINO", "MASCULINO"];
  for (const descripcion of generos) {
    const exists = await rowExists(
      `SELECT 1 FROM catalogo.genero WHERE descripcion = $1`,
      [descripcion]
    );
    if (!exists) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO catalogo.genero (descripcion) VALUES ($1)`,
        descripcion
      );
    }
  }

  // ── EstadoCivil ──────────────────────────────────
  console.log("⌛ Insertando EstadoCivil...");
  const estadosCiviles = [
    "SOLTERO",
    "CASADO",
    "UNION LIBRE",
    "DIVORCIADO",
    "VIUDO",
    "OTRO",
  ];
  for (const descripcion of estadosCiviles) {
    const exists = await rowExists(
      `SELECT 1 FROM catalogo.estado_civil WHERE descripcion = $1`,
      [descripcion]
    );
    if (!exists) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO catalogo.estado_civil (descripcion) VALUES ($1)`,
        descripcion
      );
    }
  }

  // ── TipoVivienda ─────────────────────────────────
  console.log("⌛ Insertando TipoVivienda...");
  const tiposVivienda = ["PROPIA", "RENTADA", "FAMILIAR"];
  for (const descripcion of tiposVivienda) {
    const exists = await rowExists(
      `SELECT 1 FROM catalogo.tipo_vivienda WHERE descripcion = $1`,
      [descripcion]
    );
    if (!exists) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO catalogo.tipo_vivienda (descripcion) VALUES ($1)`,
        descripcion
      );
    }
  }

  // ── Pais ─────────────────────────────────────────
  console.log("⌛ Insertando Pais...");
  const paisExists = await rowExists(
    `SELECT 1 FROM catalogo.pais WHERE codigo_iso3 = 'MEX'`
  );
  if (!paisExists) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO catalogo.pais (nombre, codigo_iso2, codigo_iso3, gentilicio)
       VALUES ('MÉXICO', 'MX', 'MEX', 'MEXICANA')`
    );
  }

  // ── EntidadFederativa ────────────────────────────
  console.log("⌛ Insertando EntidadFederativa (32 estados)...");
  const estados = [
    { id: "01", nombre: "AGUASCALIENTES", abreviatura: "AGS" },
    { id: "02", nombre: "BAJA CALIFORNIA", abreviatura: "BCN" },
    { id: "03", nombre: "BAJA CALIFORNIA SUR", abreviatura: "BCS" },
    { id: "04", nombre: "CAMPECHE", abreviatura: "CAM" },
    { id: "05", nombre: "COAHUILA", abreviatura: "COA" },
    { id: "06", nombre: "COLIMA", abreviatura: "COL" },
    { id: "07", nombre: "CHIAPAS", abreviatura: "CHP" },
    { id: "08", nombre: "CHIHUAHUA", abreviatura: "CHH" },
    { id: "09", nombre: "CIUDAD DE MÉXICO", abreviatura: "CDX" },
    { id: "10", nombre: "DURANGO", abreviatura: "DUR" },
    { id: "11", nombre: "GUANAJUATO", abreviatura: "GTO" },
    { id: "12", nombre: "GUERRERO", abreviatura: "GRO" },
    { id: "13", nombre: "HIDALGO", abreviatura: "HGO" },
    { id: "14", nombre: "JALISCO", abreviatura: "JAL" },
    { id: "15", nombre: "MÉXICO", abreviatura: "MEX" },
    { id: "16", nombre: "MICHOACÁN", abreviatura: "MIC" },
    { id: "17", nombre: "MORELOS", abreviatura: "MOR" },
    { id: "18", nombre: "NAYARIT", abreviatura: "NAY" },
    { id: "19", nombre: "NUEVO LEÓN", abreviatura: "NLE" },
    { id: "20", nombre: "OAXACA", abreviatura: "OAX" },
    { id: "21", nombre: "PUEBLA", abreviatura: "PUE" },
    { id: "22", nombre: "QUERÉTARO", abreviatura: "QRO" },
    { id: "23", nombre: "QUINTANA ROO", abreviatura: "ROO" },
    { id: "24", nombre: "SAN LUIS POTOSÍ", abreviatura: "SLP" },
    { id: "25", nombre: "SINALOA", abreviatura: "SIN" },
    { id: "26", nombre: "SONORA", abreviatura: "SON" },
    { id: "27", nombre: "TABASCO", abreviatura: "TAB" },
    { id: "28", nombre: "TAMAULIPAS", abreviatura: "TAM" },
    { id: "29", nombre: "TLAXCALA", abreviatura: "TLA" },
    { id: "30", nombre: "VERACRUZ", abreviatura: "VER" },
    { id: "31", nombre: "YUCATÁN", abreviatura: "YUC" },
    { id: "32", nombre: "ZACATECAS", abreviatura: "ZAC" },
  ];
  for (const e of estados) {
    const exists = await rowExists(
      `SELECT 1 FROM catalogo.entidad_federativa WHERE id = $1`,
      [e.id]
    );
    if (!exists) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO catalogo.entidad_federativa (id, nombre, abreviatura) VALUES ($1, $2, $3)`,
        e.id, e.nombre, e.abreviatura
      );
    }
  }

  // ── EstadoContrato ───────────────────────────────
  console.log("⌛ Insertando EstadoContrato...");
  const estadosContrato = ["POR FIRMAR", "POR APROBAR", "APROBADO", "RECHAZADO", "ACTIVO", "LIQUIDADO", "CANCELADO", "VENCIDO"];
  for (const descripcion of estadosContrato) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO catalogo.estado_contrato (descripcion) VALUES ($1) ON CONFLICT (descripcion) DO NOTHING`,
      descripcion
    );
  }

  // ── Rol ─────────────────────────────────────────
  console.log("⌛ Insertando Rol...");
  const roles = ["ADMIN", "ASESOR", "SUPERVISOR", "MESA DE CONTROL"];
  for (const descripcion of roles) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO organizacion.rol (descripcion) VALUES ($1) ON CONFLICT (descripcion) DO NOTHING`,
      descripcion
    );
  }

  // ── Empresa ──────────────────────────────────────
  console.log("⌛ Insertando Empresa de prueba...");
  await prisma.$executeRawUnsafe(`
    INSERT INTO organizacion.empresa (nombre_comercial, razon_social, rfc, registro_reca, domicilio_fiscal, pagina_internet, telefono, email)
    SELECT 'CRÉDITO EXPRESS', 'CRÉDITO EXPRESS S.A. DE C.V.', 'CEX991231ABC', 'RECA001', 'GUASAVE, SINALOA', 'https://creditoexpress.mx', '6871234567', 'contacto@creditoexpress.mx'
    WHERE NOT EXISTS (SELECT 1 FROM organizacion.empresa WHERE rfc = 'CEX991231ABC')
  `);

  // ── Usuario de Mesa de Control de prueba ────────────
  const DEMO_PASSWORD_HASH = "$2b$10$udwMP1GqBTib2CaHyXTt9enUiLJ0UzHubXX2okvu7xgc34IeRfEjm"; // Demo1234!

  await prisma.$executeRawUnsafe(`
    INSERT INTO organizacion.usuario
      (id_rol, codigo_empleado, nombre, apellido_paterno, apellido_materno, usuario, correo, hash_password, updated_at)
    SELECT r.id, 'MESA01', 'MESA', 'CONTROL', '', 'mesa', 'mesa@test.com',
           $1, NOW()
    FROM organizacion.rol r
    WHERE r.descripcion = 'MESA DE CONTROL'
      AND NOT EXISTS (SELECT 1 FROM organizacion.usuario u WHERE u.codigo_empleado = 'MESA01')
  `, DEMO_PASSWORD_HASH);

  // ── Sucursal ─────────────────────────────────────
  console.log("⌛ Insertando Sucursales de prueba...");
  const sucursales = ["GUASAVE SINALOA", "CULIACÁN SINALOA"];
  for (const nombre of sucursales) {
    const exists = await rowExists(
      `SELECT 1 FROM organizacion.sucursal WHERE nombre = $1`,
      [nombre]
    );
    if (!exists) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO organizacion.sucursal (id_empresa, nombre)
         SELECT e.id, $1 FROM organizacion.empresa e WHERE e.rfc = 'CEX991231ABC'`,
        nombre
      );
    }
  }

  // ── Usuario de prueba ASE001 ──────────────────────
  console.log("⌛ Insertando Usuario de prueba ASE001...");
  await prisma.$executeRawUnsafe(`
    INSERT INTO organizacion.usuario
      (id_rol, codigo_empleado, nombre, apellido_paterno, apellido_materno, usuario, correo, hash_password, updated_at)
    SELECT r.id, 'ASE001', 'ASESOR', 'PRUEBA', '', 'asesor1', 'asesor@test.com',
           $1, NOW()
    FROM organizacion.rol r
    WHERE r.descripcion = 'ASESOR'
      AND NOT EXISTS (SELECT 1 FROM organizacion.usuario u WHERE u.codigo_empleado = 'ASE001')
  `, DEMO_PASSWORD_HASH);

  // ── Usuarios adicionales con sucursal ─────────────
  console.log("⌛ Insertando Usuarios adicionales con sucursal...");
  const nuevosUsuarios = [
    { codigo: "ASE002", nombre: "JUAN", paterno: "PÉREZ",      materno: "LÓPEZ",   usuario: "juanp",   correo: "juan@test.com",       sucursal: "GUASAVE SINALOA" },
    { codigo: "ASE003", nombre: "MARÍA", paterno: "LÓPEZ",     materno: "GARCÍA",  usuario: "marial",  correo: "maria@test.com",      sucursal: "CULIACÁN SINALOA" },
    { codigo: "ASE004", nombre: "CARLOS", paterno: "GARCÍA",   materno: "RODRÍGUEZ", usuario: "carlosg", correo: "carlos@test.com", sucursal: "GUASAVE SINALOA" },
  ];
  for (const u of nuevosUsuarios) {
    const exists = await rowExists(
      `SELECT 1 FROM organizacion.usuario WHERE codigo_empleado = $1`,
      [u.codigo]
    );
    if (!exists) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO organizacion.usuario
           (id_rol, id_sucursal, codigo_empleado, nombre, apellido_paterno, apellido_materno, usuario, correo, hash_password, updated_at)
         SELECT r.id, s.id, $1, $2, $3, $4, $5, $6,
                 $7, NOW()
         FROM organizacion.rol r, organizacion.sucursal s
         WHERE r.descripcion = 'ASESOR'
           AND s.nombre = $8`,
        u.codigo, u.nombre, u.paterno, u.materno, u.usuario, u.correo, DEMO_PASSWORD_HASH, u.sucursal
      );
    }
  }

  // ── Usuario administrador de prueba ─────────────────
  await prisma.$executeRawUnsafe(`
    INSERT INTO organizacion.usuario
      (id_rol, codigo_empleado, nombre, apellido_paterno, apellido_materno, usuario, correo, hash_password, updated_at)
    SELECT r.id, 'ADM001', 'ADMIN', 'DEMO', '', 'admin', 'admin@test.com',
           $1, NOW()
    FROM organizacion.rol r
    WHERE r.descripcion = 'ADMIN'
      AND NOT EXISTS (SELECT 1 FROM organizacion.usuario u WHERE u.codigo_empleado = 'ADM001')
  `, DEMO_PASSWORD_HASH);

  // Asegurar contraseña Demo1234! en todos los usuarios de prueba
  await prisma.$executeRawUnsafe(`
    UPDATE organizacion.usuario
    SET hash_password = $1
    WHERE usuario IN ('admin', 'mesa', 'asesor1', 'juanp', 'marial', 'carlosg')
  `, DEMO_PASSWORD_HASH);

  console.log("\n✅ Seed global completado exitosamente.");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

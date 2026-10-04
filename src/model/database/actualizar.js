// Pone al día una base creada con una versión anterior del proyecto,
// sin borrar datos: crea las tablas nuevas y agrega las columnas que
// falten (lo mismo que hacen los archivos de database/migraciones).
// Se ejecuta solo al arrancar la app.
const db = require("./models");

const { DataTypes } = db.Sequelize;

const COLUMNAS = {
  pedidos: {
    pago_estado: {
      type: DataTypes.ENUM("pendiente", "aprobado", "rechazado", "reembolsado"),
      allowNull: false,
      defaultValue: "pendiente",
      despues: async (qi) =>
        qi.sequelize.query(
          "UPDATE pedidos SET pago_estado = 'aprobado', pagado_en = creado_en WHERE estado IN ('pagado', 'enviado', 'entregado')"
        ),
    },
    pago_id: { type: DataTypes.STRING(40) },
    pago_detalle: { type: DataTypes.STRING(120) },
    pagado_en: { type: DataTypes.DATE },
  },
  usuarios: {
    dni: { type: DataTypes.STRING(8) },
    calle: { type: DataTypes.STRING(90) },
    altura: { type: DataTypes.STRING(10) },
    piso: { type: DataTypes.STRING(20) },
    codigo_postal: { type: DataTypes.CHAR(4) },
    ciudad: { type: DataTypes.STRING(80) },
    provincia: { type: DataTypes.STRING(60) },
  },
};

module.exports = async function actualizarBase() {
  const qi = db.sequelize.getQueryInterface();

  // Tablas nuevas
  await db.ContenidoInicio.sync();
  const tablas = (await qi.showAllTables()).map((t) => (typeof t === "string" ? t : t.tableName));
  if (!tablas.includes("producto_colores")) {
    await qi.sequelize.query(`
      CREATE TABLE producto_colores (
        producto_id  INT UNSIGNED      NOT NULL,
        color_id     SMALLINT UNSIGNED NOT NULL,
        orden        SMALLINT UNSIGNED NOT NULL DEFAULT 0,
        PRIMARY KEY (producto_id, color_id),
        KEY idx_producto_colores_color (color_id),
        CONSTRAINT fk_pcolores_producto FOREIGN KEY (producto_id) REFERENCES productos (id)
          ON UPDATE CASCADE ON DELETE CASCADE,
        CONSTRAINT fk_pcolores_color FOREIGN KEY (color_id) REFERENCES colores (id)
          ON UPDATE CASCADE ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    // Cada producto arranca con el color que ya tenía
    await qi.sequelize.query("INSERT IGNORE INTO producto_colores (producto_id, color_id, orden) SELECT id, color_id, 0 FROM productos");
    console.log("   + tabla producto_colores (varios colores por producto)");
  }

  // Columnas nuevas (pagado_en se agrega antes de usarla en el UPDATE)
  const pendientes = [];
  for (const [tabla, columnas] of Object.entries(COLUMNAS)) {
    const existentes = await qi.describeTable(tabla);
    for (const [columna, { despues, ...definicion }] of Object.entries(columnas)) {
      if (existentes[columna]) continue;
      await qi.addColumn(tabla, columna, definicion);
      console.log(`   + columna ${tabla}.${columna}`);
      if (despues) pendientes.push(despues);
    }
  }
  for (const tarea of pendientes) await tarea(qi);

  // Rol superadmin (bases anteriores solo tenían cliente y admin)
  const { rol } = await qi.describeTable("usuarios");
  if (rol && !/superadmin/i.test(rol.type)) {
    await qi.sequelize.query(
      "ALTER TABLE usuarios MODIFY rol ENUM('cliente', 'admin', 'superadmin') NOT NULL DEFAULT 'cliente'"
    );
    console.log("   + rol superadmin en usuarios");
  }
};

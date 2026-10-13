// Pone al día una base creada con una versión anterior del proyecto,
// sin borrar datos: crea las tablas nuevas y agrega las columnas que
// falten (lo mismo que hacen los archivos de database/migraciones).
// Se ejecuta solo al arrancar la app.
const db = require("./models");
const slug = require("../../helpers/slug");

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

  // Categorías con slug (URLs /categoria/mates) y subcategorías
  const columnasCategoria = await qi.describeTable("categorias");
  if (!columnasCategoria.slug) {
    await qi.addColumn("categorias", "slug", { type: DataTypes.STRING(60), allowNull: true });
    const [filas] = await qi.sequelize.query("SELECT id, nombre FROM categorias");
    const usados = new Set();
    for (const f of filas) {
      let s = slug(f.nombre) || `categoria-${f.id}`;
      while (usados.has(s)) s = `${s}-${f.id}`;
      usados.add(s);
      await qi.sequelize.query("UPDATE categorias SET slug = ? WHERE id = ?", { replacements: [s, f.id] });
    }
    await qi.sequelize.query("ALTER TABLE categorias MODIFY slug VARCHAR(60) NOT NULL, ADD UNIQUE KEY uq_categorias_slug (slug)");
    console.log("   + columna categorias.slug");
  }
  if (!tablas.includes("subcategorias")) {
    await qi.sequelize.query(`
      CREATE TABLE subcategorias (
        id            SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
        categoria_id  SMALLINT UNSIGNED NOT NULL,
        nombre        VARCHAR(40)       NOT NULL,
        slug          VARCHAR(40)       NOT NULL,
        orden         SMALLINT UNSIGNED NOT NULL DEFAULT 0,
        PRIMARY KEY (id),
        UNIQUE KEY uq_subcategorias_slug (categoria_id, slug),
        CONSTRAINT fk_subcategorias_categoria FOREIGN KEY (categoria_id) REFERENCES categorias (id)
          ON UPDATE CASCADE ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    console.log("   + tabla subcategorias");
  }
  const columnasProducto = await qi.describeTable("productos");
  if (!columnasProducto.subcategoria_id) {
    await qi.sequelize.query(`
      ALTER TABLE productos
        ADD COLUMN subcategoria_id SMALLINT UNSIGNED NULL AFTER categoria_id,
        ADD KEY idx_productos_subcategoria (subcategoria_id),
        ADD CONSTRAINT fk_productos_subcategoria FOREIGN KEY (subcategoria_id) REFERENCES subcategorias (id)
          ON UPDATE CASCADE ON DELETE SET NULL`);
    console.log("   + columna productos.subcategoria_id");
  }

  // Botón de arrepentimiento
  if (!tablas.includes("arrepentimientos")) {
    await qi.sequelize.query(`CREATE TABLE IF NOT EXISTS arrepentimientos (
  id             INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  codigo         VARCHAR(20)   NOT NULL COMMENT 'código que recibe el cliente, ej: ARR-7K2Q9M',
  usuario_id     INT UNSIGNED  NULL,
  pedido_id      INT UNSIGNED  NULL COMMENT 'el pedido, si el número y el email coinciden',
  numero_pedido  VARCHAR(20)   NOT NULL COMMENT 'el número que escribió el cliente',
  nombre         VARCHAR(90)   NOT NULL,
  email          VARCHAR(120)  NOT NULL,
  telefono       VARCHAR(20)   NULL,
  motivo         VARCHAR(500)  NULL,
  estado         ENUM('recibida', 'resuelta') NOT NULL DEFAULT 'recibida',
  resuelta_en    DATETIME      NULL,
  creado_en      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_arrepentimientos_codigo (codigo),
  KEY idx_arrepentimientos_estado (estado, creado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    console.log("   + tabla arrepentimientos");
  }

  // Rol superadmin (bases anteriores solo tenían cliente y admin)
  const { rol } = await qi.describeTable("usuarios");
  if (rol && !/superadmin/i.test(rol.type)) {
    await qi.sequelize.query(
      "ALTER TABLE usuarios MODIFY rol ENUM('cliente', 'admin', 'superadmin') NOT NULL DEFAULT 'cliente'"
    );
    console.log("   + rol superadmin en usuarios");
  }
};

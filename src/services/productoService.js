// Productos, categorías y colores (tablas productos, especificaciones,
// categorias, colores). Devuelve objetos planos con la misma forma que
// usan las vistas: p.categoria = "Línea Madera", p.color = "madera", etc.

const { Op } = require("sequelize");
const db = require("../model/database/models");

const STOCK_BAJO = 5;

// Valores por defecto para productos cargados sin ficha completa
const POR_DEFECTO = {
  imagenes: 6,
  cuotas: 6,
  resumen: "Pieza hecha a mano, con materiales seleccionados y terminaciones cuidadas al detalle.",
  descripcion: ["Acá va la descripción principal del producto: qué es, para quién está pensado y qué lo hace especial."],
  destacados: ["Producto 100% artesanal"],
};

const incluir = [
  { association: "categoria", attributes: ["id", "nombre"] },
  { association: "color", attributes: ["id", "valor", "nombre", "hex"] },
];

function plano(p) {
  if (!p) return null;
  const x = p.get({ plain: true });
  const parrafos = (texto) => (texto ? texto.split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean) : null);
  const lineas = (texto) => (texto ? texto.split("\n").map((t) => t.trim()).filter(Boolean) : null);

  return {
    id: x.id,
    nombre: x.nombre,
    categoriaId: x.categoriaId,
    categoria: x.categoria?.nombre || "",
    colorId: x.colorId,
    color: x.color?.valor || "",
    colorInfo: x.color || null,
    precio: x.precio,
    costo: x.costo,
    stock: x.stock,
    etiqueta: x.etiqueta,
    imagen: x.imagen,
    imagenes: POR_DEFECTO.imagenes,
    cuotas: POR_DEFECTO.cuotas,
    resumen: x.resumen || POR_DEFECTO.resumen,
    descripcion: parrafos(x.descripcion) || POR_DEFECTO.descripcion,
    destacados: lineas(x.destacados) || POR_DEFECTO.destacados,
    especificaciones: (x.especificaciones || []).sort((a, b) => a.orden - b.orden).map((e) => [e.clave, e.valor]),
  };
}

// ── Consultas ───────────────────────────────────────────────
async function listar({ q = "", categoria = "", stock = "", orden = "" } = {}) {
  const where = {};
  const texto = q.trim();
  if (texto) {
    where[Op.or] = [{ nombre: { [Op.like]: `%${texto}%` } }, ...(/^\d+$/.test(texto) ? [{ id: Number(texto) }] : [])];
  }
  if (stock === "sin") where.stock = 0;
  if (stock === "bajo") where.stock = { [Op.between]: [1, STOCK_BAJO] };

  const ordenes = {
    nombre: [["nombre", "ASC"]],
    "precio-desc": [["precio", "DESC"]],
    "stock-asc": [["stock", "ASC"]],
    "margen-desc": [[db.sequelize.literal("(precio - costo) / precio"), "DESC"]],
  };

  const filas = await db.Producto.findAll({
    where,
    include: [
      { ...incluir[0], ...(categoria ? { where: { nombre: categoria } } : {}) },
      incluir[1],
    ],
    order: ordenes[orden] || [["id", "ASC"]],
  });
  return filas.map(plano);
}

async function obtener(id) {
  const p = await db.Producto.findByPk(id, { include: [...incluir, { association: "especificaciones" }] });
  return plano(p);
}

async function porIds(ids) {
  if (!ids.length) return [];
  const filas = await db.Producto.findAll({ where: { id: ids }, include: incluir });
  const mapa = new Map(filas.map((p) => [p.id, plano(p)]));
  return ids.map((id) => mapa.get(Number(id))).filter(Boolean);
}

async function relacionados(id, cantidad = 4) {
  const actual = await db.Producto.findByPk(id);
  if (!actual) return [];
  const filas = await db.Producto.findAll({
    where: { id: { [Op.ne]: actual.id } },
    include: incluir,
    // Primero los de la misma categoría
    order: [[db.sequelize.literal(`categoria_id = ${Number(actual.categoriaId)}`), "DESC"], ["id", "ASC"]],
    limit: cantidad,
  });
  return filas.map(plano);
}

async function categorias() {
  const filas = await db.Categoria.findAll({ order: [["orden", "ASC"]] });
  return filas.map((c) => c.nombre);
}

async function colores() {
  const filas = await db.Color.findAll({ order: [["orden", "ASC"]], raw: true });
  return filas.map(({ valor, nombre, hex }) => ({ valor, nombre, hex }));
}

async function resumenStock() {
  const [fila] = await db.sequelize.query(
    `SELECT COALESCE(SUM(stock), 0) AS unidades,
            COALESCE(SUM(stock * costo), 0) AS valorCosto,
            COALESCE(SUM(stock * precio), 0) AS valorVenta
       FROM productos`,
    { type: db.Sequelize.QueryTypes.SELECT }
  );
  const alertas = await db.Producto.findAll({
    where: { stock: { [Op.lte]: STOCK_BAJO } },
    include: incluir,
    order: [["stock", "ASC"]],
  });
  const lista = alertas.map(plano);
  return {
    unidades: Number(fila.unidades),
    valorCosto: Number(fila.valorCosto),
    valorVenta: Number(fila.valorVenta),
    sinStock: lista.filter((p) => p.stock === 0),
    bajo: lista.filter((p) => p.stock > 0),
  };
}

async function total() {
  return db.Producto.count();
}

// ── ABM (panel admin) ───────────────────────────────────────
// datos.categoria es el nombre y datos.color el valor ("negro"), como en el formulario
async function datosParaGuardar(datos) {
  const [categoria, color] = await Promise.all([
    db.Categoria.findOne({ where: { nombre: datos.categoria } }),
    db.Color.findOne({ where: { valor: datos.color } }),
  ]);
  return {
    nombre: String(datos.nombre).trim(),
    categoriaId: categoria.id,
    colorId: color.id,
    precio: Number(datos.precio),
    costo: Number(datos.costo),
    stock: Math.max(0, parseInt(datos.stock, 10) || 0),
    etiqueta: String(datos.etiqueta || "").trim() || null,
  };
}

async function crear(datos) {
  const producto = await db.Producto.create({ ...(await datosParaGuardar(datos)), imagen: datos.imagen || null });
  return obtener(producto.id);
}

async function actualizar(id, datos) {
  const producto = await db.Producto.findByPk(id);
  if (!producto) return null;
  const cambios = await datosParaGuardar(datos);
  if (datos.imagen) cambios.imagen = datos.imagen;
  else if (datos.quitarImagen) cambios.imagen = null;
  await producto.update(cambios);
  return obtener(id);
}

async function eliminar(id) {
  const producto = await obtener(id);
  if (!producto) return null;
  await db.Producto.destroy({ where: { id } });
  return producto;
}

// cambio: suma/resta; valor: fija el número exacto. Nunca queda negativo.
async function ajustarStock(id, { cambio, valor }) {
  const producto = await db.Producto.findByPk(id);
  if (!producto) return null;
  const nuevo = valor !== undefined ? valor : producto.stock + cambio;
  await producto.update({ stock: Math.max(0, nuevo) });
  return producto.stock;
}

module.exports = {
  STOCK_BAJO,
  listar,
  obtener,
  porIds,
  relacionados,
  categorias,
  colores,
  resumenStock,
  total,
  crear,
  actualizar,
  eliminar,
  ajustarStock,
};

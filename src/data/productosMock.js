// Datos de ejemplo para la maqueta del catálogo, guardados en memoria
// (los cambios del panel admin se pierden al reiniciar el servidor).
// Reemplazar por la consulta real a la base de datos cuando esté lista.
// costo = lo que le cuesta a la tienda cada unidad (para calcular la ganancia)

const productos = [
  { id: 1, nombre: "Producto Clásico Edición Cuero", categoria: "Línea Clásica", precio: 25000, color: "negro", etiqueta: "Nuevo", costo: 12500, stock: 34, imagen: null },
  { id: 2, nombre: "Producto Madera Boca Ancha con Detalle Metálico", categoria: "Línea Madera", precio: 29500, color: "madera", etiqueta: null, costo: 14000, stock: 18, imagen: null },
  { id: 3, nombre: "Producto Personalizado con Caja de Regalo", categoria: "Personalizados", precio: 38500, color: "negro", etiqueta: "Más vendido", costo: 19000, stock: 9, imagen: null },
  { id: 4, nombre: "Producto Personalizado Grabado a Láser", categoria: "Personalizados", precio: 38990, color: "blanco", etiqueta: null, costo: 20500, stock: 22, imagen: null },
  { id: 5, nombre: "Producto Artesanal Terminación Mate", categoria: "Línea Clásica", precio: 21000, color: "crudo", etiqueta: null, costo: 9800, stock: 41, imagen: null },
  { id: 6, nombre: "Producto Acero Inoxidable Térmico", categoria: "Línea Acero", precio: 42000, color: "gris", etiqueta: "Nuevo", costo: 23500, stock: 3, imagen: null },
  { id: 7, nombre: "Producto Imperial Base Reforzada", categoria: "Línea Premium", precio: 55000, color: "negro", etiqueta: "Exclusivo", costo: 30000, stock: 6, imagen: null },
  { id: 8, nombre: "Combo Regalo Completo con Accesorios", categoria: "Combos", precio: 64900, color: "blanco", etiqueta: null, costo: 36000, stock: 12, imagen: null },
  { id: 9, nombre: "Producto Cerámica Esmaltada", categoria: "Línea Cerámica", precio: 18500, color: "blanco", etiqueta: null, costo: 8200, stock: 0, imagen: null },
  { id: 10, nombre: "Producto Madera Torneada a Mano", categoria: "Línea Madera", precio: 27300, color: "madera", etiqueta: null, costo: 13100, stock: 27, imagen: null },
  { id: 11, nombre: "Producto Forrado en Cuero Crudo", categoria: "Línea Clásica", precio: 31200, color: "crudo", etiqueta: "Últimas unidades", costo: 16500, stock: 2, imagen: null },
  { id: 12, nombre: "Set Empresarial Personalizado x10", categoria: "Personalizados", precio: 289000, color: "gris", etiqueta: null, costo: 165000, stock: 5, imagen: null },
];

const colores = [
  { valor: "negro", nombre: "Negro", hex: "#111111" },
  { valor: "blanco", nombre: "Blanco", hex: "#ffffff" },
  { valor: "gris", nombre: "Gris", hex: "#8a8a8a" },
  { valor: "madera", nombre: "Madera", hex: "#5c5c5c" },
  { valor: "crudo", nombre: "Crudo", hex: "#d6d6d6" },
];

const categorias = [
  "Línea Clásica",
  "Línea Madera",
  "Línea Acero",
  "Línea Premium",
  "Línea Cerámica",
  "Personalizados",
  "Combos",
];

// Datos genéricos para la vista de detalle. Cada producto puede
// sobrescribir cualquiera de estos campos.
const detalleBase = {
  imagenes: 6,
  cuotas: 6,
  resumen:
    "Pieza hecha a mano, con materiales seleccionados y terminaciones cuidadas al detalle. Ninguna es igual a otra.",
  descripcion: [
    "Acá va la descripción principal del producto: qué es, para quién está pensado y qué lo hace especial. Dos o tres líneas alcanzan para contar la historia.",
    "Cada pieza pasa por un proceso artesanal de selección, curado y terminación. Por eso pueden existir pequeñas diferencias de veta, tono o forma entre unidades.",
  ],
  destacados: [
    "Material principal de primera calidad",
    "Terminación interior protegida",
    "Producto 100% artesanal",
    "Incluye accesorio de regalo",
  ],
  especificaciones: [
    ["Material", "(Material)"],
    ["Diámetro", "9 cm"],
    ["Altura", "10 cm"],
    ["Capacidad", "240 ml"],
    ["Apto lavavajillas", "No"],
    ["Incluye", "Accesorio + caja"],
    ["Origen", "Hecho en Argentina"],
  ],
};

function obtenerProducto(id) {
  const producto = productos.find((p) => p.id === Number(id));
  if (!producto) return null;
  const color = colores.find((c) => c.valor === producto.color);
  return { ...detalleBase, ...producto, colorInfo: color };
}

function productosRelacionados(id, cantidad = 4) {
  const actual = productos.find((p) => p.id === Number(id));
  const misma = productos.filter((p) => p.id !== actual.id && p.categoria === actual.categoria);
  const resto = productos.filter((p) => p.id !== actual.id && p.categoria !== actual.categoria);
  return [...misma, ...resto].slice(0, cantidad);
}

// ── ABM para el panel admin ─────────────────────────────────
const STOCK_BAJO = 5;

function limpiar(datos) {
  return {
    nombre: String(datos.nombre).trim(),
    categoria: datos.categoria,
    color: datos.color,
    precio: Number(datos.precio),
    costo: Number(datos.costo),
    stock: Math.max(0, parseInt(datos.stock, 10) || 0),
    etiqueta: String(datos.etiqueta || "").trim() || null,
  };
}

function crearProducto(datos) {
  const producto = { id: Math.max(0, ...productos.map((p) => p.id)) + 1, imagen: null, ...limpiar(datos) };
  if (datos.imagen) producto.imagen = datos.imagen;
  productos.push(producto);
  return producto;
}

function actualizarProducto(id, datos) {
  const producto = productos.find((p) => p.id === Number(id));
  if (!producto) return null;
  Object.assign(producto, limpiar(datos));
  if (datos.imagen) producto.imagen = datos.imagen;
  if (datos.quitarImagen) producto.imagen = null;
  return producto;
}

function eliminarProducto(id) {
  const i = productos.findIndex((p) => p.id === Number(id));
  if (i === -1) return null;
  return productos.splice(i, 1)[0];
}

// Suma o resta stock (nunca queda negativo). Devuelve el producto actualizado.
function ajustarStock(id, cambio) {
  const producto = productos.find((p) => p.id === Number(id));
  if (!producto) return null;
  producto.stock = Math.max(0, producto.stock + Number(cambio));
  return producto;
}

module.exports = {
  productos,
  colores,
  categorias,
  STOCK_BAJO,
  obtenerProducto,
  productosRelacionados,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  ajustarStock,
};

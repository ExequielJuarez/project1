// Datos de ejemplo para la maqueta del catálogo.
// Reemplazar por la consulta real a la base de datos cuando esté lista.

const productos = [
  { id: 1, nombre: "Producto Clásico Edición Cuero", categoria: "Línea Clásica", precio: 25000, color: "negro", etiqueta: "Nuevo" },
  { id: 2, nombre: "Producto Madera Boca Ancha con Detalle Metálico", categoria: "Línea Madera", precio: 29500, color: "madera", etiqueta: null },
  { id: 3, nombre: "Producto Personalizado con Caja de Regalo", categoria: "Personalizados", precio: 38500, color: "negro", etiqueta: "Más vendido" },
  { id: 4, nombre: "Producto Personalizado Grabado a Láser", categoria: "Personalizados", precio: 38990, color: "blanco", etiqueta: null },
  { id: 5, nombre: "Producto Artesanal Terminación Mate", categoria: "Línea Clásica", precio: 21000, color: "crudo", etiqueta: null },
  { id: 6, nombre: "Producto Acero Inoxidable Térmico", categoria: "Línea Acero", precio: 42000, color: "gris", etiqueta: "Nuevo" },
  { id: 7, nombre: "Producto Imperial Base Reforzada", categoria: "Línea Premium", precio: 55000, color: "negro", etiqueta: "Exclusivo" },
  { id: 8, nombre: "Combo Regalo Completo con Accesorios", categoria: "Combos", precio: 64900, color: "blanco", etiqueta: null },
  { id: 9, nombre: "Producto Cerámica Esmaltada", categoria: "Línea Cerámica", precio: 18500, color: "blanco", etiqueta: null },
  { id: 10, nombre: "Producto Madera Torneada a Mano", categoria: "Línea Madera", precio: 27300, color: "madera", etiqueta: null },
  { id: 11, nombre: "Producto Forrado en Cuero Crudo", categoria: "Línea Clásica", precio: 31200, color: "crudo", etiqueta: "Últimas unidades" },
  { id: 12, nombre: "Set Empresarial Personalizado x10", categoria: "Personalizados", precio: 289000, color: "gris", etiqueta: null },
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
  stock: 24,
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

module.exports = { productos, colores, categorias, obtenerProducto, productosRelacionados };

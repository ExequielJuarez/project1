// Carrito guardado en la sesión del usuario.
// Los precios siempre salen del catálogo (nunca del navegador).

const { obtenerProducto } = require("./productosMock");

const ENVIO_GRATIS_DESDE = 150000;
const COSTO_ENVIO = 6500;
const DESCUENTO_TRANSFERENCIA = 0.1;
const MAX_POR_ITEM = 20;

// Cupones de ejemplo para la maqueta
const CUPONES = {
  BIENVENIDA: { descripcion: "10% off en tu primera compra", porcentaje: 0.1 },
  MAQUETA5: { descripcion: "5% off de prueba", porcentaje: 0.05 },
};

function obtener(session) {
  if (!session.carrito) {
    session.carrito = {
      items: [],
      cupon: null,
      medioPago: "tarjeta",
      entrega: "domicilio",
      codigoPostal: null,
    };
  }
  return session.carrito;
}

function cantidadTotal(session) {
  return (session.carrito?.items || []).reduce((acc, i) => acc + i.cantidad, 0);
}

// Devuelve { ok: true } o { ok: false, mensaje } si no se puede agregar
function agregar(session, { id, cantidad = 1, color = null }) {
  const producto = obtenerProducto(id);
  if (!producto) return { ok: false, mensaje: "Producto no encontrado" };
  if (producto.stock <= 0) return { ok: false, mensaje: "Este producto no tiene stock por ahora" };

  const carrito = obtener(session);
  const colorFinal = color || producto.colorInfo?.nombre || null;
  const clave = `${producto.id}-${colorFinal || "unico"}`;
  const existente = carrito.items.find((i) => i.clave === clave);
  const suma = Math.max(1, Number(cantidad) || 1);

  if (existente) {
    existente.cantidad = Math.min(existente.cantidad + suma, MAX_POR_ITEM, producto.stock);
  } else {
    carrito.items.push({
      clave,
      id: producto.id,
      color: colorFinal,
      cantidad: Math.min(suma, MAX_POR_ITEM, producto.stock),
    });
  }
  return { ok: true };
}

function actualizar(session, clave, cantidad) {
  const carrito = obtener(session);
  const item = carrito.items.find((i) => i.clave === clave);
  if (!item) return false;
  const producto = obtenerProducto(item.id);
  item.cantidad = Math.min(Math.max(1, Number(cantidad) || 1), MAX_POR_ITEM, producto.stock);
  return true;
}

function quitar(session, clave) {
  const carrito = obtener(session);
  carrito.items = carrito.items.filter((i) => i.clave !== clave);
}

function vaciar(session) {
  const carrito = obtener(session);
  carrito.items = [];
  carrito.cupon = null;
}

function aplicarCupon(session, codigo) {
  const clave = String(codigo || "").trim().toUpperCase();
  if (!CUPONES[clave]) return false;
  obtener(session).cupon = clave;
  return true;
}

function quitarCupon(session) {
  obtener(session).cupon = null;
}

function fijarMedioPago(session, medio) {
  if (["tarjeta", "transferencia"].includes(medio)) obtener(session).medioPago = medio;
}

function fijarEntrega(session, entrega) {
  if (["domicilio", "retiro"].includes(entrega)) obtener(session).entrega = entrega;
}

function fijarCodigoPostal(session, cp) {
  if (!/^\d{4}$/.test(String(cp || ""))) return false;
  obtener(session).codigoPostal = String(cp);
  return true;
}

// Arma todo lo que necesita la vista: items con datos del producto y totales
function resumen(session) {
  const carrito = obtener(session);

  const items = carrito.items
    .map((i) => {
      const producto = obtenerProducto(i.id);
      if (!producto) return null;
      return { ...i, producto, subtotal: producto.precio * i.cantidad };
    })
    .filter(Boolean);

  const subtotal = items.reduce((acc, i) => acc + i.subtotal, 0);
  const cupon = carrito.cupon ? { codigo: carrito.cupon, ...CUPONES[carrito.cupon] } : null;
  const descuentoCupon = cupon ? Math.round(subtotal * cupon.porcentaje) : 0;
  const baseTransferencia = subtotal - descuentoCupon;
  const descuentoPago =
    carrito.medioPago === "transferencia" ? Math.round(baseTransferencia * DESCUENTO_TRANSFERENCIA) : 0;

  const envioGratis = subtotal >= ENVIO_GRATIS_DESDE;
  const entrega = carrito.entrega || "domicilio";
  let envio = null; // null = todavía sin calcular
  if (envioGratis || entrega === "retiro") envio = 0;
  else if (carrito.codigoPostal) envio = COSTO_ENVIO;

  const total = subtotal - descuentoCupon - descuentoPago + (envio || 0);

  return {
    items,
    cantidad: items.reduce((acc, i) => acc + i.cantidad, 0),
    subtotal,
    cupon,
    descuentoCupon,
    medioPago: carrito.medioPago,
    descuentoPago,
    codigoPostal: carrito.codigoPostal,
    entrega,
    costoEnvio: COSTO_ENVIO,
    envio,
    envioGratis,
    envioGratisDesde: ENVIO_GRATIS_DESDE,
    faltaEnvioGratis: Math.max(0, ENVIO_GRATIS_DESDE - subtotal),
    progresoEnvio: Math.min(100, Math.round((subtotal / ENVIO_GRATIS_DESDE) * 100)),
    total,
    cuotas: 6,
  };
}

module.exports = {
  cantidadTotal,
  agregar,
  actualizar,
  quitar,
  vaciar,
  aplicarCupon,
  quitarCupon,
  fijarMedioPago,
  fijarEntrega,
  fijarCodigoPostal,
  resumen,
};

// Pedidos guardados en memoria para la maqueta.
// Arranca con un historial de ejemplo de los últimos 30 días (siempre el
// mismo, generado con una semilla fija) y suma los pedidos reales que se
// confirman desde el checkout.
// Cada item guarda el precio y el costo del momento de la venta, así la
// ganancia histórica no cambia si después se edita el producto.

const { productos } = require("./productosMock");

const ESTADOS = ["pendiente", "pagado", "enviado", "entregado", "cancelado"];
const CLIENTES = [
  "Lucía Fernández", "Martín Gómez", "Sofía Rodríguez", "Juan Pérez", "Valentina López",
  "Tomás Díaz", "Camila Martínez", "Mateo Sánchez", "Julieta Romero", "Nicolás Álvarez",
  "Agustina Torres", "Facundo Ruiz", "Florencia Castro", "Santiago Morales", "Micaela Ortiz",
];

// Generador pseudoaleatorio con semilla (mulberry32): mismos datos en cada arranque
function semilla(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pedidos = [];

function totalesDe(items, descuento = 0, envio = 0) {
  const subtotal = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  const costo = items.reduce((acc, i) => acc + i.costo * i.cantidad, 0);
  const total = subtotal - descuento + envio;
  // La ganancia es sobre la mercadería: lo cobrado menos descuentos menos el costo
  return { subtotal, costo, descuento, envio, total, ganancia: subtotal - descuento - costo };
}

(function generarHistorial() {
  const azar = semilla(20260927);
  const elegir = (lista) => lista[Math.floor(azar() * lista.length)];
  // Los más baratos se venden más seguido
  const vendibles = productos.filter((p) => p.precio < 100000);
  const hoy = new Date();
  hoy.setHours(12, 0, 0, 0);

  let numero = 1001;
  for (let dia = 29; dia >= 0; dia--) {
    // Más ventas los fines de semana y una leve tendencia en alza
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() - dia);
    const finde = [0, 6].includes(fecha.getDay());
    const cantidadPedidos = Math.floor(azar() * 3) + (finde ? 2 : 1) + (dia < 10 ? 1 : 0);

    for (let n = 0; n < cantidadPedidos; n++) {
      const items = [];
      const lineas = azar() < 0.7 ? 1 : 2;
      for (let l = 0; l < lineas; l++) {
        const p = azar() < 0.04 ? productos.find((x) => x.id === 12) : elegir(vendibles);
        if (items.some((i) => i.id === p.id)) continue;
        items.push({ id: p.id, nombre: p.nombre, precio: p.precio, costo: p.costo, cantidad: azar() < 0.8 ? 1 : 2 });
      }

      const cuando = new Date(fecha);
      cuando.setHours(9 + Math.floor(azar() * 13), Math.floor(azar() * 60));
      const transferencia = azar() < 0.35;
      const base = totalesDe(items);
      const descuento = transferencia ? Math.round(base.subtotal * 0.1) : 0;
      const envio = base.subtotal >= 150000 || azar() < 0.3 ? 0 : 6500;

      // Los más viejos ya se entregaron; los recientes siguen en curso
      let estado;
      const r = azar();
      if (r < 0.06) estado = "cancelado";
      else if (dia > 7) estado = "entregado";
      else if (dia > 3) estado = r < 0.5 ? "enviado" : "entregado";
      else estado = r < 0.3 ? "pendiente" : r < 0.7 ? "pagado" : "enviado";

      pedidos.push({
        numero: numero++,
        fecha: cuando,
        cliente: elegir(CLIENTES),
        email: null,
        items,
        medioPago: transferencia ? "transferencia" : "tarjeta",
        entrega: azar() < 0.2 ? "retiro" : "domicilio",
        estado,
        ...totalesDe(items, descuento, envio),
      });
    }
  }
})();

// ── Consultas ───────────────────────────────────────────────
function listar({ estado = "", q = "" } = {}) {
  const texto = q.trim().toLowerCase();
  return pedidos
    .filter((p) => !estado || p.estado === estado)
    .filter((p) => !texto || String(p.numero).includes(texto) || p.cliente.toLowerCase().includes(texto))
    .sort((a, b) => b.fecha - a.fecha);
}

function buscar(numero) {
  return pedidos.find((p) => p.numero === Number(numero)) || null;
}

function cambiarEstado(numero, estado) {
  const pedido = buscar(numero);
  if (!pedido || !ESTADOS.includes(estado)) return null;
  pedido.estado = estado;
  return pedido;
}

// Crea un pedido con lo que hay en el carrito (resumen de src/data/carrito.js)
function crearDesdeCarrito(resumen, datos, usuario) {
  const items = resumen.items.map((i) => ({
    id: i.id,
    nombre: i.producto.nombre,
    color: i.color,
    precio: i.producto.precio,
    costo: i.producto.costo,
    cantidad: i.cantidad,
  }));
  const pedido = {
    numero: Math.max(1000, ...pedidos.map((p) => p.numero)) + 1,
    fecha: new Date(),
    cliente: `${datos.nombre} ${datos.apellido}`.trim(),
    email: datos.email,
    usuarioId: usuario?.id || null,
    items,
    medioPago: resumen.medioPago,
    entrega: datos.entrega,
    estado: "pagado",
    ...totalesDe(items, resumen.descuentoCupon + resumen.descuentoPago, resumen.envio || 0),
  };
  pedidos.push(pedido);
  return pedido;
}

// ── Métricas para el dashboard ──────────────────────────────
function metricas(dias = 30) {
  const desde = new Date();
  desde.setHours(0, 0, 0, 0);
  desde.setDate(desde.getDate() - (dias - 1));

  const validos = pedidos.filter((p) => p.fecha >= desde && p.estado !== "cancelado");

  // Serie diaria (todos los días, aunque no haya ventas)
  const serie = [];
  for (let d = 0; d < dias; d++) {
    const fecha = new Date(desde);
    fecha.setDate(desde.getDate() + d);
    serie.push({ fecha, ingresos: 0, costo: 0, ganancia: 0, pedidos: 0 });
  }
  validos.forEach((p) => {
    const i = Math.floor((new Date(p.fecha).setHours(0, 0, 0, 0) - desde) / 86400000);
    const dia = serie[i];
    if (!dia) return;
    dia.ingresos += p.subtotal - p.descuento;
    dia.costo += p.costo;
    dia.ganancia += p.ganancia;
    dia.pedidos += 1;
  });

  // Ranking de productos por ganancia
  const porProducto = {};
  validos.forEach((p) =>
    p.items.forEach((i) => {
      const fila = (porProducto[i.id] ||= { id: i.id, nombre: i.nombre, unidades: 0, ingresos: 0, ganancia: 0 });
      fila.unidades += i.cantidad;
      fila.ingresos += i.precio * i.cantidad;
      fila.ganancia += (i.precio - i.costo) * i.cantidad;
    })
  );

  const ingresos = serie.reduce((acc, d) => acc + d.ingresos, 0);
  const ganancia = serie.reduce((acc, d) => acc + d.ganancia, 0);
  const unidades = validos.reduce((acc, p) => acc + p.items.reduce((a, i) => a + i.cantidad, 0), 0);

  // Mismo cálculo para el período anterior, para mostrar la variación
  const antesDesde = new Date(desde);
  antesDesde.setDate(desde.getDate() - dias);
  const anteriores = pedidos.filter((p) => p.fecha >= antesDesde && p.fecha < desde && p.estado !== "cancelado");
  const gananciaAnterior = anteriores.reduce((acc, p) => acc + p.ganancia, 0);

  return {
    dias,
    ingresos,
    costo: ingresos - ganancia,
    ganancia,
    margen: ingresos ? ganancia / ingresos : 0,
    pedidos: validos.length,
    unidades,
    ticketPromedio: validos.length ? ingresos / validos.length : 0,
    gananciaAnterior: anteriores.length ? gananciaAnterior : null,
    serie,
    topProductos: Object.values(porProducto).sort((a, b) => b.ganancia - a.ganancia).slice(0, 5),
    pendientes: pedidos.filter((p) => ["pendiente", "pagado"].includes(p.estado)).length,
  };
}

// Ventas de un producto (para la ficha del admin)
function ventasDeProducto(id) {
  const filas = pedidos
    .filter((p) => p.estado !== "cancelado")
    .flatMap((p) => p.items.filter((i) => i.id === Number(id)).map((i) => ({ ...i, fecha: p.fecha, numero: p.numero })));
  return {
    unidades: filas.reduce((acc, f) => acc + f.cantidad, 0),
    ingresos: filas.reduce((acc, f) => acc + f.precio * f.cantidad, 0),
    ganancia: filas.reduce((acc, f) => acc + (f.precio - f.costo) * f.cantidad, 0),
    ultimas: filas.sort((a, b) => b.fecha - a.fecha).slice(0, 6),
  };
}

module.exports = { ESTADOS, listar, buscar, cambiarEstado, crearDesdeCarrito, metricas, ventasDeProducto };

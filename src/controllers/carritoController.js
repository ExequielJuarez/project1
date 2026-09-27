const carrito = require("../data/carrito");
const { productos } = require("../data/productosMock");

// Respuesta JSON común para todas las acciones del carrito
function responder(req, res, extra = {}) {
  const r = carrito.resumen(req.session);
  res.json({
    ok: true,
    cantidad: r.cantidad,
    resumen: {
      ...r,
      // La vista solo necesita estos datos de cada item
      items: r.items.map((i) => ({ clave: i.clave, cantidad: i.cantidad, subtotal: i.subtotal })),
    },
    ...extra,
  });
}

module.exports = {
  ver(req, res) {
    const resumen = carrito.resumen(req.session);
    const enCarrito = new Set(resumen.items.map((i) => i.id));

    res.render("carrito", {
      titulo: "Tu carrito",
      estilo: "carrito",
      resumen,
      recomendados: productos.filter((p) => !enCarrito.has(p.id)).slice(0, 4),
    });
  },

  agregar(req, res) {
    const { id, cantidad, color } = req.body;
    const resultado = carrito.agregar(req.session, { id, cantidad, color });
    if (!resultado.ok) return res.status(400).json(resultado);
    responder(req, res);
  },

  actualizar(req, res) {
    if (!carrito.actualizar(req.session, req.params.clave, req.body.cantidad)) {
      return res.status(404).json({ ok: false, mensaje: "El producto ya no está en el carrito" });
    }
    responder(req, res);
  },

  quitar(req, res) {
    carrito.quitar(req.session, req.params.clave);
    responder(req, res);
  },

  vaciar(req, res) {
    carrito.vaciar(req.session);
    responder(req, res);
  },

  cupon(req, res) {
    if (!carrito.aplicarCupon(req.session, req.body.codigo)) {
      return res.status(400).json({ ok: false, mensaje: "El cupón no es válido" });
    }
    responder(req, res);
  },

  quitarCupon(req, res) {
    carrito.quitarCupon(req.session);
    responder(req, res);
  },

  medioPago(req, res) {
    carrito.fijarMedioPago(req.session, req.body.medio);
    responder(req, res);
  },

  entrega(req, res) {
    carrito.fijarEntrega(req.session, req.body.entrega);
    responder(req, res);
  },

  envio(req, res) {
    if (!carrito.fijarCodigoPostal(req.session, req.body.codigoPostal)) {
      return res.status(400).json({ ok: false, mensaje: "Ingresá un código postal de 4 dígitos" });
    }
    responder(req, res);
  },
};

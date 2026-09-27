const { validationResult } = require("express-validator");
const carrito = require("../services/carritoService");
const pedidos = require("../services/pedidoService");
const provincias = require("../data/provincias");

const CAMPOS = [
  "email", "nombre", "apellido", "telefono", "dni",
  "entrega", "calle", "numero", "piso", "codigoPostal", "ciudad", "provincia", "notas",
  "facturacion", "cuit", "razonSocial", "newsletter",
];

function datosIniciales(req, resumen) {
  const guardados = req.session.checkout?.datos || {};
  // Si inició sesión, completamos el contacto con sus datos
  const u = req.session.usuarioLogueado;
  const deCuenta = u
    ? { email: u.email, nombre: u.nombre, apellido: u.apellido, telefono: u.telefono || "" }
    : {};
  return {
    ...deCuenta,
    entrega: resumen.entrega,
    facturacion: "consumidor",
    codigoPostal: resumen.codigoPostal || "",
    provincia: "",
    ...guardados,
  };
}

function render(res, { req, resumen, datos, errores = {}, status = 200 }) {
  res.status(status).render("checkout-datos", {
    titulo: "Tus datos",
    estilo: "checkout-datos",
    resumen,
    datos,
    errores,
    provincias,
    guardado: req.query.guardado === "1" && !Object.keys(errores).length,
  });
}

module.exports = {
  async ver(req, res) {
    const resumen = await carrito.resumen(req.session);
    if (!resumen.items.length) return res.redirect("/carrito");
    render(res, { req, resumen, datos: datosIniciales(req, resumen) });
  },

  async guardar(req, res) {
    const resumen = await carrito.resumen(req.session);
    if (!resumen.items.length) return res.redirect("/carrito");

    // Solo guardamos los campos conocidos del formulario
    const datos = Object.fromEntries(CAMPOS.map((c) => [c, req.body[c] ?? ""]));
    datos.newsletter = Boolean(req.body.newsletter);

    const resultado = validationResult(req);
    if (!resultado.isEmpty()) {
      return render(res, { req, resumen, datos, errores: resultado.mapped(), status: 422 });
    }

    // La entrega y el código postal también impactan en el costo del envío
    carrito.fijarEntrega(req.session, datos.entrega);
    if (datos.entrega === "domicilio") carrito.fijarCodigoPostal(req.session, datos.codigoPostal);

    req.session.checkout = { datos };
    res.redirect("/checkout/datos?guardado=1");
  },

  // Confirma el pedido (en la maqueta todavía sin paso de pago real):
  // lo guarda en la base, descuenta el stock y vacía el carrito
  async confirmar(req, res) {
    const resumen = await carrito.resumen(req.session);
    const datos = req.session.checkout?.datos;
    if (!resumen.items.length) return res.redirect("/carrito");
    if (!datos) return res.redirect("/checkout/datos");

    try {
      const pedido = await pedidos.crearDesdeCarrito(resumen, datos, req.session.usuarioLogueado);
      carrito.vaciar(req.session);
      delete req.session.checkout;
      req.session.flash = `¡Gracias! Tu pedido #${pedido.numero} quedó confirmado.`;
      res.redirect("/");
    } catch (error) {
      if (!error.sinStock) throw error;
      req.session.flash = `${error.message}. Revisá tu carrito.`;
      res.redirect("/carrito");
    }
  },
};

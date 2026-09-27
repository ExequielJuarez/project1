const { validationResult } = require("express-validator");
const carrito = require("../data/carrito");
const provincias = require("../data/provincias");

const CAMPOS = [
  "email", "nombre", "apellido", "telefono", "dni",
  "entrega", "calle", "numero", "piso", "codigoPostal", "ciudad", "provincia", "notas",
  "facturacion", "cuit", "razonSocial", "newsletter",
];

function datosIniciales(req, resumen) {
  const guardados = req.session.checkout?.datos || {};
  return {
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
  ver(req, res) {
    const resumen = carrito.resumen(req.session);
    if (!resumen.items.length) return res.redirect("/carrito");
    render(res, { req, resumen, datos: datosIniciales(req, resumen) });
  },

  guardar(req, res) {
    const resumen = carrito.resumen(req.session);
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
};

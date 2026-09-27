const { validationResult } = require("express-validator");
const usuarios = require("../data/usuariosMock");

const MAX_INTENTOS = 5;
const BLOQUEO_MS = 60 * 1000;
const RECORDAR_MS = 30 * 24 * 60 * 60 * 1000;

// Solo permitimos volver a rutas internas (evita redirecciones a otros sitios)
function destinoSeguro(url) {
  return typeof url === "string" && url.startsWith("/") && !url.startsWith("//") ? url : "/";
}

function render(res, { req, datos = {}, errores = {}, errorGeneral = null, status = 200 }) {
  res.status(status).render("login", {
    titulo: "Iniciar sesión",
    estilo: "login",
    datos,
    errores,
    errorGeneral,
    volver: destinoSeguro(req.query.volver || req.body?.volver),
  });
}

module.exports = {
  verLogin(req, res) {
    render(res, { req });
  },

  async login(req, res) {
    const datos = { email: req.body.email || "", recordar: Boolean(req.body.recordar) };

    // Freno simple contra intentos repetidos
    const intentos = req.session.intentosLogin || { cantidad: 0, hasta: 0 };
    if (intentos.hasta > Date.now()) {
      const segundos = Math.ceil((intentos.hasta - Date.now()) / 1000);
      return render(res, {
        req, datos, status: 429,
        errorGeneral: `Demasiados intentos. Probá de nuevo en ${segundos} segundos.`,
      });
    }

    const resultado = validationResult(req);
    if (!resultado.isEmpty()) {
      return render(res, { req, datos, errores: resultado.mapped(), status: 422 });
    }

    const usuario = await usuarios.verificar(req.body.email, req.body.password);

    if (!usuario) {
      intentos.cantidad += 1;
      if (intentos.cantidad >= MAX_INTENTOS) {
        intentos.cantidad = 0;
        intentos.hasta = Date.now() + BLOQUEO_MS;
      }
      req.session.intentosLogin = intentos;
      return render(res, {
        req, datos, status: 401,
        errorGeneral: "El email o la contraseña no son correctos.",
      });
    }

    // Nueva sesión al iniciar (evita fijación de sesión) conservando el carrito y el checkout
    const { carrito, checkout } = req.session;
    req.session.regenerate((err) => {
      if (err) return render(res, { req, datos, status: 500, errorGeneral: "No pudimos iniciar sesión, probá de nuevo." });

      Object.assign(req.session, { carrito, checkout, usuarioLogueado: usuario });
      if (datos.recordar) req.session.cookie.maxAge = RECORDAR_MS;
      req.session.flash = `¡Hola, ${usuario.nombre}! Iniciaste sesión.`;

      req.session.save(() => res.redirect(destinoSeguro(req.body.volver)));
    });
  },

  logout(req, res) {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.redirect("/");
    });
  },
};

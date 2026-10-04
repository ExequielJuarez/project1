// Para comprar hay que tener cuenta: si no inició sesión lo manda al login
// (con aviso) y después vuelve al checkout con el carrito intacto.
module.exports = (req, res, next) => {
  if (req.session.usuarioLogueado) return next();
  const volver = req.method === "GET" ? req.originalUrl : "/checkout/datos";
  res.redirect(`/login?volver=${encodeURIComponent(volver)}`);
};

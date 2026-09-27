// Solo deja pasar a usuarios con rol "admin".
// Si no inició sesión lo manda al login (y después vuelve acá).
module.exports = (req, res, next) => {
  const usuario = req.session.usuarioLogueado;
  if (!usuario) return res.redirect(`/login?volver=${encodeURIComponent(req.originalUrl)}`);
  if (usuario.rol !== "admin") {
    req.session.flash = "No tenés permiso para entrar al panel de administración.";
    return res.redirect("/");
  }
  next();
};

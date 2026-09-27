const favoritos = require("../data/favoritos");
const carrito = require("../data/carrito");

module.exports = {
  ver(req, res) {
    res.render("favoritos", {
      titulo: "Favoritos",
      estilo: "favoritos",
      productos: favoritos.productosFavoritos(req.session),
    });
  },

  alternar(req, res) {
    const r = favoritos.alternar(req.session, req.params.id);
    if (!r) return res.status(404).json({ ok: false, mensaje: "Producto no encontrado" });
    res.json({ ok: true, ...r });
  },

  vaciar(req, res) {
    favoritos.vaciar(req.session);
    res.json({ ok: true, cantidad: 0 });
  },

  // Agrega al carrito todos los favoritos que tengan stock
  alCarrito(req, res) {
    const lista = favoritos.productosFavoritos(req.session);
    const agregados = lista.filter((p) => carrito.agregar(req.session, { id: p.id }).ok);
    res.json({
      ok: true,
      agregados: agregados.length,
      sinStock: lista.length - agregados.length,
      cantidadCarrito: carrito.cantidadTotal(req.session),
    });
  },
};

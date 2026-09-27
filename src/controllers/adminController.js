const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");
const productoService = require("../services/productoService");
const pedidoService = require("../services/pedidoService");

const CARPETA_PUBLICA = path.join(__dirname, "../../public");

// Borra una imagen subida (si existe) sin frenar la respuesta
function borrarImagen(ruta) {
  if (!ruta || !ruta.startsWith("/img/productos/")) return;
  fs.unlink(path.join(CARPETA_PUBLICA, ruta), () => {});
}

// Datos comunes a todas las vistas del panel (menú lateral)
async function base(req, extra) {
  const [totalProductos, pedidosPendientes] = await Promise.all([productoService.total(), pedidoService.pendientes()]);
  return { usuario: req.session.usuarioLogueado, totalProductos, pedidosPendientes, ...extra };
}

async function renderFormulario(res, req, { producto = null, datos, errores = {}, status = 200 }) {
  const [categorias, colores] = await Promise.all([productoService.categorias(), productoService.colores()]);
  res.status(status).render(
    "admin/producto-form",
    await base(req, {
      titulo: producto ? `Editar · ${producto.nombre}` : "Nuevo producto",
      estilo: ["admin", "admin-producto-form"],
      seccion: "productos",
      producto,
      datos,
      errores,
      categorias,
      colores,
    })
  );
}

function erroresDe(req) {
  const errores = validationResult(req).mapped();
  if (req.errorImagen) errores.imagen = { msg: req.errorImagen };
  return errores;
}

module.exports = {
  // ── Dashboard ──────────────────────────────────────────────
  async dashboard(req, res) {
    const dias = [7, 14, 30].includes(Number(req.query.dias)) ? Number(req.query.dias) : 14;
    const [m, stock, ultimos] = await Promise.all([
      pedidoService.metricas(dias),
      productoService.resumenStock(),
      pedidoService.listar({ limite: 6 }),
    ]);
    res.render(
      "admin/dashboard",
      await base(req, {
        titulo: "Panel",
        estilo: ["admin", "admin-dashboard"],
        seccion: "dashboard",
        m,
        stock,
        ultimos,
        STOCK_BAJO: productoService.STOCK_BAJO,
      })
    );
  },

  // ── Productos: listado ─────────────────────────────────────
  async productos(req, res) {
    const { q = "", categoria = "", stock = "", orden = "nombre" } = req.query;
    const [lista, categorias, stockResumen] = await Promise.all([
      productoService.listar({ q, categoria, stock, orden }),
      productoService.categorias(),
      productoService.resumenStock(),
    ]);
    res.render(
      "admin/productos",
      await base(req, {
        titulo: "Productos",
        estilo: ["admin", "admin-productos"],
        seccion: "productos",
        lista,
        filtros: { q, categoria, stock, orden },
        categorias,
        stockResumen,
        STOCK_BAJO: productoService.STOCK_BAJO,
      })
    );
  },

  // ── Productos: ver ─────────────────────────────────────────
  async verProducto(req, res) {
    const producto = await productoService.obtener(req.params.id);
    if (!producto) return res.redirect("/admin/productos");
    res.render(
      "admin/producto",
      await base(req, {
        titulo: producto.nombre,
        estilo: ["admin", "admin-producto"],
        seccion: "productos",
        producto,
        color: producto.colorInfo,
        ventas: await pedidoService.ventasDeProducto(producto.id),
        STOCK_BAJO: productoService.STOCK_BAJO,
      })
    );
  },

  // ── Productos: crear ───────────────────────────────────────
  async nuevo(req, res) {
    await renderFormulario(res, req, { datos: { categoria: "", color: "", stock: 0 } });
  },

  async crear(req, res) {
    const errores = erroresDe(req);
    if (Object.keys(errores).length) {
      if (req.file) borrarImagen(`/img/productos/${req.file.filename}`);
      return renderFormulario(res, req, { datos: req.body, errores, status: 422 });
    }

    const producto = await productoService.crear({
      ...req.body,
      imagen: req.file ? `/img/productos/${req.file.filename}` : null,
    });
    req.session.flash = `Producto "${producto.nombre}" creado.`;
    res.redirect(`/admin/productos/${producto.id}`);
  },

  // ── Productos: editar ──────────────────────────────────────
  async editar(req, res) {
    const producto = await productoService.obtener(req.params.id);
    if (!producto) return res.redirect("/admin/productos");
    await renderFormulario(res, req, { producto, datos: { ...producto } });
  },

  async actualizar(req, res) {
    const producto = await productoService.obtener(req.params.id);
    if (!producto) return res.redirect("/admin/productos");

    const errores = erroresDe(req);
    if (Object.keys(errores).length) {
      if (req.file) borrarImagen(`/img/productos/${req.file.filename}`);
      return renderFormulario(res, req, { producto, datos: { ...req.body, imagen: producto.imagen }, errores, status: 422 });
    }

    const quitarImagen = req.body.quitarImagen === "1" && !req.file;
    const actualizado = await productoService.actualizar(producto.id, {
      ...req.body,
      imagen: req.file ? `/img/productos/${req.file.filename}` : null,
      quitarImagen,
    });
    if (producto.imagen && producto.imagen !== actualizado.imagen) borrarImagen(producto.imagen);

    req.session.flash = "Cambios guardados.";
    res.redirect(`/admin/productos/${producto.id}`);
  },

  // ── Productos: borrar ──────────────────────────────────────
  async eliminar(req, res) {
    const producto = await productoService.eliminar(req.params.id);
    if (producto) {
      borrarImagen(producto.imagen);
      req.session.flash = `Producto "${producto.nombre}" eliminado.`;
    }
    res.redirect("/admin/productos");
  },

  // ── Productos: ajuste rápido de stock (JSON) ───────────────
  async ajustarStock(req, res) {
    const { cambio, valor } = req.body;
    let opciones;
    if (valor !== undefined) {
      const nuevo = parseInt(valor, 10);
      if (!Number.isInteger(nuevo) || nuevo < 0) return res.status(400).json({ ok: false, mensaje: "Stock inválido" });
      opciones = { valor: nuevo };
    } else {
      opciones = { cambio: parseInt(cambio, 10) || 0 };
    }

    const stock = await productoService.ajustarStock(req.params.id, opciones);
    if (stock === null) return res.status(404).json({ ok: false, mensaje: "Producto no encontrado" });
    res.json({ ok: true, stock, stockBajo: productoService.STOCK_BAJO, resumen: await productoService.resumenStock() });
  },

  // ── Pedidos ────────────────────────────────────────────────
  async pedidos(req, res) {
    const { estado = "", q = "" } = req.query;
    const [lista, conteo] = await Promise.all([pedidoService.listar({ estado, q }), pedidoService.conteoPorEstado()]);
    res.render(
      "admin/pedidos",
      await base(req, {
        titulo: "Pedidos",
        estilo: ["admin", "admin-pedidos"],
        seccion: "pedidos",
        lista,
        filtros: { estado, q },
        estados: pedidoService.ESTADOS,
        conteo,
        total: Object.values(conteo).reduce((a, b) => a + b, 0),
      })
    );
  },

  async cambiarEstado(req, res) {
    const pedido = await pedidoService.cambiarEstado(req.params.numero, req.body.estado);
    if (!pedido) return res.status(400).json({ ok: false, mensaje: "No se pudo cambiar el estado" });
    res.json({ ok: true, estado: pedido.estado });
  },
};

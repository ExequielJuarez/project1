const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");
const catalogo = require("../data/productosMock");
const pedidos = require("../data/pedidosMock");

const CARPETA_IMAGENES = path.join(__dirname, "../../public");

// Borra una imagen subida (si existe) sin frenar la respuesta
function borrarImagen(ruta) {
  if (!ruta || !ruta.startsWith("/img/productos/")) return;
  fs.unlink(path.join(CARPETA_IMAGENES, ruta), () => {});
}

// Datos comunes a todas las vistas del panel
function base(req, extra) {
  return {
    usuario: req.session.usuarioLogueado,
    totalProductos: catalogo.productos.length,
    pedidosPendientes: pedidos.listar().filter((p) => ["pendiente", "pagado"].includes(p.estado)).length,
    ...extra,
  };
}

function resumenStock() {
  const lista = catalogo.productos;
  return {
    unidades: lista.reduce((acc, p) => acc + p.stock, 0),
    valorCosto: lista.reduce((acc, p) => acc + p.stock * p.costo, 0),
    valorVenta: lista.reduce((acc, p) => acc + p.stock * p.precio, 0),
    sinStock: lista.filter((p) => p.stock === 0),
    bajo: lista.filter((p) => p.stock > 0 && p.stock <= catalogo.STOCK_BAJO),
  };
}

function renderFormulario(res, req, { producto = null, datos, errores = {}, status = 200 }) {
  res.status(status).render("admin/producto-form", base(req, {
    titulo: producto ? `Editar · ${producto.nombre}` : "Nuevo producto",
    estilo: ["admin", "admin-producto-form"],
    seccion: "productos",
    producto,
    datos,
    errores,
    categorias: catalogo.categorias,
    colores: catalogo.colores,
  }));
}

module.exports = {
  // ── Dashboard ──────────────────────────────────────────────
  dashboard(req, res) {
    const dias = [7, 14, 30].includes(Number(req.query.dias)) ? Number(req.query.dias) : 14;
    res.render("admin/dashboard", base(req, {
      titulo: "Panel",
      estilo: ["admin", "admin-dashboard"],
      seccion: "dashboard",
      m: pedidos.metricas(dias),
      stock: resumenStock(),
      ultimos: pedidos.listar().slice(0, 6),
      STOCK_BAJO: catalogo.STOCK_BAJO,
    }));
  },

  // ── Productos: listado ─────────────────────────────────────
  productos(req, res) {
    const { q = "", categoria = "", stock = "", orden = "nombre" } = req.query;
    const texto = q.trim().toLowerCase();

    let lista = catalogo.productos
      .filter((p) => !texto || p.nombre.toLowerCase().includes(texto) || String(p.id) === texto)
      .filter((p) => !categoria || p.categoria === categoria)
      .filter((p) => {
        if (stock === "sin") return p.stock === 0;
        if (stock === "bajo") return p.stock > 0 && p.stock <= catalogo.STOCK_BAJO;
        return true;
      });

    const ordenes = {
      nombre: (a, b) => a.nombre.localeCompare(b.nombre, "es"),
      "precio-desc": (a, b) => b.precio - a.precio,
      "stock-asc": (a, b) => a.stock - b.stock,
      "margen-desc": (a, b) => (b.precio - b.costo) / b.precio - (a.precio - a.costo) / a.precio,
    };
    lista = [...lista].sort(ordenes[orden] || ordenes.nombre);

    res.render("admin/productos", base(req, {
      titulo: "Productos",
      estilo: ["admin", "admin-productos"],
      seccion: "productos",
      lista,
      filtros: { q, categoria, stock, orden },
      categorias: catalogo.categorias,
      stockResumen: resumenStock(),
      STOCK_BAJO: catalogo.STOCK_BAJO,
    }));
  },

  // ── Productos: ver ─────────────────────────────────────────
  verProducto(req, res) {
    const producto = catalogo.productos.find((p) => p.id === Number(req.params.id));
    if (!producto) return res.redirect("/admin/productos");
    res.render("admin/producto", base(req, {
      titulo: producto.nombre,
      estilo: ["admin", "admin-producto"],
      seccion: "productos",
      producto,
      color: catalogo.colores.find((c) => c.valor === producto.color),
      ventas: pedidos.ventasDeProducto(producto.id),
      STOCK_BAJO: catalogo.STOCK_BAJO,
    }));
  },

  // ── Productos: crear ───────────────────────────────────────
  nuevo(req, res) {
    renderFormulario(res, req, { datos: { categoria: "", color: "", stock: 0 } });
  },

  crear(req, res) {
    const resultado = validationResult(req);
    const errores = resultado.mapped();
    if (req.errorImagen) errores.imagen = { msg: req.errorImagen };

    if (Object.keys(errores).length) {
      if (req.file) borrarImagen(`/img/productos/${req.file.filename}`);
      return renderFormulario(res, req, { datos: req.body, errores, status: 422 });
    }

    const producto = catalogo.crearProducto({
      ...req.body,
      imagen: req.file ? `/img/productos/${req.file.filename}` : null,
    });
    req.session.flash = `Producto "${producto.nombre}" creado.`;
    res.redirect(`/admin/productos/${producto.id}`);
  },

  // ── Productos: editar ──────────────────────────────────────
  editar(req, res) {
    const producto = catalogo.productos.find((p) => p.id === Number(req.params.id));
    if (!producto) return res.redirect("/admin/productos");
    renderFormulario(res, req, { producto, datos: { ...producto } });
  },

  actualizar(req, res) {
    const producto = catalogo.productos.find((p) => p.id === Number(req.params.id));
    if (!producto) return res.redirect("/admin/productos");

    const resultado = validationResult(req);
    const errores = resultado.mapped();
    if (req.errorImagen) errores.imagen = { msg: req.errorImagen };

    if (Object.keys(errores).length) {
      if (req.file) borrarImagen(`/img/productos/${req.file.filename}`);
      return renderFormulario(res, req, { producto, datos: { ...req.body, imagen: producto.imagen }, errores, status: 422 });
    }

    const imagenAnterior = producto.imagen;
    const quitarImagen = req.body.quitarImagen === "1";
    catalogo.actualizarProducto(producto.id, {
      ...req.body,
      imagen: req.file ? `/img/productos/${req.file.filename}` : null,
      quitarImagen: quitarImagen && !req.file,
    });
    if ((req.file || quitarImagen) && imagenAnterior !== producto.imagen) borrarImagen(imagenAnterior);

    req.session.flash = "Cambios guardados.";
    res.redirect(`/admin/productos/${producto.id}`);
  },

  // ── Productos: borrar ──────────────────────────────────────
  eliminar(req, res) {
    const producto = catalogo.eliminarProducto(req.params.id);
    if (producto) {
      borrarImagen(producto.imagen);
      req.session.flash = `Producto "${producto.nombre}" eliminado.`;
    }
    res.redirect("/admin/productos");
  },

  // ── Productos: ajuste rápido de stock (JSON) ───────────────
  ajustarStock(req, res) {
    const producto = catalogo.productos.find((p) => p.id === Number(req.params.id));
    if (!producto) return res.status(404).json({ ok: false, mensaje: "Producto no encontrado" });

    const { cambio, valor } = req.body;
    if (valor !== undefined) {
      const nuevo = parseInt(valor, 10);
      if (!Number.isInteger(nuevo) || nuevo < 0) return res.status(400).json({ ok: false, mensaje: "Stock inválido" });
      producto.stock = nuevo;
    } else {
      catalogo.ajustarStock(producto.id, parseInt(cambio, 10) || 0);
    }
    res.json({ ok: true, stock: producto.stock, stockBajo: catalogo.STOCK_BAJO, resumen: resumenStock() });
  },

  // ── Pedidos ────────────────────────────────────────────────
  pedidos(req, res) {
    const { estado = "", q = "" } = req.query;
    const todos = pedidos.listar();
    const conteo = Object.fromEntries(pedidos.ESTADOS.map((e) => [e, todos.filter((p) => p.estado === e).length]));
    res.render("admin/pedidos", base(req, {
      titulo: "Pedidos",
      estilo: ["admin", "admin-pedidos"],
      seccion: "pedidos",
      lista: pedidos.listar({ estado, q }),
      filtros: { estado, q },
      estados: pedidos.ESTADOS,
      conteo,
      total: todos.length,
    }));
  },

  cambiarEstado(req, res) {
    const pedido = pedidos.cambiarEstado(req.params.numero, req.body.estado);
    if (!pedido) return res.status(400).json({ ok: false, mensaje: "No se pudo cambiar el estado" });
    res.json({ ok: true, estado: pedido.estado });
  },
};

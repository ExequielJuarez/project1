const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const {
  productos,
  colores,
  categorias,
  obtenerProducto,
  productosRelacionados,
} = require("../data/productosMock");

// ── MAQUETA: CATÁLOGO DE PRODUCTOS ─────────────────────────
router.get(["/", "/catalogo"], (req, res) => {
  const conteoColores = colores.map((c) => ({
    ...c,
    cantidad: productos.filter((p) => p.color === c.valor).length,
  }));

  const conteoCategorias = categorias.map((nombre) => ({
    nombre,
    cantidad: productos.filter((p) => p.categoria === nombre).length,
  }));

  res.render("catalogo", {
    titulo: "Catálogo",
    estilo: "catalogo",
    navActivo: "catalogo",
    productos,
    colores: conteoColores,
    categorias: conteoCategorias,
  });
});

// ── MAQUETA: DETALLE DE PRODUCTO ───────────────────────────
router.get("/producto/:id", (req, res) => {
  const producto = obtenerProducto(req.params.id);
  if (!producto) return res.redirect("/catalogo");

  res.render("producto", {
    titulo: producto.nombre,
    estilo: "producto",
    navActivo: "catalogo",
    producto,
    colores,
    relacionados: productosRelacionados(producto.id),
  });
});

module.exports = router;

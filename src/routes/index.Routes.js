const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const { productos, colores, categorias } = require("../data/productosMock");

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
    productos,
    colores: conteoColores,
    categorias: conteoCategorias,
    descuentoTransferencia: 0.1,
  });
});

module.exports = router;

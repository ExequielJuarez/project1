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
const carritoController = require("../controllers/carritoController");
const checkoutController = require("../controllers/checkoutController");
const checkoutValidator = require("../validations/checkoutValidator");
const usuarioController = require("../controllers/usuarioController");
const loginValidator = require("../validations/loginValidator");
const registroValidator = require("../validations/registroValidator");
const soloInvitados = require("../middlewares/soloInvitados");

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

// ── CARRITO ────────────────────────────────────────────────
router.get("/carrito", carritoController.ver);
router.post("/carrito/agregar", carritoController.agregar);
router.patch("/carrito/item/:clave", carritoController.actualizar);
router.delete("/carrito/item/:clave", carritoController.quitar);
router.delete("/carrito", carritoController.vaciar);
router.post("/carrito/cupon", carritoController.cupon);
router.delete("/carrito/cupon", carritoController.quitarCupon);
router.post("/carrito/medio-pago", carritoController.medioPago);
router.post("/carrito/envio", carritoController.envio);
router.post("/carrito/entrega", carritoController.entrega);

// ── CHECKOUT ───────────────────────────────────────────────
router.get("/checkout/datos", checkoutController.ver);
router.post("/checkout/datos", checkoutValidator, checkoutController.guardar);
router.post("/checkout/confirmar", checkoutController.confirmar);

// ── USUARIOS ───────────────────────────────────────────────
router.get("/login", soloInvitados, usuarioController.verLogin);
router.post("/login", soloInvitados, loginValidator, usuarioController.login);
router.post("/logout", usuarioController.logout);
router.get("/registro", soloInvitados, usuarioController.verRegistro);
router.post("/registro", soloInvitados, registroValidator, usuarioController.registrar);

// Google (real si está configurado en .env, demo si no)
router.get("/auth/google", soloInvitados, usuarioController.googleInicio);
router.get("/auth/google/callback", usuarioController.googleCallback);
router.get("/auth/google/demo", soloInvitados, usuarioController.googleDemo);
router.post("/auth/google/demo", soloInvitados, usuarioController.googleDemoConfirmar);

module.exports = router;

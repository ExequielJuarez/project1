const express = require("express");
const router = express.Router();

const productoService = require("../services/productoService");
const inicioService = require("../services/inicioService");
const carritoController = require("../controllers/carritoController");
const checkoutController = require("../controllers/checkoutController");
const checkoutValidator = require("../validations/checkoutValidator");
const usuarioController = require("../controllers/usuarioController");
const loginValidator = require("../validations/loginValidator");
const registroValidator = require("../validations/registroValidator");
const soloInvitados = require("../middlewares/soloInvitados");
const favoritosController = require("../controllers/favoritosController");
const pagosController = require("../controllers/pagosController");
const cuentaController = require("../controllers/cuentaController");
const soloLogueados = require("../middlewares/soloLogueados");
const loginParaComprar = require("../middlewares/loginParaComprar");
const perfilValidator = require("../validations/perfilValidator");
const claveValidator = require("../validations/claveValidator");

// ── INICIO (presentación de la marca, sin precios) ─────────
// Los textos y fotos se editan desde Admin → Inicio
router.get("/", async (req, res) => {
  const contenido = await inicioService.obtener();
  res.render("inicio", { titulo: "Mates artesanales", estilo: "inicio", navActivo: "inicio", contenido });
});

// ── CATÁLOGO DE PRODUCTOS (y resultados de búsqueda con ?q=) ─
router.get("/catalogo", async (req, res) => {
  const busqueda = String(req.query.q || "").trim().slice(0, 60);
  const [productos, colores, categorias] = await Promise.all([
    productoService.listar({ q: busqueda }),
    productoService.colores(),
    productoService.categorias(),
  ]);

  // /catalogo?categoria=Mates (pestañas del menú): la categoría llega marcada en los filtros
  const categoria = categorias.find((c) => c === req.query.categoria) || "";

  res.render("catalogo", {
    titulo: busqueda ? `Resultados para “${busqueda}”` : categoria || "Catálogo",
    estilo: "catalogo",
    navActivo: categoria || "catalogo",
    busqueda,
    categoria,
    productos,
    colores: colores
      .map((c) => ({ ...c, cantidad: productos.filter((p) => p.colores.some((x) => x.valor === c.valor)).length }))
      .filter((c) => c.cantidad > 0),
    categorias: categorias.map((nombre) => ({ nombre, cantidad: productos.filter((p) => p.categoria === nombre).length })),
  });
});

// Sugerencias mientras se escribe en el buscador (JSON)
router.get("/buscar/sugerencias", async (req, res) => {
  const q = String(req.query.q || "").trim().slice(0, 60);
  if (q.length < 2) return res.json({ ok: true, total: 0, productos: [] });

  const encontrados = await productoService.listar({ q });
  res.json({
    ok: true,
    total: encontrados.length,
    productos: encontrados.slice(0, 6).map((p) => ({
      id: p.id,
      nombre: p.nombre,
      categoria: p.categoria,
      precio: p.precio,
      imagen: p.imagen,
      sinStock: p.stock <= 0,
    })),
  });
});

// ── DETALLE DE PRODUCTO ────────────────────────────────────
router.get("/producto/:id", async (req, res) => {
  const producto = await productoService.obtener(req.params.id);
  if (!producto) return res.redirect("/catalogo");

  const [colores, relacionados] = await Promise.all([
    productoService.colores(),
    productoService.relacionados(producto.id),
  ]);
  res.render("producto", {
    titulo: producto.nombre,
    estilo: "producto",
    navActivo: "catalogo",
    producto,
    colores,
    relacionados,
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

// ── FAVORITOS ──────────────────────────────────────────────
router.get("/favoritos", favoritosController.ver);
router.post("/favoritos/al-carrito", favoritosController.alCarrito);
router.post("/favoritos/:id", favoritosController.alternar);
router.delete("/favoritos", favoritosController.vaciar);

// ── CHECKOUT (solo con la sesión iniciada) ─────────────────
router.get("/checkout/datos", loginParaComprar, checkoutController.ver);
router.post("/checkout/datos", loginParaComprar, checkoutValidator, checkoutController.guardar);
router.get("/checkout/pago", loginParaComprar, checkoutController.verPago);
router.post("/checkout/confirmar", loginParaComprar, checkoutController.confirmar);

// ── PAGOS (Mercado Pago) Y DETALLE DE UN PEDIDO ────────────
router.get("/pedido/:numero", pagosController.detalle);
router.post("/pedido/:numero/pagar", pagosController.pagar);
router.post("/pedido/:numero/cancelar", pagosController.cancelar);
router.get("/pagos/retorno", pagosController.retorno);
router.post("/pagos/webhook", pagosController.webhook);
router.get("/pagos/demo/:numero", pagosController.verDemo);
router.post("/pagos/demo/:numero", pagosController.confirmarDemo);

// ── MI CUENTA ──────────────────────────────────────────────
router.get("/mi-cuenta", soloLogueados, (req, res) => res.redirect("/mi-cuenta/pedidos"));
router.get("/mi-cuenta/pedidos", soloLogueados, cuentaController.pedidos);
router.get("/mi-cuenta/datos", soloLogueados, cuentaController.verDatos);
router.post("/mi-cuenta/datos", soloLogueados, perfilValidator, cuentaController.guardarDatos);
router.post("/mi-cuenta/clave", soloLogueados, claveValidator, cuentaController.cambiarClave);

// ── USUARIOS ───────────────────────────────────────────────
router.get("/login", soloInvitados, usuarioController.verLogin);
router.post("/login", soloInvitados, loginValidator, usuarioController.login);
router.post("/logout", usuarioController.logout);
router.get("/registro", soloInvitados, usuarioController.verRegistro);
router.post("/registro", soloInvitados, registroValidator, usuarioController.registrar);

// Código por email: entrar sin contraseña, recuperar la cuenta y confirmar el registro
router.get("/login/codigo", soloInvitados, usuarioController.verPedirCodigo);
router.post("/login/codigo", soloInvitados, usuarioController.pedirCodigo);
router.get("/verificar", soloInvitados, usuarioController.verVerificar);
router.post("/verificar", soloInvitados, usuarioController.confirmarCodigo);
router.post("/verificar/reenviar", soloInvitados, usuarioController.reenviarCodigo);

// Google (real si está configurado en .env, demo si no)
router.get("/auth/google", soloInvitados, usuarioController.googleInicio);
router.get("/auth/google/callback", usuarioController.googleCallback);
router.get("/auth/google/demo", soloInvitados, usuarioController.googleDemo);
router.post("/auth/google/demo", soloInvitados, usuarioController.googleDemoConfirmar);

module.exports = router;

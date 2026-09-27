const express = require("express");
const router = express.Router();

const soloAdmin = require("../middlewares/soloAdmin");
const subirImagenes = require("../middlewares/subirImagenes");
const productoValidator = require("../validations/productoValidator");
const admin = require("../controllers/adminController");
const notificaciones = require("../controllers/notificacionesController");

// Todo el panel requiere un usuario con rol admin
router.use(soloAdmin);

router.get("/", admin.dashboard);

// ── Productos ──────────────────────────────────────────────
router.get("/productos", admin.productos);
router.get("/productos/nuevo", admin.nuevo);
router.post("/productos", subirImagenes, productoValidator, admin.crear);
router.get("/productos/:id", admin.verProducto);
router.get("/productos/:id/editar", admin.editar);
router.put("/productos/:id", subirImagenes, productoValidator, admin.actualizar);
router.delete("/productos/:id", admin.eliminar);
router.patch("/productos/:id/stock", admin.ajustarStock);

// ── Pedidos ────────────────────────────────────────────────
router.get("/pedidos", admin.pedidos);
router.patch("/pedidos/:numero/estado", admin.cambiarEstado);

// ── Notificaciones (las usa el panel y la tienda cuando entra un admin) ──
router.get("/notificaciones", notificaciones.listar);
router.post("/notificaciones/leidas", notificaciones.marcarLeidas);
router.get("/notificaciones/stream", notificaciones.stream);

module.exports = router;

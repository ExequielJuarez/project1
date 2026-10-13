// Botón de arrepentimiento (Res. 424/2020 SCI): guarda la solicitud, le da al
// cliente un código de identificación, avisa a los administradores y, si hay
// emails configurados, le manda la confirmación por email.
const crypto = require("crypto");
const db = require("../model/database/models");
const notificaciones = require("./notificacionService");
const correo = require("./correoService");

// Sin 0/O ni 1/I para que el código se pueda dictar sin confusiones
const LETRAS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const nuevoCodigo = () =>
  "ARR-" + Array.from(crypto.randomBytes(6), (b) => LETRAS[b % LETRAS.length]).join("");

function plano(a) {
  const x = a.get ? a.get({ plain: true }) : a;
  return { ...x, fecha: x.creado_en };
}

// datos: { nombre, email, telefono, numeroPedido, motivo } (ya validados)
async function crear(datos, usuarioId = null) {
  const email = datos.email.trim().toLowerCase();
  const numero = String(datos.numeroPedido).replace(/\D/g, "");

  // Si el número es de un pedido de ese email (o de esa cuenta), lo vinculamos
  const pedido = numero
    ? await db.Pedido.findByPk(Number(numero), { attributes: ["id", "email", "usuarioId"], raw: true })
    : null;
  const esSuyo = pedido && (pedido.email?.toLowerCase() === email || (usuarioId && pedido.usuarioId === usuarioId));

  let fila;
  for (let intento = 0; intento < 5 && !fila; intento++) {
    try {
      fila = await db.Arrepentimiento.create({
        codigo: nuevoCodigo(),
        usuarioId,
        pedidoId: esSuyo ? pedido.id : null,
        numeroPedido: numero || String(datos.numeroPedido).slice(0, 20),
        nombre: datos.nombre.trim(),
        email,
        telefono: datos.telefono?.trim() || null,
        motivo: datos.motivo?.trim() || null,
      });
    } catch (error) {
      if (error.name !== "SequelizeUniqueConstraintError") throw error; // código repetido: probamos otro
    }
  }
  const solicitud = plano(fila);

  // Aviso a los administradores (campanita del panel)
  try {
    await notificaciones.crear({
      tipo: "pedido",
      titulo: `Arrepentimiento ${solicitud.codigo}`,
      mensaje: `${solicitud.nombre} · pedido #${solicitud.numeroPedido}${esSuyo ? "" : " (no coincide con su email: revisar)"}`,
      url: "/admin/arrepentimientos",
      pedidoId: esSuyo ? pedido.id : null,
    });
  } catch (error) {
    console.error("No se pudo avisar el arrepentimiento:", error.message);
  }

  // Confirmación por email al cliente (si hay SMTP configurado)
  solicitud.emailEnviado = await correo.enviarTexto({
    email,
    asunto: `Recibimos tu solicitud de arrepentimiento · ${solicitud.codigo}`,
    texto:
      `Hola ${solicitud.nombre}:\n\n` +
      `Recibimos tu solicitud para cancelar la compra del pedido #${solicitud.numeroPedido}.\n` +
      `Tu código de identificación es: ${solicitud.codigo}\n\n` +
      "Te vamos a contactar para coordinar la devolución del producto y el reintegro del dinero. " +
      "La devolución no tiene costo para vos.",
  });
  return solicitud;
}

async function listar() {
  const filas = await db.Arrepentimiento.findAll({ order: [["estado", "ASC"], ["creado_en", "DESC"]] });
  return filas.map(plano);
}

async function pendientes() {
  return db.Arrepentimiento.count({ where: { estado: "recibida" } });
}

async function cambiarEstado(id, estado) {
  if (!["recibida", "resuelta"].includes(estado)) return null;
  const a = await db.Arrepentimiento.findByPk(id);
  if (!a) return null;
  await a.update({ estado, resueltaEn: estado === "resuelta" ? new Date() : null });
  return plano(a);
}

module.exports = { crear, listar, pendientes, cambiarEstado };

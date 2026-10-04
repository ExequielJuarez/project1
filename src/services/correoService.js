// Envío de emails (códigos de acceso) por SMTP con nodemailer.
// Se configura con SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS y MAIL_FROM
// (ver .env.example y ACCESO.md). Sin configurar:
//   - en tu computadora el código se muestra en la consola y en pantalla (modo demo)
//   - con NODE_ENV=production no se puede entrar con código
const nodemailer = require("nodemailer");

const configurado = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
const enProduccion = () => process.env.NODE_ENV === "production";

// "demo" (sin SMTP, solo en desarrollo), "smtp" o "desactivado"
function modo() {
  if (configurado()) return "smtp";
  return enProduccion() ? "desactivado" : "demo";
}

let transporte = null;
function obtenerTransporte() {
  if (!transporte) {
    const puerto = Number(process.env.SMTP_PORT) || 587;
    transporte = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: puerto,
      secure: puerto === 465, // 465 = SSL directo; 587 = STARTTLS
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: 15000,
    });
  }
  return transporte;
}

const TIENDA = () => "Santiago Mates";

const ASUNTOS = {
  login: "Tu código para entrar",
  registro: "Confirmá tu email",
  recuperar: "Tu código para recuperar la cuenta",
};

function plantilla(codigo, motivo, minutos) {
  const intro = {
    login: "Usá este código para entrar a tu cuenta:",
    registro: "Usá este código para confirmar tu email y terminar de crear tu cuenta:",
    recuperar: "Usá este código para entrar y elegir una contraseña nueva:",
  }[motivo];
  const texto = `${intro}\n\n${codigo}\n\nVence en ${minutos} minutos. Si no lo pediste, ignorá este email.\n\n${TIENDA()}`;
  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:460px;margin:0 auto;padding:32px 24px;color:#2b1810;background:#faf5ee">
    <p style="font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:#b0692b;margin:0 0 16px">${TIENDA()}</p>
    <p style="font-size:16px;line-height:1.5;margin:0 0 20px">${intro}</p>
    <p style="font-size:34px;font-weight:bold;letter-spacing:.3em;margin:0 0 20px;padding:16px;background:#fffdfa;border:1px solid #e8dccd;text-align:center">${codigo}</p>
    <p style="font-size:13px;color:#7d6455;line-height:1.5;margin:0">Vence en ${minutos} minutos. Si no lo pediste, ignorá este email: nadie puede entrar sin el código.</p>
  </div>`;
  return { texto, html };
}

// Devuelve { ok, demo } — en modo demo el código no se envía, se muestra
async function enviarCodigo({ email, codigo, motivo, minutos }) {
  const m = modo();
  if (m === "desactivado") return { ok: false };
  if (m === "demo") {
    console.log(`✉️  [modo demo] Código para ${email} (${motivo}): ${codigo}`);
    return { ok: true, demo: true };
  }
  const { texto, html } = plantilla(codigo, motivo, minutos);
  try {
    await obtenerTransporte().sendMail({
      from: process.env.MAIL_FROM || `"${TIENDA()}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `${ASUNTOS[motivo]} · ${codigo}`,
      text: texto,
      html,
    });
    return { ok: true, demo: false };
  } catch (error) {
    console.error("No se pudo enviar el email:", error.message);
    return { ok: false };
  }
}

module.exports = { modo, enviarCodigo };

// Usuarios (tabla usuarios). Las contraseñas se guardan hasheadas con bcrypt.

const bcrypt = require("bcryptjs");
const db = require("../model/database/models");

// Hash de relleno para comparar cuando el email no existe
const HASH_FALSO = bcrypt.hashSync("no-es-una-clave-real", 10);

// Lo que se guarda en la sesión: nunca la contraseña
function publico(usuario) {
  if (!usuario) return null;
  const { id, nombre, apellido, email, telefono, rol, googleId } = usuario.get ? usuario.get({ plain: true }) : usuario;
  return { id, nombre, apellido, email, telefono: telefono || "", rol, googleId };
}

async function buscarPorId(id) {
  return publico(await db.Usuario.findByPk(id));
}

async function buscarPorEmail(email) {
  return publico(await db.Usuario.findOne({ where: { email: String(email).trim().toLowerCase() } }));
}

// Devuelve el usuario si las credenciales son correctas
async function verificar(email, password) {
  const usuario = await db.Usuario.scope("conPassword").findOne({
    where: { email: String(email).trim().toLowerCase() },
  });
  // Si el email no existe (o la cuenta es solo de Google) igual comparamos
  // contra un hash, para no delatar por el tiempo de respuesta qué emails existen
  const ok = await bcrypt.compare(String(password), usuario?.password || HASH_FALSO);
  if (!usuario || !usuario.password || !ok) return null;
  return publico(usuario);
}

async function crear({ nombre, apellido, email, telefono = null, password = null, googleId = null, newsletter = false }) {
  const usuario = await db.Usuario.create({
    nombre,
    apellido: apellido || "",
    email,
    telefono: telefono || null,
    password: password ? await bcrypt.hash(password, 10) : null,
    googleId,
    newsletter,
  });
  return publico(usuario);
}

// Busca la cuenta vinculada a Google; si no existe, la vincula por email o la crea
async function desdeGoogle({ googleId, email, nombre, apellido }) {
  let usuario = await db.Usuario.findOne({ where: { googleId } });
  if (!usuario) usuario = await db.Usuario.findOne({ where: { email: String(email).toLowerCase() } });
  if (usuario) {
    if (!usuario.googleId) await usuario.update({ googleId });
    return publico(usuario);
  }
  return crear({ nombre, apellido, email, googleId });
}

module.exports = { publico, buscarPorId, buscarPorEmail, verificar, crear, desdeGoogle };

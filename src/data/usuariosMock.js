// Usuarios de ejemplo para la maqueta, guardados en memoria
// (se reinician al reiniciar el servidor).
// Reemplazar por el modelo de Sequelize cuando esté la base de datos.
// Las contraseñas se guardan siempre hasheadas con bcrypt.

const bcrypt = require("bcryptjs");

const usuarios = [
  {
    id: 1,
    nombre: "Cliente",
    apellido: "Demo",
    email: "demo@tienda.com",
    telefono: "11 5555 4444",
    rol: "cliente",
    password: bcrypt.hashSync("Demo1234", 10),
    googleId: null,
    favoritos: [],
    creado: new Date(),
  },
  {
    id: 2,
    nombre: "Admin",
    apellido: "Tienda",
    email: "admin@tienda.com",
    telefono: "",
    rol: "admin",
    password: bcrypt.hashSync("Admin1234", 10),
    googleId: null,
    favoritos: [],
    creado: new Date(),
  },
];

// Hash de relleno para comparar cuando el email no existe
const HASH_FALSO = bcrypt.hashSync("no-es-una-clave-real", 10);

// Lo que se guarda en la sesión: nunca la contraseña
function publico(usuario) {
  if (!usuario) return null;
  const { password, favoritos, ...datos } = usuario;
  return datos;
}

function buscarPorId(id) {
  return usuarios.find((u) => u.id === Number(id)) || null;
}

function buscarPorEmail(email) {
  return usuarios.find((u) => u.email === String(email).toLowerCase()) || null;
}

// Devuelve el usuario sin la contraseña si las credenciales son correctas
async function verificar(email, password) {
  const usuario = buscarPorEmail(email);
  // Si el email no existe (o la cuenta es solo de Google) igual comparamos
  // contra un hash, para no delatar por el tiempo de respuesta qué emails existen
  const hash = usuario?.password || HASH_FALSO;
  const ok = await bcrypt.compare(String(password), hash);
  if (!usuario || !usuario.password || !ok) return null;
  return publico(usuario);
}

async function crear({ nombre, apellido, email, telefono = "", password = null, googleId = null }) {
  const usuario = {
    id: Math.max(0, ...usuarios.map((u) => u.id)) + 1,
    nombre,
    apellido,
    email: String(email).toLowerCase(),
    telefono,
    rol: "cliente",
    password: password ? await bcrypt.hash(password, 10) : null,
    googleId,
    favoritos: [],
    creado: new Date(),
  };
  usuarios.push(usuario);
  return publico(usuario);
}

// Busca la cuenta vinculada a Google; si no existe, la vincula por email o la crea
async function desdeGoogle({ googleId, email, nombre, apellido }) {
  let usuario = usuarios.find((u) => u.googleId === googleId) || buscarPorEmail(email);
  if (usuario) {
    usuario.googleId = googleId;
    return publico(usuario);
  }
  return crear({ nombre, apellido, email, googleId });
}

module.exports = { usuarios, publico, buscarPorId, buscarPorEmail, verificar, crear, desdeGoogle };
